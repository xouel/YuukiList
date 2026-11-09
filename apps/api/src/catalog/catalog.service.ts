/**
 * YuukiList — Serviço de Catálogo (Módulo Catalog)
 * Implementa as regras de negócio de listagem, consulta por slug e obtenção de capa
 */

import type {
  CatalogQueryDto,
  MediaItemDetailDto,
  MediaItemSummaryDto,
  PaginatedResponse,
} from '../../../../packages/shared/src/index.ts';
import { CatalogRepository, type ICatalogRepository } from '../data/catalog.repository.ts';
import { CoverStorageService } from '../data/cover-storage.service.ts';

export class CatalogService {
  private readonly repository: ICatalogRepository;
  private readonly coverStorage: CoverStorageService;

  constructor(
    repository: ICatalogRepository = new CatalogRepository(),
    coverStorage: CoverStorageService = new CoverStorageService()
  ) {
    this.repository = repository;
    this.coverStorage = coverStorage;
  }

  async listItems(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    return this.repository.findMany(query);
  }

  async getItemBySlug(slug: string): Promise<MediaItemDetailDto | null> {
    return this.repository.findBySlug(slug);
  }

  async getItemById(id: string): Promise<MediaItemDetailDto | null> {
    return this.repository.findById(id);
  }

  getItemCover(slug: string) {
    return this.coverStorage.getCoverBySlug(slug);
  }
}
