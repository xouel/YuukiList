# home-hub Specification

## Purpose

Prover o painel dinâmico da página inicial do YuukiList na rota raiz, integrando Hero Spotlight de destaque com progresso embutido, seção tátil Continuar Acompanhando para marcação imediata, vitrines de tendências e Sidebar Bento com indicadores de ritmo semanal e atividade pessoal recente.

## ADDED Requirements

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
O Home Hub SHALL apresentar na área nobre um card de destaque Hero Spotlight contendo a obra em andamento prioritária com indicador visual de progresso proporcional e ação imediata de incremento rápido, ou chamada editorial convidativa para visitantes anônimos.

#### Scenario: Exibicao de obra em destaque para usuario autenticado
- **GIVEN** um usuário autenticado com pelo menos uma obra ativa em sua biblioteca
- **WHEN** o usuário visualiza a dobra superior do Home Hub
- **THEN** o sistema SHALL exibir o título, sinopse, capa ampliada e botão de incremento tático de episódio ou capítulo

#### Scenario: Apresentacao editorial de acolhimento para visitante anonimo
- **GIVEN** um visitante não autenticado acessando a aplicação
- **WHEN** a tela inicial é carregada
- **THEN** o sistema SHALL renderizar o Hero Spotlight com obra de referência editorial e botões convidativos para criar conta ou explorar o catálogo

### Requirement: Bento Sidebar and Personal Analytics
A coluna lateral do Home Hub SHALL apresentar conjunto de cartões Bento com métricas compactas de ritmo semanal, régua visual de constância diária dos últimos sete dias, próximas estreias da agenda e feed de registros recentes de consumo do usuário.

#### Scenario: Renderizacao do resumo semanal e constancia de sete dias
- **GIVEN** um usuário autenticado com histórico recente de consumo
- **WHEN** a coluna lateral do Home Hub é renderizada
- **THEN** o sistema SHALL exibir o total de episódios consumidos na semana e a régua de sete dias indicando visualmente os dias com atividade registrada

#### Scenario: Exibicao de proximos lancamentos e atividade do diario
- **GIVEN** a presença de lançamentos agendados e eventos de consumo no perfil do usuário
- **WHEN** o usuário consulta os módulos inferiores da sidebar Bento
- **THEN** o sistema SHALL listar as próximas estreias catalogadas e os registros mais recentes adicionados ao diário pessoal

