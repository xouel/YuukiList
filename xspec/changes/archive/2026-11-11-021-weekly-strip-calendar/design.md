# Design: 021-weekly-strip-calendar

## Context

A tela de Calendário (`/calendar`) gerencia a linha do tempo de estreias, novos episódios e capítulos de entretenimento asiático (doramas, animes, mangás, manhwas e filmes) adaptada ao fuso local do usuário. Na revisão de design, foram identificados os seguintes pontos de atrito:
1. A visualização semanal no desktop era genérica e esparsa, sem uma âncora direta para os dias da semana.
2. Os cards de eventos sofriam de poluição visual severa devido ao acúmulo de até cinco micro-badges concorrentes em tons descompassados (formato, país, tipo de lançamento, tracking e confiabilidade), ofuscando o dado mais importante: o horário de transmissão.
3. Não havia distinção ou agrupamento dos eventos ao longo do dia, dificultando planejar o consumo nos períodos de folga ou horários nobres.
4. Faltava uma ação rápida de acompanhamento ("Lembrar / Seguir") diretamente no card.
5. As cores utilizavam acentos ciano genéricos em vez da paleta mineral Asian Editorial (nanquim `#121115`, superfícies `#1A1820`, bordas `#2B2735` e acento carmim `#E05347`).

## Goals / Non-Goals

**Goals:**
- Implementar uma **Weekly Strip** horizontal interativa no topo da visão semanal de `/calendar`, exibindo os 7 dias da semana (Segunda a Domingo), data numérica, badge do dia atual e contagem de eventos, permitindo focar diretamente na data desejada.
- Agrupar os lançamentos diários por **Turnos do Dia** (*Manhã*: 06:00 às 11:59, *Tarde*: 12:00 às 17:59, *Noite*: 18:00 às 05:59 ou horários a definir) com divisores sutis e contadores de obras.
- Despoluir radicalmente o `EventCard`: priorizar o horário local de transmissão com destaque tipográfico, título da obra em tipografia editorial, metadados limpos unificados (ex.: `Dorama • Ep. 8`) e badges de honestidade de data (*Confirmada* vs *Data Estimada*).
- Adicionar botão rápido e interativo de **"Lembrar / Seguir"** (ou marcar na agenda) com alvo de toque acessível e feedback visual imediato.
- Migrar todo o visual do calendário para a paleta Asian Editorial.

**Non-Goals:**
- Não alterar as telas de Perfil (`/profile`) ou Catálogo (`/items`), tratadas em outras fatias.
- Não alterar schemas de banco de dados ou endpoints da API (`/api/v1/calendar/events`), reutilizando o contrato estável existente.

## Decisions

1. **Weekly Strip Horizontal com 7 Dias e Filtro Direto**
   - **Escolha:** Renderizar um seletor em faixa horizontal (carousel/strip) com botões para Segunda a Domingo da semana ativa, informando o dia abreviado, número do mês e contagem de lançamentos do dia. Ao clicar, o usuário filtra a listagem para aquele dia específico ou redefine para a semana completa.
   - **Alternativas consideradas:**
     - Grade matricial tradicional 7x5 de calendário: descartada por ser ineficiente em telas móveis e criar espaços vazios excessivos no desktop para dias com poucos lançamentos.
     - Manter apenas botões de seta anterior/próximo: descartado por falta de contexto visual imediato dos dias da semana.
   - **Justificativa:** Proporciona visão geral instantânea da semana e controle ágil com um único clique.

2. **Agrupamento por Turnos do Dia no `DayGroup`**
   - **Escolha:** Particionar os lançamentos de cada dia em três turnos cronológicos canônicos:
     - `Manhã`: 06:00 às 11:59.
     - `Tarde`: 12:00 às 17:59.
     - `Noite`: 18:00 às 05:59 (inclui madrugada e eventos sem horário exato definido).
   - **Alternativas consideradas:**
     - Lista cronológica plana contínua: descartada por dificultar a percepção de blocos de tempo ao longo do dia.
   - **Justificativa:** Agrupa organicamente obras que competem pelo mesmo horário ou que são assistidas no almoço vs horário nobre.

