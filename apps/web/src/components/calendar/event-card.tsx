'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@yuukilist/shared';
import { DateReliability } from '@yuukilist/shared';
import { formatEventTime, formatEventSubtitle } from './calendar-helpers';

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [isPlanned, setIsPlanned] = useState<boolean>(Boolean(event.isUserPlanned));

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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-400/90 border border-emerald-800/40">
            Confirmada
          </span>
        );
      case DateReliability.ESTIMATED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-400/90 border border-amber-800/40">
            Data Estimada
          </span>
        );
      case DateReliability.UNCONFIRMED:
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1F1C27] text-zinc-400 border border-[#2B2735]">
            Não Confirmada
          </span>
        );
    }
  }, [event.reliability]);

  return (
    <article
      data-testid={`calendar-event-${event.id}`}
      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] hover:border-[#3B3647] transition-all hover:bg-[#1E1B25] gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Capa */}
        <Link
          href={`/items/${event.mediaSlug}`}
          className="w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#24202C] border border-[#2B2735] flex items-center justify-center text-xs text-zinc-500 font-semibold shadow-inner"
        >
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.mediaTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] tracking-wider text-zinc-500">YUUKI</span>
          )}
        </Link>

        {/* Dados Principais Despoluídos */}
        <div className="min-w-0 flex-1">
          {/* Linha de Horário e Honestidade */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-[#E05347] bg-[#E05347]/10 px-2 py-0.5 rounded border border-[#E05347]/20">
              {formattedTime}
            </span>
            {reliabilityBadge}
            {event.isUserTracking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#262135] text-purple-300 border border-purple-800/40">
                Acompanhando
              </span>
            )}
          </div>

          {/* Título Editorial */}
          <Link
            href={`/items/${event.mediaSlug}`}
            className="block text-base font-serif font-bold text-[#F4EFEA] hover:text-[#E05347] transition-colors truncate"
          >
            {event.mediaTitle}
          </Link>

          {/* Subtítulo Despoluído */}
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {subtitle}
            {event.sourceName && (
              <span className="text-zinc-500 ml-2">Fonte: {event.sourceName}</span>
            )}
          </p>
        </div>
      </div>

      {/* Bloco Lateral: Ação Rápida de Lembrar/Seguir */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#2B2735]">
        <button
          type="button"
          aria-label={isPlanned ? 'Remover da agenda' : 'Lembrar lançamento na agenda'}
          onClick={() => setIsPlanned(!isPlanned)}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlanned
              ? 'bg-[#E05347]/20 text-[#E05347] border border-[#E05347]/40 hover:bg-[#E05347]/30'
              : 'bg-[#24202C] text-zinc-300 border border-[#2B2735] hover:border-[#3B3647] hover:text-[#F4EFEA]'
          }`}
        >
          <span>{isPlanned ? '✓ Na Agenda' : '🔔 Lembrar'}</span>
        </button>
      </div>
    </article>
  );
}
