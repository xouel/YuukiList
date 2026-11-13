# Spec Delta

## MODIFIED Requirements

### Requirement: Local Timezone Conversion and Reliability Badges
A interface SHALL converter horários com `tabular-nums`, exibir badges de confiabilidade, eliminar `hover:scale-105`, garantir fallback resiliente de capas em caso de erro de carregamento nos cards e barra lateral, e enviar payload `{ progress }` com registro no endpoint `/api/v1/diary` na ação `+1 Visto`.

#### Scenario: Formatacao automatica para o fuso local do usuario
- **GIVEN** um evento registrado com horario definido em UTC ou fuso da regiao de origem
- **WHEN** o card do evento e exibido na interface do calendario
- **THEN** o sistema SHALL apresentar o horario ajustado ao fuso local com números tabulares preservando a indicacao da regiao de origem

#### Scenario: Exibicao visual de badge de confiabilidade
- **GIVEN** um evento com confiabilidade marcada como ESTIMATED ou UNCONFIRMED
- **WHEN** o card do evento e renderizado
- **THEN** a interface SHALL exibir um badge visual com estilo de alerta sutil indicando Data Estimada ou Nao Confirmada

#### Scenario: Card de lancamento despoluido com destaque para horario e titulo
- **GIVEN** um card de lancamento sendo renderizado na linha do tempo
- **WHEN** a interface apresenta as informacoes da obra
- **THEN** o card SHALL priorizar o horario local em formato tabular, titulo editorial e capa sem distorção hover:scale-105, eliminando acumulo de micro-badges

#### Scenario: Acao rapida de lembrar ou seguir no card de lancamento
- **GIVEN** um evento de lancamento futuro exibido no calendario
- **WHEN** o usuario clica no botao rapido de lembrar ou seguir a obra
- **THEN** o sistema SHALL responder com micro-pressão no toque, alternar o estado de acompanhamento e fornecer feedback visual imediato

#### Scenario: Acao rapida de mais um visto no card de lancamento integrada a biblioteca
- **GIVEN** um evento de lançamento de obra que o usuário possui em acompanhamento na biblioteca
- **WHEN** o usuário aciona o botão de incremento rápido no card
- **THEN** o sistema SHALL responder com micro-pressão no clique (:active:scale-[0.98]), atualizar o progresso enviando `{ progress }` na biblioteca, registrar o evento via `/api/v1/diary` e alterar o estado do botão com alvo tátil de 44x44px

#### Scenario: Fallback resiliente de capas nos cards e sidebar do calendario
- **GIVEN** um card de evento ou item da barra lateral Mais Esperados com URL de capa externa ou ausente
- **WHEN** a imagem falha ao carregar no navegador
- **THEN** o elemento `<img>` SHALL acionar fallback automático para `/api/v1/catalog/items/:slug/cover` garantindo exibição contínua da capa da obra

