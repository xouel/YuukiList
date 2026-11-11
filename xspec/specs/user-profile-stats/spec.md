# user-profile-stats Specification

## Purpose

Modelar os dados analiticos e metricas de consumo do perfil do usuario no YuukiList, consolidando tempo investido, distribuicao por categoria, genero, pais e vitrine de obras favoritas.

## Requirements

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar metricas analiticas de consumo apresentando-as em formato compacto com paleta Asian Editorial e rotulos humanizados sem ofuscar a vitrine de favoritos do usuario.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel

#### Scenario: Tratamento de biblioteca recente ou sem obras concluidas
- **GIVEN** um usuario recem-cadastrado sem nenhuma obra concluida ou avaliada
- **WHEN** as metricas de perfil sao solicitadas
- **THEN** o sistema SHALL retornar contadores zerados e media nula sem produzir erros de calculo ou divisao por zero

#### Scenario: Metricas analiticas compactas com navegacao harmonizada
- **GIVEN** as estatisticas e metricas de consumo do perfil
- **WHEN** a secao analitica e renderizada na interface
- **THEN** os dados SHALL ser estruturados de forma compacta com rotulos humanizados e paleta mineral Asian Editorial

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a vitrine de obras favoritas com prioridade visual imediatamente abaixo do cabecalho de identificacao, utilizando cards em proporcao editorial 2:3 e mantendo as anotacoes privadas restritas ao titular.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuario autenticado com obras sinalizadas com o indicador de favorito
- **WHEN** o perfil do usuario e renderizado na rota /profile
- **THEN** a interface SHALL renderizar uma secao dedicada exibindo os cards das obras favoritas com suas respectivas capas e categorias

#### Scenario: Ocultacao estrita de anotacoes privadas para terceiros
- **GIVEN** uma obra na biblioteca contendo notas pessoais confidenciais do usuario
- **WHEN** os dados de perfil sao solicitados em contexto compartilhado ou de terceiros
- **THEN** o sistema SHALL omitir o campo de notas e garantir que apenas informacoes publicamente autorizadas sejam expostas

#### Scenario: Inversao de hierarquia com vitrine de favoritos no topo do perfil
- **GIVEN** um usuario acessando sua pagina de perfil na rota /profile
- **WHEN** o conteudo do perfil e renderizado na tela
- **THEN** a vitrine de favoritos SHALL aparecer posicionada com destaque acima dos blocos de metricas analiticas e configuracoes de dados

#### Scenario: Estado amigavel para vitrine sem favoritos
- **GIVEN** um usuario que ainda nao favoritou nenhuma obra
- **WHEN** o perfil e renderizado na interface
- **THEN** o sistema SHALL exibir convite visual acolhedor orientado ao catalogo sem telas de erro
