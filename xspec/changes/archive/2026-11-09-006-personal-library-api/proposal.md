# Proposal: 006-personal-library-api

> **X-Spec** · ID: `006-personal-library-api` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de um subsistema de gerenciamento de biblioteca pessoal no backend NestJS para permitir que cada usuário autenticado organize, acompanhe e registre seu progresso de consumo em doramas, filmes, animes, mangás, manhwas e manhuas (Fase 3 do PRD e Seção 5 do Documento Mestre). Esta mudança implementa a entidade relacional `user_library_items` com chave composta única `(userId, mediaItemId)`, validação estrita de status pessoal compatível por categoria (diferenciando 'Quero assistir' de 'Quero ler'), acompanhamento contínuo de unidades principais (episódios/capítulos), cálculo dinâmico da condição 'Em dia' (`isUpToDate`) desacoplado da situação de publicação da obra e isolamento estrito entre usuários.

## What Changes

- Modelagem da tabela `user_library_items` no schema Prisma (`apps/api/prisma/schema.prisma`) com `id` (UUID), `user_id` (FK para `users`), `media_item_id` (FK para `media_items`), `status` (Enum de status pessoal), `progress` (inteiro, padrão 0), `rating` (Float opcional de 0 a 10), `notes` (texto opcional), `created_at` e `updated_at`.
- Definição de constraint de unicidade composta `@@unique([userId, mediaItemId])` e índices relacionais para consultas eficientes por usuário, status e categoria.
- Migration relacional `20261109010000_add_user_library_items` provisionando a tabela e os índices no PostgreSQL.
- Enum canônico `PersonalStatus` e matriz de compatibilidade por categoria (`validatePersonalStatusForCategory`) em `packages/shared/src/library.ts`:
  - Doramas e Animes: `QUERO_ASSISTIR`, `ASSISTINDO`, `PAUSADO`, `CONCLUIDO`, `DROPADO`
  - Filmes: `QUERO_ASSISTIR`, `ASSISTIDO`, `PAUSADO`, `DROPADO`
  - Mangás, Manhwas e Manhuas: `QUERO_LER`, `LENDO`, `PAUSADO`, `CONCLUIDO`, `DROPADO`
- Regra de negócio de cálculo dinâmico da condição "Em dia" (`isUpToDate: boolean`):
  - Filmes: `isUpToDate = (status === 'ASSISTIDO')`
  - Séries/Mangás: `isUpToDate = (progress >= totalEpisodesOrChapters)` quando total for conhecido e > 0
  - Obras em andamento: usuário em `ASSISTINDO` ou `LENDO` com progresso igual ao último episódio/capítulo disponível permanece com `isUpToDate: true` sem forçar status `CONCLUIDO` (Seção 5.8 do Documento Mestre).
- Endpoints REST protegidos pelo `AuthGuard`:
  - `GET /api/v1/library`: Listagem paginada da biblioteca pessoal do usuário autenticado com filtros opcionais por `status` pessoal e `category` da obra.
  - `GET /api/v1/library/items/:mediaItemId`: Consulta do status e progresso de uma obra específica na biblioteca do usuário.
  - `POST /api/v1/library/items`: Adição ou upsert idempotente de obra na biblioteca com status e progresso inicial.
  - `PATCH /api/v1/library/items/:mediaItemId`: Atualização atômica de status, progresso numérico, nota ou notas pessoais.
  - `DELETE /api/v1/library/items/:mediaItemId`: Remoção de item da biblioteca pessoal.
- Isolamento estrito de permissão: usuários não autenticados recebem HTTP 401 e nenhum usuário consegue visualizar ou modificar itens da biblioteca de outro usuário.

## Capabilities

### New Capabilities
- `personal-library`: Backend de gerenciamento da biblioteca pessoal, status desacoplado por categoria, tracking de progresso e cálculo da condição "Em dia".

### Modified Capabilities
- Nenhuma.

## Impact

- **Database (`apps/api/prisma`):** Adição do modelo `UserLibraryItem` com relações para `User` e `MediaItem`.
- **Contratos (`packages/shared`):** Novos tipos, enums e DTOs (`PersonalStatus`, `CreateLibraryItemDto`, `UpdateLibraryItemDto`, `LibraryItemDto`, `LibraryFilterDto`).
- **Backend (`apps/api`):** Criação do módulo `LibraryModule` (controllers, services, repositories) e integração no `AppModule`.

## User Stories

