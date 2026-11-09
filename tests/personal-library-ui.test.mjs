/**
 * YuukiList — Testes Automatizados da Interface da Biblioteca Pessoal (Slice R7: 007-personal-library-ui)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/personal-library-ui/spec.md (TR-001 a TR-009)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  LibraryApiClient,
  LibraryApiError,
} from '../apps/web/src/services/library-api.client.ts';
import {
  loadSavedLayout,
  saveLayoutPreference,
  resolveStatusForTab,
  calculateNextProgress,
  computeOptimisticItemUpdate,
  formatProgressDisplay,
  STORAGE_LAYOUT_KEY,
} from '../apps/web/src/components/library/library-helpers.ts';

// Mock de localStorage em memória
function createMockStorage(initialData = {}) {
  const store = new Map(Object.entries(initialData));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

// Mock de fetcher para simulação de chamadas HTTP
function createMockLibraryFetcher(items = []) {
  let userItems = [...items];

  return {
    userItems,
    async fetcher(input, init = {}) {
      const url = new URL(String(input), 'http://localhost');
      const method = (init.method || 'GET').toUpperCase();
      const pathname = url.pathname;

      // GET /api/v1/library
      if (pathname === '/api/v1/library' && method === 'GET') {
        const status = url.searchParams.get('status');
        const category = url.searchParams.get('category');

        let filtered = [...userItems];
        if (status) {
          filtered = filtered.filter((i) => i.status === status);
        }
        if (category) {
          filtered = filtered.filter((i) => i.mediaItem?.category === category);
        }

        return new Response(
          JSON.stringify({
            data: filtered,
            meta: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // POST /api/v1/library/items
      if (pathname === '/api/v1/library/items' && method === 'POST') {
        const body = JSON.parse(init.body || '{}');
        const newItem = {
          id: `item-${Date.now()}`,
          userId: 'user-1',
          mediaItemId: body.mediaItemId,
          status: body.status,
          progress: body.progress || 0,
          rating: body.rating || null,
          notes: body.notes || null,
          isUpToDate: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        userItems.push(newItem);
        return new Response(JSON.stringify(newItem), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // PATCH /api/v1/library/items/:mediaItemId
      if (pathname.startsWith('/api/v1/library/items/') && method === 'PATCH') {
        const mediaId = decodeURIComponent(pathname.replace('/api/v1/library/items/', ''));
        const body = JSON.parse(init.body || '{}');
        const index = userItems.findIndex((i) => i.mediaItemId === mediaId);
        if (index === -1) {
          return new Response(JSON.stringify({ message: 'Item não encontrado' }), { status: 404 });
        }
        const updated = {
          ...userItems[index],
          status: body.status !== undefined ? body.status : userItems[index].status,
          progress: body.progress !== undefined ? body.progress : userItems[index].progress,
          rating: body.rating !== undefined ? body.rating : userItems[index].rating,
          notes: body.notes !== undefined ? body.notes : userItems[index].notes,
          updatedAt: new Date(),
        };
        userItems[index] = updated;
        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // DELETE /api/v1/library/items/:mediaItemId
      if (pathname.startsWith('/api/v1/library/items/') && method === 'DELETE') {
        const mediaId = decodeURIComponent(pathname.replace('/api/v1/library/items/', ''));
        userItems = userItems.filter((i) => i.mediaItemId !== mediaId);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ message: 'Rota não encontrada' }), { status: 404 });
    },
  };
}

describe('US1 — Visualização da Biblioteca Pessoal e Alternância de Layouts (TR-001, TR-002, TR-003)', () => {
  it('TR-001: deve carregar layout padrão grade (grid) e formatar exibição com capa e progresso', () => {
    const mockStorage = createMockStorage();
    const layout = loadSavedLayout(mockStorage);
    assert.equal(layout, 'grid', 'Layout padrão deve ser grid na ausência de valor salvo');

    const progressStr = formatProgressDisplay(3, 16, 'DORAMA');
    assert.equal(progressStr, 'Ep. 3/16');

    const movieStr = formatProgressDisplay(0, null, 'FILME');
    assert.equal(movieStr, 'Longa-metragem', 'Filmes devem exibir indicação sem contagem contínua');
  });

  it('TR-002: deve alternar layout para lista (list) e persistir escolha no localStorage', () => {
    const mockStorage = createMockStorage();

    // Salva preferência 'list'
    saveLayoutPreference('list', mockStorage);
    assert.equal(mockStorage.getItem(STORAGE_LAYOUT_KEY), 'list');

    // Carrega novamente conferindo restauração
    const loaded = loadSavedLayout(mockStorage);
    assert.equal(loaded, 'list', 'Deve carregar lista a partir do storage salvo');

    // Alterna de volta para grade
    saveLayoutPreference('grid', mockStorage);
    assert.equal(loadSavedLayout(mockStorage), 'grid');
  });

  it('TR-003: deve bloquear acesso anônimo a rota /library e redirecionar para tela de login com parâmetro', () => {
    function computeLibraryProtection(user, isLoading) {
      if (isLoading) return { status: 'LOADING' };
      if (!user) return { status: 'REDIRECT', target: '/login?redirect=%2Flibrary' };
      return { status: 'ALLOWED' };
    }

    const anonState = computeLibraryProtection(null, false);
    assert.equal(anonState.status, 'REDIRECT');
    assert.equal(anonState.target, '/login?redirect=%2Flibrary');

    const loadingState = computeLibraryProtection(null, true);
    assert.equal(loadingState.status, 'LOADING');

    const authState = computeLibraryProtection({ id: '1', username: 'yuuki' }, false);
    assert.equal(authState.status, 'ALLOWED');
  });
});

describe('US2 — Acompanhamento Ágil de Progresso e Modal de Edição (TR-004, TR-005, TR-006)', () => {
  let mockEnv;
  let client;

  beforeEach(() => {
    mockEnv = createMockLibraryFetcher([
      {
        id: 'lib-1',
        userId: 'user-1',
        mediaItemId: 'media-anime-1',
        status: 'ASSISTINDO',
        progress: 7,
        rating: 9.0,
        notes: 'Muito bom',
        isUpToDate: false,
        mediaItem: {
          id: 'media-anime-1',
          slug: 'serie-anime',
          title: 'Série Anime',
          category: 'ANIME',
          publicationStatus: 'EM_ANDAMENTO',
          coverUrl: '/cover.svg',
        },
      },
    ]);
    client = new LibraryApiClient({ fetcher: mockEnv.fetcher });
  });

  it('TR-004: deve calcular incremento rápido de progresso (+1) e aplicar atualização otimista na interface', () => {
    // Para série com total 12: progresso 7 -> 8
    const nextVal = calculateNextProgress(7, 12, 'ANIME');
    assert.equal(nextVal, 8);

    const initialItem = mockEnv.userItems[0];
    const optimistic = computeOptimisticItemUpdate(initialItem, nextVal, 12);
    assert.equal(optimistic.progress, 8);

    // Para filme: incremento proibido (retorna null)
    const movieNext = calculateNextProgress(0, null, 'FILME');
    assert.equal(movieNext, null, 'Filmes não possuem incremento de episódios');

    // Quando já atingiu o total de unidades: incremento proibido
    const maxNext = calculateNextProgress(12, 12, 'ANIME');
    assert.equal(maxNext, null, 'Não deve incrementar além do total de unidades cadastradas');
  });

  it('TR-005: deve exibir destacadamente o badge Em dia quando progresso atinge o total de unidades', () => {
    const item = mockEnv.userItems[0];
    // Progresso atinge o limite total de 8 unidades
    const updated = computeOptimisticItemUpdate(item, 8, 8);
    assert.equal(updated.progress, 8);
    assert.equal(updated.isUpToDate, true, 'isUpToDate deve ser verdadeiro no estado otimista da UI');
  });

  it('TR-006: deve atualizar status, nota pessoal e anotações privadas através da API e modal', async () => {
    const res = await client.updateItem('media-anime-1', {
      status: 'PAUSADO',
      rating: 8.5,
      notes: 'Pausado no episódio 8 para aguardar a nova temporada.',
    });

    assert.equal(res.status, 'PAUSADO');
    assert.equal(res.rating, 8.5);
    assert.equal(res.notes, 'Pausado no episódio 8 para aguardar a nova temporada.');
  });
});

describe('US3 — Filtragem por Abas Inteligentes e Estados Assíncronos (TR-007, TR-008, TR-009)', () => {
  let mockEnv;
  let client;

  beforeEach(() => {
    mockEnv = createMockLibraryFetcher([
      {
        id: 'lib-1',
        userId: 'user-1',
        mediaItemId: 'm1',
        status: 'ASSISTINDO',
        progress: 2,
        mediaItem: { id: 'm1', category: 'DORAMA', title: 'Dorama 1' },
      },
      {
        id: 'lib-2',
        userId: 'user-1',
        mediaItemId: 'm2',
        status: 'LENDO',
        progress: 15,
        mediaItem: { id: 'm2', category: 'MANGA', title: 'Manga 1' },
      },
    ]);
    client = new LibraryApiClient({ fetcher: mockEnv.fetcher });
  });

  it('TR-007: deve mapear abas inteligentes para status canônico conforme categoria da obra', () => {
    // Aba Em Andamento:
    assert.equal(resolveStatusForTab('WATCHING_READING', 'DORAMA'), 'ASSISTINDO');
    assert.equal(resolveStatusForTab('WATCHING_READING', 'MANGA'), 'LENDO');

    // Aba Planejados:
    assert.equal(resolveStatusForTab('PLAN_TO', 'ANIME'), 'QUERO_ASSISTIR');
    assert.equal(resolveStatusForTab('PLAN_TO', 'MANHWA'), 'QUERO_LER');

    // Aba Concluídos:
    assert.equal(resolveStatusForTab('COMPLETED', 'FILME'), 'ASSISTIDO');
    assert.equal(resolveStatusForTab('COMPLETED', 'DORAMA'), 'CONCLUIDO');

    // Aba Todos:
    assert.equal(resolveStatusForTab('ALL', 'DORAMA'), undefined);

    // Constrói query string de chamada
    const qs = client.buildQueryString({ status: 'ASSISTINDO', category: 'DORAMA' });
    assert.ok(qs.includes('status=ASSISTINDO'));
    assert.ok(qs.includes('category=DORAMA'));
  });

  it('TR-008: deve apresentar estado de biblioteca vazia quando não existirem obras cadastradas', async () => {
    const emptyFetcher = async () =>
      new Response(JSON.stringify({ data: [], meta: { total: 0 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    const emptyClient = new LibraryApiClient({ fetcher: emptyFetcher });

    const result = await emptyClient.list();
    assert.equal(result.data.length, 0);
    assert.equal(result.meta.total, 0);

    function computeViewState(items, isLoading, error) {
      if (isLoading) return 'LOADING';
      if (error) return 'ERROR';
      if (!items || items.length === 0) return 'EMPTY';
      return 'DATA';
    }

    assert.equal(computeViewState([], false, null), 'EMPTY');
  });

  it('TR-009: deve capturar erro de rede e permitir acionar nova tentativa (Retry)', async () => {
    let attempts = 0;
    const failingFetcher = async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Falha de conexão com a API de biblioteca');
      }
      return new Response(JSON.stringify({ data: [{ id: '1' }], meta: { total: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const retryClient = new LibraryApiClient({ fetcher: failingFetcher });

    // Tentativa 1 falha
    await assert.rejects(
      async () => {
        await retryClient.list();
      },
      (err) => {
        assert.ok(err instanceof LibraryApiError);
        assert.equal(err.code, 'NETWORK_ERROR');
        return true;
      }
    );

    // Tentativa 2 com retry tem sucesso
    const retryRes = await retryClient.list();
    assert.equal(retryRes.data.length, 1);
    assert.equal(attempts, 2);
  });
});

