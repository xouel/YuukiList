'use client';

/**
 * YuukiList — Seção de Obras Relacionadas e Adaptações
 * Conforme Requisito: Item Detail Related Works and Adaptation Badges
 */

import React from 'react';
import type {
  MediaRelationDto,
  FranchiseDto,
  MediaRelationType,
} from '../../../../../packages/shared/src/index.ts';

export interface RelatedWorksSectionProps {
  relations: MediaRelationDto[];
  franchise?: FranchiseDto | null;
  currentMediaSlug?: string;
}

export const RELATION_LABELS: Record<MediaRelationType, { label: string; color: string }> = {
  ADAPTATION: {
    label: 'Adaptação',
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
  },
  PREQUEL: {
    label: 'Prequel (Anterior)',
    color: 'bg-amber-950/80 text-amber-300 border-amber-800',
  },
  SEQUEL: {
    label: 'Sequel (Continuação)',
    color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
  },
  SPIN_OFF: {
    label: 'Spin-off',
    color: 'bg-purple-950/80 text-purple-300 border-purple-800',
  },
  SIDE_STORY: {
    label: 'História Paralela',
    color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
  },
  ALTERNATIVE_VERSION: {
    label: 'Versão Alternativa',
    color: 'bg-rose-950/80 text-rose-300 border-rose-800',
  },
  RELATED: {
    label: 'Relacionada',
    color: 'bg-gray-800 text-gray-300 border-gray-700',
  },
};

const CATEGORY_TAG_COLORS: Record<string, string> = {
  DORAMA: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  FILME: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  ANIME: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  MANGA: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
  MANHWA: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  MANHUA: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50',
};

export function RelatedWorksSection({
  relations,
  franchise,
}: RelatedWorksSectionProps) {
  if ((!relations || relations.length === 0) && !franchise) {
    return null;
  }

  return (
    <section className="bg-[#121520] border border-[#262C3F] rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262C3F] pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F3F4F6] flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span>Obras Relacionadas &amp; Adaptações</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5">
            Adaptações transmídia, continuações, spin-offs e histórias paralelas deste universo.
          </p>
        </div>

        {franchise && (
          <a
            href={`/franchises/${franchise.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] hover:text-[#22D3EE] border border-[#06B6D4]/30 font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <span>Explorar Franquia Completa</span>
            <span>→</span>
          </a>
        )}
      </div>

      {/* Banner de Franquia (se associada) */}
      {franchise && (
        <div className="p-4 rounded-xl bg-[#0E111B] border border-[#262C3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                Franquia / Universo
              </span>
              <span className="text-sm font-bold text-[#F3F4F6]">
                {franchise.name}
              </span>
              {franchise.originalName && (
                <span className="text-xs text-[#64748B] hidden sm:inline">
                  ({franchise.originalName})
                </span>
              )}
            </div>
            {franchise.description && (
              <p className="text-xs text-[#9CA3AF] line-clamp-2 max-w-2xl">
                {franchise.description}
              </p>
            )}
          </div>

          <a
            href={`/franchises/${franchise.slug}`}
            className="text-xs font-semibold text-[#06B6D4] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Ver {franchise.items.length} obras no universo →
          </a>
        </div>
      )}

      {/* Grade de Obras Relacionadas */}
      {relations && relations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relations.map((rel) => {
            const relConfig = RELATION_LABELS[rel.relationType] || RELATION_LABELS.RELATED;
            const catClass = CATEGORY_TAG_COLORS[rel.relatedMedia.category] || 'bg-gray-800 text-gray-300';

            return (
              <a
                key={rel.id || rel.relatedMediaItemId}
                href={`/items/${rel.relatedMedia.slug}`}
                className="group p-3.5 rounded-xl bg-[#181C2B] border border-[#262C3F] hover:border-[#06B6D4]/50 transition-all flex gap-3.5 items-start shadow-md hover:shadow-black/60"
              >
                {/* Capa */}
                <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#0E111B] border border-white/5 relative">
                  <img
                    src={rel.relatedMedia.coverUrl}
                    alt={rel.relatedMedia.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${relConfig.color}`}>
                      {relConfig.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${catClass}`}>
                      {rel.relatedMedia.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F3F4F6] group-hover:text-[#06B6D4] transition-colors truncate">
                    {rel.relatedMedia.title}
                  </h3>

                  {rel.relatedMedia.originalTitle && (
                    <p className="text-[11px] text-[#64748B] truncate">
                      {rel.relatedMedia.originalTitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] pt-1">
                    <span>{rel.relatedMedia.releaseYear || 'Ano N/D'}</span>

                    {rel.userLibraryStatus ? (
                      <span className="text-[10px] font-semibold text-[#06B6D4] px-1.5 py-0.5 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/30">
                        {rel.userLibraryStatus.status}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#64748B]">
                        Não adicionado
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-[#9CA3AF] bg-[#0E111B] rounded-xl border border-[#262C3F]/50">
          Nenhuma obra relacionada direta catalogada além do universo principal.
        </div>
      )}
    </section>
  );
}

