# Proposal: 002-catalog-search-api

> **X-Spec** · ID: `002-catalog-search-api` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de uma camada de API HTTP desacoplada no NestJS para viabilizar a exploração, busca textual inteligente e consulta de detalhes das obras do catálogo unificado. Esta mudança estabelece os módulos backend `data` e `catalog`, implementando os contratos `GET /api/v1/catalog/items`, `GET /api/v1/catalog/items/:slug` e `GET /api/v1/catalog/items/:slug/cover`. A busca inteligente utiliza normalização textual avançada e similaridade por trigramas nativa do PostgreSQL (`pg_trgm` com limiar mínimo de 0.35) com desempate alfabético por título, suporte a filtros combinados por categoria, status e gênero, paginação paginada e custo zero permanente, sem uso de IA gerativa ou APIs externas pagas.

## What Changes

- Criação do módulo `data` em `apps/api` encapsulando repositórios e serviços de acesso a dados (Prisma e armazenamento local de capas).
- Criação do módulo `catalog` em `apps/api` contendo controllers, services e DTOs de validação com class-validator/class-transformer.
- Implementação do endpoint `GET /api/v1/catalog/items` com suporte a query params (`q`, `category`, `status`, `genre`, `page`, `limit`, `sortBy`), retornando envelope paginado `{ data: [], meta: {} }`.
- Implementação de lógica de busca baseada em correspondência exata, parcial e fuzzy trigram com PostgreSQL `pg_trgm` (limiar >= 0.35), ranqueada por relevância com desempate alfabético.
- Suporte a ordenação padrão por título (A-Z) quando nenhum termo for fornecido ou quando `sortBy=title` for explicitado.
- Implementação do endpoint de detalhes `GET /api/v1/catalog/items/:slug`, retornando todos os metadados da obra, gêneros associados e aliases, ou 404 padronizado caso o slug não exista.
- Implementação do endpoint `GET /api/v1/catalog/items/:slug/cover` transmitindo o arquivo SVG local com cabeçalho `Content-Type: image/svg+xml` e fallback seguro para `_placeholder.svg`.
- Adição de testes de integração e unitários cobrindo todos os cenários da API contra PostgreSQL e simulações determinísticas.

## Capabilities

### New Capabilities
- `catalog-search`: Endpoints HTTP de listagem, busca inteligente com pg_trgm, filtros combinados, detalhes de item e serviço de capas SVG.

### Modified Capabilities
- Nenhuma (capacidade inicial de catálogo de dados `catalog-data` permanece preservada).

## Impact

- **Backend (`apps/api`):** Estruturação modular em NestJS isolando camada `data` e camada `catalog`.
- **Contratos (`packages/shared`):** Adição de DTOs e tipos de busca (`CatalogQueryDto`, `PaginatedResponse<T>`, `MediaItemDetailDto`).
- **Banco de Dados:** Utilização dos modelos `MediaItem`, `ItemGenre` e `ItemAlias` e do índice GIN em `normalized_title`.
- **Dependências:** Sem novas dependências externas proprietárias ou pagas (respeita custo R$ 0).

## User Stories

### US1 — Listagem e Filtragem Combinada do Catálogo (Priority: P1)
Como usuário navegando no catálogo do YuukiList,
Quero listar as obras com paginação e aplicar filtros simultâneos de categoria, status de publicação e gênero,
Para encontrar títulos relevantes filtrados com precisão sem perda de performance.

- **Why this priority:** Fundamental para a experiência inicial de navegação e para o consumo do frontend no Next.js.
- **Independent Test:** Requisitar `GET /api/v1/catalog/items?category=DORAMA&status=FINALIZADA` e verificar que todas as obras retornadas atendem rigorosamente a ambos os filtros.

### US2 — Busca Inteligente Tolerante a Erros de Digitação (Priority: P2)
Como usuário buscando uma obra pelo título,
Quero digitar termos parciais, sem acentos ou com pequenos erros de digitação (1 caractere trocado/faltando) e receber resultados relevantes ordenados,
Para localizar o título desejado rapidamente mesmo sem lembrar a grafia exata.

- **Why this priority:** É o diferencial central do produto acordado no PRD e no Documento Mestre de Contexto (busca útil sem IA).
- **Independent Test:** Requisitar `GET /api/v1/catalog/items?q=sololevel` ou com erro de digitação e verificar que a obra com similaridade trigram >= 0.35 é retornada no topo da listagem.

### US3 — Detalhes Completos da Obra e Servidor de Capa SVG (Priority: P3)
Como frontend ou cliente da API,
Quero obter todos os metadados detalhados de uma obra específica pelo seu slug e carregar sua capa vetorial SVG,
Para renderizar a página de detalhes com sinopse, gêneros, contagem de episódios/capítulos e imagem de alta fidelidade.

- **Why this priority:** Necessário para abrir a página de detalhes `/items/:slug` e exibir a identidade visual completa da obra.
- **Independent Test:** Requisitar `GET /api/v1/catalog/items/parasita` e receber payload completo com HTTP 200; requisitar `GET /api/v1/catalog/items/parasita/cover` e receber SVG com cabeçalho `image/svg+xml`.

## Success Criteria

- **SC-001**: O endpoint `GET /api/v1/catalog/items` responde com HTTP 200 contendo envelope `{ data: [], meta: { total, page, limit, totalPages } }`.
- **SC-002**: A busca com termo ranqueia por relevância de similaridade e desempata por ordem alfabética de título.
- **SC-003**: A listagem sem termo de busca ou com termo vazio ordena os itens puramente em ordem alfabética (A-Z).
- **SC-004**: O endpoint `GET /api/v1/catalog/items/:slug` retorna 200 com os dados completos para slug existente e 404 para slug inexistente.
- **SC-005**: O endpoint `GET /api/v1/catalog/items/:slug/cover` retorna SVG com `Content-Type: image/svg+xml` tanto para capa existente quanto no fallback.

## Edge Cases

- Busca com espaços extras ou caracteres especiais (`   one-piece!   `): normalização trata os caracteres antes da query.
- Termo de busca sem correspondência com similaridade < 0.35: retorna array `data: []` com HTTP 200 e `meta.total = 0`.
- Filtros mutuamente exclusivos que resultem em 0 itens: retorna lista vazia válida com HTTP 200.
- Slug inexistente ou com tentativa de path traversal (`../../etc/passwd`): endpoint de detalhes retorna 404 e endpoint de capa retorna `_placeholder.svg`.

## Out of Scope

- Interface visual frontend (será implementada na fatia R3 / `003-catalog-browse-ui`).
- Autenticação de usuários ou lista pessoal (fatias R4 a R7).
- Ingestão de APIs externas em tempo real (Fase 4 / R8 e R9).

## Clarifications

### Session 2026-11-08
- Q: Qual formato de envelope de resposta deve ser adotado para GET /api/v1/catalog/items? → A: (Recommended) Envelope paginado com metadados: { data: MediaItemSummaryDto[], meta: { total, page, limit, totalPages } }
- Q: Como as capas SVG devem ser servidas pela API NestJS? → A: (Recommended) Rota dedicada GET /api/v1/catalog/items/:slug/cover servindo o SVG com cabeçalho image/svg+xml e fallback automático para _placeholder.svg
- Q: Qual estratégia de ordenação e ranqueamento deve ser adotada na busca? → A: Padrão do PRD (exata > parcial > trigram >= 0.35 + desempate alfabético; sem busca = A-Z) + suporte a parâmetro opcional sortBy=title|relevance na query string

