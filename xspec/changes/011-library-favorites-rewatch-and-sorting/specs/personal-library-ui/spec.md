# Spec Delta

## ADDED Requirements

### Requirement: Interactive Favorites, Rewatch Actions and Inconsistency Warnings
A interface da biblioteca pessoal SHALL disponibilizar alternância ágil de favoritos com um clique, modal interativo para registrar novo ciclo ou contador de reassistir, controle de volumes e alertas não-bloqueantes de inconsistência.

#### Scenario: Alternancia imediata de favorito no card ou linha
- **GIVEN** uma obra exibida na biblioteca pessoal
- **WHEN** o usuário clica no botão de coração de favoritos
- **THEN** a interface SHALL atualizar o estado visual otimisticamente e persistir a alteração via API

#### Scenario: Execucao de acao de reassistir ou reler no modal
- **GIVEN** o modal de detalhes de uma obra concluída aberto
- **WHEN** o usuário seleciona a opção de iniciar novo ciclo de reassistir ou incrementar contador
- **THEN** o sistema SHALL disparar a atualização adequada e refletir o novo ciclo e contador no card da obra

#### Scenario: Exibicao de aviso amigavel sobre inconsistencia entre status e progresso
- **GIVEN** o modal de edição de obra aberto na biblioteca
- **WHEN** o usuário altera o status para Concluído mantendo o progresso inferior ao total conhecido de episódios ou capítulos
- **THEN** a interface SHALL renderizar um aviso informativo não-bloqueante alertando sobre a disparidade sem impedir a gravação
