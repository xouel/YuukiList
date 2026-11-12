# Design: Catalog Expansion, Official Covers and UI Interaction Fixes

## Context & Architecture

O YuukiList evoluiu para uma fundação relacional durável integrada ao Supabase PostgreSQL via Prisma ORM. Esta mudança tem como foco:
1. Ampliação do catálogo para centenas de obras consagradas representativas nas 6 categorias canônicas (Dorama, Filme, Anime, Mangá, Manhwa, Manhua), permitindo demonstração das métricas analíticas e estatísticas de consumo.
2. Garantia de que capas oficiais remotas possuam URLs autênticas e que qualquer falha de carregamento externo (404, bloqueio por adblocker ou timeout) acione instantaneamente o fallback transparente para o gerador SVG local `/api/v1/catalog/items/:slug/cover`.
3. Substituição do seletor de "Temas Transversais" (BL/GL) por filtro funcional de "Gênero" na exploração do catálogo e drawer.
4. Ajuste visual e ergonômico no dossiê de obra (`/items/[slug]`), eliminando a redundância textual/icônica de `+ +1 Episódio` para `+1 {unidade}`.
5. Conexão real e persistência da ação de favoritar da tela de detalhes com a biblioteca no Supabase PostgreSQL, refletindo instantaneamente na vitrine de favoritos do perfil (`/profile`).

## Data Model & Persistence

### 1. Persistência Relacional de Biblioteca e Favoritos
- A tabela `user_library_items` no Supabase PostgreSQL armazena `is_favorite: Boolean`, `status`, `progress`, `rating`, `notes` e `rewatch_count`.
- `LibraryRepository` em `apps/api/src/library/library.repository.ts` recebe suporte a Prisma Client com persistência relacional e sincronização com o banco PostgreSQL (mantendo fallback em memória para execução de testes locais isolados).

### 2. Resiliência de Capas (Estratégia Zero Quebras)
- URLs oficiais são apontadas para fontes estáveis de CDNs (TMDB, Kitsu, AniList, MyAnimeList).
- Componentes de UI implementam listener de erro `onError` em tags `img`, com chaveamento imediato para a rota `/api/v1/catalog/items/${slug}/cover`.

## UI Interaction Polish

### 1. Saneamento do Botão de Avanço de Unidade
- Em `personal-tracking-console.tsx`:
  - Anterior: `<svg>+ icon</svg> <span>+1 {unitLabel}</span>` (aparentando visualmente "+ +1 Episódio").
  - Refatorado: Legenda padronizada `+1 {unitLabel}` com ícone acessível de avanço (chevron duplo ou seta à direita) ou texto direto sem duplicação de glifos.

### 2. Filtro de Gênero
- `filter-bar.tsx` substitui o seletor `Temas Transversais` pelo seletor `Gênero`.
- O parâmetro `genre` é enviado à API `GET /api/v1/catalog/items?genre=...`, que já possui suporte nativo via `ItemGenre` no banco.
