# Tasks: 001-monorepo-data-seed

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar `package.json` raiz com npm workspaces (`packages/*`, `apps/*`), `tsconfig.base.json` e `.env.example`, verificando a estrutura do monorepo (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm)
- [x] 1.2 [P] Criar os manifestos `packages/shared/package.json`, `apps/api/package.json` e `apps/web/package.json`, verificando resolução de pacotes locais (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/catalog-data.test.mjs` para validação dos enums canônicos (6 categorias e 5 status de publicação) e rejeição de valores inválidos (Ref: R:Canonical Categories and Publication Statuses / S:Validação de categoria e status canônicos)
- [x] 2.2 [US1] Implementar `packages/shared/src/enums.ts`, `packages/shared/src/normalizer.ts`, `packages/shared/src/types.ts` e `packages/shared/src/index.ts` validando as 6 categorias e 5 status canônicos (Ref: R:Canonical Categories and Publication Statuses / S:Validação de categoria e status canônicos)
- [x] 2.3 [US1] Escrever testes automatizados em `tests/catalog-data.test.mjs` verificando o schema Prisma (`MediaItem`, `ItemGenre`, `ItemAlias`), a migration SQL inicial e a ativação da extensão `pg_trgm` (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm)
- [x] 2.4 [US1] Criar `apps/api/prisma/schema.prisma` e a migration `apps/api/prisma/migrations/20261108000000_init_catalog_data/migration.sql` provisionando `pg_trgm`, tabelas relacionais e índice GIN (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm)
- [x] 2.5 [US2] Escrever testes automatizados em `tests/catalog-data.test.mjs` para validar a execução idempotente do seed de 30 obras (5 de cada uma das 6 categorias × 5 status) sem duplicação (Ref: R:Deterministic Seed Population / S:Execução idempotente do seed)
- [x] 2.6 [US2] Implementar `apps/api/src/data/seed-data.ts` e `apps/api/src/data/seed.ts` com as 30 obras fictícias equilibradas e rotina idempotente de `upsert` por `slug` (Ref: R:Deterministic Seed Population / S:Execução idempotente do seed)
- [x] 2.7 [US3] Escrever testes automatizados em `tests/catalog-data.test.mjs` para obtenção de capa SVG válida por slug e fallback seguro para slug inexistente ou inválido (Ref: R:Local SVG Cover Serving and Fallback / S:Obtenção de capa válida por slug, S:Fallback para slug inexistente)
- [x] 2.8 [P] [US3] Gerar os 30 arquivos SVG originais em `apps/api/assets/covers/<slug>.svg`, o `_placeholder.svg` e implementar `apps/api/src/data/cover-storage.service.ts` com cabeçalho `image/svg+xml` e fallback (Ref: R:Local SVG Cover Serving and Fallback / S:Obtenção de capa válida por slug, S:Fallback para slug inexistente)

## 3. Validation & Integration

- [x] 3.1 Criar pontos de entrada `apps/api/src/index.ts` e `apps/web/src/index.ts` integrando `@yuukilist/shared` e executar a suíte completa de testes `node --test tests/catalog-data.test.mjs` comprovando os 5 cenários (Ref: R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm, R:Canonical Categories and Publication Statuses / S:Validação de categoria e status canônicos, R:Deterministic Seed Population / S:Execução idempotente do seed, R:Local SVG Cover Serving and Fallback / S:Obtenção de capa válida por slug, S:Fallback para slug inexistente)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Database Schema and Extension Provisioning | S:Migração inicial e extensão pg_trgm | 1.1, 1.2, 2.3, 2.4, 3.1 | apps/api/prisma/schema.prisma, apps/api/prisma/migrations/20261108000000_init_catalog_data/migration.sql | tests/catalog-data.test.mjs | integration-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Canonical Categories and Publication Statuses | S:Validação de categoria e status canônicos | 2.1, 2.2, 3.1 | packages/shared/src/enums.ts, packages/shared/src/normalizer.ts | tests/catalog-data.test.mjs | unit-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Deterministic Seed Population | S:Execução idempotente do seed | 2.5, 2.6, 3.1 | apps/api/src/data/seed-data.ts, apps/api/src/data/seed.ts | tests/catalog-data.test.mjs | integration-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Local SVG Cover Serving and Fallback | S:Obtenção de capa válida por slug | 2.7, 2.8, 3.1 | apps/api/src/data/cover-storage.service.ts | tests/catalog-data.test.mjs | unit-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Local SVG Cover Serving and Fallback | S:Fallback para slug inexistente | 2.7, 2.8, 3.1 | apps/api/src/data/cover-storage.service.ts | tests/catalog-data.test.mjs | unit-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Database Schema and Extension Provisioning / S:Migração inicial e extensão pg_trgm | 1.1, 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:Canonical Categories and Publication Statuses / S:Validação de categoria e status canônicos | 2.1, 2.2, 3.1 | COVERED |
| R:Deterministic Seed Population / S:Execução idempotente do seed | 2.5, 2.6, 3.1 | COVERED |
| R:Local SVG Cover Serving and Fallback / S:Obtenção de capa válida por slug | 2.7, 2.8, 3.1 | COVERED |
| R:Local SVG Cover Serving and Fallback / S:Fallback para slug inexistente | 2.7, 2.8, 3.1 | COVERED |

- **Constitution Check:** PASS (Monólito modular `apps/web`, `apps/api`, `packages/shared`; 6 categorias + 5 status canônicos; meta R$ 0 documentada em `## Research` do `design.md`; TDD-first respeitado).
- **Active Change Conflicts:** Nenhum conflito detectado (única mudança ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência.
- **Coverage Summary:** 100% dos 4 requisitos e 5 cenários normativos cobertos por tarefas de teste e implementação e mapeados na Traceability Matrix (`TR-001` a `TR-005`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.
