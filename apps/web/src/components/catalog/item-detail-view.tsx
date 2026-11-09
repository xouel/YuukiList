'use client';

/**
 * YuukiList — Visualização Detalhada da Obra no Catálogo com Gestão de Biblioteca
 * Conforme Documento Mestre de Contexto e PRD
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  type MediaItemDetailDto,
  type PersonalStatus,
  type LibraryItemDto,
  type UpdateLibraryItemDto,
  CATEGORY_ALLOWED_STATUSES,
} from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { EditItemModal } from '../library/edit-item-modal.tsx';
import {
  formatProgressDisplay,
  calculateNextProgress,
  computeOptimisticItemUpdate,
} from '../library/library-helpers.ts';

interface ItemDetailViewProps {
  item: MediaItemDetailDto;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  DORAMA: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
  FILME: 'bg-amber-950/80 text-amber-300 border-amber-800',
  ANIME: 'bg-purple-950/80 text-purple-300 border-purple-800',
  MANGA: 'bg-rose-950/80 text-rose-300 border-rose-800',
  MANHWA: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
  MANHUA: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
};

const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  HIATO: 'Hiato',
  DESCONHECIDA: 'Desconhecida',
};

const PERSONAL_STATUS_LABELS: Record<string, string> = {
  ASSISTINDO: 'Assistindo',
  LENDO: 'Lendo',
  QUERO_ASSISTIR: 'Quero Assistir',
  QUERO_LER: 'Quero Ler',
  CONCLUIDO: 'Concluído',
  ASSISTIDO: 'Assistido',
  PAUSADO: 'Pausado',
  DROPADO: 'Dropado',
};

const libraryApi = new LibraryApiClient();

function getDefaultStatus(category: string): PersonalStatus {
  if (category === 'FILME') return 'QUERO_ASSISTIR';
  if (category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') return 'LENDO';
  return 'ASSISTINDO';
}

export function ItemDetailView({ item, onBack }: ItemDetailViewProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [libraryItem, setLibraryItem] = useState<LibraryItemDto | null>(null);
  const [isCheckingLibrary, setIsCheckingLibrary] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<PersonalStatus>(getDefaultStatus(item.category));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const categoryClass = CATEGORY_COLORS[item.category] || 'bg-gray-800 text-gray-300 border-gray-700';
  const pubStatusLabel = PUBLICATION_STATUS_LABELS[item.publicationStatus] || item.publicationStatus;
  const allowedStatuses = CATEGORY_ALLOWED_STATUSES[item.category] || [];

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
      setIsCheckingLibrary(false);
      return;
    }

    try {
      setIsCheckingLibrary(true);
      const data = await libraryApi.getItem(item.id);
      setLibraryItem(data);
    } catch {
      // 404 significa que o item não está na biblioteca
      setLibraryItem(null);
    } finally {
      setIsCheckingLibrary(false);
    }
  }, [isAuthenticated, item.id]);

  useEffect(() => {
    checkLibraryStatus();
  }, [checkLibraryStatus]);

  // Ação de adicionar obra à biblioteca
  const handleAddToLibrary = async () => {
    if (!isAuthenticated) return;

    try {
      setIsSubmitting(true);
      const created = await libraryApi.addItem({
        mediaItemId: item.id,
        status: selectedStatus,
        progress: 0,
      });
      setLibraryItem(created);
      showFeedback('Obra adicionada à sua biblioteca com sucesso!');
    } catch (err: any) {
      showFeedback(err?.message || 'Falha ao adicionar obra à biblioteca.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Incremento rápido "+1" na tela de detalhes
  const handleQuickIncrement = async () => {
    if (!libraryItem) return;

    const nextProg = calculateNextProgress(libraryItem.progress, undefined, item.category);
    if (nextProg === null) return;

    const prev = libraryItem;
    const optimistic = computeOptimisticItemUpdate(libraryItem, nextProg, undefined);
    setLibraryItem(optimistic);

    try {
      const updated = await libraryApi.updateItem(item.id, { progress: nextProg });
      setLibraryItem(updated);
    } catch {
      setLibraryItem(prev);
      showFeedback('Falha ao atualizar progresso.');
    }
  };

  // Salvar alterações pelo modal
  const handleSaveModal = async (_mediaItemId: string, update: UpdateLibraryItemDto) => {
    const updated = await libraryApi.updateItem(item.id, update);
    setLibraryItem(updated);
    showFeedback('Status atualizado com sucesso.');
  };

  // Remover obra da biblioteca
  const handleRemoveModal = async () => {
    await libraryApi.removeItem(item.id);
    setLibraryItem(null);
    showFeedback('Obra removida da sua biblioteca.');
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast de Feedback */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#181C2B] border border-[#06B6D4]/40 text-[#F3F4F6] text-sm shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#181C2B] hover:bg-[#1F2438] border border-[#262C3F] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o catálogo
        </button>

        {libraryItem && (
          <a
            href="/library"
            className="text-xs text-[#06B6D4] hover:text-[#22D3EE] font-medium flex items-center gap-1 hover:underline"
          >
            <span>Minha Biblioteca</span>
            <span>→</span>
          </a>
        )}
      </div>

      {/* Grid Principal da Obra */}
      <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-[#121520] border border-[#262C3F] rounded-2xl p-6 sm:p-8">
        {/* Coluna da Capa e Painel de Biblioteca */}
        <div className="md:col-span-1 flex flex-col items-center space-y-4">
          <div className="w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden border border-[#262C3F] shadow-2xl bg-[#181C2B]">
            <img
              src={item.coverUrl}
              alt={`Capa oficial de ${item.title}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Painel de Gestão da Biblioteca Pessoal */}
          <div className="w-full max-w-[280px]">
            {isAuthLoading || isCheckingLibrary ? (
              <div className="w-full h-12 rounded-xl bg-[#181C2B] border border-[#262C3F] animate-pulse" />
            ) : !isAuthenticated ? (
              /* Visitante anônimo */
              <a
                href={`/login?redirect=${encodeURIComponent(`/items/${item.slug}`)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181C2B] hover:bg-[#262C3F] text-[#06B6D4] border border-[#06B6D4]/30 font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-[#06B6D4]/5 text-center focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Entrar para Adicionar à Lista
              </a>
            ) : libraryItem ? (
              /* Obra já presente na biblioteca */
              <div className="p-3.5 rounded-xl bg-[#181C2B] border border-[#06B6D4]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#06B6D4] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Na sua biblioteca
                  </span>

                  {libraryItem.isUpToDate && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#059669]/60">
                      Em dia
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/5 font-medium">
                    {PERSONAL_STATUS_LABELS[libraryItem.status] || libraryItem.status}
                  </span>
                  <span className="text-gray-400">
                    {formatProgressDisplay(libraryItem.progress, undefined, item.category)}
                  </span>
                </div>

                {typeof libraryItem.rating === 'number' && libraryItem.rating > 0 && (
                  <div className="text-xs text-amber-300 flex items-center gap-1 font-semibold">
                    <span>★ Sua Nota:</span>
                    <span>{libraryItem.rating.toFixed(1)}/10</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#262C3F] flex items-center gap-2">
                  {item.category !== 'FILME' && (
                    <button
                      type="button"
                      onClick={handleQuickIncrement}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4] text-[#06B6D4] hover:text-[#0B0D13] border border-[#06B6D4]/30 transition-all text-center"
                    >
                      +1 {item.category === 'MANGA' || item.category === 'MANHWA' || item.category === 'MANHUA' ? 'Cap.' : 'Ep.'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#262C3F] hover:bg-[#323950] text-[#F3F4F6] transition-colors text-center"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ) : (
              /* Obra ainda NÃO adicionada à biblioteca */
              <div className="p-3.5 rounded-xl bg-[#181C2B] border border-[#262C3F] space-y-3">
                <label
                  htmlFor="status-add-select"
                  className="block text-xs font-medium text-[#94A3B8]"
                >
                  Adicionar à Biblioteca:
                </label>

                <select
                  id="status-add-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as PersonalStatus)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none"
                >
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>
                      {PERSONAL_STATUS_LABELS[s] || s}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddToLibrary}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0D13] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Adicionando...'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar à Lista
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna de Detalhes e Sinopse */}
        <div className="md:col-span-2 lg:col-span-3 space-y-5">
          {/* Cabeçalho */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${categoryClass}`}>
                {item.category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                {pubStatusLabel}
              </span>
              {item.releaseYear && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                  {item.releaseYear}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6]">
              {item.title}
            </h1>

            {item.originalTitle && (
              <p className="text-sm sm:text-base text-[#9CA3AF] font-light mt-1">
                {item.originalTitle}
              </p>
            )}
          </div>

          {/* Sinopse */}
          {item.synopsis && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Sinopse
              </h2>
              <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed">
                {item.synopsis}
              </p>
            </div>
          )}

          {/* Gêneros */}
          {item.genres && item.genres.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Gêneros
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#181C2B] text-[#F3F4F6] border border-[#262C3F]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Títulos Alternativos / Aliases */}
          {item.aliases && item.aliases.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#262C3F]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Títulos Alternativos
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {item.aliases.join(' • ')}
              </p>
            </div>
          )}

          {/* Seção de Proveniência dos Dados e Atribuição Legal (TR-005) */}
          <div className="space-y-3 pt-4 border-t border-[#262C3F]/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Proveniência e Atribuição dos Dados</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] p-3 rounded-xl bg-[#0E111B] border border-[#262C3F]">
              <div>
                <span className="text-[#64748B] block">Sinopse &amp; Metadados</span>
                <span className="text-white font-medium">
                  {item.provenance?.synopsis?.source || (item.category === 'DORAMA' || item.category === 'FILME' ? 'TMDB / TVmaze' : 'ANN / Kitsu')}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">Armazenamento de Capa</span>
                <span className="text-emerald-400 font-medium">Soberania Local (SVG)</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Identificadores Canônicos</span>
                <span className="text-white font-medium">YuukiList Sovereign UUID</span>
              </div>
            </div>

            <p className="text-[10px] text-[#64748B] leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB. Fontes adicionais: TVmaze, Anime News Network e MangaUpdates.
            </p>
          </div>
        </div>
      </article>

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
