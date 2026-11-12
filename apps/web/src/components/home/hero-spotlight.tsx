'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { MediaItemSummaryDto, LibraryItemDto } from '../../../../../packages/shared/src/index.ts';

interface HeroSpotlightProps {
  media?: MediaItemSummaryDto | null;
  libraryItem?: LibraryItemDto | null;
  isAuthenticated: boolean;
  onQuickIncrement?: (mediaItemId: string, nextProgress: number) => Promise<void>;
}

export function HeroSpotlight({
  media,
  libraryItem,
  isAuthenticated,
  onQuickIncrement,
}: HeroSpotlightProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fallback para visitante ou sem obra definida
  const defaultTitle = media?.title || 'Solo Leveling: Arise';
  const defaultSynopsis =
    media?.synopsis ||
    'O caçador mais fraco da humanidade desperta um sistema exclusivo de missões e evolução sem limites em um mundo assolado por portais e feras mágicas.';
  const defaultCategory = media?.category || 'ANIME';
  const defaultCoverUrl = media?.coverUrl || '/api/v1/catalog/items/solo-leveling/cover';
  const defaultSlug = media?.slug || 'solo-leveling';

  // Progresso do usuário se autenticado
  const currentProgress = libraryItem ? libraryItem.progress : 8;
  const totalUnits = (media as any)?.totalEpisodes || (media as any)?.totalChapters || 12;
  const progressPercent = Math.min(100, Math.round((currentProgress / totalUnits) * 100));

  const handleIncrement = async () => {
    if (!onQuickIncrement || !libraryItem || isUpdating) return;
    try {
      setIsUpdating(true);
      await onQuickIncrement(libraryItem.mediaItemId, currentProgress + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-2xl bg-surface-raised border border-stroke-subtle p-6 sm:p-8 shadow-hairline-top">
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 sm:gap-8">
        {/* Lado Esquerdo: Metadados, Título, Sinopse e Controles de Progresso */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Metadados Editoriais Superiores */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                {isAuthenticated ? 'Destaque do Diário' : 'Destaque Editorial'}
              </span>
              <span className="text-[var(--color-text-muted)] text-xs">•</span>
              <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)]">
                {defaultCategory}
              </span>
              <span className="text-[var(--color-text-muted)] text-xs">•</span>
              <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1">
                ★ 9.6 <span className="text-[var(--color-text-muted)] font-normal">(42.1k)</span>
              </span>
            </div>

            <Link href={`/items/${defaultSlug}`} className="group inline-block">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-accent transition-colors">
                {defaultTitle}
              </h2>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2 line-clamp-3 font-light max-w-xl">
              {defaultSynopsis}
            </p>
          </div>

          {/* Área de Ação e Progresso */}
          {isAuthenticated && libraryItem ? (
            <div className="pt-2 border-t border-stroke-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--color-text-secondary)]">
                  Seu Progresso Atual:{' '}
                  <strong className="text-[var(--color-text-primary)]">
                    Episódio {currentProgress} de {totalUnits} ({progressPercent}%)
                  </strong>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold">
                  Assistindo
                </span>
              </div>

              {/* Barra de Progresso Visual */}
              <div className="w-full h-2 rounded-full bg-surface-overlay overflow-hidden border border-stroke-subtle">
                <div
                  className="h-full bg-gradient-to-r from-accent to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Botão de Avanço Rápido Tátil (WCAG 2.2 AA >= 44x44px) */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={isUpdating}
                  className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{isUpdating ? 'Salvando...' : '+1 Episódio'}</span>
                </button>

                <Link
                  href={`/items/${defaultSlug}`}
                  className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised text-[var(--color-text-primary)] border border-stroke-subtle font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-[0.98]"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-stroke-subtle flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Criar Conta Gratuita</span>
              </Link>
              <Link
                href="/explore"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised text-[var(--color-text-primary)] border border-stroke-subtle font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-[0.98]"
              >
                Explorar Catálogo
              </Link>
            </div>
          )}
        </div>

        {/* Lado Direito: Capa em Cartão 2:3 Editorial */}
        <div className="shrink-0 w-44 sm:w-52 lg:w-56 aspect-[2/3] rounded-xl overflow-hidden border border-stroke-subtle shadow-2xl relative group">
          <img
            src={defaultCoverUrl}
            alt={`Capa de ${defaultTitle}`}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-[11px] font-medium text-white/90">
              Próxima Meta: <strong className="text-accent">Episódio {currentProgress + 1}</strong>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

