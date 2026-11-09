/**
 * YuukiList — Testes Automatizados de Catálogo e Busca (Slice R2: 002-catalog-search-api)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/catalog-search/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CatalogRepository,
  CatalogService,
  CatalogController,
  CatalogNotFoundError,
  calculateTrigramSimilarity,
} from '../apps/api/src/index.ts';

describe('US1 — Listagem e Filtragem Combinada do Catálogo (TR-001 & TR-002)', () => {
  const repository = new CatalogRepository();
  const service = new CatalogService(repository);
  const controller = new CatalogController(service);

  it('TR-001: deve listar catálogo com paginação padrão (page 1, limit 20) ordenada por título A-Z', async () => {
    const result = await controller.list({});

    assert.ok(result);
    assert.ok(Array.isArray(result.data));
    assert.equal(result.data.length, 20, 'Deve retornar os primeiros 20 itens por padrão');
    assert.deepEqual(result.meta, {
      total: 30,
      page: 1,
      limit: 20,
      totalPages: 2,
    });

    // Valida ordenação alfabética ascendente por título
    for (let i = 0; i < result.data.length - 1; i++) {
      const current = result.data[i].title.localeCompare(result.data[i + 1].title, 'pt-BR');
      assert.ok(current <= 0, `Itens devem estar em ordem alfabética: "${result.data[i].title}" <= "${result.data[i + 1].title}"`);
    }

    // Valida campos do DTO de resumo
    const first = result.data[0];
    assert.ok(first.id, 'Deve conter id');
    assert.ok(first.slug, 'Deve conter slug');
    assert.ok(first.title, 'Deve conter título');
    assert.ok(first.category, 'Deve conter categoria');
    assert.ok(first.publicationStatus, 'Deve conter status de publicação');
    assert.ok(first.coverUrl.startsWith('/api/v1/catalog/items/'), 'coverUrl deve apontar para o endpoint de capa');
    assert.ok(Array.isArray(first.genres), 'genres deve ser um array');
  });

  it('TR-001: deve respeitar parâmetros customizados de paginação (page 2, limit 10)', async () => {
    const result = await controller.list({ page: 2, limit: 10 });

    assert.equal(result.data.length, 10);
    assert.deepEqual(result.meta, {
      total: 30,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('TR-002: deve filtrar itens por categoria única (ex.: DORAMA)', async () => {
    const result = await controller.list({ category: 'DORAMA', limit: 50 });

    assert.equal(result.meta.total, 5, 'Seed contém exatamente 5 doramas');
    assert.equal(result.data.length, 5);
    for (const item of result.data) {
      assert.equal(item.category, 'DORAMA');
    }
  });

  it('TR-002: deve combinar filtros de categoria e status de publicação com lógica AND', async () => {
    const result = await controller.list({
      category: 'DORAMA',
      status: 'FINALIZADA',
    });

    assert.equal(result.meta.total, 1, 'Seed contém exatamente 1 dorama com status FINALIZADA');
    assert.equal(result.data.length, 1);
    assert.equal(result.data[0].category, 'DORAMA');
    assert.equal(result.data[0].publicationStatus, 'FINALIZADA');
  });

  it('TR-002: deve filtrar por gênero e manter compatibilidade com filtros combinados', async () => {
    const allDrama = await controller.list({ genre: 'Drama', limit: 50 });
    assert.ok(allDrama.meta.total > 0, 'Deve encontrar obras com gênero Drama');
    for (const item of allDrama.data) {
      assert.ok(item.genres.some((g) => g.toLowerCase() === 'drama'), 'Item deve conter o gênero Drama');
    }
  });

  it('TR-002: deve retornar data vazio quando a combinação de filtros não tiver correspondências', async () => {
    const result = await controller.list({
      category: 'MANGA',
      genre: 'GeneroInexistenteTotalmenteFicticio',
    });

    assert.equal(result.meta.total, 0);
    assert.equal(result.data.length, 0);
    assert.equal(result.meta.totalPages, 0);
  });
});

describe('US2 — Busca Inteligente Tolerante a Erros de Digitação (TR-003 & TR-004)', () => {
  const repository = new CatalogRepository();
  const service = new CatalogService(repository);
  const controller = new CatalogController(service);

  it('TR-003: algoritmo calculateTrigramSimilarity deve calcular similaridade de trigramas', () => {
    const simExact = calculateTrigramSimilarity('parasita', 'parasita');
    assert.equal(simExact, 1.0);

    const simTypo = calculateTrigramSimilarity('parasita', 'parazita');
    assert.ok(simTypo >= 0.5, `Similaridade com 1 letra trocada deve ser alta: ${simTypo}`);

    const simDifferent = calculateTrigramSimilarity('parasita', 'berserk');
    assert.ok(simDifferent < 0.2, `Similaridade com texto diferente deve ser baixa: ${simDifferent}`);
  });

  it('TR-003: deve encontrar obra com termo de busca exato e ranquear no topo', async () => {
    const result = await controller.list({ q: 'Parasita' });

    assert.ok(result.data.length > 0);
    assert.equal(result.data[0].slug, 'parasita', 'Correspondência exata deve ser a primeira');
  });

  it('TR-003: deve encontrar obra tolerando pequenas variações e erros de digitação (similaridade >= 0.35)', async () => {
    // Busca com typo "parazita" em vez de "parasita"
    const result = await controller.list({ q: 'parazita' });

    assert.ok(result.data.length > 0, 'Deve encontrar resultados com erro de digitação');
    assert.equal(result.data[0].slug, 'parasita', 'Parasita deve vir em primeiro lugar para "parazita"');
  });

  it('TR-003: deve encontrar obra por prefixo ou termo parcial (ex.: "solo level")', async () => {
    const result = await controller.list({ q: 'solo level' });

    assert.ok(result.data.length > 0);
    assert.equal(result.data[0].slug, 'solo-leveling-ragnarok');
  });

  it('TR-003: deve encontrar obra através de aliases cadastrados (ex.: "CLOY")', async () => {
    const result = await controller.list({ q: 'CLOY' });

    assert.ok(result.data.length > 0);
    assert.equal(result.data[0].slug, 'pousando-no-amor', 'Alias CLOY deve resolver para Pousando no Amor');
  });

  it('TR-003: deve retornar lista vazia se nenhum item atingir o limiar mínimo de similaridade (0.35)', async () => {
    const result = await controller.list({ q: 'xyzqwk999totalmentealeatorio' });

    assert.equal(result.meta.total, 0);
    assert.equal(result.data.length, 0);
  });

  it('TR-004: deve respeitar parâmetro sortBy=title reordenando alfabeticamente os resultados da busca', async () => {
    // Busca ampla por letra "a" que retorna vários itens
    const resultRelevance = await controller.list({ q: 'a' });
    const resultTitle = await controller.list({ q: 'a', sortBy: 'title' });

    assert.ok(resultTitle.data.length > 1);

    // Valida que com sortBy=title está rigorosamente alfabético
    for (let i = 0; i < resultTitle.data.length - 1; i++) {
      const cmp = resultTitle.data[i].title.localeCompare(resultTitle.data[i + 1].title, 'pt-BR');
      assert.ok(cmp <= 0, `Em sortBy=title os resultados devem estar alfabéticos: "${resultTitle.data[i].title}" <= "${resultTitle.data[i + 1].title}"`);
    }
  });
});

describe('US3 — Detalhes da Obra e Servidor de Capa SVG (TR-005, TR-006 & TR-007)', () => {
  const repository = new CatalogRepository();
  const service = new CatalogService(repository);
  const controller = new CatalogController(service);

  it('TR-005: deve retornar os detalhes completos de uma obra existente pelo slug', async () => {
    const item = await controller.getBySlug('parasita');

    assert.ok(item);
    assert.equal(item.slug, 'parasita');
    assert.equal(item.title, 'Parasita');
    assert.equal(item.category, 'FILME');
    assert.equal(item.publicationStatus, 'FINALIZADA');
    assert.equal(item.releaseYear, 2019);
    assert.ok(item.synopsis && item.synopsis.length > 10);
    assert.equal(item.coverUrl, '/api/v1/catalog/items/parasita/cover');
    assert.ok(Array.isArray(item.genres) && item.genres.length > 0);
    assert.ok(Array.isArray(item.aliases) && item.aliases.length > 0);
  });

  it('TR-006: deve lançar CatalogNotFoundError (status 404) para slug inexistente', async () => {
    await assert.rejects(
      async () => {
        await controller.getBySlug('obra-inexistente-xyz');
      },
      (err) => {
        assert.ok(err instanceof CatalogNotFoundError);
        assert.equal(err.statusCode, 404);
        assert.equal(err.error, 'Not Found');
        assert.ok(err.message.includes('obra-inexistente-xyz'));
        return true;
      }
    );
  });

  it('TR-007: deve servir capa SVG válida com Content-Type image/svg+xml para obra existente', () => {
    const cover = controller.getCover('parasita');

    assert.ok(cover);
    assert.equal(cover.contentType, 'image/svg+xml');
    assert.equal(cover.isFallback, false);
    assert.ok(cover.svg.includes('<svg'));
    assert.ok(cover.svg.includes('Parasita'));
  });

  it('TR-007: deve retornar SVG de fallback seguro para slug inexistente sem quebrar a aplicação', () => {
    const cover = controller.getCover('slug-inexistente-123');

    assert.ok(cover);
    assert.equal(cover.contentType, 'image/svg+xml');
    assert.equal(cover.isFallback, true);
    assert.ok(cover.svg.includes('<svg'));
  });

  it('TR-007: deve bloquear tentativas de path-traversal e retornar placeholder com segurança', () => {
    const maliciousSlugs = ['../../etc/passwd', '..\\windows\\win.ini', '/root', 'item/subitem'];

    for (const slug of maliciousSlugs) {
      const cover = controller.getCover(slug);
      assert.equal(cover.isFallback, true, `Slug malicioso '${slug}' deve resultar em fallback`);
      assert.equal(cover.contentType, 'image/svg+xml');
      assert.ok(cover.svg.includes('<svg'));
    }
  });
});
