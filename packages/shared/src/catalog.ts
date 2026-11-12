/**
 * YuukiList — Contratos e DTOs de Catálogo e Busca
 */

import type { Category, PublicationStatus } from './enums.ts';
import type { MediaItemProvenance } from './external.ts';

export type CatalogSortBy = 'relevance' | 'title';

export interface CatalogQueryDto {
  q?: string;
  category?: Category;
  status?: PublicationStatus;
  genre?: string;
  country?: string;
  theme?: string;
  page?: number;
  limit?: number;
  sortBy?: CatalogSortBy;
  includeExternal?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FederatedCatalogResponse extends PaginatedResponse<MediaItemSummaryDto> {
  externalResults?: CanonicalExternalMediaDto[];
}

export interface MediaItemSummaryDto {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  category: Category;
  publicationStatus: PublicationStatus;
  coverUrl: string;
  releaseYear?: number | null;
  genres: string[];
}

export interface MediaItemDetailDto {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  category: Category;
  publicationStatus: PublicationStatus;
  synopsis?: string | null;
  totalEpisodes?: number | null;
  totalChapters?: number | null;
  totalVolumes?: number | null;
  releaseYear?: number | null;
  coverUrl: string;
  genres: string[];
  aliases: string[];
  provenance?: MediaItemProvenance | null;
}

