# Spec Delta: personal-library-ui

## MODIFIED Requirements

### Requirement: Personal Library View and Layout Toggle
O sistema SHALL renderizar a biblioteca pessoal na rota /library com cabeçalho do Ledger em faixa única com divisores verticais sem badges pulsantes, alternância grade/lista, card pontilhado e selos de status sóbrios integrados rente à margem da capa.

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
- **WHEN** a tela do Ledger Pessoal é renderizada
- **THEN** o sistema SHALL exibir badge editorial de versão, timestamp estável sem badge pulsante (animate-pulse), contadores de Concluídos e Em Andamento em faixa com divisores verticais (divide-x) e botão de Adicionar Obra

#### Scenario: Card pontilhado de registrar nova obra na grade da biblioteca
- **GIVEN** a visualização da biblioteca pessoal em modo grade
- **WHEN** a lista de cards é montada
- **THEN** a interface SHALL incluir ao final um card com borda tracejada de Registrar Nova Obra com botão de Pesquisa Global direcionando para exploração

