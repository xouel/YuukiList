# catalog-data Specification

## Purpose
Gerenciar a persistência relacional, os schemas canônicos, o seed determinístico de obras e o provisionamento de capas SVG locais para o catálogo do YuukiList.

## ADDED Requirements

### Requirement: Database Schema and Extension Provisioning
A camada de dados SHALL provisionar as tabelas MediaItem, ItemGenre e ItemAlias no PostgreSQL via Prisma ORM e ativar a extensão nativa pg_trgm.

#### Scenario: Migração inicial e extensão pg_trgm
- **GIVEN** que o banco PostgreSQL está configurado
- **WHEN** a migration do Prisma for executada
- **THEN** as tabelas do catálogo são criadas com sucesso e a extensão pg_trgm fica ativa no banco

### Requirement: Canonical Categories and Publication Statuses
O modelo de dados SHALL suportar exclusivamente as 6 categorias canônicas (DORAMA, FILME, ANIME, MANGA, MANHWA, MANHUA) e os 5 status canônicos de publicação (EM_ANDAMENTO, FINALIZADA, CANCELADA, HIATO, DESCONHECIDA).

#### Scenario: Validação de categoria e status canônicos
- **GIVEN** uma obra a ser persistida no banco
- **WHEN** os campos category e publicationStatus forem informados
- **THEN** o sistema valida os valores contra os enums canônicos e rejeita valores fora do vocabulário oficial

### Requirement: Deterministic Seed Population
O script de seed SHALL popular o banco de dados com exatamente 30 obras fictícias, contendo 5 doramas, 5 filmes, 5 animes, 5 mangás, 5 manhwas e 5 manhuas, cobrindo equitativamente todos os 5 status de publicação de forma idempotente.

#### Scenario: Execução idempotente do seed
- **GIVEN** o banco de dados limpo ou previamente populado
- **WHEN** o script de seed for executado uma ou mais vezes
- **THEN** o banco conterá exatamente 30 obras únicas, com 5 itens por categoria cobrindo todos os 5 status sem duplicação

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
