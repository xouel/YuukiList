# Proposal: 001-monorepo-data-seed

Status: `ARCHIVED`

## Why
O YuukiList necessita de uma fundação sólida de monorepo e camada de dados relacional para viabilizar o catálogo unificado de entretenimento asiático. Esta mudança inicial estabelece os pacotes base (apps/web, apps/api, packages/shared), o schema relacional PostgreSQL via Prisma com suporte às 6 categorias canônicas e status de publicação, o seed fixo determinístico de 30 obras equilibradas para a validação da Fase 1 e o provisionamento de capas SVG locais por slug, garantindo zero dependência externa e custo zero permanente.

## What Changes
- Configuração de monorepo com npm workspaces contendo `apps/web` (Next.js 15 App Router), `apps/api` (NestJS) e `packages/shared` (tipos, enums e schemas).
- Ativação da extensão nativa `pg_trgm` no PostgreSQL através da migration inicial do Prisma.
- Modelagem do schema Prisma com as tabelas `MediaItem`, `ItemGenre` e `ItemAlias`, com enums para as 6 categorias (`DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`) e os 5 status canônicos de publicação (`EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`, `HIATO`, `DESCONHECIDA`).
- Criação do script de seed determinístico e idempotente populando exatamente 30 obras fictícias (5 doramas, 5 filmes, 5 animes, 5 mangás, 5 manhwas e 5 manhuas) cobrindo equitativamente todos os status de publicação (5 itens por categoria, 1 de cada status).
- Criação e armazenamento local de 30 capas SVG originais servidas estaticamente por `slug`.
- Configuração do ambiente de testes unitários e de integração com Vitest.

## Capabilities
### New Capabilities
- `catalog-data`

### Modified Capabilities
- Nenhuma (capacidade inicial).

## Impact
- **Repositório:** Estrutura de monorepo em npm workspaces desacoplada e tipada.
- **Banco de Dados:** Tabelas relacionais criadas via Prisma no PostgreSQL com extensão `pg_trgm`.
- **Arquivos Estáticos:** 20 arquivos SVG originais organizados em diretório de assets.
- **Segurança:** Zero segredos no código-fonte; strings de conexão configuradas estritamente via `.env`.

## User Stories

### US1 — Inicialização do Monorepo e Conexão com PostgreSQL (P1)
Como desenvolvedor do YuukiList,
Quero ter um monorepo configurado com TypeScript, Prisma ORM e PostgreSQL com a extensão pg_trgm,
Para que o backend e o frontend compartilhem tipos e acessem o banco relacional de forma consistente.
**Independent Test:** Executar a migration inicial do Prisma e verificar no PostgreSQL que as tabelas existem e a extensão `pg_trgm` está ativa.

### US2 — População de Seed Determinístico com 30 Obras (P2)
Como desenvolvedor ou usuário avaliador da Fase 1,
Quero executar o comando de seed e obter exatamente 30 obras fictícias distribuídas entre as 6 categorias e os 5 status canônicos,
Para testar a aplicação com cobertura total das categorias sem depender de nenhuma API externa.
**Independent Test:** Executar o script de seed duas vezes seguidas e verificar que o total de obras permanece exatamente 30, sem duplicação nem erro.

### US3 — Servidor Local de Capas SVG por Slug (P3)
Como cliente frontend ou API,
Quero carregar a capa SVG de qualquer uma das 30 obras utilizando o seu slug,
Para exibir capas leves e vetoriais sem custos de CDN e com fallback visual seguro.
**Independent Test:** Requisitar a capa SVG de um slug válido e receber uma imagem SVG válida; para slug inexistente, receber imagem SVG placeholder.

## Success Criteria
- **SC-001:** O monorepo compila com sucesso (`npm run typecheck` ou `build`) nos pacotes `shared`, `api` e `web`.
- **SC-002:** A migration do Prisma cria com sucesso as tabelas do catálogo e ativa a extensão `pg_trgm`.
- **SC-003:** O seed insere exatamente 30 obras no banco de dados (5 doramas, 5 filmes, 5 animes, 5 mangás, 5 manhwas e 5 manhuas), cobrindo os 5 status canônicos em cada uma das 6 categorias.
- **SC-004:** Todas as 30 obras possuem arquivos SVG locais mapeados por `slug` e acessíveis com Content-Type `image/svg+xml`.

## Edge Cases
- Execuções subsequentes do script de seed devem ser idempotentes (utilizar `upsert` baseado no slug único).
- Acesso a capa com slug inválido ou inexistente deve retornar o SVG substituto padrão sem gerar erro interno no servidor.

## Out of Scope
- Rotas HTTP de busca textual e filtros do catálogo (escopo da fatia R2 / `002-catalog-search-api`).
- Interface gráfica com Tailwind CSS e shadcn/ui (escopo da fatia R3 / `003-catalog-browse-ui`).
- Cadastro de usuários e autenticação (escopo da fatia R4 / `004-auth-backend`).

## Clarifications
### Session 2026-11-08
- Q: Qual o vocabulário oficial das 6 categorias e status de publicação? → A: Categorias `DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`; status `EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`, `HIATO`, `DESCONHECIDA`, conforme Documento Mestre P-006 e P-018.
- Q: Onde as capas SVG devem residir? → A: Armazenadas localmente no backend em diretório estático e servidas por rota pública sem dependência de S3/Cloud Storage no MVP.
