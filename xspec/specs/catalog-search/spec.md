# catalog-search Specification

## Purpose

Prover a interface HTTP e os serviços de domínio do catálogo para listagem paginada, busca textual aproximada com pg_trgm, filtragem combinada e exibição de detalhes e capas de obras asiáticas.

## Requirements

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
O mecanismo de busca SHALL normalizar o termo de consulta, realizar correspondência aproximada utilizando PostgreSQL pg_trgm em estratégia local-first (consultando APIs externas automaticamente apenas quando houver menos de 3 resultados locais ou quando solicitado explicitamente via includeExternal=true).

#### Scenario: Busca aproximada tolerante a pequenos erros de digitação
- **GIVEN** uma obra existente no catálogo
- **WHEN** o cliente realiza uma busca enviando o parâmetro q com variação de acentuação ou erro leve de digitação com similaridade trigram superior ou igual a 0.35
- **THEN** a API retorna a obra no conjunto de dados priorizada pela relevância de correspondência

#### Scenario: Ordenação explícita de busca por título
- **GIVEN** uma consulta de busca com múltiplos resultados
- **WHEN** a requisição inclui o parâmetro opcional sortBy com valor title
- **THEN** os resultados retornados são reordenados alfabeticamente por título em vez da pontuação de similaridade

#### Scenario: Busca federada com fallback para APIs externas
- **GIVEN** uma pesquisa por um termo com menos de 3 correspondências locais no banco ou com includeExternal=true
- **WHEN** a busca híbrida consulta as APIs externas em paralelo dentro do timeout configurado
- **THEN** a API agrega os resultados externos com badge de proveniência e metadados canônicos, evitando chamadas externas bloqueantes quando já houver resultados locais suficientes

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

### Requirement: Public Catalog Caching and Featured Recommendations
A camada de catálogo SHALL manter cache em memória com TTL curto para consultas públicas e slugs (invalidado após ingestão/mutação) com cabeçalhos HTTP de cache seguros, além de disponibilizar uma obra recomendada mais bem avaliada por categoria canônica.

#### Scenario: Reaproveitamento em cache de consultas repetidas ao catálogo
- **GIVEN** uma consulta pública recente a GET /api/v1/catalog/items ou GET /api/v1/catalog/items/:slug
- **WHEN** nova requisição equivalente chega dentro da janela do TTL configurado
- **THEN** a API responde a partir do cache em memória evitando nova viagem sequencial ao banco e invalida entradas relacionadas após ingestão de nova obra

#### Scenario: Seleção de uma obra destaque melhor avaliada por categoria canônica
- **GIVEN** o catálogo populado no Supabase com obras das 6 categorias canônicas
- **WHEN** os destaques iniciais da página principal são consultados
- **THEN** o serviço retorna 1 obra real melhor avaliada para cada uma das categorias DORAMA, FILME, ANIME, MANGA, MANHWA e MANHUA com capa oficial