### US1 — Adição e Atualização de Obras na Biblioteca Pessoal (Priority: P1)
Como usuário autenticado,
Quero adicionar obras do catálogo à minha biblioteca com o status adequado para o formato (ex.: "Quero assistir" para doramas/animes ou "Quero ler" para mangás),
Para organizar minha lista de interesses e acompanhar o que pretendo consumir.

- **Why this priority:** É a operação de entrada para o tracking pessoal (Fase 3 do PRD).
- **Independent Test:** Enviar requisição autenticada para `POST /api/v1/library/items` com obra existente e status compatível e verificar retorno 201/200; tentar adicionar mangá com status "QUERO_ASSISTIR" e verificar rejeição com HTTP 400 Bad Request.

### US2 — Acompanhamento de Progresso e Condição "Em Dia" (Priority: P1)
Como usuário consumindo uma obra,
Quero atualizar meu progresso de episódios ou capítulos e verificar se estou "Em dia",
Para saber exatamente onde parei e ter feedback imediato de que alcancei a última unidade disponível sem que a obra seja marcada indevidamente como finalizada.

- **Why this priority:** Representa a mecânica diária de tracking e atende à regra inegociável da Seção 5.8 do Documento Mestre.
- **Independent Test:** Atualizar progresso de uma obra de 16 episódios para 16 via `PATCH /api/v1/library/items/:id` mantendo status "ASSISTINDO" e verificar que `isUpToDate` retorna `true` enquanto o status pessoal permanece inalterado.

### US3 — Listagem Paginada, Filtros e Isolamento Privado (Priority: P2)
Como usuário com múltiplos itens na biblioteca,
Quero listar minhas obras filtrando por status (ex.: apenas o que estou assistindo/lendo) ou categoria, com garantia de que outros usuários não vejam minha lista,
Para encontrar rapidamente o que estou acompanhando com privacidade total.

- **Why this priority:** Garante o consumo organizado da lista e a soberania/privacidade de dados exigida no PRD.
- **Independent Test:** Criar entradas para o Usuário A e para o Usuário B; verificar que `GET /api/v1/library` autenticado como Usuário A retorna apenas as obras do Usuário A; verificar que tentativa de acesso anônimo retorna HTTP 401.

## Success Criteria

- **SC-001**: O modelo `user_library_items` persiste obras associadas a usuários com chave composta única `(userId, mediaItemId)` no PostgreSQL.
- **SC-002**: A API rejeita com HTTP 400 Bad Request qualquer tentativa de registrar um status incompatível com a categoria da obra (ex.: "ASSISTIDO" em mangás ou "LENDO" em doramas).
- **SC-003**: A propriedade computada `isUpToDate` é calculada e retornada dinamicamente com base nas unidades principais, permitindo que obras em andamento fiquem "Em dia" sem forçar status "CONCLUIDO".
- **SC-004**: O endpoint `GET /api/v1/library` suporta paginação e filtros combinados por `status` e `category`, garantindo isolamento absoluto de 100% entre usuários.
- **SC-005**: 100% dos testes automatizados de regras de negócio, persistência e contratos de biblioteca passam sem custo de infraestrutura (R$ 0).

## Edge Cases

- Progresso informado negativo ou maior que o total oficial de episódios/capítulos conhecidos (deve validar limites razoáveis).
- Adicionar à biblioteca um `mediaItemId` inexistente no catálogo (deve retornar HTTP 404 Not Found).
- Exclusão de obra que não existe na biblioteca do usuário ou que pertence a outro usuário (deve retornar HTTP 404 Not Found sem vazar informações).
- Obra do tipo Filme (`FILME`) onde não existe contagem de episódios/capítulos (progresso numérico fixo em 0 ou 1, e status `ASSISTIDO` determinando conclusão).

## Out of Scope

- Interface visual da biblioteca (escopo da fatia R7 — `007-personal-library-ui`).
- Diário de visualização/leitura detalhado com histórico de datas e rewatch/reread (planejado para backlog pós-MVP).
- Compartilhamento público da biblioteca ou perfis públicos (no MVP, perfis e listas são estritamente privados).

## Clarifications

### Session 2026-11-09
- Q: Qual o comportamento ao adicionar um item que já existe na biblioteca? → A: Operação idempotente de upsert em `POST /api/v1/library/items` atualizando os dados sem erro de colisão.
- Q: Como calcular a condição "Em dia"? → A: Campo computado dinamicamente na camada de negócio comparando o progresso do usuário com a última unidade disponível da obra (`isUpToDate: boolean`).
- Q: Qual a estratégia de unicidade e isolamento? → A: Chave composta única `@@unique([userId, mediaItemId])` e todas as operações filtradas obrigatoriamente pelo `userId` autenticado via cookie de sessão.
