/**
 * YuukiList — Serviço de Domínio da Biblioteca Pessoal
 * Implementa validação de compatibilidade de status por categoria,
 * regras de progresso, cálculo dinâmico de "Em dia" e isolamento por usuário.
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

    const record = await this.libraryRepository.upsert(userId, {
      mediaItemId: media.id,
      status: dto.status,
      progress,
      rating: dto.rating,
      notes: dto.notes,
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

    const updated = await this.libraryRepository.update(userId, media.id, {
      status: dto.status,
      progress,
      rating: dto.rating,
      notes: dto.notes,
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
      rating: item.rating,
      notes: item.notes,
      isUpToDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      mediaItem: mediaSummary,
    };
  }
}

