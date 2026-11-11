'use client';

/**
 * YuukiList — Dossiê Detalhado da Obra e Console de Acompanhamento
 * Arquitetura em Grade Assimétrica 8+4 na Paleta Mineral Asian Editorial
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  type MediaItemDetailDto,
  type PersonalStatus,
  type LibraryItemDto,
  type UpdateLibraryItemDto,
  type HistoryEventDto,
  type ItemRelationsResponseDto,
  CATEGORY_ALLOWED_STATUSES,
} from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { DiaryApiClient } from '../../services/diary-api.client.ts';
import { RelationsApiClient } from '../../services/relations-api.client.ts';
import { EditItemModal } from '../library/edit-item-modal.tsx';
import { TimelineView } from '../diary/timeline-view.tsx';
import { CreateNoteModal } from '../diary/create-note-modal.tsx';
import { RelatedWorksSection } from '../relations/related-works-section.tsx';
import { calculateNextProgress, computeOptimisticItemUpdate } from '../library/library-helpers.ts';
import { DossierMetricsStrip } from './dossier-metrics-strip.tsx';
import { PersonalTrackingConsole } from './personal-tracking-console.tsx';
import { EpisodeManager } from './episode-manager.tsx';
import { DossierSidebar } from './dossier-sidebar.tsx';

interface ItemDetailViewProps {
  item: MediaItemDetailDto;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  DORAMA: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  FILME: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  ANIME: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
  MANGA: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
  MANHWA: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
  MANHUA: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
};

const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  HIATO: 'Hiato',
  DESCONHECIDA: 'Desconhecida',
};

const libraryApi = new LibraryApiClient();
const diaryApi = new DiaryApiClient();
const relationsApi = new RelationsApiClient();

export function ItemDetailView({ item, onBack }: ItemDetailViewProps) {
  const { isAuthenticated } = useAuth();

  const [libraryItem, setLibraryItem] = useState<LibraryItemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Estados do Diário Pessoal & Histórico
  const [diaryEvents, setDiaryEvents] = useState<HistoryEventDto[]>([]);
  const [isLoadingDiary, setIsLoadingDiary] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);

  // Estados de Relacionamentos e Franquia
  const [relationsData, setRelationsData] = useState<ItemRelationsResponseDto | null>(null);

  const categoryClass = CATEGORY_COLORS[item.category] || 'bg-[#201D28] text-[#9E98A8] border-[#2B2735]';
  const pubStatusLabel = PUBLICATION_STATUS_LABELS[item.publicationStatus] || item.publicationStatus;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Checa se o item já está na biblioteca do usuário logado
  const checkLibraryStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setLibraryItem(null);
      return;
    }

    try {
      const data = await libraryApi.getItem(item.id);
      setLibraryItem(data);
    } catch {
      setLibraryItem(null);
    }
  }, [isAuthenticated, item.id]);

  useEffect(() => {
    checkLibraryStatus();
  }, [checkLibraryStatus]);

  // Carrega eventos e anotações do diário específicos para esta obra
  const fetchDiaryEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setDiaryEvents([]);
      return;
    }
    setIsLoadingDiary(true);
    try {
      const res = await diaryApi.list({ mediaItemId: item.id });
      setDiaryEvents(res.data || []);
    } catch {
      setDiaryEvents([]);
    } finally {
      setIsLoadingDiary(false);
    }
  }, [isAuthenticated, item.id]);

  useEffect(() => {
    fetchDiaryEvents();
  }, [fetchDiaryEvents]);

  // Carrega relacionamentos e universo da franquia para esta obra
  const fetchRelations = useCallback(async () => {
    try {
      const data = await relationsApi.getItemRelations(item.slug || item.id);
      setRelationsData(data);
    } catch {
      setRelationsData(null);
    }
  }, [item.id, item.slug]);

  useEffect(() => {
    fetchRelations();
  }, [fetchRelations]);

  // Atualização ou adição de status da biblioteca
  const handleStatusChange = async (status: PersonalStatus) => {
    if (!isAuthenticated) return;
    try {
      if (libraryItem) {
        const updated = await libraryApi.updateItem(item.id, { status });
        setLibraryItem(updated);
        showFeedback('Status pessoal atualizado com sucesso.');
      } else {
        const created = await libraryApi.addItem({
          mediaItemId: item.id,
          status,
          progress: 0,
        });
        setLibraryItem(created);
        showFeedback('Obra adicionada à sua biblioteca.');
      }
      fetchDiaryEvents();
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao atualizar status.');
    }
  };

  // Atualização de nota pessoal (1-10)
  const handleRatingChange = async (rating: number) => {
    if (!isAuthenticated) return;
    try {
      if (libraryItem) {
        const updated = await libraryApi.updateItem(item.id, { rating });
        setLibraryItem(updated);
      } else {
        const allowed = CATEGORY_ALLOWED_STATUSES[item.category] || ['ASSISTINDO'];
        const created = await libraryApi.addItem({
          mediaItemId: item.id,
          status: allowed[0],
          progress: 0,
          rating,
        });
        setLibraryItem(created);
      }
      showFeedback('Sua nota foi registrada com sucesso.');
      fetchDiaryEvents();
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar nota.');
    }
  };

  // Incremento rápido (+1) na barra de ferramentas
  const handleQuickIncrement = async () => {
    if (!libraryItem) {
      const allowed = CATEGORY_ALLOWED_STATUSES[item.category] || ['ASSISTINDO'];
      try {
        const created = await libraryApi.addItem({
          mediaItemId: item.id,
          status: allowed[0],
          progress: 1,
        });
        setLibraryItem(created);
        showFeedback('Obra adicionada e progresso iniciado (+1)!');
        fetchDiaryEvents();
      } catch (err: any) {
        showFeedback(err?.message || 'Falha ao iniciar progresso.');
      }
      return;
    }

    const nextProg = calculateNextProgress(libraryItem.progress, undefined, item.category);
    if (nextProg === null) return;

    const prev = libraryItem;
    const optimistic = computeOptimisticItemUpdate(libraryItem, nextProg, undefined);
    setLibraryItem(optimistic);

    try {
      const updated = await libraryApi.updateItem(item.id, { progress: nextProg });
      setLibraryItem(updated);
      fetchDiaryEvents();
    } catch {
      setLibraryItem(prev);
      showFeedback('Falha ao atualizar progresso.');
    }
  };

  // Alternância de episódio individual no gerenciador
  const handleMarkEpisode = async (episodeNumber: number) => {
    if (!isAuthenticated) return;
    const prev = libraryItem;
    try {
      if (libraryItem) {
        const updated = await libraryApi.updateItem(item.id, { progress: episodeNumber });
        setLibraryItem(updated);
      } else {
        const allowed = CATEGORY_ALLOWED_STATUSES[item.category] || ['ASSISTINDO'];
        const created = await libraryApi.addItem({
          mediaItemId: item.id,
          status: allowed[0],
          progress: episodeNumber,
        });
        setLibraryItem(created);
      }

      await diaryApi.createEvent({
        mediaItemId: item.id,
        type: 'PROGRESS',
        episodeNumber,
        note: `Progresso atualizado para o episódio ${episodeNumber}`,
      });

      showFeedback(`Episódio ${episodeNumber} marcado com sucesso.`);
      fetchDiaryEvents();
    } catch {
      if (prev) setLibraryItem(prev);
      showFeedback('Falha ao registrar episódio.');
    }
  };

  // Ação em lote: marcar temporada inteira
  const handleMarkSeasonAll = async (lastEpisodeOfSeason: number, seasonTitle: string) => {
    if (!isAuthenticated) return;
    const prev = libraryItem;
    try {
      if (libraryItem) {
        const updated = await libraryApi.updateItem(item.id, { progress: lastEpisodeOfSeason });
        setLibraryItem(updated);
      } else {
        const allowed = CATEGORY_ALLOWED_STATUSES[item.category] || ['ASSISTINDO'];
        const created = await libraryApi.addItem({
          mediaItemId: item.id,
          status: allowed[0],
          progress: lastEpisodeOfSeason,
        });
        setLibraryItem(created);
      }

      await diaryApi.createEvent({
        mediaItemId: item.id,
        type: 'PROGRESS',
        episodeNumber: lastEpisodeOfSeason,
        note: `Conclusão em lote da ${seasonTitle}`,
      });

      showFeedback(`Temporada concluída até o episódio ${lastEpisodeOfSeason}!`);
      fetchDiaryEvents();
    } catch {
      if (prev) setLibraryItem(prev);
      showFeedback('Falha ao marcar temporada.');
    }
  };

  // Salvar alterações detalhadas pelo modal
  const handleSaveModal = async (_mediaItemId: string, update: UpdateLibraryItemDto) => {
    const updated = await libraryApi.updateItem(item.id, update);
    setLibraryItem(updated);
    showFeedback('Status atualizado com sucesso.');
    fetchDiaryEvents();
  };

  // Remover obra da biblioteca
  const handleRemoveModal = async () => {
    await libraryApi.removeItem(item.id);
    setLibraryItem(null);
    showFeedback('Obra removida da sua biblioteca.');
    fetchDiaryEvents();
  };

  // Criação de anotação no diário
  const handleCreateNote = async (data: {
    mediaItemId: string;
    note: string;
    episodeNumber?: number | null;
    chapterNumber?: number | null;
    volumeNumber?: number | null;
    containsSpoiler: boolean;
    occurredAt?: string;
  }) => {
    try {
      const created = await diaryApi.createEvent({
        ...data,
        type: 'NOTE',
      });
      setDiaryEvents((prev) => [created, ...prev]);
      showFeedback('Anotação adicionada ao diário!');
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao salvar anotação.');
    }
  };

  // Exclusão de evento do histórico
  const handleDeleteDiaryEvent = async (eventId: string) => {
    try {
      await diaryApi.deleteEvent(eventId);
      setDiaryEvents((prev) => prev.filter((e) => e.id !== eventId));
      showFeedback('Registro do histórico removido com sucesso.');
    } catch {
      showFeedback('Falha ao excluir registro.');
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Toast de Feedback */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#201D28] border border-[#E05347]/40 text-[#F4EFEA] text-sm shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="w-2 h-2 rounded-full bg-[#E05347]" />
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#9E98A8] hover:text-[#F4EFEA] ml-2 p-1 rounded hover:bg-[#2B2735] transition-colors"
            title="Fechar notificação"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Barra Superior de Retorno */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#9E98A8] hover:text-[#F4EFEA] bg-[#201D28] hover:bg-[#2B2735] border border-[#2B2735] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Voltar para o catálogo</span>
        </button>

        {libraryItem && (
          <a
            href="/library"
            className="text-xs text-[#E05347] hover:text-[#C93B2F] font-bold flex items-center gap-1.5 hover:underline min-h-[44px] px-2"
          >
            <span>Minha Biblioteca</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        )}
      </div>

      {/* Hero Principal do Dossiê */}
      <article className="p-6 sm:p-8 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-xl shadow-black/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Capa Ampliada com Selo de Destaque */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="w-full max-w-[260px] aspect-[2/3] rounded-xl overflow-hidden border border-[#2B2735] shadow-2xl bg-[#121115] relative group">
              <img
                src={item.coverUrl}
                alt={`Capa oficial de ${item.title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#121115]/90 border border-[#2B2735] text-[10px] font-extrabold uppercase tracking-wider text-[#E05347]">
                #2 Global
              </div>
            </div>
          </div>

          {/* Dados Centrais do Dossiê */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Badges de Categoria & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${categoryClass}`}>
                {item.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#201D28] text-[#9E98A8] border border-[#2B2735]">
                {pubStatusLabel}
              </span>
              {item.releaseYear && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#201D28] text-[#9E98A8] border border-[#2B2735]">
                  {item.releaseYear}
                </span>
              )}
            </div>

            {/* Títulos */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F4EFEA]">
                {item.title}
              </h1>
              {item.originalTitle && (
                <p className="text-sm sm:text-base text-[#9E98A8] font-light mt-1">
                  {item.originalTitle}
                </p>
              )}
            </div>

            {/* Faixa das 4 Métricas de Alto Impacto */}
            <DossierMetricsStrip item={item} />

            {/* Console Pessoal de Acompanhamento */}
            <PersonalTrackingConsole
              item={item}
              libraryItem={libraryItem}
              isAuthenticated={isAuthenticated}
              onStatusChange={handleStatusChange}
              onRatingChange={handleRatingChange}
              onQuickIncrement={handleQuickIncrement}
              onOpenEditModal={() => setIsModalOpen(true)}
              onOpenNoteModal={() => setIsNoteModalOpen(true)}
            />
          </div>
        </div>
      </article>

      {/* Grade Assimétrica 8+4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Principal de Conteúdo (8 slots) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Gerenciador Interativo de Episódios / Capítulos */}
          <EpisodeManager
            item={item}
            currentProgress={libraryItem?.progress ?? 0}
            isAuthenticated={isAuthenticated}
            onMarkEpisode={handleMarkEpisode}
            onMarkSeasonAll={handleMarkSeasonAll}
          />

          {/* 2. Sinopse Completa & Ficha Técnica */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-6">
            {item.synopsis && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E05347] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Sinopse Completa</span>
                </h2>
                <p className="text-sm sm:text-base text-[#F4EFEA]/90 leading-relaxed font-normal">
                  {item.synopsis}
                </p>
              </div>
            )}

            {/* Títulos Alternativos */}
            {item.aliases && item.aliases.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[#2B2735]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E98A8]">
                  Títulos Alternativos &amp; Sinônimos
                </h3>
                <p className="text-xs text-[#9E98A8] leading-relaxed">
                  {item.aliases.join(' • ')}
                </p>
              </div>
            )}

            {/* Proveniência e Atribuição Legal de Metadados */}
            <div className="space-y-3 pt-4 border-t border-[#2B2735]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E98A8] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#9E98A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Proveniência e Atribuição dos Dados</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] p-3.5 rounded-xl bg-[#201D28] border border-[#2B2735]">
                <div>
                  <span className="text-[#9E98A8] block">Sinopse &amp; Metadados</span>
                  <span className="text-[#F4EFEA] font-semibold">
                    {item.provenance?.synopsis?.source || (item.category === 'DORAMA' || item.category === 'FILME' ? 'TMDB / TVmaze' : 'ANN / Kitsu')}
                  </span>
                </div>
                <div>
                  <span className="text-[#9E98A8] block">Armazenamento de Capa</span>
                  <span className="text-emerald-400 font-semibold">Soberania Local (SVG)</span>
                </div>
                <div>
                  <span className="text-[#9E98A8] block">Identificador Canônico</span>
                  <span className="text-[#F4EFEA] font-semibold">YuukiList Sovereign UUID</span>
                </div>
              </div>

              <p className="text-[10px] text-[#9E98A8] leading-relaxed">
                Este produto utiliza metadados verificados de fontes públicas (TMDB, TVmaze, Anime News Network e MangaUpdates) em conformidade com o princípio de soberania de dados do YuukiList.
              </p>
            </div>
          </section>

          {/* 3. Seção de Franquia e Universo Transmídia */}
          {relationsData && (relationsData.relations.length > 0 || relationsData.franchise) && (
            <RelatedWorksSection
              relations={relationsData.relations}
              franchise={relationsData.franchise}
              currentMediaSlug={item.slug}
            />
          )}

          {/* 4. Diário Pessoal & Histórico da Obra */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B2735] pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F4EFEA] tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#E05347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Diário &amp; Histórico da Obra</span>
                </h2>
                <p className="text-xs text-[#9E98A8] mt-0.5">
                  Registros cronológicos, ciclos e anotações por episódio com proteção contra spoilers.
                </p>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(true)}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#E05347] hover:bg-[#C93B2F] text-[#F4EFEA] font-bold text-xs sm:text-sm transition-colors shadow-md shadow-[#E05347]/20 cursor-pointer self-start sm:self-auto flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nova Anotação</span>
                </button>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="py-8 text-center bg-[#201D28] border border-[#2B2735] rounded-xl space-y-2">
                <p className="text-sm text-[#9E98A8]">
                  Faça login para registrar anotações e consultar seu histórico desta obra.
                </p>
                <a
                  href={`/login?redirect=${encodeURIComponent(`/items/${item.slug}`)}`}
                  className="inline-block text-xs font-bold text-[#E05347] hover:underline min-h-[44px] py-2"
                >
                  Entrar na conta →
                </a>
              </div>
            ) : (
              <TimelineView
                events={diaryEvents}
                isLoading={isLoadingDiary}
                onDeleteEvent={handleDeleteDiaryEvent}
                onAddNoteClick={() => setIsNoteModalOpen(true)}
              />
            )}
          </section>
        </div>

        {/* Coluna Lateral Analítica (4 slots) */}
        <div className="lg:col-span-4">
          <DossierSidebar item={item} />
        </div>
      </div>

      {/* Modal de Criação de Anotação no Diário */}
      <CreateNoteModal
        isOpen={isNoteModalOpen}
        mediaItemId={item.id}
        mediaTitle={item.title}
        category={item.category}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
      />

      {/* Modal de Edição Detalhada */}
      {libraryItem && (
        <EditItemModal
          isOpen={isModalOpen}
          item={{
            ...libraryItem,
            mediaItem: {
              id: item.id,
              slug: item.slug,
              title: item.title,
              originalTitle: item.originalTitle,
              category: item.category,
              publicationStatus: item.publicationStatus,
              coverUrl: item.coverUrl,
              releaseYear: item.releaseYear,
              genres: item.genres,
            },
          }}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onRemove={handleRemoveModal}
        />
      )}
    </div>
  );
}
