# catalog-search Specification Delta

## MODIFIED Requirements

### Requirement: Catalog Items Listing and Filtering
A API de catálogo SHALL expor o endpoint GET /api/v1/catalog/items retornando um envelope paginado com metadados de paginação a partir do banco PostgreSQL Supabase e suportar filtros combinados por categoria, status de publicação e gênero.

#### Scenario: Listagem paginada com ordenação padrão por título
- **GIVEN** que o catálogo contém obras cadastradas no banco Supabase
- **WHEN** o cliente requisita GET /api/v1/catalog/items sem termo de busca
- **THEN** a API responde com status 200, envelope contendo data e meta com total, page, limit e totalPages, ordenado alfabeticamente por título em ordem ascendente

#### Scenario: Filtragem combinada por categoria e status
- **GIVEN** que o catálogo possui obras de múltiplas categorias e status no banco
- **WHEN** o cliente requisita GET /api/v1/catalog/items com parâmetros de filtro de categoria e status de publicação
- **THEN** a API retorna apenas as obras que satisfazem cumulativamente ambos os filtros selecionados

### Requirement: Intelligent Search with Trigram Similarity
O mecanismo de busca SHALL normalizar o termo de consulta, realizar correspondência aproximada utilizando PostgreSQL pg_trgm e fornecer busca federada híbrida consultando APIs externas ativas quando requisitado.

#### Scenario: Busca aproximada tolerante a pequenos erros de digitação
- **GIVEN** uma obra existente no catálogo
- **WHEN** o cliente realiza uma busca enviando o parâmetro q com variação de acentuação ou erro leve de digitação com similaridade trigram superior ou igual a 0.35
- **THEN** a API retorna a obra no conjunto de dados priorizada pela relevância de correspondência

#### Scenario: Ordenação explícita de busca por título
- **GIVEN** uma consulta de busca com múltiplos resultados
- **WHEN** a requisição inclui o parâmetro opcional sortBy com valor title
- **THEN** os resultados retornados são reordenados alfabeticamente por título em vez da pontuação de similaridade

#### Scenario: Busca federada com fallback para APIs externas
- **GIVEN** uma pesquisa por um termo sem correspondencia local suficiente no banco
- **WHEN** a busca híbrida consulta as APIs externas em paralelo
- **THEN** a API agrega os resultados externos com badge de proveniência e metadados canônicos

