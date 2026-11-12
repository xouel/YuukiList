# home-hub Specification

## MODIFIED Requirements

### Requirement: Hero Spotlight and Quick Tracking
O Home Hub SHALL apresentar Hero Spotlight sóbrio sem etiquetas mono decorativas (eyebrow), ramificando dinamicamente as ações pelo estado de autenticação: para usuário logado, exibir controles de progresso se a obra estiver no acervo ou botões de adicionar e detalhes se não estiver, com o botão primário exibindo um único ícone de adição e o texto limpo 'Adicionar à Lista'; para visitante anônimo, exibir chamada de boas-vindas com criar conta e explorar catálogo.

#### Scenario: Exibicao de obra em destaque para usuario autenticado com progresso no acervo
- **GIVEN** um usuário autenticado com a obra do destaque ativa em sua biblioteca
- **WHEN** o usuário visualiza a dobra superior do Home Hub
- **THEN** o sistema SHALL exibir o título, sinopse, capa e botão de incremento tátil de episódio ou capítulo sem artefatos difusos de fundo e sem etiqueta eyebrow decorativa

#### Scenario: Exibicao de obra em destaque para usuario autenticado sem a obra no acervo
- **GIVEN** um usuário autenticado que ainda não possui a obra do destaque na biblioteca
- **WHEN** a tela inicial do Home Hub é renderizada
- **THEN** o sistema SHALL exibir o botão de adicionar com um único ícone de soma e texto 'Adicionar à Lista' sem duplicação de caractere, o botão de ver detalhes, e MUST NOT renderizar link ou botão de criar conta

#### Scenario: Apresentacao editorial de acolhimento para visitante anonimo
- **GIVEN** um visitante não autenticado acessando a aplicação
- **WHEN** a tela inicial é carregada
- **THEN** o sistema SHALL renderizar o Hero Spotlight com obra de referência editorial e botões convidativos para criar conta ou explorar o catálogo

## ADDED Requirements

### Requirement: Continue Watching Feed and Active Progress
O Home Hub SHALL consultar a biblioteca do usuário autenticado e renderizar na seção Continuar Acompanhando as obras que possuem status ativo (ASSISTINDO ou LENDO), provendo botão de avanço rápido de unidade sincronizado com o banco de dados.

#### Scenario: Exibicao de obras ativas em andamento para usuario autenticado
- **GIVEN** um usuário autenticado com registros na biblioteca com status ASSISTINDO ou LENDO
- **WHEN** a página inicial do Home Hub é carregada
- **THEN** o sistema SHALL renderizar a seção Continuar Acompanhando exibindo os cards das obras ativas com capa, título e progresso atual

#### Scenario: Incremento rapido de unidade a partir do Home Hub
- **GIVEN** uma obra ativa renderizada na seção Continuar Acompanhando
- **WHEN** o usuário clica no botão de incremento rápido de episódio ou capítulo
- **THEN** o sistema SHALL atualizar otimisticamente a contagem na interface e persistir o novo progresso no banco de dados

