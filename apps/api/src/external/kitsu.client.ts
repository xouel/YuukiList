/**
 * YuukiList — Cliente HTTP para Kitsu (JSON:API de Animes e Mangás)
 * Conforme Documento Mestre de Contexto (Seção 9.5) e Requisito: Literary External API Integration
 */

import {
  type CanonicalExternalMediaDto,
  type ExternalSearchQuery,
  type Category,
} from '../../../../packages/shared/src/index.ts';

export interface KitsuClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class KitsuClient {
  readonly source = 'KITSU' as const;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: KitsuClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://kitsu.io/api/edge';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  normalizeItem(raw: any, explicitCategory?: Category): CanonicalExternalMediaDto {
    const isAnime = raw.type === 'anime' || explicitCategory === 'ANIME';
    const attrs = raw.attributes || raw;
    const category: Category = explicitCategory || (isAnime ? 'ANIME' : 'MANGA');

    const year = attrs.startDate ? new Date(attrs.startDate).getFullYear() : null;

    const aliases: string[] = [];
    if (attrs.titles) {
      if (attrs.titles.en_jp) aliases.push(attrs.titles.en_jp);
      if (attrs.titles.ja_jp) aliases.push(attrs.titles.ja_jp);
      if (attrs.titles.en && attrs.titles.en !== attrs.canonicalTitle) aliases.push(attrs.titles.en);
    }

    const publicationStatus = attrs.status === 'finished' ? 'FINALIZADA' : 'EM_ANDAMENTO';

    return {
      source: 'KITSU',
      externalId: String(raw.id || attrs.slug || 'unknown'),
      category,
      title: attrs.canonicalTitle || attrs.titles?.en || 'Sem título',
      originalTitle: attrs.titles?.ja_jp || null,
      romanizedTitle: attrs.titles?.en_jp || null,
      synopsis: attrs.synopsis || null,
      releaseYear: isNaN(Number(year)) ? null : year,
      originCountry: isAnime ? 'JP' : 'JP',
      publicationStatus,
      totalEpisodes: isAnime && typeof attrs.episodeCount === 'number' ? attrs.episodeCount : null,
      totalChapters: !isAnime && typeof attrs.chapterCount === 'number' ? attrs.chapterCount : null,
      totalVolumes: !isAnime && typeof attrs.volumeCount === 'number' ? attrs.volumeCount : null,
      genres: [],
      aliases: Array.from(new Set(aliases)),
      coverUrl: attrs.posterImage?.original || attrs.posterImage?.large || null,
      rawPayload: raw,
    };
  }

  async search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]> {
    const isAnime = query.category === 'ANIME';
    const endpoint = isAnime ? '/anime' : '/manga';
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('filter[text]', query.title);
    url.searchParams.set('page[limit]', '10');

    const response = await this.fetcher(url.toString(), {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Kitsu API Error: ${response.status}`);
    }

    const body = await response.json();
    const data = Array.isArray(body.data) ? body.data : [];
    return data.map((item: any) => this.normalizeItem(item, query.category));
  }
}

