# Design: 002-catalog-search-api

## Context

Na fatia R1 (`001-monorepo-data-seed`), estabelecemos a fundação do monorepo (`apps/api`, `apps/web`, `packages/shared`), o schema relacional PostgreSQL com os modelos `MediaItem`, `ItemGenre` e `ItemAlias`, a extensão nativa `pg_trgm` com índice GIN sobre `normalized_title`, o seed determinístico de 30 obras equilibradas e o serviço local de capas SVG.

A presente fatia R2 (`002-catalog-search-api`) implementa a camada de aplicação backend HTTP no NestJS, estruturada em dois módulos isolados conforme exigido no PRD e na Constituição (`xspec/constitution.md`):
1. **Módulo `data`:** encapsula o acesso ao Prisma ORM, abstrações de repositório e leitura de ativos locais (capas SVG).
2. **Módulo `catalog`:** encapsula as regras de consulta, ordenação por relevância trigram, validação de parâmetros (DTOs), paginação estruturada e controllers REST sob o prefixo `/api/v1/catalog`.

## Goals / Non-Goals

**Goals:**
- Implementar `GET /api/v1/catalog/items` com suporte a busca (`q`), filtros combinados (`category`, `status`, `genre`), paginação (`page`, `limit`) e ordenação (`sortBy`).
- Implementar algoritmo de busca inteligente tolerante a 1 erro de digitação/transposição baseado no índice `pg_trgm` (limiar mínimo de similaridade de 0.35) com ranking de relevância (`exata > parcial > trigram`) e desempate alfabético por título.
- Implementar `GET /api/v1/catalog/items/:slug` retornando metadados completos da obra, lista de gêneros e aliases (com 404 padronizado para slug inexistente).
- Implementar `GET /api/v1/catalog/items/:slug/cover` transmitindo a capa SVG com `Content-Type: image/svg+xml` e fallback seguro para `_placeholder.svg`.
- Manter desacoplamento total entre fonte de dados (seed/banco) e contratos de API, preparando o backend para a futura ingestão da Fase 4 sem quebras de contrato.

**Non-Goals:**
- Não implementar interface gráfica de catálogo ou busca (escopo estrito da fatia R3 / `003-catalog-browse-ui`).
- Não implementar autenticação, controle de sessões ou biblioteca pessoal (escopo das fatias R4 a R7).
- Não utilizar nenhuma API externa paga ou serviços de IA generativa (garantia permanente do Princípio IV e VII da Constituição).

## Decisions

1. **Arquitetura Modular em Duas Camadas (`data` e `catalog`)**
   - **Escolha:** Isolar o repositório Prisma e o storage de capas em `apps/api/src/data`, expondo interfaces de repositório consumidas pelo `apps/api/src/catalog`.
   - **Alternativas consideradas:** Controller acessando o Prisma Client diretamente.
   - **Justificativa:** Conforme o PRD (item 66-68) e Princípio I da Constituição, a futura ingestão de APIs externas na Fase 4 substituirá a fonte de dados sem alterar a API pública, contratos ou services do catálogo.

2. **Formato do Envelope de Resposta Paginada**
   - **Escolha:** Envelope `{ data: MediaItemSummaryDto[], meta: { total, page, limit, totalPages } }`.
   - **Alternativas consideradas:** Array plano sem metadados; ou envelope `{ items, total }`.
   - **Justificativa:** Alinhado com o Clarification Gate aprovado (Pergunta 1), provendo metadados completos para o frontend calcular a navegação entre páginas sem requisições adicionais.

3. **Estratégia de Busca e Ranqueamento Híbrido**
   - **Escolha:** Normalização em memória da query via `normalizeSearchText` seguida de ranqueamento em 3 faixas de pontuação:
     1. Correspondência exata no título normalizado (score = 1.0).
     2. Correspondência parcial/prefixo no título normalizado (score = 0.8).
     3. Correspondência aproximada trigram via `similarity(normalized_title, query) >= 0.35` (score = valor de similaridade).
     Desempate em cada faixa por título alfabético (A-Z).
   - **Alternativas consideradas:** ILIKE simples sem trigrama; ou serviço externo como MeiliSearch/Elasticsearch.
   - **Justificativa:** O PostgreSQL nativo com `pg_trgm` atende 100% da necessidade com latência sub-milissegundo para o volume do catálogo, preservando custo R$ 0 e soberania de dados.

4. **Entrega de Capas SVG por Endpoint Dedicado**
   - **Escolha:** Rota `GET /api/v1/catalog/items/:slug/cover` transmitindo o arquivo SVG local diretamente do disco via `CoverStorageService`.
   - **Alternativas consideradas:** Retornar apenas a URL relativa e depender de middleware estático global do Express/Fastify.
   - **Justificativa:** Permite controle refinado de cabeçalhos (`Content-Type: image/svg+xml`, `Cache-Control: public, max-age=86400`), fallback seguro e sanitização contra path-traversal centralizada.

## Risks / Trade-offs

- **[Risco]** Diferenças de comportamento entre a função `similarity()` do PostgreSQL real e testes executados em ambientes sem banco ativo.
  - **Mitigação:** Criar uma abstração de cálculo de trigramas e normalização no repositório em memória compartilhando exatamente o mesmo algoritmo e limiar (0.35) para os testes automatizados, complementada por migrations e SQL raw testados contra PostgreSQL.
- **[Risco]** Sobrecarga de queries na listagem quando houver múltiplos filtros simultâneos.
  - **Mitigação:** Utilizar filtros `AND` com índices já criados em `category`, `publicationStatus` e `normalized_title` (GIN).

## Migration Plan

