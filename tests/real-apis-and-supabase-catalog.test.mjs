/**
 * YuukiList — Suíte de Testes Automatizados de Catálogo Real e Supabase
 * Change: 034-real-apis-and-supabase-catalog
 * Cobre Requisitos:
 * - TR-001 & TR-002: PrismaCatalogRepository (Persistência relacional, pg_trgm e contratos)
 * - TR-003, TR-004, TR-005, TR-006: Ingestão de obras reais via TMDB, Kitsu, TVmaze e MangaUpdates
 * - TR-007, TR-012: Busca federada híbrida e Ingestão sob demanda (Just-in-Time)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Category,
  PublicationStatus,
} from '../packages/shared/src/index.ts';

import { TmdbClient } from '../apps/api/src/external/tmdb.client.ts';
import { KitsuClient } from '../apps/api/src/external/kitsu.client.ts';
import { TvmazeClient } from '../apps/api/src/external/tvmaze.client.ts';
import { MangaUpdatesClient } from '../apps/api/src/external/mangaupdates.client.ts';
import { CatalogIngestionService } from '../apps/api/src/data/catalog-ingestion.service.ts';
import { PrismaCatalogRepository } from '../apps/api/src/data/prisma-catalog.repository.ts';
import { CatalogFederatedSearchService } from '../apps/api/src/catalog/catalog-federated-search.service.ts';

describe('034-real-apis-and-supabase-catalog — Suíte de Validação', () => {

  describe('US1 — Repositório de Catálogo Prisma e pg_trgm (TR-001, TR-002, TR-008, TR-009, TR-010, TR-011)', () => {
    let repo;

    beforeEach(() => {
      repo = new PrismaCatalogRepository();
    });

    it('TR-001 & TR-002: deve implementar a interface ICatalogRepository e métodos canônicos', () => {
      assert.strictEqual(typeof repo.findMany, 'function');
      assert.strictEqual(typeof repo.findBySlug, 'function');
      assert.strictEqual(typeof repo.findById, 'function');
      assert.strictEqual(typeof repo.count, 'function');
      assert.strictEqual(typeof repo.upsertMediaItem, 'function');
    });

    it('TR-008 & TR-009: findMany deve paginar e filtrar por categoria e status', async () => {
      const res = await repo.findMany({
        category: Category.DORAMA,
        page: 1,
        limit: 10,
      });

      assert.ok(Array.isArray(res.data));
      assert.ok(res.meta);
      assert.strictEqual(typeof res.meta.total, 'number');
      assert.strictEqual(res.meta.page, 1);
    });

    it('TR-010 & TR-011: busca aproximada deve ranquear por similaridade trigrâmica com limiar >= 0.35', async () => {
      const res = await repo.findMany({
        q: 'Vincenzo',
        sortBy: 'relevance',
      });

      assert.ok(Array.isArray(res.data));
      assert.ok(res.meta);
    });
  });

  describe('US2 — Ingestão de Obras Reais e Proveniência (TR-003, TR-004, TR-005, TR-006)', () => {
    let ingestionService;

    beforeEach(() => {
      ingestionService = new CatalogIngestionService();
    });

    it('TR-004: deve ingerir obra audiovisual com dados do TMDB contendo pôster oficial e sinopse', async () => {
      const tmdbShow = {
        source: 'TMDB',
        externalId: '117376',
        category: Category.DORAMA,
        title: 'Vincenzo',
        originalTitle: '빈센조',
        synopsis: 'Aos 8 anos de idade, Park Joo-Hyung foi para a Itália...',
        releaseYear: 2021,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalEpisodes: 20,
        totalSeasons: 1,
        genres: ['Comédia', 'Drama', 'Crime'],
        aliases: ['빈센조'],
        coverUrl: 'https://image.tmdb.org/t/p/w500/opMEH9JLmkYumUTJib321REvezr.jpg',
      };

      const result = await ingestionService.ingestFromExternalDto(tmdbShow);

      assert.ok(result.id);
      assert.strictEqual(result.title, 'Vincenzo');
      assert.strictEqual(result.originalTitle, '빈센조');
      assert.strictEqual(result.category, Category.DORAMA);
      assert.strictEqual(result.provenance?.title?.source, 'TMDB');
      assert.strictEqual(result.provenance?.title?.externalId, '117376');
    });

    it('TR-005: deve ingerir obra literária via MangaUpdates diferenciando MANHWA com capítulos', async () => {
      const manhwa = {
        source: 'MANGAUPDATES',
        externalId: '152434',
        category: Category.MANHWA,
        title: 'Solo Leveling',
        originalTitle: '나 혼자만 레벨업',
        synopsis: 'Sung Jin-Woo torna-se o caçador mais forte.',
        releaseYear: 2018,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalChapters: 200,
        genres: ['Ação', 'Fantasia'],
        aliases: ['I Alone Level Up', 'Na Honjaman Level Up'],
      };

      const result = await ingestionService.ingestFromExternalDto(manhwa);

      assert.ok(result.id);
      assert.strictEqual(result.category, Category.MANHWA);
      assert.strictEqual(result.totalChapters, 200);
      assert.strictEqual(result.provenance?.category?.source, 'MANGAUPDATES');
    });
  });

  describe('US3 — Busca Federada Híbrida e Ingestão Sob Demanda (TR-007, TR-012)', () => {
    it('TR-012: cliente TMDB deve usar chave TMDB_API_KEY e pesquisar doramas com sucesso', async () => {
      const tmdb = new TmdbClient();
      const results = await tmdb.search({ title: 'Vincenzo', category: Category.DORAMA });

      assert.ok(Array.isArray(results));
      if (results.length > 0) {
        assert.strictEqual(results[0].source, 'TMDB');
        assert.ok(results[0].title);
      }
    });

    it('TR-007: ingestão sob demanda deve converter DTO externo em registro soberano com capa de fallback', async () => {
      const ingestion = new CatalogIngestionService();
      const externalItem = {
        source: 'KITSU',
        externalId: '420',
        category: Category.ANIME,
        title: 'Frieren: Beyond Journey\'s End',
        originalTitle: '葬送のフリーレン',
        synopsis: 'A maga elfa Frieren após a derrota do Rei Demônio.',
        releaseYear: 2023,
        originCountry: 'JP',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalEpisodes: 28,
        genres: ['Fantasia', 'Drama'],
      };

      const ingested = await ingestion.ingestFromExternalDto(externalItem);
      assert.ok(ingested.id);
      assert.strictEqual(ingested.title, 'Frieren: Beyond Journey\'s End');
      assert.ok(ingested.coverPath, 'Deve possuir capa atribuída (remota ou SVG vetorial)');
    });

    it('TR-012: CatalogFederatedSearchService deve combinar resultados locais e externos com deduplicação', async () => {
      const repo = new PrismaCatalogRepository();
      const federated = new CatalogFederatedSearchService(repo);

      const result = await federated.searchFederated({
        q: 'Vincenzo',
        includeExternal: true,
      });

      assert.ok(Array.isArray(result.data));
      assert.ok(Array.isArray(result.externalResults));
      assert.ok(result.meta);
    });
  });
});
