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
  private readonly responseCache = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly cacheTtlMs: number;

  constructor(
    repository: ICatalogRepository = new CatalogRepository(),
    coverStorage: CoverStorageService = new CoverStorageService(),
    federatedSearch?: CatalogFederatedSearchService,
    cacheTtlMs = 60_000
  ) {
    this.repository = repository;
    this.coverStorage = coverStorage;
    this.federatedSearch = federatedSearch || new CatalogFederatedSearchService(this.repository);
    this.cacheTtlMs = cacheTtlMs;

    if (typeof this.repository.onItemUpserted === 'function') {
      this.repository.onItemUpserted(() => this.invalidateCache());
    }
  }

  invalidateCache(): void {
    this.responseCache.clear();
  }

  private buildQueryCacheKey(prefix: string, query: CatalogQueryDto): string {
    const normalizedEntries = Object.entries(query || {})
      .filter(([, value]) => value !== undefined && value !== '')
      .sort(([a], [b]) => a.localeCompare(b));
    return `${prefix}:${JSON.stringify(normalizedEntries)}`;
  }

  private async getOrLoadCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.cacheTtlMs <= 0) {
      return loader();
    }
    const now = Date.now();
    const cached = this.responseCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }
    const value = await loader();
    this.responseCache.set(key, {
      value,
      expiresAt: now + this.cacheTtlMs,
    });
    return value;
  }

  async listItems(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    const key = this.buildQueryCacheKey('listItems', query);
    return this.getOrLoadCached(key, () => this.repository.findMany(query));
  }

  async listFederated(query: CatalogQueryDto): Promise<FederatedCatalogResponse> {
    const key = this.buildQueryCacheKey('listFederated', query);
    return this.getOrLoadCached(key, () => this.federatedSearch.searchFederated(query));
  }

  async getFeaturedByCategory(): Promise<MediaItemSummaryDto[]> {
    return this.getOrLoadCached('featured:categories', () =>
      this.repository.findFeaturedPerCategory()
    );
  }

  async getItemBySlug(slug: string): Promise<MediaItemDetailDto | null> {
    const cleanSlug = (slug || '').trim().toLowerCase();
    return this.getOrLoadCached(`slug:${cleanSlug}`, () => this.repository.findBySlug(slug));
  }

  async getItemById(id: string): Promise<MediaItemDetailDto | null> {
    return this.repository.findById(id);
  }

  getItemCover(slug: string) {
    return this.coverStorage.getCoverBySlug(slug);
  }
}
