# personal-library-ui Specification

## MODIFIED Requirements

### Requirement: Library Filtering and Asynchronous States
O sistema SHALL filtrar itens por abas editoriais limpas em linha única para status sem formato de pílula inflada e sem barra de rolagem horizontal nativa, com seletores discretos para categorias, busca local instantânea em tempo real por título, opções de ordenação e estados dedicados de carregamento, acervo vazio, busca sem resultados e erro.

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
- **THEN** as opções utilizam taxonomia de usuário em abas editoriais com linha indicadora de estado ativo sem formato de pílula inflada, contadores numéricos discretos e sem barra de rolagem horizontal visível na interface

#### Scenario: Busca local instantanea por texto com ordenacao dinamica
- **GIVEN** uma lista de obras carregadas na biblioteca
- **WHEN** o usuário digita no campo de busca local ou altera a ordenação
- **THEN** a interface SHALL filtrar e reordenar os itens instantaneamente no cliente sem requisição adicional à API

### Requirement: Interactive Favorites Rewatch Actions and Inconsistency Warnings
A interface da biblioteca pessoal SHALL disponibilizar alternância ágil de favoritos com um clique sincronizada com a camada de persistência durável, modal interativo para registrar novo ciclo ou contador de reassistir, controle de volumes e alertas não-bloqueantes de inconsistência.

#### Scenario: Alternancia imediata de favorito no card ou linha
- **GIVEN** uma obra exibida na biblioteca pessoal
- **WHEN** o usuário clica no botão de coração de favoritos
- **THEN** a interface SHALL atualizar o estado visual otimisticamente e persistir a alteração no banco de dados

#### Scenario: Execucao de acao de reassistir ou reler no modal
- **GIVEN** o modal de detalhes de uma obra concluída aberto
- **WHEN** o usuário seleciona a opção de iniciar novo ciclo de reassistir ou incrementar contador
- **THEN** o sistema SHALL disparar a atualização adequada e refletir o novo ciclo e contador no card da obra

#### Scenario: Exibicao de aviso amigavel sobre inconsistencia entre status e progresso
- **GIVEN** o modal de edição de obra aberto na biblioteca
- **WHEN** o usuário altera o status para Concluído mantendo o progresso inferior ao total conhecido de episódios ou capítulos
- **THEN** a interface SHALL renderizar um aviso informativo não-bloqueante alertando sobre a disparidade sem impedir a gravação

