'use client';

import React from 'react';
import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';

interface ItemDetailViewProps {
  item: MediaItemDetailDto;
  onBack: () => void;
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
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  HIATO: 'Hiato',
  DESCONHECIDA: 'Desconhecida',
};

export function ItemDetailView({ item, onBack }: ItemDetailViewProps) {
  const categoryClass = CATEGORY_COLORS[item.category] || 'bg-gray-800 text-gray-300 border-gray-700';
  const statusLabel = STATUS_LABELS[item.publicationStatus] || item.publicationStatus;

  return (
    <div className="w-full space-y-6">
      {/* Botão Voltar */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#181C2B] hover:bg-[#1F2438] border border-[#262C3F] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o catálogo
        </button>
      </div>

      {/* Grid Principal da Obra */}
      <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-[#121520] border border-[#262C3F] rounded-2xl p-6 sm:p-8">
        {/* Coluna da Capa */}
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden border border-[#262C3F] shadow-2xl bg-[#181C2B]">
            <img
              src={item.coverUrl}
              alt={`Capa oficial de ${item.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Coluna de Detalhes e Sinopse */}
        <div className="md:col-span-2 lg:col-span-3 space-y-5">
          {/* Cabeçalho */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${categoryClass}`}>
                {item.category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                {statusLabel}
              </span>
              {item.releaseYear && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                  {item.releaseYear}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6]">
              {item.title}
            </h1>

            {item.originalTitle && (
              <p className="text-sm sm:text-base text-[#9CA3AF] font-light mt-1">
                {item.originalTitle}
              </p>
            )}
          </div>

          {/* Sinopse */}
          {item.synopsis && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Sinopse
              </h2>
              <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed">
                {item.synopsis}
              </p>
            </div>
          )}

          {/* Gêneros */}
          {item.genres && item.genres.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                Gêneros
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#181C2B] text-[#F3F4F6] border border-[#262C3F]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Títulos Alternativos / Aliases */}
          {item.aliases && item.aliases.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#262C3F]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Títulos Alternativos
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {item.aliases.join(' • ')}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

