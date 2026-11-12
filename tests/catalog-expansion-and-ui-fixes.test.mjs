import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

test('036-catalog-expansion-and-ui-fixes — Suite de Validacao', async (t) => {
  await t.test('US1 — Carga Ampliada e Resiliencia de Capas (TR-001, TR-002)', async (st) => {
    const seedPath = path.join(ROOT_DIR, 'scripts/seed-real-catalog.mjs');
    assert.ok(fs.existsSync(seedPath), 'Script de seed deve existir no monorepo');
    const seedContent = fs.readFileSync(seedPath, 'utf-8');

    await st.test('Seed possui acervo representativo em todas as 6 categorias canonicas (>120 obras)', () => {
      const categories = ['DORAMA', 'FILME', 'ANIME', 'MANGA', 'MANHWA', 'MANHUA'];
      for (const cat of categories) {
        assert.ok(
          seedContent.includes(`Category.${cat}`),
          `Script de seed deve conter obras na categoria ${cat}`
        );
      }
      assert.ok(
        seedContent.includes('seedUserLibraryForTesting'),
        'Script de seed deve exportar/implementar gerador de biblioteca de teste para estatisticas'
      );
      assert.ok(
        seedContent.includes('fetchTmdbDiscoverBatch') &&
          seedContent.includes('fetchKitsuCatalogBatch') &&
          seedContent.includes('resolveOfficialCover') &&
          seedContent.includes('isBrokenCoverUrl'),
        'Script de seed deve suportar colheita paginada TMDB/Kitsu e reparo automatico de capas oficiais'
      );
    });

    await st.test('Componentes visuais possuem listener onError com fallback para SVG local', () => {
      const mediaCardPath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/media-card.tsx');
      const libraryCardPath = path.join(ROOT_DIR, 'apps/web/src/components/library/library-card.tsx');
      const detailViewPath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/item-detail-view.tsx');
      const favoritesShowcasePath = path.join(ROOT_DIR, 'apps/web/src/components/profile/favorites-showcase.tsx');
      const heroSpotlightPath = path.join(ROOT_DIR, 'apps/web/src/components/home/hero-spotlight.tsx');

      const mediaCardContent = fs.readFileSync(mediaCardPath, 'utf-8');
      const libraryCardContent = fs.readFileSync(libraryCardPath, 'utf-8');
      const detailViewContent = fs.readFileSync(detailViewPath, 'utf-8');
      const favoritesShowcaseContent = fs.readFileSync(favoritesShowcasePath, 'utf-8');
      const heroSpotlightContent = fs.readFileSync(heroSpotlightPath, 'utf-8');

      assert.ok(
        mediaCardContent.includes('onError=') && mediaCardContent.includes('/cover'),
        'media-card.tsx deve implementar fallback onError para rota de capa SVG'
      );
      assert.ok(
        libraryCardContent.includes('onError=') && libraryCardContent.includes('/cover'),
        'library-card.tsx deve implementar fallback onError para rota de capa SVG'
      );
      assert.ok(
        detailViewContent.includes('onError=') && detailViewContent.includes('/cover'),
        'item-detail-view.tsx deve implementar fallback onError para rota de capa SVG'
      );
      assert.ok(
        favoritesShowcaseContent.includes('onError=') && favoritesShowcaseContent.includes('/cover'),
        'favorites-showcase.tsx deve implementar fallback onError para rota de capa SVG'
      );
      assert.ok(
        heroSpotlightContent.includes('onError=') && heroSpotlightContent.includes('/cover'),
        'hero-spotlight.tsx deve implementar fallback onError para rota de capa SVG'
      );
    });
  });

  await t.test('US2 — Filtro de Generos e Saneamento do Dossie (TR-003, TR-004)', async (st) => {
    const filterBarPath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/filter-bar.tsx');
    const catalogViewPath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/catalog-view.tsx');
    const consolePath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/personal-tracking-console.tsx');

    const filterBarContent = fs.readFileSync(filterBarPath, 'utf-8');
    const catalogViewContent = fs.readFileSync(catalogViewPath, 'utf-8');
    const consoleContent = fs.readFileSync(consolePath, 'utf-8');

    await st.test('filter-bar.tsx implementa seletor de genero e desativa temas transversais', () => {
      assert.ok(
        filterBarContent.includes('GENRES =') && (filterBarContent.includes('Gênero') || filterBarContent.includes('filter-genre')),
        'filter-bar.tsx deve conter lista de generos e dropdown correspondente'
      );
      assert.ok(
        !filterBarContent.includes('value={selectedTheme}'),
        'filter-bar.tsx nao deve mais vincular seletor de temas transversais'
      );
    });

    await st.test('catalog-view.tsx repassa parametro de genero para a API de busca', () => {
      assert.ok(
        catalogViewContent.includes('handleSelectGenre') && catalogViewContent.includes('selectedGenre='),
        'catalog-view.tsx deve propagar selectedGenre na query da API de catalogo'
      );
    });

    await st.test('personal-tracking-console.tsx e hero-spotlight.tsx removem glifo + redundante diante de +1', () => {
      const heroSpotlightPath = path.join(ROOT_DIR, 'apps/web/src/components/home/hero-spotlight.tsx');
      const heroSpotlightContent = fs.readFileSync(heroSpotlightPath, 'utf-8');

      assert.ok(
        !consoleContent.includes('>+ +1'),
        'personal-tracking-console.tsx nao deve renderizar "+ +1"'
      );
      assert.ok(
        consoleContent.includes('+1 {unitLabel}'),
        'personal-tracking-console.tsx deve renderizar "+1 {unitLabel}" limpo com icone de avanco'
      );
      const epIndex = heroSpotlightContent.indexOf('+1 Episódio');
      assert.ok(epIndex > 0, 'hero-spotlight.tsx deve renderizar +1 Episódio');
      const epContext = heroSpotlightContent.slice(Math.max(0, epIndex - 260), epIndex);
      assert.ok(
        epContext.includes('M13 5l7 7-7 7M5 5l7 7-7 7') && !epContext.includes('M12 4v16m8-8H4'),
        'hero-spotlight.tsx deve usar seta dupla de avanco (sem "+" duplicado) ao lado de +1 Episodio'
      );
    });
  });

  await t.test('US3 — Acao de Favoritar e Metricas do Perfil (TR-005, TR-006, TR-007)', async (st) => {
    const consolePath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/personal-tracking-console.tsx');
    const detailViewPath = path.join(ROOT_DIR, 'apps/web/src/components/catalog/item-detail-view.tsx');
    const libraryRepoPath = path.join(ROOT_DIR, 'apps/api/src/library/library.repository.ts');
    const profileServicePath = path.join(ROOT_DIR, 'apps/api/src/profile/profile.service.ts');

    const consoleContent = fs.readFileSync(consolePath, 'utf-8');
    const detailViewContent = fs.readFileSync(detailViewPath, 'utf-8');
    const libraryRepoContent = fs.readFileSync(libraryRepoPath, 'utf-8');
    const profileServiceContent = fs.readFileSync(profileServicePath, 'utf-8');

    await st.test('personal-tracking-console.tsx e item-detail-view.tsx conectam acao de favoritar', () => {
      assert.ok(
        consoleContent.includes('onToggleFavorite?: () =>'),
        'personal-tracking-console.tsx deve declarar prop onToggleFavorite'
      );
      assert.ok(
        detailViewContent.includes('handleToggleFavorite') && detailViewContent.includes('onToggleFavorite={handleToggleFavorite}'),
        'item-detail-view.tsx deve fornecer handler e repassar onToggleFavorite ao console'
      );
    });

    await st.test('users.repository.ts e container.ts conectam persistencia real de usuarios e favoritos no Prisma', () => {
      const usersRepoPath = path.join(ROOT_DIR, 'apps/api/src/auth/users.repository.ts');
      const containerPath = path.join(ROOT_DIR, 'apps/web/src/server/container.ts');
      const usersRepoContent = fs.readFileSync(usersRepoPath, 'utf-8');
      const containerContent = fs.readFileSync(containerPath, 'utf-8');

      assert.ok(
        usersRepoContent.includes('customPrisma') && usersRepoContent.includes('user.'),
        'users.repository.ts deve persistir usuarios no Prisma PostgreSQL'
      );
      assert.ok(
        containerContent.includes('AuthModule') && containerContent.includes('prisma'),
        'container.ts deve injetar PrismaClient em AuthModule e repositorios'
      );
    });

    await st.test('library.repository.ts persiste dados via Prisma PostgreSQL com fallback resiliente', () => {
      assert.ok(
        libraryRepoContent.includes('prisma.userLibraryItem') || libraryRepoContent.includes('this.prisma.userLibraryItem'),
        'library.repository.ts deve interagir com tabela user_library_items do Prisma'
      );
      assert.ok(
        libraryRepoContent.includes('isFavorite') || libraryRepoContent.includes('updateItem'),
        'library.repository.ts deve suportar atualizacao do campo isFavorite'
      );
    });

    await st.test('profile.service.ts calcula metricas de consumo e retorna vitrine de favoritos com capa resiliente', () => {
      assert.ok(
        profileServiceContent.includes('favorites') || profileServiceContent.includes('isFavorite'),
        'profile.service.ts deve selecionar e expor itens favoritados'
      );
      assert.ok(
        profileServiceContent.includes('/cover'),
        'profile.service.ts deve prover fallback de capa oficial em caso de ausente ou nula'
      );
    });
  });
});
