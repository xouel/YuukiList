/**
 * YuukiList — Testes Automatizados da Experiência Tátil da Biblioteca (020-tactile-personal-library)
 * Validação rigorosa dos cenários normativos de specs/personal-library-ui/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  STATUS_TABS,
  formatProgressDisplay,
} from '../apps/web/src/components/library/library-helpers.ts';

const projectRoot = process.cwd();

describe('US1 — Abas Inteligentes em Pílula e Integração ao Container Global (TR-001, TR-004 & TR-012)', () => {
  const libraryViewPath = join(projectRoot, 'apps/web/src/components/library/library-view.tsx');
  const libraryFiltersPath = join(projectRoot, 'apps/web/src/components/library/library-filters.tsx');
  const libraryViewContent = readFileSync(libraryViewPath, 'utf8');
  const libraryFiltersContent = readFileSync(libraryFiltersPath, 'utf8');

  it('TR-012: STATUS_TABS deve desambiguar status do usuário utilizando "Assistindo / Lendo"', () => {
    const watchingTab = STATUS_TABS.find((t) => t.key === 'WATCHING_READING');
    assert.ok(watchingTab, 'Aba WATCHING_READING deve existir');
    assert.equal(
      watchingTab.label,
      'Assistindo / Lendo',
      'Rótulo da aba deve ser "Assistindo / Lendo" para desambiguar de status de publicação da obra'
    );
  });

  it('TR-012: LibraryFilters deve renderizar abas em estilo pílula sutil com contadores e categorias no plural', () => {
    assert.ok(
      libraryFiltersContent.includes('Doramas') && libraryFiltersContent.includes('Animes') && libraryFiltersContent.includes('Mangás'),
      'Categorias nos filtros da biblioteca devem estar unificadas no plural'
    );
    assert.ok(
      libraryFiltersContent.includes('rounded-full') || libraryFiltersContent.includes('rounded-lg'),
      'Abas e contadores devem possuir estilo pílula arredondado'
    );
  });

  it('TR-001 & TR-004: LibraryView deve remover fundo recortado dissonante e integrar à paleta Asian Editorial', () => {
    assert.ok(
      !libraryViewContent.includes('border-dashed border-[#262C3F] rounded-2xl bg-[#121520]/50'),
      'Não deve conter painel recortado com bordas tracejadas dissonantes'
    );
  });
});

describe('US2 — Controle Tátil de Progresso com Barra Visual e Alvo 44px (TR-008)', () => {
  const libraryCardPath = join(projectRoot, 'apps/web/src/components/library/library-card.tsx');
  const libraryCardContent = readFileSync(libraryCardPath, 'utf8');

  it('TR-008: formatProgressDisplay deve formatar progresso relativo "Ep. X/Y" quando totalUnits for conhecido', () => {
    const formattedEpisodes = formatProgressDisplay(8, 16, 'DORAMA');
    assert.equal(formattedEpisodes, 'Ep. 8/16');

    const formattedChapters = formatProgressDisplay(45, 120, 'MANGA');
    assert.equal(formattedChapters, 'Cap. 45/120');

    const formattedIndeterminate = formatProgressDisplay(12, null, 'ANIME');
    assert.equal(formattedIndeterminate, 'Ep. 12');
  });

  it('TR-008: LibraryCard deve incluir barra visual proporcional de progresso', () => {
    assert.ok(
      libraryCardContent.includes('width:') || libraryCardContent.includes('progressPercentage') || libraryCardContent.includes('Math.round'),
      'LibraryCard deve calcular largura percentual para barra de progresso'
    );
    assert.ok(
      libraryCardContent.includes('h-1.5') || libraryCardContent.includes('h-1') || libraryCardContent.includes('rounded-full'),
      'LibraryCard deve renderizar barra visual de progresso'
    );
  });

  it('TR-008: Botão de incremento rápido deve possuir alvo tátil mínimo de 44x44px (WCAG 2.2 AA)', () => {
    assert.ok(
      libraryCardContent.includes('min-w-[44px]') && libraryCardContent.includes('min-h-[44px]'),
      'Botão de avanço rápido deve ter dimensões mínimas de 44x44px'
    );
  });
});

describe('US3 — Selos de Status Desambiguados e Reposicionados no Card (TR-004, TR-005, TR-006 & TR-007)', () => {
  const libraryCardPath = join(projectRoot, 'apps/web/src/components/library/library-card.tsx');
  const libraryCardContent = readFileSync(libraryCardPath, 'utf8');

  it('TR-004: LibraryCard deve posicionar o selo de status pessoal no topo do card', () => {
    assert.ok(
      libraryCardContent.includes('absolute top-2.5') || libraryCardContent.includes('absolute top-3'),
      'Selo de status pessoal deve ser renderizado no topo do card'
    );
    assert.ok(
      !libraryCardContent.includes('Badge de Status Pessoal Sobreposto na Base da Capa'),
      'Selo de status pessoal não deve mais residir na base da capa'
    );
  });

  it('TR-004: LibraryCard deve adotar paleta editorial bimodal/categoria', () => {
    assert.ok(
      libraryCardContent.includes('#D4A373') || libraryCardContent.includes('D4A373'),
      'Deve incluir cor ocre (#D4A373) para audiovisual'
    );
    assert.ok(
      libraryCardContent.includes('#9D8DF1') || libraryCardContent.includes('9D8DF1'),
      'Deve incluir cor lavanda (#9D8DF1) para animes'
    );
    assert.ok(
      libraryCardContent.includes('#D97757') || libraryCardContent.includes('D97757'),
      'Deve incluir cor terracota (#D97757) para mídias impressas'
    );
  });
});

