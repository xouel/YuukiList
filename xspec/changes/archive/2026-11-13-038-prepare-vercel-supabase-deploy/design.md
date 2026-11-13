# Design: 038-prepare-vercel-supabase-deploy

## Context

O `@yuukilist/web` (`apps/web`, Next.js 15 App Router) já hospeda tanto o frontend quanto os 35 endpoints `/api/v1/*` via `transpilePackages: ['@yuukilist/api', '@yuukilist/shared']` e singleton `ServerContainer` (`apps/web/src/server/container.ts`). Catálogo (`MediaItem`), usuários (`User`) e biblioteca pessoal (`UserLibraryItem`) já utilizam `PrismaClient` no PostgreSQL (Supabase), mas quatro lacunas impedem deploy confiável em produção na Vercel Hobby + Supabase Free:

1. **Empacotamento Prisma em monorepo npm workspaces:** `apps/api/prisma/schema.prisma` só gera o target `native`, `package.json` não possui `postinstall` executando `prisma generate`, e `apps/web/next.config.mjs` não configura `outputFileTracingRoot` / `serverExternalPackages` para garantir inclusão dos binários do query engine nas funções Linux (`rhel-openssl-3.0.x`) da Vercel.
2. **Acoplamento a sistema de arquivos gravável e script CLI:** `apps/web/src/server/container.ts` importa `SAMPLE_EXTERNAL_TITLES` diretamente de `scripts/sync-catalog.mjs` (que carrega `node:fs`/`node:path`), e `SvgCoverService.saveCover()` (`apps/api/src/data/svg-cover.service.ts`) chama `fs.writeFileSync` sem `try/catch`, quebrando caso `CatalogIngestionService` rode em filesystem somente leitura serverless.
3. **Repositórios críticos ainda em memória:** `DiaryRepository` (`apps/api/src/diary/diary.repository.ts`) e `ProfileRepository` (`apps/api/src/profile/profile.repository.ts`, responsável pelos links `/share/:token`) ainda armazenam registros apenas em `Map`/`Array` locais, perdendo histórico e links compartilhados entre invocações serverless na Vercel.
4. **Hardening de produção e keep-alive gratuito:** `TokenService` (`apps/api/src/auth/token.service.ts`) usa segredo fixo de desenvolvimento como fallback mesmo em produção; não há rota `/api/v1/health` nem rotina automática gratuita para prevenir suspensão por 7 dias de inatividade no Supabase Free.

## Goals / Non-Goals

**Goals:**
- Garantir deploy nativo do monorepo na Vercel Hobby (Root `.` ou `apps/web`) com geração e empacotamento automático do `@prisma/client` (`native` + `rhel-openssl-3.0.x`).
- Tornar o runtime web 100% tolerante a filesystem somente leitura (sem importar `scripts/` no bundle SSR e sem exceção em `SvgCoverService.saveCover()`).
- Persistir `HistoryEvent` (diário/histórico) e `ShareLink` (`/share/:token`) no Supabase PostgreSQL mantendo retrocompatibilidade completa com o modo em memória quando instanciados sem `PrismaClient` nos testes.
- Expor `GET /api/v1/health` (diagnóstico seguro + `SELECT 1`), adicionar keep-alive periódico R\$ 0 via GitHub Actions e exigir `JWT_SECRET` explícito em produção sem quebrar a etapa estática de `next build`.

**Non-Goals:**
- Separar `apps/api` em servidor HTTP independente (Render/Railway), pois todos os Route Handlers `/api/v1/*` já operam em `apps/web`.
- Migrar `NotificationRepository`, `RelationsRepository`, `ProvisionalRepository` ou eventos manuais de `CalendarRepository` para novas tabelas SQL neste ciclo.
- Adotar qualquer serviço pago ou trial com cartão (mantendo fidelidade integral ao Princípio IV da `xspec/constitution.md`).

## Decisions

