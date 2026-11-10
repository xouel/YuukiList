'use client';

import React from 'react';
import Link from 'next/link';
import type { ProfileStatsDto } from '@yuukilist/shared';

interface FavoritesShowcaseProps {
  favorites: ProfileStatsDto['favorites'];
}

export function FavoritesShowcase({ favorites }: FavoritesShowcaseProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <span className="text-rose-500">♥</span> Vitrine de Favoritos
        </h2>
        <span className="text-xs text-zinc-500 font-medium">
          {favorites.length} {favorites.length === 1 ? 'título' : 'títulos'}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 text-center space-y-2">
          <span className="text-3xl block text-zinc-600">♥</span>
          <p className="text-sm font-semibold text-zinc-300">
            Você ainda não favoritou nenhuma obra
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Clique no ícone de coração nos cards do catálogo ou na biblioteca para destacar suas obras prediletas aqui no seu perfil.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {favorites.map((item) => (
            <Link
              key={item.mediaItemId}
              href={`/items/${item.slug}`}
              className="group relative rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 overflow-hidden flex flex-col transition-all hover:scale-[1.02]"
            >
              <div className="aspect-[3/4] w-full bg-zinc-800 overflow-hidden relative">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-1.5 right-1.5 text-rose-500 drop-shadow">
                  ♥
                </span>
                {item.rating && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    ★ {item.rating}
                  </span>
                )}
              </div>

              <div className="p-2.5 space-y-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-cyan-400 transition-colors">
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

