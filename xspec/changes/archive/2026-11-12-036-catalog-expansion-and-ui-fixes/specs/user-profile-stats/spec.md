# user-profile-stats Specification Delta

## MODIFIED Requirements

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a identificacao do usuario sem selos decorativos vazios e sem emojis, posicionando a vitrine de favoritos conectada a biblioteca com prioridade visual no topo do perfil, assegurando superficies semanticas e mantendo dados privados restritos.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuario autenticado com obras sinalizadas como favoritas na biblioteca pessoal
- **WHEN** o perfil do usuario e renderizado na rota /profile
- **THEN** a interface SHALL renderizar no topo a vitrine exibindo os cards das obras favoritas sincronizadas com suas respectivas capas e categorias a partir do banco de dados

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar metricas analiticas de consumo apresentando-as em formato compacto com paleta Asian Editorial e rotulos humanizados a partir do acervo completo da biblioteca.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel
