# Spec Delta

## Purpose
Prover a interface gráfica web da biblioteca pessoal no YuukiList, permitindo a usuários autenticados visualizar suas obras em modos de grade e lista, filtrar por categoria e status, acompanhar o progresso de consumo de episódios e capítulos de forma ágil, visualizar a condição 'Em dia' e gerenciar detalhes com privacidade e acessibilidade.

## ADDED Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal privada do usuário na rota protegida library, permitindo alternar fluidamente entre visualização em grade e lista com persistência da preferência no cliente.

#### Scenario: Exibicao da biblioteca pessoal em modo grade
- **GIVEN** um usuário autenticado com obras registradas em sua biblioteca
- **WHEN** o usuário navega para a rota de biblioteca pessoal
- **THEN** o sistema SHALL renderizar as obras em grade responsiva com capas na proporção editorial 2:3 e indicadores de progresso

#### Scenario: Alternancia para modo lista com persistencia em localStorage
- **GIVEN** o usuário visualizando a biblioteca pessoal no modo padrão
- **WHEN** o usuário aciona o controle de alternância para o modo lista
- **THEN** o sistema SHALL reestruturar os itens em linhas tabulares e persistir a escolha no localStorage para sessões futuras

#### Scenario: Redirecionamento de usuario anonimo ao tentar acessar a biblioteca
- **GIVEN** um visitante não autenticado
- **WHEN** o visitante tenta acessar diretamente a página de biblioteca pessoal
- **THEN** o sistema SHALL bloquear a visualização e redirecionar para a tela de login preservando a rota de destino

### Requirement: Quick Progress Tracking and Detail Modal
O sistema SHALL disponibilizar controle ágil de progresso com botão de incremento rápido no card ou linha e modal para edição detalhada de status, nota e anotações.

#### Scenario: Incremento rapido de unidade com atualizacao otimista
- **GIVEN** uma série com episódios disponíveis e botão de incremento visível
- **WHEN** o usuário clica na ação de avançar um episódio
- **THEN** o sistema SHALL atualizar otimisticamente a contagem na interface e sincronizar com o backend em segundo plano

#### Scenario: Exibicao destacada do badge Em dia para obras alcancadas
- **GIVEN** uma obra cujo progresso atinge o total de unidades disponíveis
- **WHEN** a biblioteca é renderizada ou o progresso é atualizado
- **THEN** o sistema SHALL exibir com destaque o selo visual Em dia junto ao status pessoal da obra

#### Scenario: Edicao de status e nota pessoal atraves do modal detalhado
- **GIVEN** uma obra listada na biblioteca pessoal
- **WHEN** o usuário aciona a opção de editar detalhes da obra
- **THEN** o sistema SHALL abrir o modal permitindo ajustar status, nota de zero a dez, progresso e notas privadas

### Requirement: Library Filtering and Asynchronous States
O sistema SHALL filtrar itens por abas inteligentes de status e categorias e apresentar estados dedicados de carregamento, acervo vazio, busca sem resultados e erro com recuperacao.

#### Scenario: Filtragem combinada por aba de status e categoria
- **GIVEN** um usuário com múltiplas obras de diferentes formatos e status
- **WHEN** o usuário seleciona uma aba de status e um filtro de categoria
- **THEN** o sistema SHALL exibir unicamente as obras que atendem simultaneamente aos dois critérios

#### Scenario: Exibicao de estado vazio para biblioteca sem obras cadastradas
- **GIVEN** um usuário recém-cadastrado com acervo vazio
- **WHEN** o usuário acessa a página de biblioteca pessoal
- **THEN** o sistema SHALL exibir mensagem convidativa de acervo vazio e um botão direcionando ao catálogo de obras

#### Scenario: Tratamento de erro com acao de tentar novamente
- **GIVEN** uma falha de conexão na comunicação com a API da biblioteca
- **WHEN** o carregamento da lista ou a mutação é interrompido por erro de rede
- **THEN** o sistema SHALL exibir um alerta visual informativo com um botão de nova tentativa

