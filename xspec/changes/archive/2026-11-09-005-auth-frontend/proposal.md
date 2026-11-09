# Proposal: 005-auth-frontend

> **X-Spec** · ID: `005-auth-frontend` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de interfaces web acessíveis e responsivas para permitir aos usuários cadastrar contas, realizar login, visualizar o estado da sessão ativa e navegar com segurança entre áreas públicas e privadas no Next.js 15 App Router (Fase 2 do PRD). Esta mudança implementa as telas `/register` e `/login` no tema Dark Editorial com WCAG 2.2 AA, validação inline em tempo real, tratamento de estados assíncronos (carregamento, erros de API como 409 Conflict ou 401 Unauthorized), provedor de contexto de autenticação no cliente (`AuthContext`) e guarda de proteção de rotas privadas com redirecionamento inteligente.

## What Changes

- Criação do cliente de autenticação em `apps/web/src/services/auth-api.client.ts` integrado aos endpoints `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout` e `/api/v1/auth/me`.
- Implementação do provedor de estado de autenticação no cliente (`AuthProvider` e hook `useAuth`) para gerenciar o usuário logado, estado de carregamento e métodos de ação (`login`, `register`, `logout`).
- Página de cadastro de conta em `apps/web/src/app/register/page.tsx` com formulário contendo campos de email, username e senha, validação inline (`onBlur`/`onSubmit`), feedback visual de requisitos de senha e botão com estado de loading.
- Página de login em `apps/web/src/app/login/page.tsx` com formulário aceitando identificador híbrido (`identifier`: email ou username) e senha, feedback de erro amigável em credenciais inválidas e redirecionamento dinâmico baseado no query param `?redirect=/destino`.
- Atualização do cabeçalho global da aplicação (`apps/web/src/app/layout.tsx`) exibindo botões de "Entrar" e "Criar Conta" quando anônimo, ou nome do usuário e botão "Sair" (logout) quando autenticado.
- Componente de guarda de rota (`ProtectedRoute`) e middleware/wrapper para proteção de rotas privadas, redirecionando usuários não autenticados para `/login?redirect=...` e redirecionando usuários já logados que tentam acessar `/login` ou `/register` de volta para `/`.
- Conformidade estrita com acessibilidade WCAG 2.2 AA (rótulos explícitos, `aria-invalid`, `aria-describedby`, contraste mínimo e navegação completa por teclado).

## Capabilities

### New Capabilities
- `auth-ui`: Interface de usuário para autenticação, formulários de cadastro e login, feedback visual e proteção de rotas privadas no Next.js.

### Modified Capabilities
- Nenhuma.

## Impact

- **Frontend (`apps/web`):** Novas rotas `/login` e `/register`, novos componentes de formulário em `apps/web/src/components/auth/`, contexto de autenticação em `apps/web/src/context/` e cliente HTTP de autenticação.
- **Layout Global:** Adição de ações de autenticação e estado do usuário no header de `apps/web/src/app/layout.tsx`.
- **Contratos (`packages/shared`):** Consumo direto de DTOs e validadores de `@yuukilist/shared`.

## User Stories

### US1 — Cadastro de Conta na Interface Web (Priority: P1)
Como visitante do YuukiList,
Quero acessar a página `/register` e preencher meus dados com validação imediata,
Para criar minha conta e ser redirecionado para a aplicação autenticado sem atritos.

- **Why this priority:** É a primeira etapa do funil de conversão para uso da biblioteca pessoal na Fase 3.
- **Independent Test:** Preencher o formulário em `/register` com dados válidos, verificar o estado de loading durante a requisição e confirmar o redirecionamento para a página inicial com o cabeçalho exibindo o nome de usuário.

### US2 — Login com Feedback Resiliente e Redirecionamento Dinâmico (Priority: P1)
Como usuário cadastrado,
Quero fazer login em `/login` informando meu username ou email,
Para restaurar minha sessão de onde parei e ser levado de volta à página que eu estava tentando acessar.

- **Why this priority:** Permite o retorno e a reutilização fluida da aplicação por usuários registrados.
- **Independent Test:** Submeter credenciais incorretas e verificar mensagem clara de erro sem recarregar a página; submeter credenciais válidas com parâmetro `?redirect=/items/slug` e confirmar redirecionamento exato.

### US3 — Sessão Ativa, Logout e Proteção de Rotas Privadas (Priority: P2)
Como usuário da plataforma,
Quero visualizar claramente meu estado logado no topo da página, poder sair com um clique e ser protegido contra acessos desautorizados,
Para ter transparência sobre minha identidade e segurança dos meus dados pessoais.

- **Why this priority:** Garante o ciclo completo de sessão e pavimenta a proteção da biblioteca pessoal na fatia R6.
- **Independent Test:** Acessar rota privada sem estar autenticado e verificar redirecionamento para `/login?redirect=...`; clicar no botão de logout e confirmar que a sessão é limpa e os botões de login reaparecem.

## Success Criteria

- **SC-001**: O formulário de cadastro valida campos inline e exibe mensagens de erro com semântica de acessibilidade (`aria-invalid="true"` e `aria-describedby`).
- **SC-002**: O formulário de login permite autenticação tanto por email quanto por username e redireciona para `?redirect` ou `/`.
- **SC-003**: Respostas de erro da API (400, 401, 409) são interceptadas e apresentadas em alertas visuais integrados no tema Dark Editorial.
- **SC-004**: Usuários não autenticados que tentam acessar rotas protegidas são redirecionados para `/login` preservando a URL de destino.
- **SC-005**: Usuários autenticados que acessam `/login` ou `/register` são redirecionados automaticamente para `/`.
- **SC-006**: 100% dos fluxos de autenticação funcionam com navegação por teclado e satisfazem contraste mínimo WCAG 2.2 AA.

## Edge Cases

- Tentativa de submissão com campos vazios (deve destacar todos os campos pendentes e focar no primeiro campo inválido).
- Erro 409 Conflict da API (deve destacar visualmente o campo de email ou username e exibir mensagem amigável sem perda dos dados digitados).
- Tentativa de logout com falha de rede temporária (deve forçar limpeza local do estado e redirecionar com segurança).
- Usuário clica repetidamente no botão de submissão (deve desabilitar o botão durante a requisição assíncrona prevenindo duplo submit).

## Out of Scope

- Interface de recuperação de senha por email (fora do escopo do MVP).
- Botões de login social via OAuth externo (Google, Apple, etc.).
- Edição de foto de perfil ou configurações avançadas de conta (escopos futuros).

## Clarifications

### Session 2026-11-09
- Q: Qual a política de redirecionamento pós-login/cadastro? → A: Redirecionamento dinâmico via `?redirect=/destino`, com fallback padrão para `/`.
- Q: Como tratar usuários já autenticados que acessam `/login` ou `/register`? → A: Redirecionamento automático imediato para `/`.
- Q: Qual o comportamento de validação e feedback inline nos formulários? → A: Validação no `onBlur` e no `onSubmit` com mensagens visuais no tema Dark Editorial e atributos de acessibilidade WCAG (`aria-invalid` e `aria-describedby`).

