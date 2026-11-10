/**
 * YuukiList — Serviço de Domínio do Diário Pessoal, Histórico e Proteção Anti-Spoiler
 * Implementa lifecycle de eventos (automáticos e manuais), desacoplamento estrito da biblioteca,
 * anotações por unidade e cálculo de visibilidade de spoilers.
 */

import {
  type HistoryEventDto,
  type CreateHistoryEventDto,
  type UpdateHistoryEventDto,
  type HistoryFilterDto,
  computeSpoilerVisibility,
} from '../../../../packages/shared/src/index.ts';
import { type ICatalogRepository, CatalogRepository } from '../data/catalog.repository.ts';
import { DiaryRepository, type HistoryEventRecord } from './diary.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class DiaryService {
  private readonly diaryRepository: DiaryRepository;
  private readonly catalogRepository: ICatalogRepository;
  private readonly libraryRepository?: LibraryRepository;

  constructor(
    diaryRepository: DiaryRepository = new DiaryRepository(),
    catalogRepository: ICatalogRepository = new CatalogRepository(),
    libraryRepository?: LibraryRepository
  ) {
    this.diaryRepository = diaryRepository;
    this.catalogRepository = catalogRepository;
    this.libraryRepository = libraryRepository;
  }

  async createEvent(
    userId: string,
    dto: CreateHistoryEventDto
  ): Promise<HistoryEventDto> {
    const record = await this.diaryRepository.create(userId, dto);
    return this.mapToDto(record, userId);
  }

  async listEvents(
    userId: string,
    filter?: HistoryFilterDto,
    viewerId?: string
  ): Promise<HistoryEventDto[]> {
    const records = await this.diaryRepository.findMany(userId, filter);
    const dtos: HistoryEventDto[] = [];

    for (const record of records) {
      const dto = await this.mapToDto(record, viewerId || userId);
      dtos.push(dto);
    }

    return dtos;
  }

  async updateEvent(
    userId: string,
    id: string,
    dto: UpdateHistoryEventDto
  ): Promise<HistoryEventDto> {
    const updated = await this.diaryRepository.update(userId, id, dto);
    if (!updated) {
      throw new Error(`Evento de histórico não encontrado: ${id}`);
    }
    return this.mapToDto(updated, userId);
  }

  async deleteEvent(
    userId: string,
    id: string
  ): Promise<{ success: boolean }> {
    const success = await this.diaryRepository.delete(userId, id);
    if (!success) {
      throw new Error(`Evento de histórico não encontrado: ${id}`);
    }
    return { success: true };
  }

  private async mapToDto(
    record: HistoryEventRecord,
    viewerId?: string
  ): Promise<HistoryEventDto> {
    const media = await this.catalogRepository.findById(record.mediaItemId);

    let viewerProgress: number | null = null;
    if (this.libraryRepository && viewerId) {
      const libraryItem = await this.libraryRepository.findByUserAndMedia(viewerId, record.mediaItemId);
      if (libraryItem) {
        viewerProgress = libraryItem.progress;
      }
    }

    const spoilerCheck = computeSpoilerVisibility({
      containsSpoiler: record.containsSpoiler,
      targetUnit: record.episodeNumber || record.chapterNumber,
      viewerProgress,
      isAuthor: Boolean(viewerId && viewerId === record.userId),
      isAnonymous: !viewerId,
    });

    return {
      id: record.id,
      userId: record.userId,
      mediaItemId: record.mediaItemId,
      type: record.type,
      occurredAt: record.occurredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      previousStatus: record.previousStatus,
      newStatus: record.newStatus,
      previousProgress: record.previousProgress,
      newProgress: record.newProgress,
      rating: record.rating,
      isFavorite: record.isFavorite,
      rewatchCount: record.rewatchCount,
      note: record.note,
      episodeNumber: record.episodeNumber,
      chapterNumber: record.chapterNumber,
      volumeNumber: record.volumeNumber,
      containsSpoiler: record.containsSpoiler,
      isMasked: spoilerCheck.isMasked,
      mediaItem: media
        ? {
            id: media.id,
            slug: media.slug,
            title: media.title,
            originalTitle: media.originalTitle,
            category: media.category,
            coverUrl: media.coverUrl,
          }
        : null,
    };
  }
}

