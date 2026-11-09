# Design: 007-personal-library-ui

## Context

O YuukiList possui catálogo unificado (R1-R3), autenticação por cookies seguros HttpOnly com proteção de rotas (R4-R5) e API backend de biblioteca pessoal com desacoplamento de status e cálculo de "Em dia" (R6).
A Fase 3 do PRD e a Seção 5 do Documento Mestre de Contexto exigem a interface web da biblioteca pessoal (`/library`), permitindo visualização em grade e lista, controle de progresso rápido de 1 clique, modal para edição detalhada, abas inteligentes de status consolidado e tratamento dos 4 estados assíncronos.

## Goals / Non-Goals

**Goals:**
- Implementar a página protegida `/library` em Next.js 15 App Router utilizando `ProtectedRoute`.
- Criar o cliente HTTP `LibraryApiClient` com suporte a `credentials: 'include'` e tratamento uniforme de erros.
- Prover alternância fluida entre modo Grade (`grid`) e Lista (`list`) com persistência no `localStorage`.
- Implementar abas inteligentes consolidadas no topo que respeitam o vocabulário por formato (audiovisual vs. leitura).
- Prover botão de incremento rápido "+1" para episódios/capítulos com atualização otimista na interface.
- Exibir badge com destaque visual para a condição "Em dia" (`isUpToDate: true`).
- Criar modal acessível para ajuste de notas (0 a 10), notas pessoais privadas, alteração de status e remoção do item.
- Implementar os 4 estados de UI: skeletons de loading em grade/lista, acervo vazio com CTA para o catálogo, filtros sem resultados e erro com botão de retry.
- Garantir contraste mínimo WCAG 2.2 AA (>= 4.5:1) no tema Dark Editorial e navegação completa por teclado.

**Non-Goals:**
- Perfis públicos ou compartilhamento social de listas (biblioteca 100% privada no MVP).
- Histórico de múltiplos rewatches/releituras (backlog pós-MVP).
- Importação/exportação em lote de serviços legados (MyAnimeList, AniList).

## Decisions

1. **Abas de Status Consolidadas com Resolução Contextual**
   - **Escolha:** A interface expõe abas unificadas: "Todos", "Em Andamento", "Planejados", "Concluídos", "Pausados", "Dropados". A camada de frontend mapeia a aba selecionada para os enums canônicos (`ASSISTINDO`/`LENDO`, `QUERO_ASSISTIR`/`QUERO_LER`, `CONCLUIDO`/`ASSISTIDO`) de acordo com a categoria da obra ou o filtro de categoria selecionado.
   - **Alternativas consideradas:** Exibir seletor com todos os 8 enums canônicos misturados.
   - **Justificativa:** Cumpre a Seção 5 do Documento Mestre sem poluir a navegação com múltiplos botões redundantes.

2. **Incremento Rápido "+1" com Atualização Otimista**
   - **Escolha:** O botão "+1" no card/linha atualiza imediatamente a contagem de progresso e o badge "Em dia" no estado local do React e envia em segundo plano uma requisição `PATCH /api/v1/library/items/:mediaItemId`. Se o backend retornar erro, o estado é revertido e uma notificação de erro é apresentada.
   - **Alternativas consideradas:** Bloquear a interface exibindo spinner a cada clique.
   - **Justificativa:** Oferece sensação instantânea de agilidade para acompanhamento diário sem latência percebida.

3. **Persistência de Layout via `localStorage` com Fallback Grade**
   - **Escolha:** A chave `yuukilist_library_layout` no `localStorage` armazena `'grid'` ou `'list'`, mantendo o padrão `'grid'` para novos visitantes ou ambientes sem `localStorage`.
   - **Alternativas consideradas:** Persistir preferência no banco via API do usuário.
   - **Justificativa:** Zero latência de rede no carregamento inicial da página e conformidade com o Princípio de Custo Zero (R$ 0).

