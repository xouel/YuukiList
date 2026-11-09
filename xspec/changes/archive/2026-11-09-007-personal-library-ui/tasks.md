# Tasks: 007-personal-library-ui

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar o cliente HTTP `LibraryApiClient` em `apps/web/src/services/library-api.client.ts` com métodos para listagem, consulta, inserção, atualização e remoção com `credentials: 'include'` (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 1.2 [P] Definir tipos de estado da biblioteca, constantes de abas, funções de persistência de layout (`localStorage`) e lógica de resolução de status em `apps/web/src/components/library/library-helpers.ts` (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/personal-library-ui.test.mjs` para alternância de layout grade/lista com persistência em localStorage, renderização de cards e bloqueio/redirecionamento de acesso anônimo (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade, S:Alternancia para modo lista com persistencia em localStorage, S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.2 [US1] Implementar componentes `LibraryCard` e `LibraryRow`, rota protegida `/library` via `ProtectedRoute` e link de navegação na `HeaderNav` (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade, S:Alternancia para modo lista com persistencia em localStorage, S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/personal-library-ui.test.mjs` para incremento rápido "+1", exibição do badge "Em dia" e mutação de status/nota via modal detalhado (Ref: R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista, S:Exibicao destacada do badge Em dia para obras alcancadas, S:Edicao de status e nota pessoal atraves do modal detalhado)
- [x] 2.4 [US2] Implementar `EditItemModal` acessível e ação de incremento rápido com atualização otimista e reversão em caso de erro na `LibraryView` (Ref: R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista, S:Exibicao destacada do badge Em dia para obras alcancadas, S:Edicao de status e nota pessoal atraves do modal detalhado)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/personal-library-ui.test.mjs` para filtragem combinada por aba e categoria, estado de biblioteca vazia com link para o catálogo e estado de erro com botão de retry (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria, S:Exibicao de estado vazio para biblioteca sem obras cadastradas, S:Tratamento de erro com acao de tentar novamente)
- [x] 2.6 [P] [US3] Implementar componente `LibraryFilters`, `LibrarySkeleton` e integrar estados assíncronos (vazio, erro com retry e loading) em `apps/web/src/components/library/library-view.tsx` (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria, S:Exibicao de estado vazio para biblioteca sem obras cadastradas, S:Tratamento de erro com acao de tentar novamente)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes da UI da biblioteca em `tests/personal-library-ui.test.mjs` e a integração com a API da biblioteca pessoal validando os 9 cenários normativos e a conformidade da Traceability Matrix (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade, S:Alternancia para modo lista com persistencia em localStorage, S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca, R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista, S:Exibicao destacada do badge Em dia para obras alcancadas, S:Edicao de status e nota pessoal atraves do modal detalhado, R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria, S:Exibicao de estado vazio para biblioteca sem obras cadastradas, S:Tratamento de erro com acao de tentar novamente)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 1.1, 2.1, 2.2, 3.1 | apps/web/src/services/library-api.client.ts, apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-view.tsx, apps/web/src/app/library/page.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 1.2, 2.1, 2.2, 3.1 | apps/web/src/components/library/library-helpers.ts, apps/web/src/components/library/library-row.tsx, apps/web/src/components/library/library-filters.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.1, 2.2, 3.1 | apps/web/src/components/auth/protected-route.tsx, apps/web/src/components/layout/header-nav.tsx, apps/web/src/app/library/page.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Quick Progress Tracking and Detail Modal | S:Incremento rapido de unidade com atualizacao otimista | 2.3, 2.4, 3.1 | apps/web/src/components/library/library-helpers.ts, apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-row.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Quick Progress Tracking and Detail Modal | S:Exibicao destacada do badge Em dia para obras alcancadas | 2.3, 2.4, 3.1 | packages/shared/src/library.ts, apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-row.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Quick Progress Tracking and Detail Modal | S:Edicao de status e nota pessoal atraves do modal detalhado | 2.3, 2.4, 3.1 | apps/web/src/components/library/edit-item-modal.tsx, apps/web/src/components/library/library-view.tsx, apps/web/src/services/library-api.client.ts | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Library Filtering and Asynchronous States | S:Filtragem combinada por aba de status e categoria | 2.5, 2.6, 3.1 | apps/web/src/components/library/library-helpers.ts, apps/web/src/components/library/library-filters.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Library Filtering and Asynchronous States | S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.5, 2.6, 3.1 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Library Filtering and Asynchronous States | S:Tratamento de erro com acao de tentar novamente | 2.5, 2.6, 3.1 | apps/web/src/components/catalog/async-feedback.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 1.2, 2.1, 2.2, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.1, 2.2, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista | 2.3, 2.4, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas | 2.3, 2.4, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado | 2.3, 2.4, 3.1 | COVERED |
| R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria | 2.5, 2.6, 3.1 | COVERED |
| R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.5, 2.6, 3.1 | COVERED |
| R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente | 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Next.js 15 App Router, zero custo, WCAG 2.2 AA no tema Dark Editorial, TDD estrito com precedência de testes).
- **Active Change Conflicts:** PASS (Nenhum conflito com mudanças ativas).
- **Ambiguities / Underspecification:** PASS (Incremento rápido com reversão otimista, abas consolidadas e persistência em localStorage integradas).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 9 cenários cobertos por tarefas de implementação e testes e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-009`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.
