'use client';

/**
 * YuukiList — Cabeçalho do Ledger Pessoal v2.4
 * Conforme Requisito: Personal Library View and Layout Toggle (R24)
 */

import React from 'react';
import Link from 'next/link';
import type { LedgerKpiMetrics } from './ledger-helpers.ts';

interface LedgerHeaderProps {
  metrics: LedgerKpiMetrics;
  onAddClick?: () => void;
}

export function LedgerHeader({ metrics, onAddClick }: LedgerHeaderProps) {
  return (
    <header className="w-full flex flex-col gap-5 pb-5 border-b border-stroke-subtle">
      {/* Linha Superior: Tag de Versão e Timestamp */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-surface-raised text-media-anime border border-media-anime/30 uppercase">
          LEDGER PESSOAL V2.4
        </span>
        <span className="text-[var(--color-text-secondary)] text-xs flex items-center gap-1.5 font-light">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {metrics.syncTimestampText}
        </span>
      </div>

      {/* Linha Principal: Título Editorial e KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--color-text-primary)] tracking-tight">
            Sua Biblioteca & Diário
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-light max-w-xl">
            Gerencie episódios assistidos, pontuações e anotações privadas sem distrações.
          </p>
        </div>

        {/* Grupo de Ações e KPIs no Topo Direito */}
        <div className="flex flex-wrap items-center gap-3">
          {/* KPI 1: Concluídos */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                {metrics.completedCount}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                Concluídos
              </div>
            </div>
          </div>

          {/* KPI 2: Em Andamento */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top">
            <div className="w-7 h-7 rounded-lg bg-media-anime/15 border border-media-anime/30 flex items-center justify-center text-media-anime">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                {metrics.inProgressCount}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                Em Andamento
              </div>
            </div>
          </div>

          {/* KPI 3: Tempo Total */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                {metrics.totalHours.toLocaleString('pt-BR')}h
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                Tempo Total
              </div>
            </div>
          </div>

          {/* Botão Primário: Adicionar Obra */}
          <Link
            href="/explore"
            onClick={onAddClick}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-accent hover:opacity-90 transition-all shadow-md shadow-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Adicionar Obra</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

