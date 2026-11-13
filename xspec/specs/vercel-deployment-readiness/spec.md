# vercel-deployment-readiness Specification

## Purpose

Garantir a prontidão de build, resiliência em runtime serverless somente leitura na Vercel Hobby, endpoint de verificação de saúde (`GET /api/v1/health`) e prevenção gratuita de suspensão por inatividade no Supabase Free mantendo custo permanente zero.

## Requirements

### Requirement: Serverless Build Provisioning and Read-Only Filesystem Resilience
O sistema SHALL garantir geração automática do `PrismaClient` durante instalação/build do monorepo na Vercel (`vercel.json` e `postinstall`), tolerar sistema de arquivos somente leitura sem lançar erro em `SvgCoverService.saveCover()`, e evitar dependência de APIs de disco do `scripts/sync-catalog.mjs` no runtime web.

#### Scenario: Geracao de cliente Prisma e build limpo na Vercel
- **GIVEN** o monorepo configurado com `vercel.json` e script `postinstall` executando `prisma generate`
- **WHEN** o pipeline de build da Vercel instala dependências e compila `@yuukilist/web`
- **THEN** o cliente Prisma é gerado para `@yuukilist/api` e o build conclui sem falhas de módulo ausente ou escrita obrigatória em disco

#### Scenario: Tolerancia a filesystem somente leitura ao gerar capas SVG
- **GIVEN** o `SvgCoverService` ou `CatalogIngestionService` executando em diretório onde a escrita em disco é bloqueada (`EACCES` ou `EROFS`)
- **WHEN** `saveCover` ou ingestão inicial de catálogo é acionado em runtime
- **THEN** o sistema SHALL capturar a falha de escrita em disco sem interromper o fluxo nem derrubar a requisição, preservando a capa SVG gerada em memória e URLs remotas oficiais

### Requirement: Database Healthcheck Endpoint and Free Keep-Alive Automation
O sistema SHALL expor a rota pública `GET /api/v1/health` verificando a saúde da aplicação e executando consulta leve (`SELECT 1`) ao PostgreSQL quando configurado, acompanhada de automação gratuita agendada no GitHub Actions para prevenir hibernação por 7 dias no Supabase Free.

#### Scenario: Healthcheck saudavel com banco PostgreSQL conectado
- **GIVEN** a aplicação com `DATABASE_URL` ou `DIRECT_URL` configurado e banco PostgreSQL acessível
- **WHEN** um cliente envia requisição `GET /api/v1/health`
- **THEN** o sistema SHALL responder com HTTP 200 OK e JSON indicando `status: "ok"` e `database: "connected"` sem expor segredos ou connection strings

#### Scenario: Healthcheck degradado quando banco configurado estiver inacessivel
- **GIVEN** a aplicação configurada com banco PostgreSQL que falha ao responder `SELECT 1`
- **WHEN** um cliente envia requisição `GET /api/v1/health`
- **THEN** o sistema SHALL responder com HTTP 503 Service Unavailable e JSON indicando falha de conectividade sem vazar credenciais

#### Scenario: Workflow gratuito de keep-alive agendado no GitHub Actions
- **GIVEN** o repositório hospedado no GitHub com workflow agendado em `.github/workflows/`
- **WHEN** o gatilho `schedule` periódico executa com `YUUKILIST_HEALTHCHECK_URL` definida (ou ausente)
- **THEN** o workflow SHALL consultar o endpoint de saúde quando configurado para gerar atividade SQL no Supabase Free ou encerrar sem erro destrutivo quando a URL opcional não existir
