# Design: 003-catalog-browse-ui

## Context

Nas fatias R1 (`001-monorepo-data-seed`) e R2 (`002-catalog-search-api`), estabelecemos a fundação do monorepo, a camada de persistência com 30 obras no PostgreSQL (`pg_trgm`), e os endpoints de API NestJS:
- `GET /api/v1/catalog/items` (listagem, filtros combinados e busca tolerante a erros com paginação).
- `GET /api/v1/catalog/items/:slug` (detalhes completos da obra).
- `GET /api/v1/catalog/items/:slug/cover` (servidor dedicado de capas SVG locais com fallback).

A presente fatia R3 (`003-catalog-browse-ui`) implementa a aplicação frontend em Next.js 15 App Router (`apps/web`), construindo a experiência visual de exploração, busca instantânea e consulta de detalhes no tema **Dark Editorial**, em conformidade estrita com o Documento Mestre de Contexto (`YuukiList_Documento_Mestre_Contexto.md`), o PRD e as diretrizes de acessibilidade WCAG 2.2 AA.

## Goals / Non-Goals

**Goals:**
- Implementar a página inicial do catálogo (`/`) contendo barra de busca com debounce (300ms), seletores de filtro combinados (`category`, `status`, `genre`) e grade responsiva de cards de mídia.
- Implementar rolagem infinita automática (`Infinite Scroll`) utilizando `IntersectionObserver`, anexando novas páginas sem perda de performance.
- Sincronizar em tempo real o estado de busca e filtros com os searchParams da URL (`/?q=...&category=...`), viabilizando compartilhamento, bookmarking e restauração nativa do histórico.
- Implementar os 4 estados assíncronos:
  1. *Loading:* Skeletons pulsantes no formato dos cards;
  2. *Catálogo Vazio:* Layout limpo e informativo;
  3. *Sem Resultados:* Feedback contextual com botão "Limpar filtros";
  4. *Erro:* Mensagem de falha de conexão com botão de retry.
- Implementar a página de detalhes `/items/:slug` exibindo sinopse, capa SVG, gêneros, contagem e botão "Voltar" que restaura a rolagem e os filtros anteriores.
- Garantir 100% de navegabilidade via teclado (foco visível com `focus-visible`) e contraste de cores WCAG 2.2 AA ($\ge 4.5:1$).

**Non-Goals:**
- Não implementar autenticação ou botões de adicionar à biblioteca pessoal (escopo das fatias R4 a R7).
- Não utilizar bibliotecas de animação pagas ou efeitos WebGL que comprometam a fluidez em dispositivos modestos (Princípio IV e V da Constituição).
- Não consultar APIs externas em tempo real (toda comunicação consome exclusivamente a API local do YuukiList).

## Decisions

1. **Sincronização de Estado Direta na URL (SearchParams)**
   - **Escolha:** Utilizar os searchParams da URL (`/?q=...&category=...&status=...`) como a fonte de verdade primária para o estado de busca e filtros.
   - **Alternativas consideradas:** Manter estado apenas em memória React (useState) ou sessionStorage.
   - **Justificativa:** Conforme aprovado no Clarification Gate (Pergunta 1), a URL permite compartilhamento direto de buscas, links diretos e restauração nativa ao navegar para trás e para frente no histórico do navegador.

2. **Paginação com Rolagem Infinita (Infinite Scroll)**
   - **Escolha:** Acionar o carregamento cumulativo de novas páginas via `IntersectionObserver` posicionado como sentinela no final da grade de cards.
   - **Alternativas consideradas:** Barra de paginação numérica clássica (1, 2, 3...) ou botão manual "Carregar Mais".
   - **Justificativa:** Escolha explícita do usuário no Clarification Gate (Pergunta 2), proporcionando uma experiência de exploração imersiva e moderna contínua.

3. **Arquitetura de Componentes e Cliente HTTP Isolado**
   - **Escolha:** Criar o módulo `CatalogApiClient` com tratamento de erros, abort controller para cancelamento de requisições obsoletas e montagem tipada de query strings, desacoplando os componentes visuais das chamadas de rede.
   - **Alternativas consideradas:** Chamar `fetch` inline diretamente nos componentes.
   - **Justificativa:** Facilita testes unitários/mocks, isola o tratamento de timeout/retry e atende ao Princípio I da Constituição.

