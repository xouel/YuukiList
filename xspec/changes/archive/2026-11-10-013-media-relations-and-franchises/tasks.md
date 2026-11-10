# Tasks: 013-media-relations-and-franchises

## 1. Setup & Foundational

- [x] 1.1 [P] Definir contratos, enums e DTOs de relações e franquias em `packages/shared/src/relations.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:Typed Media Relationship Inversion and Traversal / S:Inversao automatica de relacao prequel e sequel)
- [x] 1.2 Criar suíte de testes automatizados `tests/media-relations-franchises.test.mjs` cobrindo os 8 cenários normativos antes da implementação (Ref: R:Typed Media Relationship Inversion and Traversal / S:Inversao automatica de relacao prequel e sequel)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar repositório `RelationsRepository` em `apps/api/src/relations/relations.repository.ts` com dados canônicos de franquias e relações (Ref: R:Typed Media Relationship Inversion and Traversal / S:Mapeamento reciproco de adaptacao transmidia)
- [x] 2.2 [P] [US1] Implementar serviço `RelationsService` em `apps/api/src/relations/relations.service.ts` com cálculo de inversão semântica e integração da biblioteca (Ref: R:Typed Media Relationship Inversion and Traversal / S:Inversao automatica de relacao prequel e sequel)
- [x] 2.3 [US1] Implementar controller `RelationsController` e módulo `RelationsModule` em `apps/api/src/relations/` com endpoints REST protegidos (Ref: R:Franchise Universe Organization and Independent Progress / S:Listagem de franquia com ordenacao cronologica e de lancamento)
- [x] 2.4 [P] [US1] Criar cliente HTTP `RelationsApiClient` em `apps/web/src/services/relations-api.client.ts` para consulta de relações e franquias (Ref: R:Typed Media Relationship Inversion and Traversal / S:Mapeamento reciproco de adaptacao transmidia)
- [x] 2.5 [US1] Criar route handlers do Next.js App Router e registrar `RelationsController` no container web em `apps/web/src/server/container.ts` (Ref: R:Franchise Universe Organization and Independent Progress / S:Independencia estrita do progresso entre adaptacoes da franquia)
- [x] 2.6 [P] [US1] Implementar componente visual `related-works-section.tsx` em `apps/web/src/components/relations/` exibindo badges tipados e atalho de franquia (Ref: R:Item Detail Related Works and Adaptation Badges / S:Exibicao de cards de obras relacionadas com badges tipados)
- [x] 2.7 [US1] Integrar seção de obras relacionadas e adaptações na página de detalhes da obra em `apps/web/src/components/catalog/item-detail-view.tsx` (Ref: R:Item Detail Related Works and Adaptation Badges / S:Navegacao para pagina dedicada da franquia)
- [x] 2.8 [P] [US2] Implementar componente `franchise-view.tsx` em `apps/web/src/components/relations/` com alternância entre ordem de lançamento e cronológica (Ref: R:Franchise Universe Explorer View with Timeline Modes / S:Alternancia interativa entre ordem de lancamento e cronologica)
- [x] 2.9 [US2] Criar página de visualização da franquia em `apps/web/src/app/franchises/[slug]/page.tsx` com acompanhamento de progresso independente (Ref: R:Franchise Universe Explorer View with Timeline Modes / S:Acompanhamento de progresso contextual por obra na franquia)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes do monorepo e validar ausência de regressões com `tests/media-relations-franchises.test.mjs` (Ref: R:Typed Media Relationship Inversion and Traversal / S:Inversao automatica de relacao prequel e sequel)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Typed Media Relationship Inversion and Traversal | S:Inversao automatica de relacao prequel e sequel | 1.1, 1.2, 2.1, 2.2 | packages/shared/src/relations.ts, apps/api/src/relations/relations.service.ts | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Typed Media Relationship Inversion and Traversal | S:Mapeamento reciproco de adaptacao transmidia | 2.1, 2.2, 2.4 | apps/api/src/relations/relations.service.ts, apps/web/src/services/relations-api.client.ts | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Franchise Universe Organization and Independent Progress | S:Listagem de franquia com ordenacao cronologica e de lancamento | 2.1, 2.2, 2.3 | apps/api/src/relations/relations.repository.ts, apps/api/src/relations/relations.service.ts | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Franchise Universe Organization and Independent Progress | S:Independencia estrita do progresso entre adaptacoes da franquia | 2.2, 2.5 | apps/api/src/relations/relations.service.ts, apps/web/src/server/container.ts | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Item Detail Related Works and Adaptation Badges | S:Exibicao de cards de obras relacionadas com badges tipados | 2.6, 2.7 | apps/web/src/components/relations/related-works-section.tsx, apps/web/src/components/catalog/item-detail-view.tsx | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Item Detail Related Works and Adaptation Badges | S:Navegacao para pagina dedicada da franquia | 2.6, 2.7 | apps/web/src/components/relations/related-works-section.tsx, apps/web/src/components/catalog/item-detail-view.tsx | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Franchise Universe Explorer View with Timeline Modes | S:Alternancia interativa entre ordem de lancamento e cronologica | 2.8, 2.9 | apps/web/src/components/relations/franchise-view.tsx, apps/web/src/app/franchises/[slug]/page.tsx | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Franchise Universe Explorer View with Timeline Modes | S:Acompanhamento de progresso contextual por obra na franquia | 2.8, 2.9 | apps/web/src/components/relations/franchise-view.tsx, apps/web/src/app/franchises/[slug]/page.tsx | tests/media-relations-franchises.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Typed Media Relationship Inversion and Traversal / S:Inversao automatica de relacao prequel e sequel | 1.1, 1.2, 2.1, 2.2 | COVERED |
| R:Typed Media Relationship Inversion and Traversal / S:Mapeamento reciproco de adaptacao transmidia | 2.1, 2.2, 2.4 | COVERED |
| R:Franchise Universe Organization and Independent Progress / S:Listagem de franquia com ordenacao cronologica e de lancamento | 2.1, 2.2, 2.3 | COVERED |
| R:Franchise Universe Organization and Independent Progress / S:Independencia estrita do progresso entre adaptacoes da franquia | 2.2, 2.5 | COVERED |
| R:Item Detail Related Works and Adaptation Badges / S:Exibicao de cards de obras relacionadas com badges tipados | 2.6, 2.7 | COVERED |
| R:Item Detail Related Works and Adaptation Badges / S:Navegacao para pagina dedicada da franquia | 2.6, 2.7 | COVERED |
| R:Franchise Universe Explorer View with Timeline Modes / S:Alternancia interativa entre ordem de lancamento e cronologica | 2.8, 2.9 | COVERED |
| R:Franchise Universe Explorer View with Timeline Modes / S:Acompanhamento de progresso contextual por obra na franquia | 2.8, 2.9 | COVERED |

- **Constitution Check:** PASS (Independência estrita de progresso por obra, custo zero permanente, ausência de APIs externas pagas).
- **Active Change Conflicts:** Nenhuma outra mudança concorrente em `xspec/changes/`.
- **Ambiguities / Underspecification:** Nenhuma pendência; clarificações integradas no design e tarefas.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
