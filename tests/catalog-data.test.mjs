/**
 * YuukiList — Testes Automatizados da Camada de Dados (catalog-data)
 * Cobre Requisitos:
 * - TR-001: Database Schema and Extension Provisioning (Migração inicial e extensão pg_trgm)
 * - TR-002: Canonical Categories and Publication Statuses (Validação de categoria e status canônicos)
 * - TR-003: Deterministic Seed Population (Execução idempotente do seed de 30 obras)
 * - TR-004 & TR-005: Local SVG Cover Serving and Fallback
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CATEGORIES,
  PUBLICATION_STATUSES,
  isCategory,
  isPublicationStatus,
  validateMediaMetadata,
  InvalidCatalogEnumError,
  normalizeSearchText,
  generateSlug,
} from '../packages/shared/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ============================================================================
// TR-002: Canonical Categories and Publication Statuses
// ============================================================================
test('TR-002: deve conter exatamente as 6 categorias canônicas do Documento Mestre', () => {
  assert.equal(CATEGORIES.length, 6);
  assert.deepEqual([...CATEGORIES], [
    'DORAMA',
    'FILME',
    'ANIME',
    'MANGA',
    'MANHWA',
    'MANHUA',
  ]);
  assert.equal(isCategory('DORAMA'), true);
  assert.equal(isCategory('MANHUA'), true);
  assert.equal(isCategory('SERIE_INVALIDA'), false);
});

test('TR-002: deve conter exatamente os 5 status canônicos de publicação', () => {
  assert.equal(PUBLICATION_STATUSES.length, 5);
  assert.deepEqual([...PUBLICATION_STATUSES], [
    'EM_ANDAMENTO',
    'FINALIZADA',
    'CANCELADA',
    'HIATO',
    'DESCONHECIDA',
  ]);
  assert.equal(isPublicationStatus('EM_ANDAMENTO'), true);
  assert.equal(isPublicationStatus('STATUS_INVALIDO'), false);
});

test('TR-002: deve validar metadados canônicos e rejeitar valores fora do vocabulário', () => {
  const valid = validateMediaMetadata({
    category: 'ANIME',
    publicationStatus: 'FINALIZADA',
  });
  assert.equal(valid.category, 'ANIME');
  assert.equal(valid.publicationStatus, 'FINALIZADA');

  assert.throws(
    () => validateMediaMetadata({ category: 'INVALIDA', publicationStatus: 'FINALIZADA' }),
    (err) => err instanceof InvalidCatalogEnumError && err.code === 'INVALID_CATEGORY'
  );

  assert.throws(
    () => validateMediaMetadata({ category: 'ANIME', publicationStatus: 'DESCONHECIDO_ERR' }),
    (err) => err instanceof InvalidCatalogEnumError && err.code === 'INVALID_PUBLICATION_STATUS'
  );
});

test('TR-002: deve normalizar texto de busca removendo acentos, pontuação e espaços redundantes', () => {
  const raw = '  Pousando no Amor: Edição Especial! (Crash Landing on You)  ';
  const normalized = normalizeSearchText(raw);
  assert.equal(normalized, 'pousando no amor edicao especial crash landing on you');

  const slug = generateSlug('Pousando no Amor!');
  assert.equal(slug, 'pousando-no-amor');
});

// ============================================================================
// TR-001: Database Schema and Extension Provisioning
// ============================================================================
test('TR-001: deve definir schema Prisma com modelos relacionais e extensão pg_trgm', () => {
  const schemaPath = path.join(rootDir, 'apps/api/prisma/schema.prisma');
  assert.equal(fs.existsSync(schemaPath), true, 'schema.prisma deve existir');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  assert.match(schemaContent, /extensions\s*=\s*\[pg_trgm\]/, 'extensão pg_trgm deve estar configurada no datasource');
  assert.match(schemaContent, /model\s+MediaItem\s*\{/, 'deve definir modelo MediaItem');
  assert.match(schemaContent, /model\s+ItemGenre\s*\{/, 'deve definir modelo ItemGenre');
  assert.match(schemaContent, /model\s+ItemAlias\s*\{/, 'deve definir modelo ItemAlias');
  assert.match(schemaContent, /enum\s+Category\s*\{/, 'deve definir enum Category');
  assert.match(schemaContent, /enum\s+PublicationStatus\s*\{/, 'deve definir enum PublicationStatus');
  assert.match(schemaContent, /normalizedTitle\s+String\s+@map\("normalized_title"\)/, 'deve mapear normalizedTitle');
});

test('TR-001: deve conter migration inicial provisionando pg_trgm, enums e índice GIN', () => {
  const migrationPath = path.join(
    rootDir,
    'apps/api/prisma/migrations/20261108000000_init_catalog_data/migration.sql'
  );
  assert.equal(fs.existsSync(migrationPath), true, 'migration inicial SQL deve existir');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+pg_trgm;/i, 'migration deve ativar pg_trgm');
  assert.match(sql, /CREATE\s+TYPE\s+"Category"\s+AS\s+ENUM/i, 'migration deve criar tipo Category');
  assert.match(sql, /CREATE\s+TYPE\s+"PublicationStatus"\s+AS\s+ENUM/i, 'migration deve criar tipo PublicationStatus');
  assert.match(sql, /CREATE\s+TABLE\s+"media_items"/i, 'migration deve criar tabela media_items');
  assert.match(sql, /CREATE\s+TABLE\s+"item_genres"/i, 'migration deve criar tabela item_genres');
  assert.match(sql, /CREATE\s+TABLE\s+"item_aliases"/i, 'migration deve criar tabela item_aliases');
  assert.match(
    sql,
    /CREATE\s+INDEX\s+"media_items_normalized_title_trgm_idx"\s+ON\s+"media_items"\s+USING\s+GIN\s+\("normalized_title"\s+gin_trgm_ops\);/i,
    'migration deve criar índice GIN trigram sobre normalized_title'
  );
  assert.match(sql, /ON\s+DELETE\s+CASCADE/i, 'migration deve configurar deleção em cascata');
});

// ============================================================================
// TR-003: Deterministic Seed Population
// ============================================================================
test('TR-003: SEED_MEDIA_ITEMS deve conter exatamente 30 obras com distribuição simétrica de categorias e status', async () => {
  const { SEED_MEDIA_ITEMS } = await import('../apps/api/src/data/seed-data.ts');
  const { runCatalogSeed, InMemoryCatalogRepository } = await import('../apps/api/src/data/seed.ts');

  assert.equal(SEED_MEDIA_ITEMS.length, 30, 'O seed deve conter exatamente 30 obras fictícias');

  const categories = ['DORAMA', 'FILME', 'ANIME', 'MANGA', 'MANHWA', 'MANHUA'];
  const statuses = ['EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'HIATO', 'DESCONHECIDA'];

  for (const cat of categories) {
    const itemsOfCat = SEED_MEDIA_ITEMS.filter((i) => i.category === cat);
    assert.equal(itemsOfCat.length, 5, `Categoria ${cat} deve conter exatamente 5 obras`);

    for (const st of statuses) {
      const match = itemsOfCat.find((i) => i.publicationStatus === st);
      assert.ok(match, `Categoria ${cat} deve conter exatamente uma obra com status ${st}`);
    }
  }

  // Validação de idempotência
  const repo = new InMemoryCatalogRepository();
  const run1 = await runCatalogSeed(repo);
  assert.equal(run1.totalItems, 30);
  assert.equal(await repo.count(), 30);

  const initialItems = await repo.getAll();
  const initialIds = initialItems.map((i) => ({ slug: i.slug, id: i.id }));

  // Segunda execução de seed no mesmo repositório
  const run2 = await runCatalogSeed(repo);
  assert.equal(run2.totalItems, 30);
  assert.equal(await repo.count(), 30, 'Reexecução do seed não deve duplicar itens');

  const secondItems = await repo.getAll();
  for (const init of initialIds) {
    const found = secondItems.find((s) => s.slug === init.slug);
    assert.ok(found, `Obra com slug '${init.slug}' deve ser preservada`);
    assert.equal(found.id, init.id, `ID interno da obra '${init.slug}' não deve ser alterado em reexecução de seed`);
  }
});

// ============================================================================
// TR-004 & TR-005: Local SVG Cover Serving and Fallback
// ============================================================================
test('TR-004 & TR-005: deve resolver capa SVG local válida para todos os 30 slugs do seed', async () => {
  const { CoverStorageService } = await import('../apps/api/src/data/cover-storage.service.ts');
  const { SEED_MEDIA_ITEMS } = await import('../apps/api/src/data/seed-data.ts');
  const { generateSlug } = await import('../packages/shared/src/index.ts');

  const service = new CoverStorageService();

  for (const item of SEED_MEDIA_ITEMS) {
    const slug = generateSlug(item.title);
    const cover = service.getCoverBySlug(slug);

    assert.equal(cover.slug, slug);
    assert.equal(cover.contentType, 'image/svg+xml');
    assert.equal(cover.isFallback, false, `Slug '${slug}' deve possuir capa original no disco`);
    assert.match(cover.svg, /<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `Capa de '${slug}' deve ser SVG válido`);
    assert.match(cover.svg, new RegExp(item.category), `Capa deve conter categoria '${item.category}'`);
  }
});

test('TR-005: deve retornar placeholder SVG seguro para slugs inexistentes, vazios ou com tentativa de path traversal', async () => {
  const { CoverStorageService } = await import('../apps/api/src/data/cover-storage.service.ts');
  const service = new CoverStorageService();

  // 1. Slug inexistente
  const missing = service.getCoverBySlug('obra-inexistente-12345');
  assert.equal(missing.contentType, 'image/svg+xml');
  assert.equal(missing.isFallback, true);
  assert.match(missing.svg, /Capa Indisponível/);

  // 2. Slug vazio
  const empty = service.getCoverBySlug('');
  assert.equal(empty.isFallback, true);
  assert.match(empty.svg, /Capa Indisponível/);

  // 3. Tentativas de Path Traversal
  const traversal1 = service.getCoverBySlug('../../etc/passwd');
  assert.equal(traversal1.isFallback, true);

  const traversal2 = service.getCoverBySlug('..\\..\\windows\\system32');
  assert.equal(traversal2.isFallback, true);

  const traversal3 = service.getCoverBySlug('malicious/slug');
  assert.equal(traversal3.isFallback, true);
});

// ============================================================================
// Integration: Apps and Shared Packages Entry Points
// ============================================================================
test('TR-Integration: apps/api e apps/web devem integrar e reexportar @yuukilist/shared', async () => {
  const apiEntry = await import('../apps/api/src/index.ts');
  assert.ok(apiEntry.runCatalogSeed);
  assert.ok(apiEntry.CoverStorageService);
  assert.equal(apiEntry.CATEGORIES.length, 6);

  const webEntry = await import('../apps/web/src/index.ts');
  assert.equal(webEntry.CATEGORIES.length, 6);
  assert.equal(webEntry.PUBLICATION_STATUSES.length, 5);
  assert.equal(typeof webEntry.normalizeSearchText, 'function');
});


