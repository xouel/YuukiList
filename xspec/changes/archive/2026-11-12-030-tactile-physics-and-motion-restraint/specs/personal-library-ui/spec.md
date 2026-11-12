# Spec Delta: personal-library-ui

## MODIFIED Requirements

### Requirement: Quick Progress Tracking and Detail Modal
O sistema SHALL disponibilizar controle de progresso tátil com micro-pressão (:active:scale-[0.98]), números tabulares (tabular-nums), ausência de zoom agressivo (hover:scale-105), barra proporcional, alvo mínimo de 44x44px, popover de estrelas e modal detalhado.

#### Scenario: Incremento rapido de unidade com atualizacao otimista
- **GIVEN** uma série com episódios disponíveis e botão de incremento visível
- **WHEN** o usuário clica na ação de avançar um episódio
- **THEN** o sistema SHALL responder com micro-pressão física no clique, atualizar otimisticamente a contagem na interface e sincronizar com o backend em segundo plano

#### Scenario: Exibicao destacada do badge Em dia para obras alcancadas
- **GIVEN** uma obra cujo progresso atinge o total de unidades disponíveis
- **WHEN** a biblioteca é renderizada ou o progresso é atualizado
- **THEN** o sistema SHALL exibir com destaque o selo visual Em dia junto ao status pessoal da obra

#### Scenario: Edicao de status e nota pessoal atraves do modal detalhado
- **GIVEN** uma obra listada na biblioteca pessoal
- **WHEN** o usuário aciona a opção de editar detalhes da obra
- **THEN** o sistema SHALL abrir o modal permitindo ajustar status, nota de zero a dez, progresso e notas privadas

#### Scenario: Controle tatil com barra de progresso visual e alvo minimo de toque de 44px
- **GIVEN** uma obra em andamento com total de episódios ou capítulos conhecido
- **WHEN** o card da obra é visualizado pelo usuário
- **THEN** a interface exibe o progresso no formato Ep. X/Y com números tabulares e barra visual proporcional, provendo botão de avanço com área tátil mínima de 44x44px sem dilatação hover:scale-105

#### Scenario: Avaliacao rapida inline com popover de estrelas e atalho para diario
- **GIVEN** um card de obra exibido na biblioteca
- **WHEN** o usuário interage com o seletor de estrelas no rodapé do card
- **THEN** o sistema SHALL abrir um popover flutuante para escolha de nota de 1 a 10 com persistência imediata e prover botão de atalho para notas do diário

