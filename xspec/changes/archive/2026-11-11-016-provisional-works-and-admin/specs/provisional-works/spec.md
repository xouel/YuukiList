# Spec Delta: provisional-works

## Purpose

Define os contratos e comportamentos normativos para o cadastro de solicitações de inclusão de obras provisórias por usuários, análise heurística de duplicidade via similaridade trigram e vínculo com a biblioteca pessoal.

## ADDED Requirements

### Requirement: Provisional Media Item Submission and Duplication Detection
O sistema SHALL receber solicitações de inclusão de obras contendo título, categoria canônica, formato, ano estimado e país de origem, executando verificação prévia de duplicatas com algoritmo trigram similarity (`pg_trgm`) com limiar mínimo de 0.35 para alertar o usuário sem bloquear o envio em casos legítimos.

#### Scenario: Submissao de obra provisoria com deteccao de similaridade
- **GIVEN** que o usuário preenche o formulário de inclusão com título similar a uma obra já existente no catálogo
- **WHEN** o sistema processa a verificação de duplicidade com pontuação de similaridade maior ou igual a 0.35
- **THEN** o sistema SHALL apresentar a lista de obras candidatas para conferência e permitir que o usuário confirme o envio caso se trate de obra distinta.

#### Scenario: Submissao sem correspondencia proxima direta
- **GIVEN** que o usuário informa os dados de uma obra inédita sem correspondência com limiar mínimo de similaridade
- **WHEN** a solicitação é enviada para registro
- **THEN** o sistema SHALL persistir a solicitação com status PENDENTE e gerar um identificador provisório para a obra.

### Requirement: Provisional Item Personal Library Integration and Lifecycle Tracking
O sistema SHALL disponibilizar a obra provisória imediatamente na biblioteca pessoal do solicitante com badge indicativo de provisório e permitir o acompanhamento do ciclo de vida da solicitação nos estados PENDENTE, EM_ANALISE, APROVADA e RECUSADA com justificativa.

#### Scenario: Adicao automatica de obra provisoria na biblioteca do solicitante
- **GIVEN** que a solicitação de obra provisória foi gravada com sucesso
- **WHEN** o usuário solicitante acessa sua biblioteca pessoal
- **THEN** a obra provisória SHALL aparecer na lista com identificador especial e permitir atualização imediata de progresso e status pessoal.

#### Scenario: Atualizacao de status da solicitacao e feedback para o usuario
- **GIVEN** uma solicitação registrada pelo usuário
- **WHEN** o moderador altera o estado para EM_ANALISE, APROVADA ou RECUSADA
- **THEN** o sistema SHALL registrar a justificativa quando recusada e disponibilizar o status atualizado na consulta do solicitante.

