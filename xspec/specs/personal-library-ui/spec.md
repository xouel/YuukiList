# personal-library-ui Specification

## Purpose

Prover a interface gráfica web da biblioteca pessoal no YuukiList, permitindo a usuários autenticados visualizar suas obras em modos de grade e lista, filtrar por categoria e status, acompanhar o progresso de consumo de episódios e capítulos de forma ágil, visualizar a condição 'Em dia' e gerenciar detalhes com privacidade e acessibilidade.

## Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal na rota /library com cabeçalho do Ledger em faixa única com divisores verticais sem badges pulsantes, alternância grade/lista, card pontilhado e selos de status sóbrios integrados rente à margem da capa.

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
- **THEN** a página integra-se ao container global e os selos de status pessoal são posicionados de forma sóbria rente à margem superior sem acúmulo de badges de vidro flutuantes

#### Scenario: Carregamento robusto e desserializacao de itens da biblioteca
- **GIVEN** a resposta da API contendo as obras salvas do usuário
- **WHEN** o cliente HTTP e a visão da biblioteca recebem os dados paginados
- **THEN** o sistema SHALL normalizar e extrair a lista de itens garantindo a renderização correta de todas as obras salvas

#### Scenario: Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra
- **GIVEN** um usuário com obras registradas em sua biblioteca
- **WHEN** a tela do Ledger Pessoal é renderizada
- **THEN** o sistema SHALL exibir badge editorial de versão, timestamp estável sem badge pulsante (animate-pulse), contadores de Concluídos e Em Andamento em faixa com divisores verticais (divide-x) e botão de Adicionar Obra

#### Scenario: Card pontilhado de registrar nova obra na grade da biblioteca
- **GIVEN** a visualização da biblioteca pessoal em modo grade
- **WHEN** a lista de cards é montada
- **THEN** a interface SHALL incluir ao final um card com borda tracejada de Registrar Nova Obra com botão de Pesquisa Global direcionando para exploração

### Requirement: Quick Progress Tracking and Detail Modal
O sistema SHALL disponibilizar controle de progresso tátil com micro-pressão (:active:scale-[0.98]), números tabulares (tabular-nums), ausência de zoom agressivo (hover:scale-105), barra proporcional, alvo mínimo de 44x44px, popover de estrelas e modal detalhado.

#### Scenario: Incremento rapido de unidade com atualizacao otimista
- **GIVEN** uma série com episódios disponíveis e botão de incremento visível
- **WHEN** o usuário clica na ação de avançar um episódio
- **THEN** o sistema SHALL responder com micro-pressão física no clique, atualizar otimisticamente a contagem na interface e sincronizar com o backend em segundo plano

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
- **THEN** a interface exibe o progresso no formato Ep. X/Y com números tabulares e barra visual proporcional, provendo botão de avanço com área tátil mínima de 44x44px sem dilatação hover:scale-105

#### Scenario: Avaliacao rapida inline com popover de estrelas e atalho para diario
- **GIVEN** um card de obra exibido na biblioteca
- **WHEN** o usuário interage com o seletor de estrelas no rodapé do card
- **THEN** o sistema SHALL abrir um popover flutuante para escolha de nota de 1 a 10 com persistência imediata e prover botão de atalho para notas do diário

### Requirement: Library Filtering and Asynchronous States
O sistema SHALL filtrar itens por abas inteligentes em estilo pílula com taxonomia desambiguada de status do usuário, categorias no plural e contadores integrados, busca local instantânea em tempo real por título, opções de ordenação e estados dedicados de carregamento, acervo vazio, busca sem resultados e erro.

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

#### Scenario: Busca local instantanea por texto com ordenacao dinamica
- **GIVEN** uma lista de obras carregadas na biblioteca
- **WHEN** o usuário digita no campo de busca local ou altera a ordenação
- **THEN** a interface SHALL filtrar e reordenar os itens instantaneamente no cliente sem requisição adicional à API

### Requirement: Interactive Favorites Rewatch Actions and Inconsistency Warnings
A interface da biblioteca pessoal SHALL disponibilizar alternância ágil de favoritos com um clique, modal interativo para registrar novo ciclo ou contador de reassistir, controle de volumes e alertas não-bloqueantes de inconsistência.

#### Scenario: Alternancia imediata de favorito no card ou linha
- **GIVEN** uma obra exibida na biblioteca pessoal
- **WHEN** o usuário clica no botão de coração de favoritos
- **THEN** a interface SHALL atualizar o estado visual otimisticamente e persistir a alteração via API

#### Scenario: Execucao de acao de reassistir ou reler no modal
- **GIVEN** o modal de detalhes de uma obra concluída aberto
- **WHEN** o usuário seleciona a opção de iniciar novo ciclo de reassistir ou incrementar contador
- **THEN** o sistema SHALL disparar a atualização adequada e refletir o novo ciclo e contador no card da obra

#### Scenario: Exibicao de aviso amigavel sobre inconsistencia entre status e progresso
- **GIVEN** o modal de edição de obra aberto na biblioteca
- **WHEN** o usuário altera o status para Concluído mantendo o progresso inferior ao total conhecido de episódios ou capítulos
- **THEN** a interface SHALL renderizar um aviso informativo não-bloqueante alertando sobre a disparidade sem impedir a gravação

### Requirement: Consumption Cadence and Activity Sparkline
O sistema SHALL calcular e renderizar no rodapé da biblioteca o banner de cadência de consumo dos últimos 30 dias com total de unidades registradas, média diária calculada, gráfico de sparkline em SVG fluido e botão de exportação em formato CSV.

#### Scenario: Renderizacao do banner de cadencia de consumo com sparkline SVG
- **GIVEN** um usuário autenticado acessando a biblioteca pessoal
- **WHEN** a tela é carregada com os dados de consumo
- **THEN** o sistema SHALL exibir no rodapé a cadência dos últimos 30 dias com média diária calculada e curva visual em sparkline SVG

#### Scenario: Exportacao de dados da biblioteca para arquivo CSV
- **GIVEN** o banner de cadência de consumo visível na interface
- **WHEN** o usuário aciona o botão de exportar CSV
- **THEN** a aplicação SHALL gerar e disparar o download imediato de um arquivo CSV contendo as obras e registros da biblioteca
