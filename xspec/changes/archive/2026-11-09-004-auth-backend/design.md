# Design: 004-auth-backend

## Context

O YuukiList é um monólito modular estruturado em `apps/api` (NestJS), `apps/web` (Next.js 15) e `packages/shared` (TypeScript comum). As fatias R1 a R3 estabeleceram o banco de dados PostgreSQL com Prisma, a camada de dados e busca de catálogo e a interface web de catálogo.
A Fase 2 do PRD exige que o sistema ofereça cadastro, login, logout e sessão reconhecida pela API para permitir que, na Fase 3, cada usuário monte sua biblioteca pessoal privada. O catálogo é 100% público, mas os recursos pessoais exigem autenticação.

## Goals / Non-Goals

**Goals:**
- Implementar modelo relacional de usuários (`users`) com índices únicos para integridade concorrente.
- Prover cadastro com validação de formato de email, username alfanumérico e política de senha mínima de 8 caracteres.
- Implementar hash criptográfico de senha com derivação segura (`crypto.scrypt`) e verificação em tempo constante (`crypto.timingSafeEqual`).
- Emitir e gerenciar sessão via token JWT assinado transportado primariamente em cookie seguro `HttpOnly` (`SameSite=Lax`, `Path=/`), com suporte transparente a Header `Authorization: Bearer <token>`.
- Disponibilizar endpoints REST `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout` e `/api/v1/auth/me`.
- Fornecer Guard desacoplado para proteção de rotas privadas no backend NestJS.
- Cumprir integralmente o Princípio do Custo Zero (R$ 0 permanente) sem APIs pagas ou bibliotecas de terceiros vulneráveis.

**Non-Goals:**
- Telas ou componentes frontend de login/cadastro (escopo exclusivo da fatia R5 — `005-auth-frontend`).
- Integrações comerciais com provedores OAuth (Google, Apple, GitHub) no MVP inicial.
- Recuperação de senha por e-mail ou envio de magic links (requer servidor SMTP pago ou serviço SaaS externo).
- Gerenciamento de papéis ou permissões granulares RBAC (fora do escopo do MVP de entretenimento pessoal).

## Decisions

1. **Algoritmo de Derivação e Hash de Senhas**
   - **Escolha:** Utilização de `node:crypto.scrypt` nativo com salt criptográfico de 16 bytes gerado via `crypto.randomBytes(16)` e formato persistido `scrypt:${saltHex}:${hashHex}`.
   - **Alternativas consideradas:** `bcrypt` nativo (rejeitado por dependências binárias complexas no Windows), `bcryptjs` (rejeitado por desempenho inferior) e `argon2` nativo (rejeitado por exigir compilação nativa que causa fricção em ambientes Windows sem build tools).
   - **Justificativa:** `node:crypto.scrypt` é um algoritmo padrão de derivação de chaves resistente a memória, embutido no Node.js 24 sem qualquer dependência externa, com zero custo e compatibilidade perfeita cross-platform.

2. **Identificador Híbrido no Login (`identifier`)**
   - **Escolha:** O endpoint de login aceita um campo `identifier` que pode ser tanto o e-mail quanto o nome de usuário (`username`).
   - **Alternativas consideradas:** Exigir apenas email no login; ou ter dois endpoints separados.
   - **Justificativa:** Oferece melhor usabilidade para o usuário final, permitindo login tanto com username memorizado quanto com email, enquanto o cadastro continua garantindo unicidade em ambos.

3. **Transporte Primário via Cookie `HttpOnly` com Fallback para Header `Authorization`**
   - **Escolha:** A API emite cabeçalho `Set-Cookie: yuukilist_session=<token>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`. O `AuthGuard` verifica primeiro a presença do cookie e, caso ausente, verifica o cabeçalho `Authorization: Bearer <token>`.
   - **Alternativas consideradas:** Exclusivamente Bearer Token em header (inseguro contra XSS no navegador); ou exclusivamente cookie (dificulta testes automatizados e chamadas de API).
   - **Justificativa:** Une a máxima segurança do navegador contra ataques XSS com a comodidade e simplicidade de testes de integração via `supertest`/Node test runner.

4. **Assinatura e Verificação de Token JWT Nativo**
   - **Escolha:** Implementação de `TokenService` utilizando assinatura HMAC-SHA256 (`crypto.createHmac`) sobre o envelope base64url padrão (`header.payload.signature`).
   - **Alternativas consideradas:** Instalação de pacotes externos (`jsonwebtoken`, `@nestjs/jwt`).
   - **Justificativa:** Evita adicionar peso ou vulnerabilidades à cadeia de suprimentos e roda com zero dependências externas extras usando o runtime Node.js.

## Risks / Trade-offs

- **[Risco] Timing Attack na validação de senhas** → **Mitigação:** Utilização mandatória de `crypto.timingSafeEqual` e execução de hash fictício quando o usuário não for encontrado para manter o tempo de resposta indistinguível.
- **[Risco] Colisão de concorrência no cadastro de username/email** → **Mitigação:** Constraints de unicidade no banco de dados (`@@unique([normalizedEmail])` e `@@unique([normalizedUsername])`) capturadas com tratamento para HTTP 409 Conflict.
- **[Risco] Replay de tokens expirados** → **Mitigação:** Validação estrita do timestamp `exp` no payload com rejeição imediata com HTTP 401.

