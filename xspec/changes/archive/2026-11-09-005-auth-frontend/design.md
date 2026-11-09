# Design: 005-auth-frontend

## Context

O YuukiList possui o backend de catálogo (R2), a interface web de catálogo (R3) e o subsistema de autenticação no backend (R4) totalmente operacionais. A API em `apps/api` expõe os endpoints REST `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout` e `/api/v1/auth/me`, gerenciando a sessão via cookie seguro `HttpOnly` (`yuukilist_session`).
Esta mudança implementa a camada de apresentação de autenticação no Next.js 15 App Router (`apps/web`), provendo formulários acessíveis no tema Dark Editorial, validação de campos no cliente, feedback resiliente de erros, gerenciamento de sessão global e proteção declarativa de rotas privadas.

## Goals / Non-Goals

**Goals:**
- Implementar cliente HTTP de autenticação (`AuthApiClient`) em `apps/web/src/services/` com suporte nativo a `credentials: 'include'`.
- Prover contexto global de autenticação (`AuthProvider` e hook `useAuth`) para disponibilizar o estado do usuário, verificação inicial de sessão no mount e ações (`login`, `register`, `logout`).
- Construir formulários acessíveis e responsivos para `/register` e `/login` com validação inline (`onBlur`/`onSubmit`), feedback visual de força de senha e prevenção de submissão duplicada.
- Prover componente de proteção de rotas (`ProtectedRoute`) para redirecionar anônimos para `/login?redirect=...` e redirecionar usuários já autenticados de volta para a home (`/`).
- Integrar ações de autenticação (botões de login/cadastro ou nome do usuário e botão de logout) no cabeçalho global em `apps/web/src/app/layout.tsx`.
- Cumprir 100% das diretrizes de acessibilidade WCAG 2.2 AA (foco visível, atributos ARIA, contraste mínimo).

**Non-Goals:**
- Telas de recuperação de senha por email (fora do escopo do MVP).
- Botões de autenticação social com provedores de terceiros (OAuth).
- Gestão de perfil avançado ou edição de dados cadastrais (escopo futuro).

## Decisions

1. **Transporte de Credenciais no Navegador (`credentials: 'include'`)**
   - **Escolha:** Todas as requisições do `AuthApiClient` configuram `credentials: 'include'`, permitindo que o cookie seguro `HttpOnly` (`yuukilist_session`) seja emitido, armazenado e transmitido nativamente pelo navegador sem necessidade de armazenamento inseguro em `localStorage`.
   - **Alternativas consideradas:** Armazenar JWT em `localStorage` ou `sessionStorage` (rejeitado por vulnerabilidade a XSS).
   - **Justificativa:** Adere às melhores práticas de segurança da OWASP para SPAs e ao princípio de proteção contra roubo de tokens.

2. **Validação Inline Híbrida (`onBlur` + `onSubmit`)**
   - **Escolha:** Validação ativada quando o campo perde o foco (`onBlur`) e revalidada no envio (`onSubmit`), exibindo mensagens explicativas em alerta com `aria-invalid="true"` e `aria-describedby`.
   - **Alternativas consideradas:** Validar apenas no submit; ou validar a cada tecla digitada (`onChange`).
   - **Justificativa:** Proporciona feedback imediato sem frustrar o usuário enquanto ele ainda está digitando.

3. **Redirecionamento Dinâmico com Query Parameter (`?redirect=...`)**
   - **Escolha:** Quando um usuário anônimo é interceptado por uma rota protegida, é redirecionado para `/login?redirect=/caminho/original`. Após a autenticação bem-sucedida, o formulário navega para o caminho indicado (ou `/` caso inexistente).
   - **Alternativas consideradas:** Redirecionamento fixo sempre para `/`.
   - **Justificativa:** Minimiza atritos e garante que o usuário retorne imediatamente à intenção original de navegação.

4. **Tratamento Resiliente de Erros da API**
   - **Escolha:** Mapeamento explícito de códigos HTTP da API (`400 Bad Request`, `401 Unauthorized`, `409 Conflict`) em mensagens contextuais em português amigáveis, sem apagar os dados preenchidos no formulário.
   - **Alternativas consideradas:** Exibir apenas mensagens genéricas ou alertas de `window.alert`.
   - **Justificativa:** Eleva a qualidade da experiência do usuário e atende aos requisitos de design Dark Editorial e WCAG.

