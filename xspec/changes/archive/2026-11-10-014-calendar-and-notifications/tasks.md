# Tasks: 014-calendar-and-notifications

## 1. Setup & Foundational

- [x] 1.1 Criar definicoes de tipos, enums (CalendarEventType, DateReliability, CalendarViewMode) e interfaces de calendario e notificacoes em `packages/shared/src/calendar.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:Canonical Calendar Event Model and Reliability Scoring / S:Cadastro e consulta de eventos com confiabilidade explicita)
- [x] 1.2 [P] Escrever testes automatizados em `tests/calendar-notifications.test.mjs` cobrindo modelos de eventos, confiabilidade, visoes triplas, fuso horario, notificacoes e horario silencioso (Ref: R:Canonical Calendar Event Model and Reliability Scoring / S:Identificacao visual de datas estimadas e nao confirmadas)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Implementar `CalendarRepository` com sementes de lancamentos e `CalendarService` com filtragem para as 3 visoes em `apps/api/src/calendar/calendar.repository.ts` e `apps/api/src/calendar/calendar.service.ts` (Ref: R:Tripartite Calendar Views and Progress Filtering / S:Consulta da visao de Lancamentos Gerais do catalogo)
- [x] 2.2 [P] [US1] Implementar logica de cruzamento com a biblioteca pessoal do usuario para as visoes Acompanhamento e Minha Agenda em `apps/api/src/calendar/calendar.service.ts` (Ref: R:Tripartite Calendar Views and Progress Filtering / S:Filtragem na visao de Acompanhamento da biblioteca pessoal)
- [x] 2.3 [US1] Adicionar suporte a marcacao de obras planejadas na agenda pessoal em `apps/api/src/calendar/calendar.service.ts` (Ref: R:Tripartite Calendar Views and Progress Filtering / S:Exibicao da visao Minha Agenda com obras planejadas)
- [x] 2.4 [US2] Implementar `CalendarController` e rotas REST `/api/v1/calendar/events` preservando data/hora original e nivel de confiabilidade em `apps/api/src/calendar/calendar.controller.ts` (Ref: R:Canonical Calendar Event Model and Reliability Scoring / S:Cadastro e consulta de eventos com confiabilidade explicita)
- [x] 2.5 [P] [US3] Implementar `NotificationRepository` e `NotificationService` com deteccao e aplicacao de Horario Silencioso em `apps/api/src/calendar/calendar.service.ts` (Ref: R:Quiet Hours and Silent Delivery Preferences / S:Entrega silenciosa durante a janela noturna de descanso)
- [x] 2.6 [US3] Implementar endpoints de notificacoes (listar, contagem nao lidas, marcar lida, marcar todas e preferencias) em `apps/api/src/calendar/calendar.controller.ts` (Ref: R:In-App Notification Center and Unread Counter / S:Marcacao individual e em massa de notificacoes como lidas)
- [x] 2.7 [US3] Criar rotas de customizacao e validacao de Horario Silencioso em `apps/api/src/calendar/calendar.controller.ts` (Ref: R:Quiet Hours and Silent Delivery Preferences / S:Customizacao de horarios silenciosos pelo usuario)
- [x] 2.8 [P] [US1] Criar cliente HTTP `calendar-api.client.ts` e registrar servicos e controllers no container web em `apps/web/src/server/container.ts` e nos route handlers Next.js (Ref: R:Tripartite Calendar Views and Progress Filtering / S:Consulta da visao de Lancamentos Gerais do catalogo)
- [x] 2.9 [US2] Implementar componentes `DayGroup` e `EventCard` com estilizacao Dark Editorial, badges de confiabilidade e formatacao no fuso local via `Intl.DateTimeFormat` em `apps/web/src/components/calendar/` (Ref: R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario)
- [x] 2.10 [P] [US1] Implementar componente principal `CalendarView` e pagina `/calendar` com abas e filtros em `apps/web/src/app/calendar/page.tsx` (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao)
- [x] 2.11 [P] [US3] Implementar componentes `NotificationBell` com badge de nao lidas, popover de notificacoes e modal `QuietHoursDialog` na interface web (Ref: R:In-App Notification Center and Unread Counter / S:Notificacao automatica de novo episodio de obra acompanhada)

## 3. Validation & Integration

- [x] 3.1 Executar a suite completa de testes automatizados `tests/calendar-notifications.test.mjs` e garantir 100% de aprovacao (Ref: R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade)
- [x] 3.2 Executar a suite global de testes do monorepo e validar build do Next.js sem regressoes (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Canonical Calendar Event Model and Reliability Scoring | S:Cadastro e consulta de eventos com confiabilidade explicita | 1.1, 2.4 | packages/shared/src/calendar.ts, apps/api/src/calendar/calendar.controller.ts | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Canonical Calendar Event Model and Reliability Scoring | S:Identificacao visual de datas estimadas e nao confirmadas | 1.2, 2.4, 2.9 | packages/shared/src/calendar.ts, apps/web/src/components/calendar/event-card.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Tripartite Calendar Views and Progress Filtering | S:Consulta da visao de Lancamentos Gerais do catalogo | 2.1, 2.8 | apps/api/src/calendar/calendar.service.ts, apps/web/src/services/calendar-api.client.ts | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Tripartite Calendar Views and Progress Filtering | S:Filtragem na visao de Acompanhamento da biblioteca pessoal | 2.2, 2.8 | apps/api/src/calendar/calendar.service.ts, apps/web/src/server/container.ts | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Tripartite Calendar Views and Progress Filtering | S:Exibicao da visao Minha Agenda com obras planejadas | 2.3, 2.8 | apps/api/src/calendar/calendar.service.ts, apps/web/src/server/container.ts | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Responsive Calendar Timeline with Day Grouping | S:Alternancia entre as tres abas de visualizacao | 2.10 | apps/web/src/components/calendar/calendar-view.tsx, apps/web/src/app/calendar/page.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento cronologico diario de lancamentos | 2.9, 2.10, 3.2 | apps/web/src/components/calendar/day-group.tsx, apps/web/src/components/calendar/calendar-view.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Local Timezone Conversion and Reliability Badges | S:Formatacao automatica para o fuso local do usuario | 2.9 | apps/web/src/components/calendar/event-card.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Local Timezone Conversion and Reliability Badges | S:Exibicao visual de badge de confiabilidade | 2.9, 3.1 | apps/web/src/components/calendar/event-card.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:In-App Notification Center and Unread Counter | S:Notificacao automatica de novo episodio de obra acompanhada | 2.5, 2.11 | apps/api/src/calendar/calendar.service.ts, apps/web/src/components/notifications/notification-bell.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:In-App Notification Center and Unread Counter | S:Marcacao individual e em massa de notificacoes como lidas | 2.6, 2.11 | apps/api/src/calendar/calendar.controller.ts, apps/web/src/components/notifications/notification-bell.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Quiet Hours and Silent Delivery Preferences | S:Entrega silenciosa durante a janela noturna de descanso | 2.5, 2.11 | packages/shared/src/calendar.ts, apps/api/src/calendar/calendar.service.ts | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Quiet Hours and Silent Delivery Preferences | S:Customizacao de horarios silenciosos pelo usuario | 2.7, 2.11 | apps/api/src/calendar/calendar.controller.ts, apps/web/src/components/notifications/quiet-hours-dialog.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Canonical Calendar Event Model and Reliability Scoring / S:Cadastro e consulta de eventos com confiabilidade explicita | 1.1, 2.4 | COVERED |
| R:Canonical Calendar Event Model and Reliability Scoring / S:Identificacao visual de datas estimadas e nao confirmadas | 1.2, 2.4, 2.9 | COVERED |
| R:Tripartite Calendar Views and Progress Filtering / S:Consulta da visao de Lancamentos Gerais do catalogo | 2.1, 2.8 | COVERED |
| R:Tripartite Calendar Views and Progress Filtering / S:Filtragem na visao de Acompanhamento da biblioteca pessoal | 2.2, 2.8 | COVERED |
| R:Tripartite Calendar Views and Progress Filtering / S:Exibicao da visao Minha Agenda com obras planejadas | 2.3, 2.8 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao | 2.10 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos | 2.9, 2.10, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario | 2.9 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade | 2.9, 3.1 | COVERED |
| R:In-App Notification Center and Unread Counter / S:Notificacao automatica de novo episodio de obra acompanhada | 2.5, 2.11 | COVERED |
| R:In-App Notification Center and Unread Counter / S:Marcacao individual e em massa de notificacoes como lidas | 2.6, 2.11 | COVERED |
| R:Quiet Hours and Silent Delivery Preferences / S:Entrega silenciosa durante a janela noturna de descanso | 2.5, 2.11 | COVERED |
| R:Quiet Hours and Silent Delivery Preferences / S:Customizacao de horarios silenciosos pelo usuario | 2.7, 2.11 | COVERED |

- **Constitution Check:** PASS (Monolito modular preservado, tipagem TypeScript estrita, Meta R$ 0, sem IA generativa, soberania de dados mantida).
- **Active Change Conflicts:** Nenhum conflito detectado (mudanca unica ativa).
- **Ambiguities / Underspecification:** Nenhuma pendencia.
- **Coverage Summary:** 100% dos requisitos e cenarios cobertos por tarefas e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
