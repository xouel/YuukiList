'use client';

/**
 * YuukiList — Visualização Principal da Biblioteca Pessoal
 * Conforme Requisitos: Personal Library View and Layout Toggle, Quick Progress Tracking e Library Filtering
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  LibraryItemDto,
  Category,
  UpdateLibraryItemDto,
  LibrarySortBy,
} from '../../../../../packages/shared/src/index.ts';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import {
  type LibraryLayoutMode,
  type StatusTabKey,
  loadSavedLayout,
  saveLayoutPreference,
  calculateNextProgress,
  computeOptimisticItemUpdate,
} from './library-helpers.ts';
import { LibraryFilters } from './library-filters.tsx';
import { LibraryCard } from './library-card.tsx';
import { LibraryRow } from './library-row.tsx';
import { EditItemModal } from './edit-item-modal.tsx';
import { LibrarySkeleton } from './library-skeleton.tsx';
import { ErrorState, NoResultsState } from '../catalog/async-feedback.tsx';

const SORT_STORAGE_KEY = 'yuuki:library:sort';
const libraryApi = new LibraryApiClient();

export function LibraryView() {
  const [items, setItems] = useState<LibraryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<LibraryLayoutMode>('grid');
  const [selectedTab, setSelectedTab] = useState<StatusTabKey>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('updatedAt');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<LibraryItemDto | null>(null);
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega layout e ordenação salvos no localStorage após montagem
  useEffect(() => {
    setLayout(loadSavedLayout());
    try {
      const savedSort = localStorage.getItem(SORT_STORAGE_KEY) as LibrarySortBy | null;
      if (savedSort) {
        setSortBy(savedSort);
      }
    } catch {
      // Ignora erro em ambientes sem localStorage
    }
  }, []);

  const handleLayoutChange = (newLayout: LibraryLayoutMode) => {
    setLayout(newLayout);
    saveLayoutPreference(newLayout);
  };

  const handleSortChange = (newSort: LibrarySortBy) => {
    setSortBy(newSort);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, newSort);
    } catch {
      // Ignora erro em ambientes sem localStorage
    }
  };

  // Carrega itens da biblioteca
  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryApi.list({ limit: 100 });
      setItems(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar sua biblioteca pessoal.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Toast temporário
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Alternância de Favorito com atualização otimista (TR-004)
  const handleToggleFavorite = async (item: LibraryItemDto) => {
    const nextFavorite = !item.isFavorite;
    const previousItems = items;

    // Atualização otimista imediata
    setItems((prev) =>
      prev.map((it) =>
        it.mediaItemId === item.mediaItemId ? { ...it, isFavorite: nextFavorite } : it
      )
    );

    try {
      const updated = await libraryApi.updateItem(item.mediaItemId, { isFavorite: nextFavorite });
      setItems((prev) =>
        prev.map((it) => (it.mediaItemId === item.mediaItemId ? updated : it))
      );
    } catch (err: any) {
      setItems(previousItems);
      showToast(`Falha ao alterar favorito de ${item.mediaItem?.title || 'obra'}.`);
    }
  };

  // Incremento rápido "+1" com atualização otimista
  const handleQuickIncrement = async (item: LibraryItemDto) => {
    const category = item.mediaItem?.category;
    const nextProg = calculateNextProgress(item.progress, undefined, category);
    if (nextProg === null) return;

    // Guarda estado anterior para rollback
    const previousItems = items;
    const optimisticItem = computeOptimisticItemUpdate(item, nextProg, undefined);

    // Atualização otimista imediata na interface
    setItems((prev) =>
      prev.map((it) => (it.mediaItemId === item.mediaItemId ? optimisticItem : it))
    );
    setMutatingIds((prev) => new Set(prev).add(item.mediaItemId));

    try {
      const updated = await libraryApi.updateItem(item.mediaItemId, { progress: nextProg });
      setItems((prev) =>
        prev.map((it) => (it.mediaItemId === item.mediaItemId ? updated : it))
      );
    } catch (err: any) {
      // Reversão em caso de falha de rede
      setItems(previousItems);
      showToast(`Falha ao avançar unidade para ${item.mediaItem?.title || 'obra'}.`);
    } finally {
      setMutatingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.mediaItemId);
        return next;
      });
    }
  };

  // Salvar alterações vindas do modal
  const handleSaveModal = async (mediaItemId: string, update: UpdateLibraryItemDto) => {
    const updated = await libraryApi.updateItem(mediaItemId, update);
    setItems((prev) =>
      prev.map((it) => (it.mediaItemId === mediaItemId ? updated : it))
    );
    showToast('Alterações salvas com sucesso.');
  };

  // Remover item vindo do modal
  const handleRemoveModal = async (mediaItemId: string) => {
    await libraryApi.removeItem(mediaItemId);
    setItems((prev) => prev.filter((it) => it.mediaItemId !== mediaItemId));
    showToast('Obra removida da sua biblioteca.');
  };

  // Filtragem e Ordenação local inteligente (TR-003)
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Filtro de Favoritos
      if (isFavoriteOnly && !item.isFavorite) {
        return false;
      }

      // Filtro de Categoria
      if (selectedCategory !== 'ALL' && item.mediaItem?.category !== selectedCategory) {
        return false;
      }

      // Filtro de Aba Inteligente
      if (selectedTab === 'ALL') return true;

      const s = item.status;
      switch (selectedTab) {
        case 'WATCHING_READING':
          return s === 'ASSISTINDO' || s === 'LENDO';
        case 'PLAN_TO':
          return s === 'QUERO_ASSISTIR' || s === 'QUERO_LER';
        case 'COMPLETED':
          return s === 'CONCLUIDO' || s === 'ASSISTIDO';
        case 'PAUSED':
          return s === 'PAUSADO';
        case 'DROPPED':
          return s === 'DROPADO';
        default:
          return true;
      }
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title': {
          const titleA = (a.mediaItem?.title || '').toLowerCase();
          const titleB = (b.mediaItem?.title || '').toLowerCase();
          return titleA.localeCompare(titleB, 'pt-BR');
        }
        case 'rating': {
          const rA = a.rating ?? -1;
          const rB = b.rating ?? -1;
          return rB - rA;
        }
        case 'progress': {
          return (b.progress || 0) - (a.progress || 0);
        }
        case 'releaseYear': {
          const yA = a.mediaItem?.releaseYear ?? 0;
          const yB = b.mediaItem?.releaseYear ?? 0;
          return yB - yA;
        }
        case 'createdAt': {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case 'updatedAt':
        default: {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      }
    });
  }, [items, selectedTab, selectedCategory, isFavoriteOnly, sortBy]);

  // Contagens por aba inteligente
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
      const s = item.status;
      if (s === 'ASSISTINDO' || s === 'LENDO') counts.WATCHING_READING++;
      else if (s === 'QUERO_ASSISTIR' || s === 'QUERO_LER') counts.PLAN_TO++;
      else if (s === 'CONCLUIDO' || s === 'ASSISTIDO') counts.COMPLETED++;
      else if (s === 'PAUSADO') counts.PAUSED++;
      else if (s === 'DROPADO') counts.DROPPED++;
    }

    return counts;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Toast Notificação */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#181C2B] border border-[#06B6D4]/40 text-[#F3F4F6] text-sm shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho da Biblioteca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#262C3F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
            Minha Biblioteca
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Acompanhe seu progresso de exibição e leitura de doramas, animes e mangás.
          </p>
        </div>
      </div>

      {/* Filtros e Alternador de Layout */}
      <LibraryFilters
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        countsByTab={countsByTab}
        sortBy={sortBy}
        onSortByChange={handleSortChange}
        isFavoriteOnly={isFavoriteOnly}
        onToggleFavoriteOnly={() => setIsFavoriteOnly((prev) => !prev)}
      />

      {/* Estados Assíncronos */}
      {isLoading ? (
        <LibrarySkeleton layout={layout} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLibrary} />
      ) : items.length === 0 ? (
        /* Estado Vazio Convidativo */
        <div className="py-16 px-4 text-center border border-dashed border-[#262C3F] rounded-2xl bg-[#121520]/50 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-[#181C2B] border border-[#262C3F] flex items-center justify-center mx-auto mb-4 text-[#06B6D4]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#F3F4F6]">Sua biblioteca ainda está vazia</h2>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-sm mx-auto">
            Explore nosso catálogo completo com doramas, filmes, animes e mangás e adicione suas primeiras obras para começar a acompanhar!
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0B0D13] bg-[#06B6D4] hover:bg-[#22D3EE] rounded-xl transition-all shadow-lg shadow-[#06B6D4]/20 focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
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
          }}
        />
      ) : layout === 'grid' ? (
        /* Visualização em Grade */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onQuickIncrement={handleQuickIncrement}
              onToggleFavorite={handleToggleFavorite}
              onOpenEdit={setEditingItem}
              isMutating={mutatingIds.has(item.mediaItemId)}
            />
          ))}
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

