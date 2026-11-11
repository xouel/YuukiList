'use client';

/**
 * YuukiList — Gerenciador de Episódios e Capítulos
 * Organização em abas de temporadas, botão em lote "Marcar Temporada Toda" e controle tátil individual
 */

import React, { useState, useMemo } from 'react';
import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';
import { generateSeasonGroups, type SeasonGroupDto } from './dossier-helpers.ts';

interface EpisodeManagerProps {
  item: MediaItemDetailDto;
  currentProgress: number;
  isAuthenticated: boolean;
  onMarkEpisode: (episodeNumber: number) => Promise<void>;
  onMarkSeasonAll: (lastEpisodeOfSeason: number, seasonTitle: string) => Promise<void>;
}

export function EpisodeManager({
  item,
  currentProgress,
  isAuthenticated,
  onMarkEpisode,
  onMarkSeasonAll,
}: EpisodeManagerProps) {
  const isReading =
    item.category === 'MANGA' ||
    item.category === 'MANHWA' ||
    item.category === 'MANHUA';

  const unitType = isReading ? 'Capítulo' : 'Episódio';
  const unitTypePlural = isReading ? 'Capítulos' : 'Episódios';

  const seasonGroups: SeasonGroupDto[] = useMemo(() => {
    return generateSeasonGroups(item);
  }, [item]);

  // Determina a temporada ativa com base no progresso atual
  const initialSeasonIndex = useMemo(() => {
    if (currentProgress <= 0 || seasonGroups.length <= 1) return 0;
    const foundIndex = seasonGroups.findIndex(
      (g) => currentProgress >= g.startEpisode && currentProgress <= g.endEpisode
    );
    if (foundIndex !== -1) return foundIndex;
    // Se passou de todas, abre na última
    if (currentProgress > seasonGroups[seasonGroups.length - 1].endEpisode) {
      return seasonGroups.length - 1;
    }
    return 0;
  }, [currentProgress, seasonGroups]);

  const [activeSeasonIndex, setActiveSeasonIndex] = useState<number>(initialSeasonIndex);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const activeSeason = seasonGroups[activeSeasonIndex] || seasonGroups[0];

  // Contagem de vistos na temporada ativa
  const seenInActiveSeason = useMemo(() => {
    if (!activeSeason) return 0;
    if (currentProgress < activeSeason.startEpisode) return 0;
    if (currentProgress >= activeSeason.endEpisode) return activeSeason.episodesCount;
    return currentProgress - activeSeason.startEpisode + 1;
  }, [activeSeason, currentProgress]);

  const isSeasonFullySeen = activeSeason && seenInActiveSeason === activeSeason.episodesCount;

  const handleBatchMark = async () => {
    if (!isAuthenticated || !activeSeason || isProcessing) return;
    try {
      setIsProcessing(true);
      await onMarkSeasonAll(activeSeason.endEpisode, activeSeason.title);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleEpisode = async (epNum: number) => {
    if (!isAuthenticated || isProcessing) return;
    try {
      setIsProcessing(true);
      await onMarkEpisode(epNum);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg shadow-black/40 space-y-5">
      {/* 1. Cabeçalho do Gerenciador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2B2735]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#F4EFEA] tracking-tight flex items-center gap-2">
            <svg className="w-5 h-5 text-[#E05347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Gerenciador de {unitTypePlural}</span>
          </h2>
          <p className="text-xs text-[#9E98A8] mt-0.5">
            {activeSeason.title} · {seenInActiveSeason}/{activeSeason.episodesCount} vistos
          </p>
        </div>

        {/* Botão de Ação em Lote */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleBatchMark}
            disabled={isProcessing || isSeasonFullySeen}
            className={`min-h-[44px] px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md ${
              isSeasonFullySeen
                ? 'bg-[#201D28] text-emerald-400 border border-emerald-800/50 cursor-default'
                : 'bg-[#E05347] hover:bg-[#C93B2F] text-[#F4EFEA] shadow-[#E05347]/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {isSeasonFullySeen ? 'Temporada Concluída' : 'Marcar Temporada Toda'}
            </span>
          </button>
        )}
      </div>

      {/* 2. Abas de Temporadas / Arcos (apenas se houver mais de 1) */}
      {seasonGroups.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {seasonGroups.map((group, idx) => {
            const isActive = idx === activeSeasonIndex;
            return (
              <button
                key={group.seasonNumber}
                type="button"
                onClick={() => setActiveSeasonIndex(idx)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-[#E05347] text-[#F4EFEA] border-[#E05347] shadow-sm shadow-[#E05347]/30'
                    : 'bg-[#201D28] text-[#9E98A8] hover:text-[#F4EFEA] border-[#2B2735] hover:bg-[#2B2735]'
                }`}
              >
                {group.title}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Grade de Cards de Episódios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {activeSeason.episodes.map((ep) => {
          const isSeen = ep.number <= currentProgress;
          const isNext = ep.number === currentProgress + 1;

          return (
            <div
              key={ep.number}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isSeen
                  ? 'bg-[#16141B] border-[#2B2735]/60'
                  : isNext
                  ? 'bg-[#201D28] border-[#E05347]/60 shadow-md shadow-[#E05347]/5'
                  : 'bg-[#201D28] border-[#2B2735]'
              }`}
            >
              {/* Informações do Episódio */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-[11px] font-extrabold px-2 py-1 rounded-md tracking-wider border shrink-0 ${
                    isSeen
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                      : isNext
                      ? 'bg-[#E05347]/20 text-[#E05347] border-[#E05347]/40'
                      : 'bg-[#16141B] text-[#9E98A8] border-[#2B2735]'
                  }`}
                >
                  {isReading ? `CAP ${ep.number}` : `EP ${ep.number}`}
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F4EFEA] truncate">
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#9E98A8] mt-0.5">
                    <span>{ep.durationMinutes} min</span>
                    {ep.airDate && <span>· {ep.airDate}</span>}
                  </div>
                </div>
              </div>

              {/* Ações / Status Tátil */}
              <div className="flex items-center gap-2 shrink-0">
                {isSeen ? (
                  <button
                    type="button"
                    onClick={() => handleToggleEpisode(ep.number - 1)}
                    disabled={!isAuthenticated || isProcessing}
                    className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    title="Clique para desmarcar este e os posteriores"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Visto</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleEpisode(ep.number)}
                    disabled={!isAuthenticated || isProcessing}
                    className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      isNext
                        ? 'bg-[#E05347] hover:bg-[#C93B2F] text-[#F4EFEA] shadow-sm shadow-[#E05347]/20'
                        : 'bg-[#16141B] hover:bg-[#2B2735] text-[#9E98A8] hover:text-[#F4EFEA] border border-[#2B2735]'
                    }`}
                  >
                    {isNext && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4EFEA] animate-ping" />
                    )}
                    <span>{isNext ? 'Próximo' : 'Marcar Visto'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

