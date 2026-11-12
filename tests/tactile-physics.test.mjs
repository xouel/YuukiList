/**
 * YuukiList — Testes Automatizados de Física Tátil e Contenção de Movimento (R30: 030-tactile-physics-and-motion-restraint)
 * Validação rigorosa dos cenários normativos de specs/catalog-browse, personal-library-ui e calendar-ui
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const mediaCardPath = join(projectRoot, 'apps/web/src/components/catalog/media-card.tsx');
const libraryCardPath = join(projectRoot, 'apps/web/src/components/library/library-card.tsx');
const eventCardPath = join(projectRoot, 'apps/web/src/components/calendar/event-card.tsx');
const heroSpotlightPath = join(projectRoot, 'apps/web/src/components/home/hero-spotlight.tsx');

describe('US2 — Erradicação de Zoom Agressivo nas Capas (SC-001, TR-003, TR-007, TR-011)', () => {

  it('TR-003: media-card.tsx não deve conter hover:scale-105 ou group-hover:scale-105', () => {
    assert.ok(existsSync(mediaCardPath), 'media-card.tsx deve existir');
    const content = readFileSync(mediaCardPath, 'utf8');

    assert.ok(!content.includes('scale-105'), 'media-card.tsx não deve conter scale-105');
  });

  it('TR-007: library-card.tsx não deve conter hover:scale-105 ou group-hover:scale-105', () => {
    assert.ok(existsSync(libraryCardPath), 'library-card.tsx deve existir');
    const content = readFileSync(libraryCardPath, 'utf8');

    assert.ok(!content.includes('scale-105'), 'library-card.tsx não deve conter scale-105');
  });

  it('TR-011: event-card.tsx não deve conter hover:scale-105 ou group-hover:scale-105', () => {
    assert.ok(existsSync(eventCardPath), 'event-card.tsx deve existir');
    const content = readFileSync(eventCardPath, 'utf8');

    assert.ok(!content.includes('scale-105'), 'event-card.tsx não deve conter scale-105');
  });

  it('hero-spotlight.tsx não deve conter hover:scale-105 ou group-hover:scale-105', () => {
    assert.ok(existsSync(heroSpotlightPath), 'hero-spotlight.tsx deve existir');
    const content = readFileSync(heroSpotlightPath, 'utf8');

    assert.ok(!content.includes('scale-105'), 'hero-spotlight.tsx não deve conter scale-105');
  });

});

describe('US1 — Física Tátil e Resposta Elástica Imediata (SC-002, TR-001, TR-004, TR-012, TR-013)', () => {

  it('TR-001: media-card.tsx deve conter active:scale-[0.98] ou active:scale-95 no card ou ações', () => {
    const content = readFileSync(mediaCardPath, 'utf8');
    assert.ok(content.includes('active:scale-[0.98]') || content.includes('active:scale-95'), 'media-card.tsx deve conter resposta tátil ativa');
  });

  it('TR-004: library-card.tsx deve conter active:scale-[0.98] ou active:scale-95 no card ou botões táteis', () => {
    const content = readFileSync(libraryCardPath, 'utf8');
    assert.ok(content.includes('active:scale-[0.98]') || content.includes('active:scale-95'), 'library-card.tsx deve conter resposta tátil ativa');
  });

  it('TR-012, TR-013: event-card.tsx deve conter active:scale-[0.98] ou active:scale-95 em ações rápidas', () => {
    const content = readFileSync(eventCardPath, 'utf8');
    assert.ok(content.includes('active:scale-[0.98]') || content.includes('active:scale-95'), 'event-card.tsx deve conter resposta tátil ativa');
  });

  it('hero-spotlight.tsx deve conter resposta tátil ativa em botões de ação', () => {
    const content = readFileSync(heroSpotlightPath, 'utf8');
    assert.ok(content.includes('active:scale-[0.98]') || content.includes('active:scale-95'), 'hero-spotlight.tsx deve conter resposta tátil ativa');
  });

});

describe('US3 — Alinhamento Estável com Números Tabulares (SC-003, TR-003, TR-007, TR-009)', () => {

  it('TR-003: media-card.tsx deve conter tabular-nums para notas ou contadores', () => {
    const content = readFileSync(mediaCardPath, 'utf8');
    assert.ok(content.includes('tabular-nums'), 'media-card.tsx deve conter tabular-nums');
  });

  it('TR-007: library-card.tsx deve conter tabular-nums no progresso', () => {
    const content = readFileSync(libraryCardPath, 'utf8');
    assert.ok(content.includes('tabular-nums'), 'library-card.tsx deve conter tabular-nums');
  });

  it('TR-009: event-card.tsx deve conter tabular-nums nos horários', () => {
    const content = readFileSync(eventCardPath, 'utf8');
    assert.ok(content.includes('tabular-nums'), 'event-card.tsx deve conter tabular-nums');
  });

});

