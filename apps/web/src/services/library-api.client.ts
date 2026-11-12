/**
 * YuukiList — Cliente HTTP Tipado da Biblioteca Pessoal
 * Conforme Requisito: Personal Library View and Layout Toggle
 */

import type {
  CreateLibraryItemDto,
  UpdateLibraryItemDto,
  LibraryFilterDto,
  LibraryItemDto,
  PaginatedResponse,
} from '../../../../packages/shared/src/index.ts';

export class LibraryApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'LibraryApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type FetchFunction = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface LibraryApiClientOptions {
  baseUrl?: string;
  fetcher?: FetchFunction;
}

export class LibraryApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: FetchFunction;

  constructor(options: LibraryApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : '';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  buildQueryString(filter: LibraryFilterDto = {}): string {
    const params = new URLSearchParams();

    if (filter.status) {
      params.set('status', filter.status);
    }
    if (filter.category) {
      params.set('category', filter.category);
    }
    if (filter.isFavorite !== undefined) {
      params.set('isFavorite', String(filter.isFavorite));
    }
    if (filter.originCountry) {
      params.set('originCountry', filter.originCountry);
    }
    if (filter.sortBy) {
      params.set('sortBy', filter.sortBy);
    }
    if (filter.page && filter.page > 0) {
      params.set('page', String(filter.page));
    }
    if (filter.limit && filter.limit > 0) {
      params.set('limit', String(filter.limit));
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async list(filter: LibraryFilterDto = {}): Promise<PaginatedResponse<LibraryItemDto> & { items: LibraryItemDto[] }> {
    const qs = this.buildQueryString(filter);
    const url = `${this.baseUrl}/api/v1/library${qs}`;

    try {
      const response = await this.fetcher(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LibraryApiError(
          errorData.message || 'Erro ao consultar biblioteca',
          response.status,
          response.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR'
        );
      }

      const data = await response.json();
      const rawItems: LibraryItemDto[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      return {
        ...data,
        data: rawItems,
        items: rawItems,
        meta: data?.meta || { total: rawItems.length, page: 1, limit: 20, totalPages: 1 },
      };
    } catch (err: any) {
      if (err instanceof LibraryApiError) throw err;
      throw new LibraryApiError(
        err.message || 'Falha de comunicação com o servidor',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Alias de conveniência para list(filter).
   */
  async listItems(filter: LibraryFilterDto = {}): Promise<PaginatedResponse<LibraryItemDto> & { items: LibraryItemDto[] }> {
    return this.list(filter);
  }

  async getItem(mediaItemId: string): Promise<LibraryItemDto> {
    const url = `${this.baseUrl}/api/v1/library/items/${encodeURIComponent(mediaItemId)}`;

    try {
      const response = await this.fetcher(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LibraryApiError(
          errorData.message || 'Item não encontrado na biblioteca',
          response.status,
          response.status === 404 ? 'NOT_FOUND' : 'API_ERROR'
        );
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      if (err instanceof LibraryApiError) throw err;
      throw new LibraryApiError(
        err.message || 'Falha de comunicação com o servidor',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async addItem(dto: CreateLibraryItemDto): Promise<LibraryItemDto> {
    const url = `${this.baseUrl}/api/v1/library/items`;

    try {
      const response = await this.fetcher(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LibraryApiError(
          errorData.message || 'Erro ao adicionar item à biblioteca',
          response.status,
          response.status === 400 ? 'INVALID_STATUS' : 'API_ERROR'
        );
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      if (err instanceof LibraryApiError) throw err;
      throw new LibraryApiError(
        err.message || 'Falha de comunicação com o servidor',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async updateItem(mediaItemId: string, dto: UpdateLibraryItemDto): Promise<LibraryItemDto> {
    const url = `${this.baseUrl}/api/v1/library/items/${encodeURIComponent(mediaItemId)}`;

    try {
      const response = await this.fetcher(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LibraryApiError(
          errorData.message || 'Erro ao atualizar item da biblioteca',
          response.status,
          response.status === 400 ? 'INVALID_PROGRESS' : 'API_ERROR'
        );
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      if (err instanceof LibraryApiError) throw err;
      throw new LibraryApiError(
        err.message || 'Falha de comunicação com o servidor',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async removeItem(mediaItemId: string): Promise<{ success: boolean }> {
    const url = `${this.baseUrl}/api/v1/library/items/${encodeURIComponent(mediaItemId)}`;

    try {
      const response = await this.fetcher(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LibraryApiError(
          errorData.message || 'Erro ao remover item da biblioteca',
          response.status,
          'API_ERROR'
        );
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      if (err instanceof LibraryApiError) throw err;
      throw new LibraryApiError(
        err.message || 'Falha de comunicação com o servidor',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}

