# Design: 040-auth-feedback-and-password-recovery

## Context

O fluxo de autenticação atual do YuukiList possui dois blocos acoplados entre `apps/api/src/auth/*`, `packages/shared/src/auth.ts` e `apps/web/src/*`:
1. `AuthProvider` (`apps/web/src/context/auth-context.tsx`) usa o mesmo booleano global `isLoading` tanto para hidratação inicial (`/api/v1/auth/me`) quanto para submissões de `login()` e `register()`, fazendo `LoginPage`/`RegisterPage` desmontarem `<AuthDossierCard />` e perderem estados de erro e campos preenchidos a cada falha. Além disso, `RegisterForm` descarta a mensagem do backend em erros `409`, `UsersRepository.create` captura erros do Prisma silenciosamente em RAM, e `login/route.ts` converte qualquer falha inesperada em `401`.
2. O projeto não possui fluxo nem infraestrutura de recuperação de senha (`PasswordResetToken` ou envio de e-mail) e roda na Vercel (`yuuki-list-two.vercel.app`) sem domínio próprio DNS configurado, sob a diretriz permanente de custo R$ 0 (`xspec/constitution.md`).

## Goals / Non-Goals

**Goals:**
- Garantir que `LoginForm` e `RegisterForm` permaneçam montados durante e após submissões com erro, preservando valores digitados, exibindo alertas claros (`role="alert"`), destacando o campo específico em colisão no cadastro (`email` vs. `username`) e mantendo o foco no campo de senha após `401` no login.
- Diferenciar falhas `401` de erros `400` (validação) e `500`/rede no login e eliminar criação silenciosa de usuário em memória quando o Prisma estiver configurado.
- Implementar recuperação de senha segura com token aleatório de 32 bytes (armazenado apenas como hash SHA-256), TTL de 30 minutos, uso único atômico, cooldown de 60 segundos por conta, resposta anti-enumeração neutra, revogação de sessões JWT anteriores via `tokenVersion` e envio gratuito via Brevo HTTP API v3 (com fallback console/memória em dev e testes).

**Non-Goals:**
- Provedores OAuth externos (Google/GitHub/Discord).
- Verificação obrigatória de e-mail no cadastro inicial.
- Instalação de novas bibliotecas de SMTP/SDK pagas ou que exijam domínio próprio pago para envio inicial.

## Decisions

1. **Desacoplar `isLoading` global do submit nos formulários**
   - **Escolha:** Manter `isLoading` no `AuthProvider` exclusivamente para hidratação inicial (`getMe()`) e `logout()`, removendo `setIsLoading(true/false)` dentro de `login()` e `register()`, pois `LoginForm` e `RegisterForm` já gerenciam `isSubmitting` localmente.
   - **Alternativas consideradas:** Criar um segundo estado `isAuthActionLoading` no contexto ou mover `LoginPage`/`RegisterPage` para não checar `isLoading`.
   - **Justificativa:** Menor superfície de mudança, zero risco de quebrar `ProtectedRoute` e preservação imediata do estado local de abas, inputs e alertas de `<AuthDossierCard />`.

2. **Erro estruturado `409` por campo e propagação de `P2002` / erros de banco**
   - **Escolha:** Estender `UserAlreadyExistsError` com `code` (`'EMAIL_ALREADY_EXISTS' | 'USERNAME_ALREADY_EXISTS'`) e `field` (`'email' | 'username'`). Remover o fallback silencioso em RAM dentro de `UsersRepository.create` quando `this.prisma` estiver ativo, mapeando `P2002` (unique constraint) pelo campo alvo (`email`/`username`) e propagando demais erros do banco com status `500`.
   - **Alternativas consideradas:** Inferir o campo por regex da mensagem de erro no frontend.
   - **Justificativa:** Contratos explícitos em TypeScript (`packages/shared/src/auth.ts`) evitam acoplamento frágil a strings de UI e garantem comportamento determinístico sob concorrência.

3. **Tokens de redefinição persistidos como SHA-256 + `tokenVersion` em `User`**
   - **Escolha:** Criar model `PasswordResetToken` (`password_reset_tokens`) com `tokenHash` (`SHA-256` hex do token aleatório `crypto.randomBytes(32).toString('base64url')`), `expiresAt` (+30 min), `usedAt` (`DateTime?`) e `createdAt`. Adicionar `tokenVersion Int @default(0)` em `User`, incluí-lo em `SessionPayload` e validá-lo em `AuthGuard.validateRequest`.
   - **Alternativas consideradas:** JWT stateless como token de reset ou guardar token puro no banco.
   - **Justificativa:** Tokens stateful em hash SHA-256 garantem uso único atômico (`updateMany` onde `usedAt: null`), invalidam solicitações antigas ao emitir nova, e `tokenVersion` revoga sessões JWT antigas assim que a senha muda sem precisar de tabela extra de sessões.

