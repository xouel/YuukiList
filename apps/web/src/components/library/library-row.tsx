'use client';

/**
 * YuukiList — Linha de Obra na Biblioteca Pessoal (Modo Lista Tabular)
 * Conforme Requisitos: Personal Library View and Layout Toggle & Quick Progress Tracking
 */

import React from 'react';
import type { LibraryItemDto, Category } from '../../../../../packages/shared/src/index.ts';
import {
  formatProgressDisplay,
  calculateNextProgress,
} from './library-helpers.ts';

export interface LibraryRowProps {
  item: LibraryItemDto;
  onQuickIncrement?: (item: LibraryItemDto) => void;
  onToggleFavorite?: (item: LibraryItemDto) => void;
  onOpenEdit?: (item: LibraryItemDto) => void;
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

// Paleta Editorial Bimodal / Categoria
const CATEGORY_COLORS: Record<string, string> = {
  // Audiovisual (Ocre #D4A373 e Lavanda #9D8DF1)
  DORAMA: 'bg-[#D4A373]/15 text-[#D4A373] border-[#D4A373]/30',
  FILME: 'bg-[#D4A373]/15 text-[#D4A373] border-[#D4A373]/30',
  ANIME: 'bg-[#9D8DF1]/15 text-[#9D8DF1] border-[#9D8DF1]/30',
  // Impresso (Terracota #D97757)
  MANGA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
  MANHWA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
  MANHUA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
};

const STATUS_LABELS: Record<string, string> = {
  ASSISTINDO: 'Assistindo',
  LENDO: 'Lendo',
  QUERO_ASSISTIR: 'Quero Assistir',
  QUERO_LER: 'Quero Ler',
  CONCLUIDO: 'Concluído',
  ASSISTIDO: 'Assistido',
  PAUSADO: 'Pausado',
  DROPADO: 'Dropado',
};

export function LibraryRow({
  item,
  onQuickIncrement,
  onToggleFavorite,
  onOpenEdit,
  isMutating = false,
}: LibraryRowProps) {
  const media = item.mediaItem;
  const category = media?.category as Category | undefined;
  const categoryName = category ? CATEGORY_DISPLAY_NAMES[category] || category : undefined;
  const categoryClass = (category && CATEGORY_COLORS[category]) || 'bg-[#1A1820] text-[#9C96A2] border-[#2B2735]';
  const statusLabel = STATUS_LABELS[item.status] || item.status;

  const totalUnits =
    category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
      ? (media as any)?.totalChapters || (media as any)?.totalUnits
      : (media as any)?.totalEpisodes || (media as any)?.totalUnits;

  const canIncrement =
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
      : null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={handleEditClick}
      className="group flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] hover:border-[#E05347]/50 transition-all duration-200 cursor-pointer"
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onOpenEdit) onOpenEdit(item);
        }
      }}
      aria-label={`Editar ${media?.title || 'obra'}`}
    >
      {/* Miniatura da Capa e Título */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-11 sm:w-14 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-[#121115] border border-[#2B2735]">
          <img
            src={media?.coverUrl || '/covers/fallback.svg'}
            alt={`Capa de ${media?.title || 'obra'}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-medium text-sm sm:text-base text-[#F4EFEA] truncate group-hover:text-[#E05347] transition-colors">
              {media?.title || 'Obra sem título'}
            </h3>

            {/* Badges de Categoria e Em Dia */}
            {category && (
              <span
                className={`text-[10px] font-medium tracking-wide px-1.5 py-0.5 rounded border ${categoryClass}`}
              >
                {categoryName}
              </span>
            )}

            {item.isUpToDate && (
              <span
                data-testid="up-to-date-badge"
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#059669]/60"
              >
                Em dia
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#9C96A2] flex-wrap">
            <span className="px-1.5 py-0.2 rounded bg-black/40 text-[#F4EFEA] border border-white/10 text-[10px]">
              {statusLabel}
            </span>

            {media?.originalTitle && (
              <span className="truncate max-w-[200px] opacity-70 font-light hidden sm:inline" title={media.originalTitle}>
                {media.originalTitle}
              </span>
            )}

            {typeof item.rating === 'number' && item.rating > 0 && (
              <span className="text-amber-300 font-bold flex items-center gap-0.5">
                ★ {item.rating.toFixed(1)}
              </span>
            )}

            {item.rewatchCount > 0 && (
              <span className="text-[#F4EFEA] font-bold text-[10px]">
                ↻ {item.rewatchCount}x
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progresso, Barra Visual e Ações Ágeis */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs sm:text-sm font-medium text-[#F4EFEA]">
            {progressText}
          </span>
          {progressPercentage !== null && (
            <div className="w-20 sm:w-28 bg-[#2B2735] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E05347] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Botão de Incremento Rápido com Alvo 44px */}
        {canIncrement && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isMutating}
            aria-label={`Avançar um ${category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA' ? 'capítulo' : 'episódio'} para ${media?.title || 'obra'}`}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl bg-[#E05347]/15 text-[#E05347] hover:bg-[#E05347] hover:text-white active:scale-95 border border-[#E05347]/30 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#E05347]"
          >
            {isMutating ? (
              <div className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin" />
            ) : (
              <span>+1</span>
            )}
          </button>
        )}

        {/* Botão de Favorito (♥) */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={item.isFavorite ? 'Desmarcar favorito' : 'Marcar como favorito'}
          className={`p-2 rounded-xl transition-all ${
            item.isFavorite
              ? 'bg-[#E05347]/25 text-[#E05347] border border-[#E05347]/50 hover:bg-[#E05347]/35'
              : 'text-[#9C96A2] hover:text-[#E05347] hover:bg-white/5 border border-transparent'
          }`}
        >
          <svg
            className="w-4 h-4"
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
    </div>
  );
}
