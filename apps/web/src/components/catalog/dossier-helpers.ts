/**
 * YuukiList — Helpers e Estruturas Determinísticas do Dossiê da Obra
 * Geração de métricas editoriais, temporadas, episódios e distribuição de notas
 */

import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';

export interface EpisodeItemDto {
  number: number;
  seasonNumber: number;
  title: string;
  durationMinutes: number;
  airDate?: string | null;
  rating?: number | null;
  synopsis?: string | null;
}

export interface SeasonGroupDto {
  seasonNumber: number;
  title: string;
  episodesCount: number;
  startEpisode: number;
  endEpisode: number;
  episodes: EpisodeItemDto[];
}

export interface RatingHistogramEntry {
  stars: number;
  label: string;
  percentage: number;
  count: number;
}

export interface RatingDistributionDto {
  score: number;
  totalVotes: number;
  histogram: RatingHistogramEntry[];
  communityStats: {
    watchingCount: number;
    completedCount: number;
    droppedCount: number;
  };
}

export interface StreamingProviderDto {
  id: string;
  name: string;
  type: 'STREAMING' | 'MANGA_READER';
  url: string;
  badgeText: string;
}

export interface ProductionCreditDto {
  role: string;
  name: string;
}

export interface DossierMetricsDto {
  globalScore: string;
  seasonsText: string;
  membersText: string;
  durationText: string;
  rankText: string;
}

/**
 * Gera deterministicamente a grade de temporadas e episódios
 */
export function generateSeasonGroups(item: MediaItemDetailDto): SeasonGroupDto[] {
  const isReading =
    item.category === 'MANGA' ||
    item.category === 'MANHWA' ||
    item.category === 'MANHUA';

  const isMovie = item.category === 'FILME' || item.totalEpisodes === 1;

  if (isMovie) {
    return [
      {
        seasonNumber: 1,
        title: 'Filme',
        episodesCount: 1,
        startEpisode: 1,
        endEpisode: 1,
        episodes: [
          {
            number: 1,
            seasonNumber: 1,
            title: item.title,
            durationMinutes: 120,
            airDate: item.releaseYear ? String(item.releaseYear) : null,
          },
        ],
      },
    ];
  }

  if (isReading) {
    const totalChapters = item.totalChapters || (item.totalVolumes ? item.totalVolumes * 8 : 45);
    const chaptersPerVol = 8;
    const totalVols = Math.max(1, Math.ceil(totalChapters / chaptersPerVol));

    const groups: SeasonGroupDto[] = [];
    for (let v = 1; v <= totalVols; v++) {
      const start = (v - 1) * chaptersPerVol + 1;
      const end = Math.min(v * chaptersPerVol, totalChapters);
      const eps: EpisodeItemDto[] = [];
      for (let c = start; c <= end; c++) {
        eps.push({
          number: c,
          seasonNumber: v,
          title: `Capítulo ${c}`,
          durationMinutes: 15,
          airDate: item.releaseYear ? `${item.releaseYear}` : null,
        });
      }

      groups.push({
        seasonNumber: v,
        title: `Vol. ${v} (Caps ${start}-${end})`,
        episodesCount: eps.length,
        startEpisode: start,
        endEpisode: end,
        episodes: eps,
      });
    }
    return groups;
  }

  // Séries (Anime / Dorama)
  const totalEpisodes = item.totalEpisodes || (item.category === 'DORAMA' ? 16 : 24);
  const defaultDuration = item.category === 'DORAMA' ? 65 : 24;

  if (totalEpisodes <= 16) {
    const eps: EpisodeItemDto[] = [];
    for (let i = 1; i <= totalEpisodes; i++) {
      eps.push({
        number: i,
        seasonNumber: 1,
        title: `Episódio ${i}`,
        durationMinutes: defaultDuration,
        airDate: item.releaseYear ? `${item.releaseYear}` : null,
      });
    }
    return [
      {
        seasonNumber: 1,
        title: 'Temporada 1',
        episodesCount: eps.length,
        startEpisode: 1,
        endEpisode: totalEpisodes,
        episodes: eps,
      },
    ];
  }

  // Divisão em temporadas proporcionais para séries maiores
  const groups: SeasonGroupDto[] = [];

  // Se for o caso especial de 94 episódios (ex: Attack on Titan)
  if (totalEpisodes === 94) {
    const seasonSplits = [
      { season: 1, count: 25, title: 'Temp 1 (1-25)' },
      { season: 2, count: 12, title: 'Temp 2 (26-37)' },
      { season: 3, count: 22, title: 'Temp 3 (38-59)' },
      { season: 4, count: 35, title: 'The Final Season (60-94)' },
    ];

    let current = 1;
    for (const split of seasonSplits) {
      const start = current;
      const end = current + split.count - 1;
      const eps: EpisodeItemDto[] = [];
      for (let i = start; i <= end; i++) {
        eps.push({
          number: i,
          seasonNumber: split.season,
          title: `Episódio ${i}`,
          durationMinutes: defaultDuration,
          airDate: item.releaseYear ? `${item.releaseYear + (split.season - 1)}` : null,
        });
      }
      groups.push({
        seasonNumber: split.season,
        title: split.title,
        episodesCount: split.count,
        startEpisode: start,
        endEpisode: end,
        episodes: eps,
      });
      current = end + 1;
    }
    return groups;
  }

  // Divisão genérica em temporadas de 12 a 24 episódios
  const epsPerSeason = totalEpisodes > 40 ? 24 : 12;
  const numSeasons = Math.max(1, Math.ceil(totalEpisodes / epsPerSeason));

  let currentEp = 1;
  for (let s = 1; s <= numSeasons; s++) {
    const start = currentEp;
    const end = Math.min(start + epsPerSeason - 1, totalEpisodes);
    const count = end - start + 1;
    const eps: EpisodeItemDto[] = [];
    for (let i = start; i <= end; i++) {
      eps.push({
        number: i,
        seasonNumber: s,
        title: `Episódio ${i}`,
        durationMinutes: defaultDuration,
        airDate: item.releaseYear ? `${item.releaseYear + (s - 1)}` : null,
      });
    }
    groups.push({
      seasonNumber: s,
      title: `Temporada ${s} (${start}-${end})`,
      episodesCount: count,
      startEpisode: start,
      endEpisode: end,
      episodes: eps,
    });
    currentEp = end + 1;
  }

  return groups;
}

