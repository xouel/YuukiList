# auth-session Specification

## Purpose

Gerenciar o ciclo de vida de identidade de usuários no YuukiList, provendo cadastro seguro de contas com unicidade de email e username, autenticação resiliente com hash de senhas de alta entropia, emissão e revogação de sessões via JWT em cookies protegidos HttpOnly e proteção de endpoints privados contra acessos não autorizados.

## Requirements

### Requirement: User Registration and Password Security
O sistema SHALL registrar novos usuários com email normalizado, username alfanumérico único e senha criptografada com salt individual, rejeitando parâmetros inválidos com HTTP 400 e identificando explicitamente na resposta HTTP 409 se o conflito ocorreu no `email` (`EMAIL_ALREADY_EXISTS`) ou no `username` (`USERNAME_ALREADY_EXISTS`), propagando falhas reais de persistência quando o banco estiver configurado.

#### Scenario: Cadastro de novo usuário com dados válidos
- **GIVEN** uma requisição contendo email "user@yuukilist.test", username "yuuki_user" e senha de 8 ou mais caracteres
- **WHEN** o cliente submete `POST /api/v1/auth/register`
- **THEN** o sistema SHALL responder com HTTP 201 Created, corpo contendo os dados do usuário sem expor o hash de senha, e cabeçalho `Set-Cookie` com cookie de sessão HttpOnly

#### Scenario: Rejeição de cadastro com email já cadastrado
- **GIVEN** um usuário já cadastrado com email "existente@yuukilist.test"
- **WHEN** um cliente tenta submeter `POST /api/v1/auth/register` com o mesmo email (independente de maiúsculas/minúsculas)
- **THEN** o sistema SHALL rejeitar a operação com HTTP 409 Conflict contendo `code: "EMAIL_ALREADY_EXISTS"`, `field: "email"` e mensagem explícita informando que o e-mail já está cadastrado

#### Scenario: Rejeição de cadastro com nome de usuário já cadastrado
- **GIVEN** um usuário já cadastrado com username "usuario_existente"
- **WHEN** um cliente tenta submeter `POST /api/v1/auth/register` com o mesmo username (independente de maiúsculas/minúsculas) e email inédito
- **THEN** o sistema SHALL rejeitar a operação com HTTP 409 Conflict contendo `code: "USERNAME_ALREADY_EXISTS"`, `field: "username"` e mensagem explícita informando que o nome de usuário já está cadastrado

#### Scenario: Rejeição de cadastro com dados inválidos ou senha fraca
- **GIVEN** uma requisição com email fora do formato RFC, username com caracteres inválidos ou senha com menos de 8 caracteres
- **WHEN** o cliente submete `POST /api/v1/auth/register`
- **THEN** o sistema SHALL rejeitar a requisição com HTTP 400 Bad Request descrevendo as violações de validação

#### Scenario: Propagação controlada de erro de persistência no cadastro
- **GIVEN** o repositório conectado ao Prisma/PostgreSQL recebendo violação de unicidade `P2002` ou falha real de banco durante `create`
- **WHEN** o cadastro tenta persistir o usuário
- **THEN** o sistema SHALL lançar `UserAlreadyExistsError` (HTTP 409) para conflito único ou erro interno controlado (HTTP 500) sem criar registro silencioso apenas em memória

### Requirement: User Authentication and Session Issuance
O sistema SHALL autenticar credenciais submetidas por email ou username, emitindo cookie HttpOnly contendo token JWT assinado com `tokenVersion` na validação com sucesso, retornando HTTP 401 genérico sem revelar existência da conta quando credenciais não coincidirem e HTTP 500 em falhas internas inesperadas.

#### Scenario: Autenticação bem-sucedida via email ou username
- **GIVEN** um usuário registrado com email "autor@yuukilist.test", username "autor_yuuki" e senha conhecida
- **WHEN** o cliente submete `POST /api/v1/auth/login` informando identifier "autor_yuuki" (ou "autor@yuukilist.test") e a senha correta
- **THEN** o sistema SHALL responder com HTTP 200 OK, dados públicos do usuário autenticado e cabeçalho `Set-Cookie` configurando `yuukilist_session` como HttpOnly e SameSite=Lax

#### Scenario: Rejeição de credenciais incorretas ou usuário inexistente
- **GIVEN** um identificador não cadastrado ou uma senha incorreta
- **WHEN** o cliente submete `POST /api/v1/auth/login`
- **THEN** o sistema SHALL responder com HTTP 401 Unauthorized com `code: "INVALID_CREDENTIALS"` e mensagem clara informando usuário/e-mail ou senha inválidos sem revelar separadamente se a conta existe

