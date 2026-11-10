# Design: 014-calendar-and-notifications

## Context

O YuukiList e uma plataforma de acompanhamento de entretenimento asiatico (doramas, animes, mangas, manhwas, manhuas e filmes). Apos a integracao da navegacao global (R10), ordenacoes avancadas da biblioteca (R11), diario/spoilers (R12) e relacoes entre obras (R13), a fatia R14 implementa a rota `/calendar` e a Central Interna de Notificacoes in-app.
A arquitetura do projeto segue o modelo de Monolito Modular desacoplado (`packages/shared`, `apps/api`, `apps/web`), garantindo contratos seguros em TypeScript, conformidade com a `xspec/constitution.md` e soberania total do catalogo sem custos com APIs pagas.

## Goals / Non-Goals

**Goals:**
- Modelar eventos de calendario associados a obras do catalogo com 7 tipos canonicos (`SERIES_PREMIERE`, `SEASON_PREMIERE`, `EPISODE_RELEASE`, `CHAPTER_RELEASE`, `VOLUME_RELEASE`, `MOVIE_RELEASE`, `SPECIAL_RELEASE`).
- Fornecer 3 visoes canonicas de calendario: Lancamentos Gerais (`RELEASES`), Acompanhamento (`TRACKING`) e Minha Agenda (`AGENDA`), sincronizadas com o estado da biblioteca do usuario.
- Exibir niveis de confiabilidade de data (`CONFIRMED`, `ESTIMATED`, `UNCONFIRMED`) com estilizacao visual transparente e conversao automatica de horarios para o fuso local do cliente.
- Implementar a pagina `/calendar` com visualizacao em timeline/day-groups responsiva, seletor de semana/mes e filtros de categoria e pais.
- Desenvolver a Central Interna de Notificacoes in-app com componente `NotificationBell`, badge de nao lidas, popover de avisos e suporte a Horario Silencioso (*Quiet Hours*, padrao 22h–08h).

**Non-Goals:**
- Envio de notificacoes por e-mail ou SMS (fora do MVP).
- Web Push notifications com Service Worker de segundo plano (reservado para a fatia R16 com PWA).
- Sincronizacao bidirecional com Google Calendar ou Apple Calendar via protocolo iCal/CalDAV.

## Decisions

1. **Agrupamento Temporal e Layout da Pagina /calendar**
   - **Escolha:** Timeline cronologica agrupada por dia (Day-group cards) com seletor de periodo semanal ou mensal.
   - **Alternativas consideradas:** Grade matricial 7x5 (calendario tradicional).
   - **Justificativa:** Calendarios em grade tradicional sofrem com corte severo de texto em dispositivos moveis e comportam mal obras com titulos longos de doramas e light novels. O agrupamento por dias em cards garante legibilidade impecavel, suporte WCAG 2.2 AA e responsividade natural em telas pequenas e grandes.

2. **Inversao e Conversao de Fuso Horario Local**
   - **Escolha:** Preservar a data/horario UTC e a regiao de origem no backend; executar formatacao e conversao para o fuso local no cliente usando `Intl.DateTimeFormat`.
   - **Alternativas consideradas:** Converter no backend com base em fuso informado pelo usuario no cadastro.
   - **Justificativa:** O fuso informado pelo navegador via `Intl` reflete com exatidao o horario atual do dispositivo do usuario sem exigir configuracao manual ou lidar com diferencas sazonais de horario de verao.

3. **Arquitetura de Notificacoes e Horario Silencioso (Quiet Hours)**
   - **Escolha:** Registro silencioso imediato. Quando um evento ocorre dentro da janela de silencio configurada (ex: 22h as 08h), a notificacao e inserida no repositorio com a flag `isQuiet: true`. A interface atualiza o badge de forma discreta sem disparar sons ou toasts que perturbem o sono do usuario.
   - **Alternativas consideradas:** Enfileirar e adiar o envio para as 08h00.
   - **Justificativa:** Manter o registro disponivel caso o usuario abra o aplicativo durante a madrugada sem disparar alertas intrusivos atende com perfeicao ao principio de respeito a atencao e tranquilidade.

## Risks / Trade-offs

- **[Risco]** Eventos com apenas data definida (sem horario exato) serem distorcidos por deslocamento de fuso horario (ex: UTC 00:00 virando dia anterior as 21:00 no fuso de Brasilia). → **Mitigacao:** Campo booleano `hasTime: boolean`. Quando `hasTime === false`, a data e tratada como data de calendario pura sem aplicar conversao horaria que altere o dia.
- **[Risco]** Sobrecarga de notificacoes repetitivas para usuarios com muitas obras acompanhadas. → **Mitigacao:** Agrupamento por obra e opcao rapida de "Marcar todas como lidas" no popover da central.

## Migration Plan

