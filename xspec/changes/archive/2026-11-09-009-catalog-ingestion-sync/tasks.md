# Tasks: 009-catalog-ingestion-sync

## 1. Setup & Foundational

- [x] 1.1 [P] Definir tipos `FieldProvenance` e `MediaItemProvenance` em `packages/shared/src/external.ts` e estender `MediaItemDetailDto` em `packages/shared/src/catalog.ts` (Ref: R:Field-Level Data Provenance Tracking / S:Armazenamento estruturado de proveniencia na criacao da obra)
- [x] 1.2 [P] Atualizar schema Prisma com campo `provenance Json?` no modelo `MediaItem` e criar script de migração DDL idempotente em `apps/api/prisma/migrations/20261109020000_add_media_item_provenance/migration.sql` (Ref: R:Field-Level Data Provenance Tracking / S:Armazenamento estruturado de proveniencia na criacao da obra)
- [x] 1.3 Criar suíte de testes automatizados `tests/catalog-ingestion-sync.test.mjs` com asserções para todos os 9 cenários normativos antes da implementação (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar gerador dinâmico de capas vetoriais `SvgCoverService` em `apps/api/src/data/svg-cover.service.ts` com paleta Dark Editorial por categoria e proporção 2:3 (Ref: R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Geracao automatica de capa SVG vetorial para nova obra ingerida)
- [x] 2.2 [P] [US1] Atualizar `CoverStorageService` para delegar ao `SvgCoverService` na ausência de arquivo físico, servindo com cabeçalho `image/svg+xml` sem redirecionamento externo (Ref: R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Servimento de capa local com headers corretos e sem hotlinking)
- [x] 2.3 [US1] Implementar orquestrador de ingestão em `apps/api/src/data/catalog-ingestion.service.ts` integrando clientes TMDB e TVmaze para doramas e filmes com contagem de episódios e temporadas (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas)
- [x] 2.4 [US1] Implementar mapeamento literário no `CatalogIngestionService` utilizando Kitsu e MangaUpdates para categorização canônica MANGA, MANHWA e MANHUA com total de capítulos (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua)
- [x] 2.5 [US1] Implementar normalização com preservação dos 30 itens originais do seed sob a proveniência `SEED_CANONICAL`, mantendo integridade com `UserLibraryItem` (Ref: R:External Catalog Ingestion Pipeline / S:Preservacao retrocompativel das obras originais do seed)
- [x] 2.6 [US2] Implementar gravação estruturada de proveniência por campo (`title`, `synopsis`, `releaseYear`, `originCountry`, `category`, `units`) na persistência do `MediaItem` (Ref: R:Field-Level Data Provenance Tracking / S:Armazenamento estruturado de proveniencia na criacao da obra)
- [x] 2.7 [US2] Estender `CatalogRepository` e `CatalogService` para expor o objeto de proveniência na consulta detalhada de obras por slug e ID (Ref: R:Field-Level Data Provenance Tracking / S:Consulta e auditoria de proveniencia de metadados)
- [x] 2.8 [US2] Implementar estratégia de mesclagem multicanal no `CatalogIngestionService` permitindo enriquecer campos de fontes secundárias registrando proveniência granular (Ref: R:Field-Level Data Provenance Tracking / S:Atualizacao e rastreamento de fonte primária e secundaria)
- [x] 2.9 [US3] Atualizar `CatalogRepository` para indexar obras ingeridas e validar buscas textuais parciais e com tolerância a digitação via `pg_trgm` com similaridade mínima 0.35 (Ref: R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Sincronizacao de cache local no PostgreSQL com indexacao para busca trigram)

## 3. Validation & Integration

- [x] 3.1 Criar script executável `scripts/sync-catalog.mjs` com flags `--sample`, `--category` e `--all` para sincronização sob demanda do catálogo e registro de logs auditáveis (Ref: R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas)
- [x] 3.2 Executar validação integrada ponta a ponta com `tests/catalog-ingestion-sync.test.mjs` e checar regressão de todas as suítes de teste do monorepo (Ref: R:External Catalog Ingestion Pipeline / S:Preservacao retrocompativel das obras originais do seed)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:External Catalog Ingestion Pipeline | S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas | 1.3, 2.3, 3.1 | apps/api/src/data/catalog-ingestion.service.ts, scripts/sync-catalog.mjs | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:External Catalog Ingestion Pipeline | S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua | 1.3, 2.4 | apps/api/src/data/catalog-ingestion.service.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:External Catalog Ingestion Pipeline | S:Preservacao retrocompativel das obras originais do seed | 1.3, 2.5, 3.2 | apps/api/src/data/catalog-ingestion.service.ts, apps/api/src/data/catalog.repository.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Field-Level Data Provenance Tracking | S:Armazenamento estruturado de proveniencia na criacao da obra | 1.1, 1.2, 2.6 | packages/shared/src/external.ts, apps/api/src/data/catalog-ingestion.service.ts, apps/api/prisma/schema.prisma | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Field-Level Data Provenance Tracking | S:Consulta e auditoria de proveniencia de metadados | 1.1, 2.7 | apps/api/src/data/catalog.repository.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Field-Level Data Provenance Tracking | S:Atualizacao e rastreamento de fonte primária e secundaria | 1.1, 2.8 | apps/api/src/data/catalog-ingestion.service.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Sovereign SVG Cover Provisioning and Cache Synchronization | S:Geracao automatica de capa SVG vetorial para nova obra ingerida | 2.1, 2.2 | apps/api/src/data/svg-cover.service.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Sovereign SVG Cover Provisioning and Cache Synchronization | S:Servimento de capa local com headers corretos e sem hotlinking | 2.2 | apps/api/src/data/cover-storage.service.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Sovereign SVG Cover Provisioning and Cache Synchronization | S:Sincronizacao de cache local no PostgreSQL com indexacao para busca trigram | 2.9 | apps/api/src/data/catalog.repository.ts | tests/catalog-ingestion-sync.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:External Catalog Ingestion Pipeline / S:Ingestao de obras audiovisuais com resolucao de episodios e temporadas | 1.3, 2.3, 3.1 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Ingestao de obras literarias com diferenciacao de manga manhwa e manhua | 1.3, 2.4 | COVERED |
| R:External Catalog Ingestion Pipeline / S:Preservacao retrocompativel das obras originais do seed | 1.3, 2.5, 3.2 | COVERED |
| R:Field-Level Data Provenance Tracking / S:Armazenamento estruturado de proveniencia na criacao da obra | 1.1, 1.2, 2.6 | COVERED |
| R:Field-Level Data Provenance Tracking / S:Consulta e auditoria de proveniencia de metadados | 1.1, 2.7 | COVERED |
| R:Field-Level Data Provenance Tracking / S:Atualizacao e rastreamento de fonte primária e secundaria | 1.1, 2.8 | COVERED |
| R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Geracao automatica de capa SVG vetorial para nova obra ingerida | 2.1, 2.2 | COVERED |
| R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Servimento de capa local com headers corretos e sem hotlinking | 2.2 | COVERED |
| R:Sovereign SVG Cover Provisioning and Cache Synchronization / S:Sincronizacao de cache local no PostgreSQL com indexacao para busca trigram | 2.9 | COVERED |

- **Constitution Check:** PASS (Monolito modular preservado, custo zero garantido sem APIs pagas, soberania de dados com IDs internos e capas locais SVG, busca determinística pg_trgm sem IA generativa).
- **Active Change Conflicts:** Nenhum conflito detectado com outras mudanças ativas.
- **Ambiguities / Underspecification:** Nenhuma pendência; contratos e esquemas formalizados.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.
