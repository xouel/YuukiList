'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@yuukilist/shared';
import {
  formatDualTimezones,
  extractWeeklyHighlights,
  generateIcsCalendarContent,
} from './calendar-helpers';

interface CalendarSidebarWidgetsProps {
  events: CalendarEvent[];
  onExportIcs?: () => void;
}

export function CalendarSidebarWidgets({
  events,
  onExportIcs,
}: CalendarSidebarWidgetsProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Atualização periódica do relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const dualTimes = useMemo(() => {
    return formatDualTimezones(currentDate);
  }, [currentDate]);

  const highlights = useMemo(() => {
    return extractWeeklyHighlights(events, 4);
  }, [events]);

  const handleDownloadIcs = useCallback(() => {
    if (onExportIcs) {
      onExportIcs();
      return;
    }

    try {
      setIsExporting(true);
      const icsString = generateIcsCalendarContent(events, 'YuukiList - Programação Semanal');
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.setAttribute('download', 'yuukilist-calendario-semana.ics');
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      // Falha silenciosa ou fallback
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  }, [events, onExportIcs]);

  return (
    <aside aria-label="Painel lateral de widgets do calendário" className="space-y-6">
      {/* Widget 1: Relógio de Fuso Duplo (Local vs Tóquio JST) */}
      <section className="p-4 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Fuso de Transmissão
            </h2>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-sunken text-[var(--color-text-secondary)] border border-stroke-subtle">
            AO VIVO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Fuso Local */}
          <div className="p-2.5 rounded-lg bg-surface-sunken border border-stroke-subtle text-center">
            <span className="block text-[11px] font-medium text-[var(--color-text-secondary)]">
              {dualTimes.localLabel}
            </span>
            <span className="block text-xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mt-1">
              {dualTimes.localTime}
            </span>
          </div>

          {/* Fuso Tóquio JST */}
          <div className="p-2.5 rounded-lg bg-surface-sunken border border-accent/30 text-center">
            <span className="block text-[11px] font-medium text-accent">
              {dualTimes.jstLabel}
            </span>
            <span className="block text-xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mt-1">
              {dualTimes.jstTime}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
          Lançamentos simultâneos no Japão transmitem tipicamente às 23:00 - 24:00 JST.
        </p>
      </section>

      {/* Widget 2: Mais Esperados da Semana */}
      <section className="p-4 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Mais Esperados
          </h2>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
            {highlights.length} em destaque
          </span>
        </div>

        {highlights.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] py-3 text-center">
            Nenhuma obra em destaque para o período.
          </p>
        ) : (
          <div className="space-y-2.5">
            {highlights.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-surface-sunken border border-stroke-subtle hover:border-stroke-accent transition-colors group"
              >
                <Link
                  href={`/items/${item.mediaSlug}`}
                  className="w-9 h-12 rounded overflow-hidden bg-surface-canvas flex-shrink-0 flex items-center justify-center text-[9px] text-[var(--color-text-secondary)] font-bold border border-stroke-subtle focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.mediaTitle}
                      className="w-full h-full object-cover transition-colors"
                      loading="lazy"
                    />
                  ) : (
                    <span>YUUKI</span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/items/${item.mediaSlug}`}
                    className="block text-xs font-serif font-bold text-[var(--color-text-primary)] hover:text-accent transition-colors truncate focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.mediaTitle}
                  </Link>
                  <p className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5">
                    {item.subtitle}
                  </p>
                  <span className="inline-block text-[10px] font-mono tabular-nums text-accent font-semibold mt-0.5">
                    {item.formattedTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Widget 3: Exportação de Calendário (.ics RFC 5545) */}
      <section className="p-4 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top space-y-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Exportar Agenda
          </h2>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-snug">
            Sincronize esta programação com seu Google Calendar, Apple Calendar ou Outlook.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadIcs}
          disabled={isExporting || events.length === 0}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-semibold bg-surface-sunken hover:bg-surface-overlay text-[var(--color-text-primary)] border border-stroke-subtle hover:border-stroke-accent transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg
            className="w-4 h-4 text-accent group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isExporting ? 'Exportando...' : 'Baixar Calendário (.ics)'}</span>
        </button>
      </section>
    </aside>
  );
}

