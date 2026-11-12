# catalog-ingestion Specification Delta

## MODIFIED Requirements

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

