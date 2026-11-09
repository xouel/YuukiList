# Design: 001-monorepo-data-seed

## Context

O YuukiList inicia seu ciclo de implementação a partir de um repositório greenfield governado pelo X-Spec v2.0.1. Conforme estabelecido na Constituição (`xspec/constitution.md`), a aplicação segue o estilo **Monólito Modular** com separação estrita entre o pacote compartilhado (`packages/shared`), o backend (`apps/api` dividido nas camadas `data` e `catalog`) e o frontend (`apps/web` com Next.js App Router).

Esta mudança (`001-monorepo-data-seed` — Fatia R1 do Roadmap) constrói toda a fundação estrutural do monorepo, a camada de dados (`data`) com PostgreSQL + Prisma ORM + extensão `pg_trgm`, o seed determinístico de **30 obras fictícias** (5 para cada uma das 6 categorias canônicas, cobrindo os 5 status de publicação) e o repositório local de capas SVG vetoriais servidas por `slug`.

## Goals / Non-Goals

**Goals:**
- Estruturar o monorepo utilizando **npm workspaces** nativo (`packages/shared`, `apps/api`, `apps/web`) sem ferramentas pagas ou complexidade desnecessária.
- Definir e provisionar o schema Prisma no PostgreSQL com a extensão `pg_trgm` habilitada na migration inicial e índice GIN sobre a coluna `normalizedTitle`.
- Modelar e validar em runtime (via Zod e Prisma) os enums canônicos das **6 categorias** (`DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`) e **5 status de publicação** (`EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`, `HIATO`, `DESCONHECIDA`).
- Implementar uma função determinística de normalização de texto (`normalizeSearchText`) em `packages/shared` que remove diacríticos, substitui pontuação por espaços e colapsa múltiplos espaços sem alterar o título original de exibição.
- Implementar um seed idempotente (`upsert` por `slug`) que popule exatamente **30 obras** (6 categorias × 5 status), incluindo gêneros e títulos alternativos (`ItemAlias`).
- Gerar e servir localmente **30 capas SVG originais** (uma para cada `slug` do seed) mais **1 SVG placeholder** de fallback seguro quando um `slug` inexistente ou inválido for consultado.
- Configurar a suíte de testes automatizados com Vitest validando schema, enums, idempotência do seed e serviço de capas SVG.

**Non-Goals:**
- Implementar os endpoints REST de listagem paginada, busca `pg_trgm` completa e filtros combinados (escopo da Fatia R2 / `002-catalog-search-api`).
- Construir as páginas React/Next.js do catálogo e detalhes (escopo da Fatia R3 / `003-catalog-browse-ui`).
- Implementar autenticação JWT ou tabelas de usuários e listas pessoais (Fases 2 e 3).
- Conectar a APIs externas como TMDB, TVmaze ou Kitsu nesta fase (Fase 4).

## Decisions

1. **Gerenciamento do Monorepo com npm Workspaces Nativo**
   - **Escolha:** Utilizar `workspaces: ["packages/*", "apps/*"]` diretamente no `package.json` raiz do Node.js `>=22.0.0`.
   - **Alternativas consideradas:** Turborepo, Nx, pnpm workspaces.
   - **Justificativa:** O Node.js 22+ e o npm já estão instalados e operacionais no ambiente local sem exigir instalação global adicional. Mantém o projeto enxuto (YAGNI) e 100% aderente ao Princípio I e IV da Constituição.

2. **Coluna Persistida `normalizedTitle` + Extensão `pg_trgm` na Migration**
   - **Escolha:** Calcular `normalizedTitle` na camada de aplicação (`packages/shared`) antes de gravar no banco e indexar a coluna com `GIN (normalized_title gin_trgm_ops)` na migration SQL inicial do Prisma.
   - **Alternativas consideradas:** Usar a função `unaccent()` do PostgreSQL em tempo de consulta ou coluna gerada no banco.
   - **Justificativa:** No PostgreSQL, `unaccent()` é marcada como `STABLE` (não `IMMUTABLE`), o que impede seu uso direto em expressões de índice sem wrappers customizados de superusuário. A normalização determinística via código TypeScript (`NFD` + remoção de marcas diacríticas `[\u0300-\u036f]`) garante portabilidade, testabilidade unitária instantânea e indexação GIN direta.

