/**
 * YuukiList — Testes de Performance, Carrossel da Home, Avatar na Navbar, Diário e Calendário Real
 * Change 037: 037-performance-home-calendar-and-ui-fixes
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  AuthModule,
  AuthGuard,
  UsersRepository,
  CatalogModule,
  CatalogRepository,
  PrismaCatalogRepository,
  CatalogService,
  CatalogController,
  CatalogFederatedSearchService,
  CatalogIngestionService,
  LibraryRepository,
  LibraryService,
  DiaryService,
  DiaryRepository,
  CalendarRepository,
  NotificationRepository,
  CalendarService,
  ProfileRepository,
  ProfileService,
  CATEGORIES,
  Category,
  PublicationStatus,
  CalendarEventType,
  CalendarViewMode,
  AUTH_COOKIE_NAME,
} from '../apps/api/src/index.ts';
import { DiaryApiClient } from '../apps/web/src/services/diary-api.client.ts';
import { CatalogApiClient } from '../apps/web/src/services/catalog-api.client.ts';

describe('Fase 1 — Contratos de Auth (avatarUrl/avatarFrame + Cache TTL) e Batch no Catálogo', () => {
  describe('AuthService e AuthGuard — avatarUrl, avatarFrame e Cache TTL de Sessão', () => {
    let authModule;
    let usersRepository;
    let authService;
    let authGuard;
    let tokenService;

    beforeEach(() => {
      authModule = new AuthModule();
      usersRepository = authModule.usersRepository;
      authService = authModule.authService;
      authGuard = authModule.authGuard;
      tokenService = authModule.tokenService;
    });

    it('deve incluir avatarUrl e avatarFrame nas respostas de register, login, getSession e AuthGuard.canActivate', async () => {
      const reg = await authService.register({
        email: 'avatar@yuukilist.test',
        username: 'avatar_user',
        password: 'strongPassword123',
      });

      assert.equal(reg.user.avatarUrl, null);
      assert.equal(reg.user.avatarFrame, 'none');

      await usersRepository.updateProfile(reg.user.id, {
        avatarUrl: 'https://cdn.yuukilist.test/avatars/u1.png',
        avatarFrame: 'sakura',
      });

      const logged = await authService.login({
        identifier: 'avatar@yuukilist.test',
        password: 'strongPassword123',
      });
      assert.equal(logged.user.avatarUrl, 'https://cdn.yuukilist.test/avatars/u1.png');
      assert.equal(logged.user.avatarFrame, 'sakura');

      const sessionUser = await authService.getMe(reg.user.id);
      assert.equal(sessionUser.avatarUrl, 'https://cdn.yuukilist.test/avatars/u1.png');
      assert.equal(sessionUser.avatarFrame, 'sakura');

      const guardUser = await authGuard.validateRequest({
        cookies: { [AUTH_COOKIE_NAME]: logged.token },
      });
      assert.equal(guardUser.avatarUrl, 'https://cdn.yuukilist.test/avatars/u1.png');
      assert.equal(guardUser.avatarFrame, 'sakura');
    });

    it('deve cachear resolução de sessão no AuthGuard por TTL e invalidar explicitamente via invalidateUserCache', async () => {
      const reg = await authService.register({
        email: 'cache@yuukilist.test',
        username: 'cache_user',
        password: 'strongPassword123',
      });

      let findByIdCalls = 0;
      const originalFindById = usersRepository.findById.bind(usersRepository);
      usersRepository.findById = async (id) => {
        findByIdCalls += 1;
        return originalFindById(id);
      };

      const token = reg.token;

      const req = { cookies: { [AUTH_COOKIE_NAME]: token } };

      const first = await authGuard.validateRequest(req);
      const second = await authGuard.validateRequest(req);
      assert.equal(findByIdCalls, 1, 'Segunda chamada dentro do TTL deve reutilizar cache em memória');
      assert.equal(second.id, first.id);
      assert.equal(second.avatarUrl, null);

      await usersRepository.updateProfile(reg.user.id, {
        avatarUrl: 'https://cdn.yuukilist.test/avatars/updated.png',
        avatarFrame: 'cyber',
      });

      findByIdCalls = 0;

      // Antes de invalidar cache, ainda retorna dado em cache sem nova ida ao repositório
      const stillCached = await authGuard.validateRequest(req);
      assert.equal(findByIdCalls, 0);
      assert.equal(stillCached.avatarUrl, null);

      assert.equal(
        typeof authGuard.invalidateUserCache,
        'function',
        'AuthGuard deve expor invalidateUserCache(userId)'
      );
      authGuard.invalidateUserCache(reg.user.id);

      const third = await authGuard.validateRequest(req);
      assert.equal(findByIdCalls, 1, 'Após invalidateUserCache, AuthGuard deve recarregar usuário do repositório');
      assert.equal(third.avatarUrl, 'https://cdn.yuukilist.test/avatars/updated.png');
      assert.equal(third.avatarFrame, 'cyber');
    });
  });

  describe('CatalogRepository — findByIds, findFeaturedPerCategory e findOngoingWorks', () => {
    let repo;

    beforeEach(async () => {
      repo = new CatalogRepository([]);
      const categories = CATEGORIES;
      for (let i = 0; i < categories.length; i += 1) {
        const cat = categories[i];
        await repo.upsertMediaItem({
          id: `item-${cat.toLowerCase()}-low`,
          slug: `item-${cat.toLowerCase()}-low`,
          title: `${cat} Obra Menor`,
          category: cat,
          publicationStatus: PublicationStatus.FINALIZADA,
          coverPath: `https://covers.yuukilist.test/${cat.toLowerCase()}-low.jpg`,
          releaseYear: 2020,
          genres: ['Ação'],
          aliases: [],
          synopsis: 'Obra com nota menor',
          totalEpisodes: cat === Category.ANIME || cat === Category.DORAMA || cat === Category.FILME ? 12 : null,
          totalChapters: cat === Category.MANGA || cat === Category.MANHWA || cat === Category.MANHUA ? 50 : null,
          rating: 7.2,
        });

        await repo.upsertMediaItem({
          id: `item-${cat.toLowerCase()}-top`,
          slug: `item-${cat.toLowerCase()}-top`,
          title: `${cat} Obra Destaque`,
          category: cat,
          publicationStatus: i % 2 === 0 ? PublicationStatus.EM_ANDAMENTO : PublicationStatus.FINALIZADA,
          coverPath: `https://covers.yuukilist.test/${cat.toLowerCase()}-top.jpg`,
          releaseYear: 2025,
          genres: ['Fantasia'],
          aliases: [],
          synopsis: 'Obra destaque da categoria',
          totalEpisodes: cat === Category.ANIME || cat === Category.DORAMA || cat === Category.FILME ? 24 : null,
          totalChapters: cat === Category.MANGA || cat === Category.MANHWA || cat === Category.MANHUA ? 120 : null,
          rating: 9.5,
        });
      }
    });

    it('findByIds deve retornar detalhes em lote apenas para os IDs solicitados e [] para lista vazia', async () => {
      assert.equal(typeof repo.findByIds, 'function');
      assert.deepEqual(await repo.findByIds([]), []);

      const found = await repo.findByIds([
        'item-anime-top',
        'item-manga-top',
        'item-inexistente',
        'item-anime-top',
      ]);

      assert.equal(found.length, 2);
      const slugs = found.map((m) => m.slug).sort();
      assert.deepEqual(slugs, ['item-anime-top', 'item-manga-top']);
      const anime = found.find((m) => m.slug === 'item-anime-top');
      assert.equal(anime.totalEpisodes, 24);
    });

    it('findFeaturedPerCategory deve retornar 1 obra mais bem avaliada de cada categoria canônica', async () => {
      assert.equal(typeof repo.findFeaturedPerCategory, 'function');
      const featured = await repo.findFeaturedPerCategory();

      assert.equal(featured.length, CATEGORIES.length);
      for (const cat of CATEGORIES) {
        const match = featured.find((item) => item.category === cat);
        assert.ok(match, `Deve conter destaque para ${cat}`);
        assert.equal(match.slug, `item-${cat.toLowerCase()}-top`);
      }
    });

    it('findOngoingWorks deve retornar apenas obras EM_ANDAMENTO respeitando o limite informado', async () => {
      assert.equal(typeof repo.findOngoingWorks, 'function');
      const allOngoing = await repo.findOngoingWorks(10);
      assert.equal(allOngoing.length, 3);
      assert.ok(allOngoing.every((m) => m.publicationStatus === PublicationStatus.EM_ANDAMENTO));

      const limited = await repo.findOngoingWorks(2);
      assert.equal(limited.length, 2);
    });

    it('PrismaCatalogRepository deve executar consultas em lote únicas quando prisma está conectado', async () => {
      const queries = [];
      const mockPrisma = {
        mediaItem: {
          async findMany(args) {
            queries.push(args);
            if (args.distinct) {
              return [
                {
                  id: 'u-anime',
                  slug: 'frieren',
                  title: 'Frieren',
                  originalTitle: null,
                  category: 'ANIME',
                  publicationStatus: 'EM_ANDAMENTO',
                  releaseYear: 2023,
                  coverPath: 'https://covers.test/frieren.jpg',
                  genres: [{ name: 'Fantasia' }],
                },
              ];
            }
            return [
              {
                id: '11111111-1111-4111-8111-111111111111',
                slug: 'solo-leveling',
                title: 'Solo Leveling',
                originalTitle: null,
                category: 'MANHWA',
                publicationStatus: 'EM_ANDAMENTO',
                releaseYear: 2024,
                coverPath: 'https://covers.test/sl.jpg',
                totalEpisodes: null,
                totalChapters: 200,
                totalVolumes: null,
                synopsis: 'Caçador',
                genres: [{ name: 'Ação' }],
                aliases: [{ alias: 'SL' }],
                provenance: null,
              },
            ];
          },
        },
      };

      const prismaRepo = new PrismaCatalogRepository(mockPrisma);
      const batch = await prismaRepo.findByIds(['11111111-1111-4111-8111-111111111111']);
      assert.equal(batch.length, 1);
      assert.equal(batch[0].slug, 'solo-leveling');
      assert.equal(queries.length, 1);
      assert.ok(queries[0].where.OR, 'findByIds deve emitir única query findMany com operador OR/IN');

      const featured = await prismaRepo.findFeaturedPerCategory();
      assert.equal(featured.length, 1);
      assert.equal(featured[0].slug, 'frieren');
      assert.deepEqual(queries[1].distinct, ['category']);

      const ongoing = await prismaRepo.findOngoingWorks(15);
      assert.equal(ongoing.length, 1);
      assert.equal(queries[2].where.publicationStatus, 'EM_ANDAMENTO');
      assert.equal(queries[2].take, 15);
    });
  });
});

describe('Fase 2 — Eliminação de N+1 (Library/Profile), Busca Local-First e Cache TTL do Catálogo', () => {
  it('TR-014 & TR-036: LibraryService.listUserLibrary e ProfileService.getStats não devem executar loop N+1 de findById/findBySlug', async () => {
    const usersRepo = new UsersRepository();
    const user = await usersRepo.create({
      email: 'batch@yuukilist.test',
      username: 'batch_user',
      passwordHash: 'hash123',
    });

    const catalogRepo = new CatalogRepository([]);
    const mediaIds = [];
    for (let i = 0; i < 5; i += 1) {
      const id = `media-${i + 1}`;
      mediaIds.push(id);
      await catalogRepo.upsertMediaItem({
        id,
        slug: `obra-${i + 1}`,
        title: `Obra Teste ${i + 1}`,
        normalizedTitle: `obra teste ${i + 1}`,
        category: i % 2 === 0 ? Category.ANIME : Category.MANGA,
        publicationStatus: PublicationStatus.EM_ANDAMENTO,
        coverPath: `https://covers.test/obra-${i + 1}.jpg`,
        releaseYear: 2024,
        genres: ['Ação'],
        aliases: [],
        totalEpisodes: i % 2 === 0 ? 12 : null,
        totalChapters: i % 2 === 0 ? null : 100,
      });
    }

    const libraryRepo = new LibraryRepository();
    for (let i = 0; i < mediaIds.length; i += 1) {
      await libraryRepo.upsert(user.id, {
        mediaItemId: mediaIds[i],
        status: i % 2 === 0 ? 'CONCLUIDO' : 'LENDO',
        progress: i + 1,
        rating: 9,
        isFavorite: i === 0,
      });
    }

    let findByIdCalls = 0;
    let findBySlugCalls = 0;
    let findByIdsCalls = 0;

    const origFindById = catalogRepo.findById.bind(catalogRepo);
    const origFindBySlug = catalogRepo.findBySlug.bind(catalogRepo);
    const origFindByIds = catalogRepo.findByIds.bind(catalogRepo);

    catalogRepo.findById = async (id) => {
      findByIdCalls += 1;
      return origFindById(id);
    };
    catalogRepo.findBySlug = async (slug) => {
      findBySlugCalls += 1;
      return origFindBySlug(slug);
    };
    catalogRepo.findByIds = async (ids) => {
      findByIdsCalls += 1;
      return origFindByIds(ids);
    };

    const libraryService = new LibraryService(libraryRepo, catalogRepo);
    const libPage = await libraryService.listUserLibrary(user.id, { page: 1, limit: 20 });
    assert.equal(libPage.data.length, 5);
    assert.equal(findByIdCalls, 0, 'LibraryService.listUserLibrary não deve chamar findById em loop');
    assert.equal(findBySlugCalls, 0, 'LibraryService.listUserLibrary não deve chamar findBySlug em loop');
    assert.equal(findByIdsCalls, 1, 'LibraryService.listUserLibrary deve usar findByIds em lote único');

    findByIdCalls = 0;
    findBySlugCalls = 0;
    findByIdsCalls = 0;

    const profileRepo = new ProfileRepository();
    let invalidatedUserId = null;
    const profileService = new ProfileService(
      profileRepo,
      libraryRepo,
      catalogRepo,
      usersRepo,
      undefined,
      (uid) => {
        invalidatedUserId = uid;
      }
    );

    const stats = await profileService.getStats(user.id);
    assert.equal(stats.totalCompleted, 3);
    assert.equal(stats.favorites.length, 1);
    assert.equal(findByIdCalls, 0, 'ProfileService.getStats não deve chamar findById em loop');
    assert.equal(findBySlugCalls, 0, 'ProfileService.getStats não deve chamar findBySlug em loop');
    assert.equal(findByIdsCalls, 1, 'ProfileService.getStats deve usar findByIds em lote único');

    await profileService.updateProfile(user.id, { avatarUrl: 'https://cdn.test/new.png' });
    assert.equal(invalidatedUserId, user.id, 'updateProfile deve invalidar cache de autenticação do usuário');
  });

  it('TR-003: CatalogFederatedSearchService deve adotar busca local-first (externas apenas se <3 locais ou includeExternal=true)', async () => {
    const repo = new CatalogRepository([]);
    for (let i = 1; i <= 4; i += 1) {
      await repo.upsertMediaItem({
        id: `dragon-${i}`,
        slug: `dragon-${i}`,
        title: `Dragon Saga ${i}`,
        normalizedTitle: `dragon saga ${i}`,
        category: Category.ANIME,
        publicationStatus: PublicationStatus.EM_ANDAMENTO,
        coverPath: `https://covers.test/dragon-${i}.jpg`,
        releaseYear: 2020 + i,
        genres: ['Ação'],
        aliases: [],
      });
    }

    let externalCalls = 0;
    const stubClient = {
      async search({ title }) {
        externalCalls += 1;
        return [
          {
            source: 'KITSU',
            externalId: `ext-${title}`,
            title: `${title} External Edition`,
            category: Category.ANIME,
            publicationStatus: PublicationStatus.EM_ANDAMENTO,
            genres: ['Ação'],
            aliases: [],
          },
        ];
      },
    };

    const federated = new CatalogFederatedSearchService(repo, {
      tmdb: stubClient,
      tvmaze: stubClient,
      kitsu: stubClient,
      mangaUpdates: stubClient,
    });

    // >= 3 resultados locais e sem includeExternal=true -> ZERO chamadas externas
    const localFirst = await federated.searchFederated({ q: 'Dragon Saga' });
    assert.ok(localFirst.data.length >= 3);
    assert.equal(externalCalls, 0, 'Não deve chamar APIs externas quando catálogo local já retorna >= 3 obras');

    // includeExternal=true -> força busca externa mesmo com >= 3 locais
    const expanded = await federated.searchFederated({ q: 'Dragon Saga', includeExternal: true });
    assert.ok(externalCalls > 0, 'Deve chamar APIs externas quando includeExternal=true');
    assert.ok((expanded.externalResults || []).length > 0);

    // < 3 resultados locais -> fallback automático para externas
    externalCalls = 0;
    const sparse = await federated.searchFederated({ q: 'Obra Super Rara Inexistente' });
    assert.equal(sparse.data.length, 0);
    assert.ok(externalCalls > 0, 'Deve acionar fallback externo automático quando resultados locais < 3');
  });

  it('TR-004 & TR-005: CatalogService deve cachear listagens/destaques por TTL 60s e invalidar após upsertMediaItem', async () => {
    const repo = new CatalogRepository([]);
    await repo.upsertMediaItem({
      id: 'cache-item-1',
      slug: 'frieren-cache',
      title: 'Frieren',
      normalizedTitle: 'frieren',
      category: Category.ANIME,
      publicationStatus: PublicationStatus.EM_ANDAMENTO,
      coverPath: 'https://covers.test/frieren.jpg',
      releaseYear: 2023,
      genres: ['Fantasia'],
      aliases: [],
      rating: 9.8,
    });

    let findManyCalls = 0;
    let featuredCalls = 0;
    const origFindMany = repo.findMany.bind(repo);
    const origFeatured = repo.findFeaturedPerCategory.bind(repo);

    repo.findMany = async (q) => {
      findManyCalls += 1;
      return origFindMany(q);
    };
    repo.findFeaturedPerCategory = async () => {
      featuredCalls += 1;
      return origFeatured();
    };

    const service = new CatalogService(repo);
    const controller = new CatalogController(service);

    await service.listItems({ category: Category.ANIME, page: 1, limit: 20 });
    await service.listItems({ category: Category.ANIME, page: 1, limit: 20 });
    assert.equal(findManyCalls, 1, 'Consultas idênticas dentro do TTL de 60s devem retornar do cache');

    const feat1 = await controller.getFeaturedByCategory();
    const feat2 = await controller.getFeaturedByCategory();
    assert.equal(featuredCalls, 1, 'Destaques por categoria também devem ser cacheados');
    assert.equal(feat1.items.length, 1);
    assert.equal(feat2.items[0].slug, 'frieren-cache');

    // Mutação via upsertMediaItem deve invalidar caches
    await repo.upsertMediaItem({
      id: 'cache-item-2',
      slug: 'solo-leveling-cache',
      title: 'Solo Leveling',
      normalizedTitle: 'solo leveling',
      category: Category.MANHWA,
      publicationStatus: PublicationStatus.FINALIZADA,
      coverPath: 'https://covers.test/sl.jpg',
      releaseYear: 2024,
      genres: ['Ação'],
      aliases: [],
      rating: 9.7,
    });

    await service.listItems({ category: Category.ANIME, page: 1, limit: 20 });
    const feat3 = await controller.getFeaturedByCategory();
    assert.equal(findManyCalls, 2, 'upsertMediaItem deve invalidar cache de listItems');
    assert.equal(featuredCalls, 2, 'upsertMediaItem deve invalidar cache de destaques por categoria');
    assert.equal(feat3.items.length, 2);
  });
});

describe('Fase 3 — Diário (/api/v1/diary), Temporada em Lote e Calendário Real', () => {
  it('TR-016 & TR-017: DiaryApiClient e rotas /api/v1/diary devem estar alinhados com DiaryController', async () => {
    const requests = [];
    const mockFetcher = async (url, init = {}) => {
      requests.push({ url, method: init.method || 'GET', body: init.body });
      return new Response(
        JSON.stringify(init.method === 'DELETE' ? { success: true } : init.method ? { id: 'evt-1' } : []),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new DiaryApiClient({ fetcher: mockFetcher });
    await client.list({ mediaItemId: 'm1' });
    await client.createEvent({ mediaItemId: 'm1', type: 'NOTE', note: 'Teste' });
    await client.updateEvent('evt-1', { note: 'Editado' });
    await client.deleteEvent('evt-1');

    assert.ok(requests[0].url.startsWith('/api/v1/diary'), 'GET deve chamar /api/v1/diary');
    assert.equal(requests[0].url.includes('/diary/events'), false);
    assert.equal(requests[1].url, '/api/v1/diary');
    assert.equal(requests[2].url, '/api/v1/diary/evt-1');
    assert.equal(requests[2].method, 'PATCH');
    assert.equal(requests[3].url, '/api/v1/diary/evt-1');
    assert.equal(requests[3].method, 'DELETE');

    const diaryRouteSrc = fs.readFileSync(
      path.resolve('apps/web/src/app/api/v1/diary/route.ts'),
      'utf8'
    );
    const diaryIdRouteSrc = fs.readFileSync(
      path.resolve('apps/web/src/app/api/v1/diary/[id]/route.ts'),
      'utf8'
    );
    assert.match(diaryRouteSrc, /diaryController\.create\(/);
    assert.match(diaryIdRouteSrc, /diaryController\.remove\(/);
    assert.match(diaryIdRouteSrc, /export async function PATCH\b/);
    assert.match(diaryIdRouteSrc, /diaryController\.update\(/);
  });

  it('TR-010: ItemDetailView e EpisodeManager devem concluir temporada otimisticamente sem rollback pelo diário e sincronizar aba ativa', () => {
    const detailSrc = fs.readFileSync(
      path.resolve('apps/web/src/components/catalog/item-detail-view.tsx'),
      'utf8'
    );
    const episodeManagerSrc = fs.readFileSync(
      path.resolve('apps/web/src/components/catalog/episode-manager.tsx'),
      'utf8'
    );

    assert.match(detailSrc, /CONCLUIDO/);
    assert.match(detailSrc, /catch\s*(\([^)]*\))?\s*\{\s*\r?\n?\s*\/\/.*di[aá]rio|Promise\.allSettled|\.catch\(\(\)\s*=>/i);
    assert.match(episodeManagerSrc, /useEffect\s*\(/);
    assert.match(episodeManagerSrc, /setActiveSeasonIndex\(\s*initialSeasonIndex\s*\)/);
  });

  it('TR-028: CalendarRepository com CatalogRepository deve gerar agenda com obras reais EM_ANDAMENTO e capas oficiais', async () => {
    const catalogRepo = new CatalogRepository([]);
    await catalogRepo.upsertMediaItem({
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'frieren-jornada-real',
      title: 'Frieren Real',
      normalizedTitle: 'frieren real',
      category: Category.ANIME,
      publicationStatus: PublicationStatus.EM_ANDAMENTO,
      coverPath: 'https://cdn.example.test/frieren.jpg',
      originCountry: 'JP',
      releaseYear: 2026,
      genres: ['Fantasia'],
      aliases: [],
      totalEpisodes: 28,
      rating: 9.6,
    });
    await catalogRepo.upsertMediaItem({
      id: '22222222-2222-4222-8222-222222222222',
      slug: 'dorama-real-2026',
      title: 'Dorama Real',
      normalizedTitle: 'dorama real',
      category: Category.DORAMA,
      publicationStatus: PublicationStatus.EM_ANDAMENTO,
      coverPath: 'https://cdn.example.test/dorama.jpg',
      originCountry: 'KR',
      releaseYear: 2026,
      genres: ['Drama'],
      aliases: [],
      totalEpisodes: 16,
      rating: 9.1,
    });
    await catalogRepo.upsertMediaItem({
      id: '33333333-3333-4333-8333-333333333333',
      slug: 'manhwa-real-2026',
      title: 'Manhwa Real',
      normalizedTitle: 'manhwa real',
      category: Category.MANHWA,
      publicationStatus: PublicationStatus.EM_ANDAMENTO,
      coverPath: 'https://cdn.example.test/manhwa.jpg',
      originCountry: 'KR',
      releaseYear: 2026,
      genres: ['Ação'],
      aliases: [],
      totalChapters: 95,
      rating: 9.0,
    });
    await catalogRepo.upsertMediaItem({
      id: '44444444-4444-4444-8444-444444444444',
      slug: 'filme-finalizado-ignorar',
      title: 'Filme Finalizado',
      normalizedTitle: 'filme finalizado',
      category: Category.FILME,
      publicationStatus: PublicationStatus.FINALIZADA,
      coverPath: 'https://cdn.example.test/filme.jpg',
      originCountry: 'JP',
      releaseYear: 2025,
      genres: ['Drama'],
      aliases: [],
      rating: 8.5,
    });

    const calendarRepo = new CalendarRepository(catalogRepo);
    const calendarService = new CalendarService(calendarRepo, new NotificationRepository(), catalogRepo);
    const res = await calendarService.getEvents({ view: CalendarViewMode.RELEASES });

    assert.equal(res.events.length, 3, 'Deve gerar eventos apenas para obras EM_ANDAMENTO');
    assert.ok(res.events.some((e) => e.mediaItemId === '11111111-1111-4111-8111-111111111111'));
    assert.ok(res.events.some((e) => e.coverImage === 'https://cdn.example.test/frieren.jpg'));
    assert.equal(res.events.some((e) => e.coverImage.startsWith('/covers/')), false, 'Não deve usar mocks /covers/*.svg');

    // Sem catalogRepo preserva seedDefaultEvents()
    const standaloneRepo = new CalendarRepository();
    const standaloneService = new CalendarService(standaloneRepo, new NotificationRepository());
    const standaloneRes = await standaloneService.getEvents({ view: CalendarViewMode.RELEASES });
    assert.ok(standaloneRes.events.some((e) => e.mediaSlug === 'solo-leveling-anime'));
  });

  it('TR-033 & TR-034: EventCard e CalendarSidebarWidgets devem enviar payload progress e ter fallback de capa onError', () => {
    const eventCardSrc = fs.readFileSync(
      path.resolve('apps/web/src/components/calendar/event-card.tsx'),
      'utf8'
    );
    const sidebarSrc = fs.readFileSync(
      path.resolve('apps/web/src/components/calendar/calendar-sidebar-widgets.tsx'),
      'utf8'
    );

    assert.doesNotMatch(eventCardSrc, /currentProgress\s*:/, 'EventCard não deve enviar currentProgress inválido');
    assert.match(eventCardSrc, /updateItem\(event\.mediaItemId,\s*\{\s*progress:\s*targetProgress\s*\}/);
    assert.doesNotMatch(eventCardSrc, /\/api\/v1\/diary\/events/);
    assert.match(eventCardSrc, /onError=\{/);
    assert.match(eventCardSrc, /\/api\/v1\/catalog\/items\/\$\{[^}]+\}\/cover/);
    assert.match(sidebarSrc, /onError=\{/);
    assert.match(sidebarSrc, /\/api\/v1\/catalog\/items\/\$\{[^}]+\}\/cover/);
  });
});

describe('Fase 4 — Carrossel 6 Categorias na Home, Continuar Acompanhando, Avatar no Header e Navegação SPA/SSR', () => {
  it('TR-007: CatalogApiClient deve prover getFeatured() consultando /api/v1/catalog/featured', async () => {
    let calledUrl = '';
    const client = new CatalogApiClient({
      fetcher: async (url) => {
        calledUrl = String(url);
        return new Response(JSON.stringify({ items: [{ id: '1', slug: 'a', title: 'A', category: 'ANIME' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    });

    assert.equal(typeof client.getFeatured, 'function');
    const featured = await client.getFeatured();
    assert.equal(calledUrl, '/api/v1/catalog/featured');
    assert.equal(featured.items.length, 1);
  });

  it('TR-025: HomeHubView deve usar diaryApi.list() e BentoSidebar usar event.number sem hover:scale-105 em TrendingShowcase', () => {
    const homeHubSrc = fs.readFileSync(path.resolve('apps/web/src/components/home/home-hub-view.tsx'), 'utf8');
    const sidebarSrc = fs.readFileSync(path.resolve('apps/web/src/components/home/bento-sidebar.tsx'), 'utf8');
    const trendingSrc = fs.readFileSync(path.resolve('apps/web/src/components/home/trending-showcase.tsx'), 'utf8');

    assert.doesNotMatch(homeHubSrc, /diaryApi\.listHistory\(/);
    assert.match(homeHubSrc, /diaryApi\.list\(/);
    assert.match(homeHubSrc, /getFeatured\(/);
    assert.doesNotMatch(sidebarSrc, /event\.unitNumber/);
    assert.match(sidebarSrc, /event\.number/);
    assert.doesNotMatch(trendingSrc, /group-hover:scale-105|hover:scale-105/);
  });

  it('TR-021: HeroSpotlight deve implementar carrossel clicável e arrastável com 1 recomendação real por categoria canônica', () => {
    const heroSrc = fs.readFileSync(path.resolve('apps/web/src/components/home/hero-spotlight.tsx'), 'utf8');

    assert.match(heroSrc, /featuredByCategory/);
    for (const cat of CATEGORIES) {
      assert.ok(heroSrc.includes(cat), `HeroSpotlight deve suportar categoria ${cat}`);
    }
    assert.match(heroSrc, /onPointerDown|onTouchStart/);
    assert.match(heroSrc, /aria-label="Slide anterior"|aria-label="Próximo slide"|handlePrev|handleNext/);
    assert.match(heroSrc, /\+1 Capítulo/);
    assert.match(heroSrc, /\+1 Episódio/);
    assert.doesNotMatch(heroSrc, /scale-105|blur-3xl/);
  });

  it('TR-038 & TR-039: NavigationShell deve renderizar AvatarFrame com avatar ou inicial ao lado de ThemeToggle e AuthContext expor refreshUser', () => {
    const authCtxSrc = fs.readFileSync(path.resolve('apps/web/src/context/auth-context.tsx'), 'utf8');
    const navSrc = fs.readFileSync(path.resolve('apps/web/src/components/layout/navigation-shell.tsx'), 'utf8');
    const profilePageSrc = fs.readFileSync(path.resolve('apps/web/src/app/profile/page.tsx'), 'utf8');

    assert.match(authCtxSrc, /refreshUser/);
    assert.match(navSrc, /AvatarFrame/);
    assert.match(navSrc, /user\.avatarUrl/);
    assert.match(navSrc, /ThemeToggle/);
    assert.match(profilePageSrc, /refreshUser/);
  });

  it('TR-007 & TR-008: CatalogView deve navegar via useRouter (SPA), ignorar ABORTED e oferecer busca externa explícita', () => {
    const catalogViewSrc = fs.readFileSync(path.resolve('apps/web/src/components/catalog/catalog-view.tsx'), 'utf8');

    assert.doesNotMatch(catalogViewSrc, /window\.location\.href\s*=/);
    assert.match(catalogViewSrc, /useRouter/);
    assert.match(catalogViewSrc, /ABORTED/);
    assert.match(catalogViewSrc, /initialData/);
    assert.match(catalogViewSrc, /includeExternal:\s*true/);
  });

  it('TR-007: Rotas App Router devem pré-carregar dados SSR seguros e possuir esqueletos loading.tsx', () => {
    const homePageSrc = fs.readFileSync(path.resolve('apps/web/src/app/page.tsx'), 'utf8');
    const explorePageSrc = fs.readFileSync(path.resolve('apps/web/src/app/explore/page.tsx'), 'utf8');
    const itemPageSrc = fs.readFileSync(path.resolve('apps/web/src/app/items/[slug]/page.tsx'), 'utf8');

    assert.match(homePageSrc, /initialFeatured|initialCatalog/);
    assert.match(explorePageSrc, /initialData/);
    assert.doesNotMatch(itemPageSrc, /^['"]use client['"]/);

    for (const relPath of [
      'apps/web/src/app/explore/loading.tsx',
      'apps/web/src/app/library/loading.tsx',
      'apps/web/src/app/calendar/loading.tsx',
      'apps/web/src/app/items/[slug]/loading.tsx',
    ]) {
      assert.ok(fs.existsSync(path.resolve(relPath)), `${relPath} deve existir`);
    }
  });
});
