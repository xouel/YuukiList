/**
 * YuukiList — Serviço de Domínio da Biblioteca Pessoal
 * Implementa validação de compatibilidade de status por categoria,
 * regras de progresso, cálculo dinâmico de "Em dia", favoritos, ciclos de reassistir e isolamento por usuário.
 */

import {
  type Category,
  type CreateLibraryItemDto,
  type UpdateLibraryItemDto,
  type LibraryItemDto,
  type LibraryFilterDto,
  type PaginatedResponse,
  type MediaItemSummaryDto,
  isStatusAllowedForCategory,
  calculateIsUpToDate,
} from '../../../../packages/shared/src/index.ts';
import { type ICatalogRepository, CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository, type UserLibraryRecord } from './library.repository.ts';
import {
  IncompatibleStatusError,
  InvalidProgressError,
  LibraryItemNotFoundError,
  MediaItemNotFoundError,
} from './library.errors.ts';

export class LibraryService {
  private readonly libraryRepository: LibraryRepository;
  private readonly catalogRepository: ICatalogRepository;

  constructor(
    libraryRepository: LibraryRepository = new LibraryRepository(),
    catalogRepository: ICatalogRepository = new CatalogRepository()
  ) {
    this.libraryRepository = libraryRepository;
    this.catalogRepository = catalogRepository;
  }

  private getTotalUnits(category: Category, media: { totalEpisodes?: number | null; totalChapters?: number | null }): number | null {
    if (category === 'DORAMA' || category === 'ANIME') {
      return typeof media.totalEpisodes === 'number' ? media.totalEpisodes : null;
    }
    if (category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') {
      return typeof media.totalChapters === 'number' ? media.totalChapters : null;
    }
    return null;
  }

  async addOrUpdateItem(userId: string, dto: CreateLibraryItemDto): Promise<LibraryItemDto> {
    if (!dto || !dto.mediaItemId) {
      throw new MediaItemNotFoundError('Identificador da obra não informado');
    }

    const media = await this.catalogRepository.findById(dto.mediaItemId);
    if (!media) {
      throw new MediaItemNotFoundError(`Obra '${dto.mediaItemId}' não encontrada no catálogo`);
    }

    if (!isStatusAllowedForCategory(dto.status, media.category)) {
      throw new IncompatibleStatusError(
        `Status '${dto.status}' é incompatível com a categoria '${media.category}'`
      );
    }

    const totalUnits = this.getTotalUnits(media.category, media);
    let progress = dto.progress !== undefined ? dto.progress : 0;

    if (media.category === 'FILME') {
      progress = 0;
    } else {
      if (progress < 0 || !Number.isInteger(progress)) {
        throw new InvalidProgressError('Progresso não pode ser negativo ou fracionário');
      }
      if (typeof totalUnits === 'number' && totalUnits > 0 && progress > totalUnits) {
        throw new InvalidProgressError(
          `Progresso (${progress}) não pode ser superior ao total de unidades cadastradas (${totalUnits})`
        );
      }
    }

    if (dto.rating !== undefined && dto.rating !== null) {
      if (typeof dto.rating !== 'number' || dto.rating < 0 || dto.rating > 10) {
        throw new InvalidProgressError('Nota pessoal deve estar no intervalo de 0 a 10');
      }
    }

    if (dto.rewatchCount !== undefined && dto.rewatchCount < 0) {
      throw new InvalidProgressError('Contador de reassistir não pode ser negativo');
    }

    if (dto.progressVolumes !== undefined && dto.progressVolumes !== null && dto.progressVolumes < 0) {
      throw new InvalidProgressError('Volumes lidos não podem ser negativos');
    }

    const record = await this.libraryRepository.upsert(userId, {
      mediaItemId: media.id,
      status: dto.status,
      progress,
      progressVolumes: dto.progressVolumes,
      rating: dto.rating,
      notes: dto.notes,
      isFavorite: dto.isFavorite,
      rewatchCount: dto.rewatchCount,
    });

    const isUpToDate = calculateIsUpToDate({
      category: media.category,
      status: record.status,
      progress: record.progress,
      totalUnits,
      publicationStatus: media.publicationStatus,
    });

    return this.mapToDto(record, media, isUpToDate);
  }

