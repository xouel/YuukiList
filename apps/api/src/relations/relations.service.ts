/**
 * YuukiList — Serviço de Relacionamentos e Franquias
 * Conforme Documento Mestre de Contexto (Seções 3.6 e 8.9) e PRD
 */

import {
  type MediaRelationDto,
  type FranchiseDto,
  type FranchiseItemDto,
  type ItemRelationsResponseDto,
  getInvertedRelationType,
} from '../../../../packages/shared/src/index.ts';
import { RelationsRepository } from './relations.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class RelationsService {
  private readonly relationsRepo: RelationsRepository;
  private readonly catalogRepo: CatalogRepository;
  private readonly libraryRepo?: LibraryRepository;

  constructor(
    relationsRepo: RelationsRepository,
    catalogRepo: CatalogRepository,
    libraryRepo?: LibraryRepository
  ) {
    this.relationsRepo = relationsRepo;
    this.catalogRepo = catalogRepo;
    this.libraryRepo = libraryRepo;
  }

  async getRelationsForMediaItem(
    mediaItemIdOrSlug: string,
    userId?: string
  ): Promise<ItemRelationsResponseDto> {
    const media =
      (await this.catalogRepo.findById(mediaItemIdOrSlug)) ||
      (await this.catalogRepo.findBySlug(mediaItemIdOrSlug));

    if (!media) {
      return {
        mediaItemId: mediaItemIdOrSlug,
        franchise: null,
        relations: [],
      };
    }

    const rawRelations = this.relationsRepo.findRelationsByMediaItemId(media.id);
    const enrichedRelations: MediaRelationDto[] = [];

    for (const raw of rawRelations) {
      const isDirect = raw.mediaItemId === media.id;
      const relatedId = isDirect ? raw.relatedMediaItemId : raw.mediaItemId;
      const relationType = isDirect
        ? raw.relationType
        : getInvertedRelationType(raw.relationType);

      const relatedMediaItem = await this.catalogRepo.findById(relatedId);
      if (!relatedMediaItem) continue;

      let userLibraryStatus: MediaRelationDto['userLibraryStatus'] = undefined;
      if (userId && this.libraryRepo) {
        const libEntry = await this.libraryRepo.findByUserAndMedia(userId, relatedId);
        if (libEntry) {
          userLibraryStatus = {
            status: libEntry.status,
            progress: libEntry.progress,
            isFavorite: libEntry.isFavorite,
          };
        }
      }

      enrichedRelations.push({
        id: raw.id,
        mediaItemId: media.id,
        relatedMediaItemId: relatedId,
        relationType,
        relatedMedia: {
          id: relatedMediaItem.id,
          slug: relatedMediaItem.slug,
          title: relatedMediaItem.title,
          originalTitle: relatedMediaItem.originalTitle,
          category: relatedMediaItem.category,
          coverUrl: relatedMediaItem.coverUrl,
          releaseYear: relatedMediaItem.releaseYear,
          publicationStatus: relatedMediaItem.publicationStatus,
        },
        userLibraryStatus,
      });
    }

    // Busca a franquia correspondente à obra
    const rawFranchise = this.relationsRepo.findFranchiseByMediaItemId(media.id);
    let enrichedFranchise: FranchiseDto | null = null;

    if (rawFranchise) {
      enrichedFranchise = await this.enrichFranchise(rawFranchise, userId);
    }

    return {
      mediaItemId: media.id,
      franchise: enrichedFranchise,
      relations: enrichedRelations,
    };
  }

  async getFranchiseBySlug(
    slug: string,
    userId?: string
  ): Promise<FranchiseDto | null> {
    const rawFranchise = this.relationsRepo.findFranchiseBySlug(slug);
    if (!rawFranchise) {
      return null;
    }

    return this.enrichFranchise(rawFranchise, userId);
  }

  private async enrichFranchise(
    raw: ReturnType<RelationsRepository['findFranchiseBySlug']> extends infer R ? NonNullable<R> : never,
    userId?: string
  ): Promise<FranchiseDto> {
    const items: FranchiseItemDto[] = [];

    for (const itemRef of raw.items) {
      const media = await this.catalogRepo.findById(itemRef.mediaItemId);
      if (!media) continue;

      let userLibraryStatus: FranchiseItemDto['userLibraryStatus'] = undefined;
      if (userId && this.libraryRepo) {
        const libEntry = await this.libraryRepo.findByUserAndMedia(userId, itemRef.mediaItemId);
        if (libEntry) {
          userLibraryStatus = {
            status: libEntry.status,
            progress: libEntry.progress,
            isFavorite: libEntry.isFavorite,
          };
        }
      }

      items.push({
        mediaItemId: media.id,
        slug: media.slug,
        title: media.title,
        originalTitle: media.originalTitle,
        category: media.category,
        coverUrl: media.coverUrl,
        releaseYear: media.releaseYear,
        releaseOrder: itemRef.releaseOrder,
        chronologicalOrder: itemRef.chronologicalOrder,
        roleInFranchise: itemRef.roleInFranchise,
        userLibraryStatus,
      });
    }

    return {
      id: raw.id,
      slug: raw.slug,
      name: raw.name,
      originalName: raw.originalName,
      description: raw.description,
      items,
    };
  }
}