3. **Matriz Simétrica de 30 Obras no Seed (`6 Categorias × 5 Status`)**
   - **Escolha:** Popular exatamente 30 obras fictícias originais (5 `DORAMA`, 5 `FILME`, 5 `ANIME`, 5 `MANGA`, 5 `MANHWA`, 5 `MANHUA`), onde cada grupo de 5 cobre exatamente uma vez cada status canônico (`EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`, `HIATO`, `DESCONHECIDA`), utilizando `prisma.mediaItem.upsert({ where: { slug } })`.
   - **Alternativas consideradas:** `createMany({ skipDuplicates: true })` ou `deleteMany()` seguido de `createMany()`.
   - **Justificativa:** O `upsert` por `slug` preserva os IDs internos existentes caso o seed seja reexecutado em um banco em uso, garantindo idempotência real sem apagar relacionamentos futuros.

4. **Armazenamento e Resolução Local de Capas SVG com Fallback Determinístico**
   - **Escolha:** Armazenar os 30 arquivos `<slug>.svg` e o arquivo `_placeholder.svg` em `apps/api/assets/covers/` e expor um serviço `CoverStorageService` na camada `data` que resolve o SVG por `slug` (validando formato `^[a-z0-9-]+$` contra path traversal) e retorna `{ svgContent, isFallback, contentType: 'image/svg+xml' }`.
   - **Alternativas consideradas:** Hospedar imagens em serviço externo (Cloudinary/S3) ou gerar binários PNG.
   - **Justificativa:** SVGs locais têm custo zero, pesam menos de 2 KB por arquivo, são versionáveis no Git, carregam instantaneamente em testes locais e permitem validar o fallback visual sem rede externa.

## Risks / Trade-offs

- **[Risco]** Indisponibilidade de instância PostgreSQL local durante a execução de testes rápidos em ambientes isolados → **Mitigação:** Separar a validação do repositório/seed em um adaptador de persistência que opera contra o Prisma Client real quando `DATABASE_URL` está acessível e permite verificação contratual completa nos testes automatizados, garantindo que tanto a migration SQL quanto a lógica de idempotência de 30 itens sejam provadas deterministicamente.
- **[Risco]** Tentativa de Path Traversal ao solicitar capa SVG por `slug` malicioso (ex.: `../../etc/passwd`) → **Mitigação:** Validar o `slug` com regex estrita `^[a-z0-9]+(?:-[a-z0-9]+)*$` antes de qualquer leitura de arquivo; qualquer formato inválido retorna imediatamente o `_placeholder.svg` em memória/disco sem acessar caminhos externos.

## Migration Plan

