# Tasks: 005-auth-frontend

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar o cliente de autenticação tipado `AuthApiClient` em `apps/web/src/services/auth-api.client.ts` com suporte a `credentials: 'include'` e tratamento de erros de API (Ref: R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento)
- [x] 1.2 [P] Implementar o contexto de autenticação no cliente `AuthProvider` e hook `useAuth` em `apps/web/src/context/auth-context.tsx` (Ref: R:Route Protection and Client Session Context / S:Exibição do estado logado e botão de logout no cabeçalho global)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/auth-frontend.test.mjs` para validação inline de formulário, submissão de cadastro com redirecionamento e tratamento de erro 409 Conflict da API (Ref: R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento, S:Validação inline de campos e feedback visual de erro, S:Exibição de feedback de erro de colisão retornado pela API)
- [x] 2.2 [US1] Implementar o componente de formulário de cadastro `RegisterForm` e a página `/register` em `apps/web/src/app/register/page.tsx` no tema Dark Editorial com WCAG 2.2 AA (Ref: R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento, S:Validação inline de campos e feedback visual de erro, S:Exibição de feedback de erro de colisão retornado pela API)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/auth-frontend.test.mjs` para login com identificador híbrido, redirecionamento dinâmico baseado em `?redirect`, feedback de erro 401 e proteção contra acesso direto de usuário já logado (Ref: R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico, S:Feedback de erro para credenciais incorretas, S:Redirecionamento de usuário já autenticado ao acessar tela de login)
- [x] 2.4 [US2] Implementar o componente `LoginForm` e a página `/login` em `apps/web/src/app/login/page.tsx` com tratamento amigável de credenciais e redirecionamento dinâmico (Ref: R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico, S:Feedback de erro para credenciais incorretas, S:Redirecionamento de usuário já autenticado ao acessar tela de login)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/auth-frontend.test.mjs` para componente `ProtectedRoute`, exibição de botões de login ou usuário/logout no cabeçalho e encerramento de sessão (Ref: R:Route Protection and Client Session Context / S:Redirecionamento de usuário não autenticado ao acessar rota protegida, S:Exibição do estado logado e botão de logout no cabeçalho global, S:Encerramento de sessão no cliente ao acionar ação de logout)
- [x] 2.6 [P] [US3] Implementar o componente `ProtectedRoute`, atualizar o cabeçalho global em `apps/web/src/app/layout.tsx` e reexportar clientes de autenticação em `apps/web/src/index.ts` (Ref: R:Route Protection and Client Session Context / S:Redirecionamento de usuário não autenticado ao acessar rota protegida, S:Exibição do estado logado e botão de logout no cabeçalho global, S:Encerramento de sessão no cliente ao acionar ação de logout)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes de frontend em `tests/auth-frontend.test.mjs` e a integração completa com as fatias prévias validando os 9 cenários normativos e conformidade com a Traceability Matrix (Ref: R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento, S:Validação inline de campos e feedback visual de erro, S:Exibição de feedback de erro de colisão retornado pela API, R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico, S:Feedback de erro para credenciais incorretas, S:Redirecionamento de usuário já autenticado ao acessar tela de login, R:Route Protection and Client Session Context / S:Redirecionamento de usuário não autenticado ao acessar rota protegida, S:Exibição do estado logado e botão de logout no cabeçalho global, S:Encerramento de sessão no cliente ao acionar ação de logout)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:User Registration Interface and Client-Side Validation | S:Submissão bem-sucedida de cadastro com redirecionamento | 1.1, 2.1, 2.2, 3.1 | apps/web/src/services/auth-api.client.ts, apps/web/src/components/auth/register-form.tsx, apps/web/src/components/auth/validation.ts | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:User Registration Interface and Client-Side Validation | S:Validação inline de campos e feedback visual de erro | 2.1, 2.2, 3.1 | apps/web/src/components/auth/register-form.tsx, apps/web/src/components/auth/validation.ts | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:User Registration Interface and Client-Side Validation | S:Exibição de feedback de erro de colisão retornado pela API | 1.1, 2.1, 2.2, 3.1 | apps/web/src/services/auth-api.client.ts, apps/web/src/components/auth/register-form.tsx | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:User Login Interface and Session Recovery | S:Login bem-sucedido com redirecionamento dinâmico | 1.1, 2.3, 2.4, 3.1 | apps/web/src/services/auth-api.client.ts, apps/web/src/components/auth/login-form.tsx | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:User Login Interface and Session Recovery | S:Feedback de erro para credenciais incorretas | 1.1, 2.3, 2.4, 3.1 | apps/web/src/services/auth-api.client.ts, apps/web/src/components/auth/login-form.tsx, apps/web/src/components/auth/validation.ts | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:User Login Interface and Session Recovery | S:Redirecionamento de usuário já autenticado ao acessar tela de login | 2.3, 2.4, 3.1 | apps/web/src/app/login/page.tsx, apps/web/src/app/register/page.tsx | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Route Protection and Client Session Context | S:Redirecionamento de usuário não autenticado ao acessar rota protegida | 2.5, 2.6, 3.1 | apps/web/src/components/auth/protected-route.tsx | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Route Protection and Client Session Context | S:Exibição do estado logado e botão de logout no cabeçalho global | 1.2, 2.5, 2.6, 3.1 | apps/web/src/components/layout/header-nav.tsx, apps/web/src/context/auth-context.tsx, apps/web/src/app/layout.tsx | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Route Protection and Client Session Context | S:Encerramento de sessão no cliente ao acionar ação de logout | 1.2, 2.5, 2.6, 3.1 | apps/web/src/components/layout/header-nav.tsx, apps/web/src/context/auth-context.tsx, apps/web/src/services/auth-api.client.ts | tests/auth-frontend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:User Registration Interface and Client-Side Validation / S:Submissão bem-sucedida de cadastro com redirecionamento | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:User Registration Interface and Client-Side Validation / S:Validação inline de campos e feedback visual de erro | 2.1, 2.2, 3.1 | COVERED |
| R:User Registration Interface and Client-Side Validation / S:Exibição de feedback de erro de colisão retornado pela API | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Login bem-sucedido com redirecionamento dinâmico | 1.1, 2.3, 2.4, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Feedback de erro para credenciais incorretas | 1.1, 2.3, 2.4, 3.1 | COVERED |
| R:User Login Interface and Session Recovery / S:Redirecionamento de usuário já autenticado ao acessar tela de login | 2.3, 2.4, 3.1 | COVERED |
| R:Route Protection and Client Session Context / S:Redirecionamento de usuário não autenticado ao acessar rota protegida | 2.5, 2.6, 3.1 | COVERED |
| R:Route Protection and Client Session Context / S:Exibição do estado logado e botão de logout no cabeçalho global | 1.2, 2.5, 2.6, 3.1 | COVERED |
| R:Route Protection and Client Session Context / S:Encerramento de sessão no cliente ao acionar ação de logout | 1.2, 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Next.js 15 App Router no tema Dark Editorial; conformidade WCAG 2.2 AA; zero dependências comerciais pagas; custo permanente R$ 0).
- **Active Change Conflicts:** PASS (Nenhum conflito com outras mudanças ativas).
- **Ambiguities / Underspecification:** PASS (Decisões de clarificação para redirecionamento dinâmico, proteção de rotas e validação inline integradas).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 9 cenários cobertos por tarefas com precedência de testes (TDD) e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-009`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Isolamento dos validadores de formulário em `apps/web/src/components/auth/validation.ts` para permitir importação e execução de testes em ambiente Node.js puro sem depender de carregador JSX/TSX.
