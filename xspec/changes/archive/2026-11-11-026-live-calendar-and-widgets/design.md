# Design: 026-live-calendar-and-widgets

## Context

A rota `/calendar` em `apps/web/src/components/calendar/calendar-view.tsx` implementava a Weekly Strip horizontal e o agrupamento diário por turnos, porém carecia da densidade de dashboard e dos recursos ao vivo demonstrados na referência de produto (Referência 4: Programação Semanal).
Especificamente, a interface anterior apresentava as seguintes limitações:
1. Ausência de faixa resumida de KPIs no topo (*Hoje*, *Na Sua Fila* e *Eventos da Semana*), dificultando o consumo ágil das estreias prioritárias do dia;
2. Ausência de uma ação rápida e tátil de avanço de progresso (`+1 Visto`) diretamente no card de lançamento para obras que o usuário já acompanha na biblioteca;
3. Ausência de uma coluna lateral estruturada em grade assimétrica 8+4 contendo ferramentas complementares de fuso e agenda;
4. Falta de um mecanismo de exportação compatível com calendários de mercado (`.iCal` / `.ics`) sem custos externos;
5. Presença de caracteres de emoji e símbolos legados (`📅`, `🔔`, `✓`, `◀`, `▶`) nos botões e estados vazios, em desacordo com as diretrizes da paleta mineral Asian Editorial.

Esta mudança reestrutura `/calendar` em grade assimétrica 8+4, criando o cabeçalho ao vivo com 3 KPIs, a coluna dedicada de horário e ação "+1 Visto" no card, e a sidebar de 3 widgets analíticos com exportação pura em RFC 5545.

## Goals / Non-Goals

**Goals:**
- Implementar o cabeçalho ao vivo com a tag da temporada e 3 KPIs consolidados (*Hoje*, *Na Sua Fila*, *Eventos da Semana*) no componente `CalendarHeaderKpis`.
- Destacar a célula do dia atual na Weekly Strip com o selo visual textual `HOJE` e contadores numéricos refinados.
- Enriquecer o `EventCard` com coluna dedicada de horário local e botão tátil `+1 Visto` com alvo mínimo de 44x44px (WCAG 2.2 AA), sincronizando o progresso via `LibraryApiClient` e registrando evento no `DiaryApiClient`.
- Estruturar a tela em grade assimétrica 8+4 (8 slots para a linha do tempo e 4 slots para a sidebar de widgets).
- Desenvolver o componente `CalendarSidebarWidgets` com:
  - Relógio de Fuso Duplo (horário local do navegador e fuso oficial JST Tóquio UTC+9);
  - Vitrine compacta dos "Mais Esperados da Semana";
  - Botão de exportação client-side para arquivo `.ics` em conformidade com a especificação RFC 5545 (compatível com Google Calendar, Apple Calendar e Outlook).
- Substituir 100% dos emojis e caracteres gráficos legados por ícones SVG vetoriais inline e tipografia sóbria na paleta mineral Asian Editorial (`#121115`, `#1A1820`, `#201D28`, `#2B2735`, `#E05347`, `#F4EFEA`).
- Manter total aprovação da suíte geral do monorepo (243+ testes) e implementar suíte TDD específica em `tests/live-calendar-and-widgets.test.mjs`.

**Non-Goals:**
- Implementação de servidor CalDAV ou sincronização bidirecional em tempo real com Google/Apple Calendar (a exportação é sob demanda via download de arquivo `.ics`).
- Reprodução de áudio, vídeo ou transmissões ao vivo dentro da aplicação (YuukiList atua como catálogo e agenda de acompanhamento).
- Modificação no esquema de banco de dados PostgreSQL ou novas rotas HTTP no backend NestJS nesta fatia.

## Decisions

