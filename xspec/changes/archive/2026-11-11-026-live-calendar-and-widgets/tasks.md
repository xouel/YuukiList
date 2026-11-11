# Tasks: 026-live-calendar-and-widgets

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD em `tests/live-calendar-and-widgets.test.mjs` cobrindo KPIs ao vivo, ação de avanço no card, layout assimétrico 8+4, widgets laterais e exportação RFC 5545 (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE)
- [x] 1.2 Implementar helpers de cálculo de KPIs, formatação de fusos múltiplos (Local e JST), serialização RFC 5545 (.ics) e extração de destaques semanais em `apps/web/src/components/calendar/calendar-helpers.ts` (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar o componente `CalendarHeaderKpis` em `apps/web/src/components/calendar/calendar-header-kpis.tsx` exibindo a tag de temporada e os 3 KPIs numéricos (Hoje, Na Sua Fila, Eventos da Semana) na paleta Asian Editorial (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE)
- [x] 2.2 [P] [US3] Implementar o componente `CalendarSidebarWidgets` em `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx` com Relógio de Fuso Duplo (Local e JST Tóquio), vitrine de Mais Esperados da Semana e botão de exportação client-side (.ics) (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal)
- [x] 2.3 [P] [US2] Atualizar o componente `EventCard` em `apps/web/src/components/calendar/event-card.tsx` com coluna de horário dedicada, botão tátil `+1 Visto` integrado à biblioteca e ao diário com alvo mínimo de 44x44px e substituição de emojis por ícones SVG (Ref: R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca)
- [x] 2.4 [US1] [US3] Reestruturar o componente principal `CalendarView` em `apps/web/src/components/calendar/calendar-view.tsx` na grade assimétrica 8+4, integrando o cabeçalho ao vivo, a sidebar de widgets, selo visual textual HOJE na Weekly Strip e erradicando emojis legados (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia)
- [x] 2.5 [US1] Ajustar o componente `DayGroup` em `apps/web/src/components/calendar/day-group.tsx` para assegurar conformidade visual com a paleta Asian Editorial e ausência de emojis (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes TDD `tests/live-calendar-and-widgets.test.mjs` e a regressão completa do monorepo (`npm test`), comprovando aprovação de 100% dos testes sem falhas (Ref: R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario)
- [x] 3.2 Validar a acessibilidade visual (anéis de foco, alvos táteis mínimos de 44x44px, contraste WCAG 2.2 AA e ausência estrita de emojis) e a integridade do build de produção Next.js (Ref: R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Responsive Calendar Timeline with Day Grouping | S:Alternancia entre as tres abas de visualizacao | 1.1, 2.4, 3.1 | apps/web/src/components/calendar/calendar-view.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento cronologico diario de lancamentos | 1.1, 2.4, 2.5, 3.1 | apps/web/src/components/calendar/calendar-view.tsx, apps/web/src/components/calendar/day-group.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Responsive Calendar Timeline with Day Grouping | S:Navegacao por Weekly Strip horizontal com selecao de dia | 1.1, 2.4, 3.1 | apps/web/src/components/calendar/calendar-view.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento de lancamentos diarios por turnos do dia | 1.1, 2.5, 3.1 | apps/web/src/components/calendar/day-group.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Responsive Calendar Timeline with Day Grouping | S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 1.1, 1.2, 2.1, 2.4, 3.1 | apps/web/src/components/calendar/calendar-header-kpis.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Responsive Calendar Timeline with Day Grouping | S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 1.1, 1.2, 2.2, 2.4, 3.1 | apps/web/src/components/calendar/calendar-sidebar-widgets.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Local Timezone Conversion and Reliability Badges | S:Formatacao automatica para o fuso local do usuario | 1.1, 1.2, 2.3, 3.1 | apps/web/src/components/calendar/calendar-helpers.ts, apps/web/src/components/calendar/event-card.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Local Timezone Conversion and Reliability Badges | S:Exibicao visual de badge de confiabilidade | 1.1, 2.3, 3.1 | apps/web/src/components/calendar/event-card.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Local Timezone Conversion and Reliability Badges | S:Card de lancamento despoluido com destaque para horario e titulo | 1.1, 2.3, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Local Timezone Conversion and Reliability Badges | S:Acao rapida de lembrar ou seguir no card de lancamento | 1.1, 2.3, 3.1 | apps/web/src/components/calendar/event-card.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Local Timezone Conversion and Reliability Badges | S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca | 1.1, 2.3, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao | 1.1, 2.4, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos | 1.1, 2.4, 2.5, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia | 1.1, 2.4, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia | 1.1, 2.5, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 1.1, 1.2, 2.1, 2.4, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 1.1, 1.2, 2.2, 2.4, 3.1 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario | 1.1, 1.2, 2.3, 3.1 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade | 1.1, 2.3, 3.1 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo | 1.1, 2.3, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de lembrar ou seguir no card de lancamento | 1.1, 2.3, 3.1 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca | 1.1, 2.3, 3.1, 3.2 | COVERED |

- **Constitution Check:** PASS (Zero custo permanente, ausência de novas dependências de terceiros, preservação estrita do monorepo, acessibilidade WCAG 2.2 AA e erradicação de emojis).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas uma mudança ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada (perguntas do Clarification Gate totalmente resolvidas).
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas de implementação e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