#### Scenario: Diferenciação de falha interna no endpoint de login
- **GIVEN** uma exceção inesperada não relacionada a credenciais ou validação durante `POST /api/v1/auth/login`
- **WHEN** a rota processa a falha
- **THEN** o endpoint SHALL responder com status HTTP 500 e mensagem de falha temporária de servidor sem mascarar o erro como HTTP 401

#### Scenario: Encerramento de sessão com logout
- **GIVEN** um cliente com sessão ativa e cookie `yuukilist_session` presente
- **WHEN** o cliente submete `POST /api/v1/auth/logout`
- **THEN** o sistema SHALL responder com HTTP 200 OK e emitir cabeçalho `Set-Cookie` expirando imediatamente o cookie de sessão

### Requirement: Identity Verification and Route Protection
O sistema SHALL inspecionar tokens JWT em endpoints protegidos, retornar em `AuthUserResponse` (`login`, `register`, `/api/v1/auth/me` e `AuthGuard`) os campos `avatarUrl` e `avatarFrame`, manter cache em memória com TTL curto para validação geral com invalidação no logout ou edição, e garantir leitura fresca do banco com `no-store` em `/api/v1/auth/me`.

#### Scenario: Consulta de perfil do usuário autenticado no endpoint me
- **GIVEN** uma requisição contendo cookie ou header de autorização válido de um usuário existente
- **WHEN** o cliente envia `GET /api/v1/auth/me`
- **THEN** o sistema SHALL responder com HTTP 200 OK e `Cache-Control: no-store` contendo id, email, username, avatarUrl, avatarFrame e data de cadastro atualizados do usuário

#### Scenario: Leitura fresca entre multiplas instancias serverless no endpoint me
- **GIVEN** um usuário que atualizou `avatarUrl` ou `avatarFrame` em uma instância serverless enquanto outra instância mantém cache de sessão em memória dentro do TTL
- **WHEN** o cliente consulta `GET /api/v1/auth/me` para hidratar ou atualizar a sessão (`refreshUser`)
- **THEN** o endpoint SHALL ignorar cache em memória potencialmente desatualizado, consultar os dados atuais no repositório/PostgreSQL, atualizar o cache local da instância e devolver os campos atualizados sem cache HTTP ou Service Worker

#### Scenario: Bloqueio de acesso a rota protegida sem credenciais
- **GIVEN** uma requisição sem cookie de sessão e sem header de autorização (ou com token expirado/adulterado)
- **WHEN** o cliente tenta acessar `GET /api/v1/auth/me` ou qualquer rota privada protegida
- **THEN** o sistema SHALL responder com HTTP 401 Unauthorized impedindo a execução do handler privado

#### Scenario: Autenticação alternativa via Header Authorization Bearer
- **GIVEN** um token JWT válido gerado pelo sistema
- **WHEN** o cliente envia uma requisição para rota protegida contendo o cabeçalho `Authorization: Bearer <token>`
- **THEN** o sistema SHALL reconhecer a identidade do usuário e autorizar o acesso com HTTP 200 OK

#### Scenario: Cache curto em memória e invalidação imediata ao editar perfil
- **GIVEN** requisições autenticadas sucessivas dentro da janela de TTL do cache de sessão no `AuthGuard`
- **WHEN** o usuário altera `avatarUrl` ou `avatarFrame` via atualização de conta ou encerra a sessão
- **THEN** o cache do usuário no servidor SHALL ser invalidado imediatamente para refletir os dados atualizados sem nova latência repetida nas chamadas comuns

### Requirement: Production JWT Secret Enforcement
Em ambientes de produção (`NODE_ENV=production` ou `VERCEL_ENV=production`), o `TokenService` SHALL exigir explicitamente a variável de ambiente `JWT_SECRET` configurada e falhar com erro claro caso ela esteja ausente, mantendo o fallback determinístico apenas em desenvolvimento local e suítes de teste.

#### Scenario: Bloqueio explicito de operacao JWT sem JWT_SECRET em producao
- **GIVEN** o runtime configurado com `NODE_ENV=production` ou `VERCEL_ENV=production` e sem `JWT_SECRET` definido
- **WHEN** o `TokenService` é acionado para assinar ou validar uma sessão sem segredo explícito injetado
- **THEN** o sistema SHALL recusar o segredo padrão de desenvolvimento lançando erro explícito de configuração ausente