1. **Arquitetura de Grid Assimétrica 8+4 para o Calendário**
   - **Escolha:** Dividir o layout principal em `grid grid-cols-1 lg:grid-cols-12 gap-8`:
     - Coluna Principal (`lg:col-span-8`): Weekly Strip, seleção de dia, filtros de categoria e a lista cronológica de turnos (`DayGroup` com `EventCard`).
     - Coluna Lateral (`lg:col-span-4`): `CalendarSidebarWidgets` contendo Relógio de Fuso Duplo, Mais Esperados e Exportação iCal.
   - **Alternativas consideradas:** Manter layout de coluna única centralizada com largura fixa.
   - **Justificativa:** Consistência estética e estrutural com a Home Hub (`023`), Biblioteca (`024`) e Dossiê da Obra (`025`), aproveitando o espaço em telas amplas e empilhando harmoniosamente em dispositivos móveis.

2. **Ação Rápida "+1 Visto" com Atualização Otimista no Card**
   - **Escolha:** O botão `+1 Visto` no `EventCard` verifica se a obra está na biblioteca do usuário; se estiver, calcula o próximo episódio/capítulo e dispara `libraryApi.updateItem` e `diaryApi.createEvent` em segundo plano, atualizando o estado do botão para `Visto` instantaneamente. Se a obra ainda não estiver na biblioteca, adiciona-a como `ASSISTINDO` ou `LENDO` com progresso no episódio do evento.
   - **Alternativas consideradas:** Apenas linkar para a página da obra `/items/[slug]`.
   - **Justificativa:** Permite que o usuário conclua o consumo diário de forma tátil sem fricção de navegação, espelhando a usabilidade demonstrada na referência visual.

3. **Geração Client-Side de Arquivo `.ics` (RFC 5545) com Custo Zero**
   - **Escolha:** Serializar os eventos carregados na visualização ativa (ou na agenda pessoal) em texto puro iCalendar utilizando o helper `generateIcsCalendarContent`, disparando o download de um `Blob` com MIME `text/calendar;charset=utf-8` e nome `yuukilist-schedule.ics`.
   - **Alternativas consideradas:** Criar um serviço no backend com dependência de bibliotecas pesadas de terceiros.
   - **Justificativa:** Garante custo zero permanente, execução instantânea no navegador, privacidade do usuário e portabilidade total com qualquer software de calendário moderno.

4. **Relógio de Fuso Duplo em Tempo Real sem Drift**
   - **Escolha:** Utilizar um `useEffect` com `setInterval` de 1000ms formatando simultaneamente a data atual no fuso local (`Intl.DateTimeFormat`) e no fuso `Asia/Tokyo` (`timeZone: 'Asia/Tokyo'`), exibindo horas, minutos, segundos e offset UTC.
   - **Alternativas consideradas:** Requerer serviço de NTP externo ou bibliotecas como Moment/Day.js.
   - **Justificativa:** API nativa `Intl` do JavaScript é zero dependência, precisa, consome mínimos recursos e atende aos princípios constitucionais do projeto.

5. **Ausência Estrita de Emojis e Padronização Mineral**
   - **Escolha:** Substituição integral de todos os emojis (`📅`, `🔔`, `✓`, setas unicode) por SVGs vetoriais puros com anel de foco e contraste mínimo WCAG 2.2 AA.
   - **Alternativas consideradas:** Manter emojis nos botões de lembrete e nos estados vazios.
   - **Justificativa:** Cumprimento obrigatório da restrição do usuário e harmonização visual com a estética Asian Editorial.

## Risks / Trade-offs

- **[Risco]** Eventos com datas em fusos diferentes causarem divergência no dia da semana exibido.
  - **Mitigação:** Todas as datas são normalizadas utilizando a data local calculada com base na string ISO `scheduledAt`, mantendo a indicação da região de origem (ex.: JST) no subtítulo para total transparência.
- **[Risco]** Disparo acidental de requisições múltiplas ao clicar rapidamente em `+1 Visto`.
  - **Mitigação:** O botão desabilita durante o processamento da chamada de API (`isUpdating: true`) e bloqueia cliques duplicados.
