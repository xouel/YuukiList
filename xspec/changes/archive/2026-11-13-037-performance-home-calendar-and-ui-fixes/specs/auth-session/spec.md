# Spec Delta

## MODIFIED Requirements

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