## Risks / Trade-offs

- **[Risco] Flash de conteúdo não autenticado (FOUC) durante carregamento inicial de sessão** → **Mitigação:** O `ProtectedRoute` exibe um skeleton Dark Editorial discreto enquanto `isLoading` for verdadeiro antes de tomar a decisão de redirecionar.
- **[Risco] Loop de redirecionamento entre rotas públicas e privadas** → **Mitigação:** Validação estrita de rotas abertas (`/login`, `/register`, `/`, `/items/:slug`) que nunca exigem autenticação prévia.

## Migration Plan

1. A introdução de `/login` e `/register` não altera os endpoints da API nem as rotas públicas existentes (`/` e `/items/:slug`).
2. Rollback: caso ocorra regressão, o cabeçalho pode voltar a operar em modo público desacoplado.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/services/auth-api.client.ts` — Cliente HTTP tipado com métodos `register`, `login`, `logout` e `getMe`.
- `[CREATE]` `apps/web/src/context/auth-context.tsx` — Provedor de contexto `AuthProvider` e hook `useAuth`.
- `[CREATE]` `apps/web/src/components/auth/register-form.tsx` — Componente de formulário de cadastro com validação inline e feedback.
- `[CREATE]` `apps/web/src/components/auth/login-form.tsx` — Componente de formulário de login com identificador híbrido e redirecionamento.
- `[CREATE]` `apps/web/src/components/auth/protected-route.tsx` — Componente wrapper para proteção de páginas privadas.
- `[CREATE]` `apps/web/src/app/register/page.tsx` — Rota pública `/register`.
- `[CREATE]` `apps/web/src/app/login/page.tsx` — Rota pública `/login`.
- `[MODIFY]` `apps/web/src/app/layout.tsx` — Envolvimento da aplicação no `AuthProvider` e botões de autenticação no cabeçalho.
- `[MODIFY]` `apps/web/src/index.ts` — Re-exportação do cliente de autenticação.
- `[CREATE]` `tests/auth-frontend.test.mjs` — Suíte de testes automatizados cobrindo os 9 cenários normativos da UI de autenticação.

## Data Model

### Estado de Autenticação no Cliente (`AuthContextState`)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `user` | `AuthUserResponse \| null` | Dados do usuário autenticado ou `null` quando anônimo |
| `isLoading` | `boolean` | Indicador de verificação ou submissão de sessão em andamento |
| `error` | `string \| null` | Mensagem de erro amigável ativa ou `null` |
| `isAuthenticated` | `boolean` | Getter computado indicando se `user !== null` |

## Contracts

### Contrato Front ↔ Back
- **`AuthApiClient.register(dto: RegisterDto)`**
  - Chama `POST /api/v1/auth/register` com `credentials: 'include'`.
  - Retorna `AuthUserResponse`.
  - Emite exceção `AuthApiError` com `statusCode` e mensagem explicativa.
- **`AuthApiClient.login(dto: LoginDto)`**
  - Chama `POST /api/v1/auth/login` com `credentials: 'include'`.
  - Retorna `AuthUserResponse`.
  - Emite exceção `AuthApiError` com `statusCode` (ex.: 401 para credenciais incorretas).
- **`AuthApiClient.logout()`**
  - Chama `POST /api/v1/auth/logout` com `credentials: 'include'`.
  - Retorna `{ success: true }`.
- **`AuthApiClient.getMe()`**
  - Chama `GET /api/v1/auth/me` com `credentials: 'include'`.
  - Retorna `AuthUserResponse` ou `null` caso retorne 401 (anônimo).

## Research

- **Next.js 15 Client vs Server Components:** A verificação de sessão e renderização interativa dos formulários é encapsulada em Client Components (`'use client'`) com hooks de navegação do App Router (`useRouter`, `useSearchParams`).
- **Dark Editorial Tokens:** Formulários utilizam cartões com superfície `#121520`, bordas sutis `#181C2B`, campos de texto com foco ciano `#06B6D4`, textos secundários `#94A3B8` e mensagens de erro `#EF4444`, garantindo contraste mínimo de 4.5:1 exigido pela WCAG 2.2 AA.
- **Custo Zero Permanente (Princípio IV):** Operação 100% nativa sem bibliotecas externas pagas ou dependências de widgets proprietários.

