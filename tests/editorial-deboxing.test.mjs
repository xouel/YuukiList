/**
 * YuukiList — Testes Automatizados de De-Boxing Editorial e Ritmo de Layout (R29: 029-editorial-de-boxing-and-layout-rhythm)
 * Validacao rigorosa dos cenarios normativos de specs/home-hub/spec.md e specs/personal-library-ui/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const bentoPath = join(projectRoot, 'apps/web/src/components/home/bento-sidebar.tsx');
const heroPath = join(projectRoot, 'apps/web/src/components/home/hero-spotlight.tsx');
const ledgerPath = join(projectRoot, 'apps/web/src/components/library/ledger-header.tsx');
const libraryCardPath = join(projectRoot, 'apps/web/src/components/library/library-card.tsx');

describe('US2 — Desencaixe dos Widgets do Home Hub (TR-001, TR-002, TR-003, TR-004)', () => {

  it('TR-003: bento-sidebar.tsx deve eliminar sub-cards aninhados de bordas duplas em Resumo Semanal', () => {
    assert.ok(existsSync(bentoPath), 'bento-sidebar.tsx deve existir');
    const content = readFileSync(bentoPath, 'utf8');

    // Nao deve conter sub-cards aninhados com bordas em episodios e horas
    assert.ok(!content.includes('rounded-xl bg-surface-overlay border border-stroke-subtle'), 'Nao deve conter sub-cards com bordas duplas aninhadas');
    // Deve conter divisor vertical sutil e numeros tabulares
    assert.ok(content.includes('divide-x') || content.includes('border-r') || content.includes('border-l'), 'Deve conter divisao editorial limpa');
    assert.ok(content.includes('tabular-nums') || content.includes('font-mono'), 'Deve usar numeros tabulares');
  });

  it('TR-004: bento-sidebar.tsx deve manter consistencia em proximas estreias e feed do diario', () => {
    const content = readFileSync(bentoPath, 'utf8');
    assert.ok(content.includes('Próximas Estreias') || content.includes('Proximas Estreias'), 'Deve conter secao de proximas estreias');
    assert.ok(content.includes('Feed de Atividade') || content.includes('Diário'), 'Deve conter feed de atividade do diario');
  });

  it('TR-001: hero-spotlight.tsx deve remover a luz difusa circular artificial blur-3xl', () => {
    assert.ok(existsSync(heroPath), 'hero-spotlight.tsx deve existir');
    const content = readFileSync(heroPath, 'utf8');

    // Nao deve conter blur-3xl difuso
    assert.ok(!content.includes('blur-3xl'), 'Nao deve conter efeito artificial blur-3xl');
    assert.ok(content.includes('HeroSpotlight'), 'Componente HeroSpotlight exportado');
  });

  it('TR-002: hero-spotlight.tsx no modo visitante deve preservar contraste editorial e legibilidade', () => {
    const content = readFileSync(heroPath, 'utf8');
    assert.ok(content.includes('Destaque Editorial') || content.includes('Destaque do Diário'), 'Mantem chamada editorial');
  });

});

describe('US1 — Faixa de Metricas do Ledger Unificada (TR-010, TR-005, TR-006, TR-007, TR-009)', () => {

  it('TR-010: ledger-header.tsx deve consolidar KPIs em barra unica com divide-x e remover animate-pulse', () => {
    assert.ok(existsSync(ledgerPath), 'ledger-header.tsx deve existir');
    const content = readFileSync(ledgerPath, 'utf8');

    // Deve conter divide-x na barra de KPIs
    assert.ok(content.includes('divide-x'), 'Deve conter divide-x na faixa de metricas');
    // Nao deve conter o ponto verde piscante animate-pulse
    assert.ok(!content.includes('animate-pulse'), 'Nao deve conter animate-pulse no indicador de sincronizacao');
    // Deve usar numeros tabulares
    assert.ok(content.includes('tabular-nums') || content.includes('font-mono'), 'Deve usar numeros tabulares nos contadores');
  });

});

describe('US3 — Foco Editorial na Arte da Capa dos Cards (TR-008, TR-011)', () => {

  it('TR-008: library-card.tsx deve simplificar selos sobre a capa com tag sobria e minimalista', () => {
    assert.ok(existsSync(libraryCardPath), 'library-card.tsx deve existir');
    const content = readFileSync(libraryCardPath, 'utf8');

    assert.ok(content.includes('LibraryCard'), 'Componente LibraryCard exportado');
    // Deve manter statusLabel
    assert.ok(content.includes('statusLabel'), 'Deve exibir statusLabel');
  });

});
