/**
 * YuukiList — Controller de Catálogo (Módulo Catalog)
 * Endpoints REST:
 * - GET /api/v1/catalog/items
 * - GET /api/v1/catalog/items/:slug
 * - GET /api/v1/catalog/items/:slug/cover
 */

import type {
  CatalogQueryDto,
  MediaItemDetailDto,
  MediaItemSummaryDto,
  PaginatedResponse,
  FederatedCatalogResponse,
} from '../../../../packages/shared/src/index.ts';
import { CatalogService } from './catalog.service.ts';

export class CatalogNotFoundError extends Error {
  readonly statusCode = 404;
  readonly error = 'Not Found';

  constructor(slug: string) {
    super(`Obra com slug '${slug}' não encontrada no catálogo.`);
    this.name = 'CatalogNotFoundError';
  }
}

export class CatalogController {
  private readonly service: CatalogService;

  constructor(service: CatalogService = new CatalogService()) {
    this.service = service;
  }

  async list(query: CatalogQueryDto = {}): Promise<FederatedCatalogResponse> {
    return this.service.listFederated(query);
  }

  async getBySlug(slug: string): Promise<MediaItemDetailDto> {
    const item = await this.service.getItemBySlug(slug);
    if (!item) {
      throw new CatalogNotFoundError(slug);
    }
    return item;
  }

  getCover(slug: string): { contentType: 'image/svg+xml'; svg: string; isFallback: boolean } {
    return this.service.getItemCover(slug);
  }
}
