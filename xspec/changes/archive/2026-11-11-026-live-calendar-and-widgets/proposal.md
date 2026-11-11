# Proposal: Live Calendar Timeline & Widgets (R26)

> **X-Spec** · ID: `026-live-calendar-and-widgets` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

A tela de calendário (/calendar) possui suporte à Weekly Strip e turnos, porém carece de densidade analítica e funcional alinhada à referência visual (Referência 4: Programação Semanal). Faltam o cabeçalho ao vivo com os 3 KPIs consolidados (Hoje, Na Sua Fila e Eventos da Semana), a ação tátil de marcação rápida (+1 Visto) integrada à biblioteca e ao diário diretamente no card de lançamento, a organização em grade assimétrica 8+4 e a barra lateral de widgets contendo o relógio comparativo de fusos (Local vs Tóquio JST), a vitrine de estreias mais aguardadas e a exportação client-side da agenda para o padrão .iCal (.ics). Além disso, remanescem emojis visuais legados no componente (como sino e calendário) que destoam da paleta mineral Asian Editorial. Esta fatia implementa a reformulação integral da experiência de programação semanal ao vivo.

## What Changes

- **Cabeçalho ao Vivo com Faixa de 3 KPIs**:
  - Título editorial (*Programação Semanal* / *Calendário ao Vivo*);
  - Tag de temporada ativa contextual (ex.: `TEMPORADA DE OUTONO 2026`);
  - Três cartões de KPIs: *Hoje* (contagem de lançamentos do dia atual), *Na Sua Fila* (lançamentos de obras em acompanhamento ativo pelo usuário) e *Eventos da Semana* (total de transmissões registradas no período).
- **Weekly Strip com Selo "HOJE" Refinado**:
  - Destaque visual refinado na célula do dia atual com tag `HOJE`;
  - Contadores de eventos por dia com badges sutis;
  - Navegação fluida de semanas anteriores/próximas e atalho para o dia de hoje.
- **Card de Lançamento com Coluna de Horário e Ação "+1 Visto"**:
  - Coluna de horário dedicada com fuso local e indicação da hora original;
  - Ação tátil integrada `+1 Visto` para obras em acompanhamento, sincronizando o progresso via `LibraryApiClient` e emitindo histórico em `DiaryApiClient` sem redirecionamento;
  - Ação rápida de alternância `Lembrar` / `Na Agenda` com ícone SVG vetorial neutro.
- **Grade Assimétrica 8+4 e Sidebar de Widgets**:
  - *Coluna Principal (8 slots)*: linha do tempo de turnos do dia (Manhã, Tarde, Noite) e painel resumido de *Progresso Semanal*;
  - *Coluna Lateral (4 slots)*:
    - *Relógio de Fuso Múltiplo*: relógio ativo comparando horário local do navegador e horário oficial de transmissão JST (Tóquio, UTC+9);
    - *Mais Esperados da Semana*: vitrine compacta das obras mais aguardadas da grade semanal;
    - *Exportação de Calendário*: botão de download client-side de arquivo `.ics` (RFC 5545) para integração com Google Calendar, Apple Calendar e Outlook.
- **Eliminação Integral de Emojis**:
  - Substituição de todos os emojis (calendário, sino, marcas de verificação) por ícones SVG vetoriais inline na paleta Asian Editorial.

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade criada; ampliação de capacidade existente.)*

### Modified Capabilities

- `calendar-ui`: Ampliação dos requisitos de exibição e controle do calendário semanal, incorporando cabeçalho de KPIs ao vivo, ação de incremento de progresso no card, layout assimétrico 8+4, widgets laterais (relógio de fuso, mais esperados, exportação .iCal) e erradicação de emojis.

## Impact

- **Frontend**:
  - `apps/web/src/components/calendar/calendar-view.tsx`
  - `apps/web/src/components/calendar/event-card.tsx`
  - `apps/web/src/components/calendar/day-group.tsx`
  - `apps/web/src/components/calendar/calendar-helpers.ts`
  - `apps/web/src/components/calendar/calendar-header-kpis.tsx` (novo)
  - `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx` (novo)
- **Backend**: Sem alterações de endpoints (as ações utilizam os contratos existentes de biblioteca, diário e calendário).
- **Dependências**: Zero novas dependências de pacotes externos; exportação `.ics` gerada com serialização RFC 5545 pura no cliente.

## User Stories

