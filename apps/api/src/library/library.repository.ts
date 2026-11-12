import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import type {
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class LibraryRepository {
  private items: Map<string, UserLibraryRecord> = new Map();
  private prisma: PrismaClient | null = null;

  constructor(customPrisma?: PrismaClient | null) {
    const isTestRunner =
      process.env.NODE_ENV === 'test' ||
      Boolean(process.env.NODE_TEST_CONTEXT) ||
      process.argv.some((arg) => arg.endsWith('.test.mjs')) ||
      process.execArgv.some((arg) => arg === '--test');

    if (customPrisma !== undefined) {
      this.prisma = customPrisma;
    } else if (!isTestRunner && (process.env.DATABASE_URL || process.env.DIRECT_URL)) {
      try {
        this.prisma = new PrismaClient();
      } catch {
        this.prisma = null;
      }
    }
  }

  private makeKey(userId: string, mediaItemId: string): string {
    return `${userId}:${mediaItemId}`;
  }

  private async resolveMediaId(mediaItemIdOrSlug: string): Promise<string> {
    if (!this.prisma) return mediaItemIdOrSlug;
    const clean = mediaItemIdOrSlug.trim();
    const where = UUID_REGEX.test(clean)
      ? { OR: [{ id: clean }, { slug: clean.toLowerCase() }] }
      : { slug: clean.toLowerCase() };

    const media = await this.prisma.mediaItem
      .findFirst({ where, select: { id: true } })
      .catch(() => null);

    return media ? media.id : mediaItemIdOrSlug;
  }

  private mapPrismaRecord(dbItem: any): UserLibraryRecord {
    return {
      id: dbItem.id,
      userId: dbItem.userId,
      mediaItemId: dbItem.mediaItemId,
      status: dbItem.status as PersonalStatus,
      progress: dbItem.progress,
      progressVolumes: null,
      rating: dbItem.rating,
      notes: dbItem.notes,
      isFavorite: dbItem.isFavorite,
      rewatchCount: dbItem.rewatchCount,
      createdAt: dbItem.createdAt,
      updatedAt: dbItem.updatedAt,
    };
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

    let updated: UserLibraryRecord;

    if (existing) {
      updated = {
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
    } else {
      updated = {
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
    }

    this.items.set(key, updated);

    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const targetMediaId = await this.resolveMediaId(data.mediaItemId);
        if (UUID_REGEX.test(targetMediaId)) {
          const dbRec = await this.prisma.userLibraryItem.upsert({
            where: {
              userId_mediaItemId: {
                userId,
                mediaItemId: targetMediaId,
              },
            },
            update: {
              status: data.status,
              progress: typeof data.progress === 'number' ? data.progress : undefined,
              rating: data.rating !== undefined ? data.rating : undefined,
              notes: data.notes !== undefined ? data.notes : undefined,
              isFavorite: data.isFavorite !== undefined ? data.isFavorite : undefined,
              rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : undefined,
            },
            create: {
              userId,
              mediaItemId: targetMediaId,
              status: data.status,
              progress: typeof data.progress === 'number' ? data.progress : 0,
              rating: data.rating !== undefined ? data.rating : null,
              notes: data.notes !== undefined ? data.notes : null,
              isFavorite: data.isFavorite ?? false,
              rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : 0,
            },
          });

          const mapped = this.mapPrismaRecord(dbRec);
          mapped.progressVolumes = updated.progressVolumes;
          this.items.set(this.makeKey(userId, targetMediaId), mapped);
          return { ...mapped };
        }
      } catch {
        // Fallback gracioso para memória
      }
    }

    return { ...updated };
  }

  async findByUserAndMedia(userId: string, mediaItemId: string): Promise<UserLibraryRecord | null> {
    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const targetMediaId = await this.resolveMediaId(mediaItemId);
        if (UUID_REGEX.test(targetMediaId)) {
          const dbItem = await this.prisma.userLibraryItem.findUnique({
            where: {
              userId_mediaItemId: {
                userId,
                mediaItemId: targetMediaId,
              },
            },
          });

          if (dbItem) {
            const rec = this.mapPrismaRecord(dbItem);
            this.items.set(this.makeKey(userId, rec.mediaItemId), rec);
            return { ...rec };
          }
          return null;
        }
      } catch {
        // Fallback para memória
      }
    }

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
    const existing = await this.findByUserAndMedia(userId, mediaItemId);
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

    const key = this.makeKey(userId, existing.mediaItemId);
    this.items.set(key, updated);

    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const targetMediaId = await this.resolveMediaId(existing.mediaItemId);
        if (UUID_REGEX.test(targetMediaId)) {
          const dbUpdated = await this.prisma.userLibraryItem.update({
            where: {
              userId_mediaItemId: {
                userId,
                mediaItemId: targetMediaId,
              },
            },
            data: {
              status: data.status !== undefined ? data.status : undefined,
              progress: typeof data.progress === 'number' ? data.progress : undefined,
              rating: data.rating !== undefined ? data.rating : undefined,
              notes: data.notes !== undefined ? data.notes : undefined,
              isFavorite: data.isFavorite !== undefined ? data.isFavorite : undefined,
              rewatchCount: typeof data.rewatchCount === 'number' ? Math.max(0, data.rewatchCount) : undefined,
            },
          });

          const mapped = this.mapPrismaRecord(dbUpdated);
          mapped.progressVolumes = updated.progressVolumes;
          this.items.set(this.makeKey(userId, mapped.mediaItemId), mapped);
          return { ...mapped };
        }
      } catch {
        // Fallback para memória
      }
    }

    return { ...updated };
  }

  async delete(userId: string, mediaItemId: string): Promise<boolean> {
    const key = this.makeKey(userId, mediaItemId);
    const deletedMemory = this.items.delete(key);

    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const targetMediaId = await this.resolveMediaId(mediaItemId);
        if (UUID_REGEX.test(targetMediaId)) {
          this.items.delete(this.makeKey(userId, targetMediaId));
          await this.prisma.userLibraryItem.delete({
            where: {
              userId_mediaItemId: {
                userId,
                mediaItemId: targetMediaId,
              },
            },
          });
          return true;
        }
      } catch {
        return deletedMemory;
      }
    }

    return deletedMemory;
  }

  async deleteAllByUser(userId: string): Promise<number> {
    let count = 0;
    for (const [key, item] of this.items.entries()) {
      if (item.userId === userId) {
        this.items.delete(key);
        count++;
      }
    }

    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const res = await this.prisma.userLibraryItem.deleteMany({
          where: { userId },
        });
        return res.count;
      } catch {
        return count;
      }
    }

    return count;
  }

  async findMany(
    userId: string,
    filter: LibraryFilterDto = {}
  ): Promise<{ items: UserLibraryRecord[]; total: number }> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
    const startIndex = (page - 1) * limit;

    if (this.prisma && UUID_REGEX.test(userId)) {
      try {
        const where: any = { userId };
        if (filter.status) where.status = filter.status;
        if (filter.isFavorite !== undefined) where.isFavorite = filter.isFavorite;

        const dbItems = await this.prisma.userLibraryItem.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
        });

        const mappedList = dbItems.map((dbItem) => {
          const rec = this.mapPrismaRecord(dbItem);
          const cached = this.items.get(this.makeKey(userId, rec.mediaItemId));
          if (cached?.progressVolumes !== undefined) {
            rec.progressVolumes = cached.progressVolumes;
          }
          this.items.set(this.makeKey(userId, rec.mediaItemId), rec);
          return rec;
        });

        const paginatedDb = mappedList.slice(startIndex, startIndex + limit);
        return {
          items: paginatedDb,
          total: mappedList.length,
        };
      } catch {
        // Fallback silencioso para memória
      }
    }

    const userItems: UserLibraryRecord[] = [];

    for (const item of this.items.values()) {
      if (item.userId !== userId) continue;
      if (filter.status && item.status !== filter.status) continue;
      if (filter.isFavorite !== undefined && item.isFavorite !== filter.isFavorite) continue;
      userItems.push({ ...item });
    }

    userItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

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
