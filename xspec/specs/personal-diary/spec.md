# personal-diary Specification

## Purpose

Prover o subsistema de histórico cronológico e diário pessoal no YuukiList, registrando eventos de consumo automáticos e manuais de forma independente do estado atual da biblioteca, com suporte a anotações contextuais vinculadas a episódios ou capítulos e controle granular de privacidade e proteção contra spoilers.

## Requirements

### Requirement: Chronological History Event Tracking and Lifecycle
O sistema SHALL persistir eventos cronológicos de histórico no PostgreSQL/Supabase via Prisma ORM (`DiaryRepository` com fallback em memória apenas quando instanciado sem `PrismaClient` em testes) pelos endpoints `/api/v1/diary` e `/api/v1/diary/:id` alinhados ao `DiaryController` (`list`, `create`, `update`, `remove`) e `DiaryApiClient`, mantendo o desacoplamento estrito entre histórico e biblioteca.

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

#### Scenario: Persistencia duravel do diario no PostgreSQL entre reinicios
- **GIVEN** o `DiaryRepository` inicializado com instância ativa de `PrismaClient` conectada ao Supabase PostgreSQL
- **WHEN** eventos do diário são criados, atualizados, filtrados ou excluídos e uma nova instância do repositório consulta os mesmos dados
- **THEN** o sistema SHALL ler e gravar diretamente na tabela relacional `history_events` preservando todos os registros após reinícios ou cold starts serverless

### Requirement: Episode and Chapter Notes with Smart Spoiler Masking
O backend do diário pessoal SHALL suportar anotações vinculadas a episódios, capítulos ou volumes específicos e computar dinamicamente a necessidade de mascaramento de spoiler com base no progresso registrado do usuário visualizador.

#### Scenario: Ocultacao automatica de nota com spoiler para progresso inferior
- **GIVEN** uma anotação marcada com spoiler vinculada ao episódio 8 de uma série
- **WHEN** a anotação é consultada por um visitante anônimo ou por usuário autenticado cujo progresso registrado na obra é inferior ao episódio 8
- **THEN** o sistema SHALL retornar a anotação com indicador de spoiler ativo e conteúdo sinalizado para ocultação preventiva

#### Scenario: Exibicao direta de nota com spoiler para progresso igual ou superior
- **GIVEN** uma anotação marcada com spoiler vinculada ao capítulo 45 de um mangá
- **WHEN** a anotação é consultada pelo autor ou por usuário com progresso registrado maior ou igual a 45
- **THEN** o sistema SHALL retornar o conteúdo legível sem mascaramento compulsório
