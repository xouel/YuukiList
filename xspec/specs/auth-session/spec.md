# auth-session Specification

## Purpose

Gerenciar o ciclo de vida de identidade de usuários no YuukiList, provendo cadastro seguro de contas com unicidade de email e username, autenticação resiliente com hash de senhas de alta entropia, emissão e revogação de sessões via JWT em cookies protegidos HttpOnly e proteção de endpoints privados contra acessos não autorizados.

## Requirements

### Requirement: User Registration and Password Security
O sistema SHALL registrar novos usuários com email normalizado, username alfanumérico único e senha criptografada com salt individual, rejeitando tentativas com identificadores duplicados ou parâmetros inválidos.

#### Scenario: Cadastro de novo usuário com dados válidos
- **GIVEN** uma requisição contendo email "user@yuukilist.test", username "yuuki_user" e senha de 8 ou mais caracteres
- **WHEN** o cliente submete `POST /api/v1/auth/register`
- **THEN** o sistema SHALL responder com HTTP 201 Created, corpo contendo os dados do usuário sem expor o hash de senha, e cabeçalho `Set-Cookie` com cookie de sessão HttpOnly

#### Scenario: Rejeição de cadastro com identificador duplicado
- **GIVEN** um usuário já cadastrado com email "existente@yuukilist.test" ou username "usuario_existente"
- **WHEN** um cliente tenta submeter `POST /api/v1/auth/register` com o mesmo email ou username
- **THEN** o sistema SHALL rejeitar a operação com HTTP 409 Conflict e mensagem indicando colisão de credenciais

#### Scenario: Rejeição de cadastro com dados inválidos ou senha fraca
- **GIVEN** uma requisição com email fora do formato RFC, username com caracteres inválidos ou senha com menos de 8 caracteres
- **WHEN** o cliente submete `POST /api/v1/auth/register`
- **THEN** o sistema SHALL rejeitar a requisição com HTTP 400 Bad Request descrevendo as violações de validação

### Requirement: User Authentication and Session Issuance
O sistema SHALL autenticar credenciais submetidas por email ou username, emitindo cookie HttpOnly contendo token JWT assinado na validação com sucesso, ou retornando erro genérico caso as credenciais não coincidam.

#### Scenario: Autenticação bem-sucedida via email ou username
- **GIVEN** um usuário registrado com email "autor@yuukilist.test", username "autor_yuuki" e senha conhecida
- **WHEN** o cliente submete `POST /api/v1/auth/login` informando identifier "autor_yuuki" (ou "autor@yuukilist.test") e a senha correta
- **THEN** o sistema SHALL responder com HTTP 200 OK, dados públicos do usuário autenticado e cabeçalho `Set-Cookie` configurando `yuukilist_session` como HttpOnly e SameSite=Lax

#### Scenario: Rejeição de credenciais incorretas ou usuário inexistente
- **GIVEN** um identificador não cadastrado ou uma senha incorreta
- **WHEN** o cliente submete `POST /api/v1/auth/login`
- **THEN** o sistema SHALL responder com HTTP 401 Unauthorized com mensagem genérica de erro sem revelar se o usuário existe

#### Scenario: Encerramento de sessão com logout
- **GIVEN** um cliente com sessão ativa e cookie `yuukilist_session` presente
- **WHEN** o cliente submete `POST /api/v1/auth/logout`
- **THEN** o sistema SHALL responder com HTTP 200 OK e emitir cabeçalho `Set-Cookie` expirando imediatamente o cookie de sessão

### Requirement: Identity Verification and Route Protection
O sistema SHALL inspecionar tokens JWT em endpoints protegidos, retornar em `AuthUserResponse` (`login`, `register`, `/api/v1/auth/me` e `AuthGuard`) os campos `avatarUrl` e `avatarFrame`, e manter cache em memória com TTL curto no servidor para validação de sessão, invalidando-o na atualização de perfil ou logout.

#### Scenario: Consulta de perfil do usuário autenticado no endpoint me
- **GIVEN** uma requisição contendo cookie ou header de autorização válido de um usuário existente
- **WHEN** o cliente envia `GET /api/v1/auth/me`
- **THEN** o sistema SHALL responder com HTTP 200 OK contendo id, email, username, avatarUrl, avatarFrame e data de cadastro do usuário

#### Scenario: Bloqueio de acesso a rota protegida sem credenciais
- **GIVEN** uma requisição sem cookie de sessão e sem header de autorização (ou com token expirado/adulterado)
- **WHEN** o cliente tenta acessar `GET /api/v1/auth/me` ou qualquer rota privada protegida
- **THEN** o sistema SHALL responder com HTTP 401 Unauthorized impedindo a execução do handler privado

#### Scenario: Autenticação alternativa via Header Authorization Bearer
- **GIVEN** um token JWT válido gerado pelo sistema
- **WHEN** o cliente envia uma requisição para rota protegida contendo o cabeçalho `Authorization: Bearer <token>`
- **THEN** o sistema SHALL reconhecer a identidade do usuário e autorizar o acesso com HTTP 200 OK

#### Scenario: Cache curto em memória e invalidação imediata ao editar perfil
- **GIVEN** requisições autenticadas sucessivas dentro da janela de TTL do cache de sessão
- **WHEN** o usuário altera `avatarUrl` ou `avatarFrame` via atualização de conta ou encerra a sessão
- **THEN** o cache do usuário no servidor SHALL ser invalidado imediatamente para refletir os dados atualizados sem nova latência repetida nas chamadas comuns
