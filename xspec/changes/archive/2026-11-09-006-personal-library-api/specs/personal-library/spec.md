# Spec Delta

## Purpose
Prover o subsistema de biblioteca pessoal no YuukiList, permitindo aos usuários autenticados organizar obras com status compatíveis por formato (diferenciando audiovisual de leitura), acompanhar o progresso de episódios e capítulos, computar dinamicamente a condição "Em dia" e gerenciar sua lista com isolamento estrito e privacidade.

## ADDED Requirements

### Requirement: Personal Library Management and Category Status Validation
O sistema SHALL gerenciar o ciclo de vida de itens na biblioteca pessoal do usuário, validando a compatibilidade estrita do status pessoal contra a categoria da obra.

#### Scenario: Adição de obra à biblioteca pessoal com status compatível
- **GIVEN** um usuário autenticado e uma obra existente do tipo "DORAMA"
- **WHEN** o usuário envia `POST /api/v1/library/items` com status "ASSISTINDO"
- **THEN** o sistema SHALL registrar a obra na biblioteca pessoal do usuário, retornando HTTP 201 Created ou 200 OK com os dados do item

#### Scenario: Rejeição de status pessoal incompatível com a categoria da obra
- **GIVEN** um usuário autenticado e uma obra existente do tipo "MANGA"
- **WHEN** o usuário tenta enviar `POST /api/v1/library/items` com status pessoal "QUERO_ASSISTIR" ou "ASSISTIDO"
- **THEN** o sistema SHALL rejeitar a operação com HTTP 400 Bad Request informando a incompatibilidade do status com a categoria literária

#### Scenario: Atualização de status ou remoção de obra da biblioteca
- **GIVEN** uma obra presente na biblioteca pessoal do usuário com status "LENDO"
- **WHEN** o usuário envia `PATCH /api/v1/library/items/:mediaItemId` alterando para "PAUSADO" ou envia `DELETE /api/v1/library/items/:mediaItemId`
- **THEN** o sistema SHALL atualizar atomicamente o status ou remover a entrada da biblioteca, respondendo com sucesso

### Requirement: Progress Tracking and Dynamic Up-to-Date Calculation
O sistema SHALL registrar o progresso de consumo em episódios ou capítulos e computar dinamicamente a condição em dia desacoplada da situação de publicação da obra.

#### Scenario: Registro de progresso e cálculo da condição em dia
- **GIVEN** uma obra na biblioteca do usuário com total conhecido de 12 episódios
- **WHEN** o usuário atualiza o progresso para 12 episódios
- **THEN** o sistema SHALL registrar o progresso e computar a propriedade isUpToDate como verdadeira no retorno da API

#### Scenario: Manutenção da condição em dia para obras em andamento sem conclusão
- **GIVEN** uma obra com situação de publicação "EM_ANDAMENTO" e 8 episódios disponíveis
- **WHEN** o usuário atualiza seu progresso para 8 mantendo status "ASSISTINDO"
- **THEN** o sistema SHALL retornar isUpToDate verdadeiro sem alterar compulsoriamente o status pessoal para concluído

#### Scenario: Validação de limites de progresso contra o total de unidades
- **GIVEN** uma obra com total de 24 episódios cadastrados
- **WHEN** o usuário tenta registrar um progresso negativo ou superior ao total de unidades conhecidas
- **THEN** o sistema SHALL rejeitar o valor com HTTP 400 Bad Request descrevendo a violação de intervalo

### Requirement: Private Library Listing and Multi-User Isolation
O sistema SHALL listar os itens da biblioteca pessoal com suporte a filtros combinados por status e categoria, garantindo isolamento estrito entre usuários e bloqueio a acessos anônimos.

#### Scenario: Listagem da biblioteca pessoal com filtros por status e categoria
- **GIVEN** um usuário autenticado com múltiplas obras em sua biblioteca pessoal
- **WHEN** o usuário consulta `GET /api/v1/library` informando filtros de status pessoal e categoria
- **THEN** o sistema SHALL retornar a lista paginada contendo apenas as obras que satisfazem simultaneamente os critérios informados

#### Scenario: Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias
- **GIVEN** dois usuários distintos, Usuário A e Usuário B, cada um com itens em sua própria biblioteca
- **WHEN** o Usuário A lista sua biblioteca ou tenta alterar um item pertencente ao Usuário B
- **THEN** o sistema SHALL retornar apenas os itens do Usuário A e bloquear com HTTP 404 Not Found qualquer manipulação de itens de terceiros

#### Scenario: Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal
- **GIVEN** uma requisição sem cookie de sessão ou credenciais válidas
- **WHEN** um cliente tenta acessar qualquer endpoint de `/api/v1/library`
- **THEN** o sistema SHALL interceptar a chamada e responder com HTTP 401 Unauthorized
