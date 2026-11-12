/**
 * YuukiList — Serviço de Catálogo (Módulo Catalog)
 * Implementa as regras de negócio de listagem, consulta por slug e obtenção de capa
 */

import type {
  CatalogQueryDto,
  MediaItemDetailDto,
  MediaItemSummaryDto,
  PaginatedResponse,
  FederatedCatalogResponse,
} from '../../../../packages/shared/src/index.ts';
import { CatalogRepository, type ICatalogRepository } from '../data/catalog.repository.ts';
import { CoverStorageService } from '../data/cover-storage.service.ts';
import { CatalogFederatedSearchService } from './catalog-federated-search.service.ts';

export class CatalogService {
  private readonly repository: ICatalogRepository;
  private readonly coverStorage: CoverStorageService;
  private readonly federatedSearch: CatalogFederatedSearchService;

  constructor(
    repository: ICatalogRepository = new CatalogRepository(),
    coverStorage: CoverStorageService = new CoverStorageService(),
    federatedSearch?: CatalogFederatedSearchService
  ) {
    this.repository = repository;
    this.coverStorage = coverStorage;
    this.federatedSearch = federatedSearch || new CatalogFederatedSearchService(this.repository);
  }

  async listItems(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    return this.repository.findMany(query);
  }

  async listFederated(query: CatalogQueryDto): Promise<FederatedCatalogResponse> {
    return this.federatedSearch.searchFederated(query);
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
