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
O mecanismo de carga inicial SHALL popular o banco de dados Supabase com um acervo ampliado de 120 obras reais consagradas, divididas equitativamente em 20 títulos para cada uma das 6 categorias canônicas de forma idempotente.

#### Scenario: Execucao idempotente da carga ampliada de obras reais
- **GIVEN** o banco de dados Supabase PostgreSQL conectado
- **WHEN** o servico de carga inicial for executado
- **THEN** o banco contera exatamente 20 obras reais para cada uma das 6 categorias canonicas sem duplicacao de registros

### Requirement: Local SVG Cover Serving and Fallback
O repositório de dados SHALL fornecer uma capa SVG vetorial local para cada um dos 30 slugs do seed e prover um SVG substituto padrão caso o slug requisitado não exista.

#### Scenario: Obtenção de capa válida por slug
- **GIVEN** que a obra existe no catálogo do seed
- **WHEN** a capa for requisitada pelo slug correspondente
- **THEN** o sistema retorna o arquivo SVG original com cabeçalho Content-Type image/svg+xml

#### Scenario: Fallback para slug inexistente
- **GIVEN** que um slug inválido ou inexistente é requisitado
- **WHEN** o recurso de capa for acessado
- **THEN** o sistema retorna o SVG placeholder substituto sem gerar erro de servidor
