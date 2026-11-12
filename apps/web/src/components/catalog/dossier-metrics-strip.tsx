'use client';

/**
 * YuukiList — Faixa de Métricas Editoriais de Alto Impacto
 * Exibe Média Global, Temporadas, Membros e Duração na paleta Asian Editorial
 */

import React from 'react';
import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';
import { computeDossierMetrics } from './dossier-helpers.ts';

interface DossierMetricsStripProps {
  item: MediaItemDetailDto;
}

export function DossierMetricsStrip({ item }: DossierMetricsStripProps) {
  const metrics = computeDossierMetrics(item);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-xl bg-surface-raised border border-stroke-subtle shadow-hairline-top">
      {/* 1. Média Global */}
      <div className="flex flex-col p-2.5 rounded-lg bg-surface-sunken border border-stroke-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-secondary)]">
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <span>Média Global</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] tracking-tight">
            {metrics.globalScore.split('/')[0].trim()}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium font-mono tabular-nums">/ 10</span>
        </div>
      </div>

      {/* 2. Temporadas & Episódios */}
      <div className="flex flex-col p-2.5 rounded-lg bg-surface-sunken border border-stroke-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-secondary)]">
          <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Temporadas</span>
        </div>
        <div className="mt-1">
          <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)] tracking-tight truncate block">
            {metrics.seasonsText}
          </span>
        </div>
      </div>

      {/* 3. Membros */}
      <div className="flex flex-col p-2.5 rounded-lg bg-surface-sunken border border-stroke-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-secondary)]">
          <svg className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Membros</span>
        </div>
        <div className="mt-1">
          <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)] tracking-tight">
            {metrics.membersText}
          </span>
        </div>
      </div>

      {/* 4. Duração Média */}
      <div className="flex flex-col p-2.5 rounded-lg bg-surface-sunken border border-stroke-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-secondary)]">
          <svg className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Duração Média</span>
        </div>
        <div className="mt-1">
          <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)] tracking-tight">
            {metrics.durationText}
          </span>
        </div>
      </div>
    </div>
  );
}