1. **Deploy monolítico em Vercel Hobby (Next.js App Router + Route Handlers `/api/v1/*`) + Supabase PgBouncer**
   - **Escolha:** Manter toda a aplicação unificada em `apps/web` na Vercel Hobby, configurando `vercel.json` na raiz do repositório, `postinstall` no `package.json`, `binaryTargets = ["native", "rhel-openssl-3.0.x"]` em `schema.prisma`, `serverExternalPackages` + `outputFileTracingRoot` em `next.config.mjs`, e documentando `DATABASE_URL` na porta `6543` (`?pgbouncer=true`) + `DIRECT_URL` na porta `5432` em `.env.example`.
   - **Alternativas consideradas:** (a) Separar backend no Render Free (`apps/api` precisaria de bootstrap HTTP novo, CORS/cookies cross-origin e sofreria *cold start* de 30–60s); (b) Cloudflare Workers via `@opennextjs/cloudflare` + Hyperdrive (risco de violar o teto de 10 ms de CPU do plano Free com `crypto.scrypt` e SSR).
   - **Justificativa:** Uso estritamente pessoal/familiar sem monetização atende aos termos da Vercel Hobby, entrega latência mínima e evita manter infraestrutura duplicada em R\$ 0.

2. **Validação tardia (*lazy*) de `JWT_SECRET` em `TokenService` em vez de erro no construtor**
   - **Escolha:** Manter o construtor de `TokenService` livre de side effects bloqueantes para não quebrar a importação de `@/server/container` durante `next build` (`NODE_ENV=production`), movendo a resolução e validação (`resolveSecret()`) para os métodos `signSession()` e `verifySession()` (exigindo `secret` injetado ou `process.env.JWT_SECRET` quando `NODE_ENV === 'production'` ou `VERCEL_ENV === 'production'`).
   - **Alternativas consideradas:** Validar `process.env.JWT_SECRET` diretamente no `constructor` de `TokenService`.
   - **Justificativa:** Durante `next build`, o Next.js importa módulos de rotas em `NODE_ENV=production` para coleta de metadados mesmo em builds onde segredos de runtime são injetados depois ou em verificações locais; validar na operação real evita falhas falsas de compilação e bloqueia 100% qualquer emissão/validação de JWT inseguro em runtime.

3. **Persistência dual (`PrismaClient | null`) em `DiaryRepository` e `ProfileRepository`**
   - **Escolha:** Seguir exatamente o padrão já validado em `LibraryRepository` e `UsersRepository`: aceitar `customPrisma?: PrismaClient | null` no construtor e injetar `prismaClient` a partir de `ServerContainer`. Quando `this.prisma` estiver ativo, operar nas novas tabelas PostgreSQL `history_events` e `share_links`; quando `null`, preservar integralmente o armazenamento em memória para os testes unitários existentes.
   - **Alternativas consideradas:** Tornar `PrismaClient` obrigatório nos construtores.
   - **Justificativa:** Preserva execução rápida e determinística de toda a suíte `tests/*.test.mjs` offline sem banco real, garantindo cobertura e isolamento.

4. **Desacoplamento de `SAMPLE_EXTERNAL_TITLES` e proteção `try/catch` no `saveCover`**
   - **Escolha:** Extrair `SAMPLE_EXTERNAL_TITLES` para `apps/api/src/data/sample-external-titles.ts` (sem `node:fs`/`node:path`), reexportar em `scripts/sync-catalog.mjs`, e envolver `fs.writeFileSync` de `SvgCoverService.saveCover()` em `try/catch` retornando o caminho lógico sem abortar.
   - **Alternativas consideradas:** Gravar SVGs em `/tmp` na Vercel.
   - **Justificativa:** `CoverStorageService` e `/api/v1/catalog/items/[slug]/cover` já geram o SVG dinamicamente em memória quando o arquivo não existe em disco; tolerar a falha de escrita em disco mantém código simples e sem risco de encher `/tmp`.

## Risks / Trade-offs

