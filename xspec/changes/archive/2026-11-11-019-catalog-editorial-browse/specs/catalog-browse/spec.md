# catalog-browse Specification

## MODIFIED Requirements

### Requirement: Catalog Exploration and Infinite Scroll Interface
A interface web do catálogo SHALL exibir a grade responsiva de cards de mídia com capas SVG, carregar páginas adicionais automaticamente via rolagem infinita, manter sincronização bidirecional em tempo real com a URL e prover barra primária condensada com drawer de filtros avançados.

#### Scenario: Exibição da grade de cards com rolagem infinita automática
- **GIVEN** que o usuário acessa a página inicial do catálogo
- **WHEN** o usuário visualiza o catálogo e rola a tela até o final da lista de itens
- **THEN** a interface requisita a próxima página da API e anexa os novos cards ao final da grade sem recarregar a tela

#### Scenario: Sincronização bidirecional de busca e filtros na URL
- **GIVEN** o usuário na página de exploração
- **WHEN** um termo é digitado no campo de busca ou um filtro de categoria é acionado
- **THEN** a interface atualiza os parâmetros de busca da URL com debounce de 300ms e recarrega a grade com os resultados filtrados

#### Scenario: Barra de controles condensada com drawer de filtros avancados
- **GIVEN** o catálogo de exploração de obras
- **WHEN** o usuário acessa a página inicial ou aciona o controle de filtros avançados
- **THEN** a interface exibe busca e categorias em linha primária elegante e disponibiliza drawer recolhível para refinamento por país, status, temas e ordenação

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

