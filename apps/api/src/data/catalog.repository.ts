/**
 * YuukiList — Repositório de Catálogo com Suporte a Filtros, Paginação e Busca
 * Conforme Requisito: Catalog Items Listing and Filtering & Intelligent Search with Trigram Similarity
 */

import { SEED_MEDIA_ITEMS } from './seed-data.ts';
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
import type { StoredMediaItem } from './seed.ts';

export interface ICatalogRepository {
  findMany(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>>;
  findBySlug(slug: string): Promise<MediaItemDetailDto | null>;
  findById(id: string): Promise<MediaItemDetailDto | null>;
  count(): Promise<number>;
  upsertMediaItem(item: StoredMediaItem): Promise<StoredMediaItem>;
  getAllItems?(): Promise<StoredMediaItem[]>;
}

/**
 * Calcula a similaridade por trigramas compatível com PostgreSQL pg_trgm.
 * Adiciona 2 espaços no início e 1 espaço no final da string normalizada.
 */
export function calculateTrigramSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  if (textA === textB) return 1.0;

  function extractTrigrams(str: string): Set<string> {
    const padded = `  ${str} `;
    const trigrams = new Set<string>();
    for (let i = 0; i <= padded.length - 3; i++) {
      trigrams.add(padded.slice(i, i + 3));
    }
    return trigrams;
  }

  const trigramsA = extractTrigrams(textA);
  const trigramsB = extractTrigrams(textB);

  let intersectionCount = 0;
  for (const tri of trigramsA) {
    if (trigramsB.has(tri)) {
      intersectionCount++;
    }
  }

  const unionCount = trigramsA.size + trigramsB.size - intersectionCount;
  if (unionCount === 0) return 0;

  return intersectionCount / unionCount;
}

export class CatalogRepository implements ICatalogRepository {
  private items: StoredMediaItem[] = [];

  constructor(customItems?: StoredMediaItem[]) {
    if (customItems) {
      this.items = [...customItems];
    } else {
      this.initializeFromSeed();
    }
  }

  private initializeFromSeed(): void {
    this.items = SEED_MEDIA_ITEMS.map((input, index) => {
      const slug = generateSlug(input.title);
      const normalizedTitle = normalizeSearchText(input.title);
      return {
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
    });
  }

  async count(): Promise<number> {
    return this.items.length;
  }

  async findBySlug(slug: string): Promise<MediaItemDetailDto | null> {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();
    const item = this.items.find((i) => i.slug === cleanSlug);
    if (!item) return null;

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      originalTitle: item.originalTitle,
      category: item.category,
      publicationStatus: item.publicationStatus,
      synopsis: item.synopsis,
      totalEpisodes: item.totalEpisodes ?? null,
      totalChapters: item.totalChapters ?? null,
      totalVolumes: item.totalVolumes ?? null,
      releaseYear: item.releaseYear,
      coverUrl: `/api/v1/catalog/items/${item.slug}/cover`,
      genres: item.genres ? [...item.genres] : [],
      aliases: item.aliases ? item.aliases.map((a: any) => (typeof a === 'string' ? a : a.alias)) : [],
      provenance: item.provenance || null,
    };
  }

