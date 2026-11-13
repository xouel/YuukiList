# Spec Delta

## MODIFIED Requirements

### Requirement: Chronological History Event Tracking and Lifecycle
O sistema SHALL persistir eventos cronológicos de histórico pelos endpoints `/api/v1/diary` e `/api/v1/diary/:id` alinhados ao `DiaryController` (`list`, `create`, `update`, `remove`) e `DiaryApiClient`, mantendo o desacoplamento estrito entre histórico e biblioteca.

#### Scenario: Geracao automatica de evento de historico ao avancar progresso
- **GIVEN** um usuário autenticado com uma obra em andamento na biblioteca
- **WHEN** o usuário atualiza o progresso para uma unidade superior
- **THEN** o sistema SHALL registrar um evento de histórico do tipo PROGRESS_UPDATE contendo a obra, a unidade anterior, a unidade atual e a data da ocorrência

#### Scenario: Criacao manual de evento e anotacao no diario
- **GIVEN** um usuário autenticado com acesso à sua biblioteca ou diário
- **WHEN** o usuário cria um registro manual informando obra, texto da reflexão e data personalizada
- **THEN** o sistema SHALL salvar o evento via `POST /api/v1/diary` acionando `DiaryController.create` sem retornar HTTP 404 ou erro de método inexistente

#### Scenario: Exclusao de evento sem impacto no estado da biblioteca
- **GIVEN** um evento de histórico registrado previamente para uma obra com status Concluído
- **WHEN** o usuário exclui o referido evento da linha do tempo
- **THEN** o sistema SHALL remover o evento via `DELETE /api/v1/diary/:id` acionando `DiaryController.remove` mantendo intactos status, nota e progresso na biblioteca

