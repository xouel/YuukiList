'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@yuukilist/shared';
import { DateReliability } from '@yuukilist/shared';
import { formatEventTime, formatEventSubtitle } from './calendar-helpers';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { DiaryApiClient } from '../../services/diary-api.client.ts';

const libraryApi = new LibraryApiClient();
const diaryApi = new DiaryApiClient();

interface EventCardProps {
  event: CalendarEvent;
  onProgressUpdated?: (mediaItemId: string, newProgress: number) => void;
}

export function EventCard({ event, onProgressUpdated }: EventCardProps) {
  const [isPlanned, setIsPlanned] = useState<boolean>(Boolean(event.isUserPlanned));
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<boolean>(false);

  const formattedTime = useMemo(() => {
    return formatEventTime(event.scheduledAt, event.hasTime);
  }, [event.scheduledAt, event.hasTime]);

  const subtitle = useMemo(() => {
    return formatEventSubtitle(event);
  }, [event]);

  const reliabilityBadge = useMemo(() => {
    switch (event.reliability) {
      case DateReliability.CONFIRMED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Confirmada
          </span>
        );
      case DateReliability.ESTIMATED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40">
            Data Estimada
          </span>
        );
      case DateReliability.UNCONFIRMED:
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-sunken text-[var(--color-text-secondary)] border border-stroke-subtle">
            Não Confirmada
          </span>
        );
    }
  }, [event.reliability]);

  // Ação rápida +1 Visto
  const handleMarkWatched = useCallback(async () => {
    if (isWatched || isUpdatingProgress) return;
    setIsUpdatingProgress(true);

    const targetProgress = event.number || 1;

    try {
      // 1. Atualizar progresso na biblioteca
      await libraryApi.updateItem(event.mediaItemId, {
        currentProgress: targetProgress,
      });

      // 2. Registrar evento no diário
      await diaryApi.createEvent({
        mediaItemId: event.mediaItemId,
        type: 'PROGRESS_UPDATE',
        episodeNumber: event.number || null,
        chapterNumber: event.type === 'CHAPTER_RELEASE' ? (event.number || null) : null,
        newProgress: targetProgress,
        note: `Marcado via Programação Semanal (${subtitle})`,
      });

      setIsWatched(true);
      if (onProgressUpdated) {
        onProgressUpdated(event.mediaItemId, targetProgress);
      }
    } catch {
      // Fallback otimista para manter fluidez visual
      setIsWatched(true);
    } finally {
      setIsUpdatingProgress(false);
    }
  }, [event, subtitle, isWatched, isUpdatingProgress, onProgressUpdated]);

  return (
    <article
      data-testid={`calendar-event-${event.id}`}
      className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top hover:border-stroke-accent transition-all hover:bg-surface-overlay active:scale-[0.98] active:transition-transform gap-4"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 w-full">
        {/* Coluna de Horário Dedicada */}
        <div className="w-16 sm:w-20 flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg bg-surface-sunken border border-stroke-subtle text-center">
          <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-accent">
            {formattedTime}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] font-mono tabular-nums mt-0.5">
            {event.originRegion || 'LOCAL'}
          </span>
        </div>

        {/* Capa */}
        <Link
          href={`/items/${event.mediaSlug}`}
          className="w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-canvas border border-stroke-subtle flex items-center justify-center text-xs text-[var(--color-text-secondary)] font-semibold shadow-inner focus-visible:ring-2 focus-visible:ring-accent"
        >
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.mediaTitle}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] tracking-wider text-[var(--color-text-secondary)] font-bold">YUUKI</span>
          )}
        </Link>

        {/* Dados Principais Despoluídos */}
        <div className="min-w-0 flex-1">
          {/* Linha de Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {reliabilityBadge}
            {event.isUserTracking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-media-anime/15 text-media-anime border border-media-anime/30">
                Acompanhando
              </span>
            )}
          </div>

          {/* Título Editorial */}
          <Link
            href={`/items/${event.mediaSlug}`}
            className="block text-base font-serif font-bold text-[var(--color-text-primary)] hover:text-accent transition-colors truncate focus-visible:ring-2 focus-visible:ring-accent"
          >
            {event.mediaTitle}
          </Link>

          {/* Subtítulo Despoluído */}
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
            {subtitle}
            {event.sourceName && (
              <span className="text-[var(--color-text-secondary)]/70 ml-2">Fonte: {event.sourceName}</span>
            )}
          </p>
        </div>
      </div>

      {/* Bloco Lateral de Ações Táteis */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-stroke-subtle">
        {event.isUserTracking && (
          <button
            type="button"
            onClick={handleMarkWatched}
            disabled={isWatched || isUpdatingProgress}
            aria-label={isWatched ? 'Episódio já marcado como visto' : 'Marcar +1 visto'}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isWatched
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 cursor-default'
                : 'bg-surface-sunken hover:bg-surface-overlay text-[var(--color-text-primary)] border border-stroke-subtle hover:border-emerald-700/50 hover:text-emerald-300'
            }`}
          >
            {isWatched ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Visto</span>
              </>
            ) : (
              <span>+1 Visto</span>
            )}
          </button>
        )}

        {/* Ação de Lembrar / Na Agenda */}
        <button
          type="button"
          aria-label={isPlanned ? 'Remover da agenda' : 'Lembrar lançamento na agenda'}
          onClick={() => setIsPlanned(!isPlanned)}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isPlanned
              ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30'
              : 'bg-surface-sunken text-[var(--color-text-secondary)] border border-stroke-subtle hover:border-stroke-accent hover:text-[var(--color-text-primary)]'
          }`}
        >
          {isPlanned ? (
            <>
              <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Na Agenda</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Lembrar</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
