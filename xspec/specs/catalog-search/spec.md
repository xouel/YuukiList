# catalog-search Specification

## Purpose

Prover a interface HTTP e os serviços de domínio do catálogo para listagem paginada, busca textual aproximada com pg_trgm, filtragem combinada e exibição de detalhes e capas de obras asiáticas.

## Requirements

### Requirement: Catalog Items Listing and Filtering
A API de catálogo SHALL expor o endpoint GET /api/v1/catalog/items retornando um envelope paginado com metadados de paginação e suportar filtros combinados por categoria, status de publicação e gênero combinados via conjunção lógica AND.

#### Scenario: Listagem paginada com ordenação padrão por título
- **GIVEN** que o catálogo contém obras cadastradas
- **WHEN** o cliente requisita GET /api/v1/catalog/items sem termo de busca
- **THEN** a API responde com status 200, envelope contendo data e meta com total, page, limit e totalPages, ordenado alfabeticamente por título em ordem ascendente

#### Scenario: Filtragem combinada por categoria e status
- **GIVEN** que o catálogo possui obras de múltiplas categorias e status
- **WHEN** o cliente requisita GET /api/v1/catalog/items com parâmetros de filtro de categoria e status de publicação
- **THEN** a API retorna apenas as obras que satisfazem cumulativamente ambos os filtros selecionados

### Requirement: Intelligent Search with Trigram Similarity
O mecanismo de busca SHALL normalizar o termo de consulta e realizar correspondência aproximada utilizando a extensão PostgreSQL pg_trgm com limiar de similaridade mínima de 0.35, ranqueando os resultados por relevância e desempatando alfabeticamente por título.

#### Scenario: Busca aproximada tolerante a pequenos erros de digitação
- **GIVEN** uma obra existente no catálogo
- **WHEN** o cliente realiza uma busca enviando o parâmetro q com variação de acentuação ou erro leve de digitação com similaridade trigram superior ou igual a 0.35
- **THEN** a API retorna a obra no conjunto de dados priorizada pela relevância de correspondência

#### Scenario: Ordenação explícita de busca por título
- **GIVEN** uma consulta de busca com múltiplos resultados
- **WHEN** a requisição inclui o parâmetro opcional sortBy com valor title
- **THEN** os resultados retornados são reordenados alfabeticamente por título em vez da pontuação de similaridade

### Requirement: Catalog Item Details and Cover Endpoints
A API de catálogo SHALL fornecer os endpoints GET /api/v1/catalog/items/:slug para detalhes completos da obra e GET /api/v1/catalog/items/:slug/cover para transmissão da capa vetorial SVG com cabeçalho de mídia apropriado e fallback seguro.

#### Scenario: Consulta de detalhes de obra por slug existente
- **GIVEN** que uma obra identificada pelo slug solicitado existe no catálogo
- **WHEN** o cliente requisita GET /api/v1/catalog/items/:slug
- **THEN** a API responde com status 200 contendo todos os campos do item, lista de gêneros e lista de títulos alternativos

#### Scenario: Consulta de detalhes de obra inexistente
- **GIVEN** que o slug informado não corresponde a nenhuma obra do catálogo
- **WHEN** o cliente requisita GET /api/v1/catalog/items/:slug
- **THEN** a API responde com status 404 e payload com mensagem descritiva de erro

#### Scenario: Serviço de capa SVG com cabeçalho dedicado e fallback
- **GIVEN** o endpoint de capa de uma obra
- **WHEN** o cliente requisita GET /api/v1/catalog/items/:slug/cover
- **THEN** o servidor retorna o arquivo SVG com cabeçalho Content-Type image/svg+xml, entregando a imagem original da obra ou o placeholder substituto seguro caso a capa não exista