- Modulo de calendario e notificacoes desacoplado; nao quebra nem altera tabelas existentes.
- Sem necessidade de migracao de banco destrutiva. O repositorio em memoria / Prisma se integra ao container existente do NestJS e Next.js.
- Rollback: Reverter para versao anterior preservando a biblioteca pessoal e o catalogo intactos.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/calendar.ts` — DTOs, enums e interfaces de calendario e notificacoes.
- `[MODIFY]` `packages/shared/src/index.ts` — Exportacao do modulo `calendar.ts`.
- `[CREATE]` `apps/api/src/calendar/calendar.repository.ts` — Repositorio em memoria com sementes de lancamentos e persistencia de notificacoes/preferencias.
- `[CREATE]` `apps/api/src/calendar/calendar.service.ts` — Servico com logica de filtragem das 3 visoes e deteccao de horario silencioso.
- `[CREATE]` `apps/api/src/calendar/calendar.controller.ts` — Endpoints REST para eventos, notificacoes e configuracoes.
- `[CREATE]` `apps/api/src/calendar/calendar.module.ts` — Modulo NestJS de calendario e notificacoes.
- `[MODIFY]` `apps/api/src/app.module.ts` — Registro do `CalendarModule`.
- `[CREATE]` `apps/web/src/services/calendar-api.client.ts` — Cliente HTTP para a API de calendario e notificacoes.
- `[CREATE]` `apps/web/src/components/calendar/calendar-view.tsx` — Componente da pagina `/calendar` com abas, timeline e filtros.
- `[CREATE]` `apps/web/src/components/calendar/day-group.tsx` — Agrupador de eventos por dia.
- `[CREATE]` `apps/web/src/components/calendar/event-card.tsx` — Card individual de evento com badges de confiabilidade e horario local.
- `[CREATE]` `apps/web/src/components/notifications/notification-bell.tsx` — Sino com contador e popover de notificacoes.
- `[CREATE]` `apps/web/src/components/notifications/quiet-hours-dialog.tsx` — Modal de configuracao de Horario Silencioso.
- `[CREATE]` `apps/web/src/app/calendar/page.tsx` — Rota Next.js da pagina do calendario.
- `[CREATE]` `apps/web/src/app/api/v1/calendar/events/route.ts` — Route handler Next.js para eventos.
- `[CREATE]` `apps/web/src/app/api/v1/notifications/route.ts` — Route handler Next.js para notificacoes.
- `[CREATE]` `apps/web/src/app/api/v1/notifications/[id]/read/route.ts` — Route handler para marcar como lida.
- `[CREATE]` `apps/web/src/app/api/v1/notifications/mark-all-read/route.ts` — Route handler para marcar todas como lidas.
- `[CREATE]` `apps/web/src/app/api/v1/notifications/preferences/route.ts` — Route handler para preferencias de horario silencioso.
- `[MODIFY]` `apps/web/src/server/container.ts` — Registro do controller e servico de calendario no container.
- `[CREATE]` `tests/calendar-notifications.test.mjs` — Suite de testes automatizados com cobertura dos 11 cenarios normativos.

## Data Model

```typescript
export enum CalendarEventType {
  SERIES_PREMIERE = 'SERIES_PREMIERE',
  SEASON_PREMIERE = 'SEASON_PREMIERE',
  EPISODE_RELEASE = 'EPISODE_RELEASE',
  CHAPTER_RELEASE = 'CHAPTER_RELEASE',
  VOLUME_RELEASE = 'VOLUME_RELEASE',
  MOVIE_RELEASE = 'MOVIE_RELEASE',
  SPECIAL_RELEASE = 'SPECIAL_RELEASE',
}

export enum DateReliability {
  CONFIRMED = 'CONFIRMED',
  ESTIMATED = 'ESTIMATED',
  UNCONFIRMED = 'UNCONFIRMED',
}

export enum CalendarViewMode {
  RELEASES = 'RELEASES',
  TRACKING = 'TRACKING',
  AGENDA = 'AGENDA',
}

export interface CalendarEvent {
  id: string;
  mediaItemId: string;
  mediaTitle: string;
  mediaSlug: string;
  mediaType: string;
  coverImage?: string;
  type: CalendarEventType;
  number?: number;
  season?: number;
  scheduledAt: string; // ISO 8601
  hasTime: boolean;
  originRegion: string;
  reliability: DateReliability;
  sourceName?: string;
  isUserTracking?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  eventId?: string;
  mediaTitle: string;
  mediaSlug: string;
  coverImage?: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isQuiet: boolean;
}

export interface NotificationPreferences {
  userId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  soundAlerts: boolean;
}
```

## Contracts

- `GET /api/v1/calendar/events?view=RELEASES&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&category=ALL`
  - Resposta: `{ events: CalendarEvent[], view: CalendarViewMode, total: number }`
- `GET /api/v1/notifications`
  - Resposta: `{ notifications: NotificationItem[], unreadCount: number }`
- `PATCH /api/v1/notifications/:id/read`
  - Resposta: `{ success: true, notification: NotificationItem }`
- `POST /api/v1/notifications/mark-all-read`
  - Resposta: `{ success: true, markedCount: number }`
- `GET /api/v1/notifications/preferences`
  - Resposta: `NotificationPreferences`
- `PUT /api/v1/notifications/preferences`
  - Corpo: `Partial<NotificationPreferences>`
  - Resposta: `NotificationPreferences`

## Research

- **Meta R$ 0 / Custo Zero Permanente (Princípio IV):** Todas as entidades utilizam tipos TypeScript nativos, persistencia local e calculos em memoria no servidor. Nao ha dependencia de APIs externas pagas nem servicos de mensageria de terceiros (Twilio, Firebase Cloud Messaging pago ou SendGrid).
- **Formatacao de Fuso Horario (Intl API):** `Intl.DateTimeFormat` e uma API padrao do ECMAScript suportada em 100% dos navegadores modernos e no runtime Node.js >= 18, sem custo de bundle e sem adicionar bibliotecas pesadas como Moment.js.
- **Estrategia de Saida (Exit Strategy):** Caso o sistema migre para push notifications externas no futuro (PWA na fatia R16), a camada de servico ja encapsula a geracao de notificacoes e a verificacao de Horario Silencioso, bastando adicionar um adaptador de envio sem refatorar a UI ou o modelo de dados.

