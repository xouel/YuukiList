# Proposal: Dossier & Calendar Typography Elevation

> **X-Spec** · ID: `031-dossier-and-calendar-typography-elevation` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

As páginas do Dossiê da Obra (/items/[slug]) e do Calendário Semanal (/calendar) ainda contêm resquícios técnicos de fases anteriores: hexadecimais brutos não semânticos (#1A1820, #2B2735), dilatação residual de capa (group-hover:scale-105), sobreposição artificial de badges sobre a imagem cinematográfica e ausência da tipografia editorial refinada Shippori Mincho (font-serif) em títulos de destaque e seções chave. Além disso, a Weekly Strip e o relógio de fuso duplo carecem de alinhamento óptico estável e contadores tabulares padronizados. Esta mudança eleva a densidade estética editorial, purga cores hardcoded para tokens semânticos, erradica zoom residual e padroniza a hierarquia tipográfica.

## What Changes

- **Hierarquia Tipográfica Shippori Mincho (`font-serif`)**: Aplicação de `font-serif tracking-tight` no título principal da obra (H1), nos subtítulos de seções principais do dossiê (Sinopse, Gerenciador de Episódios, Universo da Franquia) e nos cabeçalhos da página de Calendário.
- **Despoluição e Moldura da Capa do Dossiê**: Remoção do selo sobreposto artificial flutuante ("#2 Global") da capa, eliminação do zoom residual `group-hover:scale-105`, fixação da proporção cinematográfica 2:3 rígida com moldura sutil `border-stroke-subtle`.
- **Saneamento Total de Hexadecimais para Tokens Semânticos**: Substituição de todos os valores hexadecimais brutos em `item-detail-view.tsx`, `dossier-metrics-strip.tsx`, `dossier-sidebar.tsx` e `personal-tracking-console.tsx` por tokens do tema (`bg-surface-*`, `border-stroke-*`, `text-[var(--color-text-*)]`, `accent`).
- **Alinhamento Óptico da Weekly Strip**: Padronização dos 7 botões seletores da Weekly Strip com grid uniforme em qualquer resolução, contadores com `font-mono tabular-nums` e selo textual HOJE minimalista sem oscilação dimensional.
- **Relógio de Fuso Duplo Estável**: Estilização do widget de fuso de transmissão (Local vs Tóquio JST) com tipografia mono tabular, indicador AO VIVO discreto e alinhamento geométrico sem jitter.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `catalog-browse`: refinamento do requisito do dossiê com tipografia Shippori Mincho, proporção de capa sem badges artificiais, eliminação de zoom residual e uso integral de tokens semânticos.
- `calendar-ui`: refinamento do requisito de linha do tempo com alinhamento óptico da Weekly Strip, relógio de fuso duplo estável e números tabulares padronizados.

## Impact

- `apps/web/src/components/catalog/item-detail-view.tsx`: adoção de `font-serif`, eliminação de `group-hover:scale-105`, remoção de badge sobre a capa e saneamento de cores.
- `apps/web/src/components/catalog/dossier-metrics-strip.tsx`: saneamento de hexadecimais para tokens semânticos e números tabulares.
- `apps/web/src/components/catalog/dossier-sidebar.tsx`: saneamento de hexadecimais e alinhamento tipográfico do histograma.
- `apps/web/src/components/catalog/personal-tracking-console.tsx`: saneamento de cores e física tátil nos controles.
- `apps/web/src/components/calendar/calendar-view.tsx`: alinhamento óptico da Weekly Strip e tipografia dos títulos.
- `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx`: tipografia mono tabular no relógio de fuso duplo.
- `tests/dossier-calendar-typography.test.mjs`: criação de suíte de testes automatizados para verificar ausência de hexadecimais brutos nos componentes centrais do dossiê, presença de `font-serif` em títulos e ausência de zoom na capa do dossiê.

## User Stories

### US1 — Tipografia Editorial Shippori Mincho e Despoluição da Capa do Dossiê (Priority: P1)
Como leitor e colecionador explorando o dossiê de uma obra, quero que o título principal e as seções chave utilizem tipografia serifada oriental refinada (Shippori Mincho) e que a capa cinematográfica seja apresentada limpa sem badges artificiais sobrepostos nem zoom deformador, para que a obra transmita autoridade editorial e respeito à sua arte original.

- **Why this priority:** A página de detalhes é o ápice da identidade visual da obra; selos artificiais e fontes genéricas quebram a imersão editorial.
- **Independent Test:** Inspecionar `item-detail-view.tsx` comprovando o uso de `font-serif` no H1, a ausência de `group-hover:scale-105` e a remoção de badges flutuantes sobrepostos à imagem da capa.

### US2 — Saneamento de Cores e Consistência Bimodal no Dossiê (Priority: P1)
Como usuário que alterna entre os modos Claro e Escuro, quero que todos os painéis e consoles do dossiê utilizem tokens semânticos oficiais sem cores hexadecimais fixas, para que o contraste e as superfícies permaneçam perfeitos em qualquer preferência de tema.

- **Why this priority:** Hexadecimais fixos criam áreas escuras mesmo no modo claro e quebram a coerência do design system.
- **Independent Test:** Executar varredura estática comprovando a ausência de `#1A1820`, `#2B2735` e `#201D28` em `item-detail-view.tsx` e seus subcomponentes.

### US3 — Alinhamento Óptico na Weekly Strip e Relógio de Fuso Duplo (Priority: P2)
Como acompanhante de transmissões ao vivo, quero que a Weekly Strip tenha proporções simétricas e que o relógio comparativo de fuso local vs JST apresente números tabulares sem oscilação dimensional, para que a navegação temporal seja límpida e estável.

- **Why this priority:** O tremor de caracteres mono e a assimetria na faixa semanal geram fadiga visual no uso diário do calendário.
- **Independent Test:** Renderizar a Weekly Strip e o widget de fuso duplo e validar a presença de `font-mono tabular-nums` e classes de largura balanceada.

## Success Criteria

- **SC-001**: 0% de ocorrência de `group-hover:scale-105` ou `hover:scale-105` na imagem de capa de `item-detail-view.tsx`.
- **SC-002**: O título principal (H1) em `item-detail-view.tsx` e os cabeçalhos de seções principais utilizam `font-serif` (Shippori Mincho).
- **SC-003**: 0% de ocorrência de `#1A1820`, `#2B2735` e `#201D28` em `item-detail-view.tsx`, `dossier-metrics-strip.tsx`, `dossier-sidebar.tsx` e `personal-tracking-console.tsx`.
- **SC-004**: Os seletores da Weekly Strip e o relógio de fuso duplo em `calendar-sidebar-widgets.tsx` utilizam `tabular-nums` e alinhamento geométrico estável.
- **SC-005**: 100% dos testes da suíte de regressão (`npm test`) e compilação do Next.js passam sem falhas.

## Edge Cases

- **Títulos de obras longos no Dossiê**: O título com `font-serif` deve quebrar naturalmente em linhas elegantes com `tracking-tight` e espaçamento equilibrado.
- **Modo de Alto Contraste / Tema Claro**: Todos os elementos convertidos para tokens semânticos devem respeitar `[data-theme="light"]` sem perda de legibilidade.

## Out of Scope

- Alterações em schemas de banco de dados ou contratos de endpoints REST.
- Adição de novas fontes externas não presentes na base do projeto.

## Clarifications

### Session 2026-11-12
- Q: Onde aplicar a tipografia editorial Shippori Mincho (`font-serif`)? → A: Aplicar no título principal do dossiê (H1), nos subtítulos de seções (Sinopse, Gerenciador de Episódios, Universo) e nos títulos da página de Calendário, mantendo `font-sans` nos blocos de texto/sinopse e `font-mono tabular-nums` para notas e contadores.
- Q: Como apresentar a capa da obra e badges no dossiê? → A: Remover o selo sobreposto artificial da capa ("#2 Global"), eliminar o zoom residual de hover (`group-hover:scale-105`), fixar proporção 2:3 rígida com moldura sutil (`border-stroke-subtle`) e purgar todos os hexadecimais hardcoded para tokens semânticos.
- Q: Como deve ser o alinhamento óptico na Weekly Strip e no relógio de fuso duplo? → A: Padronizar os 7 seletores da Weekly Strip com grid uniforme em qualquer resolução, contadores com `font-mono tabular-nums` e selo "HOJE" minimalista; no widget de fuso duplo, aplicar cartões com divisor sutil, tipografia mono tabular e indicador "AO VIVO" sem oscilações de layout.

