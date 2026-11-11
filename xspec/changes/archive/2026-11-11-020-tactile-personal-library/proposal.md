# Proposal: Redesign Tátil da Biblioteca Pessoal e Controle de Progresso

> **X-Spec** · ID: `020-tactile-personal-library` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

A tela 'Minha Biblioteca' ('/library') apresenta atualmente dissonâncias visuais e ergonômicas apontadas na revisão de design: o layout utiliza um fundo recortado que quebra a harmonia do container global, o controle de progresso nos cards exibe apenas um rótulo descontextualizado ('Ep. 0') sem indicar o total de episódios/capítulos e sem barra visual de avanço, o botão de incremento rápido '+1' possui área de toque excessivamente reduzida violando diretrizes de acessibilidade tátil (WCAG 2.2 AA) e os selos de status do usuário misturam-se com os metadados inferiores da capa. Esta mudança redesenha a biblioteca no padrão Asian Editorial: integra o layout ao container global unificado sem fundos recortados, introduz componente completo de progresso ('Ep. 8/16') com barra visual proporcional e alvo de toque confortável de 44x44px, reposiciona o selo de status no canto superior e adota abas limpas com contadores em estilo pílula.

## What Changes

- **Integração Plena ao Container Global**: Eliminação do painel recortado dissonante na tela de biblioteca, integrando a página diretamente ao container unificado `max-w-7xl` com a paleta Asian Editorial (nanquim `#121115`, superfície `#1A1820` e bordas `#2B2735`).
- **Controle de Progresso Tátil e Visual**: Substituição do rótulo cru por um componente rico que exibe o progresso em relação ao total conhecido (ex.: `Ep. 8/16` ou `Cap. 45/120`), acompanhado de barra de progresso visual proporcional e botão de incremento rápido com área de toque mínima acessível de 44x44px.
- **Reposicionamento do Selo de Status do Usuário**: Mapeamento do status pessoal (`Assistindo`, `Lendo`, `Pausado`, `Dropado`) para o canto superior do card, sem encobrir a arte principal nem colidir com notas ou favoritos.
- **Abas Inteligentes em Estilo Pílula**: Reformulação das abas de status (`Todos`, `Assistindo / Lendo`, `Planejados`, `Concluídos`, `Pausados`, `Dropados`) em botões pílula refinados com contadores discretos integrados.
- **Badges de Categoria Editoriais e Tipografia**: Unificação de categorias para o plural (Doramas, Filmes, Animes, Mangás, Manhwas, Manhuas) com paleta bimodal editorial e títulos em serifa moderna.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `personal-library-ui`: Atualização dos requisitos da interface de biblioteca pessoal com remoção do painel recortado, introdução da barra de progresso visual com alvo de toque tátil de 44px, reposicionamento do status pessoal no canto superior e abas em pílula com taxonomia desambiguada.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/components/library/library-view.tsx`: Integração da casca global e paleta Asian Editorial.
  - `apps/web/src/components/library/library-card.tsx`: Novo componente tátil de progresso ("Ep. 8/16" + barra visual + alvo 44px) e reposicionamento do selo de status.
  - `apps/web/src/components/library/library-filters.tsx`: Abas em estilo pílula sutil com contadores e taxonomia de usuário desambiguada.
  - `apps/web/src/components/library/library-helpers.ts`: Ajuste nos rótulos canônicos de abas e formatação contextual de progresso com total de unidades.
- **Banco de Dados & APIs**: Zero impacto estrutural (reutiliza entidades existentes de `UserLibraryItem`).
- **Testes**: Criação da suíte de testes de interface e acessibilidade tátil em `tests/tactile-personal-library.test.mjs`.

## User Stories

### US1 — Navegação por Abas em Pílula e Integração com Container Global (Priority: P1)
Como usuário navegando pela minha biblioteca, quero alternar entre os status de consumo em abas elegantes em estilo pílula e desfrutar de um layout fluido e sem caixas recortadas dissonantes.

- **Why this priority:** Harmoniza a biblioteca com a casca global e desambigua a taxonomia de status do usuário.
- **Independent Test:** Acessar `/library`, verificar a ausência de painéis recortados e clicar nas abas pílula verificando a contagem de itens em cada status.

### US2 — Controle Tátil de Progresso com Barra Visual e Alvo Acessível (Priority: P1)
Como usuário acompanhando lançamentos no smartphone ou desktop, quero visualizar claramente a fração consumida (ex.: `Ep. 8/16`) com uma barra de preenchimento e poder avançar com facilidade em um botão confortável de 44px.

- **Why this priority:** Resolve a queixa de botões minúsculos inalcançáveis e rótulos crus que não mostravam o progresso relativo.
- **Independent Test:** Visualizar cards de séries em andamento, conferir a renderização do formato `Ep. X/Y` com barra de progresso e avançar uma unidade clicando no alvo de toque de 44px.

### US3 — Selos de Status Desambiguados e Reposicionados (Priority: P2)
Como usuário organizando meu acervo, quero que os selos de status pessoal fiquem posicionados de forma limpa no topo do card, sem disputar espaço com a nota ou botão de favoritos.

- **Why this priority:** Limpa a base da capa e previne sobreposição de metadados essenciais.
- **Independent Test:** Verificar que o selo de status pessoal é renderizado no topo do card e não encobre informações de nota ou contadores na base.

## Success Criteria

- **SC-001**: A tela de biblioteca integra-se ao container `max-w-7xl` da aplicação sem bordas ou painéis recortados dissonantes.
- **SC-002**: Cada card de obra em andamento exibe o progresso no formato `Ep. X/Y` (ou `Cap. X/Y`) acompanhado de barra visual de preenchimento proporcional e botão de incremento rápido com área mínima de 44x44px.
- **SC-003**: As abas de status utilizam estilo pílula sutil com rótulos de usuário (`Assistindo / Lendo`, `Planejados`, `Concluídos`, `Pausados`, `Dropados`) e contadores numéricos integrados.

## Edge Cases

- Obras com número desconhecido de episódios/capítulos (total indeterminado) devem exibir `Ep. X` sem barra de progresso proporcional ou com barra indeterminada suave.
- Filmes (categoria `FILME`) devem omitir a barra de progresso episódico e botão de incremento, exibindo o status de exibição correspondente.
- Usuários sem nenhum item na biblioteca visualizam o estado vazio acolhedor perfeitamente alinhado à estética editorial.

## Out of Scope

- Redesign do Calendário de lançamentos semanal e turnos (escopo da fatia R21).
- Inversão da vitrine de favoritos do Perfil (escopo da fatia R22).

## Clarifications

### Session 2026-11-10
- Q: Como evitar que o botão '+1' continue sendo difícil de clicar em telas touch? → A: Aplicar tamanho mínimo de 44x44px (`min-w-[44px] min-h-[44px]`) conforme as diretrizes WCAG 2.2 AA para alvos de toque tátil.
- Q: Como exibir o progresso quando o total de episódios é conhecido? → A: Formatar como `Ep. X/Y` (ex.: `Ep. 8/16`) e renderizar uma barra fina de progresso visual (`h-1.5`) na cor de destaque carmim.
- Q: Qual a nomenclatura oficial para a aba de obras em andamento na biblioteca? → A: Utilizar `Assistindo / Lendo` em vez de `Em Andamento` para desambiguar do status de publicação da obra.

