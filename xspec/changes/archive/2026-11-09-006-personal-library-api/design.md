# Design: 006-personal-library-api

## Context

O YuukiList possui catálogo unificado (R1-R3) e sistema de autenticação e sessão com cookies HttpOnly (R4-R5) em funcionamento.
A Fase 3 do PRD e a Seção 5 do Documento Mestre de Contexto exigem a biblioteca pessoal privada do usuário, desacoplada da situação de publicação da obra. Esta mudança implementa a persistência relacional, validação de compatibilidade de status por categoria (diferenciando audiovisual de leitura), tracking de progresso de episódios/capítulos, cálculo dinâmico da condição "Em dia" (`isUpToDate: boolean`) e endpoints REST sob `AuthGuard`.

## Goals / Non-Goals

**Goals:**
- Criar a entidade relacional `user_library_items` com constraint de unicidade composta `@@unique([userId, mediaItemId])`.
- Definir o enum canônico `PersonalStatus` e a matriz de compatibilidade com categorias do catálogo.
- Implementar regra de negócio de cálculo dinâmico da condição "Em dia" (`isUpToDate`), assegurando que obras em andamento com progresso alcançado permaneçam como "Em dia" sem forçar status "Concluído".
- Prover endpoints REST protegidos por `AuthGuard`: listagem filtrada por status/categoria, consulta por obra, adição/upsert idempotente, atualização atômica e exclusão.
- Garantir isolamento estrito entre usuários (um usuário nunca acessa ou modifica registros de outro).
- Preservar o Princípio de Custo Zero (R$ 0 permanente).

**Non-Goals:**
- Interface gráfica web da biblioteca pessoal (escopo exclusivo da fatia R7 — `007-personal-library-ui`).
- Histórico temporal de rewatch/reread (backlog pós-MVP).
- Compartilhamento social ou visualização pública da biblioteca (no MVP a biblioteca é 100% privada).

## Decisions

1. **Chave Composta Única `(userId, mediaItemId)` com Upsert Idempotente**
   - **Escolha:** O modelo possui chave única `@@unique([userId, mediaItemId])`, e o endpoint `POST /api/v1/library/items` atualiza o registro caso ele já exista.
   - **Alternativas consideradas:** Rejeitar com 409 Conflict se o item já existir.
   - **Justificativa:** Proporciona idempotência e resiliência quando o usuário clica para adicionar/alterar o status a partir do card do catálogo.

2. **Matriz Estrita de Status Pessoal por Categoria**
   - **Escolha:** O enum canônico possui 8 valores (`QUERO_ASSISTIR`, `ASSISTINDO`, `QUERO_LER`, `LENDO`, `PAUSADO`, `CONCLUIDO`, `ASSISTIDO`, `DROPADO`). A camada de serviço rejeita com HTTP 400 Bad Request valores fora do vocabulário permitido da categoria.
   - **Alternativas consideradas:** Um único status genérico ("Planejo", "Consumindo") para todas as mídias.
   - **Justificativa:** Cumpre expressamente a Seção 5.1 do Documento Mestre, separando as listas de desejo e tracking audiovisual de leitura.

3. **Cálculo Dinâmico de "Em Dia" (`isUpToDate`)**
   - **Escolha:** A propriedade booleana `isUpToDate` é computada pela camada de negócio durante a resposta, comparando `progress >= totalUnits` (ou `status === 'ASSISTIDO'` para filmes).
   - **Alternativas consideradas:** Gravar coluna booleana persistida no banco.
   - **Justificativa:** Evita desincronização quando o catálogo atualiza a contagem de episódios/capítulos disponíveis e adere à regra de que "Em dia é uma condição calculada, não um status" (Seção 5.8).

4. **Isolamento de Segurança via `AuthGuard` e `req.user.id`**
   - **Escolha:** Todas as operações do repositório de biblioteca exigem `userId` obrigatoriamente derivado do token verificado da sessão ativa.
   - **Alternativas consideradas:** Passar `userId` na rota `/users/:userId/library`.
   - **Justificativa:** Previne vulnerabilidade de Insecure Direct Object Reference (IDOR) e garante privacidade por design.

## Risks / Trade-offs

- **[Risco] Tentativa de registrar progresso superior ao total de episódios** → **Mitigação:** Validação na camada de serviço: se a obra possuir `totalUnits` conhecido e > 0, progresso > `totalUnits` ou < 0 é rejeitado com HTTP 400.
- **[Risco] Vazamento de dados entre usuários em consultas concorrentes** → **Mitigação:** Clausula `WHERE user_id = $userId` mandatória em 100% das queries SQL/Prisma.

