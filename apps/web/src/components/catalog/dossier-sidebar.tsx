'use client';

/**
 * YuukiList — Painel Lateral Analítico (Sidebar) do Dossiê da Obra
 * Distribuição de Notas (histograma), Contadores de Comunidade, Onde Assistir e Estúdios
 */

import React from 'react';
import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';
import {
  computeRatingDistribution,
  inferStreamingProviders,
  inferProductionCredits,
} from './dossier-helpers.ts';

interface DossierSidebarProps {
  item: MediaItemDetailDto;
}

export function DossierSidebar({ item }: DossierSidebarProps) {
  const ratingDistribution = computeRatingDistribution((item as any).score || (item as any).rating);
  const streamingProviders = inferStreamingProviders(item.category);
  const productionCredits = inferProductionCredits(item);

  return (
    <aside className="space-y-6">
      {/* 1. Bloco de Distribuição de Notas & Comunidade */}
      <div className="p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B2735]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4EFEA] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#E5A93C]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Distribuição de Notas</span>
          </h3>
          <span className="text-[11px] font-bold text-[#E5A93C]">
            {ratingDistribution.score.toFixed(2)} / 10
          </span>
        </div>

        {/* Histograma de 5 Barras (10 a <=6) */}
        <div className="space-y-2">
          {ratingDistribution.histogram.map((entry) => (
            <div key={entry.stars} className="flex items-center gap-2.5 text-xs">
              <span className="w-8 text-[11px] font-semibold text-[#9E98A8] text-right shrink-0">
                {entry.label}
              </span>

              {/* Track e Fill */}
              <div className="flex-1 h-2 rounded-full bg-[#16141B] border border-[#2B2735]/60 overflow-hidden">
                <div
                  className="h-full bg-[#E5A93C] rounded-full transition-all duration-300"
                  style={{ width: `${entry.percentage}%` }}
                />
              </div>

              <span className="w-9 text-[11px] font-medium text-[#9E98A8] text-right shrink-0">
                {entry.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Contadores da Comunidade (Assistindo, Completaram, Abandonaram) */}
        <div className="pt-3 border-t border-[#2B2735] grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[#201D28] border border-[#2B2735]/60">
            <span className="block text-[10px] font-semibold uppercase text-[#9E98A8]">
              Assistindo
            </span>
            <span className="text-xs font-bold text-[#F4EFEA] mt-0.5 block">
              {(ratingDistribution.communityStats.watchingCount / 1000).toFixed(1)}K
            </span>
          </div>

          <div className="p-2 rounded-lg bg-[#201D28] border border-[#2B2735]/60">
            <span className="block text-[10px] font-semibold uppercase text-[#9E98A8]">
              Completaram
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
              {(ratingDistribution.communityStats.completedCount / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="p-2 rounded-lg bg-[#201D28] border border-[#2B2735]/60">
            <span className="block text-[10px] font-semibold uppercase text-[#9E98A8]">
              Abandonaram
            </span>
            <span className="text-xs font-bold text-[#E05347] mt-0.5 block">
              {(ratingDistribution.communityStats.droppedCount / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      </div>

      {/* 2. Gêneros & Temas Transversais */}
      {item.genres && item.genres.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E98A8] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#E05347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Gêneros &amp; Temas</span>
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {item.genres.map((genre) => (
              <span
                key={genre}
                className="text-xs px-2.5 py-1 rounded-full bg-[#201D28] hover:bg-[#2B2735] text-[#F4EFEA] border border-[#2B2735] transition-colors font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Onde Assistir / Ler Oficialmente */}
      <div className="p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E98A8] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#E05347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Onde Assistir Oficialmente</span>
        </h3>

        <div className="space-y-2">
          {streamingProviders.map((prov) => (
            <a
              key={prov.id}
              href={prov.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#201D28] hover:bg-[#2B2735] border border-[#2B2735] transition-all flex items-center justify-between group cursor-pointer block"
            >
              <div>
                <span className="text-xs font-bold text-[#F4EFEA] group-hover:text-[#E05347] transition-colors block">
                  {prov.name}
                </span>
                <span className="text-[10px] text-[#9E98A8]">
                  {prov.badgeText}
                </span>
              </div>

              <div className="text-[#9E98A8] group-hover:text-[#F4EFEA] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <p className="text-[10px] text-[#9E98A8] leading-relaxed pt-1">
          Links externos direcionam para catálogos oficiais com transmissão licenciada.
        </p>
      </div>

      {/* 4. Estúdios de Produção & Ficha Técnica */}
      <div className="p-5 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E98A8] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#9E98A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Produção &amp; Autoria</span>
        </h3>

        <div className="space-y-2 text-xs">
          {productionCredits.map((credit, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#201D28] border border-[#2B2735]/60">
              <span className="text-[#9E98A8] text-[11px] font-medium">{credit.role}</span>
              <span className="text-[#F4EFEA] font-semibold">{credit.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
