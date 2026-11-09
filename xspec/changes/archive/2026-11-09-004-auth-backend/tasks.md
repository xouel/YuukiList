# Tasks: 004-auth-backend

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Modelar a entidade `User` em `apps/api/prisma/schema.prisma`, criar a migration inicial de usuários `apps/api/prisma/migrations/20261109000000_add_users/migration.sql` e definir os contratos/DTOs em `packages/shared/src/auth.ts` (Ref: R:User Registration and Password Security / S:Cadastro de novo usuário com dados válidos)
- [x] 1.2 [P] Implementar o serviço de derivação de senhas `PasswordService` com `crypto.scrypt` e o serviço de tokens de sessão `TokenService` com HMAC-SHA256 em `apps/api/src/auth/` (Ref: R:User Registration and Password Security / S:Rejeição de cadastro com dados inválidos ou senha fraca)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/auth-backend.test.mjs` para cadastro de usuário, persistência de senha com hash seguro, validação de formato e rejeição de identificadores duplicados (Ref: R:User Registration and Password Security / S:Cadastro de novo usuário com dados válidos, S:Rejeição de cadastro com identificador duplicado, S:Rejeição de cadastro com dados inválidos ou senha fraca)
- [x] 2.2 [US1] Implementar `UsersRepository`, método `register` em `AuthService` e endpoint `POST /api/v1/auth/register` com cookie de sessão em `apps/api/src/auth/` (Ref: R:User Registration and Password Security / S:Cadastro de novo usuário com dados válidos, S:Rejeição de cadastro com identificador duplicado, S:Rejeição de cadastro com dados inválidos ou senha fraca)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/auth-backend.test.mjs` para login com identificador híbrido (email ou username), rejeição de credenciais incorretas com mitigação de enumeração e logout com invalidação de cookie (Ref: R:User Authentication and Session Issuance / S:Autenticação bem-sucedida via email ou username, S:Rejeição de credenciais incorretas ou usuário inexistente, S:Encerramento de sessão com logout)
- [x] 2.4 [US2] Implementar métodos `login` e `logout` em `AuthService` e endpoints `POST /api/v1/auth/login` e `POST /api/v1/auth/logout` em `apps/api/src/auth/auth.controller.ts` (Ref: R:User Authentication and Session Issuance / S:Autenticação bem-sucedida via email ou username, S:Rejeição de credenciais incorretas ou usuário inexistente, S:Encerramento de sessão com logout)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/auth-backend.test.mjs` para endpoint `GET /api/v1/auth/me`, `AuthGuard` bloqueando acessos anônimos e suporte a header `Authorization: Bearer` (Ref: R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me, S:Bloqueio de acesso a rota protegida sem credenciais, S:Autenticação alternativa via Header Authorization Bearer)
- [x] 2.6 [P] [US3] Implementar `AuthGuard`, decorator `@CurrentUser()`, endpoint `GET /api/v1/auth/me` e integrar `AuthModule` no `AppModule` em `apps/api/src/` (Ref: R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me, S:Bloqueio de acesso a rota protegida sem credenciais, S:Autenticação alternativa via Header Authorization Bearer)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes de autenticação em `tests/auth-backend.test.mjs` e a validação integrada com o catálogo de dados comprovando os 9 cenários normativos e conformidade com a Traceability Matrix (Ref: R:User Registration and Password Security / S:Cadastro de novo usuário com dados válidos, S:Rejeição de cadastro com identificador duplicado, S:Rejeição de cadastro com dados inválidos ou senha fraca, R:User Authentication and Session Issuance / S:Autenticação bem-sucedida via email ou username, S:Rejeição de credenciais incorretas ou usuário inexistente, S:Encerramento de sessão com logout, R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me, S:Bloqueio de acesso a rota protegida sem credenciais, S:Autenticação alternativa via Header Authorization Bearer)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:User Registration and Password Security | S:Cadastro de novo usuário com dados válidos | 1.1, 1.2, 2.1, 2.2, 3.1 | apps/api/src/auth/auth.service.ts, apps/api/src/auth/auth.controller.ts, apps/api/src/auth/users.repository.ts, packages/shared/src/auth.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:User Registration and Password Security | S:Rejeição de cadastro com identificador duplicado | 1.1, 2.1, 2.2, 3.1 | apps/api/src/auth/auth.service.ts, apps/api/src/auth/users.repository.ts, apps/api/src/auth/errors.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:User Registration and Password Security | S:Rejeição de cadastro com dados inválidos ou senha fraca | 1.1, 1.2, 2.1, 2.2, 3.1 | apps/api/src/auth/auth.service.ts, packages/shared/src/auth.ts, apps/api/src/auth/errors.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:User Authentication and Session Issuance | S:Autenticação bem-sucedida via email ou username | 1.2, 2.3, 2.4, 3.1 | apps/api/src/auth/auth.service.ts, apps/api/src/auth/auth.controller.ts, apps/api/src/auth/token.service.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:User Authentication and Session Issuance | S:Rejeição de credenciais incorretas ou usuário inexistente | 1.2, 2.3, 2.4, 3.1 | apps/api/src/auth/auth.service.ts, apps/api/src/auth/password.service.ts, apps/api/src/auth/errors.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:User Authentication and Session Issuance | S:Encerramento de sessão com logout | 1.2, 2.3, 2.4, 3.1 | apps/api/src/auth/auth.service.ts, apps/api/src/auth/auth.controller.ts, apps/api/src/auth/token.service.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Identity Verification and Route Protection | S:Consulta de perfil do usuário autenticado no endpoint me | 2.5, 2.6, 3.1 | apps/api/src/auth/auth.controller.ts, apps/api/src/auth/auth.guard.ts, apps/api/src/auth/current-user.decorator.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Identity Verification and Route Protection | S:Bloqueio de acesso a rota protegida sem credenciais | 2.5, 2.6, 3.1 | apps/api/src/auth/auth.guard.ts, apps/api/src/auth/errors.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Identity Verification and Route Protection | S:Autenticação alternativa via Header Authorization Bearer | 2.5, 2.6, 3.1 | apps/api/src/auth/token.service.ts, apps/api/src/auth/auth.guard.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:User Registration and Password Security / S:Cadastro de novo usuário com dados válidos | 1.1, 1.2, 2.1, 2.2, 3.1 | COVERED |
| R:User Registration and Password Security / S:Rejeição de cadastro com identificador duplicado | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:User Registration and Password Security / S:Rejeição de cadastro com dados inválidos ou senha fraca | 1.1, 1.2, 2.1, 2.2, 3.1 | COVERED |
| R:User Authentication and Session Issuance / S:Autenticação bem-sucedida via email ou username | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:User Authentication and Session Issuance / S:Rejeição de credenciais incorretas ou usuário inexistente | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:User Authentication and Session Issuance / S:Encerramento de sessão com logout | 1.2, 2.3, 2.4, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me | 2.5, 2.6, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Bloqueio de acesso a rota protegida sem credenciais | 2.5, 2.6, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Autenticação alternativa via Header Authorization Bearer | 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Soberania de dados e custo zero preservados; derivação criptográfica nativa sem dependências comerciais ou externas; contratos tipados e isolamento modular).
- **Active Change Conflicts:** PASS (Nenhum conflito com outras mudanças ativas).
- **Ambiguities / Underspecification:** PASS (Decisões de clarificação para identificador híbrido, cookie HttpOnly com fallback bearer e algoritmo scrypt integradas).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 9 cenários cobertos por tarefas com precedência de testes (TDD) e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-009`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Ajuste de importação de contratos em `apps/api/src/auth/`: uso de caminhos relativos para `packages/shared/src/index.ts` e anotações explícitas `import type` para evitar falha de resolução em tempo de execução com `--experimental-strip-types` do Node.js 24.
