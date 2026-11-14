# Spec Delta: auth-ui

## MODIFIED Requirements

### Requirement: User Registration Interface and Client-Side Validation
O sistema SHALL apresentar a interface de cadastro integrada ao contêiner Editorial Split Dossier sem desmontar o formulário durante o envio, com validação inline de campos, alternância de abas, visibilidade de senha e feedback distinto para conflito de e-mail ou nome de usuário preservando os dados preenchidos.

#### Scenario: Submissão bem-sucedida de cadastro com redirecionamento
- **GIVEN** um usuário visitante na página de cadastro
- **WHEN** preenche email válido, username único e senha de 8 ou mais caracteres e clica em "Criar Conta"
- **THEN** o sistema SHALL desabilitar o botão exibindo indicador de loading sem desmontar o formulário, registrar a conta via API, atualizar o estado de sessão e redirecionar para a página inicial com sucesso

#### Scenario: Validação inline de campos e feedback visual de erro
- **GIVEN** um usuário interagindo com o formulário de cadastro
- **WHEN** preenche um campo com formato inválido (ex.: email sem arroba ou senha curta) e desfoca do campo
- **THEN** o sistema SHALL marcar o campo com atributo aria-invalid="true", exibir mensagem explicativa de erro e impedir a submissão do formulário

#### Scenario: Exibição de feedback distinto para e-mail ou nome de usuário já cadastrado
- **GIVEN** uma tentativa de cadastro onde o e-mail ou o nome de usuário já existe no sistema
- **WHEN** a API retorna status 409 Conflict com `field: "email"` ou `field: "username"`
- **THEN** o sistema SHALL manter o formulário montado com os valores preenchidos, exibir alerta `role="alert"` específico indicando se foi o e-mail ou o usuário que já está cadastrado, e marcar o campo correspondente com `aria-invalid="true"` e erro inline

#### Scenario: Alternador de visibilidade de senha no formulario de cadastro
- **GIVEN** o formulário de cadastro com o campo de senha preenchido
- **WHEN** o usuário aciona o botão tátil de revelação de senha
- **THEN** o sistema SHALL alternar o tipo de entrada entre password e text atualizando o ícone vetorial SVG correspondente

### Requirement: User Login Interface and Session Recovery
O sistema SHALL apresentar a interface de login integrada ao contêiner Editorial Split Dossier sem desmontar o formulário durante o envio, com identificador híbrido, link para "Esqueci minha senha", visibilidade de senha, foco no campo de senha após erro 401 e feedback de redirecionamento/redefinição de senha.

#### Scenario: Login bem-sucedido com redirecionamento dinâmico
- **GIVEN** um usuário visitante na página de login com o parâmetro de query redirect para uma obra específica
- **WHEN** informa identifier (email ou username) e senha corretos e submete o formulário
- **THEN** o sistema SHALL autenticar o usuário, atualizar o contexto global de sessão e redirecionar para a URL indicada no parâmetro de redirecionamento

#### Scenario: Feedback de erro para credenciais incorretas sem perda de estado
- **GIVEN** uma tentativa de login com identificador não encontrado ou senha incorreta
- **WHEN** a API retorna status 401 Unauthorized
- **THEN** o sistema SHALL manter o formulário montado com o identificador preenchido, exibir alerta `role="alert"` informando usuário/e-mail ou senha incorretos e devolver o foco acessível ao campo de senha para nova tentativa

#### Scenario: Feedback para falha temporária de servidor ou rede no login
- **GIVEN** uma falha HTTP 5xx ou erro de conexão durante a submissão do login
- **WHEN** o cliente recebe o erro diferente de 401/400
- **THEN** o sistema SHALL exibir alerta amigável de falha temporária de conexão sem afirmar erroneamente que a senha está incorreta

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

#### Scenario: Banner de confirmação após redefinição de senha no login
- **GIVEN** um usuário redirecionado para `/login?reset=success` após concluir a redefinição de senha
- **WHEN** a tela de login é carregada
- **THEN** o formulário SHALL exibir alerta visual de sucesso orientando o login com a nova senha

## ADDED Requirements

### Requirement: Password Recovery and Reset Interface
O sistema SHALL oferecer as páginas `/forgot-password` e `/reset-password` no tema Dark/Light Editorial com navegação a partir do login, validação inline de e-mail, força mínima e confirmação de nova senha, controle tátil de visibilidade e tratamento claro para links expirados ou inválidos.

#### Scenario: Solicitação de recuperação de senha na tela forgot-password
- **GIVEN** um usuário na página `/login` que aciona o link "Esqueci minha senha" e acessa `/forgot-password`
- **WHEN** preenche um endereço de e-mail válido e envia o formulário
- **THEN** o sistema SHALL chamar `POST /api/v1/auth/forgot-password` com feedback de loading e exibir estado neutro de confirmação orientando verificar caixa de entrada e spam

#### Scenario: Validação de token e redefinição de senha na tela reset-password
- **GIVEN** um usuário acessando `/reset-password?token=<token_valido>`
- **WHEN** a validação inicial confirma o token e o usuário submete nova senha válida (8+ caracteres) igual ao campo de confirmação
- **THEN** o sistema SHALL chamar `POST /api/v1/auth/reset-password` e redirecionar para `/login?reset=success`

#### Scenario: Exibição de estado de link inválido ou expirado na tela reset-password
- **GIVEN** um usuário acessando `/reset-password` sem token ou com token expirado/reutilizado
- **WHEN** a API indica token inválido na verificação inicial ou na submissão
- **THEN** a página SHALL informar claramente que o link expirou ou já foi utilizado e disponibilizar link acessível para solicitar nova recuperação em `/forgot-password`