4. **Provedor de e-mail gratuito via Brevo HTTP API v3 (`fetch` nativo)**
   - **Escolha:** Criar `EmailService` em `apps/api/src/auth/email.service.ts` usando `fetch('https://api.brevo.com/v3/smtp/email')` quando `BREVO_API_KEY` (e `MAIL_FROM`) estiverem configuradas, e modo `capture`/`console` em desenvolvimento e testes automatizados quando ausente.
   - **Alternativas consideradas:** Resend API ou Nodemailer + Gmail SMTP.
   - **Justificativa:** Verificado na seção `## Research`: Resend gratuito bloqueia envio para terceiros com `onboarding@resend.dev` sem domínio DNS próprio (o app está em `yuuki-list-two.vercel.app`); Nodemailer exigiria dependência nova e Senha de App pessoal; Brevo oferece 300 e-mails/dia gratuitos permanentes via HTTP puro (`fetch`), sem dependências novas e com fácil troca futura via porta `IEmailService`.

## Risks / Trade-offs

- **[Risco]** Sem domínio próprio com SPF/DKIM verificados, e-mails enviados por provedores gratuitos podem eventualmente cair na pasta de spam → **Mitigação:** Template HTML+texto limpo focado em link único transacional e orientação explícita na UI de `/forgot-password` para verificar a caixa de spam.
- **[Risco]** Execução em produção antes do usuário cadastrar `BREVO_API_KEY` na Vercel → **Mitigação:** Nunca expor token no response HTTP em produção; lançar erro controlado de configuração ausente registrado em log e documentar as variáveis necessárias em `.env.example`.
- **[Risco]** Cota diária gratuita de 300 e-mails/dia do Brevo → **Mitigação:** Cooldown de 60 segundos por usuário em `password_reset_tokens` antes de gerar/disparar novo e-mail.
- **[Risco]** Cache em memória de 45s no `AuthGuard` segurar `tokenVersion` antigo por alguns segundos em mesma instância → **Mitigação:** Chamar `authGuard.invalidateUserCache(userId)` após reset de senha e validar `(payload.tokenVersion ?? 0) === (user.tokenVersion ?? 0)` em `validateRequest` (bypassando/invalidando entrada em cache se divergir).

## Migration Plan

1. Adicionar `tokenVersion` em `User` e model `PasswordResetToken` em `apps/api/prisma/schema.prisma`.
2. Criar migração Prisma (`20261113xxxxxx_add_password_reset_tokens`) e aplicar no banco Supabase de produção via `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`.
3. Adicionar `BREVO_API_KEY`, `MAIL_FROM` e `APP_URL` no `.env.example` e orientar o cadastro dessas variáveis na Vercel para ativar o envio real em produção.
4. Rollback: migração aditiva compatível com dados existentes (`tokenVersion` com default `0` e nova tabela `password_reset_tokens` sem impacto em registros atuais).

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/api/prisma/schema.prisma` — `tokenVersion` em `User` + model `PasswordResetToken`
- `[CREATE]` `apps/api/prisma/migrations/20261113120000_add_password_reset_tokens/migration.sql` — DDL Postgres para `token_version` e `password_reset_tokens`
- `[MODIFY]` `packages/shared/src/auth.ts` — DTOs (`ForgotPasswordDto`, `ResetPasswordDto`, `AuthConflictField`, `tokenVersion` em `SessionPayload`)
- `[MODIFY]` `apps/api/src/auth/errors.ts` — `code` e `field` em `UserAlreadyExistsError`, `InvalidCredentialsError`, `ResetTokenInvalidError`, `EmailDeliveryConfigError`
- `[CREATE]` `apps/api/src/auth/email.service.ts` — interface `IEmailService` + `BrevoEmailService` + fallback dev/testes
- `[CREATE]` `apps/api/src/auth/password-reset.repository.ts` — persistência em Prisma/memória de `PasswordResetToken` e consumo atômico
- `[MODIFY]` `apps/api/src/auth/users.repository.ts` — suporte a `tokenVersion`, `updatePasswordAndBumpVersion`, e remoção do fallback silencioso em `create`
- `[MODIFY]` `apps/api/src/auth/auth.service.ts` — erro estruturado `field` no register, inclusão de `tokenVersion` no JWT, `requestPasswordReset`, `validateResetToken`, `resetPassword`
- `[MODIFY]` `apps/api/src/auth/auth.guard.ts` — verificação de `tokenVersion` contra o repositório
- `[MODIFY]` `apps/api/src/auth/auth.controller.ts` & `apps/api/src/auth/auth.module.ts` & `apps/api/src/index.ts` — wiring de `EmailService`, `PasswordResetRepository` e ações do controller
- `[MODIFY]` `apps/web/src/app/api/v1/auth/register/route.ts` & `login/route.ts` — propagar `code`/`field` no `409` e preservar `500` para falhas internas no `login`
- `[CREATE]` `apps/web/src/app/api/v1/auth/forgot-password/route.ts` — rota `POST`
- `[CREATE]` `apps/web/src/app/api/v1/auth/reset-password/route.ts` — rotas `GET` (validação) e `POST` (redefinição)
- `[MODIFY]` `apps/web/src/services/auth-api.client.ts` — `field`/`code` no `AuthApiError`, `requestPasswordReset`, `validateResetToken`, `resetPassword`
- `[MODIFY]` `apps/web/src/context/auth-context.tsx` — remover `setIsLoading(true/false)` de `login`/`register`
- `[MODIFY]` `apps/web/src/components/auth/validation.ts` — validadores `validateForgotPasswordFields` e `validateResetPasswordFields`
- `[MODIFY]` `apps/web/src/components/auth/register-form.tsx` — preservar inputs, mostrar `code`/`field` no campo em colisão e no banner
- `[MODIFY]` `apps/web/src/components/auth/login-form.tsx` — foco no campo senha após `401`, diferenciação `401` vs. erro temporário `5xx`/rede, link "Esqueci minha senha" e banner `?reset=success`
- `[CREATE]` `apps/web/src/components/auth/forgot-password-form.tsx` & `reset-password-form.tsx` — formulários no padrão Editorial Split Dossier
- `[CREATE]` `apps/web/src/app/forgot-password/page.tsx` & `apps/web/src/app/reset-password/page.tsx` — páginas públicas de recuperação/redefinição
- `[MODIFY]` `.env.example` — documentar `BREVO_API_KEY`, `MAIL_FROM`, `APP_URL`
- `[CREATE]` `tests/auth-recovery-and-feedback.test.mjs` — suíte TDD para mensagens de erro e fluxo completo de recuperação de senha

## Data Model

- **`users` (alteração aditiva):**
  - `token_version`: `INTEGER NOT NULL DEFAULT 0` (incrementado atomicamente ao redefinir a senha para invalidar JWTs emitidos antes da troca).
- **`password_reset_tokens` (nova tabela):**
  - `id`: `UUID PRIMARY KEY DEFAULT uuid()`
  - `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  - `token_hash`: `VARCHAR(64) UNIQUE NOT NULL` (SHA-256 hex do token aleatório)
  - `expires_at`: `TIMESTAMPTZ NOT NULL` (TTL 30 minutos)
  - `used_at`: `TIMESTAMPTZ NULL` (preenchido atomicamente ao redefinir senha)
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - Índices: `@@index([userId, createdAt(sort: Desc)])` (cooldown e invalidação anterior) e `@@unique([tokenHash])`.

