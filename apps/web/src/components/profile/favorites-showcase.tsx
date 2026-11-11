'use client';

import React from 'react';
import Link from 'next/link';
import type { ProfileStatsDto } from '@yuukilist/shared';

interface FavoritesShowcaseProps {
  favorites: ProfileStatsDto['favorites'];
}

export function FavoritesShowcase({ favorites }: FavoritesShowcaseProps) {
  return (
    <section className="space-y-4" aria-labelledby="favorites-showcase-heading">
      {/* Cabeçalho da Vitrine */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2735]">
        <h2
          id="favorites-showcase-heading"
          className="text-lg sm:text-xl font-serif font-bold text-[#F4EFEA] flex items-center gap-2.5 tracking-tight"
        >
          <span className="text-[#E05347] text-xl" aria-hidden="true">♥</span>
          Vitrine de Favoritos
        </h2>
        <span className="text-xs font-mono text-zinc-400 font-medium">
          {favorites.length} {favorites.length === 1 ? 'título selecionado' : 'títulos selecionados'}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl bg-[#1A1820] border border-[#2B2735] text-center space-y-3">
          <span className="text-3xl block text-[#E05347]/60" aria-hidden="true">♥</span>
          <p className="text-base font-serif font-bold text-[#F4EFEA]">
            Você ainda não favoritou nenhuma obra
          </p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Clique no ícone de coração nos cards do catálogo ou na biblioteca para destacar seus doramas, animes e mangás prediletos no topo do seu perfil.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E05347] text-white hover:bg-[#E05347]/90 transition-colors shadow-sm cursor-pointer"
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {favorites.map((item) => (
            <Link
              key={item.mediaItemId}
              href={`/items/${item.slug}`}
              className="group relative rounded-xl bg-[#1A1820] border border-[#2B2735] hover:border-[#3B3647] overflow-hidden flex flex-col transition-all hover:scale-[1.02] shadow-sm"
            >
              {/* Capa Editorial 2:3 */}
              <div className="aspect-[2/3] w-full bg-[#24202C] overflow-hidden relative">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-1.5 right-1.5 text-[#E05347] drop-shadow-md text-sm">
                  ♥
                </span>
                {item.rating && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    ★ {item.rating}
                  </span>
                )}
              </div>

              {/* Informações da Obra */}
              <div className="p-2.5 space-y-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#24202C] text-zinc-300 uppercase tracking-wider border border-[#2B2735]">
                  {item.category}
                </span>
                <h3 className="text-xs font-serif font-bold text-[#F4EFEA] truncate group-hover:text-[#E05347] transition-colors">
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
