# catalog-data Specification Delta

## MODIFIED Requirements

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

### Requirement: Deterministic Seed Population
O mecanismo de carga inicial SHALL popular o banco de dados Supabase com um acervo ampliado de 120 obras reais consagradas, divididas equitativamente em 20 títulos para cada uma das 6 categorias canônicas de forma idempotente.

#### Scenario: Execucao idempotente da carga ampliada de obras reais
- **GIVEN** o banco de dados Supabase PostgreSQL conectado
- **WHEN** o servico de carga inicial for executado
- **THEN** o banco contera exatamente 20 obras reais para cada uma das 6 categorias canonicas sem duplicacao de registros

