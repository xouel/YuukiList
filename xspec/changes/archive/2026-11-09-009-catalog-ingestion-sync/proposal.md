# Proposal: 009-catalog-ingestion-sync

> **X-Spec** · ID: `009-catalog-ingestion-sync` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

Com a conclusão da prova de conceito e due diligence das APIs externas na fatia R8, o YuukiList necessita consolidar a Fase 4 do MVP, integrando adaptadores reais de ingestão na camada de dados para substituir a dependência de dados mockados por um acervo dinâmico e expandido. O pipeline deve consumir as fontes primárias validadas (TMDB para doramas e filmes, Kitsu e ANN para animes, MangaUpdates para mangás, manhwas e manhuas), normalizar metadados para identificadores internos próprios, salvar proveniência auditável por campo no PostgreSQL e gerar capas locais vetoriais em SVG, garantindo soberania de dados, custo permanente zero (R$ 0) e integridade total da busca e das bibliotecas pessoais dos usuários.

## What Changes

- Criação do serviço `CatalogIngestionService` na camada `data` orquestrando os adaptadores de APIs externas desenvolvidos na fatia R8.
- Extensão do schema Prisma do `MediaItem` com coluna estruturada de proveniência (`provenance`) registrando origem por campo, identificador externo e data de sincronização.
- Normalização automatizada para identificadores internos e geração de slugs amigáveis únicos.
- Gerador dinâmico de capas vetoriais SVG locais no padrão Dark Editorial para todas as novas obras ingeridas, assegurando Soberania de Dados sem hotlinking nem violação de direitos autorais.
- Script executável de sincronização e ingestão (`scripts/sync-catalog.mjs`) com suporte a execução idempotente e amostragem de lote.
- Preservação retrocompatível das obras iniciais do seed com proveniência `SEED_CANONICAL`, mantendo 100% íntegras as referências de bibliotecas pessoais existentes.

## Capabilities

### New Capabilities

- `catalog-ingestion`: Ingestão multicanal de obras a partir de APIs externas públicas, normalização com proveniência por campo e sincronização de cache local no PostgreSQL com capas SVG próprias.

### Modified Capabilities

Nenhuma.

## Impact

- `apps/api/prisma/schema.prisma`: Adição de campo `provenance` (JSON) na tabela `MediaItem`.
- `apps/api/src/data/catalog-ingestion.service.ts`: Serviço de ingestão e resolução de adaptadores.
- `apps/api/src/data/catalog.repository.ts`: Métodos para upsert de obras com metadados de proveniência.
- `apps/api/src/data/svg-cover.service.ts`: Geração dinâmica de capas SVG vetoriais locais para obras ingeridas.
- `scripts/sync-catalog.mjs`: Script CLI de ingestão e sincronização de catálogo.
- `tests/catalog-ingestion-sync.test.mjs`: Suíte de testes automatizados do pipeline de ingestão e proveniência.

## User Stories

### US1 — Ingestão Automatizada e Resolução por Adaptador (Priority: P1)

Como mantenedor do catálogo, quero acionar a ingestão de obras de doramas, filmes, animes, mangás, manhwas e manhuas a partir das APIs recomendadas na PoC, para que o catálogo local no PostgreSQL seja enriquecido com metadados confiáveis.

- **Why this priority:** É a transição do catálogo estático de 30 itens para um catálogo dinâmico alimentado por fontes reais da indústria.
- **Independent Test:** Executar o pipeline de ingestão para um conjunto de obras de cada categoria e validar se os registros são inseridos com IDs internos próprios e campos canônicos preenchidos.

### US2 — Rastreamento de Proveniência e Auditoria por Campo (Priority: P1)

Como administrador ou auditor de dados, quero inspecionar o registro de proveniência de cada obra para verificar qual fonte externa forneceu cada campo (título, sinopse, total de episódios/capítulos e ano) e a data da última sincronização.

- **Why this priority:** Cumpre o Princípio V (Soberania de Dados e Proveniência) e a Seção 8 do Documento Mestre de Contexto.
- **Independent Test:** Consultar uma obra ingerida e verificar se o campo `provenance` contém o mapeamento detalhado por campo com a fonte correspondente (ex.: TMDB para doramas, MangaUpdates para mangás).

### US3 — Soberania de Dados e Geração de Capas Locais SVG (Priority: P2)

Como usuário do YuukiList, quero visualizar cards no catálogo e na biblioteca com capas locais vetoriais SVG nítidas no tema Dark Editorial, sem dependência de servidores de imagens externos instáveis ou com restrições de direitos autorais.

- **Why this priority:** Garante o Princípio IV (Custo Zero) e o Princípio V (Soberania de Dados), eliminando quebras por hotlinking ou bloqueios de CORS.
- **Independent Test:** Requisitar a capa SVG de qualquer obra recém-ingerida via `/api/v1/catalog/items/:slug/cover` e validar a entrega de SVG válido com cabeçalho `image/svg+xml`.

## Success Criteria

- **SC-001**: Obras das 6 categorias ingeridas com sucesso e consultáveis via API de catálogo e busca inteligente (`pg_trgm`).
- **SC-002**: 100% das obras ingeridas possuem metadados de proveniência por campo armazenados em formato estruturado auditável.
- **SC-003**: 100% das obras ingeridas possuem capas vetoriais locais SVG servidas pelo endpoint próprio sem dependência de CDNs de imagens de terceiros.
- **SC-004**: Todas as 30 obras semeadas anteriormente continuam funcionais com referências de biblioteca pessoal preservadas sem regressões.
- **SC-005**: 100% dos testes da suíte de ingestão e sincronização passando com sucesso determinístico.

## Edge Cases

- Títulos colidindo com slugs já existentes (deve gerar sufixo numérico determinístico para o slug interno).
- Obras literárias com contagem de capítulos indefinida ou em andamento contínuo (armazenar null com status EM_ANDAMENTO).
- Falha parcial em um dos adaptadores de API (deve registrar log de erro e prosseguir com as demais obras sem abortar todo o lote).

## Out of Scope

- Scraping de sites não autorizados ou uso de APIs proibidas (AniList, Jikan, MangaDex).
- Cron jobs daemon de execução contínua em segundo plano (acionamento via CLI e endpoints dedicados).
- Cópia ou redistribuição de arquivos JPEG/PNG de capas protegidas por direitos autorais de terceiros.

## Clarifications

### Session 2026-11-09
- Q: Estratégia de transição das 30 obras do seed mock? → A: Ingerir o catálogo expandido a partir das fontes validadas na PoC e preservar as 30 obras iniciais migradas para o mesmo esquema com proveniência marcada como `SEED_CANONICAL`, garantindo que nenhuma referência de biblioteca pessoal criada anteriormente seja quebrada.
- Q: Modelagem do rastreamento de proveniência por campo no banco? → A: Adicionar uma coluna estruturada JSON (`provenance` / `sourceProvenance`) na tabela `MediaItem`, registrando para cada campo a fonte de origem (`TMDB`, `TVMAZE`, `KITSU`, `ANN`, `MANGAUPDATES`, `LOCAL`), o ID externo e a data da sincronização, mantendo os contratos atuais de busca e listagem 100% retrocompatíveis.
- Q: Política de capas para obras ingeridas (Soberania de Dados e Custo Zero)? → A: O normalizador registra a URL externa de referência no campo de proveniência, mas o gerador interno de capas locais SVG cria automaticamente capas locais com proporção 2:3 no tema Dark Editorial para 100% das obras ingeridas, garantindo Soberania de Dados (Princípio V) e conformidade jurídica total.

