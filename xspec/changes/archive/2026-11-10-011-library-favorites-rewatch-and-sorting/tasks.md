# Tasks: 011-library-favorites-rewatch-and-sorting

## 1. Setup & Foundational

- [x] 1.1 [P] Atualizar contratos e DTOs compartilhados em `packages/shared/src/library.ts` adicionando `isFavorite`, `rewatchCount`, `progressVolumes` e `sortBy` (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Marcacao de obra como favorita independente da nota)
- [x] 1.2 Criar suíte de testes automatizados `tests/personal-library-advanced.test.mjs` cobrindo todos os 6 cenários normativos antes da implementação (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Marcacao de obra como favorita independente da nota)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Atualizar `LibraryRepository` em `apps/api/src/library/library.repository.ts` persistindo `isFavorite`, `rewatchCount` e `progressVolumes` com validações de limites (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Gestao de ciclos de reassistir e reler)
- [x] 2.2 [P] [US1] Atualizar `LibraryService` em `apps/api/src/library/library.service.ts` com regras de favoritos, ciclos de reassistir e as 6 opções de ordenação da biblioteca (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Ordenacao avancada e filtragem por favoritos)
- [x] 2.3 [P] [US1] Atualizar `LibraryApiClient` em `apps/web/src/services/library-api.client.ts` suportando os novos campos na query string e mutações (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Ordenacao avancada e filtragem por favoritos)
- [x] 2.4 [US2] Implementar botão interativo de favorito (`♥`) com atualização otimista nos cards (`library-card.tsx`) e linhas (`library-row.tsx`) (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Alternancia imediata de favorito no card ou linha)
- [x] 2.5 [US2] Atualizar o modal `EditItemModal` em `apps/web/src/components/library/edit-item-modal.tsx` com ações de Reassistir/Reler (novo ciclo e contador) e campo de volumes (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Execucao de acao de reassistir ou reler no modal)
- [x] 2.6 [US3] Adicionar banner visual âmbar de aviso amigável de inconsistência de status no `EditItemModal` quando status for Concluído com progresso < total (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso)
- [x] 2.7 [US3] Atualizar `LibraryView` em `apps/web/src/components/library/library-view.tsx` com seletor das 6 ordenações, filtro rápido de favoritos e persistência local (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Ordenacao avancada e filtragem por favoritos)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes completa do monorepo e validar ausência de regressões com `tests/personal-library-advanced.test.mjs` (Ref: R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Marcacao de obra como favorita independente da nota)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Library Favorites Rewatch Tracking and Advanced Sorting | S:Marcacao de obra como favorita independente da nota | 1.1, 1.2, 2.1 | packages/shared/src/library.ts, apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Library Favorites Rewatch Tracking and Advanced Sorting | S:Gestao de ciclos de reassistir e reler | 2.1, 2.2 | apps/api/src/library/library.repository.ts, apps/api/src/library/library.service.ts | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Library Favorites Rewatch Tracking and Advanced Sorting | S:Ordenacao avancada e filtragem por favoritos | 2.2, 2.3, 2.7 | apps/api/src/library/library.service.ts, apps/web/src/services/library-api.client.ts, apps/web/src/components/library/library-view.tsx, apps/web/src/components/library/library-filters.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Alternancia imediata de favorito no card ou linha | 2.4 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-row.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Execucao de acao de reassistir ou reler no modal | 2.5 | apps/web/src/components/library/edit-item-modal.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso | 2.6 | apps/web/src/components/library/edit-item-modal.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Marcacao de obra como favorita independente da nota | 1.1, 1.2, 2.1 | COVERED |
| R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Gestao de ciclos de reassistir e reler | 2.1, 2.2 | COVERED |
| R:Library Favorites Rewatch Tracking and Advanced Sorting / S:Ordenacao avancada e filtragem por favoritos | 2.2, 2.3, 2.7 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Alternancia imediata de favorito no card ou linha | 2.4 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Execucao de acao de reassistir ou reler no modal | 2.5 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso | 2.6 | COVERED |

- **Constitution Check:** PASS (Monólito modular preservado, zero custo adicional, soberania de dados do usuário e persistência privada).
- **Active Change Conflicts:** Nenhuma outra mudança ativa concorrente em `xspec/changes/`.
- **Ambiguities / Underspecification:** Nenhuma pendência; clarificações integradas no proposal e design.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.
