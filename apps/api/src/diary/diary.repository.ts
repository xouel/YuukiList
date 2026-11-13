import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import type {
  HistoryEventType,
  PersonalStatus,
  HistoryFilterDto,
} from '../../../../packages/shared/src/index.ts';
import {
  isValidUuid,
  resolveCatalogMediaUuid,
  resolveOptionalPrismaClient,
} from '../data/prisma-client.util.ts';

export interface HistoryEventRecord {
  id: string;
  userId: string;
  mediaItemId: string;
  type: HistoryEventType;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  previousStatus: PersonalStatus | null;
  newStatus: PersonalStatus | null;
  previousProgress: number | null;
  newProgress: number | null;
  rating: number | null;
  isFavorite: boolean | null;
  rewatchCount: number | null;
  note: string | null;
  episodeNumber: number | null;
  chapterNumber: number | null;
  volumeNumber: number | null;
  containsSpoiler: boolean;
}

export class DiaryRepository {
  private events: Map<string, HistoryEventRecord> = new Map();
  private prisma: PrismaClient | null = null;

  constructor(customPrisma?: PrismaClient | null) {
    this.prisma = resolveOptionalPrismaClient(customPrisma);
  }

  private mapPrismaRecord(row: any): HistoryEventRecord {
    return {
      id: String(row.id),
      userId: String(row.userId),
      mediaItemId: String(row.mediaItemId),
      type: row.type as HistoryEventType,
      occurredAt: new Date(row.occurredAt),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      previousStatus: (row.previousStatus ?? null) as PersonalStatus | null,
      newStatus: (row.newStatus ?? null) as PersonalStatus | null,
      previousProgress: row.previousProgress ?? null,
      newProgress: row.newProgress ?? null,
      rating: row.rating ?? null,
      isFavorite: row.isFavorite ?? null,
      rewatchCount: row.rewatchCount ?? null,
      note: row.note ?? null,
      episodeNumber: row.episodeNumber ?? null,
      chapterNumber: row.chapterNumber ?? null,
      volumeNumber: row.volumeNumber ?? null,
      containsSpoiler: Boolean(row.containsSpoiler),
    };
  }

  private async buildPrismaWhere(
    userId: string,
    filter?: HistoryFilterDto
  ): Promise<Record<string, any>> {
    const where: Record<string, any> = { userId };

    if (filter?.mediaItemId) {
      where.mediaItemId = await resolveCatalogMediaUuid(this.prisma, filter.mediaItemId);
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.containsSpoiler !== undefined) {
      where.containsSpoiler = filter.containsSpoiler;
    }

    if (filter?.startDate || filter?.endDate) {
      where.occurredAt = {
        ...(filter.startDate ? { gte: new Date(filter.startDate) } : {}),
        ...(filter.endDate ? { lte: new Date(filter.endDate) } : {}),
      };
    }

    return where;
  }

  async create(
    userId: string,
    data: {
      mediaItemId: string;
      type: HistoryEventType;
      occurredAt?: string | Date;
      note?: string | null;
      episodeNumber?: number | null;
      chapterNumber?: number | null;
      volumeNumber?: number | null;
      containsSpoiler?: boolean;
      previousStatus?: PersonalStatus | null;
      newStatus?: PersonalStatus | null;
      previousProgress?: number | null;
      newProgress?: number | null;
      rating?: number | null;
      isFavorite?: boolean | null;
      rewatchCount?: number | null;
    }
  ): Promise<HistoryEventRecord> {
    const now = new Date();
    const occurredAt = data.occurredAt ? new Date(data.occurredAt) : now;

    if (this.prisma) {
      const resolvedMediaId = await resolveCatalogMediaUuid(this.prisma, data.mediaItemId);
      const created = await (this.prisma as any).historyEvent.create({
        data: {
          userId,
          mediaItemId: resolvedMediaId,
          type: data.type,
          occurredAt,
          previousStatus: data.previousStatus ?? null,
          newStatus: data.newStatus ?? null,
          previousProgress: data.previousProgress ?? null,
          newProgress: data.newProgress ?? null,
          rating: data.rating ?? null,
          isFavorite: data.isFavorite ?? null,
          rewatchCount: data.rewatchCount ?? null,
          note: data.note ?? null,
          episodeNumber: data.episodeNumber ?? null,
          chapterNumber: data.chapterNumber ?? null,
          volumeNumber: data.volumeNumber ?? null,
          containsSpoiler: Boolean(data.containsSpoiler),
        },
      });
      return this.mapPrismaRecord(created);
    }

    const id = `hevt_${crypto.randomUUID()}`;
    const record: HistoryEventRecord = {
      id,
      userId,
      mediaItemId: data.mediaItemId,
      type: data.type,
      occurredAt,
      createdAt: now,
      updatedAt: now,
      previousStatus: data.previousStatus ?? null,
      newStatus: data.newStatus ?? null,
      previousProgress: data.previousProgress ?? null,
      newProgress: data.newProgress ?? null,
      rating: data.rating ?? null,
      isFavorite: data.isFavorite ?? null,
      rewatchCount: data.rewatchCount ?? null,
      note: data.note ?? null,
      episodeNumber: data.episodeNumber ?? null,
      chapterNumber: data.chapterNumber ?? null,
      volumeNumber: data.volumeNumber ?? null,
      containsSpoiler: Boolean(data.containsSpoiler),
    };

    this.events.set(id, record);
    return { ...record };
  }

