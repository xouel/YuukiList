# calendar-ui Specification

## Purpose

Fornecer a interface da rota `/calendar` no padrao Dark Editorial, permitindo navegacao intuitiva entre as tres visoes canonicas, selecao de periodos semanal e mensal, agrupamento diario e adaptacao de horarios ao fuso local.

## Requirements

### Requirement: Responsive Calendar Timeline with Day Grouping
A interface SHALL renderizar a pagina `/calendar` com uma Weekly Strip horizontal no topo com selecao interativa de dias, agrupamento cronologico dos lancamentos por turnos do dia (Manha, Tarde e Noite) e alternancia direta entre as tres abas de visualizacao.

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

### Requirement: Local Timezone Conversion and Reliability Badges
A interface SHALL converter os horarios originais dos eventos para o fuso local com destaque ao horario de transmissao, apresentar badges sutis de honestidade de data e disponibilizar acao rapida de lembrar ou seguir diretamente nos cards despoluidos.

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