### US1: Cabeçalho ao Vivo com KPIs e Weekly Strip com Selo HOJE (P1)
Como usuário acompanhando lançamentos sazonais, quero visualizar na abertura do calendário os 3 KPIs essenciais e a Weekly Strip com identificação clara do dia atual, para ter um panorama instantâneo da programação sem precisar percorrer toda a lista.
**Independent Test:** Acessar `/calendar`, verificar a renderização dos 3 KPIs numéricos (*Hoje*, *Na Sua Fila*, *Eventos da Semana*) e a presença do destaque visual `HOJE` no dia corrente da Weekly Strip.

### US2: Card com Coluna de Horário e Ação Rápida "+1 Visto" Integrada (P2)
Como usuário que acompanha obras ativamente, quero registrar que assisti ao episódio recém-lançado diretamente no card do calendário, para manter meu progresso atualizado sem ter que navegar até a página da obra ou da biblioteca.
**Independent Test:** Clicar no botão "+1 Visto" em um evento de obra em acompanhamento, verificar a chamada otimista para `LibraryApiClient`, a criação do evento no diário e a alteração visual do botão para estado concluído.

### US3: Sidebar Analítica com Relógio de Fuso, Mais Esperados e Exportação .iCal (P3)
Como entusiasta de cultura pop asiática, quero consultar o horário sincronizado em Tóquio, ver os destaques da semana e exportar os eventos para meu aplicativo de calendário habitual, para planejar minha rotina de consumo sem perder transmissões.
**Independent Test:** Visualizar os blocos da barra lateral, verificar o relógio exibindo horários local e JST, a lista de mais esperados e acionar a exportação gerando o arquivo `yuukilist-schedule.ics` com cabeçalhos RFC 5545 válidos.

## Success Criteria

- **SC-001**: O cabeçalho ao vivo exibe 3 KPIs consolidados (*Hoje*, *Na Sua Fila*, *Eventos da Semana*) calculados deterministicamente a partir dos eventos carregados.
- **SC-002**: A Weekly Strip destaca a data de hoje com o selo visual textual `HOJE` e atualiza a seleção do dia com filtragem imediata.
- **SC-003**: Os cards de evento contêm coluna dedicada de horário local e botão tátil `+1 Visto` com alvo mínimo de 44x44px integrado à biblioteca e ao diário.
- **SC-004**: A tela `/calendar` adota o grid assimétrico 8+4 acomodando a linha do tempo principal e a sidebar de widgets.
- **SC-005**: A sidebar renderiza o relógio com fuso local e JST Tóquio, a vitrine dos mais esperados e o botão de download client-side de `.ics` compatível com calendários de mercado.
- **SC-006**: Todos os emojis legados são substituídos por SVGs vetoriais puros, sem nenhuma regressão de contraste ou acessibilidade WCAG 2.2 AA.

## Edge Cases

- Dia sem nenhum evento programado: exibe mensagem explicativa limpa e elegante em estilo Asian Editorial sem quebras de layout.
- Usuário não autenticado: o KPI "Na Sua Fila" exibe 0 com convite sutil para entrar e o botão "+1 Visto" redireciona para login seguro.
- Eventos sem horário definido (`hasTime: false`): exibem badge "Horário a Confirmar" em vez de hora zerada.

## Out of Scope

- Sincronização bidirecional em tempo real via CalDAV com servidores externos (exportação ocorre por download sob demanda de `.ics`).
- Transmissão ou exibição de vídeo/stream ao vivo dentro da aplicação.

## Clarifications

### Session 2026-11-11
- Q: Como deve operar a ação rápida "+1 Visto" diretamente nos cards do calendário para obras em acompanhamento? → A: Incrementar o progresso diretamente via `LibraryApiClient` e registrar o evento de histórico no `DiaryApiClient`, atualizando o card para o estado concluído sem exigir navegação para fora do calendário.
- Q: Como deve ser implementada a exportação de calendário para `.iCal` (`.ics`)? → A: Geração puramente no cliente via Blob/download (`yuukilist-schedule.ics`) em padrão RFC 5545, exportando os eventos da visão ativa de forma instantânea com custo zero permanente.
- Q: Quais widgets devem compor a coluna lateral analítica (sidebar de 4 slots) do calendário? → A: Três blocos verticais: Relógio de Fuso Múltiplo (Horário Local vs. JST Tóquio), Vitrine de "Mais Esperados da Semana" e Console de Exportação/Sincronização (.iCal).