- Não há alterações destrutivas em schema de banco de dados; a migration inicial `20261108000000_init_catalog_data` criada na fatia R1 suporta integralmente os requisitos de consulta desta fatia.
- Rollback: Reverter para a branch ou commit anterior (`4219f81`).

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/catalog.ts` — DTOs compartilhados de consulta, paginação e detalhes de obras.
- `[MODIFY]` `packages/shared/src/index.ts` — Reexportar novos contratos de catálogo.
- `[CREATE]` `apps/api/src/data/catalog.repository.ts` — Interface e implementação do repositório de catálogo.
- `[CREATE]` `apps/api/src/data/data.module.ts` — Módulo NestJS encapsulando repositório e storage de capas.
- `[CREATE]` `apps/api/src/catalog/dto/catalog-query.dto.ts` — DTO de validação dos query params da busca.
- `[CREATE]` `apps/api/src/catalog/catalog.service.ts` — Lógica de aplicação, busca, ordenação e paginação.
- `[CREATE]` `apps/api/src/catalog/catalog.controller.ts` — Controllers REST com rotas `/api/v1/catalog/items*`.
- `[CREATE]` `apps/api/src/catalog/catalog.module.ts` — Módulo NestJS do catálogo.
- `[CREATE]` `apps/api/src/app.module.ts` — Módulo raiz NestJS orquestrando a aplicação.
- `[CREATE]` `tests/catalog-search.test.mjs` — Bateria de testes de integração e contrato da API de catálogo.

## Data Model

Entidades consumidas do Prisma schema existente:

```prisma
model MediaItem {
  id                String            @id @default(uuid())
  slug              String            @unique
  title             String
  originalTitle     String?
  normalizedTitle   String
  category          MediaCategory
  publicationStatus PublicationStatus
  synopsis          String?
  totalEpisodes     Int?
  totalChapters     Int?
  totalVolumes      Int?
  releaseYear       Int?
  coverUrl          String?
  genres            ItemGenre[]
  aliases           ItemAlias[]
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}

model ItemGenre {
  id          String    @id @default(uuid())
  mediaItemId String
  genre       String
  mediaItem   MediaItem @relation(fields: [mediaItemId], references: [id], onDelete: Cascade)
}

model ItemAlias {
  id              String    @id @default(uuid())
  mediaItemId     String
  alias           String
  normalizedAlias String
  mediaItem       MediaItem @relation(fields: [mediaItemId], references: [id], onDelete: Cascade)
}
```

## Contracts

### 1. `GET /api/v1/catalog/items`
- **Query Params:**
  - `q`: string (opcional) — termo de busca textual.
  - `category`: string (opcional) — `DORAMA` | `FILME` | `ANIME` | `MANGA` | `MANHWA` | `MANHUA`.
  - `status`: string (opcional) — `EM_ANDAMENTO` | `FINALIZADA` | `CANCELADA` | `HIATO` | `DESCONHECIDA`.
  - `genre`: string (opcional) — nome do gênero.
  - `page`: integer (opcional, default `1`).
  - `limit`: integer (opcional, default `20`, máx `50`).
  - `sortBy`: string (opcional, `relevance` | `title`).
- **Response 200 OK:**
  ```json
  {
    "data": [
      {
        "id": "uuid-string",
        "slug": "parasita",
        "title": "Parasita",
        "originalTitle": "기생충",
        "category": "FILME",
        "publicationStatus": "FINALIZADA",
        "coverUrl": "/api/v1/catalog/items/parasita/cover",
        "releaseYear": 2019,
        "genres": ["Suspense", "Drama"]
      }
    ],
    "meta": {
      "total": 30,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
  ```

### 2. `GET /api/v1/catalog/items/:slug`
- **Response 200 OK:**
  ```json
  {
    "id": "uuid-string",
    "slug": "parasita",
    "title": "Parasita",
    "originalTitle": "기생충",
    "category": "FILME",
    "publicationStatus": "FINALIZADA",
    "synopsis": "Toda a família de Ki-taek está desempregada...",
    "totalEpisodes": null,
    "totalChapters": null,
    "totalVolumes": null,
    "releaseYear": 2019,
    "coverUrl": "/api/v1/catalog/items/parasita/cover",
    "genres": ["Suspense", "Drama"],
    "aliases": ["Gisaengchung", "Parasite"]
  }
  ```
- **Response 404 Not Found:**
  ```json
  {
    "statusCode": 404,
    "message": "Item com slug 'obra-inexistente' não encontrado no catálogo.",
    "error": "Not Found"
  }
  ```

### 3. `GET /api/v1/catalog/items/:slug/cover`
- **Headers:** `Content-Type: image/svg+xml; charset=utf-8`, `Cache-Control: public, max-age=86400`
- **Response Body:** Conteúdo SVG vetorial da capa da obra ou de `_placeholder.svg`.

## Research

### Due Diligence de Performance e Custo Zero

| Dimensão | Solução Adotada | Alternativa Paga / Descartada | Conformidade Constitucional |
| :--- | :--- | :--- | :--- |
| **Mecanismo de Busca** | PostgreSQL nativo com `pg_trgm` e índice GIN sobre `normalized_title` | Algolia, MeiliSearch Cloud, Pinecone, OpenAI Embeddings | PASS (Custo R$ 0, sem IA, execução local no banco) |
| **Armazenamento de Capas** | SVG vetorial local servido diretamente pela API | Cloudflare R2, AWS S3, Cloudinary | PASS (Custo R$ 0, sem dependência de terceiros) |
| **Normalização Linguística** | Algoritmo nativo NFD em TypeScript (`normalizeSearchText`) | Serviços pagos de NLP ou tokenizadores proprietários | PASS (Zero dependência externa) |
| **Validação de DTOs** | `class-validator` / schemas TypeScript estruturados | Validações pagas de schema | PASS (Open-source padrão do ecossistema NestJS) |

