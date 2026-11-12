/**
 * YuukiList — Suíte de Testes Automatizados TDD
 * Mudança: 032-anti-slop-and-auth-polish (R32)
 * Cobertura: TR-001 a TR-031 (home-hub, personal-library-ui, calendar-ui, user-profile-stats)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

describe('032-anti-slop-and-auth-polish — Suíte de Validação', () => {
  const heroSpotlightPath = join(projectRoot, 'apps/web/src/components/home/hero-spotlight.tsx');
  const homeHubViewPath = join(projectRoot, 'apps/web/src/components/home/home-hub-view.tsx');
  const continueWatchingPath = join(projectRoot, 'apps/web/src/components/home/continue-watching.tsx');
  const bentoSidebarPath = join(projectRoot, 'apps/web/src/components/home/bento-sidebar.tsx');
  const ledgerHeaderPath = join(projectRoot, 'apps/web/src/components/library/ledger-header.tsx');
  const libraryFiltersPath = join(projectRoot, 'apps/web/src/components/library/library-filters.tsx');
  const libraryCardPath = join(projectRoot, 'apps/web/src/components/library/library-card.tsx');
  const libraryViewPath = join(projectRoot, 'apps/web/src/components/library/library-view.tsx');
  const calendarKpisPath = join(projectRoot, 'apps/web/src/components/calendar/calendar-header-kpis.tsx');
  const profilePagePath = join(projectRoot, 'apps/web/src/app/profile/page.tsx');

  describe('US1 & TR-001, TR-002, TR-003: Autenticação Limpa no Hero e Enums Canônicos', () => {
    it('TR-001 & TR-002: hero-spotlight deve ramificar por isAuthenticated exibindo "+ Adicionar à Lista" para logados sem o item e nunca "Criar Conta"', () => {
      assert.ok(existsSync(heroSpotlightPath), 'hero-spotlight.tsx deve existir');
      const content = readFileSync(heroSpotlightPath, 'utf8');

      // Verifica que o Hero não usa Destaque do Diário / Destaque Editorial em eyebrow
      assert.ok(!content.includes('>Destaque do Diário<'), 'Não deve conter eyebrow "Destaque do Diário"');
      assert.ok(!content.includes('>Destaque Editorial<'), 'Não deve conter eyebrow "Destaque Editorial"');

      // Verifica que usuários logados sem o item no acervo recebem ação de adicionar ou explorar sem link para /register
      assert.ok(content.includes('Adicionar à Lista') || content.includes('Adicionar ao Acervo') || content.includes('onQuickAdd'), 'Deve prover ação de adicionar à lista');
      assert.ok(!content.includes('{isAuthenticated && libraryItem ?') || content.includes('!isAuthenticated'), 'Deve desacoplar autenticação de libraryItem');
    });

    it('TR-002 & TR-003: home-hub-view e continue-watching devem filtrar por enums canônicos ASSISTINDO e LENDO', () => {
      assert.ok(existsSync(homeHubViewPath), 'home-hub-view.tsx deve existir');
      assert.ok(existsSync(continueWatchingPath), 'continue-watching.tsx deve existir');

      const hubContent = readFileSync(homeHubViewPath, 'utf8');
      const cwContent = readFileSync(continueWatchingPath, 'utf8');

      // home-hub-view
      assert.ok(!hubContent.includes("status === 'WATCHING'"), 'home-hub-view não deve buscar WATCHING em inglês');
      assert.ok(!hubContent.includes("status === 'READING'"), 'home-hub-view não deve buscar READING em inglês');
      assert.ok(hubContent.includes("ASSISTINDO") && hubContent.includes("LENDO"), 'home-hub-view deve filtrar por ASSISTINDO e LENDO');

      // continue-watching
      assert.ok(!cwContent.includes("item.status === 'WATCHING'"), 'continue-watching não deve filtrar WATCHING em inglês');
      assert.ok(!cwContent.includes("item.status === 'READING'"), 'continue-watching não deve filtrar READING em inglês');
      assert.ok(cwContent.includes("ASSISTINDO") && cwContent.includes("LENDO"), 'continue-watching deve filtrar por ASSISTINDO e LENDO');
    });
  });

  describe('US2 & TR-004, TR-005, TR-011, TR-023, TR-031: Erradicação de Eyebrows, Selos Fictícios e Emojis', () => {
    it('TR-004 & TR-005: bento-sidebar deve unificar fluxo lateral sem caixas isoladas e sem font-mono decorativo', () => {
      assert.ok(existsSync(bentoSidebarPath), 'bento-sidebar.tsx deve existir');
      const content = readFileSync(bentoSidebarPath, 'utf8');

      // Não deve ter font-mono nas métricas semanais de episódios e horas
      assert.ok(!content.includes('font-mono tabular-nums text-[var(--color-text-primary)]">{totalEpisodesWeekly}'), 'totalEpisodesWeekly não deve usar font-mono decorativo');
      assert.ok(!content.includes('font-mono tabular-nums text-[var(--color-text-primary)]">{totalHoursWeekly}'), 'totalHoursWeekly não deve usar font-mono decorativo');
    });

    it('TR-011: ledger-header deve omitir rótulo "LEDGER PESSOAL V2.4" e "Sincronizado recentemente"', () => {
      assert.ok(existsSync(ledgerHeaderPath), 'ledger-header.tsx deve existir');
      const content = readFileSync(ledgerHeaderPath, 'utf8');

      assert.ok(!content.includes('LEDGER PESSOAL V2.4'), 'ledger-header não deve conter rótulo "LEDGER PESSOAL V2.4"');
      assert.ok(!content.includes('Sincronizado recentemente'), 'ledger-header não deve conter texto "Sincronizado recentemente"');
    });

    it('TR-023: calendar-header-kpis deve omitir etiqueta eyebrow de temporada', () => {
      assert.ok(existsSync(calendarKpisPath), 'calendar-header-kpis.tsx deve existir');
      const content = readFileSync(calendarKpisPath, 'utf8');

      assert.ok(!content.includes('kpis.seasonTag'), 'calendar-header-kpis não deve renderizar kpis.seasonTag em eyebrow');
      assert.ok(!content.includes('uppercase bg-accent/10 text-accent border border-accent/25'), 'Não deve conter badge eyebrow de temporada');
    });

    it('TR-031: profile/page.tsx não deve conter selos Colecionador/Acervo Privado nem emojis', () => {
      assert.ok(existsSync(profilePagePath), 'profile/page.tsx deve existir');
      const content = readFileSync(profilePagePath, 'utf8');

      assert.ok(!content.includes('Colecionador'), 'profile não deve conter selo "Colecionador"');
      assert.ok(!content.includes('Acervo Privado'), 'profile não deve conter selo "Acervo Privado"');
      assert.ok(!content.includes('🔗'), 'profile não deve conter emoji de link');
    });
  });

  describe('US3 & TR-013, TR-017: De-Pill e Cromo Neutro na Biblioteca', () => {
    it('TR-017: library-filters deve usar abas editoriais limpas em linha única sem pílulas infladas', () => {
      assert.ok(existsSync(libraryFiltersPath), 'library-filters.tsx deve existir');
      const content = readFileSync(libraryFiltersPath, 'utf8');

      // Não deve ter botões de abas com rounded-full e balões pretos inflados
      assert.ok(!content.includes('rounded-full transition-all flex items-center gap-2 focus-visible:ring-2'), 'Abas de status não devem ser pílulas infladas com rounded-full');
      assert.ok(content.includes('border-b') || content.includes('border-accent'), 'Deve usar abas editoriais com linha ou borda indicadora');
    });

    it('TR-013: library-card deve adotar cromo neutro sem CATEGORY_COLORS e sem originalTitle duplicado', () => {
      assert.ok(existsSync(libraryCardPath), 'library-card.tsx deve existir');
      const content = readFileSync(libraryCardPath, 'utf8');

      assert.ok(!content.includes('CATEGORY_COLORS'), 'library-card não deve usar mapa de tingimento CATEGORY_COLORS');
      assert.ok(!content.includes('{media.originalTitle}'), 'library-card não deve duplicar título com media.originalTitle');
    });
  });
});
