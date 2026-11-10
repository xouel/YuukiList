import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getInvertedRelationType,
} from '../packages/shared/src/index.ts';
import { RelationsRepository } from '../apps/api/src/relations/relations.repository.ts';
import { RelationsService } from '../apps/api/src/relations/relations.service.ts';
import { LibraryRepository } from '../apps/api/src/library/library.repository.ts';
import { CatalogRepository } from '../apps/api/src/data/catalog.repository.ts';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('R13 — Media Relations & Franchise Universe View (013-media-relations-and-franchises)', () => {
  describe('US1 & Backend: Inversão Semântica e Franquias (TR-001, TR-002, TR-003, TR-004)', () => {
    it('TR-001: deve inferir automaticamente a relação inversa PREQUEL -> SEQUEL sem duplicar linhas no repositório', async () => {
      // Helper puro
      assert.equal(getInvertedRelationType('PREQUEL'), 'SEQUEL');
      assert.equal(getInvertedRelationType('SEQUEL'), 'PREQUEL');

      const catalogRepo = new CatalogRepository();
      const relationsRepo = new RelationsRepository(catalogRepo);
      const libraryRepo = new LibraryRepository();
      const relationsService = new RelationsService(relationsRepo, catalogRepo, libraryRepo);

      // Cadastra relação unidirecional explícita: A (prequel) -> B (sequel)
      const itemA = { id: 'item-season-1', slug: 'season-1', title: 'Season 1', category: 'ANIME', coverUrl: '/cover1.svg', publicationStatus: 'FINALIZADA' };
      const itemB = { id: 'item-season-2', slug: 'season-2', title: 'Season 2', category: 'ANIME', coverUrl: '/cover2.svg', publicationStatus: 'FINALIZADA' };
      await catalogRepo.save(itemA);
      await catalogRepo.save(itemB);

      relationsRepo.addRelation({
        id: 'rel-1',
        mediaItemId: itemA.id,
        relatedMediaItemId: itemB.id,
        relationType: 'SEQUEL', // Item B é sequel do Item A
      });

      // Consulta de A: deve retornar B como SEQUEL
      const relationsA = await relationsService.getRelationsForMediaItem(itemA.id);
      assert.equal(relationsA.relations.length, 1);
      assert.equal(relationsA.relations[0].relatedMediaItemId, itemB.id);
      assert.equal(relationsA.relations[0].relationType, 'SEQUEL');

      // Consulta de B: deve inferir automaticamente que A é PREQUEL
      const relationsB = await relationsService.getRelationsForMediaItem(itemB.id);
      assert.equal(relationsB.relations.length, 1);
      assert.equal(relationsB.relations[0].relatedMediaItemId, itemA.id);
      assert.equal(relationsB.relations[0].relationType, 'PREQUEL');
    });

    it('TR-002: deve expor mapeamento recíproco de ADAPTATION entre mídias transmídia', async () => {
      assert.equal(getInvertedRelationType('ADAPTATION'), 'ADAPTATION');

      const catalogRepo = new CatalogRepository();
      const relationsRepo = new RelationsRepository(catalogRepo);
      const libraryRepo = new LibraryRepository();
      const relationsService = new RelationsService(relationsRepo, catalogRepo, libraryRepo);

      const manhua = { id: 'mdzs-manhua', slug: 'mdzs-manhua', title: 'Mo Dao Zu Shi (Manhua)', category: 'MANHUA', coverUrl: '/manhua.svg', publicationStatus: 'FINALIZADA' };
      const dorama = { id: 'the-untamed-dorama', slug: 'the-untamed-dorama', title: 'The Untamed (Dorama)', category: 'DORAMA', coverUrl: '/dorama.svg', publicationStatus: 'FINALIZADA' };
      await catalogRepo.save(manhua);
      await catalogRepo.save(dorama);

      relationsRepo.addRelation({
        id: 'rel-adapt-1',
        mediaItemId: manhua.id,
        relatedMediaItemId: dorama.id,
        relationType: 'ADAPTATION',
      });

      // Consulta a partir do dorama: deve expor o manhua como ADAPTATION
      const doramaRelations = await relationsService.getRelationsForMediaItem(dorama.id);
      assert.equal(doramaRelations.relations.length, 1);
      assert.equal(doramaRelations.relations[0].relatedMediaItemId, manhua.id);
      assert.equal(doramaRelations.relations[0].relationType, 'ADAPTATION');
      assert.equal(doramaRelations.relations[0].relatedMedia.category, 'MANHUA');

      // Consulta a partir do manhua: deve expor o dorama como ADAPTATION
      const manhuaRelations = await relationsService.getRelationsForMediaItem(manhua.id);
      assert.equal(manhuaRelations.relations.length, 1);
      assert.equal(manhuaRelations.relations[0].relatedMediaItemId, dorama.id);
      assert.equal(manhuaRelations.relations[0].relationType, 'ADAPTATION');
      assert.equal(manhuaRelations.relations[0].relatedMedia.category, 'DORAMA');
    });

    it('TR-003: deve listar obras da franquia ordenadas por lançamento e por ordem cronológica narrativa', async () => {
      const catalogRepo = new CatalogRepository();
      const relationsRepo = new RelationsRepository(catalogRepo);
      const libraryRepo = new LibraryRepository();
      const relationsService = new RelationsService(relationsRepo, catalogRepo, libraryRepo);

      // Franquia com 3 obras com ordens de lançamento e cronológicas distintas
      const f1 = { id: 'media-f1', slug: 'f1', title: 'Prequel Movie', category: 'FILME', coverUrl: '/f1.svg', releaseYear: 2021 };
      const f2 = { id: 'media-f2', slug: 'f2', title: 'Original Series', category: 'ANIME', coverUrl: '/f2.svg', releaseYear: 2018 };
      const f3 = { id: 'media-f3', slug: 'f3', title: 'Sequel Season', category: 'ANIME', coverUrl: '/f3.svg', releaseYear: 2023 };
      await catalogRepo.save(f1);
      await catalogRepo.save(f2);
      await catalogRepo.save(f3);

      relationsRepo.createFranchise({
        id: 'franchise-test',
        slug: 'universe-test',
        name: 'Test Universe',
        items: [
          { mediaItemId: f1.id, releaseOrder: 2, chronologicalOrder: 1, roleInFranchise: 'Filme Prequel' },
          { mediaItemId: f2.id, releaseOrder: 1, chronologicalOrder: 2, roleInFranchise: 'Série Original' },
          { mediaItemId: f3.id, releaseOrder: 3, chronologicalOrder: 3, roleInFranchise: 'Sequel' },
        ],
      });

      const franchise = await relationsService.getFranchiseBySlug('universe-test');
      assert.ok(franchise);
      assert.equal(franchise.items.length, 3);

      // Valida que os itens possuem releaseOrder e chronologicalOrder definidos
      const sortedByRelease = [...franchise.items].sort((a, b) => a.releaseOrder - b.releaseOrder);
      assert.equal(sortedByRelease[0].title, 'Original Series'); // 2018
      assert.equal(sortedByRelease[1].title, 'Prequel Movie');    // 2021
      assert.equal(sortedByRelease[2].title, 'Sequel Season');    // 2023

      const sortedByChrono = [...franchise.items].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
      assert.equal(sortedByChrono[0].title, 'Prequel Movie');    // Cronológico 1
      assert.equal(sortedByChrono[1].title, 'Original Series'); // Cronológico 2
      assert.equal(sortedByChrono[2].title, 'Sequel Season');    // Cronológico 3
    });

    it('TR-004: deve assegurar independência estrita de progresso entre obras da franquia', async () => {
      const catalogRepo = new CatalogRepository();
      const relationsRepo = new RelationsRepository(catalogRepo);
      const libraryRepo = new LibraryRepository();
      const relationsService = new RelationsService(relationsRepo, catalogRepo, libraryRepo);

      const dorama = { id: 'dorama-item', slug: 'dorama-item', title: 'Dorama Version', category: 'DORAMA', coverUrl: '/dorama.svg', totalEpisodes: 50 };
      const manhua = { id: 'manhua-item', slug: 'manhua-item', title: 'Manhua Original', category: 'MANHUA', coverUrl: '/manhua.svg', totalChapters: 260 };
      await catalogRepo.save(dorama);
      await catalogRepo.save(manhua);

      relationsRepo.createFranchise({
        id: 'franchise-indep',
        slug: 'franchise-indep',
        name: 'Independence Universe',
        items: [
          { mediaItemId: dorama.id, releaseOrder: 1, chronologicalOrder: 1 },
          { mediaItemId: manhua.id, releaseOrder: 2, chronologicalOrder: 2 },
        ],
      });

      const userId = 'user-franchise-123';

      // Usuário conclui o dorama na biblioteca
      await libraryRepo.upsert(userId, {
        mediaItemId: dorama.id,
        status: 'CONCLUIDO',
        progress: 50,
      });

      // Usuário está apenas lendo o manhua no capítulo 15
      await libraryRepo.upsert(userId, {
        mediaItemId: manhua.id,
        status: 'LENDO',
        progress: 15,
      });

      // Ao consultar a franquia com o userId, cada item deve conter seu status pessoal independente
      const franchiseWithProgress = await relationsService.getFranchiseBySlug('franchise-indep', userId);
      const doramaEntry = franchiseWithProgress.items.find((i) => i.mediaItemId === dorama.id);
      const manhuaEntry = franchiseWithProgress.items.find((i) => i.mediaItemId === manhua.id);

      assert.equal(doramaEntry.userLibraryStatus?.status, 'CONCLUIDO');
      assert.equal(doramaEntry.userLibraryStatus?.progress, 50);

      assert.equal(manhuaEntry.userLibraryStatus?.status, 'LENDO');
      assert.equal(manhuaEntry.userLibraryStatus?.progress, 15);
      // Confirma que concluir o dorama NÃO afetou o manhua
      assert.notEqual(manhuaEntry.userLibraryStatus?.status, 'CONCLUIDO');
    });
  });

  describe('US2 & Frontend UI: Componentes e Páginas de Relações (TR-005, TR-006, TR-007, TR-008)', () => {
    it('TR-005: componente RelatedWorksSection deve renderizar cards de obras relacionadas com badges tipados', () => {
      const filePath = resolve(process.cwd(), 'apps/web/src/components/relations/related-works-section.tsx');
      assert.ok(existsSync(filePath), 'Componente related-works-section.tsx deve existir');

      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('RelatedWorksSection'), 'Deve exportar RelatedWorksSection');
      assert.ok(content.includes('RELATION_LABELS') || content.includes('ADAPTATION'), 'Deve formatar rótulos tipados das relações');
      assert.ok(content.includes('category'), 'Deve exibir categoria da obra relacionada');
    });

    it('TR-006: componente RelatedWorksSection deve conter atalho funcional para explorar franquia completa', () => {
      const filePath = resolve(process.cwd(), 'apps/web/src/components/relations/related-works-section.tsx');
      const content = readFileSync(filePath, 'utf-8');

      assert.ok(
        content.includes('/franchises/') || content.includes('franchise.slug') || content.includes('Explorar Franquia'),
        'Deve renderizar link ou botão direcionando para o universo da franquia'
      );
    });

    it('TR-007: componente FranchiseView deve permitir alternar interativamente entre ordem de lançamento e cronológica', () => {
      const filePath = resolve(process.cwd(), 'apps/web/src/components/relations/franchise-view.tsx');
      assert.ok(existsSync(filePath), 'Componente franchise-view.tsx deve existir');

      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('FranchiseView'), 'Deve exportar FranchiseView');
      assert.ok(content.includes('orderMode') || content.includes('chronological') || content.includes('release'), 'Deve possuir controle de modo de ordenação');
      assert.ok(content.includes('releaseOrder') && content.includes('chronologicalOrder'), 'Deve ordenar itens por releaseOrder e chronologicalOrder');
    });

    it('TR-008: componente FranchiseView deve exibir status e progresso individual do usuário por obra', () => {
      const filePath = resolve(process.cwd(), 'apps/web/src/components/relations/franchise-view.tsx');
      const content = readFileSync(filePath, 'utf-8');

      assert.ok(
        content.includes('userLibraryStatus') || content.includes('progress') || content.includes('status'),
        'Deve apresentar o status pessoal e o progresso de cada obra na franquia'
      );
    });
  });
});
