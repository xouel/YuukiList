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
  Category,
  PublicationStatus,
} from '../packages/shared/src/index.ts';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Amostra representativa de obras externas das 6 categorias conforme PoC da fatia R8
export const SAMPLE_EXTERNAL_TITLES = [
  {
    source: 'TMDB',
    externalId: '85801',
    category: Category.DORAMA,
    title: 'Crash Landing on You',
    originalTitle: '사랑의 불시착',
    romanizedTitle: 'Sarang-ui Bulsichak',
    synopsis: 'Uma herdeira sul-coreana cai acidentalmente de parapente na Coreia do Norte.',
    releaseYear: 2019,
    originCountry: 'KR',
    publicationStatus: PublicationStatus.FINALIZADA,
    totalEpisodes: 16,
    totalSeasons: 1,
    genres: ['Romance', 'Comédia', 'Drama'],
    aliases: ['Pousando no Amor', 'Crash Landing into You'],
  },
  {
    source: 'TMDB',
    externalId: '120089',
    category: Category.DORAMA,
    title: 'Vincenzo',
    originalTitle: '빈센조',
    romanizedTitle: 'Binsenjo',
    synopsis: 'Um conselheiro mafioso ítalo-coreano viaja para a Coreia do Sul para recuperar ouro escondido.',
    releaseYear: 2021,
    originCountry: 'KR',
    publicationStatus: PublicationStatus.FINALIZADA,
    totalEpisodes: 20,
    totalSeasons: 1,
    genres: ['Crime', 'Comédia', 'Drama'],
    aliases: ['Vincenzo Cassano'],
  },
  {
    source: 'TMDB',
    externalId: '496243',
    category: Category.FILME,
    title: 'Parasita',
    originalTitle: '기생충',
    romanizedTitle: 'Gisaengchung',
    synopsis: 'Toda a família de Ki-taek está desempregada, vivendo num porão sujo e apertado.',
    releaseYear: 2019,
    originCountry: 'KR',
    publicationStatus: PublicationStatus.FINALIZADA,
    genres: ['Comédia', 'Suspense', 'Drama'],
    aliases: ['Parasite'],
  },
  {
    source: 'KITSU',
    externalId: '12',
    category: Category.ANIME,
    title: 'Frieren: Beyond Journey\'s End',
    originalTitle: '葬送のフリーレン',
    romanizedTitle: 'Sousou no Frieren',
    synopsis: 'A maga elfa Frieren e seus bravos companheiros derrotaram o Rei Demônio.',
    releaseYear: 2023,
    originCountry: 'JP',
    publicationStatus: PublicationStatus.FINALIZADA,
    totalEpisodes: 28,
    genres: ['Aventura', 'Fantasia', 'Drama'],
    aliases: ['Frieren e a Viagem para o Além'],
  },
  {
    source: 'MANGAUPDATES',
    externalId: '152434',
    category: Category.MANHWA,
    title: 'Solo Leveling',
    originalTitle: '나 혼자만 레벨업',
    synopsis: 'Dez anos atrás, após o Portal que conectava o mundo real com o mundo dos monstros se abrir.',
    releaseYear: 2018,
    originCountry: 'KR',
    publicationStatus: PublicationStatus.FINALIZADA,
    totalChapters: 200,
    genres: ['Ação', 'Fantasia', 'Sobrenatural'],
    aliases: ['I Alone Level Up', 'Na Honjaman Level Up'],
  },
  {
    source: 'MANGAUPDATES',
    externalId: '146743',
    category: Category.MANHUA,
    title: 'The Grandmaster of Demonic Cultivation',
    originalTitle: '魔道祖师',
    synopsis: 'Como o grande mestre que fundou a Seita Demoníaca, Wei Wuxian vagou pelo mundo de maneira desenfreada.',
    releaseYear: 2017,
    originCountry: 'CN',
    publicationStatus: PublicationStatus.FINALIZADA,
    totalChapters: 259,
    genres: ['Ação', 'Aventura', 'Sobrenatural'],
    aliases: ['Mo Dao Zu Shi'],
  },
  {
    source: 'MANGAUPDATES',
    externalId: '33',
    category: Category.MANGA,
    title: 'One Piece',
    originalTitle: 'ONE PIECE',
    synopsis: 'Monkey D. Luffy recusa que alguém fique no caminho de seu objetivo de se tornar o Rei dos Piratas.',
    releaseYear: 1997,
    originCountry: 'JP',
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    totalChapters: 1120,
    genres: ['Ação', 'Aventura', 'Comédia'],
    aliases: ['Wan Pīsu'],
  },
];

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

