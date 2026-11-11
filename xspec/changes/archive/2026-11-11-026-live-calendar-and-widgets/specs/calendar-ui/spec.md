# calendar-ui Specification Delta

## MODIFIED Requirements

### Requirement: Responsive Calendar Timeline with Day Grouping
A interface SHALL renderizar a página /calendar com cabeçalho ao vivo de três KPIs, Weekly Strip horizontal no topo com selo textual HOJE, agrupamento por turnos em grade assimétrica e barra lateral de widgets analíticos, sem emojis.

#### Scenario: Alternancia entre as tres abas de visualizacao
- **GIVEN** a pagina de calendario carregada na visao de Lancamentos Gerais
- **WHEN** o usuario seleciona a aba Acompanhamento ou Minha Agenda
- **THEN** a interface SHALL atualizar a lista de eventos instantaneamente exibindo apenas os itens correspondentes a visao selecionada

#### Scenario: Agrupamento cronologico diario de lancamentos
- **GIVEN** multiplos eventos de lancamento para datas distintas de uma mesma semana
- **WHEN** a grade ou lista de calendario e renderizada
- **THEN** o sistema SHALL agrupar os cards por dia da semana com cabecalhos de data claros, titulos, capas, categorias e tipo de evento

#### Scenario: Navegacao por Weekly Strip horizontal com selecao de dia
- **GIVEN** a visualizacao semanal do calendario carregada
- **WHEN** o usuario clica em um dia na Weekly Strip horizontal com sete dias da semana
- **THEN** a interface SHALL destacar o dia selecionado e filtrar ou posicionar os lancamentos correspondentes a data escolhida

#### Scenario: Agrupamento de lancamentos diarios por turnos do dia
- **GIVEN** multiplos eventos de lancamento cadastrados para um mesmo dia
- **WHEN** o grupo diario e renderizado na interface
- **THEN** o sistema SHALL organizar os cards em secoes de turnos: Manha (06:00 as 11:59), Tarde (12:00 as 17:59) e Noite (18:00 as 05:59)

#### Scenario: Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE
- **GIVEN** a tela /calendar carregada no navegador
- **WHEN** o cabeçalho ao vivo e a Weekly Strip são exibidos
- **THEN** a aplicação SHALL renderizar três KPIs consolidados (Hoje, Na Sua Fila, Eventos da Semana) e destacar a data atual com o selo visual textual HOJE

#### Scenario: Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal
- **GIVEN** a exibição do calendário em tela ampla
- **WHEN** a coluna lateral de quatro slots é carregada
- **THEN** a interface SHALL apresentar relógio comparativo de fuso local e JST Tóquio, vitrine dos mais esperados e botão de download client-side de arquivo .ics para calendários externos

### Requirement: Local Timezone Conversion and Reliability Badges
A interface SHALL converter os horários originais para o fuso local com coluna dedicada, exibir badges de confiabilidade, disponibilizar ação rápida de lembrar e botão tátil mais um visto integrado à biblioteca e ao diário nos cards despoluídos.

#### Scenario: Formatacao automatica para o fuso local do usuario
- **GIVEN** um evento registrado com horario definido em UTC ou fuso da regiao de origem
- **WHEN** o card do evento e exibido na interface do calendario
- **THEN** o sistema SHALL apresentar o horario ajustado ao fuso local do navegador preservando a indicacao da regiao de origem

#### Scenario: Exibicao visual de badge de confiabilidade
- **GIVEN** um evento com confiabilidade marcada como ESTIMATED ou UNCONFIRMED
- **WHEN** o card do evento e renderizado
- **THEN** a interface SHALL exibir um badge visual com estilo de alerta sutil indicando Data Estimada ou Nao Confirmada

#### Scenario: Card de lancamento despoluido com destaque para horario e titulo
- **GIVEN** um card de lancamento sendo renderizado na linha do tempo
- **WHEN** a interface apresenta as informacoes da obra
- **THEN** o card SHALL priorizar o horario local de transmissao, titulo editorial e imagem de capa, eliminando o acumulo de micro-badges concorrentes

#### Scenario: Acao rapida de lembrar ou seguir no card de lancamento
- **GIVEN** um evento de lancamento futuro exibido no calendario
- **WHEN** o usuario clica no botao rapido de lembrar ou seguir a obra
- **THEN** o sistema SHALL alternar o estado de acompanhamento da obra e fornecer feedback visual imediato

#### Scenario: Acao rapida de mais um visto no card de lancamento integrada a biblioteca
- **GIVEN** um evento de lançamento de obra que o usuário possui em acompanhamento na biblioteca
- **WHEN** o usuário aciona o botão de incremento rápido no card
- **THEN** o sistema SHALL atualizar o progresso na biblioteca, registrar o evento no diário e alterar o estado do botão para visto com alvo tátil de pelo menos 44x44px

