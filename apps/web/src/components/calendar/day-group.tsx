'use client';

import React, { useMemo } from 'react';
import type { CalendarEvent } from '@yuukilist/shared';
import { EventCard } from './event-card';

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

  return (
    <section className="space-y-3" aria-labelledby={`day-heading-${dateString}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
        <h3
          id={`day-heading-${dateString}`}
          className="text-sm font-semibold text-zinc-300 tracking-wide flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          {formattedHeader}
        </h3>
        <span className="text-xs text-zinc-500 font-medium">
          {events.length} {events.length === 1 ? 'lançamento' : 'lançamentos'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

