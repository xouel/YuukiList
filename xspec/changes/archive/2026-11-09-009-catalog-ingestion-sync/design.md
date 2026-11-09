# Design: 009-catalog-ingestion-sync

## Context

Com a conclusão da prova de conceito na fatia R8 (`008-external-apis-poc`), validamos cinco clientes de APIs externas de custo zero e acesso público para o mercado asiático: TMDB (doramas e filmes), TVmaze (metadados de episódios e temporadas), Kitsu (animes e catálogo literário), ANN (enciclopédia histórica de animes e títulos alternativos) e MangaUpdates (diferenciação taxonômica de mangás, manhwas e manhuas com contagem de capítulos).
Atualmente, a camada `apps/api/src/data` opera com 30 obras estáticas semeadas via `seed-data.ts`. Para consolidar a Fase 4 do MVP, precisamos orquestrar esses adaptadores em um serviço de ingestão e sincronização (`CatalogIngestionService`), registrando proveniência estruturada por campo no PostgreSQL e gerando capas vetoriais locais SVG no padrão Dark Editorial, mantendo a soberania de dados (Princípio V) e a retrocompatibilidade com as bibliotecas pessoais dos usuários.

## Goals / Non-Goals

**Goals:**
- Implementar o serviço modular `CatalogIngestionService` capaz de transformar DTOs externos heterogêneos em registros canônicos do YuukiList com IDs internos UUID v4 e slugs determinísticos.
- Adicionar coluna de proveniência JSON auditável (`provenance`) em `MediaItem`, registrando fonte (`TMDB`, `TVMAZE`, `KITSU`, `ANN`, `MANGAUPDATES`, `SEED_CANONICAL`, `LOCAL`), ID externo e timestamp por campo.
- Suportar enriquecimento multicanal (ex.: TMDB como fonte primária de doramas e TVmaze como fonte secundária de episódios), preservando rastreabilidade granular.
- Gerar dinamicamente capas vetoriais SVG locais no tema Dark Editorial com proporção 2:3 para 100% das obras ingeridas, servidas via `/api/v1/catalog/items/:slug/cover`.
- Preservar as 30 obras originais semeadas com proveniência `SEED_CANONICAL`, assegurando que nenhum vínculo de biblioteca pessoal existente seja quebrado.
- Fornecer script executável `scripts/sync-catalog.mjs` com modos de amostragem (`--sample`), categoria (`--category`) e completo (`--all`).
- Garantir que todas as obras ingeridas sejam imediatamente indexáveis e pesquisáveis via similaridade de trigramas `pg_trgm` (limiar >= 0.35).

**Non-Goals:**
- Não construir daemon cron de execução contínua em segundo plano (acionamento via CLI e endpoints dedicados de manutenção).
- Não realizar hotlinking de imagens remotas nem armazenar arquivos JPEG/PNG protegidos por direitos autorais externos.
- Não consultar APIs não aprovadas na constituição (como AniList, Jikan ou MangaDex).
- Não alterar regras de negócio do motor de busca (permanece puramente determinístico em `pg_trgm`, sem IA generativa).

## Decisions

1. **Modelagem de Proveniência Estruturada por Campo (JSON Column)**
   - **Escolha:** Adicionar campo `provenance Json?` no modelo `MediaItem` do Prisma contendo um dicionário onde cada chave corresponde a um campo (`title`, `synopsis`, `releaseYear`, `originCountry`, `category`, `units`) mapeado para `{ source: ExternalApiSource | 'SEED_CANONICAL' | 'LOCAL', externalId?: string, syncedAt: string }`.
   - **Alternativas consideradas:** Tabela relacional separada `media_item_provenance` (rejeitada por overhead excessivo de joins em consultas de leitura frequente) e campos planos de prefixo como `source_api` na tabela principal (rejeitada por não permitir rastreabilidade granular de fontes mistas).
   - **Justificativa:** JSON colunar no PostgreSQL oferece flexibilidade schema-on-read, performance zero-join e auditoria transparente exigida pela Seção 8 do Documento Mestre.

