# Spec Delta: home-hub

## MODIFIED Requirements

### Requirement: Hero Spotlight and Quick Tracking
O Home Hub SHALL apresentar na área nobre um Hero Spotlight com acabamento editorial límpido sem iluminação difusa artificial circular (blur-3xl), contendo a obra prioritária com progresso proporcional e incremento tátil rápido, ou chamada de acolhimento para visitantes.

#### Scenario: Exibicao de obra em destaque para usuario autenticado
- **GIVEN** um usuário autenticado com pelo menos uma obra ativa em sua biblioteca
- **WHEN** o usuário visualiza a dobra superior do Home Hub
- **THEN** o sistema SHALL exibir o título, sinopse, capa ampliada e botão de incremento tático de episódio ou capítulo sem artefatos difusos de fundo

#### Scenario: Apresentacao editorial de acolhimento para visitante anonimo
- **GIVEN** um visitante não autenticado acessando a aplicação
- **WHEN** a tela inicial é carregada
- **THEN** o sistema SHALL renderizar o Hero Spotlight com obra de referência editorial e botões convidativos para criar conta ou explorar o catálogo

### Requirement: Bento Sidebar and Personal Analytics
A coluna lateral do Home Hub SHALL apresentar o painel Bento desencaixado com métricas semanais em régua integrada sem sub-cards aninhados de bordas duplas, régua visual de constância diária de sete dias, próximas estreias e feed do diário pessoal.

#### Scenario: Renderizacao do resumo semanal e constancia de sete dias
- **GIVEN** um usuário autenticado com histórico recente de consumo
- **WHEN** a coluna lateral do Home Hub é renderizada
- **THEN** o sistema SHALL exibir o total de episódios e horas consumidos em régua integrada sem contêineres aninhados de borda dupla e a régua de constância de sete dias

#### Scenario: Exibicao de proximos lancamentos e atividade do diario
- **GIVEN** a presença de lançamentos agendados e eventos de consumo no perfil do usuário
- **WHEN** o usuário consulta os módulos inferiores da sidebar Bento
- **THEN** o sistema SHALL listar as próximas estreias catalogadas e os registros mais recentes adicionados ao diário pessoal

