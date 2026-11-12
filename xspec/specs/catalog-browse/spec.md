# catalog-browse Specification

## Purpose

Prover os componentes de interface web e páginas em Next.js para exploração responsiva, busca interativa com debounce, rolagem infinita, página de detalhes e estados de feedback acessíveis no catálogo do YuukiList.

## Requirements

### Requirement: Catalog Exploration and Infinite Scroll Interface
A interface web do catalogo SHALL exibir a exploracao detalhada de obras na rota dedicada /explore com capas resilientes, manter busca com debounce e filtros de categoria, fornecer drawer recolhivel com seletor de generos literarios e audiovisuais e tratar buscas legadas.

#### Scenario: Barra de controles condensada com drawer de filtros avancados
- **GIVEN** o catalogo de exploracao de obras
- **WHEN** o usuario acessa a tela de exploracao ou aciona o controle de filtros avancados
- **THEN** a interface exibe busca e categorias em linha primaria elegante e disponibiliza drawer recolhivel para refinamento por pais, status, generos literarios e audiovisuais e ordenacao sem filtro de temas transversais

### Requirement: Asynchronous Feedback and Resilient States
A interface do catálogo SHALL prover feedback visual resiliente implementando quatro estados assíncronos distintos: skeletons pulsantes para carregamento, tela limpa para catálogo vazio, aviso contextual com botão de ação para busca sem resultados e alerta de erro com botão de repetição.

#### Scenario: Exibição de skeletons durante carregamento assíncrono
- **GIVEN** uma consulta ao catálogo em andamento
- **WHEN** os dados da API ainda estiverem sendo transmitidos
- **THEN** a interface exibe elementos de placeholder animados simulando o formato dos cards de mídia

#### Scenario: Feedback de busca sem resultados com ação para limpar filtros
- **GIVEN** uma busca ou combinação de filtros sem itens correspondentes
- **WHEN** a resposta da API retornar lista vazia
- **THEN** a interface exibe mensagem indicando ausência de resultados e provê um botão interativo para limpar todos os filtros ativos

#### Scenario: Tratamento de erro de rede com botão de nova tentativa
- **GIVEN** uma falha de conexão ou erro HTTP retornado pela API
- **WHEN** a requisição falha
- **THEN** a interface renderiza um aviso de erro amigável acompanhado de um botão para tentar novamente a requisição

### Requirement: Item Details View and Navigation History
A aplicacao SHALL fornecer o dossier detalhado da obra na rota /items/:slug na tipografia Shippori Mincho, com capa despoluida em proporcao 2:3, metricas em tokens semanticos, console pessoal de acompanhamento com botao de incremento unitario ergonomico ('+1 {unidade}') sem duplicidade de icone de soma, e acao de favoritar conectada a persistencia da biblioteca e vitrine de perfil.

#### Scenario: Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento
- **GIVEN** uma obra carregada na rota /items/:slug
- **WHEN** o cabecalho do dossier e renderizado
- **THEN** a interface SHALL exibir faixa com quatro metricas principais e console de acompanhamento pessoal com status, nota, tempo assistido e botao de incremento ergonomico exibindo '+1' acompanhado do nome da unidade sem icone redundante de adicao

#### Scenario: Acao de favoritar conectada e sincronizada no console pessoal
- **GIVEN** um usuario autenticado visualizando o dossier da obra
- **WHEN** o usuario aciona o botao de favoritar no console de acompanhamento
- **THEN** a aplicacao SHALL persistir a marcacao de favorito na biblioteca e sincronizar o estado imediatamente com a vitrine de favoritos do perfil

### Requirement: Media Card Quick Actions and Enhanced Exploration
A interface do catálogo SHALL fornecer cards de mídia com física tátil e micro-pressão no clique (:active:scale-[0.98]), números tabulares (tabular-nums), ausência de zoom agressivo de capa (hover:scale-105), ações rápidas de inclusão e badges editoriais discretos.

#### Scenario: Adicao rapida de obra a biblioteca pessoal a partir do card
- **GIVEN** um usuário autenticado visualizando a grade de obras do catálogo
- **WHEN** o usuário aciona o botão de ação rápida no card da obra
- **THEN** o sistema SHALL fornecer resposta elástica imediata no clique e registrar o item na biblioteca com o status canônico padrão atualizando o estado visual imediatamente

#### Scenario: Alternancia visual do botao de acao rapida para obras salvas
- **GIVEN** uma obra já presente na biblioteca pessoal do usuário
- **WHEN** o usuário visualiza o card correspondente na grade de exploração
- **THEN** o botão de ação rápida exibe o estado de confirmação visual "Na Biblioteca" em vez de opção de inclusão

#### Scenario: Disposicao anti-colisao e badges editoriais no card de midia
- **GIVEN** obras com múltiplos gêneros e status de publicação longo
- **WHEN** os cards de mídia são renderizados na grade
- **THEN** os metadados de gênero e status ocupam slots independentes com números tabulares e a capa é destacada sem distorção de escala hover:scale-105
