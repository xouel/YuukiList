import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ITEM_DETAIL_PATH = path.join(ROOT_DIR, 'apps/web/src/components/catalog/item-detail-view.tsx');
const DOSSIER_METRICS_PATH = path.join(ROOT_DIR, 'apps/web/src/components/catalog/dossier-metrics-strip.tsx');
const DOSSIER_SIDEBAR_PATH = path.join(ROOT_DIR, 'apps/web/src/components/catalog/dossier-sidebar.tsx');
const PERSONAL_CONSOLE_PATH = path.join(ROOT_DIR, 'apps/web/src/components/catalog/personal-tracking-console.tsx');
const CALENDAR_VIEW_PATH = path.join(ROOT_DIR, 'apps/web/src/components/calendar/calendar-view.tsx');
const CALENDAR_HEADER_KPIS_PATH = path.join(ROOT_DIR, 'apps/web/src/components/calendar/calendar-header-kpis.tsx');
const CALENDAR_SIDEBAR_PATH = path.join(ROOT_DIR, 'apps/web/src/components/calendar/calendar-sidebar-widgets.tsx');

describe('US1 — Tipografia Editorial Shippori Mincho e Despoluição da Capa do Dossiê', () => {
  test('TR-007: item-detail-view.tsx deve utilizar font-serif no título principal e títulos de seções', () => {
    const content = fs.readFileSync(ITEM_DETAIL_PATH, 'utf-8');
    assert.match(
      content,
      /font-serif/,
      'item-detail-view.tsx deve conter font-serif para títulos editoriais'
    );
  });

  test('TR-007: item-detail-view.tsx não deve conter group-hover:scale-105 ou hover:scale-105 na capa', () => {
    const content = fs.readFileSync(ITEM_DETAIL_PATH, 'utf-8');
    assert.doesNotMatch(
      content,
      /group-hover:scale-105/,
      'item-detail-view.tsx não pode conter group-hover:scale-105 na capa'
    );
    assert.doesNotMatch(
      content,
      /hover:scale-105/,
      'item-detail-view.tsx não pode conter hover:scale-105'
    );
  });

  test('TR-007: item-detail-view.tsx não deve conter o selo sobreposto artificial "#2 Global"', () => {
    const content = fs.readFileSync(ITEM_DETAIL_PATH, 'utf-8');
    assert.doesNotMatch(
      content,
      /#2 Global/,
      'item-detail-view.tsx deve despoluir a capa removendo o badge artificial #2 Global'
    );
  });
});

describe('US2 — Saneamento de Cores e Consistência Bimodal no Dossiê', () => {
  test('TR-008: item-detail-view.tsx não deve conter hexadecimais brutos hardcoded (#1A1820, #2B2735, #201D28, #F4EFEA)', () => {
    const content = fs.readFileSync(ITEM_DETAIL_PATH, 'utf-8');
    assert.doesNotMatch(content, /#1A1820/i, 'item-detail-view.tsx não deve conter #1A1820');
    assert.doesNotMatch(content, /#2B2735/i, 'item-detail-view.tsx não deve conter #2B2735');
    assert.doesNotMatch(content, /#201D28/i, 'item-detail-view.tsx não deve conter #201D28');
    assert.doesNotMatch(content, /#F4EFEA/i, 'item-detail-view.tsx não deve conter #F4EFEA');
  });

  test('TR-008: dossier-metrics-strip.tsx não deve conter hexadecimais brutos e deve usar tabular-nums', () => {
    const content = fs.readFileSync(DOSSIER_METRICS_PATH, 'utf-8');
    assert.doesNotMatch(content, /#1A1820/i, 'dossier-metrics-strip.tsx não deve conter #1A1820');
    assert.doesNotMatch(content, /#2B2735/i, 'dossier-metrics-strip.tsx não deve conter #2B2735');
    assert.doesNotMatch(content, /#201D28/i, 'dossier-metrics-strip.tsx não deve conter #201D28');
    assert.doesNotMatch(content, /#F4EFEA/i, 'dossier-metrics-strip.tsx não deve conter #F4EFEA');
    assert.match(content, /tabular-nums/, 'dossier-metrics-strip.tsx deve conter tabular-nums');
  });

  test('TR-008: dossier-sidebar.tsx não deve conter hexadecimais brutos e deve usar tabular-nums', () => {
    const content = fs.readFileSync(DOSSIER_SIDEBAR_PATH, 'utf-8');
    assert.doesNotMatch(content, /#1A1820/i, 'dossier-sidebar.tsx não deve conter #1A1820');
    assert.doesNotMatch(content, /#2B2735/i, 'dossier-sidebar.tsx não deve conter #2B2735');
    assert.doesNotMatch(content, /#F4EFEA/i, 'dossier-sidebar.tsx não deve conter #F4EFEA');
    assert.match(content, /tabular-nums/, 'dossier-sidebar.tsx deve conter tabular-nums no histograma');
  });

  test('TR-008: personal-tracking-console.tsx não deve conter hexadecimais brutos', () => {
    const content = fs.readFileSync(PERSONAL_CONSOLE_PATH, 'utf-8');
    assert.doesNotMatch(content, /#1A1820/i, 'personal-tracking-console.tsx não deve conter #1A1820');
    assert.doesNotMatch(content, /#2B2735/i, 'personal-tracking-console.tsx não deve conter #2B2735');
    assert.doesNotMatch(content, /#F4EFEA/i, 'personal-tracking-console.tsx não deve conter #F4EFEA');
  });
});

describe('US3 — Alinhamento Óptico na Weekly Strip e Relógio de Fuso Duplo', () => {
  test('TR-015: calendar-view.tsx deve usar font-serif nos títulos e tabular-nums na Weekly Strip', () => {
    const content = fs.readFileSync(CALENDAR_VIEW_PATH, 'utf-8');
    assert.match(content, /font-serif/, 'calendar-view.tsx deve utilizar font-serif');
    assert.match(content, /tabular-nums/, 'calendar-view.tsx deve conter tabular-nums na Weekly Strip');
  });

  test('TR-015: calendar-header-kpis.tsx deve usar font-serif no título e tabular-nums nos KPIs', () => {
    const content = fs.readFileSync(CALENDAR_HEADER_KPIS_PATH, 'utf-8');
    assert.match(content, /font-serif/, 'calendar-header-kpis.tsx deve conter font-serif no título');
    assert.match(content, /tabular-nums/, 'calendar-header-kpis.tsx deve conter tabular-nums');
  });

  test('TR-016: calendar-sidebar-widgets.tsx deve conter tabular-nums no relógio de fuso duplo', () => {
    const content = fs.readFileSync(CALENDAR_SIDEBAR_PATH, 'utf-8');
    assert.match(
      content,
      /tabular-nums/,
      'calendar-sidebar-widgets.tsx deve usar tabular-nums nos fusos de transmissão'
    );
  });
});

