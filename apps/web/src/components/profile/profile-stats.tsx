'use client';

import React from 'react';
import type { ProfileStatsDto } from '@yuukilist/shared';

interface ProfileStatsProps {
  stats: ProfileStatsDto;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const categoryColors: Record<string, string> = {
    DORAMA: 'bg-rose-500',
    ANIME: 'bg-cyan-500',
    MANGA: 'bg-amber-500',
    MANHWA: 'bg-violet-500',
    MANHUA: 'bg-emerald-500',
    FILME: 'bg-blue-500',
    OUTROS: 'bg-zinc-500',
  };

  return (
    <div className="space-y-6">
      {/* 1. Cards de Métricas-Chave */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Obras Concluídas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">
              {stats.totalCompleted}
            </span>
            <span className="text-xs text-zinc-500">títulos</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Tempo Estimado
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              {stats.totalEstimatedHours}h
            </span>
            <span className="text-xs text-zinc-500">investidas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Capítulos & Volumes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {stats.totalChaptersRead}
            </span>
            <span className="text-xs text-zinc-500">
              cap. {stats.totalVolumesRead > 0 && `(${stats.totalVolumesRead} vol.)`}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
            Média de Avaliações
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-violet-300 font-mono">
              {stats.averageRating ? `★ ${stats.averageRating}` : '—'}
            </span>
            <span className="text-xs text-zinc-500">/ 10</span>
          </div>
        </div>
      </div>

      {/* 2. Distribuição por Categoria e Metadados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribuição por Categoria */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">
            Distribuição por Categoria
          </h2>

          {Object.keys(stats.categoryDistribution).length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              Nenhuma obra catalogada na biblioteca ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.categoryDistribution).map(([category, data]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-300">{category}</span>
                    <span className="text-zinc-400 font-mono">
                      {data.count} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${categoryColors[category] || 'bg-cyan-500'}`}
                      style={{ width: `${Math.min(100, data.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gêneros e Países */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-200 tracking-wide uppercase mb-2.5">
              Gêneros Mais Consumidos
            </h2>
            {stats.topGenres.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum gênero registrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.topGenres.map((g) => (
                  <span
                    key={g.genre}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                  >
                    {g.genre} <strong className="text-cyan-400 font-mono ml-1">{g.count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/60">
            <h2 className="text-sm font-bold text-zinc-200 tracking-wide uppercase mb-2.5">
              Países de Origem
            </h2>
            {stats.topCountries.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum país registrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.topCountries.map((c) => (
                  <span
                    key={c.country}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                  >
                    {c.country} <strong className="text-violet-400 font-mono ml-1">{c.count}</strong>
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

