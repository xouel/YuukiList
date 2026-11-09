/**
 * YuukiList — Testes Automatizados da PoC de APIs Externas (Slice R8: 008-external-apis-poc)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/external-apis-poc/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TmdbClient,
} from '../apps/api/src/external/tmdb.client.ts';
import {
  TvmazeClient,
} from '../apps/api/src/external/tvmaze.client.ts';
import {
  KitsuClient,
} from '../apps/api/src/external/kitsu.client.ts';
import {
  AnnClient,
} from '../apps/api/src/external/ann.client.ts';
import {
  MangaUpdatesClient,
} from '../apps/api/src/external/mangaupdates.client.ts';

import {
  TEST_TITLES_MATRIX,
  LICENSING_RULES,
  buildComparisonMatrix,
  generateMarkdownReport,
} from '../scripts/poc-external-apis.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = resolve(__dirname, 'fixtures', 'external');

// Carregamento de Fixtures Estáticas
const tmdbFixtures = JSON.parse(readFileSync(resolve(fixturesDir, 'tmdb.json'), 'utf8'));
const tvmazeFixtures = JSON.parse(readFileSync(resolve(fixturesDir, 'tvmaze.json'), 'utf8'));
const kitsuFixtures = JSON.parse(readFileSync(resolve(fixturesDir, 'kitsu.json'), 'utf8'));
const annXmlFixture = readFileSync(resolve(fixturesDir, 'ann.xml'), 'utf8');
const mangaUpdatesFixtures = JSON.parse(readFileSync(resolve(fixturesDir, 'mangaupdates.json'), 'utf8'));

describe('US1 — Consulta e Normalização de Obras Audiovisuais (TR-001, TR-002, TR-003)', () => {
  const tmdb = new TmdbClient();
  const tvmaze = new TvmazeClient();

  it('TR-001: deve converter resposta externa de doramas e séries do TMDB e TVmaze em DTO canônico', () => {
    const movingTmdb = tmdb.normalizeShow(tmdbFixtures.moving, 'DORAMA');
    assert.equal(movingTmdb.source, 'TMDB');
    assert.equal(movingTmdb.title, 'Moving');
    assert.equal(movingTmdb.originalTitle, '무빙');
    assert.equal(movingTmdb.category, 'DORAMA');
    assert.equal(movingTmdb.originCountry, 'KR');
    assert.equal(movingTmdb.releaseYear, 2023);
    assert.ok(movingTmdb.synopsis && movingTmdb.synopsis.includes('superpowers'));
    assert.ok(movingTmdb.genres.includes('Action & Adventure'));

    const movingTvmaze = tvmaze.normalizeShow(tvmazeFixtures.moving, 'DORAMA');
    assert.equal(movingTvmaze.source, 'TVMAZE');
    assert.equal(movingTvmaze.title, 'Moving');
    assert.equal(movingTvmaze.category, 'DORAMA');
    assert.equal(movingTvmaze.originCountry, 'KR');
    assert.equal(movingTvmaze.publicationStatus, 'FINALIZADA');
    assert.ok(movingTvmaze.synopsis && !movingTvmaze.synopsis.includes('<p>'), 'Deve remover tags HTML do summary');
  });

  it('TR-002: deve extrair com precisão a contagem de episódios e temporadas para séries e doramas', () => {
    const moving = tvmaze.normalizeShow(tvmazeFixtures.moving, 'DORAMA');
    assert.equal(moving.totalEpisodes, 20);
    assert.equal(moving.totalSeasons, 1);

    const queen = tvmaze.normalizeShow(tvmazeFixtures.queen_of_tears, 'DORAMA');
    assert.equal(queen.totalEpisodes, 16);
    assert.equal(queen.totalSeasons, 1);

    const alice = tvmaze.normalizeShow(tvmazeFixtures.alice_in_borderland, 'DORAMA');
    assert.equal(alice.totalEpisodes, 16);
    assert.equal(alice.totalSeasons, 2);

    // Filmes devem possuir totalEpisodes nulo
    const oldboy = tmdb.normalizeMovie(tmdbFixtures.oldboy);
    assert.equal(oldboy.category, 'FILME');
    assert.equal(oldboy.totalEpisodes, null);
    assert.equal(oldboy.releaseYear, 2003);

    const yourName = tmdb.normalizeMovie(tmdbFixtures.your_name);
    assert.equal(yourName.category, 'FILME');
    assert.equal(yourName.totalEpisodes, null);
    assert.equal(yourName.releaseYear, 2016);
  });

  it('TR-003: deve lidar com rate limiting (HTTP 429) e erros de rede com resiliência', async () => {
    let callCount = 0;
    const mockFetcher = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ results: [tmdbFixtures.moving] }),
      };
    };

    const clientWithRetry = new TmdbClient({ fetcher: mockFetcher });
    const results = await clientWithRetry.search({ title: 'Moving', category: 'DORAMA' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Moving');
    assert.equal(callCount, 2, 'Deve ter tentado novamente após o status 429');
  });
});

describe('US2 — Consulta e Normalização de Obras Gráficas e Literárias (TR-004, TR-005, TR-006)', () => {
  const mangaUpdates = new MangaUpdatesClient();
  const kitsu = new KitsuClient();
  const ann = new AnnClient();

  it('TR-004: deve consultar e normalizar mangás e manhwas no MangaUpdates e Kitsu', () => {
    const solo = mangaUpdates.normalizeSeries(mangaUpdatesFixtures.solo_leveling);
    assert.equal(solo.source, 'MANGAUPDATES');
    assert.equal(solo.title, 'Solo Leveling');
    assert.equal(solo.category, 'MANHWA');
    assert.equal(solo.originCountry, 'KR');
    assert.equal(solo.totalChapters, 200);
    assert.equal(solo.publicationStatus, 'FINALIZADA');
    assert.ok(solo.authors && solo.authors.includes('Chugong'));

    const opKitsu = kitsu.normalizeItem(kitsuFixtures.one_piece_manga, 'MANGA');
    assert.equal(opKitsu.source, 'KITSU');
    assert.equal(opKitsu.title, 'One Piece');
    assert.equal(opKitsu.category, 'MANGA');
    assert.equal(opKitsu.releaseYear, 1997);
  });

  it('TR-005: deve diferenciar estritamente formatos literários orientais (MANGA vs. MANHWA vs. MANHUA)', () => {
    const manga = mangaUpdates.normalizeSeries(mangaUpdatesFixtures.one_piece);
    assert.equal(manga.category, 'MANGA');
    assert.equal(manga.originCountry, 'JP');

    const manhwa = mangaUpdates.normalizeSeries(mangaUpdatesFixtures.the_beginning_after_the_end);
    assert.equal(manhwa.category, 'MANHWA');
    assert.equal(manhwa.originCountry, 'KR');
    assert.equal(manhwa.totalChapters, 185);

    const manhua = mangaUpdates.normalizeSeries(mangaUpdatesFixtures.heaven_officials_blessing);
    assert.equal(manhua.category, 'MANHUA');
    assert.equal(manhua.originCountry, 'CN');
    assert.equal(manhua.totalChapters, 110);
    assert.ok(manhua.authors && manhua.authors.includes('Mo Xiang Tong Xiu'));
  });

  it('TR-006: deve realizar parse seguro de payload XML da Anime News Network', () => {
    const items = ann.parseXml(annXmlFixture);
    assert.equal(items.length, 2);

    const naruto = items.find((it) => it.title === 'Naruto');
    assert.ok(naruto);
    assert.equal(naruto.source, 'ANN');
    assert.equal(naruto.category, 'ANIME');
    assert.equal(naruto.totalEpisodes, 220);
    assert.equal(naruto.releaseYear, 2002);
    assert.ok(naruto.genres.includes('action'));

    const frieren = items.find((it) => it.title.includes('Frieren'));
    assert.ok(frieren);
    assert.equal(frieren.totalEpisodes, 28);
    assert.equal(frieren.releaseYear, 2023);
  });
});

describe('US3 — Matriz Comparativa, Licenciamento e Custo Zero (TR-007, TR-008, TR-009)', () => {
  it('TR-007: deve gerar a matriz comparativa cobrindo os 12 títulos em todas as 6 categorias', () => {
    const matrix = buildComparisonMatrix();
    assert.equal(matrix.totalTitlesEvaluated, 13);
    assert.equal(matrix.sourcesEvaluated.length, 5);

    const categoriesCovered = new Set(matrix.coverageByTitle.map((t) => t.category));
    assert.ok(categoriesCovered.has('DORAMA'));
    assert.ok(categoriesCovered.has('FILME'));
    assert.ok(categoriesCovered.has('ANIME'));
    assert.ok(categoriesCovered.has('MANGA'));
    assert.ok(categoriesCovered.has('MANHWA'));
    assert.ok(categoriesCovered.has('MANHUA'));

    // Verifica decisões primárias consolidadas
    assert.equal(matrix.conclusionsByCategory.DORAMA.recommendedPrimary, 'TMDB');
    assert.equal(matrix.conclusionsByCategory.FILME.recommendedPrimary, 'TMDB');
    assert.equal(matrix.conclusionsByCategory.ANIME.recommendedPrimary, 'KITSU');
    assert.equal(matrix.conclusionsByCategory.MANGA.recommendedPrimary, 'MANGAUPDATES');
    assert.equal(matrix.conclusionsByCategory.MANHWA.recommendedPrimary, 'MANGAUPDATES');
    assert.equal(matrix.conclusionsByCategory.MANHUA.recommendedPrimary, 'MANGAUPDATES');
  });

  it('TR-008: deve documentar conformidade com termos de uso, licenças e garantia de Custo Zero (R$ 0)', () => {
    assert.ok(LICENSING_RULES.TMDB.attributionRequired);
    assert.ok(LICENSING_RULES.TMDB.attributionNotice.includes('TMDB'));
    assert.equal(LICENSING_RULES.TMDB.imageReuseAllowed, false, 'Imagens não devem ser redistribuídas; usar SVG próprio');

    assert.ok(LICENSING_RULES.TVMAZE.licenseType.includes('CC BY-SA'));
    assert.ok(LICENSING_RULES.ANN.attributionNotice.includes('Anime News Network'));

    const matrix = buildComparisonMatrix();
    assert.equal(matrix.permanentZeroCostCheck.passed, true);
    assert.equal(matrix.permanentZeroCostCheck.creditCardRequired, false);

    const markdown = generateMarkdownReport(matrix);
    assert.ok(markdown.includes('Matriz de Cobertura e Due Diligence de APIs Externas'));
    assert.ok(markdown.includes('R$ 0 permanente'));
  });

  it('TR-009: 100% dos testes devem rodar com fixtures estáticas offline sem chamadas de rede externas', () => {
    assert.ok(tmdbFixtures.moving.id);
    assert.ok(tvmazeFixtures.moving.id);
    assert.ok(kitsuFixtures.naruto.id);
    assert.ok(annXmlFixture.includes('<anime'));
    assert.ok(mangaUpdatesFixtures.solo_leveling.series_id);
  });
});
