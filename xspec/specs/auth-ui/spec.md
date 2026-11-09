# auth-ui Specification

## Purpose

Prover a interface de usuário para autenticação no YuukiList, englobando telas acessíveis de cadastro e login no tema Dark Editorial, validação de campos no cliente, feedback resiliente de erros, gerenciamento de estado de sessão e proteção declarativa de rotas privadas no Next.js.

## Requirements

### Requirement: User Registration Interface and Client-Side Validation
O sistema SHALL apresentar a página de cadastro com validação inline de campos, estados de carregamento durante a submissão e feedback visual de erros retornados pela API.

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

### Requirement: User Login Interface and Session Recovery
O sistema SHALL apresentar a página de login com suporte a identificador híbrido, feedback de erro em credenciais inválidas e redirecionamento dinâmico pós-autenticação.

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

### Requirement: Route Protection and Client Session Context
O sistema SHALL gerenciar o estado global de autenticação no cliente, exibir ações de sessão no cabeçalho e proteger rotas privadas contra acessos anônimos.

#### Scenario: Redirecionamento de usuário não autenticado ao acessar rota protegida
- **GIVEN** um usuário anônimo sem cookie de sessão ativo
- **WHEN** tenta navegar diretamente para uma rota privada protegida
- **THEN** o sistema SHALL bloquear a exibição da página privada e redirecionar imediatamente para a página de login preservando a rota de destino no parâmetro redirect

#### Scenario: Exibição do estado logado e botão de logout no cabeçalho global
- **GIVEN** um usuário com sessão ativa carregada no cliente
- **WHEN** visualiza o cabeçalho global da aplicação
- **THEN** o sistema SHALL exibir o nome de usuário autenticado e um botão acessível para ação de logout em substituição aos links de login e cadastro

#### Scenario: Encerramento de sessão no cliente ao acionar ação de logout
- **GIVEN** um usuário autenticado interagindo com o cabeçalho
- **WHEN** clica no botão "Sair"
- **THEN** o sistema SHALL disparar o encerramento de sessão na API, limpar o estado local de autenticação e atualizar a interface para o modo anônimo
