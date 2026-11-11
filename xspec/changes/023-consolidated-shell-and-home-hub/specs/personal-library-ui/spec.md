# personal-library-ui Specification Delta

## MODIFIED Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal do usuário na rota protegida /library integrada ao container global, consumir e desserializar robustamente a lista de itens da API, permitir alternar entre grade e lista e posicionar os selos de status pessoal no topo dos cards.

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
- **THEN** a página integra-se ao container global sem fundos recortados dissonantes e os selos de status pessoal são posicionados no canto superior do card

#### Scenario: Carregamento robusto e desserializacao de itens da biblioteca
- **GIVEN** a resposta da API contendo as obras salvas do usuário
- **WHEN** o cliente HTTP e a visão da biblioteca recebem os dados paginados
- **THEN** o sistema SHALL normalizar e extrair a lista de itens garantindo a renderização correta de todas as obras salvas

