/**
 * YuukiList — Cliente HTTP para TVmaze (Séries, Doramas, Episódios e Calendário)
 * Conforme Documento Mestre de Contexto (Seção 9.4) e Requisito: Audiovisual External API Integration
 */

import {
  type CanonicalExternalMediaDto,
  type ExternalSearchQuery,
  type Category,
} from '../../../../packages/shared/src/index.ts';

export interface TvmazeClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class TvmazeClient {
  readonly source = 'TVMAZE' as const;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: TvmazeClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://api.tvmaze.com';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  normalizeShow(raw: any, category: Category = 'DORAMA'): CanonicalExternalMediaDto {
    const originCountry = raw.network?.country?.code || (raw.language === 'Korean' ? 'KR' : 'JP');
    const year = raw.premiered ? new Date(raw.premiered).getFullYear() : null;

    // Remove tags HTML do summary
    const cleanSynopsis = raw.summary
      ? raw.summary.replace(/<[^>]*>?/gm, '').trim()
      : null;

    let totalEpisodes = typeof raw.totalEpisodes === 'number' ? raw.totalEpisodes : null;
    let totalSeasons = typeof raw.totalSeasons === 'number' ? raw.totalSeasons : null;

    if (!totalEpisodes && raw._embedded?.episodes && Array.isArray(raw._embedded.episodes)) {
      totalEpisodes = raw._embedded.episodes.length;
      const seasons = new Set(raw._embedded.episodes.map((ep: any) => ep.season));
      totalSeasons = seasons.size;
    }

    return {
      source: 'TVMAZE',
      externalId: String(raw.id),
      category,
      title: raw.name || 'Sem título',
      originalTitle: null,
      synopsis: cleanSynopsis,
      releaseYear: isNaN(Number(year)) ? null : year,
      originCountry,
      publicationStatus: raw.status === 'Ended' ? 'FINALIZADA' : 'EM_ANDAMENTO',
      totalEpisodes,
      totalSeasons,
      genres: Array.isArray(raw.genres) ? raw.genres : [],
      aliases: [],
      coverUrl: raw.image?.original || raw.image?.medium || null,
      rating: typeof raw.rating?.average === 'number' ? raw.rating.average : null,
      externalUrls: raw.officialSite ? { official: raw.officialSite } : undefined,
      rawPayload: raw,
    };
  }

  async search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]> {
    const url = new URL(`${this.baseUrl}/search/shows`);
    url.searchParams.set('q', query.title);

    const response = await this.fetchWithRateLimit(url.toString());
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('TVmaze API Rate Limit Exceeded (HTTP 429)');
      }
      throw new Error(`TVmaze API Error: ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : [];
    return results.map((item: any) =>
      this.normalizeShow(item.show || item, query.category || 'DORAMA')
    );
  }

  async getShowWithEpisodes(id: string | number): Promise<CanonicalExternalMediaDto | null> {
    const url = `${this.baseUrl}/shows/${id}?embed=episodes`;
    const response = await this.fetchWithRateLimit(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`TVmaze API Error: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeShow(data);
  }

  private async fetchWithRateLimit(url: string, retries = 2): Promise<Response> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await this.fetcher(url);
        if (res.status === 429 && attempt < retries) {
          attempt++;
          await new Promise((r) => setTimeout(r, 600 * attempt));
          continue;
        }
        return res;
      } catch (err) {
        if (attempt >= retries) throw err;
        attempt++;
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
    throw new Error('TVmaze request failed after retries');
  }
}