## Migration Plan

1. Executar migração do Prisma gerando a tabela `users` com chaves e índices no PostgreSQL local.
2. Nenhuma tabela existente (`media_items`, etc.) é modificada, assegurando isolamento total e reversibilidade sem downtime.
3. Rollback: caso necessário, comando `prisma migrate resolve --rolled-back` ou drop manual da tabela `users`.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/api/prisma/schema.prisma` — Adição do modelo `User` com campos normalizados e timestamps.
- `[CREATE]` `apps/api/prisma/migrations/20261109000000_add_users/migration.sql` — Migration DDL criando a tabela `users` e índices únicos.
- `[CREATE]` `packages/shared/src/auth.ts` — DTOs `RegisterDto`, `LoginDto`, tipos `AuthUserResponse` e `SessionPayload`.
- `[MODIFY]` `packages/shared/src/index.ts` — Re-exportação dos tipos e contratos de autenticação.
- `[CREATE]` `apps/api/src/auth/password.service.ts` — Serviço de hash e validação de senhas via `crypto.scrypt`.
- `[CREATE]` `apps/api/src/auth/token.service.ts` — Serviço de emissão e verificação de JWT HMAC-SHA256 e cookies de sessão.
- `[CREATE]` `apps/api/src/auth/users.repository.ts` — Camada de persistência para usuários com Prisma Client.
- `[CREATE]` `apps/api/src/auth/auth.service.ts` — Regras de negócio de cadastro, login, logout e busca de perfil.
- `[CREATE]` `apps/api/src/auth/auth.guard.ts` — Guard de proteção de rotas privadas com extração de cookie/bearer.
- `[CREATE]` `apps/api/src/auth/current-user.decorator.ts` — Decorator para injeção do usuário autenticado nos controllers.
- `[CREATE]` `apps/api/src/auth/auth.controller.ts` — Controller REST expondo `/register`, `/login`, `/logout` e `/me`.
- `[CREATE]` `apps/api/src/auth/auth.module.ts` — Módulo NestJS agrupando providers, exports e controllers de autenticação.
- `[MODIFY]` `apps/api/src/app.module.ts` — Importação do `AuthModule`.
- `[CREATE]` `tests/auth-backend.test.mjs` — Suíte de testes automatizados com cobertura dos 9 cenários normativos.

## Data Model

### Entidade `User` (tabela: `users`)
| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default(uuid()) | Identificador único imutável do usuário |
| `email` | VarChar(255) | Not Null, Unique | Email original fornecido no cadastro |
| `normalized_email` | VarChar(255) | Not Null, Unique, Index | Email normalizado (trim + lowercase) |
| `username` | VarChar(64) | Not Null, Unique | Nome de usuário original de exibição |
| `normalized_username` | VarChar(64) | Not Null, Unique, Index | Username normalizado (trim + lowercase) |
| `password_hash` | VarChar(255) | Not Null | Hash seguro no formato `scrypt:salt:hash` |
| `created_at` | Timestamp | Not Null, default(now()) | Data de criação da conta |
| `updated_at` | Timestamp | Not Null, updated_at | Data da última alteração da conta |

## Contracts

### `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "yuuki_fan",
    "password": "strongPassword123"
  }
  ```
- **Response (201 Created):**
  - **Header:** `Set-Cookie: yuukilist_session=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
  - **Body:**
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "yuuki_fan",
      "createdAt": "2026-11-09T00:00:00.000Z"
    }
    ```
- **Errors:** 400 Bad Request (validação), 409 Conflict (email ou username já existente).

### `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "identifier": "yuuki_fan",
    "password": "strongPassword123"
  }
  ```
- **Response (200 OK):**
  - **Header:** `Set-Cookie: yuukilist_session=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
  - **Body:**
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "yuuki_fan",
      "createdAt": "2026-11-09T00:00:00.000Z"
    }
    ```
- **Errors:** 401 Unauthorized (credenciais inválidas).

### `POST /api/v1/auth/logout`
- **Response (200 OK):**
  - **Header:** `Set-Cookie: yuukilist_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  - **Body:** `{"success": true}`

### `GET /api/v1/auth/me`
- **Request Header:** Cookie `yuukilist_session=<jwt>` ou `Authorization: Bearer <jwt>`
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "username": "yuuki_fan",
    "createdAt": "2026-11-09T00:00:00.000Z"
  }
  ```
- **Errors:** 401 Unauthorized (token ausente, inválido ou expirado).

## Research

- **OWASP Password Storage Guidelines:** Recomenda o uso de algoritmos resistentes a memória como Argon2id ou Scrypt. Scrypt é suportado nativamente pelo Node.js através de `crypto.scrypt` com parâmetros ajustáveis de custo N, r e p.
- **RFC 7519 (JSON Web Tokens):** Assinatura HMAC-SHA256 é comprovadamente segura quando combinada com segredo de alta entropia (mínimo de 32 bytes aleatórios) e tempo de vida limitado.
- **Análise de Custo Zero (Princípio IV):** Todas as funcionalidades operam 100% no servidor PostgreSQL e runtime Node.js sem necessidade de fornecedores de auth gerenciados (como Auth0, Firebase Auth ou Supabase Auth pagos), preservando soberania total de dados e custo financeiro permanente de R$ 0.

