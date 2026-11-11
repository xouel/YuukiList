/**
 * YuukiList — Executor Idempotente de Seed do Catálogo (30 obras)
 */

import { SEED_MEDIA_ITEMS } from './seed-data.ts';
import {
  generateSlug,
  normalizeSearchText,
  validateMediaMetadata,
  type Category,
  type PublicationStatus,
  type MediaItemProvenance,
} from '../../../../packages/shared/src/index.ts';

export interface StoredMediaItem {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  romanizedTitle: string | null;
  normalizedTitle: string;
  synopsis: string;
  category: Category;
  publicationStatus: PublicationStatus;
  releaseYear: number | null;
  originCountry: string;
  rating: number | null;
  coverPath: string;
  provenance?: MediaItemProvenance | null;
  genres: string[];
  aliases: Array<{ alias: string; normalizedAlias: string; languageCode: string }>;
  totalEpisodes?: number | null;
  totalChapters?: number | null;
  totalVolumes?: number | null;
  validationStatus?: 'PROVISIONAL' | 'VALIDATED';
  isManuallyEdited?: boolean;
  lockedFields?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogRepositoryInterface {
  upsertMediaItem(item: StoredMediaItem): Promise<StoredMediaItem>;
  count(): Promise<number>;
  findBySlug(slug: string): Promise<StoredMediaItem | null>;
  getAll(): Promise<StoredMediaItem[]>;
}

export class InMemoryCatalogRepository implements CatalogRepositoryInterface {
  private items = new Map<string, StoredMediaItem>();

  async upsertMediaItem(item: StoredMediaItem): Promise<StoredMediaItem> {
    const existing = this.items.get(item.slug);
    const toStore: StoredMediaItem = {
      ...item,
      id: existing ? existing.id : item.id,
      createdAt: existing ? existing.createdAt : item.createdAt,
      updatedAt: new Date(),
    };
    this.items.set(item.slug, toStore);
    return toStore;
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async findBySlug(slug: string): Promise<StoredMediaItem | null> {
    return this.items.get(slug) || null;
  }

  async getAll(): Promise<StoredMediaItem[]> {
    return Array.from(this.items.values());
  }

  clear() {
    this.items.clear();
  }
}

export interface SeedResult {
  totalItems: number;
  byCategory: Record<Category, number>;
  byStatus: Record<PublicationStatus, number>;
  items: StoredMediaItem[];
}

export async function runCatalogSeed(
  repo: CatalogRepositoryInterface = new InMemoryCatalogRepository()
): Promise<SeedResult> {
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const storedItems: StoredMediaItem[] = [];

  for (const input of SEED_MEDIA_ITEMS) {
    const validated = validateMediaMetadata({
      category: input.category,
      publicationStatus: input.publicationStatus,
    });

    const slug = generateSlug(input.title);
    const normalizedTitle = normalizeSearchText(input.title);

    const item: StoredMediaItem = {
      id: crypto.randomUUID(),
      slug,
      title: input.title,
      originalTitle: input.originalTitle || null,
      romanizedTitle: input.romanizedTitle || null,
      normalizedTitle,
      synopsis: input.synopsis,
      category: validated.category,
      publicationStatus: validated.publicationStatus,
      releaseYear: input.releaseYear || null,
      originCountry: input.originCountry,
      rating: input.rating ?? null,
      coverPath: `/covers/${slug}.svg`,
      genres: [...input.genres],
      aliases: (input.aliases || []).map((a) => ({
        alias: a.alias,
        normalizedAlias: normalizeSearchText(a.alias),
        languageCode: a.languageCode,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await repo.upsertMediaItem(item);
    storedItems.push(saved);

    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byStatus[item.publicationStatus] = (byStatus[item.publicationStatus] || 0) + 1;
  }

  return {
    totalItems: storedItems.length,
    byCategory: byCategory as Record<Category, number>,
    byStatus: byStatus as Record<PublicationStatus, number>,
    items: storedItems,
  };
}

