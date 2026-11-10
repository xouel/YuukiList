# calendar-events Specification

## Purpose

Modelar os eventos de calendario do YuukiList, suportando tipos canonicos de lancamentos, niveis de confiabilidade de datas, preservacao do fuso de origem e filtragem pelas tres visoes canonicas da aplicacao.

## Requirements

### Requirement: Canonical Calendar Event Model and Reliability Scoring
O sistema SHALL modelar eventos de calendario associados a obras do catalogo com tipos canonicos (estreia de obra, temporada, episodio, capitulo, volume, filme, especial), registrando data, fuso/regiao de origem e nivel de confiabilidade (CONFIRMED, ESTIMATED, UNCONFIRMED).

#### Scenario: Cadastro e consulta de eventos com confiabilidade explicita
- **GIVEN** eventos de lancamento de episodios e estreias associados a obras do catalogo
- **WHEN** o servico de calendario consulta os registros de um determinado periodo
- **THEN** o sistema SHALL retornar cada evento com seu identificador, tipo, data/horario original, regiao de referencia e badge de confiabilidade associado

#### Scenario: Identificacao visual de datas estimadas e nao confirmadas
- **GIVEN** um evento de lancamento cuja data foi deduzida por projecao ou fonte preliminar
- **WHEN** os dados do evento sao recuperados pela API
- **THEN** o sistema SHALL marcar o evento com o status ESTIMATED ou UNCONFIRMED e sinalizar que a informacao carece de confirmacao oficial

### Requirement: Tripartite Calendar Views and Progress Filtering
O sistema SHALL disponibilizar tres modalidades de visualizacao de calendario (Lancamentos Gerais, Acompanhamento e Minha Agenda), filtrando os eventos conforme o estado da biblioteca pessoal do usuario logado.

#### Scenario: Consulta da visao de Lancamentos Gerais do catalogo
- **GIVEN** um usuario acessando o calendario no modo de lancamentos gerais
- **WHEN** a consulta e realizada para o intervalo temporal solicitado
- **THEN** o sistema SHALL retornar todos os eventos publicos de obras do catalogo independente de estarem ou nao na biblioteca do usuario

#### Scenario: Filtragem na visao de Acompanhamento da biblioteca pessoal
- **GIVEN** um usuario autenticado com obras marcadas com status de acompanhamento ativo (Assistindo, Lendo)
- **WHEN** a visao de Acompanhamento e requisitada
- **THEN** o sistema SHALL filtrar e retornar exclusivamente eventos de proximos episodios ou capitulos das obras ativas na biblioteca do usuario

#### Scenario: Exibicao da visao Minha Agenda com obras planejadas
- **GIVEN** um usuario autenticado com obras em Quero assistir, Planejo ler ou lembretes manuais
- **WHEN** a visao Minha Agenda e solicitada
- **THEN** o sistema SHALL retornar os lancamentos e estreias previstos para as obras desejadas ou salvas na agenda
