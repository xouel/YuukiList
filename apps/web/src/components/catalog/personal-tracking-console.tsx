'use client';

/**
 * YuukiList — Console Pessoal de Acompanhamento da Obra
 * Gerenciamento de status, nota (1-10), barra de progresso visual, tempo assistido e avanço rápido
 */

import React, { useState } from 'react';
import type {
  MediaItemDetailDto,
  LibraryItemDto,
  PersonalStatus,
} from '../../../../../packages/shared/src/index.ts';
import { CATEGORY_ALLOWED_STATUSES } from '../../../../../packages/shared/src/index.ts';
import { computeEstimatedWatchTime } from './dossier-helpers.ts';

interface PersonalTrackingConsoleProps {
  item: MediaItemDetailDto;
  libraryItem: LibraryItemDto | null;
  isAuthenticated: boolean;
  onStatusChange: (status: PersonalStatus) => Promise<void>;
  onRatingChange: (rating: number) => Promise<void>;
  onQuickIncrement: () => Promise<void>;
  onToggleFavorite?: () => Promise<void>;
  onOpenEditModal: () => void;
  onOpenNoteModal: () => void;
}

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

export function PersonalTrackingConsole({
  item,
  libraryItem,
  isAuthenticated,
  onStatusChange,
  onRatingChange,
  onQuickIncrement,
  onToggleFavorite,
  onOpenEditModal,
  onOpenNoteModal,
}: PersonalTrackingConsoleProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const isFavorite = libraryItem?.isFavorite ?? false;

  const isReading =
    item.category === 'MANGA' ||
    item.category === 'MANHWA' ||
    item.category === 'MANHUA';

  const unitLabel = isReading ? 'Capítulo' : 'Episódio';
  const unitLabelShort = isReading ? 'Cap.' : 'Ep.';

  const allowedStatuses = CATEGORY_ALLOWED_STATUSES[item.category] || [
    'ASSISTINDO',
    'QUERO_ASSISTIR',
    'CONCLUIDO',
    'PAUSADO',
    'DROPADO',
  ];

  const currentProgress = libraryItem?.progress ?? 0;
  const totalUnits = isReading ? item.totalChapters : item.totalEpisodes;
  const progressPercent =
    totalUnits && totalUnits > 0
      ? Math.min(100, Math.round((currentProgress / totalUnits) * 100))
      : currentProgress > 0
      ? 100
      : 0;

  const estimatedTimeText = computeEstimatedWatchTime(currentProgress, item.category);

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PersonalStatus;
    try {
      setIsUpdating(true);
      await onStatusChange(val);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRatingSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    try {
      setIsUpdating(true);
      await onRatingChange(val);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrementClick = async () => {
    try {
      setIsUpdating(true);
      await onQuickIncrement();
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
              Console Pessoal de Acompanhamento
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Faça login para registrar seu status, avaliar e sincronizar episódios e capítulos.
            </p>
          </div>
          <a
            href={`/login?redirect=${encodeURIComponent(`/items/${item.slug}`)}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:opacity-90 text-white font-bold text-xs transition-all shadow-sm min-h-[44px] min-w-[44px] active:scale-[0.98] duration-75"
          >
            <span>Entrar para Acompanhar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top space-y-4">
      {/* 1. Seletores de Status & Nota Pessoal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Meu Status */}
        <div className="space-y-1.5">
          <label htmlFor="console-status-select" className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Meu Status
          </label>
          <div className="relative">
            <select
              id="console-status-select"
              value={libraryItem?.status || allowedStatuses[0]}
              onChange={handleStatusSelect}
              disabled={isUpdating}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface-sunken border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors appearance-none cursor-pointer"
            >
              {allowedStatuses.map((s) => (
                <option key={s} value={s}>
                  {PERSONAL_STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[var(--color-text-secondary)]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Minha Nota */}
        <div className="space-y-1.5">
          <label htmlFor="console-rating-select" className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Minha Nota
          </label>
          <div className="relative">
            <select
              id="console-rating-select"
              value={libraryItem?.rating ? Math.round(libraryItem.rating) : 0}
              onChange={handleRatingSelect}
              disabled={isUpdating}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface-sunken border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="0">Sem nota atribuída</option>
              <option value="10">10 - Obra-Prima</option>
              <option value="9">9 - Excelente</option>
              <option value="8">8 - Muito Bom</option>
              <option value="7">7 - Bom</option>
              <option value="6">6 - Razoável</option>
              <option value="5">5 - Mediano</option>
              <option value="4">4 - Fraco</option>
              <option value="3">3 - Ruim</option>
              <option value="2">2 - Terrível</option>
              <option value="1">1 - Inassistível</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-amber-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra Visual de Progresso & Tempo Assistido */}
      <div className="p-3 rounded-lg bg-surface-sunken border border-stroke-subtle space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--color-text-primary)] font-mono tabular-nums">
            Progresso Pessoal: {currentProgress} / {totalUnits ? totalUnits : '?'} {unitLabelShort.toLowerCase()}s
            {totalUnits ? ` (${progressPercent}%)` : ''}
          </span>
          <span className="text-[var(--color-text-secondary)] text-[11px] font-medium font-mono tabular-nums">
            {estimatedTimeText}
          </span>
        </div>

        {/* Track da Barra de Progresso */}
        <div className="w-full h-2 rounded-full bg-surface-canvas border border-stroke-subtle overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Ações: Incremento Rápido (+1) e Ações Secundárias */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Botão de Incremento Rápido com alvo mínimo de 44x44px */}
        <button
          type="button"
          onClick={handleIncrementClick}
          disabled={isUpdating || (Boolean(totalUnits) && currentProgress >= (totalUnits || 0))}
          className="flex-1 min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg bg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] duration-75"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>+1 {unitLabel}</span>
        </button>

        {/* Favorito */}
        <button
          type="button"
          onClick={async () => {
            if (isUpdating || !onToggleFavorite) return;
            try {
              setIsUpdating(true);
              await onToggleFavorite();
            } finally {
              setIsUpdating(false);
            }
          }}
          disabled={isUpdating}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] duration-75 ${
            isFavorite
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-surface-sunken border-stroke-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay'
          }`}
          title={isFavorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
        >
          <svg
            className="w-4 h-4"
            fill={isFavorite ? 'currentColor' : 'none'}
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
          <span className="hidden sm:inline">{isFavorite ? 'Favorito' : 'Favoritar'}</span>
        </button>

        {/* Diário / Anotação */}
        <button
          type="button"
          onClick={onOpenNoteModal}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-lg bg-surface-sunken hover:bg-surface-overlay border border-stroke-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] duration-75"
          title="Nova anotação no diário"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline">Diário</span>
        </button>

        {/* Editar Detalhes */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-lg bg-surface-sunken hover:bg-surface-overlay border border-stroke-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] duration-75"
          title="Editar detalhes da biblioteca"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Editar</span>
        </button>
      </div>
    </div>
  );
}
