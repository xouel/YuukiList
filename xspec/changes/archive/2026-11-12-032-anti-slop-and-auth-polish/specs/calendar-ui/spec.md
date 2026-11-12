# calendar-ui Specification Delta

## MODIFIED Requirements

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