3. **Despoluição Visual do `EventCard` e Destaque no Horário**
   - **Escolha:** Reestruturar o card horizontalmente:
     - Bloco esquerdo: Capa com proporção editorial 2:3.
     - Bloco central: Horário local em destaque (`14:30` em monospace/editorial sutil), título da obra com hover em carmim `#E05347`, e metadados concisos no formato `[Categoria] • [Episódio/Capítulo]` com indicação de região sutil.
     - Bloco direito: Badge de honestidade (`Confirmada` em verde sutil / `Data Estimada` em âmbar sutil) e botão interativo "Lembrar / Seguir".
   - **Alternativas consideradas:**
     - Manter múltiplos badges coloridos para cada atributo da obra: descartado pelo efeito "árvore de natal" que gerava fadiga visual.
   - **Justificativa:** Informação prioritária imediatamente legível com estética editorial refinada.

4. **Botão de Ação Rápida "Lembrar / Seguir"**
   - **Escolha:** Integrar botão acessível com ícone de sino/agenda e texto dinâmico ("Lembrar" / "Na Agenda"), fornecendo feedback tátil e atualização otimista local.
   - **Justificativa:** Evita atrito de ter que navegar até a página individual da obra apenas para salvá-la na agenda.

## Risks / Trade-offs

- **[Risco]** Eventos com fusos horários complexos ou sem horário exato (`hasTime: false`) caírem no turno errado → **Mitigação:** Tratar defensivamente: quando `hasTime` for falso, posicionar o evento em "Noite / Horário a Confirmar" com selo explicativo.
- **[Risco]** Weekly Strip quebrar layout em telas pequenas de smartphones → **Mitigação:** Habilitar rolagem horizontal suave (`overflow-x-auto scrollbar-none snap-x`) com alvos de toque adequados.

## Migration Plan

- Nenhuma alteração estrutural de banco de dados ou migração necessária.
- Alterações limitadas aos componentes em `apps/web/src/components/calendar/`.
- Testes automatizados cobrindo a lógica de turnos e faixa semanal em `tests/weekly-strip-calendar.test.mjs`.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/components/calendar/calendar-helpers.ts` — Lógica de cálculo dos 7 dias da Weekly Strip, agrupamento por turnos (Manhã, Tarde, Noite) e formatação de horários.
- `[MODIFY]` `apps/web/src/components/calendar/event-card.tsx` — Despoluição de micro-badges, destaque do horário local, título editorial, badge de honestidade e botão rápido "Lembrar / Seguir".
- `[MODIFY]` `apps/web/src/components/calendar/day-group.tsx` — Agrupamento dos eventos do dia por turnos com divisores elegantes e contadores.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-view.tsx` — Weekly Strip no topo, seleção de dia ativo, abas editoriais e paleta Asian Editorial.
- `[CREATE]` `tests/weekly-strip-calendar.test.mjs` — Testes de unidade e integração cobrindo a Weekly Strip, agrupamento por turnos e despoluição de cards.

## Data Model

Utiliza os modelos existentes de `packages/shared`:
- `CalendarEvent`: id, mediaItemId, mediaTitle, mediaSlug, mediaType, coverImage, originRegion, scheduledAt, hasTime, type, number, season, reliability (`DateReliability`), sourceName, isUserTracking, isUserPlanned.
- `DateReliability`: `CONFIRMED`, `ESTIMATED`, `UNCONFIRMED`.
- `CalendarViewMode`: `RELEASES`, `TRACKING`, `AGENDA`.

## Contracts

- **Weekly Strip Item**:
  ```ts
  interface WeeklyStripDay {
    dateStr: string;        // "YYYY-MM-DD"
    dayName: string;        // "Seg", "Ter", etc.
    dayNumber: number;      // 10, 11, etc.
    isToday: boolean;
    eventCount: number;
  }
  ```
- **Turno do Dia (`DayShift`)**:
  ```ts
  type DayShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT';
  interface ShiftGroup {
    shift: DayShiftType;
    label: string;          // "Manhã", "Tarde", "Noite"
    timeRange: string;      // "06:00 – 12:00", etc.
    events: CalendarEvent[];
  }
  ```

## Research

- **Padrão Asian Editorial:** Uso de nanquim `#121115`, superfície `#1A1820`, bordas `#2B2735`, tipografia com serifas para títulos e acento carmim `#E05347`.
- **Custo Zero:** Utilização estrita de utilitários Tailwind CSS e React standard hooks sem adição de bibliotecas externas.

