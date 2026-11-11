'use client';

/**
 * YuukiList — Visualização Principal da Biblioteca Pessoal (Ledger v2.4)
 * Conforme Requisitos: Personal Library View and Layout Toggle, Quick Progress Tracking,
 * Library Filtering and Asynchronous States e Consumption Cadence (R24)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  LibraryItemDto,
  Category,
  UpdateLibraryItemDto,
  LibrarySortBy,
  HistoryEventDto,
} from '../../../../../packages/shared/src/index.ts';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { DiaryApiClient } from '../../services/diary-api.client.ts';
import {
  type LibraryLayoutMode,
  type StatusTabKey,
  loadSavedLayout,
  saveLayoutPreference,
  calculateNextProgress,
  computeOptimisticItemUpdate,
} from './library-helpers.ts';
import {
  calculateLedgerKpis,
  calculateCadenceMetrics,
  filterLibraryLocal,
  generateLibraryCsv,
  triggerFileDownload,
} from './ledger-helpers.ts';
import { LedgerHeader } from './ledger-header.tsx';
import { LibraryFilters } from './library-filters.tsx';
import { LibraryCard } from './library-card.tsx';
import { LibraryRow } from './library-row.tsx';
import { DashedRegisterCard } from './dashed-register-card.tsx';
import { ConsumptionCadenceBanner } from './consumption-cadence-banner.tsx';
import { EditItemModal } from './edit-item-modal.tsx';
import { LibrarySkeleton } from './library-skeleton.tsx';
import { TimelineView } from '../diary/timeline-view.tsx';
import { CreateNoteModal } from '../diary/create-note-modal.tsx';
import { ErrorState, NoResultsState } from '../catalog/async-feedback.tsx';

const SORT_STORAGE_KEY = 'yuuki:library:sort';
const libraryApi = new LibraryApiClient();
const diaryApi = new DiaryApiClient();

export function LibraryView() {
  const [items, setItems] = useState<LibraryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<LibraryLayoutMode>('grid');
  const [selectedTab, setSelectedTab] = useState<StatusTabKey>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('updatedAt');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingItem, setEditingItem] = useState<LibraryItemDto | null>(null);
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados do Diário Pessoal e Linha do Tempo
  const [viewMode, setViewMode] = useState<'COLLECTION' | 'DIARY'>('COLLECTION');
  const [diaryEvents, setDiaryEvents] = useState<HistoryEventDto[]>([]);
  const [isLoadingDiary, setIsLoadingDiary] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [selectedMediaForNote, setSelectedMediaForNote] = useState<{ id: string; title: string; category?: Category } | null>(null);

  // Carrega eventos do diário
  const fetchDiary = useCallback(async () => {
    setIsLoadingDiary(true);
    try {
      const response = await diaryApi.list();
      setDiaryEvents(response || []);
    } catch {
      // Ignora erro em falha inicial do diário
    } finally {
      setIsLoadingDiary(false);
    }
  }, []);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const handleDeleteDiaryEvent = async (id: string) => {
    try {
      await diaryApi.deleteEvent(id);
      setDiaryEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Registro do histórico removido com sucesso.');
    } catch {
      showToast('Falha ao excluir registro do histórico.');
    }
  };

  const handleCreateDiaryNote = async (data: any) => {
    try {
      const created = await diaryApi.createEvent({
        ...data,
        type: 'NOTE',
      });
      setDiaryEvents((prev) => [created, ...prev]);
      showToast('Anotação salva com sucesso no seu diário!');
    } catch {
      showToast('Falha ao salvar anotação.');
    }
  };

  // Inicializa preferência de layout salva no cliente
  useEffect(() => {
    setLayout(loadSavedLayout());
    if (typeof window !== 'undefined') {
      const savedSort = window.localStorage.getItem(SORT_STORAGE_KEY) as LibrarySortBy | null;
      if (savedSort) {
        setSortBy(savedSort);
      }
    }
  }, []);

  // Busca lista de itens da biblioteca
  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryApi.listItems();
      const rawList = response.items || response.data || [];
      setItems(rawList);
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          const returnTo = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=${returnTo}`;
        }
        return;
      }
      setError(err?.message || 'Falha ao carregar sua biblioteca pessoal.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  };

  const handleLayoutChange = (newLayout: LibraryLayoutMode) => {
    setLayout(newLayout);
    saveLayoutPreference(newLayout);
  };

  const handleSortChange = (newSort: LibrarySortBy) => {
    setSortBy(newSort);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SORT_STORAGE_KEY, newSort);
      } catch {
        // Ignora erro de storage restrito
      }
    }
  };

  // KPIs analíticos calculados do Ledger
  const ledgerKpis = useMemo(() => {
    return calculateLedgerKpis(items);
  }, [items]);

  // Cadência dos últimos 30 dias calculada para o banner
  const cadenceData = useMemo(() => {
    return calculateCadenceMetrics(items, diaryEvents);
  }, [items, diaryEvents]);

  // Contagem cumulativa por aba de status
  const countsByTab = useMemo(() => {
    const counts: Record<StatusTabKey, number> = {
      ALL: items.length,
      WATCHING_READING: 0,
      PLAN_TO: 0,
      COMPLETED: 0,
      PAUSED: 0,
      DROPPED: 0,
    };

    for (const item of items) {
      switch (item.status) {
        case 'ASSISTINDO':
        case 'LENDO':
          counts.WATCHING_READING++;
          break;
        case 'QUERO_ASSISTIR':
        case 'QUERO_LER':
          counts.PLAN_TO++;
          break;
        case 'CONCLUIDO':
        case 'ASSISTIDO':
          counts.COMPLETED++;
          break;
        case 'PAUSADO':
          counts.PAUSED++;
          break;
        case 'DROPADO':
          counts.DROPPED++;
          break;
      }
    }

    return counts;
  }, [items]);

  // Contagem cumulativa por categoria
  const countsByCategory = useMemo(() => {
    const counts: Record<Category | 'ALL', number> = {
      ALL: items.length,
      ANIME: 0,
      DORAMA: 0,
      FILME: 0,
      MANGA: 0,
      MANHWA: 0,
      MANHUA: 0,
    };

    for (const item of items) {
      const cat = item.mediaItem?.category;
      if (cat && cat in counts) {
        counts[cat as Category]++;
      }
    }

    return counts;
  }, [items]);

  // Itens filtrados por aba, categoria, favoritos, busca textual e ordenação
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filtro por Aba de Status
    if (selectedTab !== 'ALL') {
      result = result.filter((item) => {
        switch (selectedTab) {
          case 'WATCHING_READING':
            return item.status === 'ASSISTINDO' || item.status === 'LENDO';
          case 'PLAN_TO':
            return item.status === 'QUERO_ASSISTIR' || item.status === 'QUERO_LER';
          case 'COMPLETED':
            return item.status === 'CONCLUIDO' || item.status === 'ASSISTIDO';
          case 'PAUSED':
            return item.status === 'PAUSADO';
          case 'DROPPED':
            return item.status === 'DROPADO';
          default:
            return true;
        }
      });
    }

    // Filtro por Categoria
    if (selectedCategory !== 'ALL') {
      result = result.filter((item) => item.mediaItem?.category === selectedCategory);
    }

    // Filtro por Favoritos
    if (isFavoriteOnly) {
      result = result.filter((item) => item.isFavorite);
    }

    // Busca Textual Local em tempo real
    if (searchQuery.trim()) {
      result = filterLibraryLocal(result, searchQuery);
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title': {
          const titleA = a.mediaItem?.title || '';
          const titleB = b.mediaItem?.title || '';
          return titleA.localeCompare(titleB, 'pt-BR', { sensitivity: 'base' });
        }
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'releaseYear': {
          const yearA = a.mediaItem?.releaseYear || 0;
          const yearB = b.mediaItem?.releaseYear || 0;
          return yearB - yearA;
        }
        case 'createdAt': {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        }
        case 'updatedAt':
        default: {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateB - dateA;
        }
      }
    });

    return result;
  }, [items, selectedTab, selectedCategory, isFavoriteOnly, searchQuery, sortBy]);

  // Incremento rápido (+1) com atualização otimista
  const handleQuickIncrement = async (item: LibraryItemDto) => {
    const category = item.mediaItem?.category;
    const totalUnits =
      category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
        ? (item.mediaItem as any)?.totalChapters || (item.mediaItem as any)?.totalUnits
        : (item.mediaItem as any)?.totalEpisodes || (item.mediaItem as any)?.totalUnits;

    const nextProgress = calculateNextProgress(item.progress, totalUnits, category);
    if (nextProgress === null) return;

    const optimisticItem = computeOptimisticItemUpdate(item, nextProgress, totalUnits);
    setItems((prev) =>
      prev.map((i) => (i.mediaItemId === item.mediaItemId ? optimisticItem : i))
    );

    setMutatingIds((prev) => new Set(prev).add(item.mediaItemId));

    try {
      const updated = await libraryApi.updateItem(item.mediaItemId, {
        progress: nextProgress,
      });

      setItems((prev) =>
        prev.map((i) => (i.mediaItemId === item.mediaItemId ? { ...i, ...updated } : i))
      );

      const unitName =
        category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
          ? 'Capítulo'
          : 'Episódio';
      showToast(`${unitName} ${nextProgress} registrado!`);
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) => (i.mediaItemId === item.mediaItemId ? item : i))
      );
      showToast(err?.message || 'Falha ao atualizar progresso. Alteração desfeita.');
    } finally {
      setMutatingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.mediaItemId);
        return next;
      });
    }
  };

  // Avaliação rápida inline (1 a 10 estrelas)
  const handleRatingChange = async (item: LibraryItemDto, newRating: number) => {
    const previousRating = item.rating;
    setItems((prev) =>
      prev.map((i) => (i.mediaItemId === item.mediaItemId ? { ...i, rating: newRating } : i))
    );

    try {
      await libraryApi.updateItem(item.mediaItemId, { rating: newRating });
      showToast(`Nota ${newRating.toFixed(1)} atribuída a "${item.mediaItem?.title}"!`);
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.mediaItemId === item.mediaItemId ? { ...i, rating: previousRating } : i))
      );
      showToast('Falha ao atualizar avaliação. Alteração desfeita.');
    }
  };

  // Alternância rápida de favorito
  const handleToggleFavorite = async (item: LibraryItemDto) => {
    const nextFavorite = !item.isFavorite;

    setItems((prev) =>
      prev.map((i) =>
        i.mediaItemId === item.mediaItemId ? { ...i, isFavorite: nextFavorite } : i
      )
    );

    try {
      await libraryApi.updateItem(item.mediaItemId, {
        isFavorite: nextFavorite,
      });
      showToast(
        nextFavorite
          ? `"${item.mediaItem?.title}" adicionado aos favoritos!`
          : `"${item.mediaItem?.title}" removido dos favoritos.`
      );
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.mediaItemId === item.mediaItemId ? { ...i, isFavorite: item.isFavorite } : i
        )
      );
      showToast('Falha ao atualizar favorito. Alteração desfeita.');
    }
  };

  // Exportação CSV do Acervo
  const handleExportCsv = () => {
    if (items.length === 0) {
      showToast('Não há itens na biblioteca para exportar.');
      return;
    }
    const csvContent = generateLibraryCsv(items);
    triggerFileDownload(csvContent, 'yuukilist-minha-biblioteca.csv');
    showToast('Download do arquivo CSV iniciado.');
  };

  // Salvar no Modal de Edição
  const handleSaveModal = async (mediaItemId: string, dto: UpdateLibraryItemDto) => {
    try {
      const updated = await libraryApi.updateItem(mediaItemId, dto);
      setItems((prev) =>
        prev.map((i) => (i.mediaItemId === mediaItemId ? { ...i, ...updated } : i))
      );
      setEditingItem(null);
      showToast('Item atualizado com sucesso!');
    } catch (err: any) {
      showToast(err?.message || 'Falha ao salvar alterações.');
      throw err;
    }
  };

  // Remover no Modal de Edição
  const handleRemoveModal = async (mediaItemId: string) => {
    try {
      await libraryApi.removeItem(mediaItemId);
      setItems((prev) => prev.filter((i) => i.mediaItemId !== mediaItemId));
      setEditingItem(null);
      showToast('Obra removida da sua biblioteca.');
    } catch (err: any) {
      showToast(err?.message || 'Falha ao remover item da biblioteca.');
      throw err;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notifier */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1A1820] border border-[#E05347]/40 text-[#F4EFEA] text-sm shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="w-2 h-2 rounded-full bg-[#E05347]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#9C96A2] hover:text-[#F4EFEA] ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho do Ledger com 3 KPIs e Ação Adicionar */}
      <LedgerHeader metrics={ledgerKpis} />

      {/* Alternador de Visão Principal: Acervo vs Histórico & Diário */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1A1820] border border-[#2B2735]">
          <button
            type="button"
            onClick={() => setViewMode('COLLECTION')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'COLLECTION'
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-white/5'
            }`}
          >
            Acervo
          </button>
          <button
            type="button"
            onClick={() => setViewMode('DIARY')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'DIARY'
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-white/5'
            }`}
          >
            <span>Histórico & Diário</span>
            {diaryEvents.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  viewMode === 'DIARY' ? 'bg-black/30 text-white' : 'bg-[#2B2735] text-[#9C96A2]'
                }`}
              >
                {diaryEvents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'DIARY' ? (
        /* Seção do Diário e Linha do Tempo */
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#F4EFEA]">Linha do Tempo Pessoal</h2>
              <p className="text-xs text-[#9C96A2] font-light">
                Registro cronológico independente das suas ações, reflexões e memórias de consumo.
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMediaForNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E05347] text-white hover:bg-[#c94539] transition-all shadow-md shadow-[#E05347]/20"
              >
                <span>+</span>
                <span>Nova Anotação</span>
              </button>
            )}
          </div>

          <TimelineView
            events={diaryEvents}
            isLoading={isLoadingDiary}
            onDeleteEvent={handleDeleteDiaryEvent}
            onAddNoteClick={() => {
              setSelectedMediaForNote(null);
              setIsNoteModalOpen(true);
            }}
          />
        </div>
      ) : (
        /* Seção do Acervo da Biblioteca */
        <>
          {/* Filtros, Busca Local e Alternador de Layout */}
          <LibraryFilters
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            countsByTab={countsByTab}
            countsByCategory={countsByCategory}
            sortBy={sortBy}
            onSortByChange={handleSortChange}
            isFavoriteOnly={isFavoriteOnly}
            onToggleFavoriteOnly={() => setIsFavoriteOnly((prev) => !prev)}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {/* Estados Assíncronos */}
          {isLoading ? (
            <LibrarySkeleton layout={layout} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLibrary} />
          ) : items.length === 0 ? (
            /* Estado Vazio Convidativo no Padrão Asian Editorial */
            <div className="py-16 px-4 text-center max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#1A1820] border border-[#2B2735] flex items-center justify-center mx-auto mb-4 text-[#E05347]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-normal text-[#F4EFEA]">Sua biblioteca ainda está vazia</h2>
              <p className="text-sm text-[#9C96A2] mt-2 max-w-sm mx-auto font-light">
                Explore nosso catálogo completo com doramas, filmes, animes e mangás e adicione suas primeiras obras para começar a acompanhar!
              </p>
              <div className="mt-6">
                <a
                  href="/explore"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E05347] hover:bg-[#c94539] rounded-xl transition-all shadow-md shadow-[#E05347]/20 focus-visible:ring-2 focus-visible:ring-[#E05347]"
                >
                  Explorar Catálogo
                </a>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Filtros sem resultados */
            <NoResultsState
              onClearFilters={() => {
                setSelectedTab('ALL');
                setSelectedCategory('ALL');
                setIsFavoriteOnly(false);
                setSearchQuery('');
              }}
            />
          ) : layout === 'grid' ? (
            /* Visualização em Grade com Card Pontilhado de Registro */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onQuickIncrement={handleQuickIncrement}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenEdit={setEditingItem}
                  onRatingChange={handleRatingChange}
                  onOpenNote={(target) => {
                    setSelectedMediaForNote({
                      id: target.mediaItemId,
                      title: target.mediaItem?.title || '',
                      category: target.mediaItem?.category,
                    });
                    setIsNoteModalOpen(true);
                  }}
                  isMutating={mutatingIds.has(item.mediaItemId)}
                />
              ))}

              {/* Card Pontilhado: Registrar Nova Obra */}
              <DashedRegisterCard />
            </div>
          ) : (
            /* Visualização em Lista */
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <LibraryRow
                  key={item.id}
                  item={item}
                  onQuickIncrement={handleQuickIncrement}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenEdit={setEditingItem}
                  isMutating={mutatingIds.has(item.mediaItemId)}
                />
              ))}
            </div>
          )}

          {/* Banner de Cadência de Consumo */}
          {!isLoading && !error && items.length > 0 && (
            <ConsumptionCadenceBanner
              data={cadenceData}
              onExportCsv={handleExportCsv}
            />
          )}
        </>
      )}

      {/* Modal de Anotação do Diário */}
      <CreateNoteModal
        isOpen={isNoteModalOpen}
        mediaItemId={selectedMediaForNote?.id || (items[0]?.mediaItemId || '')}
        mediaTitle={selectedMediaForNote?.title || items[0]?.mediaItem?.title}
        category={selectedMediaForNote?.category || items[0]?.mediaItem?.category}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateDiaryNote}
      />

      {/* Modal de Edição Detalhada */}
      <EditItemModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveModal}
        onRemove={handleRemoveModal}
      />
    </div>
  );
}
