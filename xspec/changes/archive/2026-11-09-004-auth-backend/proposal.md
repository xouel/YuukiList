# Proposal: 004-auth-backend

> **X-Spec** · ID: `004-auth-backend` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de um subsistema robusto, autônomo e seguro de autenticação e gerenciamento de sessões no backend NestJS para suportar a biblioteca pessoal e o acompanhamento de progresso de cada usuário (Fases 2 e 3 do PRD). Esta mudança implementa o modelo de dados de usuário, cadastro com validação rigorosa, hash de senhas de alta resistência criptográfica sem dependências externas pagas (princípio do custo zero), emissão de sessão via JWT assinado em cookies protegidos HttpOnly com proteção contra CSRF/XSS, endpoint de identificação /me e guard de proteção de rotas privadas.

## What Changes

- Modelagem da tabela `users` no schema Prisma (`apps/api/prisma/schema.prisma`) com `id` (UUID), `email` (único, normalizado), `username` (único, case-insensitive), `password_hash`, `created_at` e `updated_at`.
- Migration relacional correspondente provisionando índices únicos para integridade concorrente.
- Serviço de hash criptográfico de senhas utilizando derivação segura com salt criptográfico único e tempo constante para mitigação de timing attacks.
- Endpoint `POST /api/v1/auth/register` para criação de conta com validação de formato de email, username alfanumérico e força mínima de senha, retornando dados do usuário e emitindo cookie de sessão.
- Endpoint `POST /api/v1/auth/login` aceitando identificador híbrido (`identifier`: email ou username) e senha, emitindo cookie `HttpOnly` com JWT assinado e retorno seguro do usuário.
- Endpoint `POST /api/v1/auth/logout` que revoga/limpa o cookie de sessão com expiração imediata.
- Endpoint `GET /api/v1/auth/me` para consulta do perfil da sessão ativa.
- Guard e decorator customizado `@CurrentUser()` para proteção declarativa de rotas privadas, suportando transporte primário por cookie `HttpOnly` com fallback para Header `Authorization: Bearer <token>`.
- DTOs canônicos, contratos de requisição/resposta e tipos exportados em `@yuukilist/shared`.

## Capabilities

### New Capabilities
- `auth-session`: Subsistema de autenticação, cadastro de usuários, emissão de sessão JWT em cookie seguro e proteção de rotas privadas.

### Modified Capabilities
- Nenhuma.

## Impact

- **Database (`apps/api/prisma`):** Adição do modelo `User` e respectiva migration sem alterar ou quebrar as tabelas do catálogo (`media_items`, `item_genres`, `item_aliases`).
- **Contratos (`packages/shared`):** Novos DTOs e tipos de autenticação (`RegisterDto`, `LoginDto`, `AuthUserResponse`, `SessionPayload`).
- **Backend (`apps/api`):** Criação do módulo `AuthModule` (controllers, services, guards, decorators e estratégias de extração de token).

## User Stories

### US1 — Cadastro de Usuário e Segurança de Credenciais (Priority: P1)
Como visitante do YuukiList,
Quero me cadastrar informando email, nome de usuário e senha,
Para criar minha conta pessoal no serviço e iniciar minha sessão automaticamente.

- **Why this priority:** É o ponto de entrada fundamental para que o usuário possua identidade reconhecida pelo sistema.
- **Independent Test:** Enviar requisição para `POST /api/v1/auth/register` com dados válidos e verificar status 201, cookie de sessão emitido e rejeição com status 409 em tentativas de cadastro com email ou username duplicados.

### US2 — Autenticação Flexível e Gerenciamento de Sessão (Priority: P1)
Como usuário cadastrado,
Quero fazer login informando meu email ou username com minha senha, e poder encerrar minha sessão com logout,
Para acessar com segurança minha conta e poder sair quando terminar.

- **Why this priority:** Permite a reutilização da conta em múltiplos acessos e garante a capacidade de encerrar a sessão.
- **Independent Test:** Enviar `POST /api/v1/auth/login` com username e verificar retorno de sessão válida; enviar credenciais incorretas e verificar status 401; enviar `POST /api/v1/auth/logout` e verificar limpeza do cookie.

### US3 — Identificação do Usuário e Proteção de Rotas (Priority: P2)
Como cliente da API (web frontend ou integração),
Quero consultar os dados do usuário autenticado e acessar rotas protegidas apresentando o token em cookie ou header,
Para carregar o estado do usuário na aplicação e impedir acesso não autorizado a recursos privados.

- **Why this priority:** É a fundação que viabilizará a tela de perfil e os endpoints privados da biblioteca pessoal.
- **Independent Test:** Enviar `GET /api/v1/auth/me` com cookie válido e verificar status 200 com payload do usuário; enviar requisição sem token para endpoint protegido e verificar status 401.

## Success Criteria

- **SC-001**: O endpoint de cadastro cria usuários persistidos no PostgreSQL, criptografa senhas com derivação segura e rejeita duplicatas com status HTTP 409 Conflict.
- **SC-002**: O endpoint de login autentica tanto por email quanto por username, emitindo cookie `HttpOnly` com flag `SameSite=Lax` e `Path=/`.
- **SC-003**: Nenhuma resposta de API ou erro expõe o hash da senha, dados sensíveis ou stack traces internos.
- **SC-004**: O Guard de autenticação bloqueia acessos anônimos com HTTP 401 e permite acesso a usuários autenticados via cookie ou header `Authorization: Bearer`.
- **SC-005**: 100% dos testes automatizados de autenticação executam com sucesso em banco de dados real sem custo de infraestrutura.

## Edge Cases

- Cadastro com email em formato inválido ou com caracteres em maiúsculas (deve normalizar para lowercase).
- Username com espaços, caracteres de controle ou fora do padrão permitido (apenas letras, números, sublinhado e hífen).
- Senha com menos de 8 caracteres ou excessivamente longa (limite de 128 caracteres contra ataques DoS por custo de hashing).
- Tentativa de login com usuário inexistente retornando tempo e mensagem equivalentes a credenciais erradas (prevenção de enumeração de contas).
- Requisição com cookie adulterado ou JWT expirado retornando 401 e instruindo descarte do cookie no cliente.

## Out of Scope

- Interface visual de login/cadastro no Next.js (escopo da fatia R5 — `005-auth-frontend`).
- Recuperação de senha por email / envio de magic links (fora do escopo do MVP local custo zero).
- Provedores OAuth comerciais ou externos (Google, Apple, GitHub) no MVP inicial.

## Clarifications

### Session 2026-11-09
- Q: Qual o identificador aceito no endpoint de login? → A: Identificador híbrido (`identifier` aceitando tanto email quanto username). O cadastro exige email e username únicos.
- Q: Qual a estratégia primária de transporte do token de sessão? → A: Cookie `HttpOnly` (`yuukilist_session`, `SameSite=Lax`, `Path=/`, `maxAge=7 dias`), com fallback para Header `Authorization: Bearer <token>`.
- Q: Qual o mecanismo de hash criptográfico de senha adotado? → A: Derivação criptográfica robusta com salt criptográfico único por usuário (`node:crypto.scrypt` / `argon2`), com execução determinística e sem custos de terceiros.