  async updateItem(
    userId: string,
    mediaItemId: string,
    dto: UpdateLibraryItemDto
  ): Promise<LibraryItemDto> {
    if (!mediaItemId) {
      throw new MediaItemNotFoundError('Identificador da obra não informado');
    }

    const media = await this.catalogRepository.findById(mediaItemId);
    if (!media) {
      throw new MediaItemNotFoundError(`Obra '${mediaItemId}' não encontrada no catálogo`);
    }

    const existing = await this.libraryRepository.findByUserAndMedia(userId, media.id);
    if (!existing) {
      throw new LibraryItemNotFoundError('Item não encontrado na biblioteca pessoal');
    }

    if (dto.status !== undefined && !isStatusAllowedForCategory(dto.status, media.category)) {
      throw new IncompatibleStatusError(
        `Status '${dto.status}' é incompatível com a categoria '${media.category}'`
      );
    }

    const totalUnits = this.getTotalUnits(media.category, media);
    let progress = dto.progress;

    if (media.category === 'FILME') {
      progress = 0;
    } else if (progress !== undefined) {
      if (progress < 0 || !Number.isInteger(progress)) {
        throw new InvalidProgressError('Progresso não pode ser negativo ou fracionário');
      }
      if (typeof totalUnits === 'number' && totalUnits > 0 && progress > totalUnits) {
        throw new InvalidProgressError(
          `Progresso (${progress}) não pode ser superior ao total de unidades cadastradas (${totalUnits})`
        );
      }
    }

    if (dto.rating !== undefined && dto.rating !== null) {
      if (typeof dto.rating !== 'number' || dto.rating < 0 || dto.rating > 10) {
        throw new InvalidProgressError('Nota pessoal deve estar no intervalo de 0 a 10');
      }
    }

    if (dto.rewatchCount !== undefined && dto.rewatchCount < 0) {
      throw new InvalidProgressError('Contador de reassistir não pode ser negativo');
    }

    if (dto.progressVolumes !== undefined && dto.progressVolumes !== null && dto.progressVolumes < 0) {
      throw new InvalidProgressError('Volumes lidos não podem ser negativos');
    }

    const updated = await this.libraryRepository.update(userId, media.id, {
      status: dto.status,
      progress,
      progressVolumes: dto.progressVolumes,
      rating: dto.rating,
      notes: dto.notes,
      isFavorite: dto.isFavorite,
      rewatchCount: dto.rewatchCount,
    });

    if (!updated) {
      throw new LibraryItemNotFoundError('Item não encontrado na biblioteca pessoal');
    }

    const isUpToDate = calculateIsUpToDate({
      category: media.category,
      status: updated.status,
      progress: updated.progress,
      totalUnits,
      publicationStatus: media.publicationStatus,
    });

    return this.mapToDto(updated, media, isUpToDate);
  }

  async removeItem(userId: string, mediaItemId: string): Promise<{ success: boolean }> {
    if (!mediaItemId) {
      throw new MediaItemNotFoundError('Identificador da obra não informado');
    }

    const media = await this.catalogRepository.findById(mediaItemId);
    if (!media) {
      throw new MediaItemNotFoundError(`Obra '${mediaItemId}' não encontrada no catálogo`);
    }

    const existing = await this.libraryRepository.findByUserAndMedia(userId, media.id);
    if (!existing) {
      throw new LibraryItemNotFoundError('Item não encontrado na biblioteca pessoal');
    }

    const deleted = await this.libraryRepository.delete(userId, media.id);
    return { success: deleted };
  }

