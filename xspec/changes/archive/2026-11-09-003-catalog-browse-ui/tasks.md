# Tasks: 003-catalog-browse-ui

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar cliente HTTP tipado `CatalogApiClient` em `apps/web/src/services/catalog-api.client.ts` com suporte a debounce, abort controller e tratamento de erros (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Sincronização bidirecional de busca e filtros na URL)
- [x] 1.2 [P] Configurar tokens visuais Dark Editorial, tema CSS e layout base com navegação acessível em `apps/web/src/app/layout.tsx` (Ref: R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/catalog-browse-ui.test.mjs` para cliente de catálogo, paginação cumulativa (infinite scroll) e sincronização de query params (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita automática, S:Sincronização bidirecional de busca e filtros na URL)
- [x] 2.2 [US1] Implementar componentes `SearchBar`, `FilterBar`, `MediaCard` e grade de catálogo com rolagem infinita em `apps/web/src/components/catalog/` e `apps/web/src/app/page.tsx` (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita automática, S:Sincronização bidirecional de busca e filtros na URL)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/catalog-browse-ui.test.mjs` para os 4 estados assíncronos: loading (skeletons), catálogo vazio, busca sem resultados com botão limpar e erro com retry (Ref: R:Asynchronous Feedback and Resilient States / S:Exibição de skeletons durante carregamento assíncrono, S:Feedback de busca sem resultados com ação para limpar filtros, S:Tratamento de erro de rede com botão de nova tentativa)
- [x] 2.4 [US2] Implementar componentes `MediaCardSkeleton`, `EmptyState`, `NoResultsState` e `ErrorState` com botões de ação em `apps/web/src/components/catalog/async-feedback.tsx` (Ref: R:Asynchronous Feedback and Resilient States / S:Exibição de skeletons durante carregamento assíncrono, S:Feedback de busca sem resultados com ação para limpar filtros, S:Tratamento de erro de rede com botão de nova tentativa)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/catalog-browse-ui.test.mjs` para página de detalhes `/items/:slug`, recuperação de dados da obra, botão voltar restaurando estado prévio e conformidade WCAG 2.2 AA (Ref: R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug, S:Retorno ao catálogo preservando filtros e rolagem, S:Acessibilidade de foco e contraste WCAG 2.2 AA)
- [x] 2.6 [P] [US3] Implementar página de detalhes em `apps/web/src/app/items/[slug]/page.tsx` e componente `ItemDetailView` com metadados completos e botão voltar preservando histórico (Ref: R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug, S:Retorno ao catálogo preservando filtros e rolagem, S:Acessibilidade de foco e contraste WCAG 2.2 AA)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes de frontend em `tests/catalog-browse-ui.test.mjs` validando todos os 8 cenários normativos e conformidade com a Traceability Matrix (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita automática, S:Sincronização bidirecional de busca e filtros na URL, R:Asynchronous Feedback and Resilient States / S:Exibição de skeletons durante carregamento assíncrono, S:Feedback de busca sem resultados com ação para limpar filtros, S:Tratamento de erro de rede com botão de nova tentativa, R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug, S:Retorno ao catálogo preservando filtros e rolagem, S:Acessibilidade de foco e contraste WCAG 2.2 AA)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Catalog Exploration and Infinite Scroll Interface | S:Exibição da grade de cards com rolagem infinita automática | 1.1, 2.1, 2.2, 3.1 | apps/web/src/services/catalog-api.client.ts, apps/web/src/components/catalog/catalog-view.tsx, apps/web/src/components/catalog/media-card.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Catalog Exploration and Infinite Scroll Interface | S:Sincronização bidirecional de busca e filtros na URL | 1.1, 2.1, 2.2, 3.1 | apps/web/src/services/catalog-api.client.ts, apps/web/src/components/catalog/search-bar.tsx, apps/web/src/components/catalog/filter-bar.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Asynchronous Feedback and Resilient States | S:Exibição de skeletons durante carregamento assíncrono | 2.3, 2.4, 3.1 | apps/web/src/components/catalog/media-card-skeleton.tsx, apps/web/src/components/catalog/async-feedback.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Asynchronous Feedback and Resilient States | S:Feedback de busca sem resultados com ação para limpar filtros | 2.3, 2.4, 3.1 | apps/web/src/components/catalog/async-feedback.tsx, apps/web/src/components/catalog/catalog-view.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Asynchronous Feedback and Resilient States | S:Tratamento de erro de rede com botão de nova tentativa | 2.3, 2.4, 3.1 | apps/web/src/services/catalog-api.client.ts, apps/web/src/components/catalog/async-feedback.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Item Details View and Navigation History | S:Navegação para a página de detalhes da obra por slug | 2.5, 2.6, 3.1 | apps/web/src/app/items/[slug]/page.tsx, apps/web/src/components/catalog/item-detail-view.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Item Details View and Navigation History | S:Retorno ao catálogo preservando filtros e rolagem | 2.5, 2.6, 3.1 | apps/web/src/components/catalog/item-detail-view.tsx, apps/web/src/components/catalog/catalog-view.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Item Details View and Navigation History | S:Acessibilidade de foco e contraste WCAG 2.2 AA | 1.2, 2.5, 2.6, 3.1 | apps/web/src/app/globals.css, apps/web/src/app/layout.tsx, apps/web/src/components/catalog/media-card.tsx | tests/catalog-browse-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita automática | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Sincronização bidirecional de busca e filtros na URL | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Asynchronous Feedback and Resilient States / S:Exibição de skeletons durante carregamento assíncrono | 2.3, 2.4, 3.1 | COVERED |
| R:Asynchronous Feedback and Resilient States / S:Feedback de busca sem resultados com ação para limpar filtros | 2.3, 2.4, 3.1 | COVERED |
| R:Asynchronous Feedback and Resilient States / S:Tratamento de erro de rede com botão de nova tentativa | 2.3, 2.4, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug | 2.5, 2.6, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Retorno ao catálogo preservando filtros e rolagem | 2.5, 2.6, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA | 1.2, 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Next.js 15 App Router no tema Dark Editorial; WCAG 2.2 AA com anéis de foco visíveis e contraste mínimo; zero dependências externas comerciais pagas; custo R$ 0).
- **Active Change Conflicts:** PASS (Nenhum conflito com mudanças concorrentes).
- **Ambiguities / Underspecification:** PASS (Decisões de clarificação para rolagem infinita, SearchParams e estados assíncronos totalmente integradas).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 8 cenários cobertos por tarefas com precedência de testes (TDD) e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-008`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.

