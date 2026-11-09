/**
 * YuukiList — Cliente HTTP para MangaUpdates (Mangás, Manhwas e Manhuas)
 * Conforme Documento Mestre de Contexto (Seção 9.7) e Requisito: Literary External API Integration
 */

import {
  type CanonicalExternalMediaDto,
  type ExternalSearchQuery,
  type Category,
} from '../../../../packages/shared/src/index.ts';

export interface MangaUpdatesClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class MangaUpdatesClient {
  readonly source = 'MANGAUPDATES' as const;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: MangaUpdatesClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://api.mangaupdates.com/v1';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  normalizeSeries(raw: any): CanonicalExternalMediaDto {
    const rawType = (raw.type || '').toLowerCase();

    let category: Category = 'MANGA';
    let originCountry = 'JP';

    if (rawType === 'manhwa') {
      category = 'MANHWA';
      originCountry = 'KR';
    } else if (rawType === 'manhua') {
      category = 'MANHUA';
      originCountry = 'CN';
    }

    const year = raw.year ? parseInt(raw.year, 10) : null;

    const aliases: string[] = [];
    if (Array.isArray(raw.associated)) {
      for (const item of raw.associated) {
        if (item?.title) aliases.push(item.title);
      }
    }

    const genres: string[] = [];
    if (Array.isArray(raw.genres)) {
      for (const g of raw.genres) {
        if (g?.genre) genres.push(g.genre);
      }
    }

    const authors: string[] = [];
    if (Array.isArray(raw.authors)) {
      for (const a of raw.authors) {
        if (a?.name) authors.push(a.name);
      }
    }

    const publicationStatus =
      raw.status === 'Complete' || raw.status === 'Completed'
        ? 'FINALIZADA'
        : 'EM_ANDAMENTO';

    const latestChapter = typeof raw.latest_chapter === 'number' ? raw.latest_chapter : null;

    return {
      source: 'MANGAUPDATES',
      externalId: String(raw.series_id || raw.id || 'unknown'),
      category,
      title: raw.title || 'Sem título',
      originalTitle: aliases.find((a) => /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(a)) || null,
      synopsis: raw.description || null,
      releaseYear: isNaN(Number(year)) ? null : year,
      originCountry,
      publicationStatus,
      totalEpisodes: null,
      totalChapters: latestChapter,
      genres,
      aliases,
      authors,
      coverUrl: raw.image?.url?.original || null,
      rawPayload: raw,
    };
  }

  async search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]> {
    const url = `${this.baseUrl}/series/search`;
    const payload = {
      search: query.title,
      perpage: 10,
    };

    const response = await this.fetcher(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`MangaUpdates API Error: ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return results.map((item: any) => this.normalizeSeries(item.record || item));
  }

  async getSeriesDetails(seriesId: number | string): Promise<CanonicalExternalMediaDto | null> {
    const url = `${this.baseUrl}/series/${seriesId}`;
    const response = await this.fetcher(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`MangaUpdates API Error: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeSeries(data);
  }
}

