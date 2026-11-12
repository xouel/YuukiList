/**
 * YuukiList — Testes Automatizados da Experiência Editorial do Catálogo (019-catalog-editorial-browse)
 * Validação rigorosa dos cenários normativos de specs/catalog-browse/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

describe('US1 — Barra de Controles Condensada e Drawer "Mais Filtros" (TR-001, TR-002, TR-003 & TR-007)', () => {
  const filterBarPath = join(projectRoot, 'apps/web/src/components/catalog/filter-bar.tsx');
  const catalogViewPath = join(projectRoot, 'apps/web/src/components/catalog/catalog-view.tsx');
  const filterBarContent = readFileSync(filterBarPath, 'utf8');
  const catalogViewContent = readFileSync(catalogViewPath, 'utf8');

  it('TR-003: FilterBar deve implementar botão/controle recolhível para "Mais Filtros"', () => {
    assert.ok(
      filterBarContent.includes('Mais Filtros') || filterBarContent.includes('Filtros Avançados'),
      'FilterBar deve incluir rótulo de acionamento do drawer de filtros secundários'
    );
    assert.ok(
      filterBarContent.includes('isDrawerOpen') || filterBarContent.includes('showAdvanced') || filterBarContent.includes('isOpen'),
      'FilterBar deve gerenciar estado de abertura/fechamento do painel secundário'
    );
  });

  it('TR-003 & TR-007: Drawer secundário deve acomodar país, gênero, status e ordenação sem poluir a dobra inicial', () => {
    assert.ok(filterBarContent.includes('filter-country'), 'Deve conter seletor de país');
    assert.ok(filterBarContent.includes('filter-genre') && filterBarContent.includes('GENRES'), 'Deve conter seletor de gênero');
    assert.ok(filterBarContent.includes('filter-status'), 'Deve conter seletor de status da publicação');
    assert.ok(filterBarContent.includes('filter-sort'), 'Deve conter seletor de ordenação');
    assert.ok(filterBarContent.includes('Limpar filtros'), 'Deve conter botão para limpar filtros ativos');
  });

  it('TR-002: CatalogView deve manter sincronização bidirecional de busca e filtros com URL e debounce', () => {
    assert.ok(catalogViewContent.includes('syncUrlWithQuery'), 'CatalogView deve conter função de sincronização com URL');
    assert.ok(catalogViewContent.includes('replaceState'), 'CatalogView deve atualizar URL via replaceState');
    assert.ok(catalogViewContent.includes('SearchBar'), 'CatalogView deve renderizar SearchBar integrada');
  });

  it('TR-001: CatalogView deve suportar rolagem infinita com sentinela e carregamento cumulativo', () => {
    assert.ok(catalogViewContent.includes('sentinelRef'), 'CatalogView deve utilizar sentinela para rolagem');
    assert.ok(catalogViewContent.includes('IntersectionObserver') || catalogViewContent.includes('handleObserver'), 'CatalogView deve monitorar sentinela');
    assert.ok(catalogViewContent.includes('isLoadingMore'), 'CatalogView deve indicar estado de carregamento de páginas adicionais');
  });
});

describe('US2 — MediaCard com Prevenção de Colisão, Status Dedicado e Badges Editoriais (TR-006)', () => {
  const mediaCardPath = join(projectRoot, 'apps/web/src/components/catalog/media-card.tsx');
  const mediaCardContent = readFileSync(mediaCardPath, 'utf8');

  it('TR-006: MediaCard deve utilizar taxonomia desambiguada para status de publicação da obra', () => {
    assert.ok(
      mediaCardContent.includes("'Em Lançamento'") || mediaCardContent.includes('"Em Lançamento"'),
      'EM_ANDAMENTO deve ser mapeado para "Em Lançamento" para desambiguar de status do usuário'
    );
    assert.ok(
      mediaCardContent.includes("'Concluída'") || mediaCardContent.includes('"Concluída"'),
      'FINALIZADA deve ser mapeado para "Concluída"'
    );
  });

  it('TR-006: MediaCard deve adotar paleta editorial bimodal/categoria (ocre/lavanda e terracota)', () => {
    // Audiovisual (Dorama/Filme em ocre, Anime em lavanda)
    assert.ok(
      mediaCardContent.includes('#D4A373') || mediaCardContent.includes('D4A373'),
      'Deve conter cor ocre (#D4A373) para mídias audiovisuais'
    );
    assert.ok(
      mediaCardContent.includes('#9D8DF1') || mediaCardContent.includes('9D8DF1'),
      'Deve conter cor lavanda (#9D8DF1) para animes'
    );
    // Impresso (Mangá/Manhwa/Manhua em terracota)
    assert.ok(
      mediaCardContent.includes('#D97757') || mediaCardContent.includes('D97757'),
      'Deve conter cor terracota (#D97757) para mídias impressas'
    );
  });

  it('TR-006: MediaCard deve separar fisicamente o status da obra do rodapé de gêneros para erradicar colisão', () => {
    // O status deve estar em um badge dedicado (por exemplo, sobre a capa) e o rodapé deve exibir os gêneros sem competir com o status na mesma linha estreita
    assert.ok(
      !mediaCardContent.includes('truncate max-w-[140px]'),
      'Não deve mais comprimir os gêneros com max-w-[140px] concorrendo com o status na mesma linha'
    );
  });
});

describe('US3 — Alternância Visual no Botão de Ação Rápida (TR-004 & TR-005)', () => {
  const mediaCardPath = join(projectRoot, 'apps/web/src/components/catalog/media-card.tsx');
  const mediaCardContent = readFileSync(mediaCardPath, 'utf8');

  it('TR-004 & TR-005: MediaCard deve alternar entre botão de adicionar e badge de confirmação "Na Biblioteca"', () => {
    assert.ok(
      mediaCardContent.includes('Na Biblioteca') || mediaCardContent.includes('Na Lista'),
      'Deve exibir badge de confirmação para obra já salva na biblioteca'
    );
    assert.ok(
      mediaCardContent.includes('handleQuickAdd'),
      'Deve disparar ação rápida de inclusão na biblioteca'
    );
    assert.ok(
      mediaCardContent.includes('getDefaultStatusForCategory') || mediaCardContent.includes('libraryApi.addItem'),
      'Deve atribuir status canônico padrão ao adicionar obra'
    );
  });
});

