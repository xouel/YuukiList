# Design: 034-real-apis-and-supabase-catalog

## Context

O YuukiList evoluiu com a autenticação e biblioteca pessoal persistidas no Supabase PostgreSQL via Prisma ORM. No entanto, o catálogo de obras (`MediaItem`, `ItemGenre`, `ItemAlias`) permaneceu desacoplado na camada de dados através de uma coleção simulada em memória (`CatalogRepository(SEED_MEDIA_ITEMS)`), limitando a experiência a 25 registros fictícios. Além disso, os clientes externos desenvolvidos em `apps/api/src/external/` (TMDB, TVmaze, Kitsu e MangaUpdates) ainda não estavam conectados de forma permanente e contínua ao fluxo de navegação e busca. Esta entrega fecha o ciclo de dados: substitui o repositório em memória pelo `PrismaCatalogRepository`, popula o Supabase com 120 obras reais consagradas (Top 20 das 6 categorias) e habilita a busca federada híbrida com ingestão sob demanda (*Just-in-Time*).

## Goals / Non-Goals

**Goals:**
- Implementar `PrismaCatalogRepository` implementando `ICatalogRepository` e conectando diretamente às tabelas `media_items`, `item_genres` e `item_aliases` no Supabase PostgreSQL.
- Manter busca por similaridade trigrâmica nativa (`pg_trgm`, limiar 0.35) e filtros combinados diretamente via SQL/Prisma.
- Integrar a chave oficial do TMDB autenticada no `TmdbClient` com suporte a sinopses em Português (PT-BR) e pôsteres em `/w500`.
- Criar a rotina de carga inicial (`seed-real-catalog`) ingerindo 120 obras reais de referência (20 por categoria) das 4 APIs externas para o banco de dados Supabase de forma idempotente.
- Implementar busca federada híbrida: pesquisa primeiro no banco local com `pg_trgm` e, se necessário ou solicitado, consulta as APIs externas em paralelo exibindo resultados com badge da fonte.
- Implementar endpoint de ingestão sob demanda (*Just-in-Time*) que salva no Supabase com UUID soberano qualquer obra externa que o usuário interagir.

**Non-Goals:**
- Reprodução de áudio, vídeo ou disponibilização de arquivos de mangá.
- Autenticação OAuth social de terceiros.
- Substituir IDs soberanos internos por IDs de provedores externos (o YuukiList mantém soberania estrita).

## Decisions

1. **Repositório Conectado ao Prisma ORM (`PrismaCatalogRepository`)**
   - **Escolha:** Desenvolver `PrismaCatalogRepository` estendendo os contratos de `ICatalogRepository`, usando Prisma Client para consultas relacionais e consultas raw (`$queryRaw`) otimizadas com índice GIN trigrâmico para buscas textuais.
   - **Alternativas consideradas:** Manter array em memória sincronizado por polling (rejeitada por inviabilizar catálogo infinito e consumir muita RAM em produção); cliente `pg` isolado sem ORM (rejeitada para manter coerência com o Prisma do monorepo).
   - **Justificativa:** O Prisma já está provisionado, tipado e sincronizado com o Supabase. O uso de `raw` pontual para `similarity(normalized_title, $1)` garante máxima performance sem fugir da stack ratificada.

2. **Carga Inicial Ampliada de 120 Obras Reais (Top 20 por Categoria)**
   - **Escolha:** Mapear uma matriz curada de 120 obras consagradas (Top 20 por categoria) consumindo dados reais das 4 APIs (TMDB para doramas e filmes; Kitsu para animes e mangás; MangaUpdates para manhwas e manhuas) através do `CatalogIngestionService`.
   - **Alternativas consideradas:** Iniciar o banco zerado (rejeitada pois deixaria a Home e Explorar vazios para novos visitantes); web scraping de sites não oficiais (rejeitada por violar termos de serviço e princípio de estabilidade).
   - **Justificativa:** 120 obras garantem que a Home, o Hero Spotlight, o Continuar Acompanhando e a tela Explorar tenham densidade editorial rica e autêntica de imediato.

3. **Busca Federada Híbrida e Ingestão Sob Demanda (*Just-in-Time*)**
   - **Escolha:** Quando o usuário pesquisar por um termo, o backend consulta primeiro o Supabase local. Se houver poucos resultados (< 3) ou o parâmetro `external=true` for acionado, consulta em paralelo as APIs externas (com timeout seguro de 3s). Itens externos recebem flag `isExternal: true`. Ao clicar em detalhes ou adicionar à biblioteca, o backend aciona `ingestFromExternalDto`, gravando a obra no Supabase de forma atômica e transparente.
   - **Alternativas consideradas:** Busca apenas local (rejeitada pois limita o usuário apenas ao que já foi pré-ingerido); busca apenas externa (rejeitada por depender de disponibilidade de APIs terceiras e violar a soberania do catálogo).
   - **Justificativa:** Entrega a sensação de "catálogo infinito" com velocidade de banco local e soberania garantida.

## Risks / Trade-offs

