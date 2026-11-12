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
