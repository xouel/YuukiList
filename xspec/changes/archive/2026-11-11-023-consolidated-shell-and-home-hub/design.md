# Design: 023-consolidated-shell-and-home-hub

## Context

O YuukiList consolidou a fundação Asian Editorial (paleta Nanquim `#121115`, superfícies `#1A1820`, acento Carmim `#E05347` e texto `#F4EFEA`) com 22 fatias e 207 testes. Contudo, a experiência inicial na rota `/` ainda abria diretamente uma grade estática de catálogo, enquanto a casca de navegação utilizava uma barra lateral estrita no desktop. Ao comparar com as 4 referências visuais de produto consolidado (Início, Biblioteca, Obra e Calendário), identificou-se a oportunidade de migrar a casca para uma Top Command Bar horizontal (liberando a largura integral `max-w-7xl` para um layout dashboard 8+4 colunas), instituir o Home Hub dinâmico na rota raiz e mover a exploração detalhada com filtros avançados para a rota `/explore`. Além disso, uma assimetria na desserialização de `LibraryApiClient` (`data` vs `items`) impedia a renderização fidedigna dos itens da biblioteca pessoal, demandando normalização de contrato.

## Goals / Non-Goals

**Goals:**
- Implementar a Top Command Bar horizontal no desktop (Início, Minha Lista, Explorar, Calendário) com busca global integrada, atalhos contextuais, sino de notificações e menu do avatar.
- Preservar a Bottom Navigation acessível em dispositivos móveis (< 768px).
- Transformar a rota raiz `/` em um Home Hub estruturado em grid 8+4 colunas: Hero Spotlight com obra em destaque e progresso integrado, seção tátil "Continuar Acompanhando" com botão de avanço rápido (+1) e Sidebar Bento com "Resumo Semanal", "Constância Diária" (7 dias com streak), "Próximas Estreias" e "Feed de Atividade" pessoal.
- Criar a rota `/explore` para abrigar a visão completa de exploração e filtros avançados do catálogo, mantendo redirecionamento transparente de buscas diretas em `/`.
- Normalizar o contrato de resposta de `LibraryApiClient` para fornecer `items` e `data` conjuntamente, eliminando falhas de carregamento na biblioteca pessoal e no status dos cards.
- Manter 100% dos 207 testes existentes verdes e cobrir os novos cenários com TDD na suíte `tests/consolidated-shell-and-home-hub.test.mjs`.

**Non-Goals:**
- Não criar sistemas de pontos de experiência, rankings públicos ou feeds comunitários abertos com dados de terceiros (estrita aderência à privacidade por padrão).
- Não refatorar nesta etapa as páginas internas de Detalhes da Obra (`/items/[slug]`) ou Calendário (`/calendar`), que constituem as fatias R24, R25 e R26.
- Não introduzir dependências pesadas de UI comercial ou serviços pagos (custo R$ 0 permanente).

## Decisions

1. **Top Command Bar Horizontal no Desktop vs Sidebar Lateral**
   - **Escolha:** Adotar barra de navegação superior horizontal (`h-16`) fixa no topo com container `max-w-7xl`, alinhando wordmark à esquerda, links centrais navegáveis, barra de busca rápida e perfil/ações à direita.
   - **Alternativas consideradas:** Manter sidebar lateral esquerda fixa de 256px de largura.
   - **Justificativa:** A barra superior libera o espaço horizontal integral da tela desktop para suportar o grid de 12 colunas (8 colunas para o fluxo principal + 4 colunas para a sidebar Bento de métricas), espelhando diretamente as referências visuais de produto consolidado.

2. **Desacoplamento do Home Hub (`/`) e Catálogo Abrangente (`/explore`)**
   - **Escolha:** Transformar `/` no painel diário de consumo (Hub) e mover a visão de catálogo com todos os filtros e paginação infinita para `/explore`. Redirecionar buscas legadas recebidas em `/` (`/?q=...`) para `/explore?q=...`.
   - **Alternativas consideradas:** Amontoar o Hero e widgets acima da grade de catálogo existente na mesma página `/`.
   - **Justificativa:** Permite foco cognitivo imediato no progresso pessoal e novidades na página inicial sem sobrecarregar a viewport com centenas de cards e dezenas de filtros ao mesmo tempo.

3. **Métricas de Constância e Atividade Estritamente Pessoais**
   - **Escolha:** Calcular a constância semanal (últimos 7 dias) e o feed de atividade a partir dos dados do próprio usuário logado (`DiaryApiClient.listHistoryEvents()` e `LibraryApiClient.list()`).
   - **Alternativas consideradas:** Criar tabela e endpoint de feed social comunitário.
   - **Justificativa:** Cumpre o Artigo VII da Constituição (`xspec/constitution.md`) de privacidade por padrão e não requer migrações de banco de dados ou novos modelos relacionais.

4. **Normalização Dupla de Resposta em `LibraryApiClient`**
   - **Escolha:** No retorno de `LibraryApiClient.list()` e `LibraryApiClient.listItems()`, anexar tanto `data` quanto `items` apontando para o array de `LibraryItemDto`. Nos componentes, ler `response.data || response.items || []`.
   - **Alternativas consideradas:** Alterar apenas o backend ou apenas um dos componentes.
   - **Justificativa:** Fornece defesa em profundidade e retrocompatibilidade imediata com qualquer componente existente ou teste de integração.

