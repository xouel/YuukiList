# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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

