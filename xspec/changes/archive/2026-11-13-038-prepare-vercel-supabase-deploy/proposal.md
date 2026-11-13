# Proposal: Preparação de Deploy Custo Zero na Vercel Hobby + Supabase Free

> **X-Spec** · ID: `038-prepare-vercel-supabase-deploy` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-13`

## Why

O YuukiList já persiste catálogo, contas e biblioteca no Supabase PostgreSQL, mas sua hospedagem gratuita na Vercel Hobby ainda enfrenta bloqueios críticos: falta geração automática do Prisma Client no build do monorepo, o gerador de capas SVG grava em disco sem tratamento para ambiente serverless somente leitura, o segredo JWT possui fallback inseguro se omitido em produção e o diário pessoal e links de compartilhamento (`/share`) vivem apenas em memória RAM — perdendo anotações entre reinícios e exigindo proteções contra a pausa de 7 dias do Supabase Free.

## What Changes

- **Infraestrutura e Build Vercel (`R$ 0`):** Adicionar configuração de deploy do monorepo (`vercel.json` e script `postinstall` / build executando `prisma generate`) além de proteção resiliente contra sistema de arquivos somente leitura em `SvgCoverService.saveCover()` / `CatalogIngestionService` (sem quebrar se o disco bloquear escrita) e remoção da dependência de `node:fs` durante importação da amostra inicial no runtime web.
- **Healthcheck e Keep-Alive do Supabase Free:** Expor o endpoint público `GET /api/v1/health` retornando status da aplicação e verificação leve do PostgreSQL (`SELECT 1` quando `DATABASE_URL`/`DIRECT_URL` estiver presente) e adicionar workflow agendado gratuito no GitHub Actions para consultar o endpoint periodicamente, evitando suspensão por 7 dias de inatividade no Supabase Free.
- **Persistência Durável no PostgreSQL/Supabase:** Provisionar modelos Prisma e migrations para `HistoryEvent` (`DiaryRepository`) e `ShareLink` (`ProfileRepository`), conectando o `ServerContainer` ao `prismaClient` em produção e preservando fallback em memória apenas quando instanciados sem banco nos testes unitários.
- **Hardening de Segredo JWT em Produção:** Exigir `JWT_SECRET` explícito no `TokenService` quando executando em produção (`NODE_ENV=production` ou `VERCEL_ENV=production`), rejeitando inicialização/assinatura com a chave padrão de desenvolvimento nesse ambiente.
- **Documentação Operacional de Deploy:** Atualizar `.env.example` / checklist com a configuração correta do PgBouncer do Supabase (`DATABASE_URL` na porta `6543`, `DIRECT_URL` na porta `5432`) e variáveis necessárias na Vercel.

## Capabilities

### New Capabilities
- `vercel-deployment-readiness`: Configuração de build/runtime serverless do monorepo na Vercel Hobby, tolerância a filesystem somente leitura, endpoint `GET /api/v1/health` e prevenção de pausa de 7 dias do Supabase Free via cron gratuito.

### Modified Capabilities
- `personal-diary`: Persistência durável dos registros do diário (`HistoryEvent`) no PostgreSQL/Supabase via Prisma ORM mantendo compatibilidade com fallback em memória sem banco.
- `granular-sharing`: Persistência durável dos links tokenizados `/share/:token` (`ShareLink`) no PostgreSQL/Supabase via Prisma ORM mantendo compatibilidade com fallback em memória sem banco.
- `auth-session`: Obrigatoriedade explícita de `JWT_SECRET` em ambientes de produção sem uso silencioso de segredo padrão de desenvolvimento.

## Impact

- **Banco de Dados / Prisma:** `apps/api/prisma/schema.prisma`, nova migration em `apps/api/prisma/migrations/`, `package.json` (script `postinstall` / build com `prisma generate`).
- **Backend / Repositórios / Auth:** `apps/api/src/diary/diary.repository.ts`, `apps/api/src/profile/profile.repository.ts`, `apps/api/src/profile/profile.module.ts`, `apps/api/src/auth/token.service.ts`, `apps/api/src/data/svg-cover.service.ts`, `apps/web/src/server/container.ts`.
- **APIs / Infra / CI:** `apps/web/src/app/api/v1/health/route.ts`, `vercel.json`, `.env.example`, `.github/workflows/supabase-keepalive.yml`.
- **Testes:** `tests/` (novos testes unitários/contrato para healthcheck, falha segura de `JWT_SECRET` em produção, tolerância a FS somente leitura e persistência/fallback de diário e share links).

## User Stories

### US1 — Build Serverless na Vercel e Persistência Real para Usuárias (Priority: P1)
Como mantenedor do YuukiList para minha família e amigas, quero publicar o projeto na Vercel Hobby conectado ao Supabase Free garantindo que o build gere o Prisma Client sem erros, capas não quebrem em disco somente leitura e registros do diário ou links `/share/:token` permaneçam salvos no banco entre reinícios serverless.

- **Why this priority:** Sem `prisma generate`, proteção de `fs.writeFileSync` e persistência do Diário/Share Links no PostgreSQL, o app falha no deploy ou perde dados reais de uso entre instâncias da Vercel.
- **Independent Test:** Executar `npm run build` com geração automática do Prisma Client; simular `saveCover` em caminho somente leitura sem lançar exceção; verificar persistência via `DiaryRepository(prismaMock)` e `ProfileRepository(prismaMock)` e compatibilidade dos testes existentes.

### US2 — Observabilidade Simples e Manutenção Automática do Supabase Free (Priority: P2)
Como administrador sem custo mensal, quero consultar `GET /api/v1/health` para confirmar que a aplicação e o banco responderam após o deploy e manter um ping agendado no GitHub Actions para o Supabase Free não hibernar após 7 dias sem uso.

- **Why this priority:** Garante diagnóstico imediato de variáveis na Vercel (`DATABASE_URL`/`DIRECT_URL`) e evita que o projeto fique offline para a família por pausa de inatividade no Supabase Free.
- **Independent Test:** Chamar `GET /api/v1/health` verificando status JSON com e sem banco conectado (incluindo resposta degradada `503` se a query ao banco falhar) e validar sintaxe do workflow `.github/workflows/supabase-keepalive.yml`.

### US3 — Segurança de Sessão Garantida em Produção (Priority: P2)
Como responsável pelas contas de acesso privadas da família, quero que `TokenService` recuse operar em produção sem `JWT_SECRET` definido, impedindo assinaturas JWT com o segredo padrão de desenvolvimento.

- **Why this priority:** Evita exposição silenciosa de sessões e falsificação de tokens caso a variável `JWT_SECRET` seja esquecida na configuração da Vercel.
- **Independent Test:** Instanciar/executar `TokenService` com `NODE_ENV=production` (ou `VERCEL_ENV=production`) sem `JWT_SECRET` esperando erro explícito, e validar sucesso com `JWT_SECRET` definido ou em ambiente `test`/`development`.

## Success Criteria

- **SC-001**: `package.json` e `vercel.json` garantem execução automática de `prisma generate` e build limpo do `@yuukilist/web` no monorepo sem intervenção manual.
- **SC-002**: `SvgCoverService.saveCover()` e inicialização de catálogo em `ServerContainer` não falham nem lançam exceções não tratadas quando executados em sistema de arquivos somente leitura (serverless).
- **SC-003**: `DiaryRepository` (`HistoryEvent`) e `ProfileRepository` (`ShareLink`) persistem e consultam dados no PostgreSQL via `PrismaClient` quando conectado, mantendo retrocompatibilidade em memória nos testes unitários sem banco.
- **SC-004**: `GET /api/v1/health` retorna HTTP `200` com `{ status: 'ok', database: 'connected' | 'memory' }` em operação normal (ou HTTP `503` quando o Postgres configurado falhar no `SELECT 1`), e existe workflow agendado gratuito de keep-alive no GitHub Actions.
- **SC-005**: `TokenService` rejeita ausência de `JWT_SECRET` quando `NODE_ENV=production` ou `VERCEL_ENV=production`, mantendo fallback determinístico exclusivamente em desenvolvimento e testes.

## Edge Cases

- Se `DATABASE_URL` estiver configurada na Vercel mas com credencial inválida ou banco pausado, `GET /api/v1/health` deve capturar o erro sem vazar a connection string e responder HTTP `503`.
- Se o workflow de keep-alive no GitHub Actions executar antes de o usuário cadastrar a secret `YUUKILIST_HEALTHCHECK_URL`, o job deve encerrar com aviso neutro sem falhar ruidosamente por URL vazia.
- Durante `next build` na Vercel (`NODE_ENV=production`), módulos importados estaticamente não devem abortar o build caso `JWT_SECRET` ainda não seja necessário até a execução real de assinatura/verificação ou caso haja variáveis definidas apenas em runtime — ou seja, a validação deve ocorrer na inicialização/operação de `TokenService` em runtime sem quebrar coleta estática de rotas.
- Eventos de diário criados com `mediaItemId` válido e remoção/expurgo de usuário (`purgeUserData`) devem respeitar `onDelete: Cascade` no PostgreSQL sem deixar registros órfãos.

## Out of Scope

- Migração de `NotificationRepository`, `RelationsRepository`, `ProvisionalRepository` ou eventos manuais de `CalendarRepository` para novas tabelas SQL (escopo restrito a Diário e Share Links conforme Clarification Gate).
- Configuração de pagamento, planos Pro na Vercel/Supabase ou uso de Cloudflare Workers/Hyperdrive.
- Integração com serviços externos pagos de monitoramento ou armazenamento pago de imagens.

## Clarifications

### Session 2026-11-13
- Q: Quais dados hoje em memória devem passar a persistir no Supabase nesta entrega? → A: Opção A (recomendado) — Persistir Diário/Histórico (`HistoryEvent`) e Links Públicos (`/share/:token`) no Prisma/Supabase além das adequações de build/deploy na Vercel.
- Q: Devemos criar um endpoint `GET /api/v1/health` e um keep-alive semanal gratuito para o Supabase Free? → A: Opção A (recomendado) — Criar `GET /api/v1/health` verificando conectividade leve com o banco e adicionar cron gratuito agendado no GitHub Actions para evitar pausa de 7 dias no Supabase Free.
- Q: Como a aplicação deve tratar a ausência de `JWT_SECRET` em produção? → A: Opção A (recomendado) — Falha explícita em produção (`NODE_ENV=production` / `VERCEL_ENV=production`) quando `JWT_SECRET` estiver ausente, mantendo fallback apenas em desenvolvimento e testes.