## Contracts

- **`POST /api/v1/auth/register`:**
  - `201 Created`: `{ user, cookie }` + `Set-Cookie`
  - `409 Conflict`: `{ message: string, code: 'EMAIL_ALREADY_EXISTS' | 'USERNAME_ALREADY_EXISTS', field: 'email' | 'username' }`
  - `400 Bad Request`: `{ message: string, code: 'VALIDATION_ERROR' }`
- **`POST /api/v1/auth/login`:**
  - `200 OK`: `{ user, cookie }` + `Set-Cookie`
  - `401 Unauthorized`: `{ message: string, code: 'INVALID_CREDENTIALS' }`
  - `400 Bad Request`: `{ message: string, code: 'VALIDATION_ERROR' }`
  - `500 Internal Server Error`: `{ message: string, code: 'INTERNAL_ERROR' }`
- **`POST /api/v1/auth/forgot-password`:**
  - Body: `{ email: string }`
  - `200 OK`: `{ message: 'Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.' }`
  - `400 Bad Request`: `{ message: string, code: 'VALIDATION_ERROR' }` (e-mail sintaticamente inválido)
- **`GET /api/v1/auth/reset-password?token=...`:**
  - `200 OK`: `{ valid: true }`
  - `400 Bad Request`: `{ valid: false, code: 'RESET_TOKEN_INVALID', message: string }`
- **`POST /api/v1/auth/reset-password`:**
  - Body: `{ token: string, newPassword: string }`
  - `200 OK`: `{ message: 'Senha redefinida com sucesso.' }`
  - `400 Bad Request`: `{ message: string, code: 'RESET_TOKEN_INVALID' | 'VALIDATION_ERROR' }`

## Research

- **Brevo (antiga Sendinblue) Transactional Email API v3 (Tier Gratuito Permanente):**
  - **Custo:** R$ 0 permanente (sem trial com cartão de crédito), com cota gratuita de **300 e-mails/dia**.
  - **Compatibilidade com domínio atual:** Não bloqueia envio para destinatários externos quando ainda não há domínio DNS próprio verificado (ao contrário do `onboarding@resend.dev` do Resend, que restringe envios apenas ao dono da conta até que um domínio DNS pago seja verificado).
  - **Impacto em dependências:** Integração direta via `fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': ... } })` em Node 22+, adicionando **zero dependências npm** ao monorepo.
  - **Estratégia de saída:** Toda comunicação passa pela interface `IEmailService` injetada em `AuthModule`; caso futuramente o projeto adquira domínio próprio ou prefira Resend/SMTP próprio, basta implementar outro adapter ou ler outras env vars sem alterar `AuthService`, tokens ou interface web.

