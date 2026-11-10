'use client';

/**
 * YuukiList — Visualização do Universo / Franquia com Alternância de Ordens
 * Conforme Requisito: Franchise Universe Explorer View with Timeline Modes
 */

import React, { useState, useMemo } from 'react';
import type { FranchiseDto, FranchiseItemDto } from '../../../../../packages/shared/src/index.ts';

export interface FranchiseViewProps {
  franchise: FranchiseDto;
}

export type FranchiseOrderMode = 'release' | 'chronological';

const CATEGORY_STYLES: Record<string, string> = {
  DORAMA: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
  FILME: 'bg-amber-950/80 text-amber-300 border-amber-800',
  ANIME: 'bg-purple-950/80 text-purple-300 border-purple-800',
  MANGA: 'bg-rose-950/80 text-rose-300 border-rose-800',
  MANHWA: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
  MANHUA: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
};

const STATUS_LABELS: Record<string, string> = {
  ASSISTINDO: 'Assistindo',
  LENDO: 'Lendo',
  QUERO_ASSISTIR: 'Quero Assistir',
  QUERO_LER: 'Quero Ler',
  CONCLUIDO: 'Concluído',
  ASSISTIDO: 'Assistido',
  PAUSADO: 'Pausado',
  DROPADO: 'Dropado',
};

export function FranchiseView({ franchise }: FranchiseViewProps) {
  const [orderMode, setOrderMode] = useState<FranchiseOrderMode>('release');

  const sortedItems = useMemo(() => {
    const list = [...franchise.items];
    if (orderMode === 'chronological') {
      return list.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
    }
    return list.sort((a, b) => a.releaseOrder - b.releaseOrder);
  }, [franchise.items, orderMode]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Voltar */}
      <div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#181C2B] hover:bg-[#1F2438] border border-[#262C3F] rounded-lg transition-colors"
        >
          <span>←</span>
          <span>Voltar ao catálogo</span>
        </a>
      </div>

      {/* Header do Universo / Franquia */}
      <header className="p-6 sm:p-8 rounded-2xl bg-[#121520] border border-[#262C3F] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
            Universo / Franquia Transmídia
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
            {franchise.items.length} {franchise.items.length === 1 ? 'obra catalogada' : 'obras catalogadas'}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F3F4F6] tracking-tight">
            {franchise.name}
          </h1>
          {franchise.originalName && (
            <p className="text-sm sm:text-base text-[#64748B] font-light mt-1">
              {franchise.originalName}
            </p>
          )}
        </div>

        {franchise.description && (
          <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed max-w-4xl">
            {franchise.description}
          </p>
        )}

        {/* Alternância Interativa de Ordem */}
        <div className="pt-4 border-t border-[#262C3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#9CA3AF]">
            <span>Organizar linha do tempo por:</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0E111B] p-1 rounded-xl border border-[#262C3F]">
            <button
              type="button"
              onClick={() => setOrderMode('release')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                orderMode === 'release'
                  ? 'bg-[#06B6D4] text-[#0B0D13] shadow-md shadow-[#06B6D4]/20'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              📅 Ordem de Lançamento
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('chronological')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                orderMode === 'chronological'
                  ? 'bg-[#06B6D4] text-[#0B0D13] shadow-md shadow-[#06B6D4]/20'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              ⏳ Ordem Cronológica (História)
            </button>
          </div>
        </div>
      </header>

      {/* Lista Cronológica / Lançamento de Obras */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-2">
          <span>{orderMode === 'release' ? 'Cronologia de Lançamento Oficial' : 'Ordem Narrativa no Universo'}</span>
          <span className="text-xs text-[#64748B]">({sortedItems.length} títulos)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedItems.map((item, index) => {
            const catStyle = CATEGORY_STYLES[item.category] || 'bg-gray-800 text-gray-300';
            const orderNum = orderMode === 'chronological' ? item.chronologicalOrder : item.releaseOrder;

            return (
              <div
                key={item.mediaItemId}
                className="group p-4 rounded-2xl bg-[#121520] border border-[#262C3F] hover:border-[#06B6D4]/50 transition-all flex gap-4 items-start shadow-lg relative overflow-hidden"
              >
                {/* Número da Ordem */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#181C2B] border border-[#262C3F] flex items-center justify-center text-xs font-extrabold text-[#06B6D4]">
                  #{orderNum || index + 1}
                </div>

                {/* Capa */}
                <a
                  href={`/items/${item.slug}`}
                  className="w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 bg-[#181C2B] border border-white/5 relative block"
                >
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>

                {/* Informações */}
                <div className="flex-1 min-w-0 pr-8 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catStyle}`}>
                      {item.category}
                    </span>
                    {item.releaseYear && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                        {item.releaseYear}
                      </span>
                    )}
                  </div>

                  <a
                    href={`/items/${item.slug}`}
                    className="block hover:text-[#06B6D4] transition-colors"
                  >
                    <h3 className="text-base font-bold text-[#F3F4F6] line-clamp-1">
                      {item.title}
                    </h3>
                    {item.originalTitle && (
                      <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                        {item.originalTitle}
                      </p>
                    )}
                  </a>

                  {item.roleInFranchise && (
                    <p className="text-xs text-[#9CA3AF] bg-[#0E111B] px-2 py-1 rounded-md border border-[#262C3F]/60">
                      <span className="text-[#64748B]">Papel: </span>
                      <span className="font-medium text-gray-200">{item.roleInFranchise}</span>
                    </p>
                  )}

                  {/* Status Pessoal e Progresso do Usuário */}
                  <div className="pt-2 border-t border-[#262C3F]/60 flex items-center justify-between text-xs">
                    {item.userLibraryStatus ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                          {STATUS_LABELS[item.userLibraryStatus.status] || item.userLibraryStatus.status}
                        </span>
                        <span className="text-[#9CA3AF] text-[11px]">
                          Progresso: <strong className="text-white">{item.userLibraryStatus.progress}</strong>
                        </span>
                        {item.userLibraryStatus.isFavorite && (
                          <span className="text-rose-400 text-xs" title="Favorito">
                            ♥
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#64748B] text-[11px]">
                        Não adicionado à sua lista
                      </span>
                    )}

                    <a
                      href={`/items/${item.slug}`}
                      className="text-xs font-semibold text-[#06B6D4] hover:underline"
                    >
                      Ver detalhes →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

