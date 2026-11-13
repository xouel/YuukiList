'use client';

import React from 'react';
import Link from 'next/link';
import type { MediaItemSummaryDto } from '../../../../../packages/shared/src/index.ts';

interface TrendingShowcaseProps {
  items: MediaItemSummaryDto[];
  onQuickAdd?: (item: MediaItemSummaryDto) => void;
}

export function TrendingShowcase({ items }: TrendingShowcaseProps) {
  // Obras de exemplo se a lista estiver vazia
  const displayItems =
    items.length > 0
      ? items.slice(0, 4)
      : [
          {
            id: 'dungeon-meshi',
            slug: 'dungeon-meshi',
            title: 'Dungeon Meshi',
            category: 'ANIME',
            publicationStatus: 'FINALIZADA',
            coverUrl: '/api/v1/catalog/items/frieren-beyond-journey-s-end/cover',
            genres: ['Fantasia', 'Culinária'],
          },
          {
            id: 'rainha-das-lagrimas',
            slug: 'rainha-das-lagrimas',
            title: 'Rainha das Lágrimas',
            category: 'DORAMA',
            publicationStatus: 'FINALIZADA',
            coverUrl: '/api/v1/catalog/items/crash-landing-on-you/cover',
            genres: ['Romance', 'Drama'],
          },
          {
            id: 'kagurabachi',
            slug: 'kagurabachi',
            title: 'Kagurabachi',
            category: 'MANGA',
            publicationStatus: 'EM_ANDAMENTO',
            coverUrl: '/api/v1/catalog/items/one-piece/cover',
            genres: ['Ação', 'Sobrenatural'],
          },
        ];

  return (
    <section aria-label="Tendências e Recomendações" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-amber-500" />
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Tendências & Recomendações da Temporada
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-light">
            Baseado nos títulos mais aclamados e favoritos da comunidade oriental
          </p>
        </div>

        <Link
          href="/explore"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>Ver Todas</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayItems.map((item) => (
          <article
            key={item.id}
            className="p-3.5 rounded-2xl bg-surface-raised border border-stroke-subtle hover:border-stroke-accent transition-all group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-canvas border border-stroke-subtle">
              <img
                src={item.coverUrl}
                alt={`Capa de ${item.title}`}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 backdrop-blur text-white border border-white/10 uppercase">
                  {item.category}
                </span>
              </div>
            </div>

            <div>
              <Link href={`/items/${item.slug}`} className="group-hover:text-accent transition-colors">
                <h4 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{item.title}</h4>
              </Link>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-light truncate mt-0.5">
                {item.genres ? item.genres.join(' • ') : 'Gêneros em destaque'}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