#### Scenario: Operacao normal em producao com JWT_SECRET configurado e fallback em dev
- **GIVEN** um ambiente de produção com `JWT_SECRET` forte definido ou um ambiente local de desenvolvimento/teste sem `JWT_SECRET`
- **WHEN** o `TokenService` assina e verifica tokens de sessão JWT
- **THEN** o sistema SHALL emitir e validar os tokens normalmente sem erros falsos de inicialização nem bloqueio de build estático

### Requirement: Password Recovery Request and Token Issuance
O sistema SHALL aceitar solicitações em `POST /api/v1/auth/forgot-password` com validação de email, gerando token aleatório de alta entropia salvo apenas como hash SHA-256 com TTL de 30 minutos, cooldown de 60 segundos por usuário e envio gratuito via Brevo HTTP API (com fallback em dev/testes), sempre respondendo HTTP 200 neutro.

#### Scenario: Solicitação de recuperação para e-mail cadastrado válido
- **GIVEN** um usuário cadastrado com e-mail "leitor@yuukilist.test" sem token emitido nos últimos 60 segundos
- **WHEN** o cliente envia `POST /api/v1/auth/forgot-password` com `{ email: "LEITOR@yuukilist.test" }`
- **THEN** o sistema SHALL invalidar tokens anteriores pendentes do usuário, persistir novo `PasswordResetToken` apenas com hash SHA-256 e `expiresAt` em 30 minutos, disparar o link `/reset-password?token=...` via `EmailService` e responder HTTP 200 com mensagem neutra sem expor o token no corpo HTTP em produção

#### Scenario: Resposta neutra e proteção anti-enumeração para e-mail inexistente
- **GIVEN** um e-mail sintaticamente válido que não pertence a nenhuma conta cadastrada
- **WHEN** o cliente envia `POST /api/v1/auth/forgot-password`
- **THEN** o sistema SHALL responder com HTTP 200 e exatamente a mesma mensagem neutra de confirmação sem disparar e-mail

#### Scenario: Respeito ao cooldown entre envios para o mesmo usuário
- **GIVEN** um usuário para o qual um token de recuperação foi emitido há menos de 60 segundos
- **WHEN** uma nova requisição `POST /api/v1/auth/forgot-password` é feita para o mesmo e-mail
- **THEN** o sistema SHALL responder HTTP 200 neutro sem gerar novo token nem consumir nova cota de envio de e-mail durante a janela de cooldown

### Requirement: Password Reset Verification and Session Invalidation
O sistema SHALL validar tokens em `GET /api/v1/auth/reset-password` e redefinir a senha em `POST /api/v1/auth/reset-password`, consumindo o token de forma atômica e única, atualizando `passwordHash` com `scrypt`, incrementando `tokenVersion` no usuário e invalidando sessões JWT antigas.

#### Scenario: Verificação de token válido para exibição do formulário
- **GIVEN** um `PasswordResetToken` existente, não utilizado e dentro do prazo de 30 minutos
- **WHEN** o cliente consulta `GET /api/v1/auth/reset-password?token=<token>`
- **THEN** o sistema SHALL responder HTTP 200 com `{ valid: true }` sem consumir o token

#### Scenario: Redefinição bem-sucedida de senha com token válido
- **GIVEN** um token válido não utilizado e uma nova senha entre 8 e 128 caracteres
- **WHEN** o cliente envia `POST /api/v1/auth/reset-password` com `{ token, newPassword }`
- **THEN** o sistema SHALL marcar `usedAt` no token de forma atômica, atualizar `passwordHash` com novo salt, incrementar `tokenVersion` invalidando cache do `AuthGuard` e cookies JWT emitidos anteriormente, e responder HTTP 200 com confirmação

#### Scenario: Rejeição de token expirado ou adulterado ou já utilizado
- **GIVEN** um token inexistente, expirado ou previamente consumido
- **WHEN** o cliente consulta `GET /api/v1/auth/reset-password` ou envia `POST /api/v1/auth/reset-password`
- **THEN** o sistema SHALL rejeitar a operação com HTTP 400 (`RESET_TOKEN_INVALID`) informando que o link é inválido ou expirou e preservando a senha atual

#### Scenario: Bloqueio de sessão JWT antiga após redefinição de senha
- **GIVEN** um cookie JWT emitido antes da redefinição de senha com `tokenVersion` anterior ao valor atualizado do usuário
- **WHEN** o portador desse token antigo acessa qualquer rota protegida via `AuthGuard`
- **THEN** o sistema SHALL rejeitar o acesso com HTTP 401 Unauthorized exigindo novo login com a senha redefinida
