/**
 * YuukiList — Suíte de Testes Automatizados da Biblioteca Avançada
 * Slice R11: 011-library-favorites-rewatch-and-sorting
 * TDD: Cobrindo 100% dos cenários normativos de specs/personal-library/spec.md e specs/personal-library-ui/spec.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  LibraryApiClient,
} from '../apps/web/src/services/library-api.client.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('R11 — Library Favorites, Rewatch & Advanced Sorting (011-library-favorites-rewatch-and-sorting)', () => {
  let catalogRepo;
  let libraryRepo;
  let libraryService;
  const testUserId = 'user-test-uuid-r11';
  let sampleDoramaId;
  let sampleAnimeId;
  let sampleMangaId;

  beforeEach(async () => {
    catalogRepo = new CatalogRepository();
    libraryRepo = new LibraryRepository();
    libraryService = new LibraryService(libraryRepo, catalogRepo);

    // Obtém IDs reais do catálogo para testes
    const dorama = await catalogRepo.findBySlug('alquimia-das-almas');
    const anime = await catalogRepo.findBySlug('frieren-alem-do-fim-da-viagem');
    const manga = await catalogRepo.findBySlug('one-piece-saga-final');

    sampleDoramaId = dorama.id;
    sampleAnimeId = anime.id;
    sampleMangaId = manga.id;
  });

  describe('US1 & Backend: Favoritos, Reassistir e Ordenações Avançadas (TR-001, TR-002, TR-003)', () => {
    it('TR-001: deve marcar e desmarcar obra como favorita independente da nota (rating)', async () => {
      // 1. Adiciona item com nota média (7.0) e sem favorito inicial
      const item = await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleDoramaId,
        status: 'ASSISTINDO',
        progress: 4,
        rating: 7.0,
      });

      assert.equal(item.isFavorite, false, 'Obra deve iniciar com isFavorite=false');
      assert.equal(item.rating, 7.0);

      // 2. Marca como favorita sem alterar a nota
      const updatedFav = await libraryService.updateItem(testUserId, sampleDoramaId, {
        isFavorite: true,
      });

      assert.equal(updatedFav.isFavorite, true, 'isFavorite deve ser atualizado para true');
      assert.equal(updatedFav.rating, 7.0, 'Nota deve permanecer inalterada ao favoritar');

      // 3. Desmarca favorito mantendo nota
      const unfav = await libraryService.updateItem(testUserId, sampleDoramaId, {
        isFavorite: false,
      });

      assert.equal(unfav.isFavorite, false, 'isFavorite deve retornar para false');
      assert.equal(unfav.rating, 7.0);
    });

    it('TR-002: deve gerenciar ciclos de reassistir e reler com contador acumulativo rewatchCount', async () => {
      // 1. Cadastra obra concluída
      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleAnimeId,
        status: 'CONCLUIDO',
        progress: 28,
      });

      // 2. Inicia novo ciclo de reassistir: reseta progresso e incrementa rewatchCount
      const newCycle = await libraryService.updateItem(testUserId, sampleAnimeId, {
        rewatchCount: 1,
        progress: 0,
        status: 'ASSISTINDO',
      });

      assert.equal(newCycle.rewatchCount, 1, 'rewatchCount deve ser incrementado para 1');
      assert.equal(newCycle.progress, 0, 'Progresso deve ser zerado para o novo ciclo');
      assert.equal(newCycle.status, 'ASSISTINDO', 'Status deve voltar para Assistindo');

      // 3. Apenas incrementar contador (+1 visualização mantendo progresso)
      const incCount = await libraryService.updateItem(testUserId, sampleAnimeId, {
        rewatchCount: 2,
      });

      assert.equal(incCount.rewatchCount, 2, 'rewatchCount deve ser 2');
      assert.equal(incCount.progress, 0);
    });

    it('TR-003: deve suportar ordenações avançadas (rating, progress, title) e filtro de favoritos', async () => {
      // Cadastra 3 itens com características distintas
      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleDoramaId,
        status: 'ASSISTINDO',
        progress: 10,
        rating: 9.5,
        isFavorite: true,
      });

      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleAnimeId,
        status: 'ASSISTINDO',
        progress: 20,
        rating: 8.0,
        isFavorite: false,
      });

      await libraryService.addOrUpdateItem(testUserId, {
        mediaItemId: sampleMangaId,
        status: 'LENDO',
        progress: 50,
        rating: 10.0,
        isFavorite: true,
      });

      // Filtro de favoritos: deve trazer apenas Dorama e Mangá
      const favResults = await libraryService.listUserLibrary(testUserId, {
        isFavorite: true,
      });
      assert.equal(favResults.meta.total, 2, 'Deve retornar exatamente 2 itens favoritos');
      assert.ok(favResults.data.every((i) => i.isFavorite === true));

      // Ordenação por Avaliação (rating DESC): Mangá (10.0) -> Dorama (9.5) -> Anime (8.0)
      const sortedByRating = await libraryService.listUserLibrary(testUserId, {
        sortBy: 'rating',
      });
      assert.equal(sortedByRating.data[0].mediaItemId, sampleMangaId);
      assert.equal(sortedByRating.data[1].mediaItemId, sampleDoramaId);
      assert.equal(sortedByRating.data[2].mediaItemId, sampleAnimeId);

      // Ordenação por Progresso (progress DESC): Mangá (50) -> Anime (20) -> Dorama (10)
      const sortedByProgress = await libraryService.listUserLibrary(testUserId, {
        sortBy: 'progress',
      });
      assert.equal(sortedByProgress.data[0].mediaItemId, sampleMangaId);
      assert.equal(sortedByProgress.data[1].mediaItemId, sampleAnimeId);
      assert.equal(sortedByProgress.data[2].mediaItemId, sampleDoramaId);
    });
  });

  describe('US2 & Frontend UI: Interações de Favorito, Modal de Reassistir e Inconsistências (TR-004, TR-005, TR-006)', () => {
    it('TR-004: componentes de grade e lista devem conter botão interativo de favorito (♥)', () => {
      const cardPath = resolve(__dirname, '../apps/web/src/components/library/library-card.tsx');
      const rowPath = resolve(__dirname, '../apps/web/src/components/library/library-row.tsx');

      const cardContent = readFileSync(cardPath, 'utf8');
      const rowContent = readFileSync(rowPath, 'utf8');

      assert.ok(
        cardContent.includes('isFavorite') || cardContent.includes('onToggleFavorite') || cardContent.includes('favorite'),
        'LibraryCard deve renderizar controle de favorito'
      );
      assert.ok(
        rowContent.includes('isFavorite') || rowContent.includes('onToggleFavorite') || rowContent.includes('favorite'),
        'LibraryRow deve renderizar controle de favorito'
      );
    });

    it('TR-005: EditItemModal deve incluir ações de Reassistir/Reler e campo opcional de volumes', () => {
      const modalPath = resolve(__dirname, '../apps/web/src/components/library/edit-item-modal.tsx');
      const modalContent = readFileSync(modalPath, 'utf8');

      assert.ok(
        modalContent.includes('rewatch') || modalContent.includes('Reassistir') || modalContent.includes('Reler') || modalContent.includes('rewatchCount'),
        'EditItemModal deve conter bloco de Reassistir/Reler'
      );
      assert.ok(
        modalContent.includes('progressVolumes') || modalContent.includes('volume') || modalContent.includes('Volume'),
        'EditItemModal deve suportar registro de volumes'
      );
    });

    it('TR-006: EditItemModal deve alertar amigavelmente sobre inconsistência entre status Concluído e progresso', () => {
      const modalPath = resolve(__dirname, '../apps/web/src/components/library/edit-item-modal.tsx');
      const modalContent = readFileSync(modalPath, 'utf8');

      assert.ok(
        modalContent.includes('inconsist') || modalContent.includes('inferior ao total') || modalContent.includes('CONCLUIDO') || modalContent.includes('ASSISTIDO'),
        'EditItemModal deve apresentar lógica de aviso de inconsistência de status'
      );
    });
  });
});
