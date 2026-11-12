# catalog-ingestion Specification

## Purpose

Gerenciar o pipeline de ingestão e sincronização de dados do catálogo a partir de APIs externas validadas, realizando normalização para identificadores internos, rastreamento de proveniência auditável por campo no PostgreSQL e geração de capas locais em SVG vetorial.

## Requirements

### Requirement: External Catalog Ingestion Pipeline
O sistema SHALL executar o pipeline de ingestão consumindo as APIs externas ativas (TMDB com autenticação, TVmaze, Kitsu e MangaUpdates), convertendo dados heterogêneos para entidades soberanas com IDs internos e proveniência auditável por campo.

#### Scenario: Ingestao de obras audiovisuais com resolucao de episodios e temporadas
- **GIVEN** registros de doramas e filmes obtidos através dos clientes TMDB e TVmaze
- **WHEN** o serviço de ingestão processa a obra para inclusão no catálogo
- **THEN** o sistema SHALL persistir a obra com categoria válida, ano, sinopse, total de episódios e temporadas sem depender de dados mockados

#### Scenario: Ingestao de obras literarias com diferenciacao de manga manhwa e manhua
- **GIVEN** publicações literárias obtidas via MangaUpdates e Kitsu
- **WHEN** o pipeline de ingestão mapeia a obra
- **THEN** o sistema SHALL registrar a obra preservando a categoria canônica distinta (MANGA, MANHWA ou MANHUA) e o total de capítulos disponíveis

#### Scenario: Preservacao retrocompativel das obras originais do seed
- **GIVEN** as obras originais semeadas na inicialização do projeto e referenciadas em bibliotecas pessoais
- **WHEN** a ingestão é executada no banco de dados
- **THEN** o sistema SHALL preservar os registros e identificadores existentes associando a proveniência SEED_CANONICAL sem quebrar vínculos de bibliotecas

#### Scenario: Ingestao sob demanda just in time a partir de busca externa
- **GIVEN** uma obra retornada de uma busca externa ao vivo que ainda nao existe no catalogo
- **WHEN** o usuario interage com a obra selecionando-a para detalhes ou adicionando-a a biblioteca
- **THEN** o servico de ingestao converte a obra em entidade soberana e a persiste de forma atomica no Supabase

### Requirement: Field-Level Data Provenance Tracking
O sistema SHALL registrar e persistir metadados de proveniência por campo para cada obra ingerida, indicando a fonte de dados, o identificador externo de origem e o timestamp da sincronização.

#### Scenario: Armazenamento estruturado de proveniencia na criacao da obra
- **GIVEN** uma obra a ser ingerida a partir de uma fonte externa
- **WHEN** o registro é salvo no PostgreSQL
- **THEN** o sistema SHALL gravar na coluna de proveniência a origem de cada metadado essencial (título, sinopse, unidades, ano) e o ID externo da fonte

#### Scenario: Consulta e auditoria de proveniencia de metadados
- **GIVEN** uma obra cadastrada no catálogo com dados de proveniência
- **WHEN** os detalhes da obra são consultados pelo identificador interno
- **THEN** o sistema SHALL disponibilizar a estrutura de proveniência indicando qual API forneceu cada informação

#### Scenario: Atualizacao e rastreamento de fonte primária e secundaria
- **GIVEN** uma obra cujos dados são complementados por fontes distintas (ex: TMDB para sinopse e TVmaze para episódios)
- **WHEN** a sincronização de múltiplos provedores é consolidada
- **THEN** o sistema SHALL registrar a proveniência granular por atributo sem sobrescrever fontes conflitantes indevidamente

### Requirement: Sovereign SVG Cover Provisioning and Cache Synchronization
O sistema SHALL gerar e servir capas vetoriais SVG locais no tema Dark Editorial para todas as obras ingeridas, garantindo soberania de dados, sincronização de cache e conformidade de custo zero.

#### Scenario: Geracao automatica de capa SVG vetorial para nova obra ingerida
- **GIVEN** uma nova obra inserida no catálogo sem arquivo de capa local prévio
- **WHEN** o pipeline de sincronização é finalizado
- **THEN** o sistema SHALL gerar uma capa vetorial SVG estilizada com título, categoria e paleta editorial salvando o path local no registro

#### Scenario: Servimento de capa local com headers corretos e sem hotlinking
- **GIVEN** uma requisição HTTP para a capa de uma obra ingerida
- **WHEN** o cliente acessa o endpoint /api/v1/catalog/items/:slug/cover
- **THEN** o sistema SHALL servir o SVG local com cabeçalho Content-Type image/svg+xml sem redirecionar para servidores remotos de imagens

#### Scenario: Sincronizacao de cache local no PostgreSQL com indexacao para busca trigram
- **GIVEN** um conjunto de obras recém-ingeridas e cacheadas no banco
- **WHEN** uma consulta de busca por texto parcial ou com pequenas variações de digitação é executada
- **THEN** o sistema SHALL retornar as obras ingeridas utilizando o índice pg_trgm nativo com similaridade mínima de 0.35
