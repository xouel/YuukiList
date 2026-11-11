# catalog-browse Specification Delta

## MODIFIED Requirements

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