4. **Direção Visual Dark Editorial & WCAG 2.2 AA**
   - **Escolha:** Superfícies escuras cinematográficas (#0B0D13, #121520), tipografia expressiva de alto contraste, acentos sutis em ciano (#06B6D4) e violeta (#8B5CF6), e anéis de foco bem demarcados (`outline: 2px solid #06B6D4`).
   - **Alternativas consideradas:** Interface genérica com tema claro padrão.
   - **Justificativa:** Cumpre a diretriz de identidade visual exigida no Documento Mestre de Contexto (Seção 2.3) e garante acessibilidade e legibilidade superior.

## Risks / Trade-offs

- **[Risco]** Perda da posição de rolagem ao navegar da página `/items/:slug` de volta para o catálogo `/`.
  - **Mitigação:** Gravar no `sessionStorage` ou `history.state` a posição de rolagem e restaurá-la automaticamente no retorno.
- **[Risco]** Digitação rápida gerando múltiplas requisições concorrentes e desordenadas (race conditions).
  - **Mitigação:** Debounce de 300ms no input e uso de `AbortController` cancelando requisições anteriores não finalizadas.

## Migration Plan

- Não aplicável (criação pura de rotas e componentes frontend em `apps/web`).
- Rollback: Reverter commit na branch.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/services/catalog-api.client.ts` — Cliente HTTP tipado com tratamento de erros e suporte a abort controller.
- `[CREATE]` `apps/web/src/components/catalog/search-bar.tsx` — Campo de busca com debounce e limpeza rápida.
- `[CREATE]` `apps/web/src/components/catalog/filter-bar.tsx` — Barra de filtros combinados de categoria, status e gênero.
- `[CREATE]` `apps/web/src/components/catalog/media-card.tsx` — Card de mídia com capa SVG, badge e foco acessível.
- `[CREATE]` `apps/web/src/components/catalog/media-card-skeleton.tsx` — Placeholder animado para carregamento em grid.
- `[CREATE]` `apps/web/src/components/catalog/async-feedback.tsx` — Componentes de empty state, sem resultados e card de erro com retry.
- `[CREATE]` `apps/web/src/components/catalog/catalog-view.tsx` — Visão orquestradora da grade com rolagem infinita.
- `[CREATE]` `apps/web/src/components/catalog/item-detail-view.tsx` — Visualização detalhada da obra com botão voltar.
- `[CREATE]` `apps/web/src/app/layout.tsx` — Layout raiz com tokens Dark Editorial e tags de acessibilidade.
- `[CREATE]` `apps/web/src/app/page.tsx` — Rota inicial `/` renderizando o catálogo.
- `[CREATE]` `apps/web/src/app/items/[slug]/page.tsx` — Rota dinâmica de detalhes da obra.
- `[MODIFY]` `apps/web/src/index.ts` — Reexportar novos componentes e cliente de catálogo.
- `[CREATE]` `tests/catalog-browse-ui.test.mjs` — Bateria de testes de componentes, cliente de API e fluxos de estado.

## Data Model

Estruturas de estado da interface frontend:

```typescript
export interface CatalogFilterState {
  q: string;
  category?: Category;
  status?: PublicationStatus;
  genre?: string;
  sortBy?: CatalogSortBy;
}

export interface CatalogPaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export type AsyncViewStatus = 'loading' | 'success' | 'empty' | 'no-results' | 'error';

export interface AsyncViewState<T> {
  status: AsyncViewStatus;
  data: T;
  error?: string;
}
```

## Contracts

### Contratos de Comunicação Front ↔ Back

| Operação | Rota / Método | Parâmetros de Entrada | Resposta Esperada | Tratamento de Erro |
| :--- | :--- | :--- | :--- | :--- |
| **Buscar Catálogo** | `GET /api/v1/catalog/items` | `q`, `category`, `status`, `genre`, `page`, `limit`, `sortBy` | `200 OK`: `{ data: MediaItemSummaryDto[], meta: PaginationMeta }` | Falha de rede ou 500 $\rightarrow$ Exibe ErrorState com botão de retry |
| **Ver Detalhes** | `GET /api/v1/catalog/items/:slug` | `slug` (no path) | `200 OK`: `MediaItemDetailDto` | `404 Not Found` $\rightarrow$ Exibe aviso de item inexistente com link para voltar |
| **Carregar Capa** | `GET /api/v1/catalog/items/:slug/cover` | `slug` (no path) | `200 OK`: Imagem SVG (`image/svg+xml`) | Fallback automático no servidor para `_placeholder.svg` |

## Research

### Due Diligence de Performance e Acessibilidade (Custo R$ 0)

| Dimensão | Solução Adotada | Alternativa Paga / Descartada | Conformidade Constitucional |
| :--- | :--- | :--- | :--- |
| **Framework de Estilo** | Tailwind CSS v4 com variáveis nativas Dark Editorial | Bibliotecas pagas de componentes (ex.: UI Kits comerciais) | PASS (Zero custo permanente) |
| **Rolagem Infinita** | API nativa `IntersectionObserver` do navegador | Plugins externos pesados com dependências de tracking | PASS (Nativo, leve e zero dependência) |
| **Debounce de Busca** | Timer em JavaScript nativo com cancelamento de requisição (`AbortController`) | Serviços externos de busca client-side (ex.: Algolia InstantSearch) | PASS (Soberania total de dados e custo zero) |
| **Acessibilidade** | Padrões semânticos HTML5 (`<main>`, `<article>`, `tabindex`, `focus-visible`) | Overlays pagos de acessibilidade | PASS (Conformidade nativa WCAG 2.2 AA) |

