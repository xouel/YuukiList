/**
 * YuukiList — Testes Automatizados do Perfil Editorial e Inversão de Vitrine (022-editorial-profile-showcase)
 * Validação rigorosa dos cenários normativos de specs/user-profile-stats/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

describe('US1 — Inversão Hierárquica e Vitrine de Favoritos no Topo (TR-001, TR-003 & TR-004)', () => {
  const profilePagePath = join(projectRoot, 'apps/web/src/app/profile/page.tsx');
  const favoritesShowcasePath = join(projectRoot, 'apps/web/src/components/profile/favorites-showcase.tsx');
  const profilePageContent = readFileSync(profilePagePath, 'utf8');
  const favoritesShowcaseContent = readFileSync(favoritesShowcasePath, 'utf8');

  it('TR-003: ProfilePage deve renderizar a Vitrine de Favoritos ANTES das Estatísticas Analíticas', () => {
    const favoritesIndex = profilePageContent.indexOf('<FavoritesShowcase');
    const statsIndex = profilePageContent.indexOf('<ProfileStats ');

    assert.ok(favoritesIndex > 0, 'FavoritesShowcase deve estar presente na página de perfil');
    assert.ok(statsIndex > 0, 'ProfileStats deve estar presente na página de perfil');
    assert.ok(
      favoritesIndex < statsIndex,
      'A Vitrine de Favoritos DEVE vir antes das estatísticas analíticas (Inversão Hierárquica)'
    );
  });

  it('TR-001: FavoritesShowcase deve utilizar proporção editorial 2:3 e estilo visual com coração carmim', () => {
    assert.ok(
      favoritesShowcaseContent.includes('aspect-[2/3]'),
      'Cards da vitrine de favoritos devem adotar proporção 2:3 clássica'
    );
    assert.ok(
      favoritesShowcaseContent.includes('#E05347'),
      'Ícone de favorito deve utilizar a cor carmim #E05347 da paleta Asian Editorial'
    );
    assert.ok(
      favoritesShowcaseContent.includes('font-serif'),
      'Títulos das obras favoritas devem adotar tipografia em serifa moderna'
    );
  });

  it('TR-004: FavoritesShowcase deve renderizar estado acolhedor quando o usuário não tiver favoritos', () => {
    assert.ok(
      favoritesShowcaseContent.includes('Você ainda não favoritou nenhuma obra') ||
      favoritesShowcaseContent.includes('Nenhuma obra favoritada'),
      'Deve conter mensagem informativa suave no estado vazio'
    );
    assert.ok(
      favoritesShowcaseContent.includes('href="/"') || favoritesShowcaseContent.includes("href='/'"),
      'Estado vazio deve incluir link direto para explorar o catálogo'
    );
  });
});

describe('US2 & US3 — Métricas Compactas, Paleta Asian Editorial e Soberania de Dados (TR-002, TR-005, TR-006 & TR-007)', () => {
  const profilePagePath = join(projectRoot, 'apps/web/src/app/profile/page.tsx');
  const profileStatsPath = join(projectRoot, 'apps/web/src/components/profile/profile-stats.tsx');
  const profilePageContent = readFileSync(profilePagePath, 'utf8');
  const profileStatsContent = readFileSync(profileStatsPath, 'utf8');

  it('TR-007: ProfileStats deve utilizar paleta mineral Asian Editorial e formato compacto', () => {
    assert.ok(
      profileStatsContent.includes('#1A1820') || profileStatsContent.includes('bg-[#1A1820]'),
      'Cards de estatísticas devem utilizar superfícies minerais #1A1820'
    );
    assert.ok(
      profileStatsContent.includes('#2B2735') || profileStatsContent.includes('border-[#2B2735]'),
      'Bordas de estatísticas devem adotar o tom mineral #2B2735'
    );
    assert.ok(
      !profileStatsContent.includes('bg-cyan-500'),
      'Não deve utilizar cor ciano genérica nas categorias'
    );
  });

  it('TR-005 & TR-006: ProfileStats deve tratar estatísticas zeradas e manter formatação das 4 métricas', () => {
    assert.ok(
      profileStatsContent.includes('stats.totalCompleted') &&
      profileStatsContent.includes('stats.totalEstimatedHours') &&
      profileStatsContent.includes('stats.averageRating'),
      'Deve exibir os 4 pilares de métricas analíticas'
    );
    assert.ok(
      profileStatsContent.includes('stats.categoryDistribution'),
      'Deve calcular e renderizar a distribuição proporcional de categorias'
    );
  });

  it('TR-002 & TR-007: ProfilePage deve remover gradiente neon ciano no avatar e integrar a max-w-7xl', () => {
    assert.ok(
      !profilePageContent.includes('from-cyan-500 via-sky-500 to-violet-500'),
      'Avatar não deve utilizar gradiente tech ciano-violeta'
    );
    assert.ok(
      profilePageContent.includes('max-w-7xl'),
      'ProfilePage deve integrar-se ao container uniforme max-w-7xl da aplicação'
    );
    assert.ok(
      profilePageContent.includes('#E05347'),
      'Avatar ou acentos de perfil devem utilizar o carmim #E05347'
    );
  });
});
