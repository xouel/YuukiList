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
      <section className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Fuso de Transmissão
            </h2>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#24202C] text-zinc-400 border border-[#2B2735]">
            AO VIVO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Fuso Local */}
          <div className="p-2.5 rounded-lg bg-[#24202C] border border-[#2B2735] text-center">
            <span className="block text-[11px] font-medium text-zinc-400">
              {dualTimes.localLabel}
            </span>
            <span className="block text-xl font-bold font-mono text-[#F4EFEA] mt-1">
              {dualTimes.localTime}
            </span>
          </div>

          {/* Fuso Tóquio JST */}
          <div className="p-2.5 rounded-lg bg-[#24202C] border border-[#E05347]/30 text-center">
            <span className="block text-[11px] font-medium text-[#E05347]">
              {dualTimes.jstLabel}
            </span>
            <span className="block text-xl font-bold font-mono text-[#F4EFEA] mt-1">
              {dualTimes.jstTime}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 leading-tight">
          Lançamentos simultâneos no Japão transmitem tipicamente às 23:00 - 24:00 JST.
        </p>
      </section>

      {/* Widget 2: Mais Esperados da Semana */}
      <section className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Mais Esperados
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {highlights.length} em destaque
          </span>
        </div>

        {highlights.length === 0 ? (
          <p className="text-xs text-zinc-500 py-3 text-center">
            Nenhuma obra em destaque para o período.
          </p>
        ) : (
          <div className="space-y-2.5">
            {highlights.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-[#24202C] border border-[#2B2735] hover:border-[#3B3647] transition-colors group"
              >
                <Link
                  href={`/items/${item.mediaSlug}`}
                  className="w-9 h-12 rounded overflow-hidden bg-[#1A1820] flex-shrink-0 flex items-center justify-center text-[9px] text-zinc-500 font-bold border border-[#2B2735]"
                >
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.mediaTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <span>YUUKI</span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/items/${item.mediaSlug}`}
                    className="block text-xs font-serif font-bold text-[#F4EFEA] hover:text-[#E05347] transition-colors truncate"
                  >
                    {item.mediaTitle}
                  </Link>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                  <span className="inline-block text-[10px] font-mono text-[#E05347] font-semibold mt-0.5">
                    {item.formattedTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Widget 3: Exportação de Calendário (.ics RFC 5545) */}
      <section className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] space-y-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Exportar Agenda
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
            Sincronize esta programação com seu Google Calendar, Apple Calendar ou Outlook.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadIcs}
          disabled={isExporting || events.length === 0}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#24202C] hover:bg-[#2F2A3A] text-[#F4EFEA] border border-[#2B2735] hover:border-[#E05347]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
        >
          <svg
            className="w-4 h-4 text-[#E05347] group-hover:scale-110 transition-transform"
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

