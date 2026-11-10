/**
 * YuukiList — Contratos e DTOs de Relacionamentos entre Obras e Franquias
 * Conforme Documento Mestre de Contexto (Seções 3.6 e 8.9) e PRD
 */

import type { Category } from './media-item.ts';
import type { PersonalStatus } from './library.ts';

export type MediaRelationType =
  | 'ADAPTATION'
  | 'PREQUEL'
  | 'SEQUEL'
  | 'SPIN_OFF'
  | 'SIDE_STORY'
  | 'ALTERNATIVE_VERSION'
  | 'RELATED';

export interface RelatedMediaSummaryDto {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  category: Category;
  coverUrl: string;
  releaseYear?: number;
  publicationStatus: string;
}

export interface UserLibraryStatusDto {
  status: PersonalStatus;
  progress: number;
  isFavorite?: boolean;
}

export interface MediaRelationDto {
  id: string;
  mediaItemId: string;
  relatedMediaItemId: string;
  relationType: MediaRelationType;
  relatedMedia: RelatedMediaSummaryDto;
  userLibraryStatus?: UserLibraryStatusDto;
}

export interface FranchiseItemDto {
  mediaItemId: string;
  slug: string;
  title: string;
  originalTitle?: string;
  category: Category;
  coverUrl: string;
  releaseYear?: number;
  releaseOrder: number;
  chronologicalOrder: number;
  roleInFranchise?: string;
  userLibraryStatus?: UserLibraryStatusDto;
}

export interface FranchiseDto {
  id: string;
  slug: string;
  name: string;
  originalName?: string;
  description?: string;
  items: FranchiseItemDto[];
}

export interface ItemRelationsResponseDto {
  mediaItemId: string;
  franchise: FranchiseDto | null;
  relations: MediaRelationDto[];
}

/**
 * Função pura para inferir a relação inversa semântica (TR-001)
 */
export function getInvertedRelationType(type: MediaRelationType): MediaRelationType {
  switch (type) {
    case 'PREQUEL':
      return 'SEQUEL';
    case 'SEQUEL':
      return 'PREQUEL';
    case 'ADAPTATION':
      return 'ADAPTATION';
    case 'SPIN_OFF':
      return 'SPIN_OFF';
    case 'SIDE_STORY':
      return 'SIDE_STORY';
    case 'ALTERNATIVE_VERSION':
      return 'ALTERNATIVE_VERSION';
    case 'RELATED':
    default:
      return 'RELATED';
  }
}
