'use client';

/**
 * YuukiList — Card de Obra na Biblioteca Pessoal (Modo Grade)
 * Conforme Requisitos: Personal Library View and Layout Toggle & Quick Progress Tracking & Favoritos
 */

import React from 'react';
import type { LibraryItemDto, Category } from '../../../../../packages/shared/src/index.ts';
import {
  formatProgressDisplay,
  calculateNextProgress,
} from './library-helpers.ts';

export interface LibraryCardProps {
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

export function LibraryCard({
  item,
  onQuickIncrement,
  onToggleFavorite,
  onOpenEdit,
  isMutating = false,
}: LibraryCardProps) {
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

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-[#1A1820] rounded-xl overflow-hidden border border-[#2B2735] hover:border-[#E05347]/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col h-full cursor-pointer"
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
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121115]">
        <img
          src={media?.coverUrl || '/covers/fallback.svg'}
          alt={`Capa de ${media?.title || 'obra'}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges do Canto Superior Esquerdo: Categoria e Status do Usuário Reposicionado */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {category && (
            <span
              className={`text-[10px] font-medium tracking-wide px-2 py-0.5 rounded border backdrop-blur shadow-sm ${categoryClass}`}
            >
              {categoryName}
            </span>
          )}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/75 text-[#F4EFEA] border border-white/10 backdrop-blur shadow-sm">
            {statusLabel}
          </span>
        </div>

        {/* Badges do Canto Superior Direito: Em Dia e Favorito */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {item.isUpToDate && (
            <span
              data-testid="up-to-date-badge"
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#059669]/60 shadow-lg shadow-black/40 backdrop-blur"
            >
              <svg className="w-3 h-3 text-[#34D399]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Em dia
            </span>
          )}

          {/* Botão Interativo de Favorito (♥) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={item.isFavorite ? 'Desmarcar favorito' : 'Marcar como favorito'}
            className={`p-1.5 rounded-lg backdrop-blur transition-all shadow-md ${
              item.isFavorite
                ? 'bg-[#E05347]/25 text-[#E05347] border border-[#E05347]/50 hover:bg-[#E05347]/35'
                : 'bg-black/60 text-[#9C96A2] hover:text-[#E05347] border border-white/10'
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

        {/* Base da Capa: Indicador de Reassistir e Avaliação */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {item.rewatchCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-[#F4EFEA] border border-white/10 backdrop-blur"
                title={`Reassistido/Relido ${item.rewatchCount} vezes`}
              >
                ↻ {item.rewatchCount}x
              </span>
            )}
          </div>
          {typeof item.rating === 'number' && item.rating > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-amber-300 border border-white/10 flex items-center gap-1 backdrop-blur">
              ★ {item.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Detalhes e Controle Tátil de Progresso */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-serif font-medium text-base text-[#F4EFEA] line-clamp-1 group-hover:text-[#E05347] transition-colors">
            {media?.title || 'Obra sem título'}
          </h3>
          {media?.originalTitle && (
            <p className="text-xs text-[#9C96A2] line-clamp-1 mt-0.5 opacity-70 font-light">
              {media.originalTitle}
            </p>
          )}
        </div>

        {/* Componente Tátil de Progresso e Barra Visual */}
        <div className="pt-2 border-t border-[#2B2735] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#9C96A2]">
              <span className="font-medium text-[#F4EFEA]">{progressText}</span>
            </div>

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
          </div>

          {/* Barra Visual Proporcional de Progresso */}
          {progressPercentage !== null && (
            <div className="w-full bg-[#2B2735] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E05347] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
