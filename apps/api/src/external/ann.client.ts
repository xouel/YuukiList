/**
 * YuukiList — Cliente e Adaptador XML para Anime News Network (ANN)
 * Conforme Documento Mestre de Contexto (Seção 9.6) e Requisito: Literary External API Integration
 */

import {
  type CanonicalExternalMediaDto,
  type ExternalSearchQuery,
  type Category,
} from '../../../../packages/shared/src/index.ts';

export interface AnnClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class AnnClient {
  readonly source = 'ANN' as const;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: AnnClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://cdn.animenewsnetwork.com/encyclopedia';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  parseXml(xmlText: string): CanonicalExternalMediaDto[] {
    const results: CanonicalExternalMediaDto[] = [];

    // Captura blocos de <anime ...>...</anime> ou <manga ...>...</manga>
    const itemRegex = /<(anime|manga)\s+([^>]*?)>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const tag = match[1].toLowerCase();
      const attrsStr = match[2];
      const body = match[3];

      const idMatch = attrsStr.match(/id=["'](\d+)["']/i);
      const id = idMatch ? idMatch[1] : 'unknown';

      const nameMatch = attrsStr.match(/name=["']([^"']+)["']/i);
      const defaultName = nameMatch ? nameMatch[1] : 'Sem título';

      // Parse dos elementos <info type="...">conteúdo</info>
      const infoRegex = /<info\s+[^>]*?type=["']([^"']+)["'][^>]*?(?:src=["']([^"']+)["'])?[^>]*?>([\s\S]*?)<\/info>/gi;
      let infoMatch: RegExpExecArray | null;

      let mainTitle = defaultName;
      let originalTitle: string | null = null;
      let synopsis: string | null = null;
      let episodesCount: number | null = null;
      let vintage: string | null = null;
      let coverUrl: string | null = null;
      const genres: string[] = [];
      const aliases: string[] = [];

      while ((infoMatch = infoRegex.exec(body)) !== null) {
        const type = infoMatch[1];
        const src = infoMatch[2];
        const content = infoMatch[3] ? infoMatch[3].trim() : '';

        if (type === 'Main title') {
          mainTitle = content;
        } else if (type === 'Alternative title') {
          if (content) aliases.push(content);
          if (!originalTitle && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(content)) {
            originalTitle = content;
          }
        } else if (type === 'Genres' || type === 'Themes') {
          if (content) genres.push(content.toLowerCase());
        } else if (type === 'Plot Summary') {
          synopsis = content;
        } else if (type === 'Number of episodes') {
          const num = parseInt(content, 10);
          if (!isNaN(num)) episodesCount = num;
        } else if (type === 'Vintage') {
          vintage = content;
        } else if (type === 'Picture' && src) {
          coverUrl = src;
        }
      }

      let year: number | null = null;
      if (vintage) {
        const yearMatch = vintage.match(/\b(19\d\d|20\d\d)\b/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);
      }

      const category: Category = tag === 'anime' ? 'ANIME' : 'MANGA';

      results.push({
        source: 'ANN',
        externalId: id,
        category,
        title: mainTitle,
        originalTitle,
        synopsis,
        releaseYear: year,
        originCountry: 'JP',
        totalEpisodes: episodesCount,
        genres: Array.from(new Set(genres)),
        aliases: Array.from(new Set(aliases)),
        coverUrl,
        rawPayload: { tag, id, attrs: attrsStr },
      });
    }

    return results;
  }

  async getDetailsById(id: string, type: 'anime' | 'manga' = 'anime'): Promise<CanonicalExternalMediaDto | null> {
    const url = `${this.baseUrl}/api.xml?${type}=${id}`;
    const response = await this.fetcher(url);
    if (!response.ok) {
      throw new Error(`ANN API Error: ${response.status}`);
    }

    const xml = await response.text();
    const items = this.parseXml(xml);
    return items.length > 0 ? items[0] : null;
  }

  async search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]> {
    const isAnime = query.category === 'ANIME';
    const type = isAnime ? 'anime' : 'manga';
    const url = `${this.baseUrl}/api.xml?title=~${encodeURIComponent(query.title)}`;

    const response = await this.fetcher(url);
    if (!response.ok) {
      throw new Error(`ANN API Error: ${response.status}`);
    }

    const xml = await response.text();
    return this.parseXml(xml);
  }
}

