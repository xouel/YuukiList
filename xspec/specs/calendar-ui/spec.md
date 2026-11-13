# calendar-ui Specification

## Purpose

Fornecer a interface da rota `/calendar` no padrao Dark Editorial, permitindo navegacao intuitiva entre as tres visoes canonicas, selecao de periodos semanal e mensal, agrupamento diario e adaptacao de horarios ao fuso local.

## Requirements

### Requirement: Responsive Calendar Timeline with Day Grouping
A interface SHALL renderizar a página /calendar com cabeçalho limpo sem etiqueta eyebrow de temporada, Weekly Strip de sete dias com alinhamento óptico uniforme e números tabulares, agrupamento por turnos em grade assimétrica e barra lateral analítica com relógio de fuso duplo estável, sem emojis.

#### Scenario: Alternancia entre as tres abas de visualizacao
- **GIVEN** a pagina de calendario carregada na visao de Lancamentos Gerais
- **WHEN** o usuario seleciona a aba Acompanhamento ou Minha Agenda
- **THEN** a interface SHALL atualizar a lista de eventos instantaneamente exibindo apenas os itens correspondentes a visao selecionada

#### Scenario: Agrupamento cronologico diario de lancamentos
- **GIVEN** multiplos eventos de lancamento para datas distintas de uma mesma semana
- **WHEN** a grade ou lista de calendario e renderizada
- **THEN** o sistema SHALL agrupar os cards por dia da semana com cabecalhos de data claros, titulos, capas, categorias e tipo de evento

#### Scenario: Navegacao por Weekly Strip horizontal com selecao de dia
- **GIVEN** a visualizacao semanal do calendario carregada
- **WHEN** o usuario clica em um dia na Weekly Strip horizontal com sete dias da semana
- **THEN** a interface SHALL destacar o dia selecionado e filtrar ou posicionar os lancamentos correspondentes a data escolhida

#### Scenario: Agrupamento de lancamentos diarios por turnos do dia
- **GIVEN** multiplos eventos de lancamento cadastrados para um mesmo dia
- **WHEN** o grupo diario e renderizado na interface
- **THEN** o sistema SHALL organizar os cards em secoes de turnos: Manha (06:00 as 11:59), Tarde (12:00 as 17:59) e Noite (18:00 as 05:59)

#### Scenario: Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE
- **GIVEN** a tela /calendar carregada no navegador
- **WHEN** o cabeçalho ao vivo e a Weekly Strip são exibidos
- **THEN** a aplicação SHALL renderizar três KPIs consolidados e destacar a data atual com o selo textual HOJE, omitindo etiquetas eyebrow decorativas de temporada ('Temporada de Outono 2026')

#### Scenario: Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal
- **GIVEN** a exibição do calendário em tela ampla
- **WHEN** a coluna lateral de quatro slots é carregada
- **THEN** a interface SHALL apresentar relógio comparativo de fuso local e JST Tóquio, vitrine dos mais esperados e botão de download client-side de arquivo .ics para calendários externos

#### Scenario: Alinhamento optico uniforme e numeros tabulares na Weekly Strip
- **GIVEN** a visualização da Weekly Strip de 7 dias no calendário
- **WHEN** os botões diários são renderizados
- **THEN** a interface SHALL exibir os 7 dias com largura e altura balanceadas, contadores de eventos em font-mono tabular-nums e selo minimalista HOJE sem oscilação

#### Scenario: Relogio de fuso duplo comparativo com numeros tabulares estaveis
- **GIVEN** o painel lateral de widgets do calendário
- **WHEN** o relógio de transmissão ao vivo (Local vs JST Tóquio) é exibido
- **THEN** a interface SHALL renderizar ambos os horários com font-mono tabular-nums sem causar salto ou layout jitter no card

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
