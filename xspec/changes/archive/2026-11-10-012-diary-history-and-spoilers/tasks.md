# Tasks: 012-diary-history-and-spoilers

## 1. Setup & Foundational

- [x] 1.1 [P] Definir contratos e DTOs de diário em `packages/shared/src/diary.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso)
- [x] 1.2 Criar suíte de testes automatizados `tests/personal-diary-history.test.mjs` cobrindo os 8 cenários normativos antes da implementação (Ref: R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar repositório `DiaryRepository` em `apps/api/src/diary/diary.repository.ts` com persistência de `HistoryEvent` e filtros (Ref: R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso)
- [x] 2.2 [P] [US1] Implementar serviço `DiaryService` em `apps/api/src/diary/diary.service.ts` com emissão de eventos e regra de desacoplamento da biblioteca (Ref: R:Chronological History Event Tracking and Lifecycle / S:Exclusao de evento sem impacto no estado da biblioteca)
- [x] 2.3 [US1] Integrar `LibraryService` em `apps/api/src/library/library.service.ts` para registrar eventos automáticos em mutações de biblioteca (Ref: R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso)
- [x] 2.4 [P] [US2] Implementar controle de notas contextuais e cálculo de spoiler em `apps/api/src/diary/diary.service.ts` e `apps/api/src/diary/diary.controller.ts` (Ref: R:Episode and Chapter Notes with Smart Spoiler Masking / S:Ocultacao automatica de nota com spoiler para progresso inferior)
- [x] 2.5 [P] [US2] Criar cliente `DiaryApiClient` em `apps/web/src/services/diary-api.client.ts` para listagem, filtros e mutações de eventos (Ref: R:Chronological History Event Tracking and Lifecycle / S:Criacao manual de evento e anotacao no diario)
- [x] 2.6 [US3] Implementar componentes visuais `spoiler-mask.tsx` e `create-note-modal.tsx` em `apps/web/src/components/diary/` (Ref: R:Spoiler Warning Mask and One-Click Reveal / S:Revelacao sob demanda de conteudo protegido por mascara de spoiler)
- [x] 2.7 [US3] Implementar linha do tempo `timeline-view.tsx` e integrar aba "Histórico & Diário" em `apps/web/src/components/library/library-view.tsx` (Ref: R:Interactive Timeline View and Unit Notes Interface / S:Renderizacao da linha do tempo cronologica na aba de historico)
- [x] 2.8 [US3] Adicionar seção de notas e histórico na página de detalhes da obra em `apps/web/src/components/catalog/item-detail-view.tsx` (Ref: R:Interactive Timeline View and Unit Notes Interface / S:Criacao de nota vinculada a unidade com flag de spoiler)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes do monorepo e validar ausência de regressões com `tests/personal-diary-history.test.mjs` (Ref: R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Chronological History Event Tracking and Lifecycle | S:Geracao automatica de evento de historico ao avancar progresso | 1.1, 1.2, 2.1, 2.3 | apps/api/src/library/library.service.ts, apps/api/src/diary/diary.service.ts | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Chronological History Event Tracking and Lifecycle | S:Criacao manual de evento e anotacao no diario | 2.1, 2.2, 2.5 | apps/api/src/diary/diary.service.ts, apps/web/src/services/diary-api.client.ts | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Chronological History Event Tracking and Lifecycle | S:Exclusao de evento sem impacto no estado da biblioteca | 2.2 | apps/api/src/diary/diary.service.ts, apps/api/src/diary/diary.repository.ts | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Episode and Chapter Notes with Smart Spoiler Masking | S:Ocultacao automatica de nota com spoiler para progresso inferior | 2.4 | packages/shared/src/diary.ts, apps/api/src/diary/diary.service.ts | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Episode and Chapter Notes with Smart Spoiler Masking | S:Exibicao direta de nota com spoiler para progresso igual ou superior | 2.4 | packages/shared/src/diary.ts, apps/api/src/diary/diary.service.ts | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Interactive Timeline View and Unit Notes Interface | S:Renderizacao da linha do tempo cronologica na aba de historico | 2.7 | apps/web/src/components/diary/timeline-view.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Interactive Timeline View and Unit Notes Interface | S:Criacao de nota vinculada a unidade com flag de spoiler | 2.6, 2.8 | apps/web/src/components/diary/create-note-modal.tsx, apps/web/src/components/catalog/item-detail-view.tsx | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Spoiler Warning Mask and One-Click Reveal | S:Revelacao sob demanda de conteudo protegido por mascara de spoiler | 2.6 | apps/web/src/components/diary/spoiler-mask.tsx | tests/personal-diary-history.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Chronological History Event Tracking and Lifecycle / S:Geracao automatica de evento de historico ao avancar progresso | 1.1, 1.2, 2.1, 2.3 | COVERED |
| R:Chronological History Event Tracking and Lifecycle / S:Criacao manual de evento e anotacao no diario | 2.1, 2.2, 2.5 | COVERED |
| R:Chronological History Event Tracking and Lifecycle / S:Exclusao de evento sem impacto no estado da biblioteca | 2.2 | COVERED |
| R:Episode and Chapter Notes with Smart Spoiler Masking / S:Ocultacao automatica de nota com spoiler para progresso inferior | 2.4 | COVERED |
| R:Episode and Chapter Notes with Smart Spoiler Masking / S:Exibicao direta de nota com spoiler para progresso igual ou superior | 2.4 | COVERED |
| R:Interactive Timeline View and Unit Notes Interface / S:Renderizacao da linha do tempo cronologica na aba de historico | 2.7 | COVERED |
| R:Interactive Timeline View and Unit Notes Interface / S:Criacao de nota vinculada a unidade com flag de spoiler | 2.6, 2.8 | COVERED |
| R:Spoiler Warning Mask and One-Click Reveal / S:Revelacao sob demanda de conteudo protegido por mascara de spoiler | 2.6 | COVERED |

- **Constitution Check:** PASS (Desacoplamento estrito, privacidade por padrão, custo zero permanente e proteção contra spoilers).
- **Active Change Conflicts:** Nenhuma outra mudança ativa concorrente em `xspec/changes/`.
- **Ambiguities / Underspecification:** Nenhuma pendência; clarificações integradas no proposal e design.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.