1. A migration inicial `apps/api/prisma/migrations/20261108000000_init_catalog_data/migration.sql` executa:
   - `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
   - Criação dos tipos enumerados `"Category"` e `"PublicationStatus"`.
   - Criação das tabelas `"media_items"`, `"item_genres"` e `"item_aliases"` com chaves estrangeiras `ON DELETE CASCADE`.
   - Criação do índice único em `"media_items"("slug")` e do índice GIN `CREATE INDEX "media_items_normalized_title_trgm_idx" ON "media_items" USING GIN ("normalized_title" gin_trgm_ops);`.
2. **Rollback:** Executar `DROP TABLE IF EXISTS "item_aliases", "item_genres", "media_items" CASCADE; DROP TYPE IF EXISTS "PublicationStatus", "Category";`.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `package.json` — Manifesto raiz do monorepo com npm workspaces e scripts de build, lint, typecheck e test.
- `[CREATE]` `tsconfig.base.json` — Configuração TypeScript estrita compartilhada por todos os pacotes.
- `[CREATE]` `.env.example` — Template documentado de variáveis de ambiente (`DATABASE_URL`, `PORT`), sem segredos reais.
- `[CREATE]` `packages/shared/package.json` — Pacote compartilhado `@yuukilist/shared`.
- `[CREATE]` `packages/shared/src/enums.ts` — Enums canônicos `Category` (6 categorias) e `PublicationStatus` (5 status) + validadores Zod/runtime.
- `[CREATE]` `packages/shared/src/normalizer.ts` — Função `normalizeSearchText` e gerador de `slug`.
- `[CREATE]` `packages/shared/src/types.ts` — Contratos tipados `MediaItemDto`, `SeedItemInput` e `CoverResult`.
- `[CREATE]` `packages/shared/src/index.ts` — Barrel file exportando contratos, enums e normalizador.
- `[CREATE]` `apps/api/package.json` — Pacote backend `@yuukilist/api`.
- `[CREATE]` `apps/api/prisma/schema.prisma` — Schema Prisma com PostgreSQL, `pg_trgm`, enums e modelos `MediaItem`, `ItemGenre` e `ItemAlias`.
- `[CREATE]` `apps/api/prisma/migrations/20261108000000_init_catalog_data/migration.sql` — DDL SQL determinístico com `pg_trgm` e índices GIN.
- `[CREATE]` `apps/api/src/data/seed-data.ts` — Catálogo estático das 30 obras fictícias (5 por categoria × 5 status).
- `[CREATE]` `apps/api/src/data/seed.ts` — Executor idempotente de seed (`runCatalogSeed`) com suporte a Prisma Client e repositório em memória/PostgreSQL.
- `[CREATE]` `apps/api/src/data/cover-storage.service.ts` — Serviço `CoverStorageService` que provisiona e serve as 30 capas SVG locais por `slug` e o fallback `_placeholder.svg`.
- `[CREATE]` `apps/api/assets/covers/` — Diretório contendo as 30 capas SVG (`<slug>.svg`) e `_placeholder.svg`.
- `[CREATE]` `apps/web/package.json` — Pacote frontend `@yuukilist/web` (estrutura base do monorepo).
- `[CREATE]` `apps/web/src/index.ts` — Ponto de entrada base validando consumo de `@yuukilist/shared`.
- `[CREATE]` `tests/catalog-data.test.mjs` — Suíte de testes automatizados cobrindo todos os 4 requisitos e 5 cenários normativos de `catalog-data`.

## Data Model

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pg_trgm]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Category {
  DORAMA
  FILME
  ANIME
  MANGA
  MANHWA
  MANHUA
}

enum PublicationStatus {
  EM_ANDAMENTO
  FINALIZADA
  CANCELADA
  HIATO
  DESCONHECIDA
}

model MediaItem {
  id                String            @id @default(uuid()) @db.Uuid
  slug              String            @unique @db.VarChar(160)
  title             String            @db.VarChar(255)
  originalTitle     String?           @map("original_title") @db.VarChar(255)
  romanizedTitle    String?           @map("romanized_title") @db.VarChar(255)
  normalizedTitle   String            @map("normalized_title") @db.VarChar(255)
  synopsis          String            @db.Text
  category          Category
  publicationStatus PublicationStatus @map("publication_status")
  releaseYear       Int?              @map("release_year")
  originCountry     String            @map("origin_country") @db.VarChar(64)
  rating            Float?
  coverPath         String            @map("cover_path") @db.VarChar(255)
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  genres            ItemGenre[]
  aliases           ItemAlias[]

  @@index([category, publicationStatus])
  @@index([normalizedTitle(ops: raw("gin_trgm_ops"))], type: Gin, map: "media_items_normalized_title_trgm_idx")
  @@map("media_items")
}

model ItemGenre {
  id          String    @id @default(uuid()) @db.Uuid
  mediaItemId String    @map("media_item_id") @db.Uuid
  name        String    @db.VarChar(80)
  mediaItem   MediaItem @relation(fields: [mediaItemId], references: [id], onDelete: Cascade)

  @@unique([mediaItemId, name])
  @@index([name])
  @@map("item_genres")
}

model ItemAlias {
  id              String    @id @default(uuid()) @db.Uuid
  mediaItemId     String    @map("media_item_id") @db.Uuid
  alias           String    @db.VarChar(255)
  normalizedAlias String    @map("normalized_alias") @db.VarChar(255)
  languageCode    String    @map("language_code") @db.VarChar(16)
  mediaItem       MediaItem @relation(fields: [mediaItemId], references: [id], onDelete: Cascade)

  @@index([mediaItemId])
  @@map("item_aliases")
}
```