  async findById(id: string): Promise<HistoryEventRecord | null> {
    if (this.prisma) {
      if (!isValidUuid(id)) return null;
      const row = await (this.prisma as any).historyEvent.findUnique({ where: { id } });
      return row ? this.mapPrismaRecord(row) : null;
    }

    const record = this.events.get(id);
    return record ? { ...record } : null;
  }

  async findMany(
    userId: string,
    filter?: HistoryFilterDto
  ): Promise<HistoryEventRecord[]> {
    if (this.prisma) {
      const where = await this.buildPrismaWhere(userId, filter);
      const page = filter?.page || 1;
      const limit = filter?.limit || 100;
      const rows = await (this.prisma as any).historyEvent.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return rows.map((r: any) => this.mapPrismaRecord(r));
    }

    const result: HistoryEventRecord[] = [];

    for (const record of this.events.values()) {
      if (record.userId !== userId) continue;

      if (filter?.mediaItemId && record.mediaItemId !== filter.mediaItemId) {
        continue;
      }

      if (filter?.type && record.type !== filter.type) {
        continue;
      }

      if (filter?.containsSpoiler !== undefined && record.containsSpoiler !== filter.containsSpoiler) {
        continue;
      }

      if (filter?.startDate) {
        const start = new Date(filter.startDate).getTime();
        if (record.occurredAt.getTime() < start) continue;
      }

      if (filter?.endDate) {
        const end = new Date(filter.endDate).getTime();
        if (record.occurredAt.getTime() > end) continue;
      }

      result.push({ ...record });
    }

    result.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const page = filter?.page || 1;
    const limit = filter?.limit || 100;
    const start = (page - 1) * limit;
    return result.slice(start, start + limit);
  }

  async update(
    userId: string,
    id: string,
    data: {
      occurredAt?: string | Date;
      note?: string | null;
      containsSpoiler?: boolean;
      episodeNumber?: number | null;
      chapterNumber?: number | null;
      volumeNumber?: number | null;
    }
  ): Promise<HistoryEventRecord | null> {
    if (this.prisma) {
      if (!isValidUuid(id)) return null;
      const existing = await (this.prisma as any).historyEvent.findFirst({
        where: { id, userId },
      });
      if (!existing) return null;

      const updateData: Record<string, any> = {};
      if (data.occurredAt !== undefined) updateData.occurredAt = new Date(data.occurredAt);
      if (data.note !== undefined) updateData.note = data.note;
      if (data.containsSpoiler !== undefined) updateData.containsSpoiler = data.containsSpoiler;
      if (data.episodeNumber !== undefined) updateData.episodeNumber = data.episodeNumber;
      if (data.chapterNumber !== undefined) updateData.chapterNumber = data.chapterNumber;
      if (data.volumeNumber !== undefined) updateData.volumeNumber = data.volumeNumber;

      const updated = await (this.prisma as any).historyEvent.update({
        where: { id },
        data: updateData,
      });
      return this.mapPrismaRecord(updated);
    }

    const record = this.events.get(id);
    if (!record || record.userId !== userId) return null;

    const updated: HistoryEventRecord = {
      ...record,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : record.occurredAt,
      note: data.note !== undefined ? data.note : record.note,
      containsSpoiler: data.containsSpoiler !== undefined ? data.containsSpoiler : record.containsSpoiler,
      episodeNumber: data.episodeNumber !== undefined ? data.episodeNumber : record.episodeNumber,
      chapterNumber: data.chapterNumber !== undefined ? data.chapterNumber : record.chapterNumber,
      volumeNumber: data.volumeNumber !== undefined ? data.volumeNumber : record.volumeNumber,
      updatedAt: new Date(),
    };

    this.events.set(id, updated);
    return { ...updated };
  }

  async delete(userId: string, id: string): Promise<boolean> {
    if (this.prisma) {
      if (!isValidUuid(id)) return false;
      const result = await (this.prisma as any).historyEvent.deleteMany({
        where: { id, userId },
      });
      return result.count > 0;
    }

    const record = this.events.get(id);
    if (!record || record.userId !== userId) return false;
    return this.events.delete(id);
  }

  async deleteAllByUser(userId: string): Promise<number> {
    if (this.prisma) {
      const result = await (this.prisma as any).historyEvent.deleteMany({
        where: { userId },
      });
      return result.count;
    }

    let count = 0;
    for (const [id, record] of this.events.entries()) {
      if (record.userId === userId) {
        this.events.delete(id);
        count++;
      }
    }
    return count;
  }

  async count(userId: string, filter?: HistoryFilterDto): Promise<number> {
    if (this.prisma) {
      const where = await this.buildPrismaWhere(userId, filter);
      return (this.prisma as any).historyEvent.count({ where });
    }

    const records = await this.findMany(userId, filter);
    return records.length;
  }
}
