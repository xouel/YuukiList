# catalog-data Specification Delta

## MODIFIED Requirements

### Requirement: Deterministic Seed Population
O mecanismo de carga inicial SHALL popular o banco de dados relacional Supabase PostgreSQL com um acervo ampliado e diversificado de obras consagradas em todas as 6 categorias canonicas com metadados completos de forma idempotente para suportar metricas estatisticas confiaveis.

#### Scenario: Execucao idempotente da carga ampliada de obras reais
- **GIVEN** o banco de dados Supabase PostgreSQL conectado
- **WHEN** o servico de carga inicial for executado
- **THEN** o banco contera acervo robusto de obras consagradas distribuidas nas 6 categorias canonicas sem duplicacao de registros

### Requirement: Local SVG Cover Serving and Fallback
O repositorio de dados e o frontend SHALL fornecer capas oficiais com resolucao transparente e fallback automatico para a capa vetorial SVG local correspondente caso a imagem remota falhe ou se torne indisponivel.

#### Scenario: Resiliencia e fallback automatico para capas oficiais
- **GIVEN** uma obra exibida com URL de capa oficial remota
- **WHEN** o carregamento da imagem remota falha por erro de conexao, bloqueio ou codigo HTTP de erro
- **THEN** o sistema SHALL acionar o fallback imediato e transparente para a capa vetorial SVG gerada localmente