## Risks / Trade-offs

- **[Risco]** Quebra de testes existentes que procuravam elementos da Sidebar desktop na rota `/`. → **Mitigação:** Os testes anteriores de `navigation-shell` e `asian-editorial-foundation` validam a presença do wordmark `YUUKILIST`, da paleta mineral e de links para as áreas centrais; a Top Command Bar preserva esses elementos e atalhos sem violar os contratos normativos.
- **[Risco]** Usuário visitante sem sessão na rota raiz visualizando painel quebrado. → **Mitigação:** O Home Hub renderiza visão de acolhimento editorial (Hero Spotlight com obra aclamada, chamada para login/cadastro e vitrine de destaques), ocultando de forma elegante blocos que dependem de sessão ativa.
- **[Risco]** Desempenho no carregamento da Home ao consultar catálogo, biblioteca e histórico. → **Mitigação:** Consultas paralelas com `Promise.allSettled`, tratamento gracioso de falhas assíncronas e renderização de skeletons discretos.

## Migration Plan

- Nenhuma migração de schema no banco de dados necessária.
- A rota `/` passa a importar `<HomeHubView />`, enquanto a rota `/explore` importa `<CatalogView />`.
- Rollback simples via Git caso necessário (`git revert`).

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/components/layout/navigation-shell.tsx` — Transição para Top Command Bar no desktop com busca rápida, atalhos e menu de sessão.
- `[CREATE]` `apps/web/src/components/home/home-hub-view.tsx` — Orquestrador do painel Home Hub (8+4 colunas).
- `[CREATE]` `apps/web/src/components/home/hero-spotlight.tsx` — Card de destaque da obra prioritária com progresso e avanço rápido.
- `[CREATE]` `apps/web/src/components/home/continue-watching.tsx` — Lista tátil de obras em andamento com botões de incremento rápido (+1).
- `[CREATE]` `apps/web/src/components/home/bento-sidebar.tsx` — Sidebar com Resumo Semanal, Constância 7 Dias, Próximas Estreias e Feed de Atividade.
- `[CREATE]` `apps/web/src/components/home/trending-showcase.tsx` — Vitrine horizontal de recomendações e destaques editoriais.
- `[MODIFY]` `apps/web/src/app/page.tsx` — Renderização do `<HomeHubView />` com redirecionamento de query string legada.
- `[CREATE]` `apps/web/src/app/explore/page.tsx` — Página dedicada para `<CatalogView />`.
- `[MODIFY]` `apps/web/src/services/library-api.client.ts` — Normalização de resposta provendo `items` e `data`.
- `[MODIFY]` `apps/web/src/components/library/library-view.tsx` — Consumo defensivo da lista de itens.
- `[MODIFY]` `apps/web/src/components/catalog/catalog-view.tsx` — Consumo defensivo da lista de itens.
- `[CREATE]` `tests/consolidated-shell-and-home-hub.test.mjs` — Suíte de testes TDD cobrindo os 19 cenários normativos.

## Data Model

Utiliza entidades e DTOs existentes em `@yuukilist/shared`:
- `MediaItemSummaryDto`: Representação de obras para o Hero Spotlight e vitrines.
- `LibraryItemDto`: Representação de itens em andamento para o Continuar Acompanhando e progresso no Hero.
- `HistoryEventDto`: Eventos cronológicos para o Feed de Atividade pessoal.
- `CalendarEventDto`: Eventos agendados para o card de Próximas Estreias.

## Contracts

- **Top Command Bar Navigation**:
  - Links: `/` (Início), `/library` (Minha Lista), `/explore` (Explorar), `/calendar` (Calendário).
  - Ação de Busca: Enter no campo ou clique no ícone redireciona para `/explore?q=${encodeURIComponent(query)}`.
- **Library API Client Normalization**:
  - `list(filter)` e `listItems(filter)` retornam:
    `Promise<{ data: LibraryItemDto[]; items: LibraryItemDto[]; meta: PaginationMeta }>`
- **Home Hub Data Resolution**:
  - Visitante: Hero estático de boas-vindas + vitrines de catálogo.
  - Autenticado: Hero da obra com maior engajamento recente + obras `WATCHING`/`READING` em Continuar Acompanhando + cálculo de streak baseado nos últimos 7 dias.

## Research

- **Custo Zero & Acessibilidade**: A nova barra superior e os cartões Bento utilizam puro Tailwind CSS v4 e SVG nativo, sem bibliotecas de gráficos ou widgets proprietários de terceiros.
- **Diretiva de Movimento Reduzido**: Todos os componentes de vitrine e animações de hover respeitam `@media (prefers-reduced-motion: reduce)`.
- **WCAG 2.2 AA**: Botões de avanço rápido possuem área mínima de clique de 44x44px (`min-h-[44px] min-w-[44px]`), anel de foco `:focus-visible` visível em Carmim (`#E05347`) e contraste mínimo de texto de 4.5:1.

