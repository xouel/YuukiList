import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ShareScope } from '../packages/shared/src/index.ts';
import { ProfileRepository } from '../apps/api/src/profile/profile.repository.ts';
import { ProfileService } from '../apps/api/src/profile/profile.service.ts';
import { LibraryRepository } from '../apps/api/src/library/library.repository.ts';
import { CatalogRepository } from '../apps/api/src/data/catalog.repository.ts';
import { UsersRepository } from '../apps/api/src/auth/users.repository.ts';
import { DiaryRepository } from '../apps/api/src/diary/diary.repository.ts';

describe('R15 — User Profile, Statistics, Granular Sharing & LGPD (015-profile-stats-and-sharing)', () => {
  describe('Profile Analytics & Showcase (TR-001, TR-002, TR-003, TR-004)', () => {
    it('TR-001: deve calcular metricas consolidadas de consumo, tempo estimado e distribuicoes', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();

      const user = await usersRepo.create({
        email: 'user1@yuuki.com',
        username: 'OtakuMaster',
        passwordHash: 'hash123',
      });

      // Cadastra obras no catálogo
      const dorama = { id: 'dorama-1', slug: 'dorama-1', title: 'The Untamed', category: 'DORAMA', coverUrl: '/untamed.svg', genres: ['Fantasia', 'Drama'], countryOfOrigin: 'CN' };
      const anime = { id: 'anime-1', slug: 'anime-1', title: 'Solo Leveling', category: 'ANIME', coverUrl: '/solo.svg', genres: ['Ação', 'Fantasia'], countryOfOrigin: 'KR' };
      const manga = { id: 'manga-1', slug: 'manga-1', title: 'One Piece', category: 'MANGA', coverUrl: '/op.svg', genres: ['Aventura'], countryOfOrigin: 'JP' };
      await catalogRepo.save(dorama);
      await catalogRepo.save(anime);
      await catalogRepo.save(manga);

      // Adiciona itens na biblioteca do usuário
      await libraryRepo.upsert(user.id, {
        mediaItemId: dorama.id,
        status: 'CONCLUIDO',
        progress: 50, // 50 eps = 50 horas
        rating: 10,
        isFavorite: true,
      });

      await libraryRepo.upsert(user.id, {
        mediaItemId: anime.id,
        status: 'ASSISTINDO',
        progress: 12, // 12 eps = 12 * 0.4 = 4.8 horas
        rating: 8,
      });

      await libraryRepo.upsert(user.id, {
        mediaItemId: manga.id,
        status: 'LENDO',
        progress: 1000,
        progressVolumes: 100,
      });

      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);
      const stats = await profileService.getStats(user.id);

      assert.equal(stats.userId, user.id);
      assert.equal(stats.username, 'OtakuMaster');
      assert.equal(stats.totalCompleted, 1);
      assert.equal(stats.totalWatchingOrReading, 2);
      assert.equal(stats.totalChaptersRead, 1000);
      assert.equal(stats.totalVolumesRead, 100);
      assert.equal(stats.averageRating, 9.0); // (10 + 8) / 2
      assert.ok(stats.totalEstimatedHours >= 54.8, 'Deve somar horas estimadas');
      assert.equal(stats.favorites.length, 1);
      assert.equal(stats.favorites[0].mediaItemId, dorama.id);
    });

    it('TR-002: deve tratar defensivamente usuarios recem-criados sem itens sem divisao por zero', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();

      const user = await usersRepo.create({
        email: 'newuser@yuuki.com',
        username: 'Newbie',
        passwordHash: 'hash123',
      });

      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);
      const stats = await profileService.getStats(user.id);

      assert.equal(stats.totalCompleted, 0);
      assert.equal(stats.totalWatchingOrReading, 0);
      assert.equal(stats.totalPlanToWatchOrRead, 0);
      assert.equal(stats.totalEstimatedHours, 0);
      assert.equal(stats.averageRating, null);
      assert.deepEqual(stats.favorites, []);
    });

    it('TR-003 & TR-004: deve expor vitrine de favoritos e mascarar notas privadas no payload compartilhado', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();

      const user = await usersRepo.create({
        email: 'userfav@yuuki.com',
        username: 'FavUser',
        passwordHash: 'hash123',
      });

      const anime = { id: 'anime-fav', slug: 'anime-fav', title: 'Frieren', category: 'ANIME', coverUrl: '/frieren.svg' };
      await catalogRepo.save(anime);

      await libraryRepo.upsert(user.id, {
        mediaItemId: anime.id,
        status: 'CONCLUIDO',
        rating: 10,
        isFavorite: true,
        notes: 'Minha anotação ultra secreta com spoiler',
      });

      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);

      // Gera link de compartilhamento
      const link = await profileService.createShareLink(user.id, 30);
      const sharedView = await profileService.getSharedView(link.token);

      assert.equal(sharedView.username, 'FavUser');
      assert.equal(sharedView.items.length, 1);
      assert.equal(sharedView.items[0].isFavorite, true);

      // Assegura que campos de notas privadas e spoilers não existem no payload compartilhado
      assert.equal(sharedView.items[0].notes, undefined, 'Notas privadas não podem ser expostas');
    });
  });

  describe('Granular Sharing Links (TR-005, TR-006, TR-007)', () => {
    it('TR-005: deve gerar link com token criptografico unico e validade determinada (7, 30, 90 dias)', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);

      const link7 = await profileService.createShareLink('u1', 7);
      assert.ok(link7.token.length >= 32);
      assert.equal(link7.isRevoked, false);

      const expires7 = new Date(link7.expiresAt).getTime();
      const now = Date.now();
      const diffDays7 = Math.round((expires7 - now) / (1000 * 60 * 60 * 24));
      assert.equal(diffDays7, 7);

      const link90 = await profileService.createShareLink('u1', 90);
      const diffDays90 = Math.round((new Date(link90.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24));
      assert.equal(diffDays90, 90);
    });

    it('TR-006: deve revogar link imediatamente e bloquear tentativas de acesso', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);

      const user = await usersRepo.create({
        email: 'user-rev@yuuki.com',
        username: 'Revoker',
        passwordHash: 'hash123',
      });

      const link = await profileService.createShareLink(user.id, 30);
      const activeBefore = await profileService.getActiveShareLinks(user.id);
      assert.equal(activeBefore.length, 1);

      // Revoga o link
      const revoked = await profileService.revokeShareLink(user.id, link.id);
      assert.equal(revoked, true);

      const activeAfter = await profileService.getActiveShareLinks(user.id);
      assert.equal(activeAfter.length, 0);

      // Tentativa de acessar link revogado deve lançar erro
      await assert.rejects(
        () => profileService.getSharedView(link.token),
        /revogado/
      );
    });

    it('TR-007: deve permitir visualizacao publica de biblioteca com escopo FAVORITES_ONLY', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);

      const user = await usersRepo.create({
        email: 'favonly@yuuki.com',
        username: 'FavOnlyUser',
        passwordHash: 'hash123',
      });

      const item1 = { id: 'it-1', slug: 'it-1', title: 'Item 1', category: 'ANIME', coverUrl: '/c1.svg' };
      const item2 = { id: 'it-2', slug: 'it-2', title: 'Item 2', category: 'ANIME', coverUrl: '/c2.svg' };
      await catalogRepo.save(item1);
      await catalogRepo.save(item2);

      await libraryRepo.upsert(user.id, { mediaItemId: item1.id, status: 'CONCLUIDO', isFavorite: true });
      await libraryRepo.upsert(user.id, { mediaItemId: item2.id, status: 'CONCLUIDO', isFavorite: false });

      const link = await profileService.createShareLink(user.id, 30, ShareScope.FAVORITES_ONLY);
      const shared = await profileService.getSharedView(link.token);

      assert.equal(shared.items.length, 1);
      assert.equal(shared.items[0].mediaItemId, item1.id);
    });
  });

  describe('Data Portability & LGPD Account Erasure (TR-008, TR-009, TR-010, TR-011)', () => {
    it('TR-008: deve exportar dados completos do usuario no formato JSON', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const diaryRepo = new DiaryRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo, diaryRepo);

      const user = await usersRepo.create({
        email: 'export@yuuki.com',
        username: 'Exporter',
        passwordHash: 'secret',
      });

      const media = { id: 'm-exp', slug: 'm-exp', title: 'Export Media', category: 'DORAMA', coverUrl: '/exp.svg' };
      await catalogRepo.save(media);
      await libraryRepo.upsert(user.id, { mediaItemId: media.id, status: 'ASSISTINDO', progress: 5 });
      await diaryRepo.create(user.id, { mediaItemId: media.id, type: 'PROGRESS_UPDATE', newProgress: 5, note: 'Nota privada' });

      const exported = await profileService.exportDataJson(user.id);
      assert.equal(exported.user.email, 'export@yuuki.com');
      assert.equal(exported.library.length, 1);
      assert.equal(exported.library[0].title, 'Export Media');
      assert.equal(exported.diary?.length, 1);
    });

    it('TR-009: deve formatar a biblioteca em CSV tabular legivel com separador virgula', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo);

      const user = await usersRepo.create({
        email: 'csv@yuuki.com',
        username: 'CsvUser',
        passwordHash: 'secret',
      });

      const media = { id: 'm-csv', slug: 'm-csv', title: 'Série, com vírgula', category: 'DORAMA', coverUrl: '/c.svg' };
      await catalogRepo.save(media);
      await libraryRepo.upsert(user.id, { mediaItemId: media.id, status: 'CONCLUIDO', progress: 16, rating: 9, isFavorite: true });

      const csv = await profileService.exportLibraryCsv(user.id);
      assert.ok(csv.includes('ID_OBRA,TITULO,CATEGORIA'));
      assert.ok(csv.includes('"Série, com vírgula"'));
      assert.ok(csv.includes('"DORAMA"'));
      assert.ok(csv.includes('"SIM"'));
    });

    it('TR-010 & TR-011: deve exigir consentimento explicito e expurgar dados na exclusao de conta', async () => {
      const profileRepo = new ProfileRepository();
      const libraryRepo = new LibraryRepository();
      const catalogRepo = new CatalogRepository();
      const usersRepo = new UsersRepository();
      const diaryRepo = new DiaryRepository();
      const profileService = new ProfileService(profileRepo, libraryRepo, catalogRepo, usersRepo, diaryRepo);

      const user = await usersRepo.create({
        email: 'delete@yuuki.com',
        username: 'DeleteMe',
        passwordHash: 'secret',
      });

      await libraryRepo.upsert(user.id, { mediaItemId: 'item-del', status: 'CONCLUIDO' });
      await diaryRepo.create(user.id, { mediaItemId: 'item-del', type: 'STATUS_CHANGE', note: 'Adeus' });
      await profileRepo.createShareLink(user.id, 30);

      // TR-011: Rejeita se consentimento não estiver confirmado
      await assert.rejects(
        () => profileService.deleteAccount(user.id, false),
        /Consentimento explícito obrigatório/
      );

      // TR-010: Executa exclusão com consentimento explícito
      const result = await profileService.deleteAccount(user.id, true);
      assert.equal(result.success, true);

      // Verifica expurgo completo
      const userCheck = await usersRepo.findById(user.id);
      assert.equal(userCheck, null, 'Usuário deve ser excluído do repositório');

      const libraryCheck = await libraryRepo.findMany(user.id);
      assert.equal(libraryCheck.total, 0, 'Biblioteca deve ser expurgada');

      const diaryCheck = await diaryRepo.count(user.id);
      assert.equal(diaryCheck, 0, 'Diário deve ser expurgado');

      const linksCheck = await profileRepo.findActiveLinksByUser(user.id);
      assert.equal(linksCheck.length, 0, 'Links de compartilhamento devem ser expurgados');
    });
  });
});
