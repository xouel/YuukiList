# Tasks: {{CHANGE_ID}}

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [ ] 1.1 {{TASK_DESCRIPTION_AND_VERIFICATION}} (Ref: R:{{REQUIREMENT_NAME}} / S:{{SCENARIO_NAME}})

## 2. Core Implementation (User Stories)

- [ ] 2.1 [US1] {{TASK_DESCRIPTION_AND_VERIFICATION}} (Ref: R:{{REQUIREMENT_NAME}} / S:{{SCENARIO_NAME}})

## 3. Validation & Integration

- [ ] 3.1 {{INTEGRATION_TEST_OR_VERIFICATION_TASK}} (Ref: R:{{REQUIREMENT_NAME}} / S:{{SCENARIO_NAME}})

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | {{REQUIREMENT_NAME}} | {{SCENARIO_NAME}} | 1.1, 2.1, 3.1 | `PENDING` | `PENDING` | `automated-test` | `PENDING` | `PENDING` |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:{{REQUIREMENT_NAME}} / S:{{SCENARIO_NAME}} | 1.1, 2.1, 3.1 | COVERED |

- **Constitution Check:** PASS
- **Active Change Conflicts:** Nenhum conflito detectado.
- **Ambiguities / Underspecification:** Nenhuma pendência.
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas e na Traceability Matrix.

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.
