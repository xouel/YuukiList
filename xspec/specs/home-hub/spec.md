# home-hub Specification

## Purpose

Prover o painel dinâmico da página inicial do YuukiList na rota raiz, integrando Hero Spotlight de destaque com progresso embutido, seção tátil Continuar Acompanhando para marcação imediata, vitrines de tendências e Sidebar Bento com indicadores de ritmo semanal e atividade pessoal recente.

## Requirements

### Requirement: Home Hub Dashboard and Asymmetric Layout
A rota inicial da aplicação SHALL renderizar o painel dinâmico do Home Hub estruturado em grid de doze colunas assimétricas (oito colunas para o fluxo principal e quatro colunas para a barra lateral Bento) no desktop, adaptando-se para coluna única empilhada em dispositivos móveis.

#### Scenario: Visualizacao do Home Hub em tela desktop
- **GIVEN** um usuário acessando a rota raiz / em um navegador com largura desktop (>= 1024px)
- **WHEN** a página inicial é carregada
- **THEN** o sistema SHALL renderizar a coluna principal com largura de oito colunas e a sidebar Bento com quatro colunas em alinhamento harmonioso

#### Scenario: Adaptacao responsiva fluida em dispositivos moveis
- **GIVEN** um usuário acessando o Home Hub em um smartphone (< 768px)
- **WHEN** a interface inicial é renderizada
- **THEN** o sistema SHALL empilhar os módulos verticalmente em fluxo contínuo mantendo a legibilidade e alvos de toque acessíveis

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