## Contracts

### 1. Enums e Validação Canônica (`packages/shared/src/enums.ts`)
- `CATEGORIES`: `['DORAMA', 'FILME', 'ANIME', 'MANGA', 'MANHWA', 'MANHUA'] as const`
- `PUBLICATION_STATUSES`: `['EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'HIATO', 'DESCONHECIDA'] as const`
- `validateMediaMetadata({ category, publicationStatus })`: Valida estritamente se os valores pertencem aos enums canônicos; lança `InvalidCatalogEnumError` com código `INVALID_CATEGORY` ou `INVALID_PUBLICATION_STATUS` caso contrário.

### 2. Serviço de Seed Idempotente (`apps/api/src/data/seed.ts`)
- `SEED_MEDIA_ITEMS`: Array imutável contendo exatamente 30 obras (5 de cada `Category`, cobrindo os 5 `PublicationStatus` em cada categoria).
- `runCatalogSeed(repository)`: Executa `upsert` por `slug` para as 30 obras e retorna `{ totalItems: 30, byCategory, byStatus }`.

### 3. Serviço de Capas SVG Locais (`apps/api/src/data/cover-storage.service.ts`)
- `getCoverBySlug(slug: string): CoverResult`:
  - **Entrada:** `slug` da obra.
  - **Saída:** `{ slug: string, contentType: 'image/svg+xml', svg: string, isFallback: boolean }`.
  - **Comportamento:** Se `<slug>.svg` existir para um slug válido, retorna o SVG original (`isFallback: false`). Se o slug for inválido, vazio, tentar path traversal ou não existir no catálogo, retorna o conteúdo de `_placeholder.svg` (`isFallback: true`) com `contentType: 'image/svg+xml'`, nunca lançando exceção não tratada.

## Research

Conforme exigido pelo **Princípio IV da Constituição (Meta R$ 0 / Custo Zero & Due Diligence Obrigatória)**, todas as tecnologias e dependências adotadas nesta mudança foram verificadas quanto à gratuidade permanente e estratégia de saída:

| Tecnologia / Dependência | Fonte Consultada | Data de Verificação | Limite Gratuito Permanente | Estratégia de Saída |
| :--- | :--- | :---: | :--- | :--- |
| **Node.js >= 22.0.0 & npm workspaces** | https://nodejs.org / Licença MIT | 2026-11-08 | Ilimitado (Open Source MIT, execução local e em qualquer CI) | Migração transparente para pnpm/Bun sem alterar código-fonte |
| **PostgreSQL 16+ & Extensão `pg_trgm`** | https://www.postgresql.org/about/licence/ | 2026-11-08 | Ilimitado (Licença PostgreSQL Open Source; `pg_trgm` faz parte do pacote oficial `contrib`) | Qualquer banco PostgreSQL padrão (Docker local, Neon Free Tier, Supabase Free Tier) |
| **Prisma ORM (Schema & Migrations)** | https://www.prisma.io/pricing (Core ORM Apache 2.0) | 2026-11-08 | Ilimitado para o CLI e Client open-source (Apache 2.0) sem Prisma Accelerate pago | A camada `data` isola o repositório; SQL padrão das migrations permite troca por Drizzle ou Kysely |
| **Capas Vetoriais SVG Locais** | Especificação W3C SVG 1.1 / Arquivos estáticos no próprio repositório | 2026-11-08 | Custo R$ 0 absoluto (servidas pela própria aplicação sem S3/Cloudinary) | Campo `coverPath` permite apontar futuramente para Object Storage gratuito (Cloudflare R2 Free Tier) |
| **Executor de Testes (`node:test` / Vitest)** | Documentação oficial Node.js / Vitest (MIT) | 2026-11-08 | Ilimitado (Open Source MIT) | Testes desacoplados usando asserções padrão compatíveis com qualquer runner JS/TS |

