'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@yuukilist/shared';
import { DateReliability, CalendarEventType } from '@yuukilist/shared';

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  const formattedTime = useMemo(() => {
    if (!event.scheduledAt) return '';
    try {
      if (!event.hasTime) {
        return 'Data confirmada';
      }
      const date = new Date(event.scheduledAt);
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  }, [event.scheduledAt, event.hasTime]);

  const eventTypeLabel = useMemo(() => {
    switch (event.type) {
      case CalendarEventType.SERIES_PREMIERE:
        return 'Estreia de Série';
      case CalendarEventType.SEASON_PREMIERE:
        return event.season ? `Estreia T${event.season}` : 'Nova Temporada';
      case CalendarEventType.EPISODE_RELEASE:
        return event.number ? `Episódio ${event.number}` : 'Novo Episódio';
      case CalendarEventType.CHAPTER_RELEASE:
        return event.number ? `Capítulo ${event.number}` : 'Novo Capítulo';
      case CalendarEventType.VOLUME_RELEASE:
        return event.number ? `Volume ${event.number}` : 'Novo Volume';
      case CalendarEventType.MOVIE_RELEASE:
        return 'Lançamento de Filme';
      case CalendarEventType.SPECIAL_RELEASE:
        return 'Especial / OVA';
      default:
        return 'Lançamento';
    }
  }, [event.type, event.number, event.season]);

  const reliabilityBadge = useMemo(() => {
    switch (event.reliability) {
      case DateReliability.CONFIRMED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            Confirmada
          </span>
        );
      case DateReliability.ESTIMATED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/70 text-amber-400 border border-amber-800/60">
            Data Estimada
          </span>
        );
      case DateReliability.UNCONFIRMED:
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
            Não Confirmada
          </span>
        );
    }
  }, [event.reliability]);

  return (
    <article
      data-testid={`calendar-event-${event.id}`}
      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/90 transition-all hover:bg-zinc-900/90 gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-750 flex items-center justify-center text-xs text-zinc-500 font-semibold shadow-inner">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.mediaTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span>YUUKI</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              {event.mediaType}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              {event.originRegion}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {eventTypeLabel}
            </span>
            {event.isUserTracking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                Acompanhando
              </span>
            )}
            {event.isUserPlanned && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/60">
                Na Agenda
              </span>
            )}
          </div>

          <Link
            href={`/items/${event.mediaSlug}`}
            className="block text-base font-semibold text-zinc-100 hover:text-cyan-400 transition-colors truncate"
          >
            {event.mediaTitle}
          </Link>

          {event.sourceName && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              Fonte: {event.sourceName}
            </p>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/60">
        {reliabilityBadge}
        {event.hasTime && formattedTime && (
          <span className="text-sm font-mono font-medium text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
            {formattedTime}
          </span>
        )}
      </div>
    </article>
  );
}

