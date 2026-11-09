/**
 * YuukiList — Cliente HTTP para TMDB (The Movie Database)
 * Conforme Documento Mestre de Contexto (Seção 9.3) e Requisito: Audiovisual External API Integration
 */

import {
  type CanonicalExternalMediaDto,
  type ExternalSearchQuery,
  type Category,
} from '../../../../packages/shared/src/index.ts';

export interface TmdbClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class TmdbClient {
  readonly source = 'TMDB' as const;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: TmdbClientOptions = {}) {
    this.apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.TMDB_API_KEY : undefined);
    this.baseUrl = options.baseUrl || 'https://api.themoviedb.org/3';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  normalizeShow(raw: any, category: Category = 'DORAMA'): CanonicalExternalMediaDto {
    const originCountry = Array.isArray(raw.origin_country) && raw.origin_country.length > 0
      ? raw.origin_country[0]
      : 'KR';

    const year = raw.first_air_date ? new Date(raw.first_air_date).getFullYear() : null;

    const genres: string[] = Array.isArray(raw.genres)
      ? raw.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
      : [];

    return {
      source: 'TMDB',
      externalId: String(raw.id),
      category,
      title: raw.name || raw.title || 'Sem título',
      originalTitle: raw.original_name || raw.original_title || null,
      synopsis: raw.overview || null,
      releaseYear: isNaN(Number(year)) ? null : year,
      originCountry,
      totalEpisodes: typeof raw.number_of_episodes === 'number' ? raw.number_of_episodes : null,
      totalSeasons: typeof raw.number_of_seasons === 'number' ? raw.number_of_seasons : null,
      genres,
      aliases: raw.original_name && raw.original_name !== raw.name ? [raw.original_name] : [],
      coverUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      rating: typeof raw.vote_average === 'number' ? raw.vote_average : null,
      rawPayload: raw,
    };
  }

  normalizeMovie(raw: any): CanonicalExternalMediaDto {
    const originCountry = Array.isArray(raw.origin_country) && raw.origin_country.length > 0
      ? raw.origin_country[0]
      : 'KR';

    const year = raw.release_date ? new Date(raw.release_date).getFullYear() : null;

    const genres: string[] = Array.isArray(raw.genres)
      ? raw.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
      : [];

    return {
      source: 'TMDB',
      externalId: String(raw.id),
      category: 'FILME',
      title: raw.title || raw.name || 'Sem título',
      originalTitle: raw.original_title || raw.original_name || null,
      synopsis: raw.overview || null,
      releaseYear: isNaN(Number(year)) ? null : year,
      originCountry,
      totalEpisodes: null,
      totalSeasons: null,
      genres,
      aliases: raw.original_title && raw.original_title !== raw.title ? [raw.original_title] : [],
      coverUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      rating: typeof raw.vote_average === 'number' ? raw.vote_average : null,
      rawPayload: raw,
    };
  }

  async search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]> {
    const isMovie = query.category === 'FILME';
    const endpoint = isMovie ? '/search/movie' : '/search/tv';
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('query', query.title);
    if (this.apiKey) {
      url.searchParams.set('api_key', this.apiKey);
    }

    const response = await this.fetchWithRetry(url.toString());
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('TMDB API Rate Limit Exceeded (HTTP 429)');
      }
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return results.map((item: any) =>
      isMovie ? this.normalizeMovie(item) : this.normalizeShow(item, query.category || 'DORAMA')
    );
  }

  async getDetails(externalId: string, type: 'tv' | 'movie' = 'tv'): Promise<CanonicalExternalMediaDto | null> {
    const url = new URL(`${this.baseUrl}/${type}/${externalId}`);
    if (this.apiKey) {
      url.searchParams.set('api_key', this.apiKey);
    }

    const response = await this.fetchWithRetry(url.toString());
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    return type === 'movie' ? this.normalizeMovie(data) : this.normalizeShow(data);
  }

  private async fetchWithRetry(url: string, retries = 2): Promise<Response> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await this.fetcher(url);
        if (res.status === 429 && attempt < retries) {
          attempt++;
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        return res;
      } catch (err) {
        if (attempt >= retries) throw err;
        attempt++;
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
    throw new Error('TMDB request failed after retries');
  }
}

