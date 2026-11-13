'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import type {
  Category,
  MediaItemSummaryDto,
  LibraryItemDto,
} from '../../../../../packages/shared/src/index.ts';

interface HeroSpotlightProps {
  featuredByCategory?: MediaItemSummaryDto[];
  media?: MediaItemSummaryDto | null;
  libraryItem?: LibraryItemDto | null;
  libraryItems?: LibraryItemDto[];
  isAuthenticated: boolean;
  onQuickIncrement?: (mediaItemId: string, nextProgress: number) => Promise<void>;
}

const HERO_CATEGORY_TABS: Array<{ key: Category; label: string }> = [
  { key: 'DORAMA', label: 'Doramas' },
  { key: 'FILME', label: 'Filmes' },
  { key: 'ANIME', label: 'Animes' },
  { key: 'MANGA', label: 'Mangás' },
  { key: 'MANHWA', label: 'Manhwas' },
  { key: 'MANHUA', label: 'Manhuas' },
];

export function HeroSpotlight({
  featuredByCategory = [],
  media,
  libraryItem,
  libraryItems = [],
  isAuthenticated,
  onQuickIncrement,
}: HeroSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const dragStartXRef = useRef<number | null>(null);

  const slides = useMemo<MediaItemSummaryDto[]>(() => {
    if (featuredByCategory.length > 0) {
      const byCategory = new Map<string, MediaItemSummaryDto>();
      for (const item of featuredByCategory) {
        if (!byCategory.has(item.category)) {
          byCategory.set(item.category, item);
        }
      }
      const ordered = HERO_CATEGORY_TABS.map((tab) => byCategory.get(tab.key)).filter(
        (item): item is MediaItemSummaryDto => Boolean(item)
      );
      if (ordered.length > 0) return ordered;
    }
    return media ? [media] : [];
  }, [featuredByCategory, media]);

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const activeMedia = slides[safeIndex] ?? null;

  const matchedLibraryItem = activeMedia
    ? libraryItems.find((item) => item.mediaItemId === activeMedia.id) ||
      (libraryItem?.mediaItemId === activeMedia.id ? libraryItem : null)
    : libraryItem || null;

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSwipeStart = (clientX: number) => {
    dragStartXRef.current = clientX;
  };

  const handleSwipeEnd = (clientX: number) => {
    if (dragStartXRef.current === null || slides.length <= 1) {
      dragStartXRef.current = null;
      return;
    }
    const deltaX = clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const activeCategory: string = activeMedia?.category || 'ANIME';
  const isReading =
    activeCategory === 'MANGA' || activeCategory === 'MANHWA' || activeCategory === 'MANHUA';
  const unitSingular = isReading ? 'Capítulo' : 'Episódio';

  const displayTitle = activeMedia?.title || 'Recomendações por Categoria';
  const displaySynopsis =
    (activeMedia as any)?.synopsis ||
    'Explore os títulos mais bem avaliados do catálogo oriental organizados por categoria para iniciar ou continuar sua jornada.';
  const displaySlug = activeMedia?.slug || '';
  const displayCoverUrl =
    activeMedia?.coverUrl ||
    (displaySlug ? `/api/v1/catalog/items/${displaySlug}/cover` : '/favicon.ico');
  const displayRating = (activeMedia as any)?.rating;

  const currentProgress = matchedLibraryItem ? matchedLibraryItem.progress : 0;
  const totalUnits = isReading
    ? (activeMedia as any)?.totalChapters || 120
    : (activeMedia as any)?.totalEpisodes || 12;
  const progressPercent = Math.min(100, Math.round((currentProgress / totalUnits) * 100));

  const handleIncrement = async () => {
    if (!onQuickIncrement || !matchedLibraryItem || isUpdating) return;
    try {
      setIsUpdating(true);
      await onQuickIncrement(matchedLibraryItem.mediaItemId, currentProgress + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article
      aria-label="Destaque Editorial por Categoria"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }}
      onPointerDown={(e) => handleSwipeStart(e.clientX)}
      onPointerUp={(e) => handleSwipeEnd(e.clientX)}
      onPointerCancel={() => {
        dragStartXRef.current = null;
      }}
      onTouchStart={(e) => {
        if (e.touches[0]) handleSwipeStart(e.touches[0].clientX);
      }}
      onTouchEnd={(e) => {
        if (e.changedTouches[0]) handleSwipeEnd(e.changedTouches[0].clientX);
      }}
      className="relative overflow-hidden rounded-2xl bg-surface-raised border border-stroke-subtle p-6 sm:p-8 shadow-hairline-top touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Barra de Seleção por Categoria e Setas do Carrossel */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-stroke-subtle">
        <div
          role="tablist"
          aria-label="Recomendação por categoria"
          className="flex flex-wrap items-center gap-1.5"
        >
          {HERO_CATEGORY_TABS.map((tab) => {
            const slideIdx = slides.findIndex((s) => s.category === tab.key);
            const hasSlide = slideIdx !== -1;
            const isSelected = activeMedia ? activeMedia.category === tab.key : tab.key === 'DORAMA';

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                disabled={!hasSlide}
                onClick={() => {
                  if (hasSlide) setActiveIndex(slideIdx);
                }}
                className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface-overlay text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-stroke-subtle'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={slides.length <= 1}
            aria-label="Slide anterior"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-surface-overlay hover:bg-surface-sunken text-[var(--color-text-primary)] border border-stroke-subtle transition-colors disabled:opacity-40 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={slides.length <= 1}
            aria-label="Próximo slide"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-surface-overlay hover:bg-surface-sunken text-[var(--color-text-primary)] border border-stroke-subtle transition-colors disabled:opacity-40 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 sm:gap-8">
        {/* Lado Esquerdo: Metadados, Título, Sinopse e Controles de Progresso */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Metadados Editoriais Superiores */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {activeCategory}
              </span>
              {activeMedia?.releaseYear && (
                <>
                  <span className="text-[var(--color-text-muted)] text-xs">•</span>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {activeMedia.releaseYear}
                  </span>
                </>
              )}
              {typeof displayRating === 'number' && displayRating > 0 && (
                <>
                  <span className="text-[var(--color-text-muted)] text-xs">•</span>
                  <span className="text-xs tabular-nums font-semibold text-amber-400 flex items-center gap-1">
                    ★ {displayRating.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {displaySlug ? (
              <Link href={`/items/${displaySlug}`} className="group inline-block">
                <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-accent transition-colors">
                  {displayTitle}
                </h2>
              </Link>
            ) : (
              <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
                {displayTitle}
              </h2>
            )}

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2 line-clamp-3 font-light max-w-xl">
              {displaySynopsis}
            </p>
          </div>

          {/* Área de Ação e Progresso */}
          {isAuthenticated ? (
            matchedLibraryItem ? (
              <div className="pt-2 border-t border-stroke-subtle space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[var(--color-text-secondary)]">
                    Seu Progresso Atual:{' '}
                    <strong className="text-[var(--color-text-primary)]">
                      {unitSingular} {currentProgress} de {totalUnits} ({progressPercent}%)
                    </strong>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold">
                    {isReading ? 'Lendo' : 'Assistindo'}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>{isUpdating ? 'Salvando...' : isReading ? '+1 Capítulo' : '+1 Episódio'}</span>
                  </button>

                  {displaySlug && (
                    <Link
                      href={`/items/${displaySlug}`}
                      className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised text-[var(--color-text-primary)] border border-stroke-subtle font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-[0.98]"
                    >
                      Ver Detalhes
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-stroke-subtle flex flex-wrap items-center gap-3">
                <Link
                  href={displaySlug ? `/items/${displaySlug}` : '/explore'}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Adicionar à Lista</span>
                </Link>
                {displaySlug && (
                  <Link
                    href={`/items/${displaySlug}`}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised text-[var(--color-text-primary)] border border-stroke-subtle font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-[0.98]"
                  >
                    Ver Detalhes
                  </Link>
                )}
              </div>
            )
          ) : (
            <div className="pt-2 border-t border-stroke-subtle flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Criar Conta Gratuita</span>
              </Link>
              <Link
                href={displaySlug ? `/items/${displaySlug}` : '/explore'}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised text-[var(--color-text-primary)] border border-stroke-subtle font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-[0.98]"
              >
                Explorar Catálogo
              </Link>
            </div>
          )}
        </div>

        {/* Lado Direito: Capa em Cartão 2:3 Editorial */}
        {displaySlug && (
          <div className="shrink-0 w-44 sm:w-52 lg:w-56 aspect-[2/3] rounded-xl overflow-hidden border border-stroke-subtle shadow-2xl relative group">
            <img
              src={displayCoverUrl}
              alt={`Capa de ${displayTitle}`}
              onError={(e) => {
                const fallback = `/api/v1/catalog/items/${displaySlug}/cover`;
                if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                  e.currentTarget.src = fallback;
                }
              }}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] font-medium text-white/90">
                Próxima Meta:{' '}
                <strong className="text-accent">
                  {unitSingular} {currentProgress + 1}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Indicadores de Posição no Rodapé do Carrossel */}
      {slides.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || `${slide.category}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Selecionar recomendação ${slide.category}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === safeIndex ? 'w-6 bg-accent' : 'w-2 bg-stroke-strong hover:bg-accent/60'
              }`}
            />
          ))}
        </div>
      )}
    </article>
  );
}
