# Tasks: 002-catalog-search-api

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar contratos DTOs e tipos em `packages/shared/src/catalog.ts` e reexportar em `packages/shared/src/index.ts` verificando tipos de requisição e resposta (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título)
- [x] 1.2 [P] Estruturar os módulos `apps/api/src/data/data.module.ts` e `apps/api/src/catalog/catalog.module.ts` integrando ao `apps/api/src/app.module.ts` verificando injeção de dependências (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/catalog-search.test.mjs` para listagem paginada com envelope estruturado e filtros combinados por categoria, status e gênero (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título, S:Filtragem combinada por categoria e status)
- [x] 2.2 [US1] Implementar interface e queries de listagem e filtros combinados em `apps/api/src/data/catalog.repository.ts` e `apps/api/src/catalog/catalog.service.ts` (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título, S:Filtragem combinada por categoria e status)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/catalog-search.test.mjs` para busca aproximada com normalização, limiar pg_trgm >= 0.35, ranking de relevância e desempate alfabético (Ref: R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação, S:Ordenação explícita de busca por título)
- [x] 2.4 [US2] Implementar algoritmo de similaridade trigram, ranqueamento e suporte ao parâmetro sortBy em `apps/api/src/data/catalog.repository.ts` e `apps/api/src/catalog/catalog.service.ts` (Ref: R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação, S:Ordenação explícita de busca por título)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/catalog-search.test.mjs` para consulta de detalhes por slug (200), item inexistente (404) e serviço de capas SVG com fallback (Ref: R:Catalog Item Details and Cover Endpoints / S:Consulta de detalhes de obra por slug existente, S:Consulta de detalhes de obra inexistente, S:Serviço de capa SVG com cabeçalho dedicado e fallback)
- [x] 2.6 [P] [US3] Implementar endpoints GET /api/v1/catalog/items/:slug e GET /api/v1/catalog/items/:slug/cover em `apps/api/src/catalog/catalog.controller.ts` (Ref: R:Catalog Item Details and Cover Endpoints / S:Consulta de detalhes de obra por slug existente, S:Consulta de detalhes de obra inexistente, S:Serviço de capa SVG com cabeçalho dedicado e fallback)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes de integração HTTP em `tests/catalog-search.test.mjs` validando os 7 cenários normativos e conformidade com a Traceability Matrix (Ref: R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título, S:Filtragem combinada por categoria e status, R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação, S:Ordenação explícita de busca por título, R:Catalog Item Details and Cover Endpoints / S:Consulta de detalhes de obra por slug existente, S:Consulta de detalhes de obra inexistente, S:Serviço de capa SVG com cabeçalho dedicado e fallback)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Catalog Items Listing and Filtering | S:Listagem paginada com ordenação padrão por título | 1.1, 1.2, 2.1, 2.2, 3.1 | packages/shared/src/catalog.ts, apps/api/src/data/catalog.repository.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Catalog Items Listing and Filtering | S:Filtragem combinada por categoria e status | 1.1, 2.1, 2.2, 3.1 | packages/shared/src/catalog.ts, apps/api/src/data/catalog.repository.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Intelligent Search with Trigram Similarity | S:Busca aproximada tolerante a pequenos erros de digitação | 2.3, 2.4, 3.1 | apps/api/src/data/catalog.repository.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Intelligent Search with Trigram Similarity | S:Ordenação explícita de busca por título | 2.3, 2.4, 3.1 | apps/api/src/data/catalog.repository.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Catalog Item Details and Cover Endpoints | S:Consulta de detalhes de obra por slug existente | 1.1, 2.5, 2.6, 3.1 | packages/shared/src/catalog.ts, apps/api/src/catalog/catalog.controller.ts, apps/api/src/catalog/catalog.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Catalog Item Details and Cover Endpoints | S:Consulta de detalhes de obra inexistente | 2.5, 2.6, 3.1 | apps/api/src/catalog/catalog.controller.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Catalog Item Details and Cover Endpoints | S:Serviço de capa SVG com cabeçalho dedicado e fallback | 2.5, 2.6, 3.1 | apps/api/src/catalog/catalog.controller.ts, apps/api/src/data/cover-storage.service.ts | tests/catalog-search.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Catalog Items Listing and Filtering / S:Listagem paginada com ordenação padrão por título | 1.1, 1.2, 2.1, 2.2, 3.1 | COVERED |
| R:Catalog Items Listing and Filtering / S:Filtragem combinada por categoria e status | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Intelligent Search with Trigram Similarity / S:Busca aproximada tolerante a pequenos erros de digitação | 2.3, 2.4, 3.1 | COVERED |
| R:Intelligent Search with Trigram Similarity / S:Ordenação explícita de busca por título | 2.3, 2.4, 3.1 | COVERED |
| R:Catalog Item Details and Cover Endpoints / S:Consulta de detalhes de obra por slug existente | 1.1, 2.5, 2.6, 3.1 | COVERED |
| R:Catalog Item Details and Cover Endpoints / S:Consulta de detalhes de obra inexistente | 2.5, 2.6, 3.1 | COVERED |
| R:Catalog Item Details and Cover Endpoints / S:Serviço de capa SVG com cabeçalho dedicado e fallback | 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Monólito modular em `apps/api` isolando `data` e `catalog`; sem dependência de serviços externos pagos ou IA generativa; custo zero preservado).
- **Active Change Conflicts:** PASS (Nenhum conflito com mudanças ativas concorrentes).
- **Ambiguities / Underspecification:** PASS (Decisões de clarificação totalmente mapeadas e sem placeholders).
- **Coverage Summary:** 100% dos 3 requisitos e 7 cenários normativos cobertos por tarefas com precedência de testes (TDD) e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-007`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.

