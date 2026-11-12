'use client';

/**
 * YuukiList — Card de Obra na Biblioteca Pessoal (Modo Grade Ledger)
 * Conforme Requisitos: Personal Library View and Layout Toggle & Quick Progress Tracking (R32)
 */

import React from 'react';
import type { LibraryItemDto, Category } from '../../../../../packages/shared/src/index.ts';
import {
  formatProgressDisplay,
  calculateNextProgress,
} from './library-helpers.ts';
import { QuickRatingPopover } from './quick-rating-popover.tsx';

export interface LibraryCardProps {
  item: LibraryItemDto;
  onQuickIncrement?: (item: LibraryItemDto) => void;
  onToggleFavorite?: (item: LibraryItemDto) => void;
  onOpenEdit?: (item: LibraryItemDto) => void;
  onOpenNote?: (item: LibraryItemDto) => void;
  onRatingChange?: (item: LibraryItemDto, rating: number) => void;
  isMutating?: boolean;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  DORAMA: 'Doramas',
  FILME: 'Filmes',
  ANIME: 'Animes',
  MANGA: 'Mangás',
  MANHWA: 'Manhwas',
  MANHUA: 'Manhuas',
};

const STATUS_LABELS: Record<string, string> = {
  ASSISTINDO: 'Em andamento',
  LENDO: 'Em andamento',
  QUERO_ASSISTIR: 'Planejado',
  QUERO_LER: 'Planejado',
  CONCLUIDO: 'Concluído',
  ASSISTIDO: 'Concluído',
  PAUSADO: 'Pausado',
  DROPADO: 'Dropado',
};

export function LibraryCard({
  item,
  onQuickIncrement,
  onToggleFavorite,
  onOpenEdit,
  onOpenNote,
  onRatingChange,
  isMutating = false,
}: LibraryCardProps) {
  const media = item.mediaItem;
  const category = media?.category as Category | undefined;
  const categoryName = category ? CATEGORY_DISPLAY_NAMES[category] || category : undefined;
  const statusLabel = STATUS_LABELS[item.status] || item.status;
  const isCompleted = item.status === 'CONCLUIDO' || item.status === 'ASSISTIDO';

  const totalUnits =
    category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
      ? (media as any)?.totalChapters || (media as any)?.totalUnits
      : (media as any)?.totalEpisodes || (media as any)?.totalUnits;

  const canIncrement =
    !isCompleted &&
    category !== 'FILME' &&
    calculateNextProgress(item.progress, totalUnits, category) !== null;

  const baseProgress = formatProgressDisplay(item.progress, totalUnits, category);
  const progressText =
    item.progressVolumes != null && item.progressVolumes > 0
      ? `${baseProgress} • Vol. ${item.progressVolumes}`
      : baseProgress;

  const progressPercentage =
    typeof totalUnits === 'number' && totalUnits > 0
      ? Math.min(100, Math.round((item.progress / totalUnits) * 100))
      : isCompleted
      ? 100
      : null;

  const handleCardClick = () => {
    if (onOpenEdit) {
      onOpenEdit(item);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMutating && onQuickIncrement) {
      onQuickIncrement(item);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item);
    }
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenNote) {
      onOpenNote(item);
    } else if (onOpenEdit) {
      onOpenEdit(item);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-surface-raised rounded-xl overflow-hidden border border-stroke-subtle hover:border-stroke-accent shadow-hairline-top transition-all duration-300 hover:shadow-xl hover:shadow-black/50 active:scale-[0.98] active:transition-transform flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalhes de ${media?.title || 'obra'}`}
    >
      {/* Capa com Proporção 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-canvas">
        <img
          src={media?.coverUrl || '/covers/fallback.svg'}
          alt={`Capa de ${media?.title || 'obra'}`}
          loading="lazy"
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
        />

        {/* Canto Superior Esquerdo: Status Pessoal Sóbrio De-Boxed */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1.5 shadow-sm backdrop-blur ${
              isCompleted
                ? 'bg-surface-canvas/90 text-emerald-400 border-emerald-500/30'
                : 'bg-surface-canvas/90 text-[var(--color-text-primary)] border-stroke-subtle'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isCompleted ? 'bg-emerald-400' : 'bg-accent'
              }`}
            />
            {statusLabel}
          </span>
        </div>

        {/* Canto Superior Direito: Em Dia, Favorito e Nota Oficial */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {item.isUpToDate && (
            <span
              data-testid="up-to-date-badge"
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-black/40 backdrop-blur"
            >
              <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Em dia
            </span>
          )}

          {/* Botão Interativo de Favorito */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={item.isFavorite ? 'Desmarcar favorito' : 'Marcar como favorito'}
            className={`p-1.5 rounded-lg backdrop-blur transition-all shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent ${
              item.isFavorite
                ? 'bg-accent/25 text-accent border border-accent/50 hover:bg-accent/35'
                : 'bg-black/60 text-[var(--color-text-secondary)] hover:text-accent border border-white/10'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={item.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Base da Capa: Categoria em Cromo Neutro e Nota */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {category && (
            <span
              className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border border-white/10 uppercase bg-black/60 text-white/90 backdrop-blur shadow-sm"
            >
              {categoryName}
            </span>
          )}
          {typeof (media as any)?.score === 'number' && (media as any).score > 0 && (
            <span className="text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded bg-black/75 text-amber-300 border border-white/10 flex items-center gap-1 backdrop-blur">
              ★ {((media as any).score).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Detalhes e Controle Tátil de Progresso */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-serif font-medium text-base text-[var(--color-text-primary)] line-clamp-1 group-hover:text-accent transition-colors">
            {media?.title || 'Obra sem título'}
          </h3>
        </div>

        {/* Barra Visual Proporcional de Progresso */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-light text-[11px] uppercase tracking-wider">Progresso</span>
            <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">{progressText}</span>
          </div>

          {progressPercentage !== null && (
            <div className="w-full bg-surface-sunken h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-accent to-rose-400'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Rodapé de Ações Rápidas (Nota Inline, Diário e +1) */}
        <div className="pt-2.5 border-t border-stroke-subtle flex items-center justify-between gap-2">
          {/* Seletor Popover de Avaliação Rápida */}
          <QuickRatingPopover
            currentRating={item.rating}
            onSelectRating={(r) => onRatingChange && onRatingChange(item, r)}
            disabled={isMutating}
          />

          {/* Atalho para Anotação do Diário */}
          <button
            type="button"
            onClick={handleNoteClick}
            aria-label={`Criar anotação no diário para ${media?.title || 'obra'}`}
            title="Anotação no Diário"
            className="min-w-[36px] min-h-[36px] p-2 rounded-lg bg-surface-overlay hover:bg-surface-overlay/80 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-stroke-subtle transition-all active:scale-[0.98] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Ação Primária: +1 Ep / Cap ou Finalizado */}
          {isCompleted ? (
            <span className="min-h-[44px] px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Finalizado</span>
            </span>
          ) : canIncrement ? (
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMutating}
              aria-label={`Avançar um ${category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA' ? 'capítulo' : 'episódio'} para ${media?.title || 'obra'}`}
              className="min-w-[44px] min-h-[44px] px-3 inline-flex items-center justify-center rounded-xl bg-accent hover:bg-accent/90 text-white active:scale-[0.98] shadow-md shadow-accent/20 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              {isMutating ? (
                <div className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin" />
              ) : (
                <span>+1 {category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA' ? 'Cap' : 'Ep'}</span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
