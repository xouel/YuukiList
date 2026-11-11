# Tasks: 021-weekly-strip-calendar

## 1. Setup & Baseline

- [x] 1.1 Criar suíte de testes TDD em `tests/weekly-strip-calendar.test.mjs` cobrindo geração da Weekly Strip (7 dias com contagens e indicador de hoje), agrupamento de eventos por turnos do dia (Manhã, Tarde, Noite), despoluição de cards com destaque de horário e ação rápida Lembrar/Seguir (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia)

## 2. Core Implementation (US1, US2, US3)

- [x] 2.1 [P] [US1] Criar módulo auxiliar `apps/web/src/components/calendar/calendar-helpers.ts` com funções para gerar os 7 dias da Weekly Strip semanal e particionar eventos por turnos do dia (Manhã: 06h-12h, Tarde: 12h-18h, Noite: 18h-06h/sem horário) (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia)
- [x] 2.2 [P] [US1] Atualizar `apps/web/src/components/calendar/calendar-view.tsx` com a Weekly Strip horizontal interativa no topo, exibição dos dias de Segunda a Domingo com contadores e suporte à seleção ativa de dia (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia)
- [x] 2.3 [US1] Integrar o agrupamento cronológico de datas e alternância entre as três abas de visualização (Lançamentos Gerais, Acompanhamento e Minha Agenda) com estilização Asian Editorial em `calendar-view.tsx` (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao)
- [x] 2.4 [US1] Garantir agrupamento cronológico dos lançamentos diários com cabeçalhos refinados e contagem de itens em `calendar-view.tsx` e `day-group.tsx` (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos)
- [x] 2.5 [P] [US1] Atualizar `apps/web/src/components/calendar/day-group.tsx` para particionar e renderizar os cards em seções visuais de turnos (Manhã, Tarde e Noite) com marcadores sutis e contadores por turno (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia)
- [x] 2.6 [P] [US2] Atualizar `apps/web/src/components/calendar/event-card.tsx` eliminando a sobreposição de múltiplos micro-badges, conferindo destaque tipográfico ao horário local e título da obra em tipografia editorial (Ref: R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo)
- [x] 2.7 [US2] Assegurar formatação automática precisa do horário para o fuso local do navegador preservando a indicação sutil da região de origem em `event-card.tsx` (Ref: R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario)
- [x] 2.8 [US3] Atualizar a renderização de badges de confiabilidade em `event-card.tsx` para estilo de honestidade discreto e refinado (Confirmada vs Data Estimada vs Não Confirmada) (Ref: R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade)
- [x] 2.9 [US3] Implementar o botão interativo de ação rápida "Lembrar / Seguir" no `event-card.tsx` com feedback visual imediato e alvo de toque acessível (Ref: R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de lembrar ou seguir no card de lancamento)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados `tests/weekly-strip-calendar.test.mjs` e a suíte completa de regressão do projeto (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia)
- [x] 3.2 Executar build de produção do frontend (`npm --prefix apps/web run build`) e validar renderização no servidor daemon (Ref: R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Responsive Calendar Timeline with Day Grouping | S:Alternancia entre as tres abas de visualizacao | 2.3 | apps/web/src/components/calendar/calendar-view.tsx | tests/weekly-strip-calendar.test.mjs, tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento cronologico diario de lancamentos | 2.4 | apps/web/src/components/calendar/calendar-view.tsx, apps/web/src/components/calendar/day-group.tsx | tests/weekly-strip-calendar.test.mjs, tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Responsive Calendar Timeline with Day Grouping | S:Navegacao por Weekly Strip horizontal com selecao de dia | 1.1, 2.2 | apps/web/src/components/calendar/calendar-view.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento de lancamentos diarios por turnos do dia | 2.1, 2.5, 3.1 | apps/web/src/components/calendar/day-group.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Local Timezone Conversion and Reliability Badges | S:Formatacao automatica para o fuso local do usuario | 2.7 | apps/web/src/components/calendar/event-card.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/weekly-strip-calendar.test.mjs, tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Local Timezone Conversion and Reliability Badges | S:Exibicao visual de badge de confiabilidade | 2.8 | apps/web/src/components/calendar/event-card.tsx | tests/weekly-strip-calendar.test.mjs, tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Local Timezone Conversion and Reliability Badges | S:Card de lancamento despoluido com destaque para horario e titulo | 2.6, 3.2 | apps/web/src/components/calendar/event-card.tsx, apps/web/src/components/calendar/calendar-helpers.ts | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Local Timezone Conversion and Reliability Badges | S:Acao rapida de lembrar ou seguir no card de lancamento | 2.9 | apps/web/src/components/calendar/event-card.tsx | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

### Coverage Table

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| Responsive Calendar Timeline with Day Grouping / Alternancia entre as tres abas de visualizacao | 2.3 | Coberto |
| Responsive Calendar Timeline with Day Grouping / Agrupamento cronologico diario de lancamentos | 2.4 | Coberto |
| Responsive Calendar Timeline with Day Grouping / Navegacao por Weekly Strip horizontal com selecao de dia | 1.1, 2.2 | Coberto |
| Responsive Calendar Timeline with Day Grouping / Agrupamento de lancamentos diarios por turnos do dia | 2.1, 2.5, 3.1 | Coberto |
| Local Timezone Conversion and Reliability Badges / Formatacao automatica para o fuso local do usuario | 2.7 | Coberto |
| Local Timezone Conversion and Reliability Badges / Exibicao visual de badge de confiabilidade | 2.8 | Coberto |
| Local Timezone Conversion and Reliability Badges / Card de lancamento despoluido com destaque para horario e titulo | 2.6, 3.2 | Coberto |
| Local Timezone Conversion and Reliability Badges / Acao rapida de lembrar ou seguir no card de lancamento | 2.9 | Coberto |

### Verification Checks

1. **Coverage Gaps:** 100% dos requisitos normativos e cenários da especificação delta estão cobertos por tarefas com IDs numéricos válidos e mapeados na Traceability Matrix de 9 colunas.
2. **Constitution Check:** Cumprimento rigoroso do custo zero, utilizando apenas utilitários Tailwind CSS e React padrão sem novas dependências.
3. **Inconsistency Check:** Nomenclaturas de componentes (`CalendarView`, `DayGroup`, `EventCard`, `calendar-helpers.ts`) e modelos (`CalendarEvent`, `DateReliability`) consistentes em todos os artefatos.
4. **Sub-specification Check:** Todas as tarefas trazem caminhos exatos de arquivos e referências normativas completas sem placeholders.
5. **Duplication Check:** Não há tarefas nem cenários duplicados.
6. **Active Conflicts Check:** Nenhuma outra mudança ativa concorre com a fatia 021.