  async getItem(userId: string, mediaItemId: string): Promise<LibraryItemDto> {
    if (!mediaItemId) {
      throw new MediaItemNotFoundError('Identificador da obra não informado');
    }

    const media = await this.catalogRepository.findById(mediaItemId);
    if (!media) {
      throw new MediaItemNotFoundError(`Obra '${mediaItemId}' não encontrada no catálogo`);
    }

    const item = await this.libraryRepository.findByUserAndMedia(userId, media.id);
    if (!item) {
      throw new LibraryItemNotFoundError('Item não encontrado na biblioteca pessoal');
    }

    const totalUnits = this.getTotalUnits(media.category, media);
    const isUpToDate = calculateIsUpToDate({
      category: media.category,
      status: item.status,
      progress: item.progress,
      totalUnits,
      publicationStatus: media.publicationStatus,
    });

    return this.mapToDto(item, media, isUpToDate);
  }

  async listUserLibrary(
    userId: string,
    filter: LibraryFilterDto = {}
  ): Promise<PaginatedResponse<LibraryItemDto>> {
    const { items: allUserItems } = await this.libraryRepository.findMany(userId, {
      status: filter.status,
      isFavorite: filter.isFavorite,
      page: 1,
      limit: 10000,
    });

    const enrichedList: LibraryItemDto[] = [];

    for (const item of allUserItems) {
      const media = await this.catalogRepository.findById(item.mediaItemId);
      if (!media) continue;

      if (filter.category && media.category !== filter.category) {
        continue;
      }

      if (filter.originCountry) {
        const country = (media as any).originCountry;
        if (country && country.toUpperCase() !== filter.originCountry.toUpperCase()) {
          continue;
        }
      }

      const totalUnits = this.getTotalUnits(media.category, media);
      const isUpToDate = calculateIsUpToDate({
        category: media.category,
        status: item.status,
        progress: item.progress,
        totalUnits,
        publicationStatus: media.publicationStatus,
      });

      enrichedList.push(this.mapToDto(item, media, isUpToDate));
    }

    // Ordenações Avançadas (Seção 3.4 do Documento Mestre)
    const sortBy = filter.sortBy || 'updatedAt';
    enrichedList.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return (a.mediaItem?.title || '').localeCompare(b.mediaItem?.title || '', 'pt-BR');
        case 'progress':
          return b.progress - a.progress;
        case 'rating': {
          const ratingA = typeof a.rating === 'number' ? a.rating : -1;
          const ratingB = typeof b.rating === 'number' ? b.rating : -1;
          return ratingB - ratingA;
        }
        case 'releaseYear': {
          const yearA = a.mediaItem?.releaseYear || 0;
          const yearB = b.mediaItem?.releaseYear || 0;
          return yearB - yearA;
        }
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    const total = enrichedList.length;
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const paginated = enrichedList.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  private mapToDto(
    item: UserLibraryRecord,
    media: {
      id: string;
      slug: string;
      title: string;
      originalTitle?: string | null;
      category: Category;
      publicationStatus: any;
      coverUrl: string;
      releaseYear?: number | null;
      genres: string[];
    },
    isUpToDate: boolean
  ): LibraryItemDto {
    const mediaSummary: MediaItemSummaryDto = {
      id: media.id,
      slug: media.slug,
      title: media.title,
      originalTitle: media.originalTitle,
      category: media.category,
      publicationStatus: media.publicationStatus,
      coverUrl: media.coverUrl,
      releaseYear: media.releaseYear,
      genres: media.genres,
    };

    return {
      id: item.id,
      userId: item.userId,
      mediaItemId: item.mediaItemId,
      status: item.status,
      progress: item.progress,
      progressVolumes: item.progressVolumes ?? null,
      rating: item.rating,
      notes: item.notes,
      isFavorite: item.isFavorite,
      rewatchCount: item.rewatchCount,
      isUpToDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      mediaItem: mediaSummary,
    };
  }
}
