# personal-library-ui Specification

## MODIFIED Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal do usuário na rota protegida library perfeitamente integrada ao container global unificado, permitindo alternar fluidamente entre visualização em grade e lista e posicionando os selos de status pessoal no topo dos cards.

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

#### Scenario: Harmonizacao de layout e posicionamento superior do status pessoal
- **GIVEN** a tela de biblioteca renderizada para um usuário autenticado
- **WHEN** os cards de obras são exibidos na interface
- **THEN** a página integra-se ao container global sem fundos recortados dissonantes e os selos de status pessoal são posicionados no canto superior do card

### Requirement: Quick Progress Tracking and Detail Modal
O sistema SHALL disponibilizar controle tátil de progresso com formatação relativa ao total conhecido, barra visual de progresso proporcional, botão de incremento rápido com área de toque mínima acessível de 44x44px e modal para edição detalhada.

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

#### Scenario: Controle tatil com barra de progresso visual e alvo minimo de toque de 44px
- **GIVEN** uma obra em andamento com total de episódios ou capítulos conhecido
- **WHEN** o card da obra é visualizado pelo usuário
- **THEN** a interface exibe o progresso no formato Ep. X/Y com barra visual proporcional de preenchimento e provê botão de avanço com área tátil mínima de 44x44px

### Requirement: Library Filtering and Asynchronous States
O sistema SHALL filtrar itens por abas inteligentes em estilo pílula com taxonomia desambiguada de status do usuário, categorias no plural e contadores integrados, provendo estados dedicados de carregamento, acervo vazio, busca sem resultados e recuperação de erro.

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

#### Scenario: Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados
- **GIVEN** a barra de filtros da biblioteca pessoal
- **WHEN** as abas de navegação de status são renderizadas
- **THEN** as opções utilizam taxonomia de usuário como Assistindo / Lendo e Planejados em botões pílula com contadores numéricos discretos