- **[Risco]** Incompatibilidade de arquivos `.ics` em calendários mais antigos.
  - **Mitigação:** Formatação rigorosa em conformidade com RFC 5545, utilizando finais de linha CRLF (`\r\n`), campos obrigatórios (`UID`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`) e timestamps em formato UTC puro (`YYYYMMDDTHHMMSSZ`).

## Migration Plan

- **Deploy:** A alteração ocorre exclusivamente no frontend web (`apps/web`), sem requerer scripts de migração de banco de dados ou novas variáveis de ambiente.
- **Rollback:** Caso necessário, a versão anterior de `calendar-view.tsx` e `event-card.tsx` pode ser revertida via git de forma segura.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/components/calendar/calendar-header-kpis.tsx` — Cabeçalho ao vivo com tag da temporada e 3 KPIs consolidados (*Hoje*, *Na Sua Fila*, *Eventos da Semana*).
- `[CREATE]` `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx` — Sidebar analítica de 4 slots com Relógio de Fuso Duplo (Local e Tóquio), Vitrine de Mais Esperados e Exportação .iCal.
- `[CREATE]` `tests/live-calendar-and-widgets.test.mjs` — Suíte de testes automatizados TDD validando 100% dos cenários normativos.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-helpers.ts` — Adicionar cálculo de KPIs, formatação de fusos múltiplos, serialização RFC 5545 (.ics) e extração de destaques semanais.
- `[MODIFY]` `apps/web/src/components/calendar/event-card.tsx` — Adicionar coluna de horário dedicada, botão tátil `+1 Visto` integrado e substituir emojis por SVGs.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-view.tsx` — Reestruturar para grade assimétrica 8+4, integrar os novos componentes, selo HOJE na Weekly Strip e erradicar emojis legados.
- `[MODIFY]` `apps/web/src/components/calendar/day-group.tsx` — Ajustar estilos e garantir total ausência de emojis.

## Data Model

Estruturas de dados tipadas em frontend para suporte ao Calendário ao Vivo:

```typescript
export interface CalendarKpisDto {
  todayCount: number;
  queueCount: number;
  weekCount: number;
  seasonLabel: string;
}

export interface DualTimezoneDisplayDto {
  localTimeString: string;
  localTimezoneLabel: string;
  jstTimeString: string;
  jstTimezoneLabel: string;
  formattedDate: string;
}

export interface WeeklyHighlightDto {
  id: string;
  mediaSlug: string;
  mediaTitle: string;
  coverImage?: string;
  scheduledTime: string;
  dayName: string;
  badge: string;
}
```

## Contracts

### Contrato de Marcação de Progresso a partir do Card
- **Atualização na Biblioteca:**
  - Método: `PUT /api/v1/library/items/:mediaItemId`
  - Payload: `{ progress: number }`
  - Resposta: `200 OK` com `LibraryItemDto`.
- **Registro no Diário:**
  - Método: `POST /api/v1/diary/events`
  - Payload: `{ mediaItemId: string, type: 'PROGRESS', episodeNumber: number, note: string }`
  - Resposta: `201 Created` com `HistoryEventDto`.

### Contrato de Exportação iCalendar (RFC 5545)
- **Formato MIME:** `text/calendar;charset=utf-8`
- **Nome do Arquivo:** `yuukilist-schedule.ics`
- **Estrutura Mínima:**
  - `BEGIN:VCALENDAR`
  - `VERSION:2.0`
  - `PRODID:-//YuukiList//Schedule v2.6//PT`
  - `BEGIN:VEVENT`
  - `UID:<id>@yuukilist.com`
  - `DTSTART:<timestamp>`
  - `DTEND:<timestamp>`
  - `SUMMARY:<title>`
  - `DESCRIPTION:<details>`
  - `END:VEVENT`
  - `END:VCALENDAR`

## Research

- **Análise de Custo Zero:**
  - Geração de arquivos `.ics` puramente em memória no navegador através de `URL.createObjectURL(new Blob(...))` sem servidor intermediário.
  - Relógio de fusos múltiplos utilizando exclusivamente o objeto nativo `Intl.DateTimeFormat` do ECMAScript.
- **Plano de Saída:**
  - A serialização iCalendar segue o padrão estrito RFC 5545, permitindo futura migração transparente para um feed de assinatura URL pública (`webcal://`) caso o backend disponibilize rotas públicas de calendário.