- **[Risco]** O Next.js file tracing na Vercel não incluir o binário `.node` do Prisma gerado no root hoisting do npm workspaces → **Mitigação:** Combinar `binaryTargets = ["native", "rhel-openssl-3.0.x"]` em `schema.prisma`, `serverExternalPackages: ['@prisma/client', 'prisma']`, `outputFileTracingRoot` apontando para a raiz do monorepo e `outputFileTracingIncludes` em `apps/web/next.config.mjs`.
- **[Risco]** `DiaryRepository.create` receber `mediaItemId` como `slug` em vez de UUID ao gravar chave estrangeira `media_items(id)` no PostgreSQL → **Mitigação:** Reutilizar resolução `resolveMediaId(idOrSlug)` semelhante à de `LibraryRepository` antes de gravar `history_events`.
- **[Risco]** O endpoint `/api/v1/health` ou o cron keep-alive gerar carga desnecessária ou falhar caso o usuário ainda não tenha configurado a secret `YUUKILIST_HEALTHCHECK_URL` no GitHub → **Mitigação:** Query mínima `SELECT 1` apenas uma vez a cada 3 dias (expressão cron `0 12 */3 * *`), e passo condicional no workflow que registra aviso neutro e encerra com exit `0` se a secret estiver vazia.
- **[Risco]** Esquecer de rodar a nova migration SQL no Supabase antes de publicar → **Mitigação:** Incluir o SQL idempotente em `apps/api/prisma/migrations/20261113000000_add_history_events_and_share_links/migration.sql` e documentar `npx prisma migrate deploy` no plano de migração e checklist de deploy.

## Migration Plan

1. Aplicar alterações de schema Prisma (`apps/api/prisma/schema.prisma`) + migration SQL (`apps/api/prisma/migrations/20261113000000_add_history_events_and_share_links/migration.sql`).
2. Antes ou durante o primeiro deploy no Supabase de produção, executar:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```
3. Configurar variáveis na Vercel (`DATABASE_URL` porta `6543` com `?pgbouncer=true`, `DIRECT_URL` porta `5432`, `JWT_SECRET` aleatório forte, e opcionais `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Opcionalmente cadastrar a secret `YUUKILIST_HEALTHCHECK_URL` (`https://<seu-app>.vercel.app/api/v1/health`) nas Settings → Secrets → Actions do repositório GitHub.
5. **Rollback:** Caso ocorra problema após deploy, basta reverter o deployment anterior no painel da Vercel (rollback instantâneo); as duas novas tabelas `history_events` e `share_links` são estritamente aditivas e não alteram tabelas existentes (`media_items`, `users`, `user_library_items`).

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `vercel.json` — Configuração de instalação/build e output do monorepo na Vercel.
- `[CREATE]` `apps/api/prisma/migrations/20261113000000_add_history_events_and_share_links/migration.sql` — DDL PostgreSQL para criação de `history_events` e `share_links`.
- `[CREATE]` `apps/api/src/data/sample-external-titles.ts` — Fixture pura da amostra inicial sem imports de `node:fs`/`node:path`.
- `[CREATE]` `apps/web/src/app/api/v1/health/route.ts` — Endpoint `GET /api/v1/health` retornando saúde da app e conectividade Postgres.
- `[CREATE]` `.github/workflows/supabase-keepalive.yml` — Workflow gratuito agendado para prevenção de pausa por 7 dias no Supabase Free.
- `[CREATE]` `tests/vercel-supabase-deploy.test.mjs` — Testes de contrato/unidade para build config, `saveCover`, `JWT_SECRET`, `/api/v1/health` e persistência Prisma mockada.
- `[MODIFY]` `package.json` & `apps/web/package.json` — Scripts `postinstall` e `build` garantindo `prisma generate`.
- `[MODIFY]` `.env.example` — Documentação atualizada de `DATABASE_URL` (PgBouncer `6543`), `DIRECT_URL` (`5432`), `JWT_SECRET` e Supabase Storage.
- `[MODIFY]` `apps/api/prisma/schema.prisma` — `binaryTargets` (`rhel-openssl-3.0.x`) e modelos `HistoryEvent` + `ShareLink`.
- `[MODIFY]` `apps/web/next.config.mjs` — `outputFileTracingRoot`, `serverExternalPackages` e `outputFileTracingIncludes` para Prisma no monorepo.
- `[MODIFY]` `scripts/sync-catalog.mjs` — Reexportar `SAMPLE_EXTERNAL_TITLES` de `apps/api/src/data/sample-external-titles.ts`.
- `[MODIFY]` `apps/api/src/data/svg-cover.service.ts` — `try/catch` resiliente em `saveCover()`.
- `[MODIFY]` `apps/api/src/auth/token.service.ts` — Validação estrita de `JWT_SECRET` em produção na execução (`signSession`/`verifySession`).
- `[MODIFY]` `apps/api/src/diary/diary.repository.ts` & `apps/api/src/diary/diary.module.ts` — Suporte Prisma (`prisma.historyEvent`) com fallback em memória.
- `[MODIFY]` `apps/api/src/profile/profile.repository.ts` & `apps/api/src/profile/profile.module.ts` — Suporte Prisma (`prisma.shareLink`) com fallback em memória.
- `[MODIFY]` `apps/web/src/server/container.ts` — Injeção de `prismaClient` em `DiaryRepository` e `ProfileRepository`, método `checkDatabaseHealth()` e import limpo de `SAMPLE_EXTERNAL_TITLES`.
- `[MODIFY]` `tests/auth-backend.test.mjs`, `tests/personal-diary-history.test.mjs`, `tests/profile-sharing-lgpd.test.mjs` — Regressão e cobertura dos cenários novos.

