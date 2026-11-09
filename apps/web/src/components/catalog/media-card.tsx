'use client';

import React from 'react';
import type { MediaItemSummaryDto } from '../../../../../packages/shared/src/index.ts';

interface MediaCardProps {
  item: MediaItemSummaryDto;
  onNavigate?: (slug: string) => void;
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

export function MediaCard({ item, onNavigate }: MediaCardProps) {
  const categoryClass = CATEGORY_COLORS[item.category] || 'bg-gray-800 text-gray-300 border-gray-700';
  const statusLabel = STATUS_LABELS[item.publicationStatus] || item.publicationStatus;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(item.slug);
    }
  };

  return (
    <article className="group relative bg-[#181C2B] rounded-xl overflow-hidden border border-[#262C3F] hover:border-[#06B6D4]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#06B6D4]/5 flex flex-col h-full">
      {/* Capa com Proporção 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121520]">
        <img
          src={item.coverUrl}
          alt={`Capa de ${item.title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge de Categoria */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border backdrop-blur ${categoryClass}`}>
            {item.category}
          </span>
        </div>

        {/* Badge de Ano de Lançamento */}
        {item.releaseYear && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-gray-300 backdrop-blur">
              {item.releaseYear}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-semibold text-base text-[#F3F4F6] line-clamp-1 group-hover:text-[#06B6D4] transition-colors">
            <a
              href={`/items/${item.slug}`}
              onClick={handleClick}
              className="focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded outline-none after:absolute after:inset-0"
            >
              {item.title}
            </a>
          </h3>

          {item.originalTitle && (
            <p className="text-xs text-[#9CA3AF] line-clamp-1 mt-0.5 font-light" title={item.originalTitle}>
              {item.originalTitle}
            </p>
          )}
        </div>

        {/* Metadados: Gêneros e Status */}
        <div className="pt-2 border-t border-[#262C3F]/60 flex items-center justify-between text-xs text-[#9CA3AF]">
          <span className="truncate max-w-[140px]" title={item.genres.join(', ')}>
            {item.genres.slice(0, 2).join(', ')}
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            {statusLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
