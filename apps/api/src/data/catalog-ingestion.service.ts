/**
 * YuukiList — Serviço de Ingestão e Sincronização de Catálogo Multicanal
 * Orquestra adaptadores externos (TMDB, TVmaze, Kitsu, ANN, MangaUpdates),
 * normaliza metadados para IDs soberanos, rastreia proveniência por campo
 * e gera capas locais em SVG vetorial.
 */

import crypto from 'node:crypto';
import {
  Category,
  PublicationStatus,
  generateSlug,
  normalizeSearchText,
  type CanonicalExternalMediaDto,
  type ExternalApiSource,
  type MediaItemProvenance,
  type FieldProvenance,
} from '../../../../packages/shared/src/index.ts';
import { CatalogRepository } from './catalog.repository.ts';
import { SvgCoverService } from './svg-cover.service.ts';
import { CoverStorageService } from './cover-storage.service.ts';
import type { StoredMediaItem } from './seed.ts';

export interface IngestionResult {
  totalProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  items: Array<{
    id: string;
    slug: string;
    title: string;
    category: Category;
    provenance: MediaItemProvenance;
    action: 'INSERTED' | 'UPDATED' | 'PRESERVED';
  }>;
}

export interface IngestionOptions {
  sources?: ExternalApiSource[];
  categories?: Category[];
  sampleLimit?: number;
  dryRun?: boolean;
}

export class CatalogIngestionService {
  private catalogRepo: CatalogRepository;
  private coverService: SvgCoverService;
  private coverStorage: CoverStorageService;

  constructor(
    catalogRepo: CatalogRepository,
    coverService?: SvgCoverService,
    coverStorage?: CoverStorageService,
  ) {
    this.catalogRepo = catalogRepo;
    this.coverService = coverService || new SvgCoverService();
    this.coverStorage = coverStorage || new CoverStorageService();
  }

