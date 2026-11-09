# Technical Design: 011-library-favorites-rewatch-and-sorting

## Context

A biblioteca pessoal do YuukiList consolidou no MVP as operações básicas de acompanhamento de status, progresso e detecção da condição "Em dia" (fatias R6 e R7). Com a expansão formalizada pelo Documento Mestre de Contexto (Seções 3.4, 5.8 a 5.11) e PRD, faz-se necessário enriquecer o modelo de dados e a interface da biblioteca com:
1. Marcação de Favoritos (`isFavorite: boolean`) independente de notas máximas;
2. Gestão de Reassistir/Reler com contador cumulativo (`rewatchCount: number`) e suporte a múltiplos ciclos de consumo;
3. Progresso alternativo por Volumes (`progressVolumes?: number | null`) para mangás, manhwas e manhuas;
4. 6 opções canônicas de ordenação e filtros avançados combinados;
5. Detecção visual amigável e não-bloqueante de inconsistências entre status pessoal e progresso da obra.

## Goals / Non-Goals

### Goals
- Adicionar `isFavorite`, `rewatchCount` e `progressVolumes` aos contratos compartilhados (`packages/shared/src/library.ts`), backend NestJS e frontend Next.js.
- Permitir favoritar/desfavoritar com um clique via `♥` em cards e linhas da biblioteca com atualização otimista imediata.
- Oferecer as duas modalidades de Reassistir/Reler documentadas na Seção 5.10: iniciar novo ciclo (zera progresso para 0 e incrementa contador) ou apenas incrementar contador de vezes consumidas.
- Disponibilizar ordenações: Atualizados recentemente, Adicionados recentemente, Alfabética, Progresso, Avaliação e Data de lançamento.
- Exibir aviso visual informativo âmbar quando o usuário marcar uma obra como Concluída com progresso registrado menor que o total conhecido da obra.

### Non-Goals
- Histórico temporal de cada evento de rewatch com timestamps de cada episódio individual (escopo de R12 — Diário & Linha do Tempo).
- Compartilhamento externo de favoritos por links públicos (escopo de R15 — Perfis & Compartilhamento).

## Decisions

### 1. Desacoplamento Estrito entre Favoritos e Avaliação
- **Decisão:** Manter `isFavorite` como um booleano puro desacoplado de `rating` (0 a 10). Uma obra pode ser favorita sem possuir nota, ou possuir nota 8.5 e ser favorita.
- **Alternativa Rejeitada:** Considerar automaticamente como favorita qualquer obra com nota 10.0 (violaria a Seção 5.11 do Documento Mestre).

### 2. Fluxo Dual de Reassistir / Reler
- **Decisão:** No modal de edição da obra, expor o bloco de Reassistir/Reler com o contador atual `rewatchCount` e duas ações explícitas:
  - *Iniciar Novo Ciclo:* Define `progress = 0`, incrementa `rewatchCount + 1` e ajusta status para `ASSISTINDO` ou `LENDO`.
  - *Incrementar Contador:* Mantém o progresso e o status inalterados e apenas soma `+1` ao contador.
- **Justificativa:** Atende perfeitamente à Seção 5.10 ("Duas opções: Novo ciclo ou Incrementar contador"), preservando o histórico acumulado sem sobrescrever a experiência.

### 3. Progresso por Volumes como Unidade Opcional
- **Decisão:** Manter `progress` (capítulos) como unidade principal e introduzir `progressVolumes` como campo opcional. Se ambos estiverem preenchidos, a interface exibe `Cap. X • Vol. Y`.
- **Alternativa Rejeitada:** Converter automaticamente capítulos para volumes através de fórmula matemática estimada (rejeitada por violar a diretriz de confiabilidade do Documento Mestre).

### 4. Alerta Amigável Não-Bloqueante de Inconsistência
- **Decisão:** Quando o usuário seleciona status `CONCLUIDO` (ou `ASSISTIDO`) e a obra possui `totalUnits` conhecido e `progress < totalUnits`, um banner âmbar informa a divergência, mas **NÃO impede** o salvamento.
- **Justificativa:** Respeita a soberania do usuário (ex: pulou episódios fillers ou concluiu por outra fonte sem registrar cada episódio individualmente).

## Data Model

### Shared DTOs (`packages/shared/src/library.ts`)

```typescript
export type LibrarySortBy =
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'progress'
  | 'rating'
  | 'releaseYear';

export interface CreateLibraryItemDto {
  mediaItemId: string;
  status: PersonalStatus;
  progress?: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite?: boolean;
  rewatchCount?: number;
}

export interface UpdateLibraryItemDto {
  status?: PersonalStatus;
  progress?: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite?: boolean;
  rewatchCount?: number;
}

export interface LibraryItemDto {
  id: string;
  userId: string;
  mediaItemId: string;
  status: PersonalStatus;
  progress: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite: boolean;
  rewatchCount: number;
  isUpToDate: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  mediaItem?: MediaItemSummaryDto;
}

export interface LibraryFilterDto {
  status?: PersonalStatus;
  category?: Category;
  isFavorite?: boolean;
  originCountry?: string;
  sortBy?: LibrarySortBy;
  page?: number;
  limit?: number;
}
```

## Contracts

### REST API Endpoints

- `GET /api/v1/library`
  - Query Params: `status`, `category`, `isFavorite=true`, `originCountry`, `sortBy`, `page`, `limit`
  - Response: `PaginatedResponse<LibraryItemDto>`
- `PATCH /api/v1/library/items/:mediaItemId`
  - Body: `UpdateLibraryItemDto` (`{ isFavorite?: boolean, rewatchCount?: number, progressVolumes?: number, ... }`)
  - Response: `LibraryItemDto`

## Research

- **Custo Zero Permanente (Princípio IV):** Nenhum serviço externo pago. Todas as operações de favoritos, ordenação e contagem operam em memória e no banco PostgreSQL local.
- **Desempenho de Ordenação:** A ordenação dos itens da biblioteca na camada de serviço ou SQL respeita índices em `(userId, updatedAt)` e memória local do monólito.

## Risks / Trade-offs

- **Risco:** O usuário pode clicar repetidamente no botão de favorito gerando múltiplas requisições.
  - **Mitigação:** Atualização otimista imediata no cliente com debounce ou trava de submissão em voo.
- **Risco:** Inconsistência de rewatchCount negativo.
  - **Mitigação:** Validação estrita no backend garantindo `rewatchCount >= 0`.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `packages/shared/src/library.ts`
- `[MODIFY]` `apps/api/src/library/library.repository.ts`
- `[MODIFY]` `apps/api/src/library/library.service.ts`
- `[MODIFY]` `apps/web/src/services/library-api.client.ts`
- `[MODIFY]` `apps/web/src/components/library/edit-item-modal.tsx`
- `[MODIFY]` `apps/web/src/components/library/library-view.tsx`
- `[MODIFY]` `apps/web/src/components/library/library-grid.tsx`
- `[MODIFY]` `apps/web/src/components/library/library-table.tsx`
- `[CREATE]` `tests/personal-library-advanced.test.mjs`