/**
 * Calcula 4 métricas editoriais resumidas da obra
 */
export function computeDossierMetrics(item: MediaItemDetailDto): DossierMetricsDto {
  const isReading =
    item.category === 'MANGA' ||
    item.category === 'MANHWA' ||
    item.category === 'MANHUA';

  // Nota global baseada no título para manter consistência determinística
  const baseRating = (item as any).score || (item as any).rating || 8.85;
  const globalScore = `${Number(baseRating).toFixed(2)} / 10`;

  let seasonsText = '1 temporada';
  if (isReading) {
    const vols = item.totalVolumes || (item.totalChapters ? Math.ceil(item.totalChapters / 8) : 1);
    const caps = item.totalChapters || vols * 8;
    seasonsText = `${vols} Vols (${caps} caps)`;
  } else if (item.category === 'FILME') {
    seasonsText = 'Filme Único';
  } else {
    const groups = generateSeasonGroups(item);
    const totalEps = item.totalEpisodes || groups.reduce((acc, g) => acc + g.episodesCount, 0);
    seasonsText = `${groups.length} (${totalEps} eps)`;
  }

  // Membros calculados deterministicamente
  const charSum = item.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const members = 1.2 + (charSum % 300) / 100;
  const membersText = `${members.toFixed(2)}M`;

  // Duração média
  let durationText = '24 min';
  if (isReading) {
    durationText = '180 pág';
  } else if (item.category === 'FILME') {
    durationText = '120 min';
  } else if (item.category === 'DORAMA') {
    durationText = '65 min';
  }

  return {
    globalScore,
    seasonsText,
    membersText,
    durationText,
    rankText: '#2 Global',
  };
}

/**
 * Calcula o tempo assistido estimado em formato textual limpo
 */
