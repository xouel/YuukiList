/**
 * YuukiList — Testes de Prontidão Vercel Hobby + Supabase Free
 * Mudança: 038-prepare-vercel-supabase-deploy
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

describe('038 — Setup & Build Vercel + Supabase Free (TR-001)', () => {
  it('TR-001: deve configurar vercel.json, postinstall prisma generate, binaryTargets e tracing Next.js', () => {
    const vercelConfigPath = resolve(ROOT_DIR, 'vercel.json');
    assert.equal(existsSync(vercelConfigPath), true, 'vercel.json deve existir na raiz');

    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
    assert.equal(vercelConfig.framework, 'nextjs');
    assert.equal(vercelConfig.outputDirectory, 'apps/web/.next');
    assert.ok(
      String(vercelConfig.buildCommand || '').includes('prisma:generate') ||
        String(vercelConfig.buildCommand || '').includes('prisma generate'),
      'buildCommand no vercel.json deve garantir geração do Prisma Client'
    );

    const rootPkg = JSON.parse(readFileSync(resolve(ROOT_DIR, 'package.json'), 'utf8'));
    assert.ok(
      String(rootPkg.scripts?.postinstall || '').includes('prisma generate'),
      'package.json raiz deve conter postinstall com prisma generate'
    );

    const schemaContent = readFileSync(resolve(ROOT_DIR, 'apps/api/prisma/schema.prisma'), 'utf8');
    assert.ok(
      schemaContent.includes('rhel-openssl-3.0.x'),
      'schema.prisma deve declarar binaryTargets incluindo rhel-openssl-3.0.x para Vercel'
    );
    assert.ok(
      schemaContent.includes('model HistoryEvent') && schemaContent.includes('@@map("history_events")'),
      'schema.prisma deve modelar HistoryEvent -> history_events'
    );
    assert.ok(
      schemaContent.includes('model ShareLink') && schemaContent.includes('@@map("share_links")'),
      'schema.prisma deve modelar ShareLink -> share_links'
    );

    const nextConfigContent = readFileSync(resolve(ROOT_DIR, 'apps/web/next.config.mjs'), 'utf8');
    assert.ok(
      nextConfigContent.includes('serverExternalPackages') &&
        nextConfigContent.includes('@prisma/client'),
      'next.config.mjs deve externalizar @prisma/client'
    );
    assert.ok(
      nextConfigContent.includes('outputFileTracingRoot'),
      'next.config.mjs deve definir outputFileTracingRoot para monorepo'
    );

    const containerContent = readFileSync(resolve(ROOT_DIR, 'apps/web/src/server/container.ts'), 'utf8');
    assert.equal(
      containerContent.includes('scripts/sync-catalog.mjs'),
      false,
      'container.ts não deve importar scripts/sync-catalog.mjs com node:fs no runtime web'
    );
    assert.equal(
      existsSync(resolve(ROOT_DIR, 'apps/api/src/data/sample-external-titles.ts')),
      true,
      'sample-external-titles.ts puro deve existir em apps/api/src/data/'
    );
  });
});

describe('038 — Runtime Resilience, Auth Guardrail & Healthcheck (TR-002, TR-003, TR-004, TR-005, TR-013, TR-014)', () => {
  it('TR-002: SvgCoverService.saveCover e CatalogIngestionService devem tolerar filesystem somente leitura (EROFS/EACCES)', async (t) => {
    const fsModule = await import('node:fs');
    const apiModule = await import('../apps/api/src/index.ts');
    const sharedModule = await import('../packages/shared/src/index.ts');

    const { SvgCoverService, CatalogIngestionService, CatalogRepository } = apiModule;
    const { Category, PublicationStatus } = sharedModule;

    t.mock.method(fsModule.default, 'writeFileSync', () => {
      const err = new Error('EROFS: read-only file system');
      err.code = 'EROFS';
      throw err;
    });

    const coverService = new SvgCoverService('/tmp/ro-covers-test');
    const svg = coverService.generateSvgCover({
      title: 'Solo Leveling',
      category: Category.MANHWA,
      slug: 'solo-leveling',
    });

    assert.doesNotThrow(() => {
      coverService.saveCover('solo-leveling', svg);
    }, 'saveCover não deve propagar erro de escrita EROFS/EACCES');

    const repo = new CatalogRepository();
    const ingestion = new CatalogIngestionService(repo, coverService);
    const result = await ingestion.ingestFromExternalDto({
      source: 'TMDB',
      externalId: 'ro-1',
      category: Category.DORAMA,
      title: 'Obra Somente Leitura',
      synopsis: 'Teste de resiliência serverless.',
      releaseYear: 2025,
      originCountry: 'KR',
      publicationStatus: PublicationStatus.FINALIZADA,
      genres: ['Drama'],
      aliases: [],
    });

    assert.equal(result.title, 'Obra Somente Leitura');
  });

  it('TR-013 & TR-014: TokenService deve exigir JWT_SECRET em produção (lazy em runtime) sem quebrar construção estática', async () => {
    const { TokenService } = await import('../apps/api/src/auth/token.service.ts');

    const prevNodeEnv = process.env.NODE_ENV;
    const prevVercelEnv = process.env.VERCEL_ENV;
    const prevJwtSecret = process.env.JWT_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.VERCEL_ENV;
      delete process.env.JWT_SECRET;

      // Não deve lançar erro no import/construtor (para não quebrar next build)
      const tokenService = new TokenService();

      assert.throws(
        () =>
          tokenService.signSession({
            sub: 'user-1',
            email: 'u@test.com',
            username: 'u',
            role: 'USER',
          }),
        /JWT_SECRET/
      );

      assert.throws(
        () => tokenService.verifySession('a.b.c'),
        /JWT_SECRET/
      );

      // Com JWT_SECRET definido em produção, deve assinar e validar normalmente
      process.env.JWT_SECRET = 'prod_super_strong_secret_key_for_vercel_123456';
      const token = tokenService.signSession({
        sub: 'user-1',
        email: 'u@test.com',
        username: 'u',
        role: 'USER',
      });
      const verified = tokenService.verifySession(token);
      assert.equal(verified?.sub, 'user-1');
    } finally {
      if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = prevNodeEnv;

      if (prevVercelEnv === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = prevVercelEnv;

      if (prevJwtSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = prevJwtSecret;
    }
  });

  it('TR-003 & TR-004: evaluateHealthStatus deve retornar 200 (memory/connected) e 503 sanitizado em erro', async () => {
    const apiModule = await import('../apps/api/src/index.ts');
    assert.equal(
      typeof apiModule.evaluateHealthStatus,
      'function',
      'evaluateHealthStatus deve ser exportado por @yuukilist/api'
    );

    const prevDbUrl = process.env.DATABASE_URL;
    const prevDirectUrl = process.env.DIRECT_URL;

    try {
      delete process.env.DATABASE_URL;
      delete process.env.DIRECT_URL;

      // Sem banco configurado
      const memoryHealth = await apiModule.evaluateHealthStatus(null);
      assert.equal(memoryHealth.httpStatus, 200);
      assert.equal(memoryHealth.body.status, 'ok');
      assert.equal(memoryHealth.body.database, 'memory');

      // Banco conectado respondendo SELECT 1
      const connectedHealth = await apiModule.evaluateHealthStatus({
        $queryRaw: async () => [{ '?column?': 1 }],
      });
      assert.equal(connectedHealth.httpStatus, 200);
      assert.equal(connectedHealth.body.status, 'ok');
      assert.equal(connectedHealth.body.database, 'connected');

      // Banco configurado com falha na query não deve vazar URL ou senha
      process.env.DATABASE_URL = 'postgresql://postgres:secret_pass_123@db.supabase.co:6543/postgres';
      const brokenHealth = await apiModule.evaluateHealthStatus({
        $queryRaw: async () => {
          throw new Error('Can not reach postgresql://postgres:secret_pass_123@db.supabase.co:6543');
        },
      });
      assert.equal(brokenHealth.httpStatus, 503);
      assert.equal(brokenHealth.body.status, 'degraded');
      assert.equal(brokenHealth.body.database, 'error');
      const serialized = JSON.stringify(brokenHealth.body);
      assert.equal(serialized.includes('secret_pass_123'), false, 'Nunca vazar senha/connection string');
      assert.equal(serialized.includes('postgresql://'), false, 'Nunca vazar URI do Postgres');
    } finally {
      if (prevDbUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = prevDbUrl;

      if (prevDirectUrl === undefined) delete process.env.DIRECT_URL;
      else process.env.DIRECT_URL = prevDirectUrl;
    }

    const healthRoutePath = resolve(ROOT_DIR, 'apps/web/src/app/api/v1/health/route.ts');
    assert.equal(existsSync(healthRoutePath), true, 'Rota GET /api/v1/health deve existir');
    const routeContent = readFileSync(healthRoutePath, 'utf8');
    assert.ok(routeContent.includes('checkDatabaseHealth') || routeContent.includes('evaluateHealthStatus'));
    assert.ok(routeContent.includes('no-store'), 'Health endpoint deve usar Cache-Control: no-store');
  });

  it('TR-005: deve existir workflow gratuito supabase-keepalive.yml tolerante a secret opcional', () => {
    const workflowPath = resolve(ROOT_DIR, '.github/workflows/supabase-keepalive.yml');
    assert.equal(existsSync(workflowPath), true, 'Workflow supabase-keepalive.yml deve existir');

    const yml = readFileSync(workflowPath, 'utf8');
    assert.ok(yml.includes('schedule:') && yml.includes('cron:'), 'Deve conter trigger schedule cron');
    assert.ok(yml.includes('YUUKILIST_HEALTHCHECK_URL'), 'Deve usar secret YUUKILIST_HEALTHCHECK_URL');
  });
});

describe('038 — Wiring do ServerContainer para Diário e Links Públicos (TR-009, TR-012)', () => {
  it('TR-009 & TR-012: ServerContainer deve injetar prismaClient em DiaryRepository e ProfileRepository', () => {
    const containerSource = readFileSync(
      resolve(ROOT_DIR, 'apps/web/src/server/container.ts'),
      'utf8'
    );
    assert.ok(
      containerSource.includes('new DiaryRepository(prismaClient)'),
      'ServerContainer deve passar prismaClient para DiaryRepository'
    );
    assert.ok(
      containerSource.includes('new ProfileRepository(prismaClient)'),
      'ServerContainer deve passar prismaClient para ProfileRepository'
    );
  });
});
