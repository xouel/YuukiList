# Tasks: 027-editorial-auth-experience

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD em `tests/editorial-auth-experience.test.mjs` cobrindo o contêiner 5+7, alternância fluida de abas, visibilidade de senha e erradicação de cores legadas (Ref: R:User Login Interface and Session Recovery / S:Apresentacao da vitrine lateral do dossie com citacao e selos)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar o componente unificado `AuthDossierCard` em `apps/web/src/components/auth/auth-dossier-card.tsx` com layout 5+7, vitrine lateral editorial com citação e selos e abas de alternância Entrar/Cadastrar (Ref: R:User Login Interface and Session Recovery / S:Alternancia fluida de abas entre entrar e cadastrar no mesmo card)
- [x] 2.2 [P] [US2] Refatorar `LoginForm` em `apps/web/src/components/auth/login-form.tsx` integrando à paleta Asian Editorial, adicionando botão tátil de visibilidade de senha de 44px e removendo cores legadas (Ref: R:User Login Interface and Session Recovery / S:Alternador de visibilidade de senha no formulario de login)
- [x] 2.3 [P] [US2] Refatorar `RegisterForm` em `apps/web/src/components/auth/register-form.tsx` integrando à paleta Asian Editorial, adicionando botão tátil de visibilidade de senha de 44px e removendo cores legadas (Ref: R:User Registration Interface and Client-Side Validation / S:Alternador de visibilidade de senha no formulario de cadastro)
- [x] 2.4 [US1] [US3] Atualizar as páginas `apps/web/src/app/login/page.tsx` e `apps/web/src/app/register/page.tsx` para renderizar `AuthDossierCard` com tratamento de redirecionamento dinâmico e proteção de sessão (Ref: R:User Login Interface and Session Recovery / S:Redirecionamento de usuário já autenticado ao acessar tela de login)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes TDD `tests/editorial-auth-experience.test.mjs` e a regressão completa do monorepo (`npm test`), comprovando aprovação de 100% dos testes sem falhas (Ref: R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico)
- [x] 3.2 Validar a acessibilidade visual (anéis de foco, alvos táteis mínimos de 44x44px, contraste WCAG 2.2 AA e ausência estrita de emojis) e a integridade do build de produção Next.js (Ref: R:User Registration Interface and Client-Side Validation / S:Validação inline de campos e feedback visual de erro)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:User Registration Interface and Client-Side Validation | S:Submissão bem-sucedida de cadastro com redirecionamento | 1.1, 2.3, 3.1 | apps/web/src/components/auth/register-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:User Registration Interface and Client-Side Validation | S:Validação inline de campos e feedback visual de erro | 1.1, 2.3, 3.2 | apps/web/src/components/auth/register-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:User Registration Interface and Client-Side Validation | S:Exibição de feedback de erro de colisão retornado pela API | 1.1, 2.3, 3.1 | apps/web/src/components/auth/register-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:User Registration Interface and Client-Side Validation | S:Alternador de visibilidade de senha no formulario de cadastro | 1.1, 2.3, 3.2 | apps/web/src/components/auth/register-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:User Login Interface and Session Recovery | S:Login bem-sucedido com redirecionamento dinâmico | 1.1, 2.2, 2.4, 3.1 | apps/web/src/components/auth/login-form.tsx, apps/web/src/app/login/page.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:User Login Interface and Session Recovery | S:Feedback de erro para credenciais incorretas | 1.1, 2.2, 3.1 | apps/web/src/components/auth/login-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:User Login Interface and Session Recovery | S:Redirecionamento de usuário já autenticado ao acessar tela de login | 1.1, 2.4, 3.1 | apps/web/src/app/login/page.tsx, apps/web/src/app/register/page.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:User Login Interface and Session Recovery | S:Alternancia fluida de abas entre entrar e cadastrar no mesmo card | 1.1, 2.1, 3.1 | apps/web/src/components/auth/auth-dossier-card.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:User Login Interface and Session Recovery | S:Alternador de visibilidade de senha no formulario de login | 1.1, 2.2, 3.2 | apps/web/src/components/auth/login-form.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:User Login Interface and Session Recovery | S:Apresentacao da vitrine lateral do dossie com citacao e selos | 1.1, 2.1, 3.2 | apps/web/src/components/auth/auth-dossier-card.tsx | tests/editorial-auth-experience.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento | 1.1, 2.3, 3.1 | COVERED |
| R:User Registration Interface and Client-Side Validation / S:Validação inline de campos e feedback visual de erro | 1.1, 2.3, 3.2 | COVERED |
| R:User Registration Interface and Client-Side Validation / S:Exibição de feedback de erro de colisão retornado pela API | 1.1, 2.3, 3.1 | COVERED |
| R:User Registration Interface and Client-Side Validation / S:Alternador de visibilidade de senha no formulario de cadastro | 1.1, 2.3, 3.2 | COVERED |
| R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico | 1.1, 2.2, 2.4, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Feedback de erro para credenciais incorretas | 1.1, 2.2, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Redirecionamento de usuário já autenticado ao acessar tela de login | 1.1, 2.4, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Alternancia fluida de abas entre entrar e cadastrar no mesmo card | 1.1, 2.1, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Alternador de visibilidade de senha no formulario de login | 1.1, 2.2, 3.2 | COVERED |
| R:User Login Interface and Session Recovery / S:Apresentacao da vitrine lateral do dossie com citacao e selos | 1.1, 2.1, 3.2 | COVERED |

- **Constitution Check:** PASS (Zero custo permanente, ausência de pacotes externos desnecessários, conformidade estrita com monorepo, WCAG 2.2 AA com alvos de 44x44px e erradicação de emojis).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas uma mudança ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada (perguntas do Clarification Gate totalmente respondidas).
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas de implementação e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
