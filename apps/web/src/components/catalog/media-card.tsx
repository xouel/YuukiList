'use client';

import React, { useState, useEffect } from 'react';
import type { MediaItemSummaryDto, ConsumptionStatus } from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import { LibraryApiClient } from '../../services/library-api.client.ts';

interface MediaCardProps {
  item: MediaItemSummaryDto;
  isInLibrary?: boolean;
  onNavigate?: (slug: string) => void;
  onQuickAdd?: (item: MediaItemSummaryDto) => Promise<void> | void;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  DORAMA: 'Doramas',
  FILME: 'Filmes',
  ANIME: 'Animes',
  MANGA: 'Mangás',
  MANHWA: 'Manhwas',
  MANHUA: 'Manhuas',
};

// Paleta Editorial Bimodal / Categoria
const CATEGORY_COLORS: Record<string, string> = {
  // Audiovisual (Ocre #D4A373 e Lavanda #9D8DF1)
  DORAMA: 'bg-[#D4A373]/15 text-[#D4A373] border-[#D4A373]/30',
  FILME: 'bg-[#D4A373]/15 text-[#D4A373] border-[#D4A373]/30',
  ANIME: 'bg-[#9D8DF1]/15 text-[#9D8DF1] border-[#9D8DF1]/30',
  // Impresso (Terracota #D97757)
  MANGA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
  MANHWA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
  MANHUA: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
};

// Taxonomia Desambiguada do Status da Obra
const STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em Lançamento',
  FINALIZADA: 'Concluída',
  CANCELADA: 'Cancelada',
  HIATO: 'Hiato',
  DESCONHECIDA: 'Desconhecida',
};

const libraryApi = new LibraryApiClient();

function getDefaultStatusForCategory(category: string): ConsumptionStatus {
  switch (category) {
    case 'FILME':
      return 'QUERO_ASSISTIR';
    case 'MANGA':
    case 'MANHWA':
    case 'MANHUA':
      return 'LENDO';
    case 'DORAMA':
    case 'ANIME':
    default:
      return 'ASSISTINDO';
  }
}

export function MediaCard({ item, isInLibrary: initialIsInLibrary = false, onNavigate, onQuickAdd }: MediaCardProps) {
  const { isAuthenticated } = useAuth();
  const [isInLibrary, setIsInLibrary] = useState<boolean>(initialIsInLibrary);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setIsInLibrary(initialIsInLibrary);
  }, [initialIsInLibrary]);

  const categoryName = CATEGORY_DISPLAY_NAMES[item.category] || item.category;
  const categoryClass = CATEGORY_COLORS[item.category] || 'bg-[#1A1820] text-[#9C96A2] border-[#2B2735]';
  const statusLabel = STATUS_LABELS[item.publicationStatus] || item.publicationStatus;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(item.slug);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInLibrary || isSubmitting) return;

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnTo=${returnUrl}`;
      }
      return;
    }

    try {
      setIsSubmitting(true);
      // Otimista
      setIsInLibrary(true);

      if (onQuickAdd) {
        await onQuickAdd(item);
      } else {
        const defaultStatus = getDefaultStatusForCategory(item.category);
        await libraryApi.addItem({
          mediaItemId: item.id,
          status: defaultStatus,
        });
      }
    } catch {
      // Reverte estado se falhar
      setIsInLibrary(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="group relative bg-[#1A1820] rounded-xl overflow-hidden border border-[#2B2735] hover:border-[#E05347]/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col h-full">
      {/* Capa com Proporção 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121115]">
        <img
          src={item.coverUrl}
          alt={`Capa de ${item.title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge de Categoria Editorial */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`text-[10px] font-medium tracking-wide px-2 py-0.5 rounded border backdrop-blur shadow-sm ${categoryClass}`}>
            {categoryName}
          </span>
        </div>

        {/* Badge Dedicado de Status de Publicação da Obra sobre a Capa (Anti-Colisão) */}
        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/75 text-[#F4EFEA] border border-white/10 backdrop-blur shadow-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.publicationStatus === 'EM_ANDAMENTO'
                  ? 'bg-emerald-400'
                  : item.publicationStatus === 'FINALIZADA'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            {statusLabel}
          </span>
        </div>

        {/* Botão de Ação Rápida (quick-add / na biblioteca) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isInLibrary ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-[#E05347] text-white shadow-md backdrop-blur border border-[#E05347]/50"
              title="Obra adicionada à sua biblioteca"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Na Biblioteca</span>
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={isSubmitting}
              className="quick-add p-1.5 rounded-lg bg-black/70 hover:bg-[#E05347] text-white hover:text-white border border-white/20 hover:border-[#E05347] transition-all backdrop-blur shadow-md hover:scale-110 active:scale-95"
              aria-label={`Adicionar ${item.title} à biblioteca`}
              title="Adicionar à biblioteca rapidamente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-serif font-medium text-base text-[#F4EFEA] line-clamp-1 group-hover:text-[#E05347] transition-colors">
            <a
              href={`/items/${item.slug}`}
              onClick={handleClick}
              className="focus-visible:ring-2 focus-visible:ring-[#E05347] rounded outline-none after:absolute after:inset-0 after:z-0"
            >
              {item.title}
            </a>
          </h3>

          {item.originalTitle && (
            <p className="text-xs text-[#9C96A2] line-clamp-1 mt-0.5 opacity-70 font-light" title={item.originalTitle}>
              {item.originalTitle}
            </p>
          )}
        </div>

        {/* Metadados: Gêneros em Largura Total Livre de Colisão */}
        <div className="pt-2 border-t border-[#2B2735] flex items-center text-xs text-[#9C96A2]">
          <span className="truncate w-full font-light" title={item.genres.join(', ')}>
            {item.genres.length > 0 ? item.genres.slice(0, 3).join(' • ') : 'Geral'}
          </span>
        </div>
      </div>
    </article>
  );
}
