import crypto from 'node:crypto';
import type {
  HistoryEventType,
  PersonalStatus,
  HistoryFilterDto,
} from '../../../../packages/shared/src/index.ts';

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
    const id = `hevt_${crypto.randomUUID()}`;
    const now = new Date();
    const occurredAt = data.occurredAt ? new Date(data.occurredAt) : now;

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
    const record = this.events.get(id);
    return record ? { ...record } : null;
  }

  async findMany(
    userId: string,
    filter?: HistoryFilterDto
  ): Promise<HistoryEventRecord[]> {
    let result: HistoryEventRecord[] = [];

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

    // Ordenação cronológica decrescente por data da ocorrência
    result.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    // Paginação
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
    const record = this.events.get(id);
    if (!record || record.userId !== userId) return false;
    return this.events.delete(id);
  }

  async deleteAllByUser(userId: string): Promise<number> {
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
    const records = await this.findMany(userId, filter);
    return records.length;
  }
}

