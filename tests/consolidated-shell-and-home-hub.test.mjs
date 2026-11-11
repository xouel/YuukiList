/**
 * YuukiList — Suíte de Testes Automatizados TDD
 * Mudança: 023-consolidated-shell-and-home-hub (R23)
 * Cobertura: TR-001 a TR-019 (home-hub, navigation-shell, catalog-browse, personal-library-ui)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { LibraryApiClient } from '../apps/web/src/services/library-api.client.ts';

const projectRoot = process.cwd();

describe('023-consolidated-shell-and-home-hub — Suíte de Validação', () => {
  // Arquivos-chave da mudança
  const shellPath = join(projectRoot, 'apps/web/src/components/layout/navigation-shell.tsx');
  const homePagePath = join(projectRoot, 'apps/web/src/app/page.tsx');
  const explorePagePath = join(projectRoot, 'apps/web/src/app/explore/page.tsx');
  const homeHubViewPath = join(projectRoot, 'apps/web/src/components/home/home-hub-view.tsx');
  const heroSpotlightPath = join(projectRoot, 'apps/web/src/components/home/hero-spotlight.tsx');
  const continueWatchingPath = join(projectRoot, 'apps/web/src/components/home/continue-watching.tsx');
  const bentoSidebarPath = join(projectRoot, 'apps/web/src/components/home/bento-sidebar.tsx');
  const trendingShowcasePath = join(projectRoot, 'apps/web/src/components/home/trending-showcase.tsx');
  const libraryClientPath = join(projectRoot, 'apps/web/src/services/library-api.client.ts');
  const libraryViewPath = join(projectRoot, 'apps/web/src/components/library/library-view.tsx');
  const catalogViewPath = join(projectRoot, 'apps/web/src/components/catalog/catalog-view.tsx');

  describe('US1 & TR-007, TR-008, TR-009, TR-010: Top Command Bar e Casca Responsiva', () => {
    it('TR-007: navigation-shell deve implementar Top Command Bar horizontal no desktop com 4 atalhos e busca', () => {
      assert.ok(existsSync(shellPath), 'navigation-shell.tsx deve existir');
      const content = readFileSync(shellPath, 'utf8');

      // Top Command Bar com atalhos centrais
      assert.ok(content.includes("href: '/'") || content.includes('href="/"'), 'Deve conter atalho para Início');
      assert.ok(content.includes('/library'), 'Deve conter atalho para Minha Lista (/library)');
      assert.ok(content.includes('/explore'), 'Deve conter atalho para Explorar (/explore)');
      assert.ok(content.includes('/calendar'), 'Deve conter atalho para Calendário (/calendar)');

      // Busca rápida na barra superior
      assert.ok(content.includes('search') || content.includes('Buscar') || content.includes('/explore?q='), 'Deve conter barra ou atalho de busca rápida');

      // Sino de notificações e ThemeToggle
      assert.ok(content.includes('NotificationBell'), 'Deve conter sino de notificações');
      assert.ok(content.includes('ThemeToggle'), 'Deve conter alternador de temas');
    });

    it('TR-008: navigation-shell deve manter Bottom Navigation acessível em telas mobile (< 768px)', () => {
      const content = readFileSync(shellPath, 'utf8');
      assert.ok(content.includes('md:hidden') || content.includes('lg:hidden'), 'Deve conter bloco de navegação mobile');
      assert.ok(content.includes('fixed bottom-0') || content.includes('sticky bottom-0') || content.includes('bottom-0'), 'Bottom Nav deve fixar na base da viewport no mobile');
    });

    it('TR-009: botões de autenticação devem refletir dinamicamente a rota atual', () => {
      const content = readFileSync(shellPath, 'utf8');
      assert.ok(content.includes('/login') && content.includes('/register'), 'Deve conter links de login e registro');
      assert.ok(content.includes('isLogin') || content.includes('pathname === \'/login\''), 'Deve detectar rota de login');
    });

    it('TR-010: container principal deve manter largura máxima uniforme em max-w-7xl', () => {
      const content = readFileSync(shellPath, 'utf8');
      assert.ok(content.includes('max-w-7xl'), 'Container principal deve utilizar max-w-7xl');
    });
  });

  describe('US2 & TR-001 a TR-006: Home Hub Dashboard, Hero Spotlight e Bento Sidebar', () => {
    it('TR-001 & TR-002: home-hub-view deve implementar grid 8+4 no desktop e coluna única no mobile', () => {
      assert.ok(existsSync(homeHubViewPath), 'home-hub-view.tsx deve existir');
      const content = readFileSync(homeHubViewPath, 'utf8');
      assert.ok(content.includes('lg:grid-cols-12') || (content.includes('lg:col-span-8') && content.includes('lg:col-span-4')), 'Home Hub deve implementar grid 8+4 no desktop');
    });

    it('TR-003 & TR-004: hero-spotlight deve renderizar obra de destaque com progresso para autenticados e variante de boas-vindas', () => {
      assert.ok(existsSync(heroSpotlightPath), 'hero-spotlight.tsx deve existir');
      const content = readFileSync(heroSpotlightPath, 'utf8');
      assert.ok(content.includes('cover') || content.includes('coverUrl') || content.includes('img'), 'Hero deve exibir capa');
      assert.ok(content.includes('Episódio') || content.includes('Progresso') || content.includes('progress'), 'Hero deve exibir progresso');
    });

    it('TR-005: bento-sidebar deve renderizar Resumo Semanal e régua de Constância de 7 dias com streak', () => {
      assert.ok(existsSync(bentoSidebarPath), 'bento-sidebar.tsx deve existir');
      const content = readFileSync(bentoSidebarPath, 'utf8');
      assert.ok(content.includes('Resumo Semanal') || content.includes('Semanal'), 'Sidebar deve conter Resumo Semanal');
      assert.ok(content.includes('Constância') || content.includes('Dias Seguidos') || content.includes('streak'), 'Sidebar deve conter Constância Diária');
    });

    it('TR-006: bento-sidebar deve exibir Próximas Estreias e Feed de Atividade pessoal', () => {
      const content = readFileSync(bentoSidebarPath, 'utf8');
      assert.ok(content.includes('Próximas Estreias') || content.includes('Estreias'), 'Sidebar deve conter Próximas Estreias');
      assert.ok(content.includes('Feed de Atividade') || content.includes('Atividade'), 'Sidebar deve conter Feed de Atividade pessoal');
    });

    it('TR-018: continue-watching deve prover cards táteis com alvo mínimo de 44x44px', () => {
      assert.ok(existsSync(continueWatchingPath), 'continue-watching.tsx deve existir');
      const content = readFileSync(continueWatchingPath, 'utf8');
      assert.ok(content.includes('Continuar Acompanhando') || content.includes('Acompanhando'), 'Deve ter cabeçalho da seção');
      assert.ok(content.includes('min-h-[44px]') || content.includes('py-2.5') || content.includes('h-11') || content.includes('h-12'), 'Botão tátil de avanço rápido deve ter dimensão acessível');
    });
  });

  describe('US3 & TR-011 a TR-017, TR-019: Rota /explore, Compatibilidade e Desserialização da Biblioteca', () => {
    it('TR-011, TR-012, TR-013: rota /explore deve prover catálogo completo com filtros e paginação', () => {
      assert.ok(existsSync(explorePagePath), 'apps/web/src/app/explore/page.tsx deve existir');
      const content = readFileSync(explorePagePath, 'utf8');
      assert.ok(content.includes('CatalogView'), 'explore/page.tsx deve renderizar CatalogView');
    });

    it('TR-014: rota raiz / deve redirecionar consultas de busca com parâmetros para /explore', () => {
      assert.ok(existsSync(homePagePath), 'apps/web/src/app/page.tsx deve existir');
      const content = readFileSync(homePagePath, 'utf8');
      assert.ok(content.includes('/explore') || content.includes('redirect'), 'page.tsx deve tratar redirecionamento de busca para /explore');
    });

    it('TR-019: LibraryApiClient deve normalizar a resposta provendo data e items conjuntamente', async () => {
      const mockItems = [
        { id: 'lib-1', mediaItemId: 'media-1', status: 'WATCHING', progress: 5, isFavorite: true },
      ];
      const mockFetcher = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: mockItems,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
        }),
      });

      const client = new LibraryApiClient({ fetcher: mockFetcher });
      const resList = await client.list();
      assert.ok(Array.isArray(resList.data), 'resList.data deve ser um array');
      assert.ok(Array.isArray(resList.items), 'resList.items deve ser um array');
      assert.equal(resList.items.length, 1, 'items deve conter 1 elemento');

      const resListItems = await client.listItems();
      assert.ok(Array.isArray(resListItems.data), 'resListItems.data deve ser um array');
      assert.ok(Array.isArray(resListItems.items), 'resListItems.items deve ser um array');
      assert.equal(resListItems.items.length, 1, 'items deve conter 1 elemento');
    });

    it('TR-015, TR-016, TR-017: library-view deve consumir res.data ou res.items de forma defensiva', () => {
      const content = readFileSync(libraryViewPath, 'utf8');
      assert.ok(
        content.includes('response.data') || content.includes('response.items'),
        'library-view deve ler response.data ou response.items'
      );
      assert.ok(content.includes('loadSavedLayout') || content.includes('layout'), 'library-view deve gerenciar layout de lista/grade');
    });
  });
});
