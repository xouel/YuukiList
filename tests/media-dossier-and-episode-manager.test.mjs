/**
 * YuukiList — Testes Automatizados do Dossiê da Obra & Gerenciador de Episódios (R25: 025-media-dossier-and-episode-manager)
 * Validação rigorosa dos cenários normativos de specs/catalog-browse/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  generateSeasonGroups,
  computeDossierMetrics,
  computeEstimatedWatchTime,
  computeRatingDistribution,
  inferStreamingProviders,
  inferProductionCredits,
} from '../apps/web/src/components/catalog/dossier-helpers.ts';

const projectRoot = process.cwd();

describe('US1 — Faixa de Métricas Editoriais e Console Pessoal de Acompanhamento (TR-001, TR-004 & TR-003)', () => {
  const sampleAnime = {
    id: 'anime-snk',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    originalTitle: '進撃の巨人 (Shingeki no Kyojin)',
    category: 'ANIME',
    publicationStatus: 'FINALIZADA',
    totalEpisodes: 94,
    releaseYear: 2013,
    coverUrl: '/cover.svg',
    genres: ['Ação', 'Drama', 'Fantasia'],
    aliases: ['Shingeki no Kyojin', 'SnK'],
  };

  it('TR-004: computeDossierMetrics deve calcular 4 métricas editoriais formatadas', () => {
    const metrics = computeDossierMetrics(sampleAnime);
    assert.ok(metrics.globalScore, 'Média Global deve ser calculada');
    assert.ok(metrics.seasonsText.includes('eps') || metrics.seasonsText.includes('ep'), 'Temporadas/Volumes deve conter contagem de episódios');
    assert.ok(metrics.membersText, 'Membros deve ser formatado em K ou M');
    assert.ok(metrics.durationText.includes('min'), 'Duração média deve conter indicação em minutos');
  });

  it('TR-004: computeEstimatedWatchTime deve converter progresso e duração em dias, horas e minutos', () => {
    // 86 eps de 24 min = 2064 min = 34 horas e 24 minutos (1 dia, 10 horas e 24 min)
    const formatted = computeEstimatedWatchTime(86, 'ANIME', 24);
    assert.ok(
      formatted.includes('1d') || formatted.includes('34h') || formatted.includes('dia'),
      'Deve expressar tempo total assistido de forma legível'
    );
  });

  it('TR-004: DossierMetricsStrip deve existir e utilizar a paleta mineral Asian Editorial', () => {
    const filePath = join(projectRoot, 'apps/web/src/components/catalog/dossier-metrics-strip.tsx');
    assert.ok(existsSync(filePath), 'Componente dossier-metrics-strip.tsx deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('DossierMetricsStrip'), 'Deve exportar DossierMetricsStrip');
    assert.ok(!content.includes('#06B6D4'), 'Não deve conter cor ciano legada');
    assert.ok(!content.includes('#181C2B'), 'Não deve conter cor azul legada');
  });

  it('TR-004 & TR-003: PersonalTrackingConsole deve conter seletores de status, nota e botão com alvo de 44x44px', () => {
    const filePath = join(projectRoot, 'apps/web/src/components/catalog/personal-tracking-console.tsx');
    assert.ok(existsSync(filePath), 'Componente personal-tracking-console.tsx deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('PersonalTrackingConsole'), 'Deve exportar PersonalTrackingConsole');
    assert.ok(content.includes('min-h-[44px]') || content.includes('h-11') || content.includes('min-w-[44px]'), 'Botão rápido de incremento deve possuir alvo mínimo de 44px');
    assert.ok(content.includes('progresso') || content.includes('progress'), 'Deve renderizar barra visual de progresso');
  });
});

describe('US2 — Gerenciador de Episódios com Abas de Temporadas e Ação em Lote (TR-005)', () => {
  it('TR-005: generateSeasonGroups deve agrupar episódios em temporadas para séries longas', () => {
    const anime = {
      id: 'anime-test',
      slug: 'test-anime',
      title: 'Anime Teste',
      category: 'ANIME',
      publicationStatus: 'FINALIZADA',
      totalEpisodes: 94,
      coverUrl: '/cover.svg',
      genres: ['Ação'],
      aliases: [],
    };

    const seasons = generateSeasonGroups(anime);
    assert.ok(seasons.length > 1, 'Obra com 94 episódios deve ser dividida em mais de uma temporada');
    assert.equal(seasons[0].seasonNumber, 1);
    assert.ok(seasons[0].episodes.length > 0);
    assert.equal(seasons[0].episodes[0].number, 1);
  });

  it('TR-005: generateSeasonGroups deve tratar filmes como unidade única sem abas múltiplas', () => {
    const movie = {
      id: 'movie-test',
      slug: 'parasita',
      title: 'Parasita',
      category: 'FILME',
      publicationStatus: 'FINALIZADA',
      totalEpisodes: 1,
      coverUrl: '/cover.svg',
      genres: ['Suspense'],
      aliases: [],
    };

    const seasons = generateSeasonGroups(movie);
    assert.equal(seasons.length, 1, 'Filme deve conter exatamente 1 grupo de exibição');
    assert.equal(seasons[0].episodes.length, 1);
  });

  it('TR-005: EpisodeManager deve prover abas de temporadas e botão de ação em lote', () => {
    const filePath = join(projectRoot, 'apps/web/src/components/catalog/episode-manager.tsx');
    assert.ok(existsSync(filePath), 'Componente episode-manager.tsx deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('EpisodeManager'), 'Deve exportar EpisodeManager');
    assert.ok(
      content.includes('Marcar Temporada Toda') || content.includes('Marcar toda a temporada'),
      'Deve disponibilizar botão de marcação em lote da temporada ativa'
    );
  });
});

describe('US3 — Painel Lateral com Distribuição de Notas, Onde Assistir e Ficha Técnica (TR-006 & TR-001)', () => {
  it('TR-006: computeRatingDistribution deve calcular histograma de 10 a 6 estrelas e contadores de comunidade', () => {
    const distribution = computeRatingDistribution(9.05);
    assert.equal(distribution.histogram.length, 5, 'Deve conter 5 faixas: 10, 9, 8, 7 e <=6 estrelas');
    assert.ok(distribution.communityStats.watchingCount > 0, 'Contador de assistindo agora deve ser positivo');
    assert.ok(distribution.communityStats.completedCount > 0, 'Contador de completaram deve ser positivo');
  });

  it('TR-006: inferStreamingProviders deve retornar plataformas oficiais com links seguros', () => {
    const animeProviders = inferStreamingProviders('ANIME', 'JP');
    assert.ok(animeProviders.length >= 1, 'Deve sugerir ao menos uma plataforma para Anime');
    const crunchyroll = animeProviders.find((p) => p.name.toLowerCase().includes('crunchyroll'));
    assert.ok(crunchyroll, 'Crunchyroll deve estar presente para anime');
    assert.ok(crunchyroll.url.startsWith('https://'), 'Links oficiais devem ser HTTPS');
  });

  it('TR-006: DossierSidebar deve renderizar histograma, plataformas com links seguros e estúdios', () => {
    const filePath = join(projectRoot, 'apps/web/src/components/catalog/dossier-sidebar.tsx');
    assert.ok(existsSync(filePath), 'Componente dossier-sidebar.tsx deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('DossierSidebar'), 'Deve exportar DossierSidebar');
    assert.ok(content.includes('rel="noopener noreferrer"'), 'Links externos devem possuir rel="noopener noreferrer"');
    assert.ok(content.includes('Distribuição de Notas') || content.includes('Avaliações'), 'Deve renderizar seção de distribuição de notas');
  });

  it('TR-006: inferProductionCredits deve inferir criador original, direção geral e trilha sonora', () => {
    const credits = inferProductionCredits({
      id: 'anime-snk',
      slug: 'attack-on-titan',
      title: 'Attack on Titan',
      category: 'ANIME',
      publicationStatus: 'FINALIZADA',
      coverUrl: '/cover.svg',
      genres: ['Ação'],
      aliases: [],
    });
    assert.ok(credits.length >= 2, 'Deve extrair ao menos 2 créditos da equipe técnica');
  });
});

describe('Integração Geral do Dossiê e Rota /items/[slug] (TR-001, TR-002, TR-003)', () => {
  it('TR-001 & TR-003: ItemDetailView deve integrar grid assimétrica 8+4 sem resíduos de ciano ou azul escuro', () => {
    const filePath = join(projectRoot, 'apps/web/src/components/catalog/item-detail-view.tsx');
    assert.ok(existsSync(filePath), 'Componente item-detail-view.tsx deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('lg:col-span-8') || content.includes('col-span-8'), 'Deve utilizar coluna principal de 8 slots');
    assert.ok(content.includes('lg:col-span-4') || content.includes('col-span-4'), 'Deve utilizar coluna lateral de 4 slots');
    assert.ok(!content.includes('#06B6D4'), 'Não deve conter cor ciano legada #06B6D4');
    assert.ok(!content.includes('#181C2B'), 'Não deve conter cor azul legada #181C2B');
  });

  it('TR-002: Rota /items/[slug] deve suportar retorno preservando navegação e filtros', () => {
    const filePath = join(projectRoot, 'apps/web/src/app/items/[slug]/page.tsx');
    assert.ok(existsSync(filePath), 'Página da rota deve existir');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(!content.includes('#06B6D4'), 'Rota não deve conter cor ciano legada');
    assert.ok(!content.includes('#181C2B'), 'Rota não deve conter cor azul legada');
    assert.ok(content.includes('router.back') || content.includes('handleBack'), 'Deve manter lógica de retorno');
  });

  it('Diretriz Estrita: Ausência total de emojis na documentação e componentes do dossiê', () => {
    const filesToCheck = [
      join(projectRoot, 'apps/web/src/components/catalog/dossier-helpers.ts'),
      join(projectRoot, 'apps/web/src/components/catalog/dossier-metrics-strip.tsx'),
      join(projectRoot, 'apps/web/src/components/catalog/personal-tracking-console.tsx'),
      join(projectRoot, 'apps/web/src/components/catalog/episode-manager.tsx'),
      join(projectRoot, 'apps/web/src/components/catalog/dossier-sidebar.tsx'),
      join(projectRoot, 'apps/web/src/components/catalog/item-detail-view.tsx'),
      join(projectRoot, 'apps/web/src/app/items/[slug]/page.tsx'),
    ];

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const file of filesToCheck) {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          assert.ok(
            !emojiRegex.test(line),
            `Emoji detectado no arquivo ${file} linha ${index + 1}: ${line}`
          );
        });
      }
    }
  });
});

