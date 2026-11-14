# Proposal: Mensagens de Retorno na Autenticação e Recuperação de Senha

> **X-Spec** · ID: `040-auth-feedback-and-password-recovery` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-13`

## Why

Hoje, ao tentar entrar com credenciais erradas ou criar conta com e-mail/usuário já cadastrados, o `AuthProvider` alterna `isLoading` global e faz `LoginPage`/`RegisterPage` desmontarem o formulário durante a requisição, apagando os erros e os dados digitados. Além disso, o cadastro mascara conflitos específicos de e-mail vs. nome de usuário e o sistema ainda não oferece recuperação de senha esquecida.

## What Changes

- Desacoplar o estado de carregamento inicial da sessão (`isLoading`) do envio dos formulários de login e cadastro no `AuthProvider`, impedindo a desmontagem de `<AuthDossierCard />` e preservando campos e alertas na tela.
- Estruturar erros `409 Conflict` no cadastro (`EMAIL_ALREADY_EXISTS` / `USERNAME_ALREADY_EXISTS` com campo `field`) e propagar falhas reais do Prisma em `UsersRepository.create` (sem criar usuário fantasma em RAM quando o banco rejeitar).
- Exibir mensagens claras e específicas no `RegisterForm` ("Este e-mail já está cadastrado" vs. "Este nome de usuário já está em uso") com destaque inline no campo em conflito, e no `LoginForm` ("E-mail/usuário ou senha incorretos") mantendo foco no campo de senha e diferenciando erros `401` de falhas `5xx`/rede.
- Adicionar recuperação completa de senha esquecida: model `PasswordResetToken` no Prisma (token aleatório armazenado como SHA-256, TTL 30 min, uso único atômico, cooldown 60s), invalidação de sessões anteriores via `tokenVersion`, adapter `EmailService` gratuito via **Brevo HTTP API** (com fallback em console/memória para dev e testes), endpoints `/api/v1/auth/forgot-password` e `/api/v1/auth/reset-password` (`GET` validação + `POST` redefinição) e páginas `/forgot-password` e `/reset-password`.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `auth-session`: retorno estruturado por campo na colisão de cadastro, tratamento seguro de falhas de banco no login/registro, revogação de sessões por `tokenVersion`, emissão/validação/consumo de tokens de redefinição de senha (SHA-256, TTL 30 min, cooldown 60s) e serviço de envio gratuito via Brevo HTTP API.
- `auth-ui`: preservação do formulário e das mensagens de retorno em erros de login/cadastro, feedback distinto por campo no conflito `409`, retenção de foco na senha no `401`, feedback `?reset=success`, link "Esqueci minha senha" e telas acessíveis `/forgot-password` e `/reset-password`.

## Impact

- **Banco de Dados (`apps/api/prisma/schema.prisma` + migration):** novo model `PasswordResetToken` (`password_reset_tokens`) e coluna `token_version` (`Int @default(0)`) em `User`.
- **Shared (`packages/shared/src/auth.ts`):** DTOs de recuperação/redefinição (`ForgotPasswordDto`, `ResetPasswordDto`), campo `tokenVersion` opcional em `SessionPayload` e metadados de erro (`AuthConflictField` / códigos).
- **Backend (`apps/api/src/auth/*`):** `EmailService` (Brevo HTTP v3 via `fetch` + dev/test fallback), `PasswordResetRepository` / métodos no `AuthService`, `AuthController`, `AuthGuard` (`tokenVersion`), `UserAlreadyExistsError` estruturado e remoção de fallback silencioso em `UsersRepository.create`.
- **Frontend & API Routes (`apps/web/src/*`):** rotas `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password` e `/api/v1/auth/login` (`status` seguro), `AuthApiClient`, `AuthProvider`, `LoginForm`, `RegisterForm`, `/forgot-password`, `/reset-password` e `.env.example`.
- **Dependências Externas:** Zero novos pacotes npm; integração HTTP opcional de custo zero permanente com Brevo API (`BREVO_API_KEY`, `MAIL_FROM`, `APP_URL`).

## User Stories

### US1 — Mensagens Claras no Login e no Criar Conta (Priority: P1)
Como visitante tentando acessar ou criar uma conta no YuukiList, quero ver mensagens claras e imediatas quando o usuário/e-mail já estiverem cadastrados ou quando usuário/senha estiverem errados, sem perder o que digitei, para corrigir rapidamente meu acesso.

- **Why this priority:** Bug ativo em produção que impede usuários de entender por que não conseguiram entrar ou cadastrar.
- **Independent Test:** Submeter cadastro com e-mail duplicado e depois com usuário duplicado validando mensagens distintas no banner e no campo sem limpar os inputs; submeter login com senha errada validando exibição contínua do alerta `401` e foco mantido no campo de senha.

### US2 — Solicitar Link de Recuperação de Senha (Priority: P1)
Como usuário que esqueceu a senha, quero informar meu e-mail em uma tela dedicada para receber um link seguro de redefinição sem que o endpoint revele a terceiros se um e-mail aleatório possui conta.

- **Why this priority:** Sem recuperação de senha, usuários que perdem acesso ficam definitivamente bloqueados fora da plataforma.
- **Independent Test:** Chamar `POST /api/v1/auth/forgot-password` para e-mail existente e inexistente verificando resposta neutra HTTP 200 em ambos os casos, persistência do hash SHA-256 em `password_reset_tokens` e disparo via `EmailService` mockado/Brevo.

### US3 — Redefinir Senha com Token Único e Acessar Conta (Priority: P2)
Como usuário com um link válido de recuperação, quero definir uma nova senha segura e entrar novamente na minha conta com os dados antigos de sessão invalidados.

- **Why this priority:** Fecha o ciclo completo ponta a ponta da recuperação de senha com proteção contra reuso de link ou sequestro de sessões antigas.
- **Independent Test:** Acessar `/reset-password?token=<token>`, submeter nova senha válida, validar HTTP 200, falha de reutilização do mesmo token (`400`/`410`), invalidação de cookie JWT emitido antes do reset e sucesso no login com a nova senha.

## Success Criteria

- **SC-001**: Tentativas de login com credenciais erradas exibem mensagem visível e preservam o identificador digitado e foco no campo de senha em 100% das submissões sem desmontar o formulário.
- **SC-002**: Tentativas de cadastro com e-mail duplicado ou username duplicado exibem mensagens distintas indicando exatamente qual campo já está cadastrado, sem apagar os dados preenchidos.
- **SC-003**: Solicitações de recuperação de senha respondem com HTTP 200 neutro e respeitam cooldown mínimo de 60 segundos entre envios para o mesmo usuário.
- **SC-004**: Tokens de redefinição são armazenados apenas como hash SHA-256, expiram em 30 minutos, funcionam exatamente 1 vez de forma atômica e invalidam sessões JWT anteriores após troca bem-sucedida.
- **SC-005**: Toda a suíte automatizada (`npm test`) e o build Next.js (`next build`) passam com 0 falhas após a entrega, mantendo custo zero de dependências/serviços.

## Edge Cases

- Token expirado, já utilizado ou adulterado ao abrir `/reset-password` ou submeter `POST /api/v1/auth/reset-password` deve exibir mensagem explicativa clara com atalho para solicitar novo link.
- Múltiplas solicitações seguidas para o mesmo e-mail: respeitar cooldown de 60s para evitar abuso de cota gratuita; após cooldown, invalidar tokens anteriores pendentes ao emitir novo token.
- Falha transitória de banco no login ou cadastro não deve se passar por `401 Credenciais inválidas` nem gerar usuário falso em memória.
- Execução em produção sem `BREVO_API_KEY` configurada deve falhar/registrar erro controlado sem vazar o token em texto puro na resposta HTTP.

## Out of Scope

- Login social (OAuth Google/GitHub/Discord).
- Verificação obrigatória de e-mail no cadastro inicial.
- Envio pago de SMS ou provedores de e-mail com trial pago / assinatura.

## Clarifications

### Session 2026-11-13
- Q: Qual provedor gratuito de e-mail transacional usar sem depender de domínio próprio comprado? → A: Escolha recomendada aprovada pelo usuário: **Brevo HTTP API v3** via `fetch` nativo (300 e-mails/dia gratuitos permanentes, zero novos pacotes npm), encapsulado em `EmailService` com fallback local console/memória para desenvolvimento e testes automatizados.
- Q: Entregar mensagens de retorno e recuperação de senha juntas ou em fatias separadas? → A: Confirmado pelo usuário juntar ambas na mesma entrega (`040-auth-feedback-and-password-recovery`).
- Q: Manter proteção anti-enumeração no login (`"Usuário/e-mail ou senha incorretos"`) enquanto diferencia e-mail vs. usuário no cadastro? → A: Sim; preserva a regra de segurança de `auth-session` no login e entrega distinção clara por campo no `409` do cadastro.

