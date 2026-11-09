/**
 * YuukiList — Suíte de Testes Automatizados de Ingestão e Sincronização de Catálogo
 * Slice R9: 009-catalog-ingestion-sync
 * TDD: Cobrindo 100% dos requisitos normativos de specs/catalog-ingestion/spec.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Category,
  PublicationStatus,
} from '../packages/shared/src/index.ts';

import {
  SvgCoverService,
} from '../apps/api/src/data/svg-cover.service.ts';
import {
  CoverStorageService,
} from '../apps/api/src/data/cover-storage.service.ts';
import {
  CatalogIngestionService,
} from '../apps/api/src/data/catalog-ingestion.service.ts';
import {
  CatalogRepository,
} from '../apps/api/src/data/catalog.repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = resolve(__dirname, 'fixtures', 'external');

describe('R9 — Catalog Ingestion & Cache Sync (009-catalog-ingestion-sync)', () => {
  let coverService;
  let coverStorage;
  let catalogRepo;
  let ingestionService;

  beforeEach(() => {
    coverService = new SvgCoverService();
    coverStorage = new CoverStorageService();
    catalogRepo = new CatalogRepository();
    ingestionService = new CatalogIngestionService(catalogRepo, coverService, coverStorage);
  });

  describe('US1 — Ingestão Automatizada e Resolução por Adaptador (TR-001, TR-002, TR-003)', () => {
    it('TR-001: deve ingerir obra audiovisual com resolucao de episodios e temporadas sem dados mockados', async () => {
      // Mock de DTO canônico TMDB para "Crash Landing on You" (Dorama)
      const doramaDto = {
        source: 'TMDB',
        externalId: '85801',
        category: Category.DORAMA,
        title: 'Crash Landing on You',
        originalTitle: '사랑의 불시착',
        romanizedTitle: 'Sarang-ui Bulsichak',
        synopsis: 'Uma herdeira sul-coreana cai acidentalmente na Coreia do Norte.',
        releaseYear: 2019,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalEpisodes: 16,
        totalSeasons: 1,
        genres: ['Romance', 'Comédia', 'Drama'],
        aliases: ['Pousando no Amor'],
      };

      const result = await ingestionService.ingestFromExternalDto(doramaDto);

      assert.ok(result.id, 'Deve conter ID interno gerado (UUID)');
      assert.strictEqual(result.slug, 'crash-landing-on-you');
      assert.strictEqual(result.category, Category.DORAMA);
      assert.strictEqual(result.totalEpisodes, 16);
      assert.strictEqual(result.totalSeasons, 1);
      assert.strictEqual(result.releaseYear, 2019);
      assert.ok(result.provenance, 'Deve conter registro de proveniência');
      assert.strictEqual(result.provenance.title.source, 'TMDB');
      assert.strictEqual(result.provenance.title.externalId, '85801');
    });

    it('TR-002: deve ingerir obras literarias preservando diferenciacao de manga, manhwa e manhua com capitulos', async () => {
      // Manhwa: Solo Leveling
      const manhwaDto = {
        source: 'MANGAUPDATES',
        externalId: '152434',
        category: Category.MANHWA,
        title: 'Solo Leveling',
        originalTitle: '나 혼자만 레벨업',
        synopsis: 'Sung Jin-Woo torna-se o caçador mais poderoso do mundo.',
        releaseYear: 2018,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalChapters: 200,
        genres: ['Ação', 'Fantasia'],
        aliases: ['I Alone Level Up'],
      };

      // Manhua: Mo Dao Zu Shi
      const manhuaDto = {
        source: 'MANGAUPDATES',
        externalId: '146743',
        category: Category.MANHUA,
        title: 'The Grandmaster of Demonic Cultivation',
        originalTitle: '魔道祖师',
        synopsis: 'A história de Wei Wuxian no cultivo demoníaco.',
        releaseYear: 2017,
        originCountry: 'CN',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalChapters: 259,
        genres: ['Ação', 'Sobrenatural'],
        aliases: ['Mo Dao Zu Shi'],
      };

      const resManhwa = await ingestionService.ingestFromExternalDto(manhwaDto);
      const resManhua = await ingestionService.ingestFromExternalDto(manhuaDto);

      assert.strictEqual(resManhwa.category, Category.MANHWA);
      assert.strictEqual(resManhwa.totalChapters, 200);
      assert.strictEqual(resManhua.category, Category.MANHUA);
      assert.strictEqual(resManhua.totalChapters, 259);
    });

    it('TR-003: deve preservar retrocompativelmente as 30 obras originais com proveniencia SEED_CANONICAL', async () => {
      const allItems = await catalogRepo.findMany({ limit: 100 });
      assert.ok(allItems.data.length >= 30, 'Deve conter pelo menos as 30 obras originais');

      // Verifica uma obra original do seed (ex.: Pousando no Amor ou Alquimia das Almas)
      const alquimia = await catalogRepo.findBySlug('alquimia-das-almas');
      assert.ok(alquimia, 'Alquimia das Almas deve estar presente no catálogo');
      assert.strictEqual(alquimia.category, Category.DORAMA);

      // Ingestão com atualização de seed
      const seedSyncResult = await ingestionService.ensureCanonicalSeedProvenance();
      assert.ok(seedSyncResult >= 30, 'Deve ter marcado proveniência para pelo menos 30 itens');

      const updatedAlquimia = await catalogRepo.findBySlug('alquimia-das-almas');
      assert.ok(updatedAlquimia?.provenance, 'Alquimia das Almas deve ter metadados de proveniência');
      assert.strictEqual(updatedAlquimia?.provenance?.title?.source, 'SEED_CANONICAL');
    });
  });

  describe('US2 — Rastreamento de Proveniência e Auditoria por Campo (TR-004, TR-005, TR-006)', () => {
    it('TR-004: deve armazenar proveniencia estruturada por campo no cadastro da obra', async () => {
      const animeDto = {
        source: 'KITSU',
        externalId: '12',
        category: Category.ANIME,
        title: 'Frieren: Beyond Journey\'s End',
        originalTitle: '葬送のフリーレン',
        synopsis: 'A jornada de uma maga élfica após a derrota do rei demônio.',
        releaseYear: 2023,
        originCountry: 'JP',
        publicationStatus: PublicationStatus.FINALIZADA,
        totalEpisodes: 28,
        genres: ['Aventura', 'Fantasia'],
        aliases: ['Sousou no Frieren'],
      };

      const item = await ingestionService.ingestFromExternalDto(animeDto);
      const prov = item.provenance;

      assert.ok(prov, 'Objeto provenance deve existir');
      assert.strictEqual(prov.title.source, 'KITSU');
      assert.strictEqual(prov.title.externalId, '12');
      assert.strictEqual(prov.synopsis.source, 'KITSU');
      assert.strictEqual(prov.category.source, 'KITSU');
      assert.strictEqual(prov.cover.source, 'LOCAL');
      assert.ok(prov.title.syncedAt, 'Deve conter timestamp ISO');
    });

    it('TR-005: deve permitir consulta e auditoria de proveniencia por ID e slug', async () => {
      const movieDto = {
        source: 'TMDB',
        externalId: '496243',
        category: Category.FILME,
        title: 'Parasite Test Provenance',
        originalTitle: '기생충',
        synopsis: 'Filme sul-coreano vencedor de 4 Oscars.',
        releaseYear: 2019,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        genres: ['Suspense', 'Drama'],
        aliases: ['Gisaengchung'],
      };

      const stored = await ingestionService.ingestFromExternalDto(movieDto);
      const fetched = await catalogRepo.findBySlug(stored.slug);

      assert.ok(fetched, 'Item deve ser recuperado por slug');
      assert.ok(fetched.provenance, 'Detalhes devem expor proveniência');
      assert.strictEqual(fetched.provenance.title.source, 'TMDB');
      assert.strictEqual(fetched.provenance.title.externalId, '496243');
    });

    it('TR-006: deve suportar enriquecimento multicanal mantendo proveniencia granular sem conflito', async () => {
      // 1. Ingestão inicial via TMDB (sem total de episódios detalhado)
      const primaryDto = {
        source: 'TMDB',
        externalId: '1001',
        category: Category.DORAMA,
        title: 'Vincenzo Multi Source',
        synopsis: 'Um advogado ítalo-coreano da máfia busca justiça.',
        releaseYear: 2021,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        genres: ['Comédia', 'Crime'],
        aliases: [],
      };

      const initial = await ingestionService.ingestFromExternalDto(primaryDto);
      assert.strictEqual(initial.provenance?.title.source, 'TMDB');
      assert.strictEqual(initial.totalEpisodes, null);

      // 2. Enriquecimento complementar via TVmaze (com total de episódios)
      const secondaryDto = {
        source: 'TVMAZE',
        externalId: '54000',
        category: Category.DORAMA,
        title: 'Vincenzo Multi Source',
        synopsis: 'Sinopse alternativa que não deve sobrescrever a primária',
        totalEpisodes: 20,
        totalSeasons: 1,
        genres: [],
        aliases: ['Vincenzo Cassano'],
      };

      const enriched = await ingestionService.enrichExistingItem(initial.slug, secondaryDto);

      // Validações de proveniência granular
      assert.strictEqual(enriched.totalEpisodes, 20);
      assert.strictEqual(enriched.totalSeasons, 1);
      assert.strictEqual(enriched.synopsis, 'Um advogado ítalo-coreano da máfia busca justiça.'); // Preservou TMDB
      assert.strictEqual(enriched.provenance?.title.source, 'TMDB');
      assert.strictEqual(enriched.provenance?.synopsis.source, 'TMDB');
      assert.strictEqual(enriched.provenance?.totalEpisodes.source, 'TVMAZE');
      assert.strictEqual(enriched.provenance?.totalEpisodes.externalId, '54000');
    });
  });

  describe('US3 — Soberania de Dados e Geração de Capas Locais SVG (TR-007, TR-008, TR-009)', () => {
    it('TR-007: deve gerar automaticamente capa vetorial SVG estilizada com proporcao 2:3 no tema Dark Editorial', () => {
      const svg = coverService.generateSvgCover({
        title: 'Goblin: The Lonely and Great God',
        originalTitle: '쓸쓸하고 찬란하神 - 도깨비',
        category: Category.DORAMA,
        originCountry: 'KR',
        releaseYear: 2016,
        genres: ['Fantasia', 'Romance'],
        slug: 'goblin-lonely-great-god',
      });

      assert.ok(svg.startsWith('<svg'), 'Deve ser um elemento SVG válido');
      assert.ok(svg.includes('viewBox="0 0 300 450"'), 'Deve possuir proporção 2:3 (300x450)');
      assert.ok(svg.includes('DORAMA'), 'Deve exibir o badge da categoria');
      assert.ok(svg.includes('Goblin: The Lonely and Great God'), 'Deve incluir o título estilizado');
      assert.ok(svg.includes('KR • 2016'), 'Deve incluir metadados de país e ano');
      assert.ok(svg.includes('#1a1026'), 'Deve usar paleta Dark Editorial correspondente à categoria');
    });

    it('TR-008: deve servir capa local via CoverStorageService com cabeçalho image/svg+xml sem hotlinking', () => {
      const coverResult = coverStorage.getCoverBySlug('alquimia-das-almas');

      assert.strictEqual(coverResult.contentType, 'image/svg+xml');
      assert.ok(coverResult.svg.length > 50, 'Deve retornar conteúdo SVG não vazio');
      assert.ok(!coverResult.svg.includes('<image'), 'Não deve conter tags de imagem externa');
      assert.ok(!coverResult.svg.includes('href="http'), 'Não deve conter links remotos de imagens');
      assert.ok(!coverResult.svg.includes('src="http'), 'Não deve conter atributos src externos');
    });

    it('TR-009: deve indexar obras recém-ingeridas e permitir busca com similaridade trigrama pg_trgm >= 0.35', async () => {
      const newItem = {
        source: 'TMDB',
        externalId: '99991',
        category: Category.DORAMA,
        title: 'Hospital Playlist',
        originalTitle: '슬기로운 의사생활',
        synopsis: 'Cinco médicos amigos desde a faculdade dividem suas vidas no hospital.',
        releaseYear: 2020,
        originCountry: 'KR',
        publicationStatus: PublicationStatus.FINALIZADA,
        genres: ['Drama', 'Médico'],
        aliases: ['Wise Doctor Life'],
      };

      await ingestionService.ingestFromExternalDto(newItem);

      // Busca por digitação parcial com erro/variação: "hospit playlist"
      const searchResult = await catalogRepo.findMany({
        q: 'hospit playlist',
      });

      assert.ok(searchResult.data.length > 0, 'Deve encontrar a obra ingerida por similaridade de trigramas');
      const found = searchResult.data.find((item) => item.title === 'Hospital Playlist');
      assert.ok(found, 'Hospital Playlist deve estar presente nos resultados da busca trigram');
    });
  });
});