## Data Model

### `HistoryEvent` (`@@map("history_events")`)
- `id`: `String @id @default(uuid()) @db.Uuid`
- `userId`: `String @map("user_id") @db.Uuid` (FK -> `users.id`, `onDelete: Cascade`)
- `mediaItemId`: `String @map("media_item_id") @db.Uuid` (FK -> `media_items.id`, `onDelete: Cascade`)
- `type`: `String @db.VarChar(32)` (`PROGRESS_UPDATE`, `STATUS_CHANGE`, `MANUAL_NOTE`, `RATING_UPDATE`, `FAVORITE_TOGGLE`, `REWATCH_INCREMENT`)
- `occurredAt`: `DateTime @default(now()) @map("occurred_at")`
- `previousStatus`: `String? @map("previous_status") @db.VarChar(32)`
- `newStatus`: `String? @map("new_status") @db.VarChar(32)`
- `previousProgress`: `Int? @map("previous_progress")`
- `newProgress`: `Int? @map("new_progress")`
- `rating`: `Float?`
- `isFavorite`: `Boolean? @map("is_favorite")`
- `rewatchCount`: `Int? @map("rewatch_count")`
- `note`: `String? @db.Text`
- `episodeNumber`: `Int? @map("episode_number")`
- `chapterNumber`: `Int? @map("chapter_number")`
- `volumeNumber`: `Int? @map("volume_number")`
- `containsSpoiler`: `Boolean @default(false) @map("contains_spoiler")`
- `createdAt`: `DateTime @default(now()) @map("created_at")`
- `updatedAt`: `DateTime @updatedAt @map("updated_at")`
- Índices: `@@index([userId, occurredAt(sort: Desc)])` e `@@index([userId, mediaItemId])`.

### `ShareLink` (`@@map("share_links")`)
- `id`: `String @id @default(uuid()) @db.Uuid`
- `userId`: `String @map("user_id") @db.Uuid` (FK -> `users.id`, `onDelete: Cascade`)
- `token`: `String @unique @db.VarChar(64)`
- `shareScope`: `String @default("FULL_LIBRARY") @map("share_scope") @db.VarChar(32)`
- `expiresAt`: `DateTime @map("expires_at")`
- `isRevoked`: `Boolean @default(false) @map("is_revoked")`
- `createdAt`: `DateTime @default(now()) @map("created_at")`
- Índices: `@@index([userId, createdAt(sort: Desc)])` e `@@index([token])` (via `@unique`).

