# Spec Delta

## MODIFIED Requirements

### Requirement: Hero Spotlight and Quick Tracking
O Home Hub SHALL apresentar Hero Spotlight interativo em carrossel (navegável por clique e por arraste/deslize) exibindo 1 obra real melhor avaliada de cada uma das 6 categorias canônicas, com ações ramificadas por estado de autenticação, rótulos de unidade adequados (Episódio ou Capítulo) e sem etiquetas mono decorativas.

#### Scenario: Exibicao de obra em destaque para usuario autenticado com progresso no acervo
- **GIVEN** um usuário autenticado com a obra do destaque ativa em sua biblioteca
- **WHEN** o usuário visualiza a dobra superior do Home Hub
- **THEN** o sistema SHALL exibir o título, sinopse, capa e botão de incremento tátil de episódio ou capítulo sem artefatos difusos de fundo e sem etiqueta eyebrow decorativa

#### Scenario: Exibicao de obra em destaque para usuario autenticado sem a obra no acervo
- **GIVEN** um usuário autenticado que ainda não possui a obra do destaque na biblioteca
- **WHEN** a tela inicial do Home Hub é renderizada
- **THEN** o sistema SHALL exibir o botão de adicionar com um único ícone de soma e texto 'Adicionar à Lista' sem duplicação de caractere, o botão de ver detalhes, e MUST NOT renderizar link ou botão de criar conta

#### Scenario: Apresentacao editorial de acolhimento para visitante anonimo
- **GIVEN** um visitante não autenticado acessando a aplicação
- **WHEN** a tela inicial é carregada
- **THEN** o sistema SHALL renderizar o Hero Spotlight com obra de referência editorial e botões convidativos para criar conta ou explorar o catálogo

#### Scenario: Carrossel clicável e arrastável com uma recomendação real por categoria
- **GIVEN** a tela inicial carregada com 1 obra real recomendada de cada categoria canônica (`DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`)
- **WHEN** o usuário clica nos botões/abas de categoria ou arrasta/desliza horizontalmente o destaque
- **THEN** o Hero Spotlight SHALL alternar entre a obra recomendada de cada categoria exibindo capa real, nota, rótulo correto da unidade (`Episódio` vs `Capítulo`) e controles sem travar em `#alive` ou fallback estático `Solo Leveling`

### Requirement: Continue Watching Feed and Active Progress
O Home Hub SHALL consultar a biblioteca e o diário via métodos válidos do cliente (`libraryApi.listItems` e `diaryApi.list`) para exibir as obras ativas (`ASSISTINDO`/`LENDO`) em Continuar Acompanhando com incremento otimista, corrigir `event.number` na `BentoSidebar`, erradicar `hover:scale-105` em `TrendingShowcase` e suportar ambos os temas.

#### Scenario: Exibicao de obras ativas em andamento para usuario autenticado
- **GIVEN** um usuário autenticado com registros na biblioteca com status ASSISTINDO ou LENDO
- **WHEN** a página inicial do Home Hub é carregada
- **THEN** o sistema SHALL renderizar a seção Continuar Acompanhando exibindo os cards das obras ativas com capa, título e progresso atual

#### Scenario: Incremento rapido de unidade a partir do Home Hub
- **GIVEN** uma obra ativa renderizada na seção Continuar Acompanhando
- **WHEN** o usuário clica no botão de incremento rápido de episódio ou capítulo
- **THEN** o sistema SHALL atualizar otimisticamente a contagem na interface e persistir o novo progresso no banco de dados

#### Scenario: Concordancia visual e suporte integral ao tema claro no Home Hub
- **GIVEN** a página inicial renderizada em Modo Claro
- **WHEN** a seção Continuar Acompanhando e os cards de tendências são exibidos
- **THEN** os contêineres SHALL adotar classes de superfície semânticas (bg-surface-raised) e títulos escuros legíveis sem classes hexadecimais estáticas escuras

#### Scenario: Carregamento resiliente de obras ativas e eventos da sidebar na Home
- **GIVEN** um usuário autenticado possuindo obras marcadas como `ASSISTINDO` ou `LENDO` no banco de dados
- **WHEN** `HomeHubView` executa o carregamento inicial de biblioteca, diário e próximas estreias
- **THEN** o sistema SHALL chamar `diaryApi.list()` sem falha de método inexistente, exibir as obras ativas em `Continuar Acompanhando`, renderizar `event.number` em `BentoSidebar` e evitar `hover:scale-105` em `TrendingShowcase`

