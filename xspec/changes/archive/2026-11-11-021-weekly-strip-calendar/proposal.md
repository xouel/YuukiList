# Proposal: Weekly Strip Calendar and Day Shifts Redesign

> **X-Spec** · ID: `021-weekly-strip-calendar` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

A visualização de lançamentos em '/calendar' apresenta atualmente uma disposição genérica e esparsa no desktop, dificultando a leitura rápida da programação semanal. Além disso, os cards de eventos sofrem de poluição visual crônica com o acúmulo de até cinco micro-badges concorrentes (formato, país, tipo de lançamento, tracking e confiabilidade), ofuscando o dado mais crítico para o usuário: o horário exato de exibição. Esta mudança implementa o padrão Asian Editorial no calendário: introduz uma Weekly Strip horizontal no topo com os dias da semana (Seg a Dom) e contadores de lançamentos, agrupa os eventos diários por turnos (Manhã, Tarde, Noite) em cards horizontais elegantes, reduz o ruído visual priorizando horário local e título com badges sutis de honestidade de data (Confirmada vs Estimada), e adiciona ação rápida de Lembrar/Seguir diretamente nos cards.

## What Changes

- **Weekly Strip Horizontal no Topo**: Adição de uma faixa horizontal de navegação semanal interativa exibindo os dias da semana (Segunda a Domingo), data numérica, indicador do dia atual e quantidade de estreias/lançamentos do dia, permitindo focar diretamente na data desejada.
- **Agrupamento por Turnos do Dia (Manhã, Tarde, Noite)**: Reorganização da exibição diária de eventos em turnos canônicos com marcadores discretos: Manhã (06:00 às 11:59), Tarde (12:00 às 17:59) e Noite (18:00 às 05:59 ou horários noturnos e a definir), melhorando a escaneabilidade dos lançamentos.
- **Despoluição Visual dos Cards de Evento**: Remoção da sobreposição caótica de micro-badges multicoloridos; elevação do horário local formatado e título da obra em destaque editorial; consolidação de formato e episódio em um metadado unificado e limpo (ex.: `Dorama • Ep. 8`).
- **Badges de Honestidade Sutis**: Estilização discreta e refinada para os selos de confiabilidade temporal (`Confirmada` vs `Data Estimada` / `Não Confirmada`), integrados organicamente ao card sem gritar visualmente.
- **Ação Rápida de Lembrar / Seguir no Card**: Botão direto e acessível nos cards de lançamentos futuros que permite ao usuário adicionar à agenda ou alternar o acompanhamento imediato sem precisar abrir telas secundárias.
- **Paleta Asian Editorial Unificada**: Aplicação das cores do design system (fundo nanquim `#121115`, superfícies `#1A1820`, bordas `#2B2735` e acento carmim `#E05347`), aposentando os tons ciano genéricos.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `calendar-ui`: Atualização dos requisitos da interface de calendário para suportar a Weekly Strip horizontal no topo, o agrupamento cronológico por turnos do dia (Manhã, Tarde e Noite), despoluição dos cards de evento com destaque em horário local e introdução da ação rápida de Lembrar/Seguir.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/components/calendar/calendar-view.tsx`: Integração da Weekly Strip horizontal interativa no topo, estilização das abas editoriais e controle do dia em foco.
  - `apps/web/src/components/calendar/day-group.tsx`: Agrupamento dos eventos do dia por turnos (Manhã, Tarde, Noite) com marcadores e contadores limpos.
  - `apps/web/src/components/calendar/event-card.tsx`: Remoção do ruído de micro-badges, destaque para horário local e tipografia editorial, inclusão do botão interativo "Lembrar / Seguir" e badge de confiabilidade sutil.
- **Banco de Dados & APIs**: Zero impacto estrutural (consome a API existente de `calendarApiClient.getEvents`).
- **Testes**: Criação da suíte de testes de calendário editorial em `tests/weekly-strip-calendar.test.mjs`.

## User Stories

### US1 — Navegação Semanal por Weekly Strip e Visualização por Turnos (Priority: P1)
Como usuário interessado nos lançamentos semanais, quero visualizar uma faixa horizontal no topo com os dias da semana para selecionar rapidamente qualquer dia e ver a programação dividida intuitivamente por turnos do dia (Manhã, Tarde, Noite).

- **Why this priority:** Substitui a grade genérica esparsa e orienta imediatamente o usuário na linha do tempo do dia.
- **Independent Test:** Carregar `/calendar` no modo semanal, navegar pelos botões da Weekly Strip, selecionar um dia e verificar se os lançamentos aparecem agrupados nos turnos Manhã, Tarde e Noite.

### US2 — Cards de Lançamento Despoluídos com Foco em Horário e Título (Priority: P1)
Como fã acompanhando estreias, quero bater o olho no card e ver claramente o horário de transmissão no meu fuso local e o título da obra, sem uma profusão de etiquetas coloridas desnecessárias.

- **Why this priority:** Resolve a principal queixa de legibilidade e poluição visual nos cards de calendário.
- **Independent Test:** Visualizar a listagem de eventos e conferir a clareza do horário em destaque, título editorial e metadados concisos de episódio/categoria sem os 5 micro-badges concorrentes.

### US3 — Ação Rápida de Lembrar/Seguir e Badges de Honestidade (Priority: P2)
Como usuário planejando minha semana de entretenimento, quero um botão rápido no próprio card para marcar que quero lembrar/seguir o lançamento e contar com badges discretos que informem se a data já foi confirmada oficialmente ou é estimada.

- **Why this priority:** Permite gerenciar a agenda diretamente no fluxo de navegação do calendário e promove transparência sobre as datas de exibição.
- **Independent Test:** Clicar no botão "Lembrar / Seguir" em um card futuro e verificar a alteração de estado visual imediata, além de conferir a presença sutil do badge de confiabilidade.

## Success Criteria

- **SC-001**: A tela de calendário semanal renderiza a Weekly Strip horizontal no topo com os 7 dias da semana (Seg a Dom), destacando o dia atual e permitindo a seleção ativa.
- **SC-002**: Cada dia com eventos exibe os lançamentos divididos pelos turnos do dia (Manhã, Tarde, Noite) com cabeçalhos limpos e cards alinhados horizontalmente.
- **SC-003**: Os cards de evento apresentam horário local proeminente, título em tipografia editorial, selo de confiabilidade sutil (Confirmada vs Estimada) e botão interativo de ação rápida (Lembrar / Seguir).

## Edge Cases

- Dias sem nenhum lançamento programado na semana exibem indicação neutra e elegante na Weekly Strip e mensagem suave caso selecionados.
- Eventos sem horário exato definido (`hasTime === false` ou sem hora) são alocados no turno apropriado ou seção "Horário a definir" sem quebrar o layout.
- Em telas estreitas de smartphones, a Weekly Strip possui rolagem horizontal fluida (touch scroll) sem quebra de linha indesejada.

## Out of Scope

- Vitrine de favoritos e reorganização do Perfil público/privado (escopo da fatia R22).
- Push notifications nativas de sistema operacional (web push service workers).

## Clarifications

### Session 2026-11-10
- Q: Quais faixas de horário definem os turnos do dia? → A: Manhã: 06:00 às 11:59; Tarde: 12:00 às 17:59; Noite: 18:00 às 05:59 (eventos sem hora fixa ficam agrupados sob Noite / Horário a Confirmar).
- Q: Como evitar a poluição visual de múltiplos micro-badges no card? → A: Manter apenas o horário de transmissão em destaque, título da obra, subtítulo conciso com categoria e número de episódio (ex.: `Anime • Ep. 12`), badge sutil de confiabilidade e o botão de ação.
- Q: O que a ação rápida "Lembrar / Seguir" faz na interface? → A: Alterna o estado local/planejado do evento (adicionando à "Minha Agenda" ou sinalizando acompanhamento) com feedback visual imediato em botão com alvo de toque acessível.