## Contracts

### 1. Endpoint `GET /api/v1/health`
- **Request:** Público, sem body ou cookies obrigatórios; usa `Cache-Control: no-store`.
- **Response `200 OK` (saudável):**
  - Com banco conectado: `{ "status": "ok", "database": "connected", "timestamp": "<ISO8601>" }`
  - Sem banco configurado (`!DATABASE_URL && !DIRECT_URL`): `{ "status": "ok", "database": "memory", "timestamp": "<ISO8601>" }`
- **Response `503 Service Unavailable` (erro no `SELECT 1`):**
  - `{ "status": "degraded", "database": "error", "message": "Database connectivity check failed", "timestamp": "<ISO8601>" }`
  - **Restrição de segurança:** Nunca retornar `error.message` bruto contendo hostname, usuário, senha ou query string de `DATABASE_URL`/`DIRECT_URL`.

### 2. Contrato `TokenService` em Produção
- Construtor aceita `secret?: string` sem lançar erro durante avaliação estática de módulos.
- `signSession()` / `verifySession()` resolvem o segredo na execução:
  - Prioriza `secret` explícito (quando passado no construtor) → `process.env.JWT_SECRET`.
  - Se ambos estiverem vazios e `(process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production')`, lança `Error('JWT_SECRET é obrigatório em ambiente de produção.')`.
  - Caso contrário (`development` / `test`), usa o fallback local existente.

### 3. Contrato `ServerContainer.checkDatabaseHealth()`
- Expõe método assíncrono em `ServerContainer` reutilizando o `prismaClient` singleton para executar `await this.prismaClient.$queryRaw\`SELECT 1\``, retornando `'connected' | 'memory' | 'error'`.

## Research

Análise de conformidade com o **Princípio IV (Meta R\$ 0 / Custo Zero & Due Diligence Obrigatória)** da `xspec/constitution.md`:

| Serviço / Ferramenta | Licença / Plano | Limites Permanentes Gratuitos (verificados em 2026-11-13) | Risco / Exigência de Cartão | Estratégia de Saída (*Exit Strategy*) |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel Hobby** | Tier gratuito permanente | 100 GB transferência/mês, 1M invocações serverless/mês, timeout função até 300s, builds até 45 min. **Restrito a uso pessoal/não comercial** (compatível com uso familiar/privado). | Não exige cartão de crédito; se limites estourarem, pausa até o próximo ciclo sem cobrança automática. | Código padrão Next.js 15 App Router sem lock-in proprietário; pode migrar com `next build && next start` para qualquer Node VPS, Render ou container Docker. |
| **Supabase Free** | Tier gratuito permanente (PostgreSQL Open Source + Storage) | Até 2 projetos ativos, 500 MB de banco, 1 GB Storage, 5 GB egress/mês, 50.000 MAU, **PgBouncer nativo (porta 6543)** + conexão direta (porta 5432). Pausa após **7 dias sem queries Postgres** (reativável no painel em até 1 ano). | Não exige cartão; mitigação automática da pausa de 7 dias incluída via `GET /api/v1/health` + cron R\$ 0 no GitHub Actions. | Banco 100% PostgreSQL + Prisma padrão (`pg_trgm`); dump via `pg_dump` migrando sem alteração de código para Neon Free, Postgres local ou VPS. |
| **GitHub Actions** | Gratuito em repositórios públicos (e cota gratuita em privados) | Cron periódico leve executando apenas `curl` a cada 3 dias (`~10 execuções/mês` de poucos segundos). | Sem custo em repo público; workflow falha suavemente (`exit 0` com aviso) se secret não existir. | Substituível em 1 minuto por qualquer serviço gratuito de ping externo ou cron local sem alteração no código da app. |

