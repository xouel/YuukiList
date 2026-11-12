# catalog-data Specification

## Purpose

Gerenciar a persistência relacional, os schemas canônicos, o seed determinístico de obras e o provisionamento de capas SVG locais para o catálogo do YuukiList.

## Requirements

### Requirement: Database Schema and Extension Provisioning
A camada de dados SHALL provisionar as tabelas MediaItem, ItemGenre e ItemAlias no PostgreSQL via Prisma ORM, ativar a extensão nativa pg_trgm e garantir a persistência durável de catálogo no Supabase.

#### Scenario: Migração inicial e extensão pg_trgm
- **GIVEN** que o banco PostgreSQL está configurado
- **WHEN** a migration do Prisma for executada
- **THEN** as tabelas do catálogo são criadas com sucesso e a extensão pg_trgm fica ativa no banco

#### Scenario: Persistencia permanente e consulta via Prisma ORM
- **GIVEN** a configuracao de conexao com o Supabase PostgreSQL no Prisma Client
- **WHEN** operacoes de consulta e escrita forem executadas pelo repositorio de catalogo
- **THEN** os dados de obras sao persistidos e lidos diretamente do banco relacional

### Requirement: Canonical Categories and Publication Statuses
O modelo de dados SHALL suportar exclusivamente as 6 categorias canônicas (DORAMA, FILME, ANIME, MANGA, MANHWA, MANHUA) e os 5 status canônicos de publicação (EM_ANDAMENTO, FINALIZADA, CANCELADA, HIATO, DESCONHECIDA).

#### Scenario: Validação de categoria e status canônicos
- **GIVEN** uma obra a ser persistida no banco
- **WHEN** os campos category e publicationStatus forem informados
- **THEN** o sistema valida os valores contra os enums canônicos e rejeita valores fora do vocabulário oficial

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
