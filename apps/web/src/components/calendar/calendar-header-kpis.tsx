'use client';

import React from 'react';
import type { CalendarKpis } from './calendar-helpers';

interface CalendarHeaderKpisProps {
  kpis: CalendarKpis;
  onSelectToday?: () => void;
  onFilterQueue?: () => void;
}

export function CalendarHeaderKpis({
  kpis,
  onSelectToday,
  onFilterQueue,
}: CalendarHeaderKpisProps) {
  return (
    <header className="space-y-6">
      {/* Linha Superior: Tag de Temporada e Título Editorial */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#E05347]/10 text-[#E05347] border border-[#E05347]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E05347] animate-pulse" />
          <span>{kpis.seasonTag}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4EFEA] tracking-tight">
          Programação Semanal
        </h1>

        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Acompanhe transmissões ao vivo, fusos oficiais de transmissão e sincronize o progresso
          de episódios diretamente no calendário.
        </p>
      </div>

      {/* Faixa de 3 KPIs Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* KPI 1: Hoje */}
        <button
          type="button"
          onClick={onSelectToday}
          className="flex flex-col p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] hover:border-[#E05347]/40 hover:bg-[#1E1B25] transition-all text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300">
              Hoje
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E05347]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F4EFEA] group-hover:text-[#E05347] transition-colors">
              {kpis.todayCount}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {kpis.todayCount === 1 ? 'estreia no dia' : 'estreias no dia'}
            </span>
          </div>
        </button>

        {/* KPI 2: Na Sua Fila */}
        <button
          type="button"
          onClick={onFilterQueue}
          className="flex flex-col p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] hover:border-[#3B3647] hover:bg-[#1E1B25] transition-all text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300">
              Na Sua Fila
            </span>
            <svg
              className="w-3.5 h-3.5 text-purple-400/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F4EFEA]">
              {kpis.queueCount}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              obras seguidas
            </span>
          </div>
        </button>

        {/* KPI 3: Eventos da Semana */}
        <div className="flex flex-col p-4 rounded-xl bg-[#1A1820] border border-[#2B2735]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Eventos da Semana
            </span>
            <svg
              className="w-3.5 h-3.5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F4EFEA]">
              {kpis.weekTotalCount}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              total catalogado
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

