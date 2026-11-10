# Proposal: Integrated Calendar & Notification Center

> **X-Spec** · ID: `014-calendar-and-notifications` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

O acompanhamento de entretenimento asiatico exige clareza sobre quando novos episodios, capitulos, volumes ou temporadas estreiam. Atualmente, os usuarios sofrem com fontes fragmentadas, fusos horarios confusos e datas imprecisas. Esta fatia implementa a pagina `/calendar` com as tres visoes canonicas (Lancamentos Gerais, Acompanhamento da Biblioteca e Minha Agenda), classificacao de confiabilidade de datas (Confirmada, Estimada, Nao confirmada), conversao para o fuso local do usuario e uma Central Interna de Notificacoes in-app com suporte a Horario Silencioso (padrao 22h-08h), permitindo que o usuario nunca perca um lancamento relevante mantendo total controle sobre sua rotina sem interrupcoes invasivas.

## What Changes

- Implementacao do modelo de eventos de calendario (`CalendarEvent`) com suporte a tipos canonicos (Estreia de Obra, Temporada, Episodio, Capitulo, Volume, Filme, Especial).
- Sistema de confiabilidade de datas com 3 estados canonicos (`CONFIRMED`, `ESTIMATED`, `UNCONFIRMED`) e preservacao do fuso de origem.
- Endpoints e servicos para as 3 visoes canonicas: Lancamentos Gerais, Acompanhamento (obras ativas da biblioteca do usuario) e Minha Agenda (obras planejadas ou lembretes).
- Pagina responsiva `/calendar` no tema Dark Editorial com alternancia de visoes, agrupamento cronologico por dia (Day-group cards) e navegacao temporal por semana e mes.
- Conversao automatica de apresentacao de horarios para o fuso local do navegador do usuario.
- Central Interna de Notificacoes (`NotificationCenter`) com icone de sino na navegacao, badge de nao lidas, lista de alertas e marcacao individual e em massa.
- Configuracao de Horario Silencioso (*Quiet Hours*, padrao 22h–08h) com entrega silenciosa no historico sem toasts sonoros ou invasivos no periodo noturno.

## Capabilities

### New Capabilities

