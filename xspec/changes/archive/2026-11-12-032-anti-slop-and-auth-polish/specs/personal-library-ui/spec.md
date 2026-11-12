# personal-library-ui Specification Delta

## MODIFIED Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal na rota /library com cabeçalho limpo sem rótulo 'Ledger v2.4' ou indicador redundante 'Sincronizado recentemente', sem contêineres aninhados externos, e com cards em cromo neutro onde as capas conduzem a cor sem tingimento artificial por categoria.

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
- **WHEN** o cabeçalho da biblioteca é renderizado
- **THEN** o sistema SHALL omitir o rótulo decorativo 'LEDGER PESSOAL V2.4' e o texto 'Sincronizado recentemente', apresentando título editorial limpo, contadores de Concluídos e Em Andamento em faixa com divisores verticais (divide-x) e botão de Adicionar Obra

#### Scenario: Card pontilhado de registrar nova obra na grade da biblioteca
- **GIVEN** a visualização da biblioteca pessoal em modo grade
- **WHEN** a lista de cards é montada
- **THEN** a interface SHALL incluir ao final um card com borda tracejada de Registrar Nova Obra com botão de Pesquisa Global direcionando para exploração

#### Scenario: Cards da biblioteca em cromo neutro sem tingimento por categoria
- **GIVEN** uma obra exibida na biblioteca pessoal
- **WHEN** o card da obra é renderizado
- **THEN** o sistema SHALL apresentar moldura e metadados em cromo neutro sem tingimento colorido artificial por categoria e sem títulos duplicados fantasmas

### Requirement: Library Filtering and Asynchronous States
O sistema SHALL filtrar itens por abas editoriais limpas em linha única para status sem formato de pílula inflada e seletores discretos para categorias, busca local instantânea em tempo real por título, opções de ordenação e estados dedicados de carregamento, acervo vazio, busca sem resultados e erro.

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

#### Scenario: Abas editoriais limpas com taxonomia desambiguada e contadores integrados
- **GIVEN** a barra de filtros da biblioteca pessoal
- **WHEN** as abas de navegação de status são renderizadas
- **THEN** as opções utilizam taxonomia de usuário em abas editoriais com linha indicadora de estado ativo sem formato de pílula inflada e contadores numéricos discretos

#### Scenario: Busca local instantanea por texto com ordenacao dinamica
- **GIVEN** uma lista de obras carregadas na biblioteca
- **WHEN** o usuário digita no campo de busca local ou altera a ordenação
- **THEN** a interface SHALL filtrar e reordenar os itens instantaneamente no cliente sem requisição adicional à API