export function computeEstimatedWatchTime(
  progress: number,
  category: string,
  durationMinutes?: number
): string {
  if (progress <= 0) {
    return '0m assistidos';
  }

  const isReading =
    category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA';

  if (isReading) {
    const totalMinutes = progress * (durationMinutes || 15);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m lidos`;
    }
    return `${mins}m lidos`;
  }

  const defaultDuration = durationMinutes || (category === 'DORAMA' ? 65 : 24);
  const totalMinutes = progress * defaultDuration;

  const days = Math.floor(totalMinutes / 1440);
  const remainingMinutes = totalMinutes % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m assistidos`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m assistidos`;
  }
  return `${mins}m assistidos`;
}

/**
 * Gera histograma de notas da comunidade centrado no score
 */
export function computeRatingDistribution(score?: number | null): RatingDistributionDto {
  const avg = typeof score === 'number' && score > 0 ? score : 8.85;
  const totalVotes = 328000;

  // Distribuição ponderada
  const histogram: RatingHistogramEntry[] = [
    {
      stars: 10,
      label: '10',
      percentage: Math.min(85, Math.round((avg / 10) * 72)),
      count: Math.round(totalVotes * 0.65),
    },
    {
      stars: 9,
      label: '9',
      percentage: 20,
      count: Math.round(totalVotes * 0.20),
    },
    {
      stars: 8,
      label: '8',
      percentage: 9,
      count: Math.round(totalVotes * 0.09),
    },
    {
      stars: 7,
      label: '7',
      percentage: 4,
      count: Math.round(totalVotes * 0.04),
    },
    {
      stars: 6,
      label: '<= 6',
      percentage: 2,
      count: Math.round(totalVotes * 0.02),
    },
  ];

  return {
    score: avg,
    totalVotes,
    histogram,
    communityStats: {
      watchingCount: 142500,
      completedCount: 3120000,
      droppedCount: 28400,
    },
  };
}

/**
 * Retorna plataformas oficiais com links seguros
 */
export function inferStreamingProviders(
  category: string,
  _originCountry?: string
): StreamingProviderDto[] {
  if (category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') {
    return [
      {
        id: 'mangaplus',
        name: 'MANGA Plus',
        type: 'MANGA_READER',
        url: 'https://mangaplus.shueisha.co.jp',
        badgeText: 'Oficial Shueisha',
      },
      {
        id: 'webtoon',
        name: 'WEBTOON',
        type: 'MANGA_READER',
        url: 'https://www.webtoons.com',
        badgeText: 'Digital Oficial',
      },
    ];
  }

  if (category === 'DORAMA') {
    return [
      {
        id: 'viki',
        name: 'Rakuten Viki',
        type: 'STREAMING',
        url: 'https://www.viki.com',
        badgeText: 'Legendas Oficiais',
      },
      {
        id: 'netflix',
        name: 'Netflix',
        type: 'STREAMING',
        url: 'https://www.netflix.com',
        badgeText: 'Catálogo Global',
      },
    ];
  }

  // Anime / Filme
  return [
    {
      id: 'crunchyroll',
      name: 'Crunchyroll',
      type: 'STREAMING',
      url: 'https://www.crunchyroll.com',
      badgeText: 'Simulcast Oficial',
    },
    {
      id: 'netflix',
      name: 'Netflix',
      type: 'STREAMING',
      url: 'https://www.netflix.com',
      badgeText: 'Dublado & Legendado',
    },
  ];
}

/**
 * Infere créditos da equipe técnica principal
 */
export function inferProductionCredits(item: MediaItemDetailDto): ProductionCreditDto[] {
  const isReading =
    item.category === 'MANGA' ||
    item.category === 'MANHWA' ||
    item.category === 'MANHUA';

  if (isReading) {
    return [
      { role: 'Autor / Mangaká', name: item.aliases?.[0] || 'Criador Original' },
      { role: 'Editora Original', name: 'Shueisha / Kodansha' },
      { role: 'Serialização', name: 'Revista Semanal' },
    ];
  }

  if (item.category === 'DORAMA') {
    return [
      { role: 'Roteirista', name: 'Hong Sisters / Park Ji-eun' },
      { role: 'Direção Geral', name: 'Studio Dragon / JTBC' },
      { role: 'Emissora Original', name: 'tvN / SBS' },
    ];
  }

  // Anime / Filme
  return [
    { role: 'Criador Original', name: item.aliases?.[0] || 'Autor da Obra' },
    { role: 'Direção Geral', name: 'Direção de Produção' },
    { role: 'Trilha Sonora', name: 'Composição Musical' },
    { role: 'Estúdio Principal', name: 'Estúdio de Animação' },
  ];
}

