'use client';

import React, { useMemo } from 'react';
import type { CalendarEvent } from '@yuukilist/shared';
import { EventCard } from './event-card';
import { groupEventsByShift } from './calendar-helpers';

interface DayGroupProps {
  dateString: string; // "YYYY-MM-DD"
  events: CalendarEvent[];
}

export function DayGroup({ dateString, events }: DayGroupProps) {
  const formattedHeader = useMemo(() => {
    try {
      const parts = dateString.split('-');
      if (parts.length !== 3) return dateString;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      const today = new Date();
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      const formatted = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(date);

      // Capitalize first letter
      const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      return isToday ? `Hoje • ${capitalized}` : capitalized;
    } catch {
      return dateString;
    }
  }, [dateString]);

  const shiftGroups = useMemo(() => {
    return groupEventsByShift(events);
  }, [events]);

  return (
    <section className="space-y-4" aria-labelledby={`day-heading-${dateString}`}>
      {/* Cabeçalho do Dia */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2735]">
        <h3
          id={`day-heading-${dateString}`}
          className="text-base font-serif font-bold text-[#F4EFEA] tracking-tight flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#E05347]" />
          {formattedHeader}
        </h3>
        <span className="text-xs font-mono text-zinc-400 font-medium">
          {events.length} {events.length === 1 ? 'lançamento' : 'lançamentos'}
        </span>
      </div>

      {/* Agrupamento por Turnos do Dia (Manhã, Tarde, Noite) */}
      <div className="space-y-5">
        {shiftGroups.length > 0 ? (
          shiftGroups.map((group) => (
            <div key={group.shift} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-sm bg-zinc-600" />
                <span>{group.label}</span>
                <span className="text-zinc-600 font-normal">({group.timeRange})</span>
                <span className="text-zinc-500 font-mono text-[11px] ml-auto">
                  {group.events.length} {group.events.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
