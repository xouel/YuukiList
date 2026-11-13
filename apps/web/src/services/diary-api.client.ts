/**
 * YuukiList — Cliente HTTP Tipado do Diário Pessoal e Histórico
 * Conforme Requisitos: personal-diary e personal-diary-ui
 */

import type {
  CreateHistoryEventDto,
  UpdateHistoryEventDto,
  HistoryFilterDto,
  HistoryEventDto,
} from '../../../../packages/shared/src/index.ts';

export class DiaryApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'DiaryApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type FetchFunction = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface DiaryApiClientOptions {
  baseUrl?: string;
  fetcher?: FetchFunction;
}

export class DiaryApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: FetchFunction;

  constructor(options: DiaryApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : '';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  buildQueryString(filter: HistoryFilterDto = {}): string {
    const params = new URLSearchParams();

    if (filter.mediaItemId) {
      params.set('mediaItemId', filter.mediaItemId);
    }
    if (filter.type) {
      params.set('type', filter.type);
    }
    if (filter.startDate) {
      params.set('startDate', filter.startDate);
    }
    if (filter.endDate) {
      params.set('endDate', filter.endDate);
    }
    if (filter.containsSpoiler !== undefined) {
      params.set('containsSpoiler', String(filter.containsSpoiler));
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

  async list(filter: HistoryFilterDto = {}): Promise<HistoryEventDto[]> {
    const qs = this.buildQueryString(filter);
    const url = `${this.baseUrl}/api/v1/diary${qs}`;

    try {
      const res = await this.fetcher(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        throw await this.handleError(res);
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof DiaryApiError) throw err;
      throw new DiaryApiError(
        err?.message || 'Falha de conexão com o servidor ao consultar histórico',
        0,
        'NETWORK_FAILURE'
      );
    }
  }

  async createEvent(body: CreateHistoryEventDto): Promise<HistoryEventDto> {
    const url = `${this.baseUrl}/api/v1/diary`;

    try {
      const res = await this.fetcher(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw await this.handleError(res);
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof DiaryApiError) throw err;
      throw new DiaryApiError(
        err?.message || 'Falha de conexão com o servidor ao criar registro no diário',
        0,
        'NETWORK_FAILURE'
      );
    }
  }

  async updateEvent(id: string, body: UpdateHistoryEventDto): Promise<HistoryEventDto> {
    const url = `${this.baseUrl}/api/v1/diary/${encodeURIComponent(id)}`;

    try {
      const res = await this.fetcher(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw await this.handleError(res);
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof DiaryApiError) throw err;
      throw new DiaryApiError(
        err?.message || 'Falha de conexão com o servidor ao atualizar registro no diário',
        0,
        'NETWORK_FAILURE'
      );
    }
  }

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const url = `${this.baseUrl}/api/v1/diary/${encodeURIComponent(id)}`;

    try {
      const res = await this.fetcher(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        throw await this.handleError(res);
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof DiaryApiError) throw err;
      throw new DiaryApiError(
        err?.message || 'Falha de conexão com o servidor ao remover registro do histórico',
        0,
        'NETWORK_FAILURE'
      );
    }
  }

  private async handleError(res: Response): Promise<DiaryApiError> {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      // payload não é JSON
    }

    const message = payload?.message || payload?.error || `Erro HTTP ${res.status}`;
    const code = payload?.code || `HTTP_${res.status}`;
    return new DiaryApiError(message, res.status, code);
  }
}

