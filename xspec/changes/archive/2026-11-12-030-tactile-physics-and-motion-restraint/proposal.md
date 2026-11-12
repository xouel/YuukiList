# Proposal: Tactile Physics & Motion Restraint

> **X-Spec** · ID: `030-tactile-physics-and-motion-restraint` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

A interface do YuukiList ainda utiliza animações de hover genéricas com dilatação agressiva (hover:scale-105), que geram instabilidade visual, sobrecarregam a GPU e colidem com o refinamento editorial. Além disso, elementos interativos carecem de resposta física de pressão no toque (active:scale-[0.98]), e contadores numéricos sofrem de layout jitter por utilizarem larguras proporcionais variáveis. Esta mudança aplica as diretrizes de física tátil da Apple e Emil Kowalski, eliminando escalas excessivas, introduzindo micro-pressão imediata no clique e generalizando números tabulares (tabular-nums).

## What Changes

- **Erradicação do zoom agressivo `hover:scale-105`**: substituição da dilatação dimensional de capas em `MediaCard`, `LibraryCard`, `EventCard` e `HeroSpotlight` por realce sutil de borda (`hover:border-stroke-accent`) e sombra suave.
- **Resposta física de micro-pressão no toque (`:active:scale-[0.98]`)**: aplicação de feedback elástico imediato com transição rápida (`duration-75`) em botões de ação rápida (+1 episódio, adicionar obra, favoritos) e nos próprios cards clicáveis inteiros.
- **Generalização de números tabulares (`tabular-nums font-mono`)**: padronização em todos os contadores de episódios/capítulos, notas numéricas (★ 9.6), relógio do calendário e contadores de filtros para erradicar oscilações horizontais (*layout jitter*).
- **Contenção e refinamento de transições**: padronização de curvas de desaceleração e transições de opacidade/deslocamento suaves para gavetas e menus flutuantes.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `catalog-browse`: refinamento do requisito de ações rápidas e exploração com física tátil, números tabulares e ausência de hover zoom agressivo.
- `personal-library-ui`: refinamento do requisito de acompanhamento rápido e modal detalhado com micro-pressão no toque e números tabulares no progresso.
- `calendar-ui`: refinamento do requisito de conversão de fuso e badges com números tabulares nos horários e feedback tátil em ações rápidas.

## Impact

- `apps/web/src/components/catalog/media-card.tsx`: eliminação de `hover:scale-105`, adição de `:active:scale-[0.98]` e `tabular-nums` na nota.
- `apps/web/src/components/library/library-card.tsx`: eliminação de `hover:scale-105`, adição de `:active:scale-[0.98]` no card e nos botões táteis.
- `apps/web/src/components/calendar/event-card.tsx`: eliminação de `hover:scale-105`, adição de `:active:scale-[0.98]` e `tabular-nums` nos horários.
- `apps/web/src/components/home/hero-spotlight.tsx`: eliminação de `hover:scale-105` na capa e refinamento tátil.
- `tests/tactile-physics.test.mjs`: criação de suite de testes automatizados para verificar ausência de `hover:scale-105`, presença de `:active:scale-[0.98]` e uso de `tabular-nums`.

## User Stories

### US1 — Física Tátil e Resposta Elástica Imediata (Priority: P1)
Como usuário interagindo com a plataforma através do mouse ou toque, quero que botões de ação rápida e cards interativos respondam com uma sutil compressão imediata no clique (`active:scale-[0.98]`), para que cada interação passe uma sensação tátil de software nativo premium.

- **Why this priority:** A ausência de feedback físico imediato cria sensação de latência e distanciamento entre o toque e a resposta do sistema.
- **Independent Test:** Renderizar `MediaCard`, `LibraryCard` e `EventCard` e verificar a presença de classes de micro-pressão ativa (`active:scale-[0.98]` ou equivalente tátil).

### US2 — Erradicação de Zoom Agressivo nas Capas (Priority: P1)
Como colecionador visual, quero que ao passar o mouse sobre as capas das obras elas se destaquem por contraste e elevação suave de borda sem se deformarem ou expandirem para fora de seus limites, para que o ritmo da grade permaneça estável e confortável.

- **Why this priority:** O zoom de 5% polui o alinhamento visual da página e causa cintilações desnecessárias.
- **Independent Test:** Inspecionar o código de `MediaCard`, `LibraryCard`, `EventCard` e `HeroSpotlight` e comprovar a total ausência de `group-hover:scale-105` e `hover:scale-105`.

### US3 — Alinhamento Estável com Números Tabulares (Priority: P2)
Como leitor de estatísticas e notas, quero que números de episódios, notas e horários mantenham espaçamento horizontal estável sem oscilar quando os valores se alteram, para que a leitura de dados numéricos seja limpa e rigorosa.

- **Why this priority:** Dígitos proporcionais variam de largura gerando pequenos saltos desconfortáveis no layout.
- **Independent Test:** Inspecionar os elementos numéricos de `MediaCard`, `LibraryCard` e `EventCard` e validar a presença de `tabular-nums`.

## Success Criteria

- **SC-001**: 0% de ocorrência da classe `hover:scale-105` ou `group-hover:scale-105` nos componentes centrais de cards (`media-card.tsx`, `library-card.tsx`, `event-card.tsx`, `hero-spotlight.tsx`).
- **SC-002**: Os cards navegáveis e botões de ação primária (+1 episódio, adicionar obra, favoritar) possuem resposta de micro-pressão ativa (`:active:scale-[0.98]` ou `active:scale-95`).
- **SC-003**: Contadores de progresso, notas e horários nos cards adotam a classe tipográfica `tabular-nums`.
- **SC-004**: 100% dos testes da suite global (`npm test`) continuam passando sem qualquer quebra de regressão.

## Edge Cases

- **Navegação exclusiva por teclado**: Elementos com `:active` devem preservar o anel de foco visível `:focus-visible` intacto sem colisão de sombras.
- **Diretiva `prefers-reduced-motion`**: As micro-transições táteis devem respeitar o modo de movimento reduzido definido no sistema operacional.

## Out of Scope

- Bibliotecas de animação 3D pesadas ou física de partículas.
- Alterações em contratos de APIs do backend ou esquemas de banco de dados.

## Clarifications

### Session 2026-11-12
- Q: Como a resposta de hover dos cards de capas e eventos deve se comportar visualmente? → A: Eliminar completamente o zoom `hover:scale-105` em todas as capas, adotando realce sutil de borda e sombra suave.
- Q: Quais elementos interativos devem receber a resposta elástica tátil imediata de toque/clique? → A: Aplicar `:active:scale-[0.98]` com `duration-75` em todos os botões de ação rápida (+1 episódio, favoritar, adicionar obra, filtros) e nos próprios cards clicáveis inteiros (`role="button"`).
- Q: Onde a classe tipográfica `tabular-nums` deve ser padronizada? → A: Adicionar `tabular-nums font-mono` em todos os contadores de episódios/capítulos, notas numéricas (ex.: ★ 9.6), relógio do calendário e contadores de itens de filtros.

