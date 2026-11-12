/**
 * YuukiList — Suíte de Testes TDD: Ledger Library & Consumption Cadence
 * Fatia: 024-ledger-library-and-cadence (R24)
 * Requisitos: Personal Library View and Layout Toggle, Quick Progress Tracking,
 * Library Filtering and Asynchronous States, Consumption Cadence and Activity Sparkline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const WEB_COMPONENTS_DIR = path.resolve('apps/web/src/components/library');

describe('024-ledger-library-and-cadence — Suíte de Validação', () => {

  describe('US1 & TR-006, TR-017: KPIs do Ledger e Busca Local Instantânea', () => {
    test('TR-006: calculateLedgerKpis deve computar concluidos, em andamento e horas totais com precisao', async () => {
      const { calculateLedgerKpis } = await import('../apps/web/src/components/library/ledger-helpers.ts');

      const mockItems = [
        {
          id: 'item-1',
          mediaItemId: 'media-1',
          status: 'ASSISTINDO',
          progress: 10, // 10 episódios * 24 min = 240 min = 4h
          mediaItem: { category: 'ANIME', totalEpisodes: 24, title: 'Anime 1' }
        },
        {
          id: 'item-2',
          mediaItemId: 'media-2',
          status: 'LENDO',
          progress: 30, // 30 capítulos * 10 min = 300 min = 5h
          mediaItem: { category: 'MANGA', totalChapters: 100, title: 'Manga 1' }
        },
        {
          id: 'item-3',
          mediaItemId: 'media-3',
          status: 'CONCLUIDO',
          progress: 16, // 16 eps * 24 min = 384 min = 6.4h
          mediaItem: { category: 'DORAMA', totalEpisodes: 16, title: 'Dorama 1' }
        },
        {
          id: 'item-4',
          mediaItemId: 'media-4',
          status: 'QUERO_ASSISTIR',
          progress: 0,
          mediaItem: { category: 'ANIME', totalEpisodes: 12, title: 'Anime 2' }
        }
      ];

      const kpis = calculateLedgerKpis(mockItems);
      assert.equal(kpis.completedCount, 1, 'Deve contabilizar 1 concluído');
      assert.equal(kpis.inProgressCount, 2, 'Deve contabilizar 2 em andamento');
      // 240 + 300 + 384 = 924 min / 60 = 15.4h -> 15h
      assert.equal(kpis.totalHours, 15, 'Deve totalizar 15 horas consumidas');
      assert.ok(kpis.syncTimestampText, 'Deve conter texto de sincronização');
    });

    test('TR-017: filterLibraryLocal deve filtrar itens por titulo de forma insensivel a maiusculas e acentos', async () => {
      const { filterLibraryLocal } = await import('../apps/web/src/components/library/ledger-helpers.ts');

      const mockItems = [
        { id: '1', mediaItem: { title: 'Attack on Titan', originalTitle: 'Shingeki no Kyojin' } },
        { id: '2', mediaItem: { title: 'Frieren: Beyond Journey\'s End', originalTitle: 'Sousou no Frieren' } },
        { id: '3', mediaItem: { title: 'Rainha das Lágrimas', originalTitle: 'Queen of Tears' } }
      ];

      const result1 = filterLibraryLocal(mockItems, 'titan');
      assert.equal(result1.length, 1);
      assert.equal(result1[0].id, '1');

      const result2 = filterLibraryLocal(mockItems, 'sousou');
      assert.equal(result2.length, 1);
      assert.equal(result2[0].id, '2');

      const result3 = filterLibraryLocal(mockItems, 'lagrimas');
      assert.equal(result3.length, 1);
      assert.equal(result3[0].id, '3');
    });

    test('TR-006: ledger-header.tsx deve conter os 3 cards de KPI e botao Adicionar Obra', () => {
      const headerPath = path.join(WEB_COMPONENTS_DIR, 'ledger-header.tsx');
      assert.ok(fs.existsSync(headerPath), 'ledger-header.tsx deve existir');
      const content = fs.readFileSync(headerPath, 'utf-8');
      assert.ok(content.includes('Sua Biblioteca') || content.includes('LEDGER PESSOAL V2.4'), 'Deve exibir cabeçalho editorial');
      assert.ok(content.includes('Concluídos') || content.includes('Concluidos'), 'Deve exibir KPI Concluídos');
      assert.ok(content.includes('Em Andamento'), 'Deve exibir KPI Em Andamento');
      assert.ok(content.includes('Tempo Total'), 'Deve exibir KPI Tempo Total');
      assert.ok(content.includes('Adicionar Obra'), 'Deve exibir botão Adicionar Obra');
    });
  });

  describe('US2 & TR-011, TR-012: Popover de Nota Rápida e Ações nos Cards', () => {
    test('TR-012: quick-rating-popover.tsx deve oferecer notas de 1 a 10 com persistência imediata', () => {
      const popoverPath = path.join(WEB_COMPONENTS_DIR, 'quick-rating-popover.tsx');
      assert.ok(fs.existsSync(popoverPath), 'quick-rating-popover.tsx deve existir');
      const content = fs.readFileSync(popoverPath, 'utf-8');
      assert.ok(content.includes('10'), 'Deve suportar escala até 10');
      assert.ok(content.includes('onSelectRating') || content.includes('onChangeRating'), 'Deve emitir callback de seleção');
    });

    test('TR-011: library-card.tsx deve integrar botao de avaliacao rapida e atalho de diario com alvo 44x44px', () => {
      const cardPath = path.join(WEB_COMPONENTS_DIR, 'library-card.tsx');
      assert.ok(fs.existsSync(cardPath), 'library-card.tsx deve existir');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('QuickRatingPopover') || content.includes('onRatingChange') || content.includes('quick-rating'), 'Deve conter integração com avaliação rápida');
      assert.ok(content.includes('min-h-[44px]') || content.includes('min-w-[44px]'), 'Deve manter alvo acessível de 44x44px');
    });
  });

  describe('US3 & TR-007, TR-018, TR-019: Card Pontilhado, Cadência de Consumo e CSV', () => {
    test('TR-007: dashed-register-card.tsx deve renderizar card com borda tracejada e link para /explore', () => {
      const dashedCardPath = path.join(WEB_COMPONENTS_DIR, 'dashed-register-card.tsx');
      assert.ok(fs.existsSync(dashedCardPath), 'dashed-register-card.tsx deve existir');
      const content = fs.readFileSync(dashedCardPath, 'utf-8');
      assert.ok(content.includes('border-dashed'), 'Deve conter borda tracejada');
      assert.ok(content.includes('Registrar Nova Obra'), 'Deve exibir título de registro');
      assert.ok(content.includes('Pesquisa Global'), 'Deve conter botão de Pesquisa Global');
      assert.ok(content.includes('/explore'), 'Deve redirecionar para /explore');
    });

    test('TR-018: calculateCadenceMetrics deve agregar consumo de 30 dias e gerar pontos para sparkline', async () => {
      const { calculateCadenceMetrics } = await import('../apps/web/src/components/library/ledger-helpers.ts');

      const now = new Date();
      const mockDiary = [
        {
          id: 'd1',
          mediaItemId: 'm1',
          type: 'PROGRESS',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          delta: 2,
          mediaItem: { category: 'ANIME' }
        },
        {
          id: 'd2',
          mediaItemId: 'm2',
          type: 'PROGRESS',
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          delta: 5,
          mediaItem: { category: 'MANGA' }
        }
      ];

      const cadence = calculateCadenceMetrics([], mockDiary);
      assert.ok(cadence.dailyPoints.length === 30, 'Deve gerar exatamente 30 pontos diários');
      assert.equal(cadence.totalEpisodes30Days, 2, 'Deve contabilizar 2 episódios');
      assert.equal(cadence.totalChapters30Days, 5, 'Deve contabilizar 5 capítulos');
      assert.ok(cadence.dailyAverage >= 0, 'Média diária deve ser calculada');
    });

    test('TR-018: consumption-cadence-banner.tsx deve renderizar sparkline SVG e estatisticas de 30 dias', () => {
      const bannerPath = path.join(WEB_COMPONENTS_DIR, 'consumption-cadence-banner.tsx');
      assert.ok(fs.existsSync(bannerPath), 'consumption-cadence-banner.tsx deve existir');
      const content = fs.readFileSync(bannerPath, 'utf-8');
      assert.ok(content.includes('Cadência de Consumo') || content.includes('Cadencia de Consumo'), 'Deve exibir título de cadência');
      assert.ok(content.includes('MÉDIA DIÁRIA') || content.includes('Media Diaria') || content.includes('Média Diária'), 'Deve exibir média diária');
      assert.ok(content.includes('<svg') && content.includes('<path'), 'Deve renderizar curva em SVG');
      assert.ok(content.includes('Exportar CSV') || content.includes('Exportar'), 'Deve conter botão de exportação CSV');
    });

    test('TR-019: generateLibraryCsv deve formatar dados do acervo com cabecalho e codificacao UTF-8', async () => {
      const { generateLibraryCsv } = await import('../apps/web/src/components/library/ledger-helpers.ts');

      const mockItems = [
        {
          id: 'item-1',
          mediaItemId: 'media-1',
          status: 'ASSISTINDO',
          progress: 8,
          rating: 9.5,
          isFavorite: true,
          updatedAt: '2026-11-10T10:00:00.000Z',
          mediaItem: {
            title: 'Demon Slayer',
            originalTitle: 'Kimetsu no Yaiba',
            category: 'ANIME',
            totalEpisodes: 26
          }
        }
      ];

      const csv = generateLibraryCsv(mockItems);
      assert.ok(csv.startsWith('\uFEFF'), 'Deve conter BOM UTF-8');
      assert.ok(csv.includes('Título') || csv.includes('Titulo'), 'Deve conter cabeçalho');
      assert.ok(csv.includes('Demon Slayer'), 'Deve conter título da obra');
      assert.ok(csv.includes('Kimetsu no Yaiba'), 'Deve conter título original');
      assert.ok(csv.includes('ASSISTINDO'), 'Deve conter status');
    });
  });
});

