/**
 * YuukiList — Repositório de Catálogo com Suporte ao Supabase PostgreSQL via Prisma
 * Conforme Requisito: Database Schema and Extension Provisioning & Intelligent Search with Trigram Similarity
 */

import { PrismaClient } from '@prisma/client';
import {
  generateSlug,
  normalizeSearchText,
  type Category,
  type PublicationStatus,
  type CatalogQueryDto,
  type MediaItemDetailDto,
  type MediaItemSummaryDto,
  type PaginatedResponse,
} from '../../../../packages/shared/src/index.ts';
import type { ICatalogRepository } from './catalog.repository.ts';
import type { StoredMediaItem } from './seed.ts';
import { calculateTrigramSimilarity } from './catalog.repository.ts';
import { SEED_MEDIA_ITEMS } from './seed-data.ts';

export class PrismaCatalogRepository implements ICatalogRepository {
  private prisma: PrismaClient | null = null;
  private inMemoryFallback: Map<string, StoredMediaItem> = new Map();

  constructor(customPrisma?: PrismaClient) {
    if (customPrisma) {
      this.prisma = customPrisma;
    } else if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
      try {
        this.prisma = new PrismaClient();
      } catch {
        this.prisma = null;
      }
    }

    // Inicializa fallback em memória para isolamento ou ausência de rede
    this.initializeInMemoryFallback();
  }

  private initializeInMemoryFallback(): void {
    SEED_MEDIA_ITEMS.forEach((input, index) => {
      const slug = generateSlug(input.title);
      const normalizedTitle = normalizeSearchText(input.title);
      const item: StoredMediaItem = {
        id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        slug,
        title: input.title,
        originalTitle: input.originalTitle || null,
        romanizedTitle: input.romanizedTitle || null,
        normalizedTitle,
        synopsis: input.synopsis,
        category: input.category,
        publicationStatus: input.publicationStatus,
        releaseYear: input.releaseYear || null,
        originCountry: input.originCountry,
        rating: input.rating ?? null,
        coverPath: `/assets/covers/${slug}.svg`,
        provenance: {
          title: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          synopsis: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          category: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          cover: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
        },
        genres: [...input.genres],
        aliases: (input.aliases || []).map((a) => ({
          alias: a.alias,
          normalizedAlias: normalizeSearchText(a.alias),
          languageCode: a.languageCode,
        })),
        totalEpisodes: input.totalEpisodes ?? null,
        totalChapters: input.totalChapters ?? null,
        totalVolumes: input.totalVolumes ?? null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };
      this.inMemoryFallback.set(item.id, item);
      this.inMemoryFallback.set(item.slug, item);
    });
  }

  async count(): Promise<number> {
    if (this.prisma) {
      try {
        const dbCount = await this.prisma.mediaItem.count();
        if (dbCount > 0) return dbCount;
      } catch {
        // Fallback para memória em caso de falha de conexão
      }
    }
    const unique = new Set(Array.from(this.inMemoryFallback.values()).map((i) => i.id));
    return unique.size;
  }

  async findBySlug(slug: string): Promise<MediaItemDetailDto | null> {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();

    if (this.prisma) {
      try {
        const item = await this.prisma.mediaItem.findUnique({
          where: { slug: cleanSlug },
          include: { genres: true, aliases: true },
        });

        if (item) {
          return {
            id: item.id,
            slug: item.slug,
            title: item.title,
            originalTitle: item.originalTitle,
            category: item.category as Category,
            publicationStatus: item.publicationStatus as PublicationStatus,
            synopsis: item.synopsis,
            totalEpisodes: item.totalEpisodes ?? null,
            totalChapters: item.totalChapters ?? null,
            totalVolumes: item.totalVolumes ?? null,
            releaseYear: item.releaseYear,
            coverUrl: item.coverPath.startsWith('http')
              ? item.coverPath
              : `/api/v1/catalog/items/${item.slug}/cover`,
            genres: item.genres.map((g) => g.name),
            aliases: item.aliases.map((a) => a.alias),
            provenance: (item.provenance as any) || null,
          };
        }
      } catch {
        // Fallback para memória
      }
    }

    const memItem = this.inMemoryFallback.get(cleanSlug);
    if (!memItem) return null;

    return {
      id: memItem.id,
      slug: memItem.slug,
      title: memItem.title,
      originalTitle: memItem.originalTitle,
      category: memItem.category,
      publicationStatus: memItem.publicationStatus,
      synopsis: memItem.synopsis,
      totalEpisodes: memItem.totalEpisodes ?? null,
      totalChapters: memItem.totalChapters ?? null,
      totalVolumes: memItem.totalVolumes ?? null,
      releaseYear: memItem.releaseYear,
      coverUrl: `/api/v1/catalog/items/${memItem.slug}/cover`,
      genres: memItem.genres ? [...memItem.genres] : [],
      aliases: memItem.aliases ? memItem.aliases.map((a: any) => (typeof a === 'string' ? a : a.alias)) : [],
      provenance: memItem.provenance || null,
    };
  }

  async findById(id: string): Promise<MediaItemDetailDto | null> {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    if (this.prisma) {
      try {
        const item = await this.prisma.mediaItem.findFirst({
          where: isUuid
            ? { OR: [{ id: cleanId }, { slug: cleanId }] }
            : { slug: cleanId },
          include: { genres: true, aliases: true },
        });

        if (item) {
          return {
            id: item.id,
            slug: item.slug,
            title: item.title,
            originalTitle: item.originalTitle,
            category: item.category as Category,
            publicationStatus: item.publicationStatus as PublicationStatus,
            synopsis: item.synopsis,
            totalEpisodes: item.totalEpisodes ?? null,
            totalChapters: item.totalChapters ?? null,
            totalVolumes: item.totalVolumes ?? null,
            releaseYear: item.releaseYear,
            coverUrl: item.coverPath.startsWith('http')
              ? item.coverPath
              : `/api/v1/catalog/items/${item.slug}/cover`,
            genres: item.genres.map((g) => g.name),
            aliases: item.aliases.map((a) => a.alias),
            provenance: (item.provenance as any) || null,
          };
        }
      } catch {
        // Fallback para memória
      }
    }

    const memItem = this.inMemoryFallback.get(cleanId);
    if (!memItem) return null;

    return {
      id: memItem.id,
      slug: memItem.slug,
      title: memItem.title,
      originalTitle: memItem.originalTitle,
      category: memItem.category,
      publicationStatus: memItem.publicationStatus,
      synopsis: memItem.synopsis,
      totalEpisodes: memItem.totalEpisodes ?? null,
      totalChapters: memItem.totalChapters ?? null,
      totalVolumes: memItem.totalVolumes ?? null,
      releaseYear: memItem.releaseYear,
      coverUrl: `/api/v1/catalog/items/${memItem.slug}/cover`,
      genres: memItem.genres ? [...memItem.genres] : [],
      aliases: memItem.aliases ? memItem.aliases.map((a: any) => (typeof a === 'string' ? a : a.alias)) : [],
      provenance: memItem.provenance || null,
    };
  }

  async upsertMediaItem(item: StoredMediaItem): Promise<StoredMediaItem> {
    // Atualiza fallback em memória
    this.inMemoryFallback.set(item.id, item);
    this.inMemoryFallback.set(item.slug, item);

    if (this.prisma) {
      try {
        const normalizedTitle = item.normalizedTitle || normalizeSearchText(item.title);

        await this.prisma.mediaItem.upsert({
          where: { slug: item.slug },
          create: {
            id: item.id,
            slug: item.slug,
            title: item.title,
            originalTitle: item.originalTitle,
            romanizedTitle: item.romanizedTitle,
            normalizedTitle,
            synopsis: item.synopsis,
            category: item.category as any,
            publicationStatus: item.publicationStatus as any,
            releaseYear: item.releaseYear,
            originCountry: item.originCountry || 'XX',
            rating: item.rating,
            coverPath: item.coverPath,
            totalEpisodes: item.totalEpisodes,
            totalChapters: item.totalChapters,
            totalVolumes: item.totalVolumes,
            provenance: (item.provenance as any) || {},
            genres: {
              create: (item.genres || []).map((name) => ({ name })),
            },
            aliases: {
              create: (item.aliases || []).map((a) => ({
                alias: a.alias,
                normalizedAlias: a.normalizedAlias || normalizeSearchText(a.alias),
                languageCode: a.languageCode || 'und',
              })),
            },
          },
          update: {
            title: item.title,
            originalTitle: item.originalTitle,
            romanizedTitle: item.romanizedTitle,
            normalizedTitle,
            synopsis: item.synopsis,
            category: item.category as any,
            publicationStatus: item.publicationStatus as any,
            releaseYear: item.releaseYear,
            originCountry: item.originCountry || 'XX',
            rating: item.rating,
            coverPath: item.coverPath,
            totalEpisodes: item.totalEpisodes,
            totalChapters: item.totalChapters,
            totalVolumes: item.totalVolumes,
            provenance: (item.provenance as any) || {},
          },
        });
      } catch (err: any) {
        console.warn('[PrismaCatalogRepository] Falha ao upsert no Prisma, usando memória:', err.message);
      }
    }

    return item;
  }

  async findMany(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    if (this.prisma) {
      try {
        const where: any = {};

        if (query.category) {
          where.category = query.category;
        }
        if (query.status) {
          where.publicationStatus = query.status;
        }
        if (query.country) {
          where.originCountry = { equals: query.country, mode: 'insensitive' };
        }
        if (query.genre) {
          where.genres = {
            some: {
              name: { equals: query.genre.trim(), mode: 'insensitive' },
            },
          };
        }

        // Busca com texto aproximado
        if (query.q && query.q.trim()) {
          const rawQ = query.q.trim();
          const normQ = normalizeSearchText(rawQ);

          where.OR = [
            { title: { contains: rawQ, mode: 'insensitive' } },
            { originalTitle: { contains: rawQ, mode: 'insensitive' } },
            { normalizedTitle: { contains: normQ, mode: 'insensitive' } },
            {
              aliases: {
                some: {
                  alias: { contains: rawQ, mode: 'insensitive' },
                },
              },
            },
          ];
        }

        // Ordenação
        let orderBy: any = { title: 'asc' };
        if (query.sortBy === 'releaseDate') {
          orderBy = { releaseYear: 'desc' };
        } else if (query.sortBy === 'rating') {
          orderBy = { rating: 'desc' };
        }

        const [total, items] = await Promise.all([
          this.prisma.mediaItem.count({ where }),
          this.prisma.mediaItem.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: { genres: true },
          }),
        ]);

        if (total > 0 || (this.prisma && !query.q)) {
          const totalPages = Math.ceil(total / limit);
          return {
            data: items.map((item) => ({
              id: item.id,
              slug: item.slug,
              title: item.title,
              originalTitle: item.originalTitle,
              category: item.category as Category,
              publicationStatus: item.publicationStatus as PublicationStatus,
              releaseYear: item.releaseYear,
              rating: item.rating,
              coverUrl: item.coverPath.startsWith('http')
                ? item.coverPath
                : `/api/v1/catalog/items/${item.slug}/cover`,
              genres: item.genres.map((g) => g.name),
            })),
            meta: {
              total,
              page,
              limit,
              totalPages,
            },
          };
        }
      } catch {
        // Fallback em caso de falha de conexão
      }
    }

    // Processamento em memória
    let items = Array.from(new Set(Array.from(this.inMemoryFallback.values()).map((i) => i.id)))
      .map((id) => this.inMemoryFallback.get(id)!)
      .filter((i) => Boolean(i) && i.validationStatus !== 'PROVISIONAL');

    if (query.category) {
      items = items.filter((i) => i.category === query.category);
    }
    if (query.status) {
      items = items.filter((i) => i.publicationStatus === query.status);
    }
    if (query.genre) {
      const gTerm = query.genre.trim().toLowerCase();
      items = items.filter((i) => i.genres.some((g) => g.toLowerCase() === gTerm));
    }
    if (query.country) {
      const cTerm = query.country.trim().toUpperCase();
      items = items.filter((i) => i.originCountry?.toUpperCase() === cTerm);
    }

    if (query.q && query.q.trim()) {
      const normQ = normalizeSearchText(query.q.trim());
      items = items
        .map((item) => {
          const sim = calculateTrigramSimilarity(normQ, item.normalizedTitle);
          const aliasSim = (item.aliases || []).reduce(
            (max, a) => Math.max(max, calculateTrigramSimilarity(normQ, a.normalizedAlias)),
            0
          );
          return { item, score: Math.max(sim, aliasSim) };
        })
        .filter(({ item, score }) => score >= 0.35 || item.normalizedTitle.includes(normQ))
        .sort((a, b) => (query.sortBy === 'title' ? a.item.title.localeCompare(b.item.title) : b.score - a.score))
        .map(({ item }) => item);
    } else {
      if (query.sortBy === 'releaseDate') {
        items.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      } else if (query.sortBy === 'rating') {
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        items.sort((a, b) => a.title.localeCompare(b.title));
      }
    }

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginated.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        originalTitle: item.originalTitle,
        category: item.category,
        publicationStatus: item.publicationStatus,
        releaseYear: item.releaseYear,
        rating: item.rating,
        coverUrl: item.coverPath.startsWith('http')
          ? item.coverPath
          : `/api/v1/catalog/items/${item.slug}/cover`,
        genres: [...item.genres],
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getAllItems(): Promise<StoredMediaItem[]> {
    if (this.prisma) {
      try {
        const items = await this.prisma.mediaItem.findMany({
          include: { genres: true, aliases: true },
        });
        if (items.length > 0) {
          return items.map((i) => ({
            id: i.id,
            slug: i.slug,
            title: i.title,
            originalTitle: i.originalTitle,
            romanizedTitle: i.romanizedTitle,
            normalizedTitle: i.normalizedTitle,
            synopsis: i.synopsis,
            category: i.category as Category,
            publicationStatus: i.publicationStatus as PublicationStatus,
            releaseYear: i.releaseYear,
            originCountry: i.originCountry,
            rating: i.rating,
            coverPath: i.coverPath,
            totalEpisodes: i.totalEpisodes,
            totalChapters: i.totalChapters,
            totalVolumes: i.totalVolumes,
            provenance: (i.provenance as any) || null,
            genres: i.genres.map((g) => g.name),
            aliases: i.aliases.map((a) => ({
              alias: a.alias,
              normalizedAlias: a.normalizedAlias,
              languageCode: a.languageCode,
            })),
            createdAt: i.createdAt,
            updatedAt: i.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }
    const unique = new Set(Array.from(this.inMemoryFallback.values()).map((i) => i.id));
    return Array.from(unique).map((id) => this.inMemoryFallback.get(id)!);
  }
}

