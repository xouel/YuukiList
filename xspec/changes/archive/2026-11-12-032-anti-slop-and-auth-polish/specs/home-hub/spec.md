# home-hub Specification Delta

## MODIFIED Requirements

### Requirement: Hero Spotlight and Quick Tracking
O Home Hub SHALL apresentar Hero Spotlight sóbrio sem etiquetas mono decorativas (eyebrow), ramificando dinamicamente as ações pelo estado de autenticação: para usuário logado, exibir controles de progresso se a obra estiver no acervo ou botões de adicionar e detalhes se não estiver; para visitante anônimo, exibir chamada de boas-vindas com criar conta e explorar catálogo.

#### Scenario: Exibicao de obra em destaque para usuario autenticado com progresso no acervo
- **GIVEN** um usuário autenticado com a obra do destaque ativa em sua biblioteca
- **WHEN** o usuário visualiza a dobra superior do Home Hub
- **THEN** o sistema SHALL exibir o título, sinopse, capa e botão de incremento tátil de episódio ou capítulo sem artefatos difusos de fundo e sem etiqueta eyebrow decorativa

#### Scenario: Exibicao de obra em destaque para usuario autenticado sem a obra no acervo
- **GIVEN** um usuário autenticado que ainda não possui a obra do destaque na biblioteca
- **WHEN** a tela inicial do Home Hub é renderizada
- **THEN** o sistema SHALL exibir os botões de adicionar à lista e ver detalhes, e MUST NOT renderizar link ou botão de criar conta

#### Scenario: Apresentacao editorial de acolhimento para visitante anonimo
- **GIVEN** um visitante não autenticado acessando a aplicação
- **WHEN** a tela inicial é carregada
- **THEN** o sistema SHALL renderizar o Hero Spotlight com obra de referência editorial e botões convidativos para criar conta ou explorar o catálogo

### Requirement: Bento Sidebar and Personal Analytics
A coluna lateral do Home Hub SHALL apresentar o painel Bento unificado em fluxo contínuo com divisores discretos sem caixas repetitivas, com números e rótulos na tipografia regular com tabular-nums (sem font-mono decorativo).

#### Scenario: Renderizacao do resumo semanal e constancia de sete dias
- **GIVEN** um usuário autenticado com histórico recente de consumo
- **WHEN** a coluna lateral do Home Hub é renderizada
- **THEN** o sistema SHALL exibir o total de episódios e horas consumidos em régua integrada sem contêineres aninhados de borda dupla e a régua de constância de sete dias com números tabulares e sem font-mono decorativo

#### Scenario: Exibicao de proximos lancamentos e atividade do diario
- **GIVEN** a presença de lançamentos agendados e eventos de consumo no perfil do usuário
- **WHEN** o usuário consulta os módulos inferiores da sidebar Bento
- **THEN** o sistema SHALL listar as próximas estreias catalogadas e os registros mais recentes adicionados ao diário pessoal em seção integrada

