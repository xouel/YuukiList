# auth-ui Specification Delta

## MODIFIED Requirements

### Requirement: User Registration Interface and Client-Side Validation
O sistema SHALL apresentar a interface de cadastro integrada ao contêiner Editorial Split Dossier com validação inline de campos, alternador de abas no cliente, alternador de visibilidade de senha e feedback de erros na paleta Asian Editorial.

#### Scenario: Submissão bem-sucedida de cadastro com redirecionamento
- **GIVEN** um usuário visitante na página de cadastro
- **WHEN** preenche email válido, username único e senha de 8 ou mais caracteres e clica em "Criar Conta"
- **THEN** o sistema SHALL desabilitar o botão exibindo indicador de loading, registrar a conta via API, atualizar o estado de sessão e redirecionar para a página inicial com sucesso

#### Scenario: Validação inline de campos e feedback visual de erro
- **GIVEN** um usuário interagindo com o formulário de cadastro
- **WHEN** preenche um campo com formato inválido (ex.: email sem arroba ou senha curta) e desfoca do campo
- **THEN** o sistema SHALL marcar o campo com atributo aria-invalid="true", exibir mensagem explicativa de erro e impedir a submissão do formulário

#### Scenario: Exibição de feedback de erro de colisão retornado pela API
- **GIVEN** uma tentativa de cadastro com email ou username já existente no sistema
- **WHEN** a API retorna status 409 Conflict
- **THEN** o sistema SHALL interceptar o erro e exibir um alerta visual informativo destacando o conflito sem limpar os dados já preenchidos pelo usuário

#### Scenario: Alternador de visibilidade de senha no formulario de cadastro
- **GIVEN** o formulário de cadastro com o campo de senha preenchido
- **WHEN** o usuário aciona o botão tátil de revelação de senha
- **THEN** o sistema SHALL alternar o tipo de entrada entre password e text atualizando o ícone vetorial SVG correspondente

### Requirement: User Login Interface and Session Recovery
O sistema SHALL apresentar a interface de login integrada ao contêiner Editorial Split Dossier com suporte a identificador híbrido, alternância fluida de abas, controle tátil de visibilidade de senha, feedback em credenciais inválidas e redirecionamento dinâmico pós-autenticação.

#### Scenario: Login bem-sucedido com redirecionamento dinâmico
- **GIVEN** um usuário visitante na página de login com o parâmetro de query redirect para uma obra específica
- **WHEN** informa identifier (email ou username) e senha corretos e submete o formulário
- **THEN** o sistema SHALL autenticar o usuário, atualizar o contexto global de sessão e redirecionar para a URL indicada no parâmetro de redirecionamento

#### Scenario: Feedback de erro para credenciais incorretas
- **GIVEN** uma tentativa de login com credenciais incorretas ou usuário inexistente
- **WHEN** a API retorna status 401 Unauthorized
- **THEN** o sistema SHALL exibir alerta visual amigável informando credenciais inválidas e manter o campo de senha focado para nova tentativa

#### Scenario: Redirecionamento de usuário já autenticado ao acessar tela de login
- **GIVEN** um usuário que já possui sessão ativa confirmada
- **WHEN** navega diretamente para a página de login ou de cadastro
- **THEN** o sistema SHALL redirecionar o usuário automaticamente para a página principal sem exibir o formulário de autenticação

#### Scenario: Alternancia fluida de abas entre entrar e cadastrar no mesmo card
- **GIVEN** a página de autenticação carregada no navegador
- **WHEN** o usuário clica na aba correspondente a Entrar ou Criar Conta
- **THEN** a interface SHALL alternar o formulário ativo instantaneamente no cliente sem recarregamento da página e com transição visual acelerada por GPU

#### Scenario: Alternador de visibilidade de senha no formulario de login
- **GIVEN** o campo de senha do formulário de login com texto inserido
- **WHEN** o usuário clica no botão de visibilidade de senha
- **THEN** o campo SHALL revelar ou mascarar os caracteres mantendo o foco acessível e o botão com tamanho mínimo de 44x44px

#### Scenario: Apresentacao da vitrine lateral do dossie com citacao e selos
- **GIVEN** a tela de autenticação renderizada em viewport amplo
- **WHEN** o contêiner 5+7 é apresentado
- **THEN** a coluna lateral esquerda SHALL exibir a citação editorial, wordmark YUUKILIST em fonte serifada e os selos de soberania e gratuidade na paleta mineral

