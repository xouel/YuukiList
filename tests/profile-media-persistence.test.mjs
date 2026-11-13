import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { UsersRepository } from '../apps/api/src/auth/users.repository.ts';
import { ProfileRepository } from '../apps/api/src/profile/profile.repository.ts';
import { ProfileService } from '../apps/api/src/profile/profile.service.ts';
import { LibraryRepository } from '../apps/api/src/library/library.repository.ts';
import { CatalogRepository } from '../apps/api/src/data/catalog.repository.ts';
import { TokenService } from '../apps/api/src/auth/token.service.ts';
import { PasswordService } from '../apps/api/src/auth/password.service.ts';
import { AuthGuard } from '../apps/api/src/auth/auth.guard.ts';
import { AuthController } from '../apps/api/src/auth/auth.controller.ts';
import { AuthService } from '../apps/api/src/auth/auth.service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

describe('039-fix-profile-media-persistence — Regressão de Foto de Perfil, Capa e Navbar', () => {
  it('Schema Prisma e Migration SQL devem usar TEXT para avatar_url e banner_url (sem truncamento VarChar 512)', () => {
    const schemaPath = path.join(ROOT, 'apps/api/prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    assert.match(schema, /avatarUrl\s+String\?\s+@map\("avatar_url"\)\s+@db\.Text/);
    assert.match(schema, /bannerUrl\s+String\?\s+@map\("banner_url"\)\s+@db\.Text/);
    assert.doesNotMatch(schema, /avatarUrl\s+String\?\s+@map\("avatar_url"\)\s+@db\.VarChar\(512\)/);
    assert.doesNotMatch(schema, /bannerUrl\s+String\?\s+@map\("banner_url"\)\s+@db\.VarChar\(512\)/);

    const migrationsDir = path.join(ROOT, 'apps/api/prisma/migrations');
    const migrationFolders = fs.readdirSync(migrationsDir);
    const widenFolder = migrationFolders.find((f) => f.includes('widen_profile_media_columns'));
    assert.ok(widenFolder, 'Migration widen_profile_media_columns deve existir');

    const sql = fs.readFileSync(path.join(migrationsDir, widenFolder, 'migration.sql'), 'utf8');
    assert.match(sql, /ALTER TABLE "users"[\s\S]*ALTER COLUMN "avatar_url" TYPE TEXT/);
    assert.match(sql, /ALTER TABLE "users"[\s\S]*ALTER COLUMN "banner_url" TYPE TEXT/);
  });

  it('UsersRepository.updateProfile deve persistir Data URL > 512 chars via Prisma e falhar explicitamente se o DB recusar', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const longAvatarDataUrl = `data:image/webp;base64,${'A'.repeat(1200)}`;
    const longBannerDataUrl = `data:image/webp;base64,${'B'.repeat(2400)}`;

    const storedRow = {
      id: userId,
      email: 'yuuki@yuukilist.test',
      normalizedEmail: 'yuuki@yuukilist.test',
      username: 'YuukiTester',
      normalizedUsername: 'yuukitester',
      passwordHash: 'secret-hash-never-expose',
      avatarUrl: null,
      avatarFrame: 'none',
      bannerUrl: null,
      bio: null,
      phone: null,
      location: null,
      createdAt: new Date('2026-11-10T00:00:00.000Z'),
      updatedAt: new Date('2026-11-10T00:00:00.000Z'),
    };

    const mockPrisma = {
      user: {
        findUnique: async ({ where }) => (where.id === userId ? { ...storedRow } : null),
        update: async ({ where, data }) => {
          assert.equal(where.id, userId);
          if (data.avatarUrl !== undefined) storedRow.avatarUrl = data.avatarUrl;
          if (data.bannerUrl !== undefined) storedRow.bannerUrl = data.bannerUrl;
          if (data.avatarFrame !== undefined) storedRow.avatarFrame = data.avatarFrame;
          storedRow.updatedAt = new Date();
          return { ...storedRow };
        },
      },
    };

    const repo = new UsersRepository(mockPrisma);
    const updated = await repo.updateProfile(userId, {
      avatarUrl: longAvatarDataUrl,
      bannerUrl: longBannerDataUrl,
      avatarFrame: 'carmim',
    });

    assert.equal(updated.avatarUrl, longAvatarDataUrl);
    assert.equal(updated.bannerUrl, longBannerDataUrl);
    assert.equal(updated.avatarFrame, 'carmim');

    const reloaded = await repo.findById(userId);
    assert.equal(reloaded.avatarUrl, longAvatarDataUrl);
    assert.equal(reloaded.bannerUrl, longBannerDataUrl);

    // Simula falha de persistência no PostgreSQL: MUST NOT engolir silenciosamente em RAM
    const failingPrisma = {
      user: {
        findUnique: async () => ({ ...storedRow }),
        update: async () => {
          throw new Error('P2000: simulated database write error');
        },
      },
    };

    const failingRepo = new UsersRepository(failingPrisma);
    await assert.rejects(
      () => failingRepo.updateProfile(userId, { avatarUrl: longAvatarDataUrl }),
      /Falha ao salvar perfil|simulated database write error/i,
      'updateProfile com Prisma ativo deve propagar erro real em vez de simular sucesso em memória'
    );
  });

  it('ProfileService.updateProfile deve sanitizar retorno sem passwordHash e invalidar cache', async () => {
    const usersRepo = new UsersRepository();
    const user = await usersRepo.create({
      email: 'sanitize@yuukilist.test',
      username: 'SanitizedNick',
      passwordHash: 'super-secret-hash',
    });

    let invalidated = null;
    const service = new ProfileService(
      new ProfileRepository(),
      new LibraryRepository(),
      new CatalogRepository([]),
      usersRepo,
      undefined,
      (id) => {
        invalidated = id;
      }
    );

    const avatarData = `data:image/webp;base64,${'C'.repeat(900)}`;
    const bannerData = `data:image/webp;base64,${'D'.repeat(1500)}`;

    const res = await service.updateProfile(user.id, {
      avatarUrl: avatarData,
      bannerUrl: bannerData,
      avatarFrame: 'ouro',
    });

    assert.equal(invalidated, user.id);
    assert.equal(res.avatarUrl, avatarData);
    assert.equal(res.bannerUrl, bannerData);
    assert.equal(res.avatarFrame, 'ouro');
    assert.equal(res.passwordHash, undefined, 'Resposta do PATCH /profile/account nunca deve expor passwordHash');
  });

  it('AuthController.getMe deve suportar leitura fresca (bypassCache) entre múltiplas instâncias serverless', async () => {
    const usersRepo = new UsersRepository();
    const tokenService = new TokenService('unit-test-secret');
    const authGuard = new AuthGuard(tokenService, usersRepo, 45_000);
    const authService = new AuthService(usersRepo, new PasswordService(), tokenService);
    const authController = new AuthController(authService, authGuard);

    const reg = await authController.register({
      email: 'multilambda@yuukilist.test',
      username: 'LambdaNick',
      password: 'strongPassword123',
    });

    const req = { headers: {}, cookies: { yuukilist_session: reg.cookie.split(';')[0].split('=')[1] } };

    // Aquece cache da instância #2 com avatarUrl ainda null
    const initialMe = await authController.getMe(req);
    assert.equal(initialMe.avatarUrl, null);

    // Outra instância serverless grava nova foto no banco (sem chamar invalidateUserCache nesta instância)
    const freshAvatar = `data:image/webp;base64,${'Z'.repeat(800)}`;
    await usersRepo.updateProfile(reg.user.id, {
      avatarUrl: freshAvatar,
      avatarFrame: 'sakura',
    });

    // Leitura geral sem bypassCache preserva cache TTL
    const cachedGuardUser = await authGuard.validateRequest(req);
    assert.equal(cachedGuardUser.avatarUrl, null);

    // Chamada de /api/v1/auth/me com bypassCache traz imediatamente os dados atualizados e aquece cache
    const freshMe = await authController.getMe(req, { bypassCache: true });
    assert.equal(freshMe.avatarUrl, freshAvatar);
    assert.equal(freshMe.avatarFrame, 'sakura');

    const refreshedCacheUser = await authGuard.validateRequest(req);
    assert.equal(refreshedCacheUser.avatarUrl, freshAvatar);
  });

  it('Helpers de mídia (profile-media.ts) e contratos de rota/UI/SW devem garantir cache no-store, compressão e foto na navbar', async () => {
    const mediaLib = await import('../apps/web/src/lib/profile-media.ts');
    assert.ok(mediaLib.MAX_VERCEL_SAFE_UPLOAD_BYTES <= 4 * 1024 * 1024);
    assert.deepEqual(mediaLib.getProfileImageResizeSpec('avatar'), {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.85,
    });
    assert.deepEqual(mediaLib.getProfileImageResizeSpec('banner'), {
      maxWidth: 1440,
      maxHeight: 540,
      quality: 0.82,
    });
    assert.equal(
      mediaLib.formatCssBackgroundUrl('data:image/webp;base64,ABC"DEF'),
      'url("data:image/webp;base64,ABC%22DEF")'
    );
    assert.equal(mediaLib.formatCssBackgroundUrl('   '), null);

    const meRouteSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/app/api/v1/auth/me/route.ts'), 'utf8');
    const accountRouteSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/app/api/v1/profile/account/route.ts'), 'utf8');
    const uploadRouteSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/app/api/v1/profile/upload/route.ts'), 'utf8');
    const authClientSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/services/auth-api.client.ts'), 'utf8');
    const authCtxSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/context/auth-context.tsx'), 'utf8');
    const profilePageSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/app/profile/page.tsx'), 'utf8');
    const modalSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/components/profile/edit-profile-modal.tsx'), 'utf8');
    const navSrc = fs.readFileSync(path.join(ROOT, 'apps/web/src/components/layout/navigation-shell.tsx'), 'utf8');
    const swSrc = fs.readFileSync(path.join(ROOT, 'apps/web/public/sw.js'), 'utf8');

    assert.match(meRouteSrc, /export const dynamic = ['"]force-dynamic['"]/);
    assert.match(meRouteSrc, /bypassCache:\s*true/);
    assert.match(meRouteSrc, /no-store/);

    assert.match(accountRouteSrc, /export const dynamic = ['"]force-dynamic['"]/);
    assert.match(accountRouteSrc, /no-store/);

    assert.match(uploadRouteSrc, /4 \* 1024 \* 1024/);
    assert.match(authClientSrc, /cache:\s*['"]no-store['"]/);
    assert.match(authCtxSrc, /syncUserProfile/);
    assert.match(profilePageSrc, /syncUserProfile/);
    assert.match(profilePageSrc, /cache:\s*['"]no-store['"]/);
    assert.match(modalSrc, /useEffect/);
    assert.match(modalSrc, /optimizeProfileImageFile/);
    assert.match(modalSrc, /formatCssBackgroundUrl/);
    assert.match(navSrc, /user\.avatarUrl/);
    assert.match(navSrc, /user\.username/);
    assert.match(navSrc, /hidden sm:inline-block/);
    assert.match(swSrc, /\/api\/v1\/profile/);
  });
});