4. **Isolamento de Lógica Pura em Módulo `.ts` para Testes Sem JSX**
   - **Escolha:** Funções de cálculo de progresso otimista, mapeamento de abas para status canônico, persistência de layout e cliente de API isolados em `library-helpers.ts` e `library-api.client.ts`.
   - **Alternativas consideradas:** Importar componentes `.tsx` no test runner nativo do Node.
   - **Justificativa:** Garante 100% de execução determinística no test runner nativo sem exigir compiladores JSX em tempo de execução.

## Risks / Trade-offs

- **[Risco] Dessincronização entre UI otimista e backend se o usuário clicar "+1" repetidas vezes** → **Mitigação:** Desabilitar o botão temporariamente se uma mutação para a mesma obra estiver em voo, ou debouncer de 300ms.
- **[Risco] Filmes exibindo botão de progresso contínuo** → **Mitigação:** Componentes `LibraryCard` e `LibraryRow` verificam `item.mediaItem.category === 'FILME'` e suprimem o botão de incremento, exibindo apenas badge `ASSISTIDO` / `QUERO_ASSISTIR`.

## Migration Plan

1. Nenhuma alteração no backend ou no banco de dados relacional.
2. Atualização do `HeaderNav` para exibir link "Minha Biblioteca" quando autenticado.
3. Criação dos componentes de biblioteca em `apps/web/src/components/library/` e da rota `/library`.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/services/library-api.client.ts` — Cliente HTTP tipado da biblioteca.
- `[CREATE]` `apps/web/src/components/library/library-helpers.ts` — Mapeamento de abas, lógica otimista e persistência de layout.
- `[CREATE]` `apps/web/src/components/library/library-filters.tsx` — Abas de status, filtro de categorias e alternador de layout.
- `[CREATE]` `apps/web/src/components/library/library-card.tsx` — Card individual em modo grade com proporção 2:3.
- `[CREATE]` `apps/web/src/components/library/library-row.tsx` — Linha individual em modo lista.
- `[CREATE]` `apps/web/src/components/library/edit-item-modal.tsx` — Modal de edição de status, notas e progresso.
- `[CREATE]` `apps/web/src/components/library/library-skeleton.tsx` — Skeletons animados de carregamento em grade e lista.
- `[CREATE]` `apps/web/src/components/library/library-view.tsx` — Visualização central gerenciando estado, filtros e mutações.
- `[CREATE]` `apps/web/src/app/library/page.tsx` — Rota protegida `/library`.
- `[MODIFY]` `apps/web/src/components/layout/header-nav.tsx` — Link de navegação para a biblioteca quando autenticado.
- `[CREATE]` `tests/personal-library-ui.test.mjs` — Testes automatizados cobrindo os 9 cenários normativos.

## Data Model

### Tipos de Estado da Interface (`apps/web/src/components/library/library-helpers.ts`)
```ts
export type LibraryLayoutMode = 'grid' | 'list';

export type StatusTabKey =
  | 'ALL'
  | 'WATCHING_READING'
  | 'PLAN_TO'
  | 'COMPLETED'
  | 'PAUSED'
  | 'DROPPED';

export interface StatusTabOption {
  key: StatusTabKey;
  label: string;
}
```

## Contracts

### Cliente `LibraryApiClient`
- `list(filter: LibraryFilterDto): Promise<PaginatedResponse<LibraryItemDto>>`
- `getItem(mediaItemId: string): Promise<LibraryItemDto>`
- `addItem(dto: CreateLibraryItemDto): Promise<LibraryItemDto>`
- `updateItem(mediaItemId: string, dto: UpdateLibraryItemDto): Promise<LibraryItemDto>`
- `removeItem(mediaItemId: string): Promise<{ success: boolean }>`

## Research

- **Design Dark Editorial:** Fundo `#0B0D13`, cartões `#121520`, bordas `#1E2333`, acento ciano `#06B6D4` e badge "Em dia" com fundo esmeralda `#064E3B` e texto `#34D399` garantindo contraste > 7:1 contra o fundo escuro.
- **Acessibilidade WCAG 2.2 AA:** Todos os botões possuem rótulos `aria-label` descritivos (ex.: `"Avançar um episódio para Alquimia das Almas"`), teclas Enter/Espaço acionam controles e o modal implementa captura e devolução de foco.

