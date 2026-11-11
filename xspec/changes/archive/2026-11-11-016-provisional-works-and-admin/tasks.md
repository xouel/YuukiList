# Tasks: 016-provisional-works-and-admin

## 1. Setup & Foundational

- [x] 1.1 Criar contratos, DTOs e interfaces de solicitações provisórias, papéis (Role) e status em `packages/shared/src/provisional.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao de obra provisoria com deteccao de similaridade)
- [x] 1.2 [P] Escrever suite de testes automatizados em `tests/provisional-admin-pwa.test.mjs` cobrindo submissão provisória, detecção trigram, RBAC admin, moderação, bloqueio de campos manuais e comportamento offline do PWA (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao sem correspondencia proxima direta)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Implementar algoritmo de similaridade trigram (`pg_trgm` / trigram similarity) em `apps/api/src/provisional/provisional.service.ts` para detecção de duplicatas (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao de obra provisoria com deteccao de similaridade)
- [x] 2.2 [US1] Implementar repositório e serviço de submissão de solicitações provisórias em `apps/api/src/provisional/` (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao sem correspondencia proxima direta)
- [x] 2.3 [US1] Implementar adição automática da obra provisória na biblioteca do solicitante com identificador especial em `apps/api/src/provisional/provisional.service.ts` (Ref: R:Provisional Item Personal Library Integration and Lifecycle Tracking / S:Adicao automatica de obra provisoria na biblioteca do solicitante)
- [x] 2.4 [US1] Implementar consulta de status e justificativa de solicitações do usuário em `apps/api/src/provisional/provisional.service.ts` (Ref: R:Provisional Item Personal Library Integration and Lifecycle Tracking / S:Atualizacao de status da solicitacao e feedback para o usuario)
- [x] 2.5 [P] [US1] Criar endpoints REST de solicitação e checagem de similaridade em `apps/api/src/provisional/provisional.controller.ts` e registrar no container (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao de obra provisoria com deteccao de similaridade)
- [x] 2.6 [P] [US2] Implementar controle de acesso por papéis (Role-Based Access Control) nos repositórios e guards em `apps/api/src/auth/` (Ref: R:Role-Based Access Control and Administration Dashboard / S:Acesso permitido ao painel administrativo por usuario moderador)
- [x] 2.7 [US2] Implementar bloqueio rigoroso (403 Forbidden) para usuários comuns sem papel moderador/admin em `apps/api/src/admin/admin.service.ts` (Ref: R:Role-Based Access Control and Administration Dashboard / S:Bloqueio de acesso administrativo para usuario comum sem privilegios)
- [x] 2.8 [US2] Implementar serviço de moderação de solicitações com promoção ao catálogo oficial em `apps/api/src/admin/admin.service.ts` (Ref: R:Inclusion Request Moderation and Manual Field Protection / S:Aprovacao de solicitacao e promocao de obra provisoria ao catalogo oficial)
- [x] 2.9 [US2] Implementar travamento de campos editados manualmente (`lockedFields`) para blindar contra sobrescrita externa em `apps/api/src/admin/admin.service.ts` (Ref: R:Inclusion Request Moderation and Manual Field Protection / S:Protecao de campos editados manualmente contra sobrescrita automatica)
- [x] 2.10 [P] [US2] Criar endpoints REST administrativos de triagem e travamento de campos em `apps/api/src/admin/admin.controller.ts` (Ref: R:Role-Based Access Control and Administration Dashboard / S:Acesso permitido ao painel administrativo por usuario moderador)
- [x] 2.11 [P] [US3] Implementar manifesto PWA oficial em `apps/web/src/app/manifest.ts` e registro de ícones e temas (Ref: R:Web App Manifest and Service Worker Lifecycle / S:Disponibilizacao de manifesto PWA instalavel valido)
- [x] 2.12 [P] [US3] Implementar Service Worker com estratégia de cache offline em `apps/web/public/sw.js` e componente `pwa-provider.tsx` (Ref: R:Web App Manifest and Service Worker Lifecycle / S:Registro e ativacao de Service Worker para operacao offline)
- [x] 2.13 [US3] Implementar navegação offline servindo dados recentes em cache em `apps/web/public/sw.js` (Ref: R:Safe Offline Navigation and Cache Purge on Logout / S:Navegacao offline com dados recentes do catalogo)
- [x] 2.14 [US3] Implementar expurgo obrigatório de todos os caches privados no evento de logout do usuário em `apps/web/src/services/auth.service.client.ts` e `apps/web/public/sw.js` (Ref: R:Safe Offline Navigation and Cache Purge on Logout / S:Expurgo mandatorio de caches privados no logout)
- [x] 2.15 [P] [US1] Criar página e formulário de solicitação de inclusão com painel de alerta de similaridade em `apps/web/src/app/items/request/page.tsx` (Ref: R:Provisional Media Item Submission and Duplication Detection / S:Submissao de obra provisoria com deteccao de similaridade)
- [x] 2.16 [P] [US2] Criar página do painel administrativo `/admin` com listagem e ações de moderação em `apps/web/src/app/admin/page.tsx` (Ref: R:Inclusion Request Moderation and Manual Field Protection / S:Aprovacao de solicitacao e promocao de obra provisoria ao catalogo oficial)

## 3. Validation & Integration

- [x] 3.1 Executar a suite completa de testes automatizados `tests/provisional-admin-pwa.test.mjs` e garantir 100% de aprovação (Ref: R:Role-Based Access Control and Administration Dashboard / S:Acesso permitido ao painel administrativo por usuario moderador)
- [x] 3.2 Executar a suite global de testes do monorepo e validar build de produção do Next.js sem regressões (Ref: R:Safe Offline Navigation and Cache Purge on Logout / S:Expurgo mandatorio de caches privados no logout)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Provisional Media Item Submission and Duplication Detection | S:Submissao de obra provisoria com deteccao de similaridade | 1.1, 2.1, 2.5, 2.15 | packages/shared/src/provisional.ts, apps/api/src/provisional/provisional.service.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Provisional Media Item Submission and Duplication Detection | S:Submissao sem correspondencia proxima direta | 1.2, 2.2 | apps/api/src/provisional/provisional.service.ts, apps/api/src/provisional/provisional.repository.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Provisional Item Personal Library Integration and Lifecycle Tracking | S:Adicao automatica de obra provisoria na biblioteca do solicitante | 2.3 | apps/api/src/provisional/provisional.service.ts, apps/api/src/library/library.repository.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Provisional Item Personal Library Integration and Lifecycle Tracking | S:Atualizacao de status da solicitacao e feedback para o usuario | 2.4 | apps/api/src/provisional/provisional.service.ts, apps/api/src/admin/admin.service.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Role-Based Access Control and Administration Dashboard | S:Acesso permitido ao painel administrativo por usuario moderador | 2.6, 2.10, 3.1 | apps/api/src/admin/admin.service.ts, apps/api/src/admin/admin.controller.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Role-Based Access Control and Administration Dashboard | S:Bloqueio de acesso administrativo para usuario comum sem privilegios | 2.7 | apps/api/src/admin/admin.service.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Inclusion Request Moderation and Manual Field Protection | S:Aprovacao de solicitacao e promocao de obra provisoria ao catalogo oficial | 2.8, 2.16 | apps/api/src/admin/admin.service.ts, apps/web/src/app/admin/page.tsx | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Inclusion Request Moderation and Manual Field Protection | S:Protecao de campos editados manualmente contra sobrescrita automatica | 2.9 | apps/api/src/admin/admin.service.ts, apps/api/src/data/catalog.repository.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Web App Manifest and Service Worker Lifecycle | S:Disponibilizacao de manifesto PWA instalavel valido | 2.11 | apps/web/src/app/manifest.ts | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Web App Manifest and Service Worker Lifecycle | S:Registro e ativacao de Service Worker para operacao offline | 2.12 | apps/web/public/sw.js, apps/web/src/components/pwa-provider.tsx | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Safe Offline Navigation and Cache Purge on Logout | S:Navegacao offline com dados recentes do catalogo | 2.13 | apps/web/public/sw.js | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Safe Offline Navigation and Cache Purge on Logout | S:Expurgo mandatorio de caches privados no logout | 2.14, 3.2 | apps/web/src/services/auth-api.client.ts, apps/web/public/sw.js | tests/provisional-admin-pwa.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Provisional Media Item Submission and Duplication Detection / S:Submissao de obra provisoria com deteccao de similaridade | 1.1, 2.1, 2.5, 2.15 | COVERED |
| R:Provisional Media Item Submission and Duplication Detection / S:Submissao sem correspondencia proxima direta | 1.2, 2.2 | COVERED |
| R:Provisional Item Personal Library Integration and Lifecycle Tracking / S:Adicao automatica de obra provisoria na biblioteca do solicitante | 2.3 | COVERED |
| R:Provisional Item Personal Library Integration and Lifecycle Tracking / S:Atualizacao de status da solicitacao e feedback para o usuario | 2.4 | COVERED |
| R:Role-Based Access Control and Administration Dashboard / S:Acesso permitido ao painel administrativo por usuario moderador | 2.6, 2.10, 3.1 | COVERED |
| R:Role-Based Access Control and Administration Dashboard / S:Bloqueio de acesso administrativo para usuario comum sem privilegios | 2.7 | COVERED |
| R:Inclusion Request Moderation and Manual Field Protection / S:Aprovacao de solicitacao e promocao de obra provisoria ao catalogo oficial | 2.8, 2.16 | COVERED |
| R:Inclusion Request Moderation and Manual Field Protection / S:Protecao de campos editados manualmente contra sobrescrita automatica | 2.9 | COVERED |
| R:Web App Manifest and Service Worker Lifecycle / S:Disponibilizacao de manifesto PWA instalavel valido | 2.11 | COVERED |
| R:Web App Manifest and Service Worker Lifecycle / S:Registro e ativacao de Service Worker para operacao offline | 2.12 | COVERED |
| R:Safe Offline Navigation and Cache Purge on Logout / S:Navegacao offline com dados recentes do catalogo | 2.13 | COVERED |
| R:Safe Offline Navigation and Cache Purge on Logout / S:Expurgo mandatorio de caches privados no logout | 2.14, 3.2 | COVERED |

- **Constitution Check:** PASS (Custo Zero permanente, Soberania e privacidade do usuário, tipagem estrita, ausência de bibliotecas pesadas).
- **Active Change Conflicts:** Nenhum conflito detectado (mudança única ativa).
- **Ambiguities / Underspecification:** Nenhuma pendência (esclarecimentos consolidados no Clarification Gate).
- **Coverage Summary:** 100% dos requisitos e cenários normativos cobertos na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
