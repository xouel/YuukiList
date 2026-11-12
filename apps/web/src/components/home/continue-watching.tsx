'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { LibraryItemDto } from '../../../../../packages/shared/src/index.ts';

interface ContinueWatchingProps {
  items: LibraryItemDto[];
  isAuthenticated: boolean;
  onQuickIncrement: (mediaItemId: string, nextProgress: number) => Promise<void>;
}

export function ContinueWatching({
  items,
  isAuthenticated,
  onQuickIncrement,
}: ContinueWatchingProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtra apenas obras ativas (ASSISTINDO ou LENDO)
  const activeItems = items.filter(
    (item) => item.status === 'ASSISTINDO' || item.status === 'LENDO'
  );

  const handleIncrement = async (item: LibraryItemDto) => {
    if (updatingId) return;
    try {
      setUpdatingId(item.id);
      await onQuickIncrement(item.mediaItemId, item.progress + 1);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section aria-label="Continuar Acompanhando" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-accent" />
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Continuar Acompanhando
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-light">
            Seus registros em andamento prontos para marcação rápida
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-sunken text-[var(--color-text-secondary)] border border-stroke-subtle">
          {activeItems.length} {activeItems.length === 1 ? 'Obra Ativa' : 'Obras Ativas'}
        </span>
      </div>

      {activeItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-surface-raised border border-stroke-subtle text-center space-y-2">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Você não possui nenhuma obra marcada como "Assistindo" ou "Lendo" no momento.
          </p>
          <Link
            href="/explore"
            className="inline-block text-xs font-semibold text-accent hover:underline"
          >
            Explorar catálogo e iniciar uma obra →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) => {
            const media = item.mediaItem;
            const title = media?.title || 'Obra em Acompanhamento';
            const totalUnits = (media as any)?.totalEpisodes || (media as any)?.totalChapters || null;
            const progress = item.progress;
            const percent = totalUnits ? Math.min(100, Math.round((progress / totalUnits) * 100)) : null;
            const unitLabel = item.status === 'LENDO' ? 'Cap.' : 'Ep.';
            const isBusy = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-raised border border-stroke-subtle hover:border-stroke-accent transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm"
              >
                {/* Miniatura da Capa e Título */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-surface-canvas border border-stroke-subtle shrink-0">
                    {media?.coverUrl ? (
                      <img
                        src={media.coverUrl}
                        alt={`Capa de ${title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-muted)]">
                        Sem capa
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-sunken text-[var(--color-text-secondary)] border border-stroke-subtle">
                        {media?.category || 'MÍDIA'}
                      </span>
                      {item.isFavorite && (
                        <span className="text-xs text-rose-500" title="Favorito">
                          ♥
                        </span>
                      )}
                    </div>

                    <Link
                      href={media?.slug ? `/items/${media.slug}` : `/library`}
                      className="font-semibold text-sm text-[var(--color-text-primary)] hover:text-accent transition-colors truncate block mt-0.5"
                    >
                      {title}
                    </Link>

                    <p className="text-xs text-[var(--color-text-secondary)] font-light mt-0.5">
                      {unitLabel} {progress} {totalUnits ? `de ${totalUnits}` : ''}
                      {percent !== null && <span className="ml-2 text-accent font-medium">({percent}%)</span>}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso e Ação de Avanço Rápido */}
                <div className="w-full sm:w-auto flex items-center gap-4 shrink-0 sm:ml-auto">
                  {percent !== null && (
                    <div className="hidden md:block w-32 h-1.5 rounded-full bg-surface-sunken overflow-hidden border border-stroke-subtle">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleIncrement(item)}
                    disabled={isBusy}
                    title={`Marcar ${unitLabel} ${progress + 1}`}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-surface-overlay hover:bg-accent text-[var(--color-text-primary)] hover:text-white border border-stroke-subtle hover:border-accent font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 ml-auto cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{isBusy ? 'Salvando...' : `+1 ${unitLabel} (Marcar ${progress + 1})`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