- `calendar-events`: Modelo de dominio, repositorios e endpoints REST para consulta e filtragem de eventos de calendario nas 3 visoes canonicas e avaliacao de confiabilidade de datas.
- `calendar-ui`: Interface de usuario da rota `/calendar` no tema Dark Editorial com abas de navegacao, agrupamento por dias, selecao temporal e badges de confiabilidade e fuso local.
- `notification-center`: Central interna de notificacoes in-app com sino na barra de navegacao, contagem de nao lidas, popover de avisos de lancamentos e preferencias de horario silencioso.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/calendar.ts`: Novos tipos, enums (`CalendarEventType`, `DateReliability`, `CalendarViewMode`), interfaces de evento, notificacao e preferencias.
- `apps/api/src/calendar/`: Repositorio em memoria/Prisma, servico de agregacao de calendario e notificacoes, controller REST com endpoints `/api/v1/calendar/events` e `/api/v1/notifications`.
- `apps/api/src/app.module.ts`: Registro do novo modulo `CalendarModule`.
- `apps/web/src/app/calendar/page.tsx`: Rota da pagina do calendario.
- `apps/web/src/components/calendar/`: Componentes visuais do calendario (`calendar-view.tsx`, `day-group.tsx`, `event-card.tsx`).
- `apps/web/src/components/notifications/`: Componente de sino na barra de navegacao (`notification-bell.tsx`) e modal de configuracao de Horario Silencioso.
- `apps/web/src/server/container.ts`: Injecao e disponibilizacao dos servicos de calendario e notificacoes no container web.
- `tests/calendar-notifications.test.mjs`: Suite de testes automatizados cobrindo modelos de calendario, visoes filtradas, fuso horario, notificacoes e horario silencioso.

## User Stories

### US1 — Visualizacao Tripla do Calendario e Agenda de Lancamentos (Priority: P1)
Como usuario do YuukiList, desejo alternar entre ver os lancamentos gerais do catalogo, os proximos episodios das obras que estou acompanhando e minha agenda de estreias, para organizar meu tempo de entretenimento com facilidade.

- **Why this priority:** E a funcionalidade central de organizacao e diferenciacao do YuukiList contra rastreadores genericos.
- **Independent Test:** Executar consulta a `/api/v1/calendar/events` com `view=releases`, `view=tracking` e `view=agenda`, validando que cada modo retorna exatamente as obras correspondentes ao status da biblioteca do usuario logado.

### US2 — Confiabilidade de Datas e Fuso Horario Local (Priority: P1)
Como usuario, desejo ver com clareza se a data de lancamento de um capitulo ou dorama esta confirmada ou estimada, e visualizar o horario exato convertido para o meu relogio local, para nao criar falsas expectativas nem me confundir com fusos internacionais.

- **Why this priority:** Garante transparencia e evita frustracoes com fontes imprecisas ou datas em fusos de Tokyo/Seoul nao convertidos.
- **Independent Test:** Criar eventos com datas em UTC e niveis `ESTIMATED` e `CONFIRMED`; renderizar o card e verificar que a UI exibe o badge de estimativa e o horario formatado de acordo com o fuso local do navegador.

### US3 — Central de Notificacoes In-App com Horario Silencioso (Priority: P2)
Como usuario, desejo receber alertas discretos de novos episodios das minhas obras salvas em um sino de notificacoes, e definir um horario silencioso (ex: 22h as 08h) para nao ser incomodado durante meu descanso noturno.

- **Why this priority:** Fornece engajamento e utilidade recorrente sem violar o principio de tranquilidade e respeito a atencao do usuario.
- **Independent Test:** Simular novo lancamento de episodio para obra acompanhada; disparar notificacao durante a janela de quiet hours e validar que a notificacao e registrada no historico com flag silenciosa ativa.

## Success Criteria

- **SC-001**: O sistema disponibiliza os 7 tipos canonicos de eventos de calendario e as 3 classificacoes de confiabilidade (`CONFIRMED`, `ESTIMATED`, `UNCONFIRMED`).
- **SC-002**: A pagina `/calendar` permite alternar instantaneamente entre as 3 abas (*Lancamentos*, *Acompanhamento* e *Minha Agenda*) com dados sincronizados com a biblioteca do usuario.
- **SC-003**: Horarios de lancamento informados com precisao temporal sao exibidos convertidos para o fuso local do cliente mantendo a indicacao da regiao de origem.
- **SC-004**: A central de notificacoes in-app mantem a contagem correta de itens nao lidos, permite marcacao individual e em massa, e respeita o Horario Silencioso configurado (padrao 22h–08h).

## Edge Cases

- Eventos com data mas sem horario especifico (apenas dia): o sistema nao deve inventar horario ficticio de meia-noite nem deslocar o dia por fuso horario.
- Obra em acompanhamento cancelada ou colocada em hiato: eventos futuros associados devem ser classificados como nao confirmados ou suprimidos da visao de acompanhamento.
- Usuario sem nenhuma obra na biblioteca acessando a visao *Acompanhamento*: deve exibir empty state acolhedor orientando a adicionar obras na biblioteca.
- Eventos recebidos exatamente nos limites do horario silencioso (ex.: 22:00:00 ou 08:00:00): respeitar o intervalo fechado configurado.

## Out of Scope

- Disparo de notificacoes por e-mail ou SMS (fora do MVP).
- Integracao de push notification via Service Worker/Web Push (reservado para o PWA na fatia R16).
- Sincronizacao bidirecional com Google Calendar ou Apple Calendar via iCal/CalDAV.

## Clarifications

### Session 2026-11-10
- Q: Formato de Exibicao e Navegacao Temporal no Calendario (/calendar)? → A: Opcao A aceita — Lista/Timeline semanal e mensal agrupada por dias (Day-group cards) com seletor de periodo e navegacao temporal anterior/proximo.
- Q: Ponto de Acesso e Apresentacao da Central de Notificacoes? → A: Opcao A aceita — Sino de notificacoes (NotificationBell) com badge de nao lidas no cabecalho/navegacao, popover com lista rapida, acao "Marcar todas como lidas" e modal de preferencias/horario silencioso.
- Q: Comportamento das Notificacoes durante o Horario Silencioso (Quiet Hours)? → A: Opcao A aceita — Registro silencioso imediato: gravado no historico com atualizacao discreta do badge sem toasts invasivos ou sonoros durante a janela noturna (22h–08h).

