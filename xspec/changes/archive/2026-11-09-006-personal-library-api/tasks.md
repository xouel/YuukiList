# Tasks: 006-personal-library-api

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Modelar a entidade `UserLibraryItem` em `apps/api/prisma/schema.prisma`, criar a migration `apps/api/prisma/migrations/20261109010000_add_user_library_items/migration.sql` e definir os contratos, enums de status pessoal e validadores em `packages/shared/src/library.ts` (Ref: R:Personal Library Management and Category Status Validation / S:Adição de obra à biblioteca pessoal com status compatível)
- [x] 1.2 [P] Implementar os erros de domínio de biblioteca em `apps/api/src/library/library.errors.ts` e a função de cálculo da condição "Em dia" (`calculateIsUpToDate`) em `packages/shared/src/library.ts` (Ref: R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Registro de progresso e cálculo da condição em dia)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/personal-library-api.test.mjs` para adição de obra com status compatível, rejeição de status incompatível por categoria e atualização ou remoção de itens (Ref: R:Personal Library Management and Category Status Validation / S:Adição de obra à biblioteca pessoal com status compatível, S:Rejeição de status pessoal incompatível com a categoria da obra, S:Atualização de status ou remoção de obra da biblioteca)
- [x] 2.2 [US1] Implementar `LibraryRepository`, método de upsert e remoção no `LibraryService` e endpoints `POST /api/v1/library/items`, `PATCH /api/v1/library/items/:mediaItemId` e `DELETE /api/v1/library/items/:mediaItemId` em `apps/api/src/library/` (Ref: R:Personal Library Management and Category Status Validation / S:Adição de obra à biblioteca pessoal com status compatível, S:Rejeição de status pessoal incompatível com a categoria da obra, S:Atualização de status ou remoção de obra da biblioteca)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/personal-library-api.test.mjs` para registro de progresso, cálculo dinâmico da condição em dia para obras finalizadas e em andamento e validação de limites de episódios/capítulos (Ref: R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Registro de progresso e cálculo da condição em dia, S:Manutenção da condição em dia para obras em andamento sem conclusão, S:Validação de limites de progresso contra o total de unidades)
- [x] 2.4 [US2] Implementar regras de atualização de progresso e computação de `isUpToDate` em `LibraryService` respeitando a situação de publicação da obra (Ref: R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Registro de progresso e cálculo da condição em dia, S:Manutenção da condição em dia para obras em andamento sem conclusão, S:Validação de limites de progresso contra o total de unidades)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/personal-library-api.test.mjs` para listagem paginada da biblioteca com filtros de status e categoria, isolamento estrito entre usuários e proteção contra anônimos via AuthGuard (Ref: R:Private Library Listing and Multi-User Isolation / S:Listagem da biblioteca pessoal com filtros por status e categoria, S:Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias, S:Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal)
- [x] 2.6 [P] [US3] Implementar endpoint `GET /api/v1/library` com suporte a filtros e paginação no `LibraryController`, integrar `LibraryModule` no `AppModule` e reexportar serviços em `apps/api/src/index.ts` (Ref: R:Private Library Listing and Multi-User Isolation / S:Listagem da biblioteca pessoal com filtros por status e categoria, S:Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias, S:Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes de biblioteca em `tests/personal-library-api.test.mjs` e a integração com os módulos de autenticação e catálogo validando os 9 cenários normativos e conformidade com a Traceability Matrix (Ref: R:Personal Library Management and Category Status Validation / S:Adição de obra à biblioteca pessoal com status compatível, S:Rejeição de status pessoal incompatível com a categoria da obra, S:Atualização de status ou remoção de obra da biblioteca, R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Registro de progresso e cálculo da condição em dia, S:Manutenção da condição em dia para obras em andamento sem conclusão, S:Validação de limites de progresso contra o total de unidades, R:Private Library Listing and Multi-User Isolation / S:Listagem da biblioteca pessoal com filtros por status e categoria, S:Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias, S:Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Personal Library Management and Category Status Validation | S:Adição de obra à biblioteca pessoal com status compatível | 1.1, 2.1, 2.2, 3.1 | packages/shared/src/library.ts, apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Personal Library Management and Category Status Validation | S:Rejeição de status pessoal incompatível com a categoria da obra | 1.1, 2.1, 2.2, 3.1 | packages/shared/src/library.ts, apps/api/src/library/library.errors.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Personal Library Management and Category Status Validation | S:Atualização de status ou remoção de obra da biblioteca | 1.1, 2.1, 2.2, 3.1 | apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Progress Tracking and Dynamic Up-to-Date Calculation | S:Registro de progresso e cálculo da condição em dia | 1.2, 2.3, 2.4, 3.1 | packages/shared/src/library.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Progress Tracking and Dynamic Up-to-Date Calculation | S:Manutenção da condição em dia para obras em andamento sem conclusão | 1.2, 2.3, 2.4, 3.1 | packages/shared/src/library.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Progress Tracking and Dynamic Up-to-Date Calculation | S:Validação de limites de progresso contra o total de unidades | 1.2, 2.3, 2.4, 3.1 | packages/shared/src/library.ts, apps/api/src/library/library.errors.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Private Library Listing and Multi-User Isolation | S:Listagem da biblioteca pessoal com filtros por status e categoria | 2.5, 2.6, 3.1 | apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Private Library Listing and Multi-User Isolation | S:Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias | 2.5, 2.6, 3.1 | apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts, apps/api/src/library/library.controller.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Private Library Listing and Multi-User Isolation | S:Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal | 2.5, 2.6, 3.1 | apps/api/src/auth/auth.guard.ts, apps/api/src/library/library.controller.ts, apps/api/src/library/library.module.ts | tests/personal-library-api.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Personal Library Management and Category Status Validation / S:Adição de obra à biblioteca pessoal com status compatível | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Personal Library Management and Category Status Validation / S:Rejeição de status pessoal incompatível com a categoria da obra | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Personal Library Management and Category Status Validation / S:Atualização de status ou remoção de obra da biblioteca | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Registro de progresso e cálculo da condição em dia | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Manutenção da condição em dia para obras em andamento sem conclusão | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:Progress Tracking and Dynamic Up-to-Date Calculation / S:Validação de limites de progresso contra o total de unidades | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:Private Library Listing and Multi-User Isolation / S:Listagem da biblioteca pessoal com filtros por status e categoria | 2.5, 2.6, 3.1 | COVERED |
| R:Private Library Listing and Multi-User Isolation / S:Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias | 2.5, 2.6, 3.1 | COVERED |
| R:Private Library Listing and Multi-User Isolation / S:Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal | 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Desacoplamento entre status pessoal e publicação da obra conforme Seção 5 do Documento Mestre; chave composta e isolamento por usuário; custo permanente R$ 0).
- **Active Change Conflicts:** PASS (Nenhum conflito com mudanças concorrentes).
- **Ambiguities / Underspecification:** PASS (Decisões de clarificação para upsert idempotente, cálculo de isUpToDate e chave composta única integradas).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 9 cenários cobertos por tarefas com precedência de testes (TDD) e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-009`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.
