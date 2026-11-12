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
    <header className="w-full flex flex-col gap-4 pb-5 border-b border-stroke-subtle">
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

        {/* Grupo de Ações e KPIs no Topo Direito (De-Boxed BroadSheet Ledger) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Faixa Tabular Unificada de Métricas */}
          <div className="flex items-stretch divide-x divide-stroke-subtle rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top overflow-hidden">
            {/* KPI 1: Concluídos */}
            <div className="flex items-center gap-2.5 px-3.5 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)] leading-tight">
                  {metrics.completedCount}
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                  Concluídos
                </div>
              </div>
            </div>

            {/* KPI 2: Em Andamento */}
            <div className="flex items-center gap-2.5 px-3.5 py-2">
              <span className="w-2 h-2 rounded-full bg-media-anime shrink-0" />
              <div>
                <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)] leading-tight">
                  {metrics.inProgressCount}
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                  Em Andamento
                </div>
              </div>
            </div>

            {/* KPI 3: Tempo Total */}
            <div className="flex items-center gap-2.5 px-3.5 py-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <div>
                <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)] leading-tight">
                  {metrics.totalHours.toLocaleString('pt-BR')}h
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                  Tempo Total
                </div>
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

