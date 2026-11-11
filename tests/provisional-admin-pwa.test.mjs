// tests/provisional-admin-pwa.test.mjs

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { UserRole, RequestStatus } from '../packages/shared/src/index.ts';
import { UsersRepository } from '../apps/api/src/auth/users.repository.ts';
import { CatalogRepository } from '../apps/api/src/data/catalog.repository.ts';
import { LibraryRepository } from '../apps/api/src/library/library.repository.ts';
import { ProvisionalRepository } from '../apps/api/src/provisional/provisional.repository.ts';
import { ProvisionalService } from '../apps/api/src/provisional/provisional.service.ts';
import { AdminService, AdminForbiddenError } from '../apps/api/src/admin/admin.service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('R16 — Provisional Works, Inclusion Requests, Admin & PWA (016-provisional-works-and-admin)', () => {
  describe('Provisional Media Item Submission & Duplication Detection (TR-001, TR-002, TR-003, TR-004)', () => {
    it('TR-001: deve detectar obras semelhantes com algoritmo de similaridade trigram (>= 0.35)', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const libraryRepo = new LibraryRepository();
      const provisionalService = new ProvisionalService(provisionalRepo, catalogRepo, libraryRepo);

      // Obra do seed: "Solo Leveling: Ragnarok"
      const checkResult = await provisionalService.checkSimilarity('Solo Leveling');

      assert.equal(checkResult.hasPossibleDuplicates, true);
      assert.ok(checkResult.candidates.length > 0);
      const topMatch = checkResult.candidates[0];
      assert.ok(topMatch.similarity >= 0.35);
      assert.match(topMatch.title, /Solo Leveling/i);
    });

    it('TR-002: deve cadastrar obra provisoria quando nao ha correspondencia proxima direta', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const libraryRepo = new LibraryRepository();
      const usersRepo = new UsersRepository();
      const provisionalService = new ProvisionalService(provisionalRepo, catalogRepo, libraryRepo);

      const user = await usersRepo.create({
        email: 'solicitante@yuuki.com',
        username: 'solicitante1',
        passwordHash: 'hash123',
      });

      const uniqueTitle = 'Dorama Inédito de Mistério e Investigação 2026';
      const checkResult = await provisionalService.checkSimilarity(uniqueTitle);
      assert.equal(checkResult.hasPossibleDuplicates, false);
      assert.equal(checkResult.candidates.length, 0);

      const request = await provisionalService.createRequest(user.id, user.username, {
        title: uniqueTitle,
        category: 'DORAMA',
        format: 'SERIE',
        country: 'KR',
        releaseYear: 2026,
        synopsis: 'Um detetive investiga casos sobrenaturais em Seul.',
      });

      assert.ok(request.id);
      assert.equal(request.title, uniqueTitle);
      assert.equal(request.status, RequestStatus.PENDENTE);
      assert.ok(request.provisionalMediaItemId);
    });

    it('TR-003: deve adicionar obra provisoria automaticamente na biblioteca pessoal do solicitante', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const libraryRepo = new LibraryRepository();
      const usersRepo = new UsersRepository();
      const provisionalService = new ProvisionalService(provisionalRepo, catalogRepo, libraryRepo);

      const user = await usersRepo.create({
        email: 'leitor@yuuki.com',
        username: 'leitor_manhwa',
        passwordHash: 'hash123',
      });

      const request = await provisionalService.createRequest(user.id, user.username, {
        title: 'Manhwa Independente Sem Fonte Conhecida',
        category: 'MANHWA',
        format: 'WEBTOON',
        country: 'KR',
        releaseYear: 2025,
      });

      // Verifica que o item foi adicionado à biblioteca do usuário
      const userItem = await libraryRepo.findByUserAndMedia(user.id, request.provisionalMediaItemId);

      assert.ok(userItem, 'Obra provisória deve estar na biblioteca do usuário');
      assert.equal(userItem.status, 'QUERO_LER');
      assert.equal(userItem.progress, 0);

      // Verifica que o item no catálogo tem validationStatus = 'PROVISIONAL' e não aparece no findMany público
      const publicCatalog = await catalogRepo.findMany({});
      const inPublicCatalog = publicCatalog.data.some((i) => i.id === request.provisionalMediaItemId);
      assert.equal(inPublicCatalog, false, 'Obra provisória não deve poluir o catálogo público geral');
    });

    it('TR-004: deve atualizar status da solicitacao e disponibilizar feedback para o solicitante', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const libraryRepo = new LibraryRepository();
      const usersRepo = new UsersRepository();
      const provisionalService = new ProvisionalService(provisionalRepo, catalogRepo, libraryRepo);
      const adminService = new AdminService(provisionalRepo, catalogRepo);

      const user = await usersRepo.create({
        email: 'user_req@yuuki.com',
        username: 'user_req',
        passwordHash: 'hash123',
      });

      const admin = await usersRepo.create({
        email: 'admin_mod@yuuki.com',
        username: 'admin_mod',
        passwordHash: 'hash123',
        role: UserRole.MODERATOR,
      });

      const request = await provisionalService.createRequest(user.id, user.username, {
        title: 'Filme Incompleto Recusado',
        category: 'FILME',
        format: 'FILME',
        country: 'JP',
      });

      // Moderador recusa a solicitação com justificativa
      const moderated = await adminService.moderateRequest(admin.id, admin.role, request.id, {
        status: RequestStatus.RECUSADA,
        rejectionReason: 'Faltam dados essenciais de produção e sinopse.',
      });

      assert.equal(moderated.status, RequestStatus.RECUSADA);
      assert.equal(moderated.rejectionReason, 'Faltam dados essenciais de produção e sinopse.');

      // Solicitante consulta suas solicitações e recebe o feedback
      const myRequests = await provisionalService.getMyRequests(user.id);
      const myReq = myRequests.find((r) => r.id === request.id);
      assert.ok(myReq);
      assert.equal(myReq.status, RequestStatus.RECUSADA);
      assert.equal(myReq.rejectionReason, 'Faltam dados essenciais de produção e sinopse.');
    });
  });

  describe('Role-Based Access Control, Admin Dashboard & Field Protection (TR-005, TR-006, TR-007, TR-008)', () => {
    it('TR-005: deve permitir acesso a recursos administrativos exclusivamente para moderadores e admins', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const adminService = new AdminService(provisionalRepo, catalogRepo);

      // Usuário com papel MODERATOR
      const moderatorRequests = await adminService.listRequests(UserRole.MODERATOR);
      assert.ok(Array.isArray(moderatorRequests));

      // Usuário com papel ADMIN
      const adminRequests = await adminService.listRequests(UserRole.ADMIN);
      assert.ok(Array.isArray(adminRequests));
    });

    it('TR-006: deve bloquear acesso com 403 Forbidden para usuarios comuns sem privilégios', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const adminService = new AdminService(provisionalRepo, catalogRepo);

      // Tenta listar solicitações com papel USER comum
      await assert.rejects(
        async () => {
          await adminService.listRequests(UserRole.USER);
        },
        (err) => {
          assert.ok(err instanceof AdminForbiddenError);
          assert.equal(err.statusCode, 403);
          return true;
        }
      );

      // Tenta moderar solicitação com papel USER comum
      await assert.rejects(
        async () => {
          await adminService.moderateRequest('user-1', UserRole.USER, 'req-1', {
            status: RequestStatus.APROVADA,
          });
        },
        (err) => {
          assert.ok(err instanceof AdminForbiddenError);
          assert.equal(err.statusCode, 403);
          return true;
        }
      );
    });

    it('TR-007: deve aprovar solicitacao e promover obra provisoria ao catalogo oficial', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const libraryRepo = new LibraryRepository();
      const usersRepo = new UsersRepository();
      const provisionalService = new ProvisionalService(provisionalRepo, catalogRepo, libraryRepo);
      const adminService = new AdminService(provisionalRepo, catalogRepo);

      const user = await usersRepo.create({
        email: 'solicitante_aprovado@yuuki.com',
        username: 'solicitante_aprovado',
        passwordHash: 'hash123',
      });

      const admin = await usersRepo.create({
        email: 'admin_promotor@yuuki.com',
        username: 'admin_promotor',
        passwordHash: 'hash123',
        role: UserRole.ADMIN,
      });

      const request = await provisionalService.createRequest(user.id, user.username, {
        title: 'Manhua Promovido para Oficial',
        category: 'MANHUA',
        format: 'MANHUA',
        country: 'CN',
        releaseYear: 2024,
        synopsis: 'Cultivação e aventura marcial.',
      });

      // Admin aprova e ajusta metadados
      const moderated = await adminService.moderateRequest(admin.id, admin.role, request.id, {
        status: RequestStatus.APROVADA,
        title: 'Manhua Promovido para Oficial (Edição Revisada)',
        synopsis: 'Sinopse aprimorada pelo administrador.',
        releaseYear: 2024,
      });

      assert.equal(moderated.status, RequestStatus.APROVADA);

      // Verifica se a obra foi promovida no catálogo com validationStatus = 'VALIDATED'
      const allItems = await catalogRepo.getAllItems();
      const promoted = allItems.find((i) => i.id === request.provisionalMediaItemId);
      assert.ok(promoted);
      assert.equal(promoted.validationStatus, 'VALIDATED');
      assert.equal(promoted.isManuallyEdited, true);
      assert.equal(promoted.title, 'Manhua Promovido para Oficial (Edição Revisada)');

      // Agora a obra deve aparecer na listagem pública do catálogo
      const publicCatalog = await catalogRepo.findMany({ category: 'MANHUA' });
      const foundInPublic = publicCatalog.data.some((i) => i.id === request.provisionalMediaItemId);
      assert.equal(foundInPublic, true, 'Obra aprovada deve constar na listagem pública');
    });

    it('TR-008: deve travar campos editados manualmente contra sobrescrita automatica de fontes externas', async () => {
      const catalogRepo = new CatalogRepository();
      const provisionalRepo = new ProvisionalRepository();
      const adminService = new AdminService(provisionalRepo, catalogRepo);

      // Obra existente no catálogo
      const allItems = await catalogRepo.getAllItems();
      const originalItem = allItems[0];

      // Admin trava campos específicos (título e sinopse)
      await adminService.lockFields(UserRole.ADMIN, originalItem.id, ['title', 'synopsis']);

      // Simula sincronização externa tentando sobrescrever dados
      const updated = await adminService.syncExternalCatalogItem(originalItem.id, {
        title: 'Título Fornecido por API Externa (Inválido)',
        synopsis: 'Sinopse Fornecida por API Externa (Inválida)',
        rating: 9.8, // Campo não travado
      });

      // Campos travados devem ser mantidos intactos!
      assert.equal(updated.title, originalItem.title);
      assert.equal(updated.synopsis, originalItem.synopsis);
      // Campo não travado deve ser atualizado
      assert.equal(updated.rating, 9.8);
    });
  });

  describe('Web App Manifest, Service Worker & Safe Offline Cache (TR-009, TR-010, TR-011, TR-012)', () => {
    it('TR-009: deve disponibilizar manifesto PWA instalavel valido em conformidade com W3C', async () => {
      const manifestPath = path.resolve(__dirname, '../apps/web/src/app/manifest.ts');
      assert.ok(fs.existsSync(manifestPath), 'manifest.ts deve existir');

      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      assert.match(manifestContent, /name:\s*['"]YuukiList/i);
      assert.match(manifestContent, /display:\s*['"]standalone['"]/);
      assert.match(manifestContent, /theme_color/);
      assert.match(manifestContent, /background_color/);
      assert.match(manifestContent, /icons:/);
    });

    it('TR-010: deve registrar e ativar Service Worker para operacao offline', async () => {
      const swPath = path.resolve(__dirname, '../apps/web/public/sw.js');
      assert.ok(fs.existsSync(swPath), 'sw.js deve existir na pasta public');

      const swContent = fs.readFileSync(swPath, 'utf8');
      assert.match(swContent, /addEventListener\(['"]install['"]/);
      assert.match(swContent, /addEventListener\(['"]activate['"]/);
      assert.match(swContent, /addEventListener\(['"]fetch['"]/);
    });

    it('TR-011: deve fornecer navegacao offline servindo dados recentes em cache', async () => {
      const swPath = path.resolve(__dirname, '../apps/web/public/sw.js');
      const swContent = fs.readFileSync(swPath, 'utf8');

      // Verifica estratégia de cache para requisições offline
      assert.match(swContent, /caches\.match/);
      assert.match(swContent, /caches\.open/);
    });

    it('TR-012: deve expurgar obrigatoriamente todos os caches privados no evento de logout', async () => {
      const swPath = path.resolve(__dirname, '../apps/web/public/sw.js');
      const swContent = fs.readFileSync(swPath, 'utf8');

      // Verifica handler de mensagem PURGE_PRIVATE_CACHE
      assert.match(swContent, /PURGE_PRIVATE_CACHE/);
      assert.match(swContent, /caches\.delete/);
    });
  });
});
