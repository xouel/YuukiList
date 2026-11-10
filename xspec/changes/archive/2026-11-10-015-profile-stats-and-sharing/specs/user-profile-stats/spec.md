# Spec Delta

## Purpose

Modelar os dados analiticos e metricas de consumo do perfil do usuario no YuukiList, consolidando tempo investido, distribuicao por categoria, genero, pais e vitrine de obras favoritas.

## ADDED Requirements

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar e retornar metricas analiticas da biblioteca pessoal do usuario, computando o total de obras concluidas, tempo estimado em horas, volumes e capitulos lidos, distribuicao proporcional por categoria, principais generos, paises de origem e media geral de notas.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel

#### Scenario: Tratamento de biblioteca recente ou sem obras concluidas
- **GIVEN** um usuario recem-cadastrado sem nenhuma obra concluida ou avaliada
- **WHEN** as metricas de perfil sao solicitadas
- **THEN** o sistema SHALL retornar contadores zerados e media nula sem produzir erros de calculo ou divisao por zero

### Requirement: Profile Showcase and Activity Feed Privacy
O sistema SHALL apresentar a vitrine de obras marcadas como favoritas pelo usuario no perfil, mantendo as anotacoes privadas, status pausados e registros sensiveis restritos ao proprio titular da conta.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuario autenticado com obras sinalizadas com o indicador de favorito
- **WHEN** o perfil do usuario e renderizado na rota /profile
- **THEN** a interface SHALL renderizar uma secao dedicada exibindo os cards das obras favoritas com suas respectivas capas e categorias

#### Scenario: Ocultacao estrita de anotacoes privadas para terceiros
- **GIVEN** uma obra na biblioteca contendo notas pessoais confidenciais do usuario
- **WHEN** os dados de perfil sao solicitados em contexto compartilhado ou de terceiros
- **THEN** o sistema SHALL omitir o campo de notas e garantir que apenas informacoes publicamente autorizadas sejam expostas