2. **Geração Dinâmica de Capas Vetoriais SVG (Soberania de Dados)**
   - **Escolha:** Implementar `SvgCoverService` que gera SVGs editoriais 300x450 com gradientes por categoria, títulos originais em marca d'água, badges e metadados, salvando em disco (`assets/covers/<slug>.svg`) ou gerando sob demanda caso o arquivo ainda não exista.
   - **Alternativas consideradas:** Download e cache local de JPEGs de pôsteres externos (rejeitada por riscos de licenciamento e violação do Princípio V) e hotlinking direto das URLs externas (rejeitada pelo risco de link rot, quebra de CORS e violação do Princípio IV de custo zero).
   - **Justificativa:** Capas vetoriais SVG geradas localmente são 100% soberanas, ultra leves (< 2 KB), esteticamente alinhadas ao tema Dark Editorial e imunes a bloqueios externos.

3. **Orquestração de Ingestão por Adaptadores Especializados**
   - **Escolha:** `CatalogIngestionService` atua como facade unificada sobre os clientes desenvolvidos na fatia R8 (`TmdbClient`, `TvmazeClient`, `KitsuClient`, `AnnClient`, `MangaUpdatesClient`), consumindo a matriz de decisão aprovada na PoC.
   - **Alternativas consideradas:** Scripts isolados sem serviço NestJS (rejeitada por acoplamento e impossibilidade de injeção de dependência na API).
   - **Justificativa:** Mantém a separação estrita da camada `data` e reutiliza 100% do código e fixtures auditados na PoC.

4. **Estratégia de Resolução de Conflitos e Enriquecimento Multicanal**
   - **Escolha:** Para obras que possuem dados em mais de uma fonte (ex.: TMDB e TVmaze), o pipeline aplica regra determinística: campos vazios na fonte primária são enriquecidos pela fonte secundária, com a proveniência registrando a fonte específica de cada campo.
   - **Alternativas consideradas:** Sobrescrita total pela última fonte consultada (rejeitada por perda de dados de alta confiança) ou bloqueio de duplicatas (rejeitada por impedir enriquecimento de episódios/volumes).
   - **Justificativa:** Garante o melhor acervo possível sem corromper metadados canônicos de títulos e sinopses.

## Risks / Trade-offs

- **[Risco]** Rate limits ou latência de APIs externas durante ingestão em lote → **Mitigação:** `CatalogIngestionService` suporta modo com fixtures em testes e no CLI introduz delays entre requisições externas e persistência parcial sem abortar o lote inteiro.
- **[Risco]** Colisão de slugs ao ingerir obras com títulos idênticos de origens distintas → **Mitigação:** `generateSlug` com sufixo determinístico baseado em categoria ou ano (ex.: `slug-dorama-2024`), preservando unicidade da URL.
- **[Risco]** Quebra de integridade referencial com obras do seed adicionadas à biblioteca de usuários → **Mitigação:** Identificadores e slugs das 30 obras originais são mantidos intactos com proveniência `SEED_CANONICAL`, garantindo integridade referencial de chave estrangeira.

## Migration Plan

