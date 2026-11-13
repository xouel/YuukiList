# Spec Delta

## MODIFIED Requirements

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar metricas analiticas de consumo em lote sem consultas N+1 por item da biblioteca, apresentando-as em formato compacto com paleta Asian Editorial e rotulos humanizados a partir do acervo completo.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel

#### Scenario: Consolidacao de estatisticas do perfil em lote sem loop sequencial
- **GIVEN** um usuário autenticado possuindo dezenas de obras em sua biblioteca
- **WHEN** `ProfileService.getStats` calcula tempo investido, gêneros, países e favoritos
- **THEN** o serviço SHALL utilizar os metadados de `mediaItem` pré-carregados ou resolução em lote único (`findByIds`), evitando chamadas `findById` individuais dentro de loops

