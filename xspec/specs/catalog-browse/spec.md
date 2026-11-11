# catalog-browse Specification

## Purpose

Prover os componentes de interface web e páginas em Next.js para exploração responsiva, busca interativa com debounce, rolagem infinita, página de detalhes e estados de feedback acessíveis no catálogo do YuukiList.

## Requirements

### Requirement: Catalog Exploration and Infinite Scroll Interface
A interface web do catálogo SHALL exibir a exploração detalhada de obras na rota dedicada /explore com capas SVG, carregar páginas adicionais via rolagem infinita, manter sincronização bidirecional na URL, prover barra condensada com drawer de filtros e tratar buscas diretas legadas.

#### Scenario: Exibição da grade de cards com rolagem infinita na rota de exploracao
- **GIVEN** que o usuário acessa a rota /explore de exploração do acervo
- **WHEN** o usuário visualiza o catálogo e rola a tela até o final da lista de itens
- **THEN** a interface requisita a próxima página da API e anexa os novos cards ao final da grade sem recarregar a tela

#### Scenario: Sincronização bidirecional de busca e filtros na URL
- **GIVEN** o usuário na página de exploração /explore
- **WHEN** um termo é digitado no campo de busca ou um filtro de categoria é acionado
- **THEN** a interface atualiza os parâmetros de busca da URL com debounce de 300ms e recarrega a grade com os resultados filtrados

#### Scenario: Barra de controles condensada com drawer de filtros avancados
- **GIVEN** o catálogo de exploração de obras
- **WHEN** o usuário acessa a tela de exploração ou aciona o controle de filtros avançados
- **THEN** a interface exibe busca e categorias em linha primária elegante e disponibiliza drawer recolhível para refinamento por país, status, temas e ordenação

#### Scenario: Compatibilidade e redirecionamento de consultas diretas
- **GIVEN** uma consulta iniciada diretamente na raiz com parâmetros de busca como /?q=termo
- **WHEN** a rota inicial detecta parâmetros de pesquisa ativa
- **THEN** a aplicação SHALL redirecionar o usuário para /explore preservando integralmente os parâmetros informados

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
A aplicação SHALL fornecer a visualização detalhada da obra na rota /items/:slug exibindo todos os metadados e prover mecanismo de retorno ao catálogo que restaure a busca, filtros e posição de rolagem anteriores, em conformidade com as diretrizes de acessibilidade WCAG 2.2 AA.

#### Scenario: Navegação para a página de detalhes da obra por slug
- **GIVEN** um card de obra exibido na grade
- **WHEN** o usuário seleciona o card
- **THEN** a aplicação navega para a rota /items/:slug exibindo capa vetorial, sinopse, gêneros e metadados completos

#### Scenario: Retorno ao catálogo preservando filtros e rolagem
- **GIVEN** o usuário na página de detalhes após navegar a partir de uma busca filtrada
- **WHEN** o usuário aciona o botão de retorno
- **THEN** a aplicação volta à tela de catálogo restaurando os filtros ativos e a posição de rolagem prévia

#### Scenario: Acessibilidade de foco e contraste WCAG 2.2 AA
- **GIVEN** a navegação na interface através do teclado
- **WHEN** o usuário utiliza as teclas Tab e Enter para navegar entre cards e controles
- **THEN** todos os elementos interativos possuem anel de foco claramente visível e contraste de cor em conformidade com o padrão WCAG 2.2 AA

### Requirement: Media Card Quick Actions and Enhanced Exploration
A interface do catálogo SHALL fornecer ações rápidas de inclusão na biblioteca diretamente nos cards de mídia, alternância de estado para obras já salvas, prevenção de colisão de metadados no rodapé do card e badges editoriais discretos.

#### Scenario: Adicao rapida de obra a biblioteca pessoal a partir do card
- **GIVEN** um usuário autenticado visualizando a grade de obras do catálogo
- **WHEN** o usuário aciona o botão de ação rápida no card da obra
- **THEN** o sistema SHALL registrar o item na biblioteca com o status canônico padrão da categoria e atualizar o estado visual do card imediatamente

#### Scenario: Alternancia visual do botao de acao rapida para obras salvas
- **GIVEN** uma obra já presente na biblioteca pessoal do usuário
- **WHEN** o usuário visualiza o card correspondente na grade de exploração
- **THEN** o botão de ação rápida exibe o estado de confirmação visual "Na Biblioteca" em vez de opção de inclusão

#### Scenario: Disposicao anti-colisao e badges editoriais no card de midia
- **GIVEN** obras com múltiplos gêneros e status de publicação longo
- **WHEN** os cards de mídia são renderizados na grade
- **THEN** os metadados de gênero e status da obra ocupam slots independentes sem truncamento colidente e as categorias adotam badges editoriais refinados

#### Scenario: Filtragem combinada por pais de origem e temas transversais
- **GIVEN** o catálogo de obras exibido na interface
- **WHEN** o usuário seleciona filtros de país de origem e tema transversal
- **THEN** a interface SHALL atualizar a listagem exibindo somente as obras compatíveis com todos os critérios selecionados
