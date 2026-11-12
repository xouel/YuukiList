# catalog-browse Specification Delta

## MODIFIED Requirements

### Requirement: Catalog Exploration and Infinite Scroll Interface
A interface web do catalogo SHALL exibir a exploracao detalhada de obras na rota dedicada /explore com capas resilientes, manter busca com debounce e filtros de categoria, fornecer drawer recolhivel com seletor de generos literarios e audiovisuais e tratar buscas legadas.

#### Scenario: Barra de controles condensada com drawer de filtros avancados
- **GIVEN** o catalogo de exploracao de obras
- **WHEN** o usuario acessa a tela de exploracao ou aciona o controle de filtros avancados
- **THEN** a interface exibe busca e categorias em linha primaria elegante e disponibiliza drawer recolhivel para refinamento por pais, status, generos literarios e audiovisuais e ordenacao sem filtro de temas transversais

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
