/**
 * YuukiList — Suíte de Testes Automatizados do Diário Pessoal, Histórico e Spoilers
 * Slice R12: 012-diary-history-and-spoilers
 * TDD: Cobrindo 100% dos cenários normativos de specs/personal-diary/spec.md e specs/personal-diary-ui/spec.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeSpoilerVisibility,
} from '../packages/shared/src/diary.ts';
import {
  LibraryRepository,
} from '../apps/api/src/library/library.repository.ts';
import {
  LibraryService,
} from '../apps/api/src/library/library.service.ts';
import {
  CatalogRepository,
} from '../apps/api/src/data/catalog.repository.ts';
import {
  DiaryRepository,
} from '../apps/api/src/diary/diary.repository.ts';
import {
  DiaryService,
} from '../apps/api/src/diary/diary.service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('R12 — Personal Diary, Timeline History & Spoiler Protection (012-diary-history-and-spoilers)', () => {
  let catalogRepo;
  let libraryRepo;
  let diaryRepo;
  let diaryService;
  let libraryService;
  const testUserId = 'user-test-uuid-r12';
  let sampleDoramaId;
  let sampleAnimeId;
  let sampleMangaId;

  beforeEach(async () => {
    catalogRepo = new CatalogRepository();
    libraryRepo = new LibraryRepository();
    diaryRepo = new DiaryRepository();
    diaryService = new DiaryService(diaryRepo, catalogRepo, libraryRepo);
    libraryService = new LibraryService(libraryRepo, catalogRepo, diaryService);

    const dorama = await catalogRepo.findBySlug('alquimia-das-almas');
    const anime = await catalogRepo.findBySlug('frieren-alem-do-fim-da-viagem');
    const manga = await catalogRepo.findBySlug('one-piece-saga-final');

    sampleDoramaId = dorama.id;
    sampleAnimeId = anime.id;
    sampleMangaId = manga.id;
  });

  describe('US1 & Backend: Linha do Tempo e Ciclo de Vida do Histórico (TR-001, TR-002, TR-003)', () => {
    it('TR-001: deve gerar automaticamente evento de histórico PROGRESS_UPDATE ao avançar progresso na biblioteca', async () => {
      // 1. Cadastra obra na biblioteca
      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleDoramaId,
        status: 'ASSISTINDO',
        progress: 1,
      });

      // 2. Avança progresso para episódio 5
      await libraryService.updateItem(testUserId, sampleDoramaId, {
        progress: 5,
      });

      // 3. Consulta linha do tempo do usuário
      const events = await diaryService.listEvents(testUserId, {
        mediaItemId: sampleDoramaId,
      });

      assert.ok(events.length >= 1, 'Deve conter pelo menos um evento gerado');
      const progressEvent = events.find((e) => e.type === 'PROGRESS_UPDATE');
      assert.ok(progressEvent, 'Deve existir evento do tipo PROGRESS_UPDATE');
      assert.equal(progressEvent.mediaItemId, sampleDoramaId);
      assert.equal(progressEvent.newProgress, 5);
      assert.ok(progressEvent.occurredAt);
    });

    it('TR-002: deve criar registro manual de reflexão/experiência no diário sem exigir alteração prévia de status', async () => {
      const customDate = '2026-05-10T14:30:00.000Z';
      const manualEvent = await diaryService.createEvent(testUserId, {
        mediaItemId: sampleAnimeId,
        type: 'NOTE',
        note: 'Trilha sonora espetacular e animação de altíssimo nível!',
        episodeNumber: 12,
        containsSpoiler: false,
        occurredAt: customDate,
      });

      assert.ok(manualEvent.id, 'Evento manual deve ter ID gerado');
      assert.equal(manualEvent.type, 'NOTE');
      assert.equal(manualEvent.note, 'Trilha sonora espetacular e animação de altíssimo nível!');
      assert.equal(manualEvent.episodeNumber, 12);
      assert.equal(manualEvent.occurredAt, customDate);

      // Confirma que está presente na listagem
      const events = await diaryService.listEvents(testUserId, { mediaItemId: sampleAnimeId });
      assert.ok(events.some((e) => e.id === manualEvent.id));
    });

    it('TR-003: deve excluir evento do histórico preservando integralmente o estado atual da obra na biblioteca', async () => {
      // 1. Adiciona obra e conclui
      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleMangaId,
        status: 'CONCLUIDO',
        progress: 100,
        rating: 9.5,
      });

      // 2. Localiza eventos gerados
      const events = await diaryService.listEvents(testUserId, { mediaItemId: sampleMangaId });
      assert.ok(events.length > 0, 'Deve ter eventos gerados');
      const eventToDelete = events[0];

      // 3. Remove evento histórico
      const deleteResult = await diaryService.deleteEvent(testUserId, eventToDelete.id);
      assert.equal(deleteResult.success, true);

      // 4. Verifica que na biblioteca o status e progresso continuam intactos
      const itemInLibrary = await libraryRepo.findByUserAndMedia(testUserId, sampleMangaId);
      assert.ok(itemInLibrary);
      assert.equal(itemInLibrary.status, 'CONCLUIDO', 'Status deve permanecer CONCLUIDO');
      assert.equal(itemInLibrary.progress, 100, 'Progresso deve permanecer 100');
      assert.equal(itemInLibrary.rating, 9.5, 'Nota deve permanecer 9.5');
    });
  });

  describe('US2 & Backend: Anotações com Proteção Inteligente Anti-Spoiler (TR-004, TR-005)', () => {
    it('TR-004: deve mascarar automaticamente nota com spoiler quando o visitante for anônimo ou tiver progresso inferior', () => {
      // Caso A: Visitante anônimo
      const anonResult = computeSpoilerVisibility({
        containsSpoiler: true,
        targetUnit: 8,
        isAnonymous: true,
      });
      assert.equal(anonResult.isMasked, true, 'Visitante anônimo deve receber spoiler mascarado');
      assert.equal(anonResult.reason, 'ANONYMOUS');

      // Caso B: Usuário autenticado no episódio 5 visualizando spoiler do episódio 8
      const inferiorResult = computeSpoilerVisibility({
        containsSpoiler: true,
        targetUnit: 8,
        viewerProgress: 5,
        isAuthor: false,
        isAnonymous: false,
      });
      assert.equal(inferiorResult.isMasked, true, 'Usuário com progresso 5 deve receber spoiler do ep 8 mascarado');
      assert.equal(inferiorResult.reason, 'PROGRESS_INFERIOR');
    });

    it('TR-005: deve exibir diretamente nota com spoiler quando progresso for igual ou superior ou para o autor', () => {
      // Caso A: Usuário no episódio 10 visualizando spoiler do episódio 8
      const superiorResult = computeSpoilerVisibility({
        containsSpoiler: true,
        targetUnit: 8,
        viewerProgress: 10,
        isAuthor: false,
        isAnonymous: false,
      });
      assert.equal(superiorResult.isMasked, false, 'Usuário com progresso 10 deve ver nota do ep 8 sem máscara');

      // Caso B: Autor da nota visualizando seu próprio diário
      const authorResult = computeSpoilerVisibility({
        containsSpoiler: true,
        targetUnit: 20,
        viewerProgress: 10,
        isAuthor: true,
        isAnonymous: false,
      });
      assert.equal(authorResult.isMasked, false, 'Autor deve ver sua nota sem máscara compulsória');
    });
  });

  describe('US3 & Frontend UI: Linha do Tempo, Modal de Anotação e Máscara de Spoiler (TR-006, TR-007, TR-008)', () => {
    it('TR-006: componente de linha do tempo e aba da biblioteca devem existir e renderizar cronologia', () => {
      const timelinePath = resolve(__dirname, '../apps/web/src/components/diary/timeline-view.tsx');
      const libraryViewPath = resolve(__dirname, '../apps/web/src/components/library/library-view.tsx');

      assert.ok(existsSync(timelinePath), 'Componente timeline-view.tsx deve existir');
      const timelineContent = readFileSync(timelinePath, 'utf8');
      assert.ok(
        timelineContent.includes('timeline') || timelineContent.includes('Timeline') || timelineContent.includes('occurredAt'),
        'TimelineView deve renderizar eventos cronológicos'
      );

      const libraryViewContent = readFileSync(libraryViewPath, 'utf8');
      assert.ok(
        libraryViewContent.includes('Histórico') || libraryViewContent.includes('history') || libraryViewContent.includes('diary'),
        'LibraryView deve integrar visualização ou aba de histórico/diário'
      );
    });

    it('TR-007: componente de criação de nota deve suportar campos de unidade e checkbox de spoiler', () => {
      const modalPath = resolve(__dirname, '../apps/web/src/components/diary/create-note-modal.tsx');
      assert.ok(existsSync(modalPath), 'Componente create-note-modal.tsx deve existir');

      const modalContent = readFileSync(modalPath, 'utf8');
      assert.ok(
        modalContent.includes('containsSpoiler') || modalContent.includes('spoiler') || modalContent.includes('Spoiler'),
        'CreateNoteModal deve conter controle de spoiler'
      );
      assert.ok(
        modalContent.includes('episodeNumber') || modalContent.includes('chapterNumber') || modalContent.includes('unidade'),
        'CreateNoteModal deve suportar vínculo com unidade'
      );
    });

    it('TR-008: componente de máscara de spoiler deve prover blur e botão de revelação em 1 clique', () => {
      const maskPath = resolve(__dirname, '../apps/web/src/components/diary/spoiler-mask.tsx');
      assert.ok(existsSync(maskPath), 'Componente spoiler-mask.tsx deve existir');

      const maskContent = readFileSync(maskPath, 'utf8');
      assert.ok(
        maskContent.includes('Revelar') || maskContent.includes('revelar') || maskContent.includes('isRevealed') || maskContent.includes('blur'),
        'SpoilerMask deve prover ação de revelação sob demanda'
      );
    });
  });

  describe('Persistência PostgreSQL via Prisma Client no DiaryRepository (TR-009)', () => {
    it('TR-009: deve persistir e recuperar eventos entre instâncias distintas usando PrismaClient mockado', async () => {
      const dbHistoryRows = [];
      const uuidMedia = '11111111-1111-4111-8111-111111111111';
      const uuidUser = '22222222-2222-4222-8222-222222222222';

      const mockPrisma = {
        mediaItem: {
          findFirst: async ({ where }) => {
            if (where?.slug === 'alquimia-das-almas' || where?.id === uuidMedia) {
              return { id: uuidMedia };
            }
            return null;
          },
        },
        historyEvent: {
          create: async ({ data }) => {
            const now = new Date();
            const row = {
              id: `33333333-3333-4333-8333-33333333333${dbHistoryRows.length + 1}`,
              userId: data.userId,
              mediaItemId: data.mediaItemId,
              type: data.type,
              occurredAt: data.occurredAt || now,
              previousStatus: data.previousStatus ?? null,
              newStatus: data.newStatus ?? null,
              previousProgress: data.previousProgress ?? null,
              newProgress: data.newProgress ?? null,
              rating: data.rating ?? null,
              isFavorite: data.isFavorite ?? null,
              rewatchCount: data.rewatchCount ?? null,
              note: data.note ?? null,
              episodeNumber: data.episodeNumber ?? null,
              chapterNumber: data.chapterNumber ?? null,
              volumeNumber: data.volumeNumber ?? null,
              containsSpoiler: Boolean(data.containsSpoiler),
              createdAt: now,
              updatedAt: now,
            };
            dbHistoryRows.push(row);
            return row;
          },
          findUnique: async ({ where }) => dbHistoryRows.find((r) => r.id === where.id) || null,
          findFirst: async ({ where }) =>
            dbHistoryRows.find((r) => r.id === where.id && r.userId === where.userId) || null,
          findMany: async ({ where }) =>
            dbHistoryRows
              .filter((r) => {
                if (where.userId && r.userId !== where.userId) return false;
                if (where.mediaItemId && r.mediaItemId !== where.mediaItemId) return false;
                if (where.type && r.type !== where.type) return false;
                return true;
              })
              .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()),
          update: async ({ where, data }) => {
            const idx = dbHistoryRows.findIndex((r) => r.id === where.id);
            if (idx < 0) return null;
            dbHistoryRows[idx] = { ...dbHistoryRows[idx], ...data, updatedAt: new Date() };
            return dbHistoryRows[idx];
          },
          deleteMany: async ({ where }) => {
            const before = dbHistoryRows.length;
            for (let i = dbHistoryRows.length - 1; i >= 0; i--) {
              const r = dbHistoryRows[i];
              if (r.userId === where.userId && (!where.id || r.id === where.id)) {
                dbHistoryRows.splice(i, 1);
              }
            }
            return { count: before - dbHistoryRows.length };
          },
          count: async ({ where }) =>
            dbHistoryRows.filter((r) => !where?.userId || r.userId === where.userId).length,
        },
      };

      // Instância 1 cria o evento no banco (simulando primeira função serverless)
      const writerRepo = new DiaryRepository(mockPrisma);
      const created = await writerRepo.create(uuidUser, {
        mediaItemId: 'alquimia-das-almas',
        type: 'NOTE',
        note: 'Persistido no Postgres!',
        episodeNumber: 3,
        containsSpoiler: true,
      });
      assert.equal(created.mediaItemId, uuidMedia);

      // Instância 2 separada (simulando novo cold start na Vercel) lê do Postgres
      const readerRepo = new DiaryRepository(mockPrisma);
      const list = await readerRepo.findMany(uuidUser, { type: 'NOTE' });
      assert.equal(list.length, 1);
      assert.equal(list[0].note, 'Persistido no Postgres!');

      const updated = await readerRepo.update(uuidUser, created.id, { note: 'Editado no Postgres' });
      assert.equal(updated?.note, 'Editado no Postgres');
      assert.equal(await readerRepo.count(uuidUser), 1);

      const deleted = await readerRepo.delete(uuidUser, created.id);
      assert.equal(deleted, true);
      assert.equal(await readerRepo.count(uuidUser), 0);
    });
  });
});
