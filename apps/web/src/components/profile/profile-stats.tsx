'use client';

import React from 'react';
import type { ProfileStatsDto } from '@yuukilist/shared';

interface ProfileStatsProps {
  stats: ProfileStatsDto;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const categoryColors: Record<string, string> = {
    DORAMA: 'bg-[#E05347]',
    ANIME: 'bg-[#C9A227]',
    MANGA: 'bg-[#9A5B4F]',
    MANHWA: 'bg-[#6B5B95]',
    MANHUA: 'bg-[#4E796B]',
    FILME: 'bg-[#5A6377]',
    OUTROS: 'bg-zinc-600',
  };

  return (
    <div className="space-y-6" aria-labelledby="profile-stats-heading">
      <div className="pb-2 border-b border-[#2B2735]">
        <h2
          id="profile-stats-heading"
          className="text-lg sm:text-xl font-serif font-bold text-[#F4EFEA] tracking-tight"
        >
          Estatísticas & Métricas de Consumo
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Resumo consolidado do tempo investido e distribuição cultural do seu acervo.
        </p>
      </div>

      {/* 1. Cards de Métricas-Chave Compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Obras Concluídas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F4EFEA]">
              {stats.totalCompleted}
            </span>
            <span className="text-xs text-zinc-500">títulos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#E05347] uppercase tracking-wider">
            Tempo Estimado
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#E05347]">
              {stats.totalEstimatedHours}h
            </span>
            <span className="text-xs text-zinc-500">investidas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
            Capítulos & Volumes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
              {stats.totalChaptersRead}
            </span>
            <span className="text-xs text-zinc-500">
              cap. {stats.totalVolumesRead > 0 && `(${stats.totalVolumesRead} vol.)`}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A1820] border border-[#2B2735] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
            Média de Avaliações
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-purple-300">
              {stats.averageRating ? `★ ${stats.averageRating}` : '—'}
            </span>
            <span className="text-xs text-zinc-500">/ 10</span>
          </div>
        </div>
      </div>

      {/* 2. Distribuição por Categoria e Metadados Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribuição por Categoria */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] space-y-3.5">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Distribuição por Categoria
          </h3>

          {Object.keys(stats.categoryDistribution).length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              Nenhuma obra catalogada na biblioteca ainda.
            </p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(stats.categoryDistribution).map(([category, data]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-300">{category}</span>
                    <span className="text-zinc-400 font-mono">
                      {data.count} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#24202C] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${categoryColors[category] || 'bg-[#E05347]'}`}
                      style={{ width: `${Math.min(100, data.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gêneros e Países */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Gêneros Mais Consumidos
            </h3>
            {stats.topGenres.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum gênero registrado.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stats.topGenres.map((g) => (
                  <span
                    key={g.genre}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#24202C] text-zinc-300 border border-[#2B2735]"
                  >
                    {g.genre} <strong className="text-[#E05347] font-mono ml-1">{g.count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#2B2735]">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Países de Origem
            </h3>
            {stats.topCountries.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum país registrado.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stats.topCountries.map((c) => (
                  <span
                    key={c.country}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#24202C] text-zinc-300 border border-[#2B2735]"
                  >
                    {c.country} <strong className="text-[#F4EFEA] font-mono ml-1">{c.count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
