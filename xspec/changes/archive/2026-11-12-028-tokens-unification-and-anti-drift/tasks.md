# Tasks: 028-tokens-unification-and-anti-drift

## 1. Setup & Foundational

- [x] 1.1 Criar suite de testes automatizados `tests/tokens-and-anti-drift.test.mjs` validando existencia dos tokens semanticos, mapeamento no Tailwind e regras de foco (Ref: R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao)
- [x] 1.2 [US1] Definir variaveis semanticas para Dark e Light mode e regras globais de :focus-visible em `apps/web/src/app/globals.css` (Ref: R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao)
- [x] 1.3 [US1] Mapear tokens semanticos em `colors` e `boxShadow` em `apps/web/tailwind.config.ts` (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] [US2] Refatorar casca de navegacao e rodape em `navigation-shell.tsx` e `legal-footer.tsx` adotando classes semanticas e foco acessivel (Ref: R:Theme Selection and Accessibility Foundations / S:Anel de foco visivel semantico para navegacao acessivel)
- [x] 2.2 [P] [US1] [US3] Refatorar componentes do Home Hub (`home-hub-view.tsx`, `hero-spotlight.tsx`, `bento-sidebar.tsx`) com tokens semanticos e badges de midia (Ref: R:Theme Selection and Accessibility Foundations / S:Padronizacao semantica de acentos de midia bimodais)
- [x] 2.3 [P] [US1] [US3] Refatorar componentes do Catalogo (`catalog-view.tsx`, `media-card.tsx`, `filter-bar.tsx`) substituindo hexadecimais por tokens de midia e superficie (Ref: R:Theme Selection and Accessibility Foundations / S:Padronizacao semantica de acentos de midia bimodais)
- [x] 2.4 [P] [US1] Refatorar componentes da Biblioteca e Ledger (`library-view.tsx`, `ledger-header.tsx`, `library-card.tsx`) com tokens semanticos e foco acessivel (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 2.5 [P] [US1] Refatorar componentes do Calendario (`calendar-view.tsx`, `calendar-header-kpis.tsx`, `calendar-sidebar-widgets.tsx`) com tokens semanticos e foco acessivel (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)
- [x] 2.6 [P] [US1] [US2] Refatorar autenticacao (`auth-dossier-card.tsx`, `login-form.tsx`, `register-form.tsx`) saneando foco e cores literais (Ref: R:Theme Selection and Accessibility Foundations / S:Anel de foco visivel semantico para navegacao acessivel)

## 3. Validation & Integration

- [x] 3.1 Executar suite `tests/tokens-and-anti-drift.test.mjs` comprovando 100% de passagem nos cenarios normativos (Ref: R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao)
- [x] 3.2 Executar `npm --prefix apps/web run build` e suite de testes do projeto para assegurar zero regressoes de compilacao ou tipagem (Ref: R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Theme Selection and Accessibility Foundations | S:Alternancia dinamica de tema visual | 1.2, 2.5, 3.1 | apps/web/src/app/globals.css, apps/web/src/components/calendar/calendar-view.tsx | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Theme Selection and Accessibility Foundations | S:Respeito a diretiva de movimento reduzido | 1.2, 3.2 | apps/web/src/app/globals.css | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Theme Selection and Accessibility Foundations | S:Aplicacao efetiva de cores claras nas superficies e textos | 1.2, 1.3, 3.1 | apps/web/src/app/globals.css, apps/web/tailwind.config.ts | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Theme Selection and Accessibility Foundations | S:Aplicacao da escala tipografica editorial e paleta mineral | 1.2, 2.4, 3.1 | apps/web/src/app/globals.css, apps/web/src/components/library/library-card.tsx | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Theme Selection and Accessibility Foundations | S:Suporte a tokens semanticos de superficie e contornos de refracao | 1.1, 1.2, 1.3, 3.1 | apps/web/src/app/globals.css, apps/web/tailwind.config.ts | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Theme Selection and Accessibility Foundations | S:Padronizacao semantica de acentos de midia bimodais | 1.2, 2.2, 2.3, 3.1 | apps/web/src/app/globals.css, apps/web/src/components/catalog/media-card.tsx, apps/web/src/components/home/hero-spotlight.tsx | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Theme Selection and Accessibility Foundations | S:Anel de foco visivel semantico para navegacao acessivel | 1.2, 2.1, 2.6, 3.1 | apps/web/src/app/globals.css, apps/web/src/components/layout/navigation-shell.tsx, apps/web/src/components/auth/login-form.tsx | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual | 1.2, 2.5, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido | 1.2, 3.2 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos | 1.2, 1.3, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral | 1.2, 2.4, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao | 1.1, 1.2, 1.3, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Padronizacao semantica de acentos de midia bimodais | 1.2, 2.2, 2.3, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Anel de foco visivel semantico para navegacao acessivel | 1.2, 2.1, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS
- **Active Change Conflicts:** Nenhum conflito detectado.
- **Ambiguities / Underspecification:** Nenhuma pendencia.
- **Coverage Summary:** 100% dos requisitos e cenarios cobertos por tarefas e na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.