- **[Risco]** Rate limit ou instabilidade de uma das APIs externas durante a busca federada.  
  → **Mitigação:** Executar requisições externas com timeout curto (3000ms), isoladas via `Promise.allSettled`, garantindo que os resultados locais do Supabase sempre retornem imediatamente mesmo se uma API externa oscilar.
- **[Risco]** Pôster externo expirar ou falhar no carregamento.  
  → **Mitigação:** `CatalogIngestionService` gera uma capa SVG vetorial local sob demanda em [apps/api/src/data/svg-cover.service.ts](file:///c:/Users/xouel/OneDrive/Área%20de%20Trabalho/YuukiList/apps/api/src/data/svg-cover.service.ts) como fallback definitivo.
- **[Risco]** Conflito de títulos ou slugs duplicados entre obras externas.  
  → **Mitigação:** Normalização com sufixo de ano e categoria (`generateSlug(title, releaseYear, category)`), garantindo unicidade na chave `slug`.

## Migration Plan

1. Executar testes de integração do Prisma com a tabela `media_items` no Supabase.
2. Atualizar o `container.ts` para injetar `PrismaCatalogRepository` no `CatalogService`.
3. Executar o script de carga inicial curada de 120 obras (`node scripts/seed-real-catalog.mjs`).
4. Disponibilizar a nova rota de busca híbrida e ingestão sob demanda.
5. Em caso de necessidade de rollback, o container pode voltar temporariamente para o repositório em memória sem perda de integridade no banco.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/api/src/data/prisma-catalog.repository.ts` — Implementação do repositório de catálogo via Prisma ORM conectado ao Supabase.
- `[CREATE]` `scripts/seed-real-catalog.mjs` — Script de sincronização de 120 obras consagradas reais das 4 APIs.
- `[CREATE]` `apps/web/src/app/api/v1/catalog/items/ingest/route.ts` — Endpoint de ingestão atômica sob demanda (*Just-in-Time*).
- `[CREATE]` `tests/real-apis-and-supabase-catalog.test.mjs` — Suíte de testes TDD da integração real.
- `[MODIFY]` `apps/api/src/data/catalog-ingestion.service.ts` — Suporte ampliado para TMDB com chave e ingestão sob demanda.
- `[MODIFY]` `apps/api/src/catalog/catalog.service.ts` — Integração da busca federada híbrida.
- `[MODIFY]` `apps/api/src/catalog/catalog.controller.ts` — Exposição de busca externa e endpoint de ingestão.
- `[MODIFY]` `apps/web/src/server/container.ts` — Instanciação de `PrismaCatalogRepository`.
- `[MODIFY]` `apps/web/src/app/api/v1/catalog/items/route.ts` — Suporte a busca federada.
- `[MODIFY]` `apps/web/src/components/catalog/search-bar.tsx` — Suporte a visualização de fontes externas e badge de proveniência.

## Data Model

Entidades mapeadas no Prisma (`apps/api/prisma/schema.prisma`):

```prisma
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
  provenance        Json?             @map("provenance")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  genres            ItemGenre[]
  aliases           ItemAlias[]
  libraryItems      UserLibraryItem[]
}
```

## Contracts

### `GET /api/v1/catalog/items`
- **Query Params:**
  - `q` (string, opcional): termo de busca textual.
  - `category` (enum, opcional): `DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`.
  - `status` (enum, opcional): `EM_ANDAMENTO`, `FINALIZADA`, etc.
  - `includeExternal` (boolean, opcional, default: `true` quando `q` tem mais de 2 letras).
  - `page` (number, default: 1), `limit` (number, default: 20).
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "slug": "vincenzo-2021",
        "title": "Vincenzo",
        "originalTitle": "빈센조",
        "category": "DORAMA",
        "releaseYear": 2021,
        "coverUrl": "https://image.tmdb.org/t/p/w500/...",
        "provenance": { "source": "TMDB", "externalId": "117376" }
      }
    ],
    "meta": { "total": 120, "page": 1, "limit": 20, "totalPages": 6 },
    "externalResults": []
  }
  ```

### `POST /api/v1/catalog/items/ingest`
- **Request Body:**
  ```json
  {
    "source": "TMDB",
    "externalId": "117376",
    "category": "DORAMA"
  }
  ```
- **Response (201 Created):** Retorna o `MediaItemDetailDto` persistido no Supabase com ID soberano interno.

## Research

- **Kitsu API:** JSON:API aberta (`https://kitsu.io/api/edge`), rate limit de 60 req/min. Custo R$ 0 permanente.
- **TVmaze:** REST pública aberta (`https://api.tvmaze.com`), rate limit de 20 req/10s. Custo R$ 0 permanente.
- **MangaUpdates:** REST v1 pública (`https://api.mangaupdates.com/v1`), rate limit de 1 req/s. Custo R$ 0 permanente.
- **TMDB API:** Autenticação via chave v3/v4 (`TMDB_API_KEY`), 40 req/10s, gratuita e ilimitada para desenvolvedores.
- **Supabase PostgreSQL `pg_trgm`:** Extensão ativada, índice GIN em `normalized_title` (`gin_trgm_ops`) provisionado e pronto para consultas ultra-rápidas.

