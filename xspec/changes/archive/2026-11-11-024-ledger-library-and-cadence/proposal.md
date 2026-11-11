# Proposal: Ledger Library & Consumption Cadence (R24)

> **X-Spec** · ID: `024-ledger-library-and-cadence` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

A visualização atual da biblioteca em /library carece da profundidade analítica, clareza métrica e facilidade de registro rápido exibidas na referência de produto Ledger Pessoal v2.4. Atualmente, os usuários não dispõem de KPIs consolidados imediatos no topo da lista (como horas totais investidas e obras concluídas), busca textual instantânea dentro do próprio acervo carregado, avaliação rápida por popover nos cards ou visão panorâmica de cadência recente. Esta fatia refina a interface da biblioteca introduzindo o cabeçalho analítico com 3 KPIs, busca local instantânea com ordenação aprimorada, cards enriquecidos com seletor rápido de nota e atalho de diário, card pontilhado para importação global e o banner inferior de Cadência de Consumo com sparkline SVG dos últimos 30 dias.

## What Changes

- **Cabeçalho Ledger Pessoal com KPIs**: Inclusão de badge de versão editorial (`LEDGER PESSOAL V2.4`), indicador de sincronização e 3 cartões de KPI no topo da biblioteca:
  - `Concluídos` (total de obras com status finalizado);
  - `Em Andamento` (total de obras em acompanhamento ativo);
  - `Tempo Total` (horas totais estimadas com base em episódios/capítulos consumidos).
- **Botão Superior de Adicionar Obra**: Botão primário `+ Adicionar Obra` no cabeçalho direcionando para exploração e descoberta.
- **Barra de Controle com Busca Local e Ordenação**:
  - Campo de entrada `Filtrar nesta lista...` realizando busca textual instantânea em tempo real (título nativo e ocidental) sem requisição de rede;
  - Dropdown de ordenação com opções de *Última atualização*, *Nota pessoal*, *Título A-Z* e *Progresso*;
  - Alternador persistente de visualização (Grade / Lista).
- **Card Enriquecido e Card Pontilhado de Registro**:
  - Seletor popover inline de nota (`☆ 10 ★ ▾`) de 1 a 10 estrelas com salvamento instantâneo via API;
  - Botão de atalho para notas e resenhas do diário pessoal;
  - Card estilizado com borda pontilhada/tracejada *"Registrar Nova Obra"* com botão *"Pesquisa Global"* redirecionando para `/explore`.
- **Banner de Cadência de Consumo**:
  - Painel inferior consolidando consumo dos últimos 30 dias ("X episódios e Y capítulos registrados");
  - Métrica de destaque `MÉDIA DIÁRIA` (ex.: `2.4 eps`);
  - Gráfico responsivo em linha sparkline SVG com degradê suave;
  - Botão secundário de exportação rápida de dados da biblioteca em formato CSV.

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade criada; ampliação de capacidade existente.)*

### Modified Capabilities

- `personal-library-ui`: Adição do cabeçalho de Ledger com 3 KPIs, busca local instantânea com ordenação, ações de avaliação inline e card pontilhado, além do banner de cadência de consumo com sparkline SVG.

## Impact

- **Frontend**:
  - `apps/web/src/components/library/library-view.tsx`
  - `apps/web/src/components/library/library-header.tsx` (ou extensão de `library-view.tsx`)
  - `apps/web/src/components/library/library-filters.tsx`
  - `apps/web/src/components/library/library-card.tsx`
  - `apps/web/src/components/library/consumption-cadence-banner.tsx`
- **APIs / Backend**: Nenhuma alteração estrutural necessária no backend; as métricas e agregação dos 30 dias utilizam dados em memória dos clientes existentes `LibraryApiClient` e `DiaryApiClient`.
- **Dependências**: Zero novas dependências; cálculos em TypeScript puro e renderização com SVG nativo e Tailwind CSS.

## User Stories

