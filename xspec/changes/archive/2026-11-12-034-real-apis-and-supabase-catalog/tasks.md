# Tasks: 034-real-apis-and-supabase-catalog

## 1. Setup & Database Foundation

- [x] 1.1 Criar suíte de testes TDD em `tests/real-apis-and-supabase-catalog.test.mjs` cobrindo conexão do catálogo Prisma, busca híbrida e ingestão Just-in-Time (Ref: R:Database Schema and Extension Provisioning / S:Persistencia permanente e consulta via Prisma ORM)
- [x] 1.2 Implementar `PrismaCatalogRepository` em `apps/api/src/data/prisma-catalog.repository.ts` implementando `ICatalogRepository` com suporte nativo ao Supabase PostgreSQL via Prisma (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm)
- [x] 1.3 Atualizar `apps/web/src/server/container.ts` para conectar `PrismaCatalogRepository` no `CatalogService` e `CatalogController` com fallback de ambiente (Ref: R:Database Schema and Extension Provisioning / S:Persistencia permanente e consulta via Prisma ORM)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar métodos `findMany`, `findBySlug`, `findById` e `upsertMediaItem` no `PrismaCatalogRepository` incluindo relacionamentos de gêneros e aliases (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título)
- [x] 2.2 [P] [US1] Assegurar filtragem combinada por categoria e status no `PrismaCatalogRepository` (Ref: R:Catalog Items Listing and Filtering / S:Filtragem combinada por categoria e status)
- [x] 2.3 [P] [US1] Implementar busca aproximada com similaridade trigrâmica nativa `pg_trgm` (limiar >= 0.35) e ordenação explícita no banco de dados (Ref: R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação)
- [x] 2.4 [P] [US1] Suportar ordenação explícita de resultados de busca por título e relevância (Ref: R:Intelligent Search with Trigram Similarity / S:Ordenação explícita de busca por título)
- [x] 2.5 [P] [US2] Expandir `CatalogIngestionService` em `apps/api/src/data/catalog-ingestion.service.ts` com adaptador TMDB autenticado via `TMDB_API_KEY` para doramas e filmes (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas)
- [x] 2.6 [P] [US2] Integrar adaptadores literários Kitsu e MangaUpdates para ingestão com diferenciação estrita de Mangá, Manhwa e Manhua (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua)
- [x] 2.7 [P] [US2] Criar rotina e script `scripts/seed-real-catalog.mjs` para sincronizar idempotentemente 120 obras reais consagradas (Top 20 por categoria) no Supabase (Ref: R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais)
- [x] 2.8 [P] [US2] Preservar retrocompatibilidade das obras originais do seed associando proveniência e integridade referencial com acervos existentes (Ref: R:External Catalog Ingestion Pipeline / S:Preservacao retrocompativel das obras originais do seed)
- [x] 2.9 [P] [US3] Implementar o serviço de busca federada híbrida `CatalogFederatedSearchService` consultando o banco local e agregando resultados ao vivo das APIs externas com timeout de 3s (Ref: R:Intelligent Search with Trigram Similarity / S:Busca federada com fallback para APIs externas)
- [x] 2.10 [P] [US3] Atualizar a rota `GET /api/v1/catalog/items` para orquestrar a busca híbrida e retornar lista combinada com metadados de proveniência (Ref: R:Intelligent Search with Trigram Similarity / S:Busca federada com fallback para APIs externas)
- [x] 2.11 [P] [US3] Implementar rota `POST /api/v1/catalog/items/ingest` para ingestão atômica sob demanda (*Just-in-Time*) de obras externas (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao sob demanda just in time a partir de busca externa)
- [x] 2.12 [P] [US3] Integrar barra de busca `search-bar.tsx` e visualização `catalog-view.tsx` para apresentar resultados de catálogo e acionar a ingestão ao selecionar obra externa (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao sob demanda just in time a partir de busca externa)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados com `npm test` garantindo não-regressão nos 311 testes existentes e aprovação dos novos testes (Ref: R:Database Schema and Extension Provisioning / S:Persistencia permanente e consulta via Prisma ORM)
- [x] 3.2 Executar build de produção do Next.js com `npm --prefix apps/web run build` confirmando compilação de todas as rotas de catálogo e APIs (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título)
- [x] 3.3 Atualizar a Traceability Matrix com caminhos reais de código, testes e atestados de execução (Ref: R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Database Schema and Extension Provisioning | S:Migração inicial e extensão pg_trgm | 1.2 | apps/api/src/data/prisma-catalog.repository.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Database Schema and Extension Provisioning | S:Persistencia permanente e consulta via Prisma ORM | 1.1, 1.3, 3.1 | apps/api/src/data/prisma-catalog.repository.ts, apps/web/src/server/container.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Deterministic Seed Population | S:Execucao idempotente da carga ampliada de obras reais | 2.7, 3.3 | scripts/seed-real-catalog.mjs | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:External Catalog Ingestion Pipeline | S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas | 2.5 | apps/api/src/external/tmdb.client.ts, apps/api/src/data/catalog-ingestion.service.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:External Catalog Ingestion Pipeline | S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua | 2.6 | apps/api/src/external/kitsu.client.ts, apps/api/src/external/mangaupdates.client.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:External Catalog Ingestion Pipeline | S:Preservacao retrocompativel das obras originais do seed | 2.8 | apps/api/src/data/catalog-ingestion.service.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:External Catalog Ingestion Pipeline | S:Ingestao sob demanda just in time a partir de busca externa | 2.11, 2.12 | apps/web/src/app/api/v1/catalog/items/ingest/route.ts, apps/web/src/components/catalog/catalog-view.tsx | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Catalog Items Listing and Filtering | S:Listagem paginada com ordenação padrão por título | 2.1, 3.2 | apps/api/src/data/prisma-catalog.repository.ts, apps/web/src/app/api/v1/catalog/items/route.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Catalog Items Listing and Filtering | S:Filtragem combinada por categoria e status | 2.2 | apps/api/src/data/prisma-catalog.repository.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Intelligent Search with Trigram Similarity | S:Busca aproximada tolerante a pequenos erros de digitação | 2.3 | apps/api/src/data/prisma-catalog.repository.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Intelligent Search with Trigram Similarity | S:Ordenação explícita de busca por título | 2.4 | apps/api/src/data/prisma-catalog.repository.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Intelligent Search with Trigram Similarity | S:Busca federada com fallback para APIs externas | 2.9, 2.10 | apps/api/src/catalog/catalog-federated-search.service.ts, apps/web/src/app/api/v1/catalog/items/route.ts | tests/real-apis-and-supabase-catalog.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm | 1.2 | COVERED |
| R:Database Schema and Extension Provisioning / S:Persistencia permanente e consulta via Prisma ORM | 1.1, 1.3, 3.1 | COVERED |
| R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais | 2.7, 3.3 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas | 2.5 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua | 2.6 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Preservacao retrocompativel das obras originais do seed | 2.8 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Ingestao sob demanda just in time a partir de busca externa | 2.11, 2.12 | COVERED |
| R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título | 2.1, 3.2 | COVERED |
| R:Catalog Items Listing and Filtering / S:Filtragem combinada por categoria e status | 2.2 | COVERED |
| R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação | 2.3 | COVERED |
| R:Intelligent Search with Trigram Similarity / S:Ordenação explícita de busca por título | 2.4 | COVERED |
| R:Intelligent Search with Trigram Similarity / S:Busca federada com fallback para APIs externas | 2.9, 2.10 | COVERED |

- **Constitution Check:** PASS (zero emojis, tipagem TypeScript estrita, conformidade com soberania de IDs e custo permanente R$ 0).
- **Active Change Conflicts:** Nenhum conflito detectado (mudança 034 é a única ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência remanescente após Clarification Gate (carga de 120 obras e busca federada alinhadas).
- **Coverage Summary:** 100% dos 12 cenários normativos cobertos por tarefas acionáveis e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