  async findById(id: string): Promise<MediaItemDetailDto | null> {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const item = this.items.find((i) => i.id.toLowerCase() === cleanId || i.slug === cleanId);
    if (!item) return null;

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      originalTitle: item.originalTitle,
      category: item.category,
      publicationStatus: item.publicationStatus,
      synopsis: item.synopsis,
      totalEpisodes: item.totalEpisodes ?? null,
      totalChapters: item.totalChapters ?? null,
      totalVolumes: item.totalVolumes ?? null,
      releaseYear: item.releaseYear,
      coverUrl: `/api/v1/catalog/items/${item.slug}/cover`,
      genres: item.genres ? [...item.genres] : [],
      aliases: item.aliases ? item.aliases.map((a: any) => (typeof a === 'string' ? a : a.alias)) : [],
      provenance: item.provenance || null,
    };
  }

  async upsertMediaItem(item: StoredMediaItem): Promise<StoredMediaItem> {
    const existingIndex = this.items.findIndex(
      (i) => i.slug === item.slug || i.id === item.id
    );
    if (existingIndex >= 0) {
      this.items[existingIndex] = {
        ...this.items[existingIndex],
        ...item,
        updatedAt: new Date(),
      };
      return this.items[existingIndex];
    }
    this.items.push(item);
    return item;
  }

  async save(item: any): Promise<StoredMediaItem> {
    return this.upsertMediaItem(item);
  }

  async getAllItems(): Promise<StoredMediaItem[]> {
    return [...this.items];
  }

  async findSimilar(title: string, threshold: number = 0.35): Promise<Array<{
    id: string;
    title: string;
    slug: string;
    category: Category;
    similarity: number;
    releaseYear?: number | null;
  }>> {
    if (!title || !title.trim()) return [];
    const normalizedInput = normalizeSearchText(title);
    const results: Array<{
      id: string;
      title: string;
      slug: string;
      category: Category;
      similarity: number;
      releaseYear?: number | null;
    }> = [];

    for (const item of this.items) {
      const sim = calculateTrigramSimilarity(normalizedInput, item.normalizedTitle);
      if (sim >= threshold) {
        results.push({
          id: item.id,
          title: item.title,
          slug: item.slug,
          category: item.category,
          similarity: Math.round(sim * 100) / 100,
          releaseYear: item.releaseYear,
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  async findMany(query: CatalogQueryDto): Promise<PaginatedResponse<MediaItemSummaryDto>> {
    let resultItems = [...this.items].filter((item) => item.validationStatus !== 'PROVISIONAL');

    // 1. Filtro por Categoria
    if (query.category) {
      resultItems = resultItems.filter((item) => item.category === query.category);
    }

    // 2. Filtro por Status de Publicação
    if (query.status) {
      resultItems = resultItems.filter((item) => item.publicationStatus === query.status);
    }

    // 3. Filtro por Gênero
    if (query.genre) {
      const targetGenre = query.genre.trim().toLowerCase();
      resultItems = resultItems.filter((item) =>
        item.genres.some((g) => g.toLowerCase() === targetGenre)
      );
    }

    // 3.1. Filtro por País de Origem
    if (query.country) {
      const targetCountry = query.country.trim().toUpperCase();
      resultItems = resultItems.filter(
        (item) => item.originCountry && item.originCountry.toUpperCase() === targetCountry
      );
    }

    // 3.2. Filtro por Temas Transversais (BL/GL)
    if (query.theme) {
      const targetTheme = query.theme.trim().toUpperCase();
      resultItems = resultItems.filter((item) =>
        item.genres.some((g) => g.toUpperCase().includes(targetTheme))
      );
    }

    // 4. Busca Textual Inteligente (q) ou Ordenação Padrão
    const rawQ = query.q ? query.q.trim() : '';
    const normalizedQ = rawQ ? normalizeSearchText(rawQ) : '';

    if (normalizedQ) {
      const scoredItems: Array<{ item: StoredMediaItem; score: number }> = [];

      for (const item of resultItems) {
        let bestScore = 0;

        // Correspondência exata
        if (item.normalizedTitle === normalizedQ) {
          bestScore = Math.max(bestScore, 1.0);
        } else if (item.normalizedTitle.startsWith(normalizedQ) || item.normalizedTitle.includes(normalizedQ)) {
          // Correspondência parcial/prefixo
          bestScore = Math.max(bestScore, 0.8);
        }

        // Similaridade trigram no título
        const trigramSim = calculateTrigramSimilarity(item.normalizedTitle, normalizedQ);
        if (trigramSim >= 0.35) {
          bestScore = Math.max(bestScore, trigramSim);
        }

        // Similaridade nos aliases
        for (const alias of item.aliases) {
          if (alias.normalizedAlias === normalizedQ) {
            bestScore = Math.max(bestScore, 0.95);
          } else if (alias.normalizedAlias.includes(normalizedQ)) {
            bestScore = Math.max(bestScore, 0.75);
          }
          const aliasSim = calculateTrigramSimilarity(alias.normalizedAlias, normalizedQ);
          if (aliasSim >= 0.35) {
            bestScore = Math.max(bestScore, aliasSim * 0.9);
          }
        }

        if (bestScore >= 0.35) {
          scoredItems.push({ item, score: bestScore });
        }
      }

      // Ordenação dos resultados de busca
      if (query.sortBy === 'title') {
        scoredItems.sort((a, b) => a.item.title.localeCompare(b.item.title, 'pt-BR'));
      } else {
        // Padrão do PRD: Relevância DESC, desempate alfabético por título ASC
        scoredItems.sort((a, b) => {
          if (Math.abs(b.score - a.score) > 0.001) {
            return b.score - a.score;
          }
          return a.item.title.localeCompare(b.item.title, 'pt-BR');
        });
      }

      resultItems = scoredItems.map((s) => s.item);
    } else {
      // Sem termo de busca: ordenação puramente alfabética por título ASC
      resultItems.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    }

    // 5. Paginação
    const total = resultItems.length;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const paginatedItems = resultItems.slice(startIndex, startIndex + limit);

    const data: MediaItemSummaryDto[] = paginatedItems.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      originalTitle: item.originalTitle,
      category: item.category,
      publicationStatus: item.publicationStatus,
      coverUrl: `/api/v1/catalog/items/${item.slug}/cover`,
      releaseYear: item.releaseYear,
      genres: [...item.genres],
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