### US1: Visão Analítica do Ledger Pessoal e Busca Local (P1)
Como usuário autenticado da biblioteca, quero visualizar KPIs consolidados do meu consumo no topo e filtrar obras instantaneamente por texto digitado, para gerenciar meu acervo com velocidade e sem recarregamentos.
**Independent Test:** Carregar `/library` com itens mockados, verificar a presença dos 3 cartões de KPI com valores calculados corretamente, digitar um termo de busca no input local e confirmar que a grade reflete os itens correspondentes em tempo real.

### US2: Cards Táteis com Avaliação Rápida e Acesso ao Diário (P2)
Como colecionador de animes e mangás, quero atribuir notas diretamente nos cards através de um popover ágil de estrelas e acessar o atalho de notas do diário, para manter meu registro atualizado sem abrir múltiplos modais.
**Independent Test:** Interagir com o gatilho de nota em um card da biblioteca, selecionar uma nova pontuação no menu flutuante e comprovar a emissão da requisição de atualização para a API com feedback visual imediato.

### US3: Card Pontilhado de Registro e Cadência de Consumo dos Últimos 30 Dias (P3)
Como entusiasta de acompanhamento, quero ver um card de atalho para adicionar novas obras via catálogo global e acompanhar minha média diária em um gráfico sparkline com opção de exportação CSV, para mensurar minha constância de entretenimento.
**Independent Test:** Verificar a renderização do card tracejado "Registrar Nova Obra" apontando para `/explore` e do banner de Cadência de Consumo com gráfico SVG proporcional e botão funcional de exportação CSV.

## Success Criteria

- **SC-001**: O cabeçalho da biblioteca renderiza os 3 KPIs analíticos (*Concluídos*, *Em Andamento*, *Tempo Total*) calculados de forma reativa a partir do acervo do usuário.
- **SC-002**: O campo de busca local filtra os itens instantaneamente por título em tempo de digitação (sub-16ms) sem disparar requisições HTTP redundantes.
- **SC-003**: Os cards da biblioteca oferecem popover inline de nota de 1 a 10 estrelas com atualização otimista e atalho direto para inserção de notas no diário.
- **SC-004**: A grade da biblioteca inclui o card pontilhado "Registrar Nova Obra" com botão de redirecionamento para o catálogo de exploração.
- **SC-005**: O rodapé da biblioteca renderiza o banner de Cadência de Consumo com total de unidades dos últimos 30 dias, média diária e gráfico de sparkline em SVG responsivo.
- **SC-006**: Todos os elementos interativos mantêm alvos de toque mínimos de 44x44px em conformidade com WCAG 2.2 AA.

## Edge Cases

- Usuário sem nenhuma obra registrada: KPIs exibem 0 e traço amigável no tempo total; banner de cadência indica 0 eps e linha base plana sem quebra de renderização.
- Busca local sem correspondência: exibe estado amigável "Nenhuma obra encontrada para esta busca" com botão para limpar o filtro de texto.
- Obras sem total conhecido de episódios: cálculo de tempo total considera os episódios efetivamente assistidos multiplicados pela duração média da mídia (24min para anime/dorama, 10min para capítulo de mangá).

## Out of Scope

- Edição de campos de metadados oficiais do catálogo da obra (escopo exclusivo de moderação / admin).
- Criação de novos endpoints de persistência no backend.

## Clarifications

### Session 2026-11-11
- Q: Como calcular os 3 KPIs do cabeçalho e a Cadência de Consumo dos últimos 30 dias? → A: Cálculo reativo no cliente (`useMemo` em TypeScript) utilizando os itens carregados da biblioteca e os registros do diário pessoal, garantindo zero latência, operação offline e custo R$ 0.
- Q: Para onde deve direcionar o botão "Pesquisa Global" no card tracejado "Registrar Nova Obra"? → A: Redirecionar para a rota `/explore` com foco no catálogo completo.
- Q: Como deve funcionar o botão de nota rápida nos cards? → A: Popover inline flutuante de 1 a 10 estrelas com atualização imediata via API e feedback visual.

