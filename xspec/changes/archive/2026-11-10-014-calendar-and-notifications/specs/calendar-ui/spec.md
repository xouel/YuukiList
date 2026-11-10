# Spec Delta

## Purpose

Fornecer a interface da rota `/calendar` no padrao Dark Editorial, permitindo navegacao intuitiva entre as tres visoes canonicas, selecao de periodos semanal e mensal, agrupamento diario e adaptacao de horarios ao fuso local.

## ADDED Requirements

### Requirement: Responsive Calendar Timeline with Day Grouping
A interface SHALL renderizar a pagina `/calendar` com visualizacao em linha do tempo agrupada por dia, seletor de periodo temporal (semanal ou mensal) e alternancia direta entre as tres abas de visualizacao.

#### Scenario: Alternancia entre as tres abas de visualizacao
- **GIVEN** a pagina de calendario carregada na visao de Lancamentos Gerais
- **WHEN** o usuario seleciona a aba Acompanhamento ou Minha Agenda
- **THEN** a interface SHALL atualizar a lista de eventos instantaneamente exibindo apenas os itens correspondentes a visao selecionada

#### Scenario: Agrupamento cronologico diario de lancamentos
- **GIVEN** multiplos eventos de lancamento para datas distintas de uma mesma semana
- **WHEN** a grade ou lista de calendario e renderizada
- **THEN** o sistema SHALL agrupar os cards por dia da semana com cabecalhos de data claros, titulos, capas, categorias e tipo de evento

### Requirement: Local Timezone Conversion and Reliability Badges
A interface SHALL converter os horarios originais dos eventos para o fuso horario local do navegador do usuario e exibir badges distintos para niveis de confiabilidade de data.

#### Scenario: Formatacao automatica para o fuso local do usuario
- **GIVEN** um evento registrado com horario definido em UTC ou fuso da regiao de origem
- **WHEN** o card do evento e exibido na interface do calendario
- **THEN** o sistema SHALL apresentar o horario ajustado ao fuso local do navegador preservando a indicacao da regiao de origem

#### Scenario: Exibicao visual de badge de confiabilidade
- **GIVEN** um evento com confiabilidade marcada como ESTIMATED ou UNCONFIRMED
- **WHEN** o card do evento e renderizado
- **THEN** a interface SHALL exibir um badge visual com estilo de alerta sutil indicando Data Estimada ou Nao Confirmada

