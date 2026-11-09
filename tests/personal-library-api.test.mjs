/**
 * YuukiList — Testes Automatizados da API de Biblioteca Pessoal (Slice R6: 006-personal-library-api)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/personal-library/spec.md (TR-001 a TR-009)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  AuthModule,
  LibraryModule,
  LibraryRepository,
  LibraryService,
  LibraryController,
  IncompatibleStatusError,
  InvalidProgressError,
  LibraryItemNotFoundError,
  MediaItemNotFoundError,
  UnauthorizedError,
  CatalogRepository,
  AUTH_COOKIE_NAME,
} from '../apps/api/src/index.ts';

describe('US1 — Gerenciamento da Biblioteca Pessoal e Validação de Status (TR-001, TR-002, TR-003)', () => {
  let authModule;
  let libraryModule;
  let controller;
  let testUser;
  let userCookie;

  beforeEach(async () => {
    authModule = new AuthModule();
    libraryModule = new LibraryModule(undefined, undefined, authModule.authGuard);
    controller = libraryModule.libraryController;

    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const reg = await authModule.authController.register(
      {
        email: `library_test_${Date.now()}@yuukilist.test`,
        username: `libuser_${Date.now()}`,
        password: 'password123',
      },
      mockRes
    );
    testUser = reg.user;

    const cookieHeader = headersMap['Set-Cookie'];
    const tokenMatch = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    userCookie = tokenMatch ? tokenMatch[1] : '';
  });

  it('TR-001: deve adicionar obra à biblioteca com status compatível (DORAMA -> ASSISTINDO)', async () => {
    // Alquimia das Almas é um DORAMA no seed
    const media = await libraryModule.catalogRepository.findBySlug('alquimia-das-almas');
    assert.ok(media, 'Obra Alquimia das Almas deve existir no catálogo');

    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    const item = await controller.addItem(req, {
      mediaItemId: media.id,
      status: 'ASSISTINDO',
      progress: 3,
      rating: 9.0,
      notes: 'Gostando muito da narrativa mágica.',
    });

    assert.ok(item.id, 'Deve retornar ID do registro');
    assert.equal(item.userId, testUser.id);
    assert.equal(item.mediaItemId, media.id);
    assert.equal(item.status, 'ASSISTINDO');
    assert.equal(item.progress, 3);
    assert.equal(item.rating, 9.0);
    assert.equal(item.notes, 'Gostando muito da narrativa mágica.');
    assert.equal(item.mediaItem.title, 'Alquimia das Almas');
    assert.equal(item.mediaItem.category, 'DORAMA');
  });

  it('TR-002: deve rejeitar status pessoal incompatível com a categoria da obra (MANGA com QUERO_ASSISTIR ou ASSISTIDO)', async () => {
    // Busca obra MANGA
    const catalogRes = await libraryModule.catalogRepository.findMany({ category: 'MANGA', limit: 1 });
    const manga = catalogRes.data[0];
    assert.ok(manga, 'Deve existir obra MANGA no catálogo');

    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    await assert.rejects(
      async () => {
        await controller.addItem(req, {
          mediaItemId: manga.id,
          status: 'QUERO_ASSISTIR',
        });
      },
      (err) => {
        assert.ok(err instanceof IncompatibleStatusError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /incompatível com a categoria/i);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await controller.addItem(req, {
          mediaItemId: manga.id,
          status: 'ASSISTIDO',
        });
      },
      (err) => {
        assert.ok(err instanceof IncompatibleStatusError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });

  it('TR-003: deve atualizar status atomicamente e remover obra da biblioteca com sucesso', async () => {
    // Obra MANGA com status LENDO
    const catalogRes = await libraryModule.catalogRepository.findMany({ category: 'MANGA', limit: 1 });
    const manga = catalogRes.data[0];

    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    // Adiciona com status LENDO
    await controller.addItem(req, {
      mediaItemId: manga.id,
      status: 'LENDO',
      progress: 5,
    });

    // Atualiza para PAUSADO via PATCH
    const updated = await controller.updateItem(req, manga.id, {
      status: 'PAUSADO',
    });
    assert.equal(updated.status, 'PAUSADO');
    assert.equal(updated.progress, 5);

    // Remove via DELETE
    const delResult = await controller.removeItem(req, manga.id);
    assert.equal(delResult.success, true);

    // Verificação de que não se encontra mais na biblioteca
    await assert.rejects(
      async () => {
        await controller.getItem(req, manga.id);
      },
      (err) => {
        assert.ok(err instanceof LibraryItemNotFoundError);
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });
});

describe('US2 — Progresso e Cálculo Dinâmico de Condição "Em Dia" (TR-004, TR-005, TR-006)', () => {
  let authModule;
  let libraryModule;
  let controller;
  let testUser;
  let userCookie;
  let testMediaWithUnits;

  beforeEach(async () => {
    authModule = new AuthModule();

    // Cria repositório com obras customizadas para teste de total de unidades
    const customMedia = [
      {
        id: '11111111-1111-4000-8000-000000000001',
        slug: 'serie-finalizada-12-eps',
        title: 'Série Finalizada 12 Eps',
        originalTitle: null,
        romanizedTitle: null,
        normalizedTitle: 'serie finalizada 12 eps',
        synopsis: 'Uma série finalizada com 12 episódios.',
        category: 'DORAMA',
        publicationStatus: 'FINALIZADA',
        releaseYear: 2024,
        originCountry: 'KR',
        rating: 8.5,
        coverPath: '/assets/covers/serie-finalizada-12-eps.svg',
        genres: ['Drama'],
        aliases: [],
        totalEpisodes: 12,
        totalChapters: null,
        totalVolumes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '22222222-2222-4000-8000-000000000002',
        slug: 'serie-em-andamento-8-eps',
        title: 'Série Em Andamento 8 Eps',
        originalTitle: null,
        romanizedTitle: null,
        normalizedTitle: 'serie em andamento 8 eps',
        synopsis: 'Uma série em exibição com 8 episódios lançados até agora.',
        category: 'ANIME',
        publicationStatus: 'EM_ANDAMENTO',
        releaseYear: 2026,
        originCountry: 'JP',
        rating: 9.0,
        coverPath: '/assets/covers/serie-em-andamento-8-eps.svg',
        genres: ['Ação'],
        aliases: [],
        totalEpisodes: 8,
        totalChapters: null,
        totalVolumes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '33333333-3333-4000-8000-000000000003',
        slug: 'filme-cinema',
        title: 'Filme Cinema',
        originalTitle: null,
        romanizedTitle: null,
        normalizedTitle: 'filme cinema',
        synopsis: 'Um longa metragem.',
        category: 'FILME',
        publicationStatus: 'FINALIZADA',
        releaseYear: 2025,
        originCountry: 'KR',
        rating: 8.0,
        coverPath: '/assets/covers/filme-cinema.svg',
        genres: ['Drama'],
        aliases: [],
        totalEpisodes: null,
        totalChapters: null,
        totalVolumes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const catalogRepo = new CatalogRepository(customMedia);
    const libRepo = new LibraryRepository();
    libraryModule = new LibraryModule(libRepo, catalogRepo, authModule.authGuard);
    controller = libraryModule.libraryController;

    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const reg = await authModule.authController.register(
      {
        email: `progress_test_${Date.now()}@yuukilist.test`,
        username: `proguser_${Date.now()}`,
        password: 'password123',
      },
      mockRes
    );
    testUser = reg.user;
    const cookieHeader = headersMap['Set-Cookie'];
    const tokenMatch = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    userCookie = tokenMatch ? tokenMatch[1] : '';
  });

  it('TR-004: deve registrar progresso e calcular dinamicamente isUpToDate = true ao atingir total (12/12)', async () => {
    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    // Inicialmente com 6 episódios: isUpToDate = false
    const itemInit = await controller.addItem(req, {
      mediaItemId: '11111111-1111-4000-8000-000000000001',
      status: 'ASSISTINDO',
      progress: 6,
    });
    assert.equal(itemInit.isUpToDate, false);

    // Atualiza progresso para 12/12
    const itemDone = await controller.updateItem(req, '11111111-1111-4000-8000-000000000001', {
      progress: 12,
    });
    assert.equal(itemDone.progress, 12);
    assert.equal(itemDone.isUpToDate, true, 'isUpToDate deve ser verdadeiro ao alcançar o total de unidades');
  });

  it('TR-005: deve manter isUpToDate = true para obra em andamento (8/8) sem exigir status CONCLUIDO', async () => {
    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    // Registra obra em andamento com progresso = 8
    const item = await controller.addItem(req, {
      mediaItemId: '22222222-2222-4000-8000-000000000002',
      status: 'ASSISTINDO',
      progress: 8,
    });

    assert.equal(item.status, 'ASSISTINDO', 'Status pessoal deve permanecer ASSISTINDO');
    assert.equal(item.progress, 8);
    assert.equal(item.isUpToDate, true, 'Obra em andamento com progresso no limite disponível deve estar Em Dia');
  });

  it('TR-005 (Filme): deve calcular isUpToDate = true para filmes com status ASSISTIDO e progresso 0', async () => {
    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    const item = await controller.addItem(req, {
      mediaItemId: '33333333-3333-4000-8000-000000000003',
      status: 'ASSISTIDO',
    });

    assert.equal(item.status, 'ASSISTIDO');
    assert.equal(item.progress, 0, 'Filmes não possuem episódios contínuos');
    assert.equal(item.isUpToDate, true, 'Filme com status ASSISTIDO é considerado Em dia');
  });

  it('TR-006: deve rejeitar progresso negativo (<0) ou excedente ao total conhecido (>24)', async () => {
    const req = {
      cookies: { [AUTH_COOKIE_NAME]: userCookie },
    };

    // Progresso negativo
    await assert.rejects(
      async () => {
        await controller.addItem(req, {
          mediaItemId: '11111111-1111-4000-8000-000000000001',
          status: 'ASSISTINDO',
          progress: -1,
        });
      },
      (err) => {
        assert.ok(err instanceof InvalidProgressError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );

    // Progresso excedente (obra tem 12 episódios, tenta registrar 24)
    await assert.rejects(
      async () => {
        await controller.addItem(req, {
          mediaItemId: '11111111-1111-4000-8000-000000000001',
          status: 'ASSISTINDO',
          progress: 24,
        });
      },
      (err) => {
        assert.ok(err instanceof InvalidProgressError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /superior ao total/i);
        return true;
      }
    );
  });
});

describe('US3 — Listagem Paginada, Filtros e Isolamento Multiusuário (TR-007, TR-008, TR-009)', () => {
  let authModule;
  let libraryModule;
  let controller;
  let userA;
  let cookieA;
  let userB;
  let cookieB;
  let doramaItem;
  let animeItem;
  let mangaItem;

  beforeEach(async () => {
    authModule = new AuthModule();
    libraryModule = new LibraryModule(undefined, undefined, authModule.authGuard);
    controller = libraryModule.libraryController;

    // Helper para registrar usuário
    async function registerUser(email, username) {
      const headersMap = {};
      const mockRes = {
        setHeader(name, value) {
          headersMap[name] = value;
        },
      };
      const reg = await authModule.authController.register(
        { email, username, password: 'password123' },
        mockRes
      );
      const cookieHeader = headersMap['Set-Cookie'];
      const tokenMatch = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
      return { user: reg.user, cookie: tokenMatch ? tokenMatch[1] : '' };
    }

    const resA = await registerUser(`usera_${Date.now()}@yuukilist.test`, `usera_${Date.now()}`);
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await registerUser(`userb_${Date.now()}@yuukilist.test`, `userb_${Date.now()}`);
    userB = resB.user;
    cookieB = resB.cookie;

    // Obter obras do catálogo para teste
    const doramaRes = await libraryModule.catalogRepository.findMany({ category: 'DORAMA', limit: 1 });
    doramaItem = doramaRes.data[0];

    const animeRes = await libraryModule.catalogRepository.findMany({ category: 'ANIME', limit: 1 });
    animeItem = animeRes.data[0];

    const mangaRes = await libraryModule.catalogRepository.findMany({ category: 'MANGA', limit: 1 });
    mangaItem = mangaRes.data[0];
  });

  it('TR-007: deve listar biblioteca com filtros por status e categoria com suporte a paginação', async () => {
    const reqA = { cookies: { [AUTH_COOKIE_NAME]: cookieA } };

    // Usuário A adiciona 3 obras
    await controller.addItem(reqA, {
      mediaItemId: doramaItem.id,
      status: 'ASSISTINDO',
      progress: 2,
    });
    await controller.addItem(reqA, {
      mediaItemId: animeItem.id,
      status: 'QUERO_ASSISTIR',
    });
    await controller.addItem(reqA, {
      mediaItemId: mangaItem.id,
      status: 'LENDO',
      progress: 10,
    });

    // 1. Consulta geral sem filtros
    const listAll = await controller.list(reqA, {});
    assert.equal(listAll.meta.total, 3);
    assert.equal(listAll.data.length, 3);

    // 2. Consulta filtrando por categoria DORAMA
    const listDorama = await controller.list(reqA, { category: 'DORAMA' });
    assert.equal(listDorama.meta.total, 1);
    assert.equal(listDorama.data[0].mediaItem.category, 'DORAMA');

    // 3. Consulta filtrando por status LENDO e categoria MANGA
    const listManga = await controller.list(reqA, { status: 'LENDO', category: 'MANGA' });
    assert.equal(listManga.meta.total, 1);
    assert.equal(listManga.data[0].mediaItem.category, 'MANGA');
    assert.equal(listManga.data[0].status, 'LENDO');

    // 4. Paginação (limit 2, page 1)
    const page1 = await controller.list(reqA, { limit: 2, page: 1 });
    assert.equal(page1.data.length, 2);
    assert.equal(page1.meta.totalPages, 2);
  });

  it('TR-008: deve garantir isolamento estrito entre usuários impedindo acesso ou mutação de bibliotecas alheias', async () => {
    const reqA = { cookies: { [AUTH_COOKIE_NAME]: cookieA } };
    const reqB = { cookies: { [AUTH_COOKIE_NAME]: cookieB } };

    // Usuário A adiciona Dorama
    await controller.addItem(reqA, {
      mediaItemId: doramaItem.id,
      status: 'ASSISTINDO',
      progress: 4,
    });

    // Usuário B lista sua biblioteca: deve estar vazia
    const listB = await controller.list(reqB, {});
    assert.equal(listB.meta.total, 0);
    assert.equal(listB.data.length, 0);

    // Usuário B tenta consultar o item do Usuário A: deve retornar 404
    await assert.rejects(
      async () => {
        await controller.getItem(reqB, doramaItem.id);
      },
      (err) => {
        assert.ok(err instanceof LibraryItemNotFoundError);
        assert.equal(err.statusCode, 404);
        return true;
      }
    );

    // Usuário B tenta atualizar item do Usuário A: deve retornar 404
    await assert.rejects(
      async () => {
        await controller.updateItem(reqB, doramaItem.id, { status: 'DROPADO' });
      },
      (err) => {
        assert.ok(err instanceof LibraryItemNotFoundError);
        assert.equal(err.statusCode, 404);
        return true;
      }
    );

    // Usuário B tenta deletar item do Usuário A: deve retornar 404
    await assert.rejects(
      async () => {
        await controller.removeItem(reqB, doramaItem.id);
      },
      (err) => {
        assert.ok(err instanceof LibraryItemNotFoundError);
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });

  it('TR-009: deve bloquear acesso anônimo aos endpoints de biblioteca com 401 Unauthorized', async () => {
    const anonReq = { cookies: {} };

    await assert.rejects(
      async () => {
        await controller.list(anonReq, {});
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await controller.addItem(anonReq, {
          mediaItemId: doramaItem.id,
          status: 'ASSISTINDO',
        });
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await controller.getItem(anonReq, doramaItem.id);
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });
});