  /**
   * Converte um DTO de API externa em um registro soberano com ID interno,
   * proveniência auditável por campo e capa local SVG.
   */
  async ingestFromExternalDto(dto: CanonicalExternalMediaDto): Promise<StoredMediaItem & { totalSeasons?: number | null }> {
    const nowIso = new Date().toISOString();
    let slug = generateSlug(dto.title);

    // Verifica se já existe item com o mesmo slug
    const existing = await this.catalogRepo.findBySlug(slug);
    let itemId = crypto.randomUUID();

    if (existing) {
      // Se já for a mesma fonte e ID externo, atualizamos o mesmo item
      const existingProv = existing.provenance;
      const isSameSource =
        existingProv?.title?.source === dto.source &&
        existingProv?.title?.externalId === dto.externalId;

      if (isSameSource) {
        itemId = existing.id;
      } else {
        // Colisão de slug entre obras distintas: adiciona sufixo categórico ou ano
        const suffix = dto.releaseYear ? `${dto.category.toLowerCase()}-${dto.releaseYear}` : dto.category.toLowerCase();
        slug = `${slug}-${suffix}`;
      }
    }

    // Geração de Capa SVG Soberana
    const coverSvg = this.coverService.generateSvgCover({
      title: dto.title,
      originalTitle: dto.originalTitle,
      category: dto.category,
      originCountry: dto.originCountry,
      releaseYear: dto.releaseYear,
      genres: dto.genres,
      slug,
    });
    this.coverService.saveCover(slug, coverSvg);

    // Mapeamento de Proveniência Estruturada por Campo
    const provenance: MediaItemProvenance = {
      title: { source: dto.source, externalId: dto.externalId, syncedAt: nowIso },
      synopsis: { source: dto.source, externalId: dto.externalId, syncedAt: nowIso },
      category: { source: dto.source, externalId: dto.externalId, syncedAt: nowIso },
      cover: { source: 'LOCAL', syncedAt: nowIso },
    };

    if (dto.releaseYear) {
      provenance.releaseYear = { source: dto.source, externalId: dto.externalId, syncedAt: nowIso };
    }
    if (dto.totalEpisodes !== undefined && dto.totalEpisodes !== null) {
      provenance.totalEpisodes = { source: dto.source, externalId: dto.externalId, syncedAt: nowIso };
    }
    if (dto.totalChapters !== undefined && dto.totalChapters !== null) {
      provenance.totalChapters = { source: dto.source, externalId: dto.externalId, syncedAt: nowIso };
    }

    const normalizedTitle = normalizeSearchText(dto.title);
    const storedItem: StoredMediaItem & { totalSeasons?: number | null } = {
      id: itemId,
      slug,
      title: dto.title,
      originalTitle: dto.originalTitle || null,
      romanizedTitle: dto.romanizedTitle || null,
      normalizedTitle,
      synopsis: dto.synopsis || '',
      category: dto.category,
      publicationStatus: dto.publicationStatus || PublicationStatus.FINALIZADA,
      releaseYear: dto.releaseYear || null,
      originCountry: dto.originCountry || 'AS',
      rating: dto.rating ?? null,
      coverPath: `/assets/covers/${slug}.svg`,
      genres: [...dto.genres],
      aliases: (dto.aliases || []).map((a) => ({
        alias: a,
        normalizedAlias: normalizeSearchText(a),
        languageCode: 'und',
      })),
      totalEpisodes: dto.totalEpisodes ?? null,
      totalSeasons: dto.totalSeasons ?? null,
      totalChapters: dto.totalChapters ?? null,
      totalVolumes: dto.totalVolumes ?? null,
      provenance,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.catalogRepo.upsertMediaItem(storedItem);
    return storedItem;
  }

  /**
   * Enriquecimento multicanal: mescla campos complementares de uma fonte secundária
   * registrando a proveniência granular sem sobrescrever a fonte primária indevidamente.
   */
  async enrichExistingItem(
    slug: string,
    secondaryDto: CanonicalExternalMediaDto,
  ): Promise<StoredMediaItem & { totalSeasons?: number | null }> {
    const existing = await this.catalogRepo.findBySlug(slug);
    if (!existing) {
      throw new Error(`Item de catálogo não encontrado para enriquecimento: ${slug}`);
    }

    const nowIso = new Date().toISOString();
    const existingItems = this.catalogRepo.getAllItems ? await this.catalogRepo.getAllItems() : [];
    const currentStored = existingItems.find((i) => i.slug === slug) as (StoredMediaItem & { totalSeasons?: number | null }) | undefined;

    const baseProvenance: MediaItemProvenance = currentStored?.provenance || {
      title: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
      synopsis: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
      category: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
      cover: { source: 'LOCAL', syncedAt: nowIso },
    };

    const updatedItem: StoredMediaItem & { totalSeasons?: number | null } = {
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      originalTitle: existing.originalTitle || secondaryDto.originalTitle || null,
      romanizedTitle: currentStored?.romanizedTitle || secondaryDto.romanizedTitle || null,
      normalizedTitle: currentStored?.normalizedTitle || normalizeSearchText(existing.title),
      synopsis: existing.synopsis || secondaryDto.synopsis || '',
      category: existing.category,
      publicationStatus: existing.publicationStatus,
      releaseYear: existing.releaseYear || secondaryDto.releaseYear || null,
      originCountry: currentStored?.originCountry || secondaryDto.originCountry || 'AS',
      rating: currentStored?.rating ?? secondaryDto.rating ?? null,
      coverPath: currentStored?.coverPath || `/assets/covers/${slug}.svg`,
      genres: Array.from(new Set([...existing.genres, ...secondaryDto.genres])),
      aliases: currentStored?.aliases || [],
      totalEpisodes: existing.totalEpisodes ?? secondaryDto.totalEpisodes ?? null,
      totalSeasons: currentStored?.totalSeasons ?? secondaryDto.totalSeasons ?? null,
      totalChapters: existing.totalChapters ?? secondaryDto.totalChapters ?? null,
      totalVolumes: existing.totalVolumes ?? secondaryDto.totalVolumes ?? null,
      provenance: { ...baseProvenance },
      createdAt: currentStored?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Atualiza proveniência dos campos que foram complementados pela fonte secundária
    if (!existing.totalEpisodes && secondaryDto.totalEpisodes) {
      updatedItem.provenance!.totalEpisodes = {
        source: secondaryDto.source,
        externalId: secondaryDto.externalId,
        syncedAt: nowIso,
      };
    }
    if (!currentStored?.totalSeasons && secondaryDto.totalSeasons) {
      updatedItem.provenance!.totalSeasons = {
        source: secondaryDto.source,
        externalId: secondaryDto.externalId,
        syncedAt: nowIso,
      };
    }
    if (!existing.totalChapters && secondaryDto.totalChapters) {
      updatedItem.provenance!.totalChapters = {
        source: secondaryDto.source,
        externalId: secondaryDto.externalId,
        syncedAt: nowIso,
      };
    }

    // Mesclagem de aliases sem duplicatas
    for (const alt of secondaryDto.aliases) {
      if (!updatedItem.aliases.some((a) => a.alias.toLowerCase() === alt.toLowerCase())) {
        updatedItem.aliases.push({
          alias: alt,
          normalizedAlias: normalizeSearchText(alt),
          languageCode: 'und',
        });
      }
    }

    await this.catalogRepo.upsertMediaItem(updatedItem);
    return updatedItem;
  }

  /**
   * Garante que todas as obras iniciais semeadas possuam proveniência SEED_CANONICAL.
   */
  async ensureCanonicalSeedProvenance(): Promise<number> {
    const items = this.catalogRepo.getAllItems ? await this.catalogRepo.getAllItems() : [];
    let updatedCount = 0;

    for (const item of items) {
      if (!item.provenance || !item.provenance.title) {
        item.provenance = {
          title: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          synopsis: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          category: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
          cover: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' },
        };
        await this.catalogRepo.upsertMediaItem(item);
        updatedCount++;
      } else {
        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Sincroniza um lote de obras ingeridas com suporte a opções de filtro.
   */
  async syncCatalogBatch(dtos: CanonicalExternalMediaDto[], options?: IngestionOptions): Promise<IngestionResult> {
    const result: IngestionResult = {
      totalProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      totalFailed: 0,
      items: [],
    };

    let targetDtos = [...dtos];
    if (options?.categories && options.categories.length > 0) {
      targetDtos = targetDtos.filter((d) => options.categories!.includes(d.category));
    }
    if (options?.sampleLimit && options.sampleLimit > 0) {
      targetDtos = targetDtos.slice(0, options.sampleLimit);
    }

    for (const dto of targetDtos) {
      result.totalProcessed++;
      try {
        if (!options?.dryRun) {
          const stored = await this.ingestFromExternalDto(dto);
          result.totalInserted++;
          result.items.push({
            id: stored.id,
            slug: stored.slug,
            title: stored.title,
            category: stored.category,
            provenance: stored.provenance!,
            action: 'INSERTED',
          });
        } else {
          result.totalInserted++;
        }
      } catch (err) {
        result.totalFailed++;
      }
    }

    return result;
  }
}

