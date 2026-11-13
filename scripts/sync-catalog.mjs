#!/usr/bin/env node
/**
 * YuukiList — Script CLI de Sincronização e Ingestão de Catálogo (Fase 4 MVP)
 * Executa ingestão a partir de APIs externas validadas ou fixtures canônicas,
 * grava proveniência auditável por campo e gera capas locais em SVG.
 * 
 * Uso:
 *   node scripts/sync-catalog.mjs --sample
 *   node scripts/sync-catalog.mjs --category DORAMA
 *   node scripts/sync-catalog.mjs --all
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CatalogRepository,
} from '../apps/api/src/data/catalog.repository.ts';
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
  SAMPLE_EXTERNAL_TITLES,
} from '../apps/api/src/data/sample-external-titles.ts';

export { SAMPLE_EXTERNAL_TITLES };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runCatalogSync(args = process.argv.slice(2)) {
  const isSample = args.includes('--sample');
  const isAll = args.includes('--all') || (!isSample && !args.some((a) => a.startsWith('--category')));
  const categoryArgIndex = args.indexOf('--category');
  const categoryFilter = categoryArgIndex >= 0 ? args[categoryArgIndex + 1]?.toUpperCase() : null;

  console.log('===============================================================');
  console.log('YuukiList — Sincronizador de Catálogo e Cache (Fase 4 MVP)');
  console.log('===============================================================');
  console.log(`Modo: ${isSample ? 'AMOSTRA (--sample)' : isAll ? 'COMPLETO (--all)' : 'FILTRADO'}`);
  if (categoryFilter) {
    console.log(`Filtro por categoria: ${categoryFilter}`);
  }

  const catalogRepo = new CatalogRepository();
  const coverService = new SvgCoverService();
  const coverStorage = new CoverStorageService();
  const ingestionService = new CatalogIngestionService(catalogRepo, coverService, coverStorage);

  // 1. Garante proveniência das 30 obras semeadas inicialmente
  console.log('\n[1/3] Assegurando proveniência SEED_CANONICAL para obras originais...');
  const seedCount = await ingestionService.ensureCanonicalSeedProvenance();
  console.log(`✓ ${seedCount} obras canônicas verificadas.`);

  // 2. Filtra DTOs a serem sincronizados
  let targetItems = [...SAMPLE_EXTERNAL_TITLES];
  if (categoryFilter) {
    targetItems = targetItems.filter((item) => item.category === categoryFilter);
  }
  if (isSample) {
    targetItems = targetItems.slice(0, 3);
  }

  console.log(`\n[2/3] Ingerindo ${targetItems.length} obras externas...`);
  const result = await ingestionService.syncCatalogBatch(targetItems);

  console.log(`✓ Processados: ${result.totalProcessed}`);
  console.log(`✓ Inseridos/Atualizados: ${result.totalInserted}`);
  console.log(`✓ Falhas: ${result.totalFailed}`);

  // 3. Exibe amostragem de proveniência gerada
  console.log('\n[3/3] Amostra de proveniência registrada:');
  for (const item of result.items) {
    console.log(` - [${item.category}] ${item.title} (${item.slug})`);
    console.log(`   Fonte Título: ${item.provenance.title.source} (ID: ${item.provenance.title.externalId || 'N/A'})`);
    console.log(`   Capa Soberana: ${item.provenance.cover.source} (Path: /assets/covers/${item.slug}.svg)`);
  }

  const totalCatalog = await catalogRepo.count();
  console.log(`\nTotal atual de obras no catálogo local: ${totalCatalog}`);
  console.log('Sincronização concluída com sucesso!');
  return {
    seedCount,
    ingestionResult: result,
    totalCatalog,
  };
}

if (process.argv[1] && process.argv[1].endsWith('sync-catalog.mjs')) {
  runCatalogSync().catch((err) => {
    console.error('Erro na sincronização:', err);
    process.exit(1);
  });
}

