/**
 * YuukiList — Cliente HTTP Tipado do Catálogo
 * Conforme Requisito: Catalog Exploration and Infinite Scroll Interface
 */

import type {
  CatalogQueryDto,
  MediaItemDetailDto,
  MediaItemSummaryDto,
  PaginatedResponse,
} from '../../../../packages/shared/src/index.ts';

export class CatalogApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'CatalogApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type FetchFunction = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface CatalogApiClientOptions {
  baseUrl?: string;
  fetcher?: FetchFunction;
}

export class CatalogApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: FetchFunction;

  constructor(options: CatalogApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : '';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  /**
   * Converte o objeto CatalogQueryDto em uma query string padronizada.
   */
  buildQueryString(query: CatalogQueryDto = {}): string {
    const params = new URLSearchParams();

    if (query.q && query.q.trim()) {
      params.set('q', query.q.trim());
    }
    if (query.category) {
      params.set('category', query.category);
    }
    if (query.status) {
      params.set('status', query.status);
    }
    if (query.genre && query.genre.trim()) {
      params.set('genre', query.genre.trim());
    }
    if (query.country && query.country.trim()) {
      params.set('country', query.country.trim());
    }
    if (query.theme && query.theme.trim()) {
      params.set('theme', query.theme.trim());
    }
    if (query.page && query.page > 1) {
      params.set('page', String(query.page));
    }
    if (query.limit && query.limit !== 20) {
      params.set('limit', String(query.limit));
    }
    if (query.sortBy && query.sortBy !== 'relevance') {
      params.set('sortBy', query.sortBy);
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  /**
   * Extrai um CatalogQueryDto a partir de URLSearchParams ou chave/valor.
   */
  parseQueryParams(params: URLSearchParams | Record<string, string | string[] | undefined>): CatalogQueryDto {
    const getVal = (key: string): string | undefined => {
      if (params instanceof URLSearchParams) {
        return params.get(key) || undefined;
      }
      const raw = params[key];
      return Array.isArray(raw) ? raw[0] : raw;
    };

    const q = getVal('q');
    const category = getVal('category') as CatalogQueryDto['category'];
    const status = getVal('status') as CatalogQueryDto['status'];
    const genre = getVal('genre');
    const country = getVal('country');
    const theme = getVal('theme');
    const pageRaw = getVal('page');
    const limitRaw = getVal('limit');
    const sortBy = getVal('sortBy') as CatalogQueryDto['sortBy'];

    return {
      q: q ? q.trim() : undefined,
      category: category || undefined,
      status: status || undefined,
      genre: genre ? genre.trim() : undefined,
      country: country ? country.trim() : undefined,
      theme: theme ? theme.trim() : undefined,
      page: pageRaw ? Math.max(1, parseInt(pageRaw, 10) || 1) : 1,
      limit: limitRaw ? Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 20)) : 20,
      sortBy: sortBy || undefined,
    };
  }

  /**
   * Lista itens do catálogo com filtros e suporte a cancelamento via AbortSignal.
   */
  async listItems(
    query: CatalogQueryDto = {},
    signal?: AbortSignal
  ): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    const qs = this.buildQueryString(query);
    const url = `${this.baseUrl}/api/v1/catalog/items${qs}`;

    try {
      const response = await this.fetcher(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        let errorMsg = `Erro na requisição: HTTP ${response.status}`;
        try {
          const body = await response.json();
          if (body && body.message) errorMsg = body.message;
        } catch {
          // Ignora falha de parse do erro
        }
        throw new CatalogApiError(errorMsg, response.status, `HTTP_${response.status}`);
      }

      const data = (await response.json()) as PaginatedResponse<MediaItemSummaryDto>;
      return data;
    } catch (err: unknown) {
      if (err instanceof CatalogApiError) {
        throw err;
      }
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        throw new CatalogApiError('Requisição cancelada pelo cliente.', 0, 'ABORTED');
      }
      const message = err instanceof Error ? err.message : 'Falha desconhecida na conexão com a API';
      throw new CatalogApiError(`Falha de rede ao consultar catálogo: ${message}`, 0, 'NETWORK_ERROR');
    }
  }

  /**
   * Obtém os detalhes completos de uma obra pelo slug.
   */
  async getItemBySlug(slug: string, signal?: AbortSignal): Promise<MediaItemDetailDto> {
    if (!slug || !slug.trim()) {
      throw new CatalogApiError('Slug do item não fornecido.', 400, 'BAD_REQUEST');
    }

    const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
    const url = `${this.baseUrl}/api/v1/catalog/items/${cleanSlug}`;

    try {
      const response = await this.fetcher(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (response.status === 404) {
        throw new CatalogApiError(`Obra '${slug}' não encontrada no catálogo.`, 404, 'NOT_FOUND');
      }

      if (!response.ok) {
        throw new CatalogApiError(`Erro na consulta de detalhes: HTTP ${response.status}`, response.status);
      }

      return (await response.json()) as MediaItemDetailDto;
    } catch (err: unknown) {
      if (err instanceof CatalogApiError) {
        throw err;
      }
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        throw new CatalogApiError('Requisição cancelada pelo cliente.', 0, 'ABORTED');
      }
      const message = err instanceof Error ? err.message : 'Falha de comunicação';
      throw new CatalogApiError(`Erro ao carregar detalhes da obra: ${message}`, 0, 'NETWORK_ERROR');
    }
  }

  /**
   * Retorna a URL completa da capa SVG do slug.
   */
  getItemCoverUrl(slug: string): string {
    const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
    return `${this.baseUrl}/api/v1/catalog/items/${cleanSlug}/cover`;
  }
}

