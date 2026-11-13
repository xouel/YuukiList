# Spec Delta

## MODIFIED Requirements

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