## Migration Plan

1. Executar migration `20261109010000_add_user_library_items` provisionando a tabela `user_library_items` e índices no PostgreSQL.
2. Nenhuma tabela existente (`media_items`, `users`) é alterada em sua estrutura primária.
3. Rollback: drop seguro da tabela `user_library_items`.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/api/prisma/schema.prisma` — Adição do modelo `UserLibraryItem`.
- `[CREATE]` `apps/api/prisma/migrations/20261109010000_add_user_library_items/migration.sql` — Migration DDL criando a tabela e índices.
- `[CREATE]` `packages/shared/src/library.ts` — Enums, validadores de compatibilidade, cálculo de `isUpToDate` e DTOs da biblioteca.
- `[MODIFY]` `packages/shared/src/index.ts` — Re-exportação dos contratos de biblioteca.
- `[CREATE]` `apps/api/src/library/library.errors.ts` — Erros de domínio (`IncompatibleStatusError`, `InvalidProgressError`, `LibraryItemNotFoundError`).
- `[CREATE]` `apps/api/src/library/library.repository.ts` — Repositório de persistência de biblioteca com isolamento por usuário.
- `[CREATE]` `apps/api/src/library/library.service.ts` — Regras de negócio de validação de status, progresso e cálculo "Em dia".
- `[CREATE]` `apps/api/src/library/library.controller.ts` — Controller REST expondo os endpoints `/api/v1/library`.
- `[CREATE]` `apps/api/src/library/library.module.ts` — Módulo NestJS de biblioteca.
- `[MODIFY]` `apps/api/src/app.module.ts` — Integração do `LibraryModule`.
- `[MODIFY]` `apps/api/src/index.ts` — Re-exportação do módulo e serviços de biblioteca.
- `[CREATE]` `tests/personal-library-api.test.mjs` — Suíte de testes automatizados cobrindo os 9 cenários normativos.

## Data Model

### Entidade `UserLibraryItem` (tabela: `user_library_items`)
| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default(uuid()) | Identificador único do registro da biblioteca |
| `user_id` | UUID | Not Null, FK -> `users(id)` | Identificador do proprietário do item |
| `media_item_id` | UUID | Not Null, FK -> `media_items(id)` | Identificador da obra no catálogo |
| `status` | VarChar(32) | Not Null | Status pessoal compatível com a categoria |
| `progress` | Integer | Not Null, default(0) | Número de episódios ou capítulos consumidos |
| `rating` | Float | Nullable (0.0 a 10.0) | Nota pessoal atribuída pelo usuário |
| `notes` | Text | Nullable | Anotações pessoais privadas do usuário |
| `created_at` | Timestamp | Not Null, default(now()) | Data de adição à biblioteca |
| `updated_at` | Timestamp | Not Null, updated_at | Data da última atualização |

## Contracts

### `POST /api/v1/library/items` (Upsert)
- **Request Body:**
  ```json
  {
    "mediaItemId": "uuid-da-obra",
    "status": "ASSISTINDO",
    "progress": 5,
    "rating": 9.5,
    "notes": "Excelente início!"
  }
  ```
- **Response (200 / 201):** Objeto `LibraryItemDto` com `isUpToDate: boolean` calculado.

### `PATCH /api/v1/library/items/:mediaItemId`
- **Request Body:**
  ```json
  {
    "progress": 6,
    "status": "ASSISTINDO"
  }
  ```
- **Response (200 OK):** Objeto `LibraryItemDto` atualizado com recálculo de `isUpToDate`.

### `DELETE /api/v1/library/items/:mediaItemId`
- **Response (200 OK):** `{"success": true}`

### `GET /api/v1/library`
- **Query Params:** `status`, `category`, `page` (default 1), `limit` (default 20).
- **Response (200 OK):** PaginatedResponse de `LibraryItemDto` contendo resumo da obra e `isUpToDate`.

## Research

- **Master Context Document (Seção 5):** A situação de publicação da obra é independente do status pessoal. "Em dia" é condição calculada (`progress >= totalUnits`). Para filmes, `ASSISTIDO` representa conclusão sem percentual.
- **Isolamento Multiusuário:** A chave composta `(userId, mediaItemId)` no PostgreSQL garante integridade e previne duplicidade de registros concorrentes.
- **Custo Zero Permanente (Princípio IV):** Todas as entidades e cálculos operam nativamente em TypeScript e PostgreSQL sem serviços de nuvem adicionais.
