'use client';

/**
 * YuukiList — Card de Obra na Biblioteca Pessoal (Modo Grade)
 * Conforme Requisitos: Personal Library View and Layout Toggle & Quick Progress Tracking
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
  onOpenEdit?: (item: LibraryItemDto) => void;
  isMutating?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  DORAMA: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
  FILME: 'bg-amber-950/80 text-amber-300 border-amber-800',
  ANIME: 'bg-purple-950/80 text-purple-300 border-purple-800',
  MANGA: 'bg-rose-950/80 text-rose-300 border-rose-800',
  MANHWA: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
  MANHUA: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
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
  onOpenEdit,
  isMutating = false,
}: LibraryCardProps) {
  const media = item.mediaItem;
  const category = media?.category as Category | undefined;
  const categoryClass = (category && CATEGORY_COLORS[category]) || 'bg-gray-800 text-gray-300 border-gray-700';
  const statusLabel = STATUS_LABELS[item.status] || item.status;

  const canIncrement =
    category !== 'FILME' &&
    calculateNextProgress(item.progress, undefined, category) !== null;

  const progressText = formatProgressDisplay(item.progress, undefined, category);

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

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-[#181C2B] rounded-xl overflow-hidden border border-[#262C3F] hover:border-[#06B6D4]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#06B6D4]/5 flex flex-col h-full cursor-pointer"
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
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121520]">
        <img
          src={media?.coverUrl || '/covers/fallback.svg'}
          alt={`Capa de ${media?.title || 'obra'}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge de Categoria */}
        {category && (
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border backdrop-blur ${categoryClass}`}
            >
              {category}
            </span>
          </div>
        )}

        {/* Badge "Em dia" destacado */}
        {item.isUpToDate && (
          <div className="absolute top-2.5 right-2.5">
            <span
              data-testid="up-to-date-badge"
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#059669]/60 shadow-lg shadow-black/40 backdrop-blur"
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
          </div>
        )}

        {/* Badge de Status Pessoal Sobreposto na Base da Capa */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/75 text-gray-200 border border-white/10 backdrop-blur">
            {statusLabel}
          </span>
          {typeof item.rating === 'number' && item.rating > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur">
              ★ {item.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Detalhes e Ações */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base text-[#F3F4F6] line-clamp-1 group-hover:text-[#06B6D4] transition-colors">
            {media?.title || 'Obra sem título'}
          </h3>
          {media?.originalTitle && (
            <p className="text-xs text-[#9CA3AF] line-clamp-1 mt-0.5 font-light">
              {media.originalTitle}
            </p>
          )}
        </div>

        {/* Barra de Progresso e Ação Ágil */}
        <div className="pt-2 border-t border-[#262C3F]/60 flex items-center justify-between">
          <div className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-gray-300">{progressText}</span>
          </div>

          {canIncrement && (
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMutating}
              aria-label={`Avançar um ${category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA' ? 'capítulo' : 'episódio'} para ${media?.title || 'obra'}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#06B6D4]/15 text-[#06B6D4] hover:bg-[#06B6D4] hover:text-[#0B0D13] active:scale-95 border border-[#06B6D4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
            >
              {isMutating ? (
                <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
              ) : (
                <span>+1</span>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

