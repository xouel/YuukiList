# Tasks: 015-profile-stats-and-sharing

## 1. Setup & Foundational

- [x] 1.1 Criar contratos, DTOs e interfaces de estatisticas de perfil, compartilhamento e exportacao em `packages/shared/src/profile.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)
- [x] 1.2 [P] Escrever suite de testes automatizados em `tests/profile-sharing-lgpd.test.mjs` cobrindo metricas, compartilhamento expiravel/revogavel e exportacao/exclusao LGPD (Ref: R:User Profile Metrics and Consumption Analytics / S:Tratamento de biblioteca recente ou sem obras concluidas)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Implementar `ProfileRepository` e servico de agregacao estatistica com calculo de concluidos, tempo estimado e distribuicoes em `apps/api/src/profile/profile.service.ts` (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)
- [x] 2.2 [US1] Adicionar tratamento defensivo para usuarios sem obras concluidas com metricas zeradas em `apps/api/src/profile/profile.service.ts` (Ref: R:User Profile Metrics and Consumption Analytics / S:Tratamento de biblioteca recente ou sem obras concluidas)
- [x] 2.3 [US1] Implementar agregacao de vitrine de favoritos e isolamento de campos privados em `apps/api/src/profile/profile.service.ts` (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)
- [x] 2.4 [P] [US2] Implementar geracao de tokens seguros, prazos de expiracao (7/30/90 dias) e revogacao de links em `apps/api/src/profile/profile.repository.ts` e `profile.service.ts` (Ref: R:Tokenized Public Sharing Links with Configurable Expiration / S:Criacao de link compartilhado com prazo determinado)
- [x] 2.5 [US2] Implementar validacao de expiracao/revogacao de links com bloqueio de acesso em `apps/api/src/profile/profile.service.ts` (Ref: R:Tokenized Public Sharing Links with Configurable Expiration / S:Bloqueio de acesso a link revogado ou expirado)
- [x] 2.6 [P] [US2] Implementar payload publico de perfil compartilhado com mascaramento estrito de notas e spoilers em `apps/api/src/profile/profile.service.ts` (Ref: R:Read-Only Shared Library View and Privacy Masking / S:Visualizacao publica somente leitura de biblioteca compartilhada)
- [x] 2.7 [US3] Implementar servico de exportacao de dados pessoais em JSON e biblioteca em CSV em `apps/api/src/profile/profile.service.ts` (Ref: R:Personal Data Portability and Multi-Format Export / S:Exportacao de dados pessoais em formato JSON)
- [x] 2.8 [US3] Implementar formatacao tabular CSV com colunas da biblioteca do usuario em `apps/api/src/profile/profile.service.ts` (Ref: R:Personal Data Portability and Multi-Format Export / S:Exportacao da biblioteca em formato tabular CSV)
- [x] 2.9 [US3] Implementar fluxo de exclusao definitiva de conta com confirmacao por consentimento explicito em `apps/api/src/profile/profile.service.ts` (Ref: R:Definite Account Erasure and Right to be Forgotten / S:Exclusao irreversivel de conta com consentimento explicito)
- [x] 2.10 [US3] Implementar validacao de seguranca rejeitando exclusao sem consentimento confirmado em `apps/api/src/profile/profile.service.ts` (Ref: R:Definite Account Erasure and Right to be Forgotten / S:Bloqueio de tentativa de exclusao sem consentimento confirmado)
- [x] 2.11 [P] [US1] Implementar `ProfileController` com endpoints REST para estatisticas, compartilhamento, exportacao e exclusao em `apps/api/src/profile/profile.controller.ts` (Ref: R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros)
- [x] 2.12 [P] [US1] Criar cliente HTTP `profile-api.client.ts` e registrar servicos e controllers no container web em `apps/web/src/server/container.ts` e nos route handlers Next.js (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)
- [x] 2.13 [US1] Implementar componentes visuais de perfil (`profile-stats.tsx`, `favorites-showcase.tsx`) e pagina `/profile` em `apps/web/src/app/profile/page.tsx` (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)
- [x] 2.14 [P] [US2] Implementar modal de geracao e revogacao de links (`share-dialog.tsx`) e pagina publica `/share/[token]` em `apps/web/src/app/share/[token]/page.tsx` (Ref: R:Read-Only Shared Library View and Privacy Masking / S:Visualizacao publica somente leitura de biblioteca compartilhada)
- [x] 2.15 [P] [US3] Implementar modal com checkbox de consentimento de exclusao (`delete-account-dialog.tsx`) e botoes de exportacao JSON/CSV na interface web (Ref: R:Definite Account Erasure and Right to be Forgotten / S:Exclusao irreversivel de conta com consentimento explicito)

## 3. Validation & Integration

- [x] 3.1 Executar a suite completa de testes automatizados `tests/profile-sharing-lgpd.test.mjs` e garantir 100% de aprovacao (Ref: R:Personal Data Portability and Multi-Format Export / S:Exportacao de dados pessoais em formato JSON)
- [x] 3.2 Executar a suite global de testes do monorepo e validar build do Next.js sem regressoes (Ref: R:Definite Account Erasure and Right to be Forgotten / S:Bloqueio de tentativa de exclusao sem consentimento confirmado)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:User Profile Metrics and Consumption Analytics | S:Calculo consolidado de metricas de consumo | 1.1, 2.1, 2.12 | packages/shared/src/profile.ts, apps/api/src/profile/profile.service.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:User Profile Metrics and Consumption Analytics | S:Tratamento de biblioteca recente ou sem obras concluidas | 1.2, 2.2 | apps/api/src/profile/profile.service.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.3, 2.13 | apps/api/src/profile/profile.service.ts, apps/web/src/components/profile/favorites-showcase.tsx | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Profile Showcase and Activity Feed Privacy | S:Ocultacao estrita de anotacoes privadas para terceiros | 2.11 | apps/api/src/profile/profile.service.ts, apps/api/src/profile/profile.controller.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Tokenized Public Sharing Links with Configurable Expiration | S:Criacao de link compartilhado com prazo determinado | 2.4 | apps/api/src/profile/profile.repository.ts, apps/api/src/profile/profile.service.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Tokenized Public Sharing Links with Configurable Expiration | S:Bloqueio de acesso a link revogado ou expirado | 2.5 | apps/api/src/profile/profile.service.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Read-Only Shared Library View and Privacy Masking | S:Visualizacao publica somente leitura de biblioteca compartilhada | 2.6, 2.14 | apps/api/src/profile/profile.service.ts, apps/web/src/app/share/[token]/page.tsx | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Personal Data Portability and Multi-Format Export | S:Exportacao de dados pessoais em formato JSON | 2.7, 3.1 | apps/api/src/profile/profile.service.ts, apps/web/src/app/api/v1/profile/export/json/route.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Personal Data Portability and Multi-Format Export | S:Exportacao da biblioteca em formato tabular CSV | 2.8 | apps/api/src/profile/profile.service.ts, apps/web/src/app/api/v1/profile/export/csv/route.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Definite Account Erasure and Right to be Forgotten | S:Exclusao irreversivel de conta com consentimento explicito | 2.9, 2.15 | apps/api/src/profile/profile.service.ts, apps/web/src/components/profile/delete-account-dialog.tsx | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Definite Account Erasure and Right to be Forgotten | S:Bloqueio de tentativa de exclusao sem consentimento confirmado | 2.10, 3.2 | apps/api/src/profile/profile.service.ts | tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo | 1.1, 2.1, 2.12 | COVERED |
| R:User Profile Metrics and Consumption Analytics / S:Tratamento de biblioteca recente ou sem obras concluidas | 1.2, 2.2 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil | 2.3, 2.13 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros | 2.11 | COVERED |
| R:Tokenized Public Sharing Links with Configurable Expiration / S:Criacao de link compartilhado com prazo determinado | 2.4 | COVERED |
| R:Tokenized Public Sharing Links with Configurable Expiration / S:Bloqueio de acesso a link revogado ou expirado | 2.5 | COVERED |
| R:Read-Only Shared Library View and Privacy Masking / S:Visualizacao publica somente leitura de biblioteca compartilhada | 2.6, 2.14 | COVERED |
| R:Personal Data Portability and Multi-Format Export / S:Exportacao de dados pessoais em formato JSON | 2.7, 3.1 | COVERED |
| R:Personal Data Portability and Multi-Format Export / S:Exportacao da biblioteca em formato tabular CSV | 2.8 | COVERED |
| R:Definite Account Erasure and Right to be Forgotten / S:Exclusao irreversivel de conta com consentimento explicito | 2.9, 2.15 | COVERED |
| R:Definite Account Erasure and Right to be Forgotten / S:Bloqueio de tentativa de exclusao sem consentimento confirmado | 2.10, 3.2 | COVERED |

- **Constitution Check:** PASS (Soberania de dados, privacidade por padrao, tipagem estrita, custo zero permanente).
- **Active Change Conflicts:** Nenhum conflito detectado (mudanca unica ativa).
- **Ambiguities / Underspecification:** Nenhuma pendencia.
- **Coverage Summary:** 100% dos requisitos e cenarios normativos cobertos na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
