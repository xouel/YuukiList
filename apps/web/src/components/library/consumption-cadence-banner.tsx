'use client';

/**
 * YuukiList — Banner de Cadência de Consumo e Sparkline SVG (Últimos 30 Dias)
 * Conforme Requisito: Consumption Cadence and Activity Sparkline (R24)
 */

import React from 'react';
import type { ConsumptionCadenceData } from './ledger-helpers.ts';

interface ConsumptionCadenceBannerProps {
  data: ConsumptionCadenceData;
  onExportCsv: () => void;
}

export function ConsumptionCadenceBanner({
  data,
  onExportCsv,
}: ConsumptionCadenceBannerProps) {
  // Constrói a curva SVG a partir dos 30 pontos diários
  const points = data.dailyPoints && data.dailyPoints.length === 30
    ? data.dailyPoints
    : new Array(30).fill(0);

  const maxVal = Math.max(1, ...points);
  const width = 280;
  const height = 40;
  const stepX = width / (points.length - 1);

  // Calcula coordenadas dos pontos (x, y)
  const coords = points.map((val, idx) => {
    const x = idx * stepX;
    const y = height - (val / maxVal) * (height - 8) - 4;
    return { x, y };
  });

  // Linha poligonal / suavizada
  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Área preenchida para gradiente
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full rounded-2xl bg-[#1A1820] border border-[#2B2735] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 mt-6 shadow-xl shadow-black/40">
      {/* Lado Esquerdo: Identificação e Resumo dos 30 Dias */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="font-serif text-base sm:text-lg font-medium text-[#F4EFEA] flex items-center gap-2">
            Cadência de Consumo
          </h3>
          <p className="text-xs text-[#9C96A2] font-light mt-0.5">
            {data.totalEpisodes30Days} episódios e {data.totalChapters30Days} capítulos registrados nos últimos 30 dias
          </p>
        </div>
      </div>

      {/* Lado Direito: Média Diária, Sparkline SVG e Botão Exportar CSV */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-5">
        {/* Média Diária */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9C96A2] uppercase tracking-wider font-semibold">
            MÉDIA DIÁRIA
          </span>
          <span className="text-lg font-bold text-emerald-400 font-mono leading-tight">
            {data.dailyAverage} eps
          </span>
        </div>

        {/* Gráfico Sparkline SVG */}
        <div className="w-44 sm:w-56 h-10 overflow-hidden flex items-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9D8DF1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#9D8DF1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#sparklineGrad)" />
            <path
              d={pathD}
              fill="none"
              stroke="#9D8DF1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Ação de Exportar CSV */}
        <button
          type="button"
          onClick={onExportCsv}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#2B2735]/70 hover:bg-[#2B2735] text-xs font-semibold text-[#F4EFEA] border border-[#2B2735] hover:border-[#F4EFEA]/30 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#9D8DF1]"
        >
          <svg className="w-3.5 h-3.5 text-[#9C96A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Exportar CSV</span>
        </button>
      </div>
    </div>
  );
}

