import crypto from 'node:crypto';
import type {
  Category,
  PersonalStatus,
  LibraryFilterDto,
} from '../../../../packages/shared/src/index.ts';

export interface UserLibraryRecord {
  id: string;
  userId: string;
  mediaItemId: string;
  status: PersonalStatus;
  progress: number;
  progressVolumes: number | null;
  rating: number | null;
  notes: string | null;
  isFavorite: boolean;
  rewatchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class LibraryRepository {
  private items: Map<string, UserLibraryRecord> = new Map();

  private makeKey(userId: string, mediaItemId: string): string {
    return `${userId}:${mediaItemId}`;
  }

  async upsert(
    userId: string,
    data: {
      mediaItemId: string;
      status: PersonalStatus;
      progress?: number;
      progressVolumes?: number | null;
      rating?: number | null;
      notes?: string | null;
      isFavorite?: boolean;
      rewatchCount?: number;
    }
  ): Promise<UserLibraryRecord> {
    const key = this.makeKey(userId, data.mediaItemId);
    const existing = this.items.get(key);
    const now = new Date();

    if (existing) {
      const updated: UserLibraryRecord = {
        ...existing,
        status: data.status,
        progress: typeof data.progress === 'number' ? data.progress : existing.progress,
        progressVolumes: data.progressVolumes !== undefined ? data.progressVolumes : existing.progressVolumes,
        rating: data.rating !== undefined ? data.rating : existing.rating,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        isFavorite: data.isFavorite !== undefined ? data.isFavorite : existing.isFavorite,
        rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : existing.rewatchCount,
        updatedAt: now,
      };
      this.items.set(key, updated);
      return { ...updated };
    }

    const newItem: UserLibraryRecord = {
      id: crypto.randomUUID(),
      userId,
      mediaItemId: data.mediaItemId,
      status: data.status,
      progress: typeof data.progress === 'number' ? data.progress : 0,
      progressVolumes: data.progressVolumes !== undefined ? data.progressVolumes : null,
      rating: data.rating !== undefined ? data.rating : null,
      notes: data.notes !== undefined ? data.notes : null,
      isFavorite: data.isFavorite ?? false,
      rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : 0,
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(key, newItem);
    return { ...newItem };
  }

  async findByUserAndMedia(userId: string, mediaItemId: string): Promise<UserLibraryRecord | null> {
    const key = this.makeKey(userId, mediaItemId);
    const item = this.items.get(key);
    return item ? { ...item } : null;
  }

  async update(
    userId: string,
    mediaItemId: string,
    data: {
      status?: PersonalStatus;
      progress?: number;
      progressVolumes?: number | null;
      rating?: number | null;
      notes?: string | null;
      isFavorite?: boolean;
      rewatchCount?: number;
    }
  ): Promise<UserLibraryRecord | null> {
    const key = this.makeKey(userId, mediaItemId);
    const existing = this.items.get(key);
    if (!existing) return null;

    const updated: UserLibraryRecord = {
      ...existing,
      status: data.status !== undefined ? data.status : existing.status,
      progress: typeof data.progress === 'number' ? data.progress : existing.progress,
      progressVolumes: data.progressVolumes !== undefined ? data.progressVolumes : existing.progressVolumes,
      rating: data.rating !== undefined ? data.rating : existing.rating,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      isFavorite: data.isFavorite !== undefined ? data.isFavorite : existing.isFavorite,
      rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : existing.rewatchCount,
      updatedAt: new Date(),
    };

    this.items.set(key, updated);
    return { ...updated };
  }

  async delete(userId: string, mediaItemId: string): Promise<boolean> {
    const key = this.makeKey(userId, mediaItemId);
    return this.items.delete(key);
  }

  async findMany(
    userId: string,
    filter: LibraryFilterDto = {}
  ): Promise<{ items: UserLibraryRecord[]; total: number }> {
    const userItems: UserLibraryRecord[] = [];

    for (const item of this.items.values()) {
      if (item.userId !== userId) continue;
      if (filter.status && item.status !== filter.status) continue;
      if (filter.isFavorite !== undefined && item.isFavorite !== filter.isFavorite) continue;
      userItems.push({ ...item });
    }

    // Ordenação padrão: mais recentes primeiro
    userItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
    const startIndex = (page - 1) * limit;
    const paginated = userItems.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total: userItems.length,
    };
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}
