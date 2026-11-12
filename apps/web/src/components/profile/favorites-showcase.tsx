'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ProfileStatsDto } from '@yuukilist/shared';

interface FavoritesShowcaseProps {
  favorites: ProfileStatsDto['favorites'];
  onToggleFavorite?: (mediaItemId: string) => Promise<void> | void;
}

export function FavoritesShowcase({ favorites, onToggleFavorite }: FavoritesShowcaseProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUnfavorite = async (e: React.MouseEvent, mediaItemId: string) => {
    if (!onToggleFavorite) return;
    e.preventDefault();
    e.stopPropagation();
    if (updatingId === mediaItemId) return;
    try {
      setUpdatingId(mediaItemId);
      await onToggleFavorite(mediaItemId);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="favorites-showcase-heading">
      {/* Cabeçalho da Vitrine */}
      <div className="flex items-center justify-between pb-2 border-b border-stroke-subtle">
        <h2
          id="favorites-showcase-heading"
          className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2.5 tracking-tight"
        >
          <span className="text-accent text-xl" aria-hidden="true">♥</span>
          Vitrine de Favoritos
        </h2>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] font-medium">
          {favorites.length} {favorites.length === 1 ? 'título selecionado' : 'títulos selecionados'}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl bg-surface-raised border border-stroke-subtle text-center space-y-3 shadow-hairline-top">
          <span className="text-3xl block text-accent/60" aria-hidden="true">♥</span>
          <p className="text-base font-serif font-bold text-[var(--color-text-primary)]">
            Você ainda não favoritou nenhuma obra
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Clique no ícone de coração nos cards da biblioteca ou no botão Favoritar no dossiê da obra para destacar seus títulos prediletos aqui.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-overlay border border-stroke-subtle text-[var(--color-text-primary)] hover:border-stroke-accent transition-colors shadow-sm cursor-pointer"
            >
              Minha Biblioteca
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {favorites.map((item) => (
            <Link
              key={item.mediaItemId}
              href={`/items/${item.slug}`}
              className="group relative rounded-xl bg-surface-raised border border-stroke-subtle hover:border-stroke-accent overflow-hidden flex flex-col transition-all hover:scale-[1.02] shadow-sm"
            >
              {/* Capa Editorial 2:3 */}
              <div className="aspect-[2/3] w-full bg-surface-sunken overflow-hidden relative">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  onError={(e) => {
                    const fallback = item.slug ? `/api/v1/catalog/items/${item.slug}/cover` : '/covers/fallback.svg';
                    if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {onToggleFavorite ? (
                  <button
                    type="button"
                    onClick={(e) => handleUnfavorite(e, item.mediaItemId)}
                    disabled={updatingId === item.mediaItemId}
                    title="Remover dos favoritos"
                    aria-label={`Remover ${item.title} dos favoritos`}
                    className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-lg bg-black/70 hover:bg-accent text-accent hover:text-white border border-accent/40 flex items-center justify-center backdrop-blur shadow-md transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none">♥</span>
                  </button>
                ) : (
                  <span className="absolute top-1.5 right-1.5 text-accent drop-shadow-md text-sm">
                    ♥
                  </span>
                )}
                {item.rating && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    ★ {item.rating}
                  </span>
                )}
              </div>

              {/* Informações da Obra */}
              <div className="p-2.5 space-y-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-sunken text-[var(--color-text-secondary)] uppercase tracking-wider border border-stroke-subtle">
                  {item.category}
                </span>
                <h3 className="text-xs font-serif font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