1. Executar migração do schema Prisma adicionando `provenance Json?` na tabela `media_items`.
2. Rodar script de migração para atribuir `provenance: { source: 'SEED_CANONICAL', syncedAt: '2026-01-01T00:00:00.000Z' }` aos 30 registros pré-existentes.
3. Habilitar o novo endpoint e serviços na API sem downtime. Rollback simples via `ALTER TABLE media_items DROP COLUMN provenance;` se necessário.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/api/prisma/schema.prisma` — Adição do campo `provenance Json?` no modelo `MediaItem`.
- `[CREATE]` `apps/api/prisma/migrations/20261109020000_add_media_item_provenance/migration.sql` — Migração DDL para a nova coluna.
- `[MODIFY]` `packages/shared/src/external.ts` — Definição dos tipos `FieldProvenance` e `MediaItemProvenance`.
- `[MODIFY]` `packages/shared/src/catalog.ts` — Atualização de `MediaItemDetailDto` para conter campo `provenance`.
- `[CREATE]` `apps/api/src/data/svg-cover.service.ts` — Gerador dinâmico de capas SVG vetoriais locais 2:3.
- `[MODIFY]` `apps/api/src/data/cover-storage.service.ts` — Resolução dinâmica com fallback para `SvgCoverService`.
- `[CREATE]` `apps/api/src/data/catalog-ingestion.service.ts` — Serviço orquestrador de ingestão multicanal e sincronização de cache.
- `[MODIFY]` `apps/api/src/data/catalog.repository.ts` — Suporte a persistência e consulta com metadados de proveniência.
- `[MODIFY]` `apps/api/src/data/data.module.ts` — Registro dos novos serviços (`SvgCoverService`, `CatalogIngestionService`).
- `[CREATE]` `scripts/sync-catalog.mjs` — Script CLI para sincronização sob demanda do catálogo.
- `[CREATE]` `tests/catalog-ingestion-sync.test.mjs` — Suíte de testes automatizados de ingestão, proveniência e capas.

## Data Model

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

  @@index([category, publicationStatus])
  @@index([normalizedTitle(ops: raw("gin_trgm_ops"))], type: Gin, map: "media_items_normalized_title_trgm_idx")
  @@map("media_items")
}
```

Estrutura do JSON `provenance`:
```json
{
  "title": { "source": "TMDB", "externalId": "12345", "syncedAt": "2026-11-09T15:00:00.000Z" },
  "synopsis": { "source": "TMDB", "externalId": "12345", "syncedAt": "2026-11-09T15:00:00.000Z" },
  "totalEpisodes": { "source": "TVMAZE", "externalId": "67890", "syncedAt": "2026-11-09T15:05:00.000Z" },
  "cover": { "source": "LOCAL", "syncedAt": "2026-11-09T15:05:00.000Z" }
}
```

## Contracts

### `CatalogIngestionService`
```ts
export interface IngestionResult {
  totalProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  items: Array<{
    id: string;
    slug: string;
    title: string;
    category: Category;
    provenance: MediaItemProvenance;
    action: 'INSERTED' | 'UPDATED' | 'PRESERVED';
  }>;
}

export interface IngestionOptions {
  sources?: ExternalApiSource[];
  categories?: Category[];
  sampleLimit?: number;
  dryRun?: boolean;
}

export class CatalogIngestionService {
  ingestFromExternalDto(dto: CanonicalExternalMediaDto): Promise<StoredMediaItem>;
  enrichExistingItem(slug: string, secondaryDto: CanonicalExternalMediaDto): Promise<StoredMediaItem>;
  syncCatalogBatch(options?: IngestionOptions): Promise<IngestionResult>;
}
```

### CLI Script (`scripts/sync-catalog.mjs`)
- `node scripts/sync-catalog.mjs --sample` -> executa amostragem controlada para testes.
- `node scripts/sync-catalog.mjs --category DORAMA` -> sincroniza apenas uma categoria.
- `node scripts/sync-catalog.mjs --all` -> sincronização completa do acervo planejado.

## Research

- A matriz de decisão da fatia R8 confirmou:
  - Doramas: TMDB cobre 100% de metadados principais; TVmaze fornece contagem confiável de episódios.
  - Filmes: TMDB é a fonte primária universal com sinopse e títulos localizados.
  - Animes: Kitsu oferece API limpa JSON:API; ANN provê títulos alternativos e registro histórico.
  - Mangás/Manhwas/Manhuas: MangaUpdates é a única fonte que distingue rigorosamente as três categorias e acompanha capítulos em lançamento semanal.
- O formato SVG vetorial gerado internamente cumpre integralmente a Seção 10 do PRD e o Princípio V da Constituição, eliminando passivos de direitos autorais de imagens e requisições de rede externas.

