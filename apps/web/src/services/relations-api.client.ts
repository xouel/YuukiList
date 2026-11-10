/**
 * YuukiList — Cliente HTTP Frontend para Relacionamentos e Franquias
 * Conforme Documento Mestre de Contexto (Seções 3.6 e 8.9) e PRD
 */

import type {
  ItemRelationsResponseDto,
  FranchiseDto,
} from '../../../../packages/shared/src/index.ts';

export class RelationsApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  async getItemRelations(slug: string): Promise<ItemRelationsResponseDto> {
    const res = await fetch(`${this.baseUrl}/catalog/items/${encodeURIComponent(slug)}/relations`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { mediaItemId: slug, franchise: null, relations: [] };
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao consultar relacionamentos da obra');
    }

    return res.json();
  }

  async getFranchise(slug: string): Promise<FranchiseDto> {
    const res = await fetch(`${this.baseUrl}/franchises/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao carregar franquia');
    }

    return res.json();
  }
}

