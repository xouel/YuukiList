# Spec Delta

## MODIFIED Requirements

### Requirement: Catalog Exploration and Infinite Scroll Interface
A interface web do catalogo SHALL exibir a exploracao detalhada de obras na rota /explore com dados iniciais pré-carregados e skeleton de rota, busca local-first com opção sob demanda para fontes externas, tratamento seguro de requisições abortadas e navegação SPA sem recarregamento completo.

#### Scenario: Barra de controles condensada com drawer de filtros avancados
- **GIVEN** o catalogo de exploracao de obras
- **WHEN** o usuario acessa a tela de exploracao ou aciona o controle de filtros avancados
- **THEN** a interface exibe busca e categorias em linha primaria elegante e disponibiliza drawer recolhivel para refinamento por pais, status, generos literarios e audiovisuais e ordenacao sem filtro de temas transversais

#### Scenario: Navegação fluida em SPA e expansão explícita em fontes externas
- **GIVEN** o usuário explorando o catálogo em /explore ou digitando rapidamente na barra de busca
- **WHEN** uma requisição anterior é abortada ou o usuário clica em um card ou aciona busca externa explícita
- **THEN** abortos com código ABORTED são ignorados sem exibir tela de erro, a navegação para /items/:slug ocorre em SPA preservando contexto e há botão para consultar fontes externas sob demanda

### Requirement: Item Details View and Navigation History
A aplicacao SHALL fornecer o dossier detalhado da obra na rota /items/:slug com console pessoal de acompanhamento otimista e ação funcional de marcar temporada inteira persistindo progresso, status CONCLUIDO ao completar o total conhecido e registro desacoplado no diário.

#### Scenario: Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento
- **GIVEN** uma obra carregada na rota /items/:slug
- **WHEN** o cabecalho do dossier e renderizado
- **THEN** a interface SHALL exibir faixa com quatro metricas principais e console de acompanhamento pessoal com status, nota, tempo assistido e botao de incremento ergonomico exibindo '+1' acompanhado do nome da unidade sem icone redundante de adicao

#### Scenario: Acao de favoritar conectada e sincronizada no console pessoal
- **GIVEN** um usuario autenticado visualizando o dossier da obra
- **WHEN** o usuario aciona o botao de favoritar no console de acompanhamento
- **THEN** a aplicacao SHALL persistir a marcacao de favorito na biblioteca e sincronizar o estado imediatamente com a vitrine de favoritos do perfil

#### Scenario: Conclusão em lote pelo botão Marcar Temporada Toda sem rollback indevido
- **GIVEN** um usuário autenticado no dossiê de uma obra em `/items/:slug` usando o gerenciador de episódios
- **WHEN** o usuário aciona "Marcar Temporada Toda" até o episódio final da temporada
- **THEN** o sistema SHALL atualizar otimisticamente a UI, persistir o progresso (promovendo status para CONCLUIDO caso atinja o total conhecido da obra), sincronizar a temporada ativa após carregar e registrar o evento em `/api/v1/diary` sem reverter a biblioteca caso o diário falhe

