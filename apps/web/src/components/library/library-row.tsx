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

export function LibraryRow({
  item,
  onQuickIncrement,
  onOpenEdit,
  isMutating = false,
}: LibraryRowProps) {
  const media = item.mediaItem;
  const category = media?.category as Category | undefined;
  const categoryClass = (category && CATEGORY_COLORS[category]) || 'bg-gray-800 text-gray-300 border-gray-700';
  const statusLabel = STATUS_LABELS[item.status] || item.status;

  const canIncrement =
    category !== 'FILME' &&
    calculateNextProgress(item.progress, undefined, category) !== null;

  const progressText = formatProgressDisplay(item.progress, undefined, category);

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

  return (
    <div
      onClick={handleEditClick}
      className="group flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#181C2B] border border-[#262C3F] hover:border-[#06B6D4]/50 transition-all duration-200 cursor-pointer"
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
        <div className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#121520] border border-white/5">
          <img
            src={media?.coverUrl || '/covers/fallback.svg'}
            alt={`Capa de ${media?.title || 'obra'}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {category && (
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border ${categoryClass}`}
              >
                {category}
              </span>
            )}

            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/60 text-gray-300 border border-white/5">
              {statusLabel}
            </span>

            {/* Badge Em dia */}
            {item.isUpToDate && (
              <span
                data-testid="up-to-date-badge"
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#059669]/60"
              >
                <svg className="w-2.5 h-2.5 text-[#34D399]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Em dia
              </span>
            )}
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-[#F3F4F6] truncate group-hover:text-[#06B6D4] transition-colors">
            {media?.title || 'Obra sem título'}
          </h3>

          {media?.originalTitle && (
            <p className="text-xs text-[#9CA3AF] truncate font-light hidden sm:block">
              {media.originalTitle}
            </p>
          )}
        </div>
      </div>

      {/* Nota Pessoal, Progresso e Ações */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Nota */}
        {typeof item.rating === 'number' && item.rating > 0 ? (
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>★</span>
            <span>{item.rating.toFixed(1)}</span>
          </div>
        ) : (
          <div className="hidden sm:block text-xs text-gray-500 w-12 text-center">
            —
          </div>
        )}

        {/* Progresso Numérico */}
        <div className="text-right">
          <span className="text-xs font-medium text-gray-200 block">
            {progressText}
          </span>
        </div>

        {/* Botão de Incremento Rápido */}
        {canIncrement && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isMutating}
            aria-label={`Avançar uma unidade para ${media?.title || 'obra'}`}
            className="inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] hover:bg-[#06B6D4] hover:text-[#0B0D13] active:scale-95 border border-[#06B6D4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
          >
            {isMutating ? (
              <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
            ) : (
              <span>+1</span>
            )}
          </button>
        )}

        {/* Botão de Edição */}
        <button
          type="button"
          onClick={handleEditClick}
          aria-label={`Editar detalhes de ${media?.title || 'obra'}`}
          className="p-1.5 rounded-lg bg-[#121520] hover:bg-[#262C3F] text-[#94A3B8] hover:text-[#F3F4F6] border border-[#262C3F] transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

