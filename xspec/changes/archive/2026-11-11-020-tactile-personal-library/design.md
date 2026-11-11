# Design: 020-tactile-personal-library

## Context

A tela de Biblioteca Pessoal (`/library`) gerencia o acervo privado de consumo do usuário (doramas, animes, mangás, manhwas e filmes), permitindo alternar entre grade e lista, acompanhar unidades consumidas e registrar notas. No entanto, o design anterior utilizava um painel recortado dissonante (`bg-[#121520]/50` com bordas tracejadas e cantos descompassados do shell), rótulos crus de progresso que não informavam o total de unidades (`Ep. 0` em vez de `Ep. 8/16`), ausência de barra visual de preenchimento, botões de avanço `+1` com área de clique minúscula que dificultavam a interação em telas sensíveis ao toque, selos de status pessoal posicionados na base da capa competindo com notas e contadores de reassistir, e abas de status que utilizavam termos ambíguos de obra (`Em Andamento` em vez de `Assistindo / Lendo`). Esta mudança resolve todas essas queixas através do Design System Asian Editorial.

## Goals / Non-Goals

**Goals:**
- Integrar a tela de biblioteca diretamente ao container unificado `max-w-7xl` da aplicação com a paleta Asian Editorial (nanquim `#121115`, superfície `#1A1820`, bordas `#2B2735` e acento `#E05347`), erradicando fundos recortados dissonantes.
- Substituir o rótulo cru de progresso por um componente rico que exibe o progresso em relação ao total conhecido (ex.: `Ep. 8/16` ou `Cap. 45/120`), acompanhado de barra de progresso visual proporcional e botão de incremento rápido `+1` com alvo de toque de no mínimo 44x44px (`min-w-[44px] min-h-[44px]`), em total conformidade com WCAG 2.2 AA.
- Reposicionar os selos de status pessoal (`Assistindo`, `Lendo`, `Pausado`, `Dropado`) para o topo do card junto com a categoria, liberando a base para estrelas de nota e contadores de reassistir.
- Reformular as abas de status da biblioteca em estilo pílula sutil com taxonomia desambiguada do usuário e contadores integrados.

**Non-Goals:**
- Não alterar as telas de Calendário (`/calendar`) ou Perfil (`/profile`), que serão tratadas nas fatias R21 e R22.
- Não alterar schemas de banco de dados ou contratos de backend da biblioteca (`/api/v1/library/items`), aproveitando a API estável já existente.

## Decisions

1. **Componente de Progresso Tátil com Alvo Acessível (44x44px)**
   - **Escolha:** Reestruturar o rodapé do card para acomodar uma linha de texto com o progresso relativo (`Ep. 8/16`), uma barra horizontal proporcional de preenchimento (`h-1.5 bg-[#2B2735]` com preenchimento em carmim `#E05347`) e um botão `+1` com classe `min-w-[44px] min-h-[44px]` com feedback tátil e sonoro visual.
   - **Alternativas consideradas:**
     - Botão minúsculo inline de 24px: descartado por violar critérios de acessibilidade móvel WCAG 2.2 AA e provocar cliques acidentais.
     - Campo numérico digitável direto no card: descartado por poluir a grade com inputs desnecessários (a edição fina permanece no modal).
   - **Justificativa:** Fornece sensação tátil e satisfatória de avanço rápido de episódios/capítulos em um toque, com clara percepção de completude através da barra visual.

2. **Reposicionamento dos Selos de Status do Usuário para o Topo**
   - **Escolha:** Mover os badges de status pessoal (`Assistindo`, `Lendo`, `Pausado`, `Dropado`) para o topo esquerdo do card, ao lado ou sob o badge de categoria editorial, mantendo a base da imagem reservada para notas (`★ 9.0`) e ciclos de reassistir (`↻ 2x`).
   - **Alternativas consideradas:**
     - Manter o status na base da capa: descartado devido a colisão com notas e contadores.
   - **Justificativa:** Cria uma hierarquia visual intuitiva onde a identidade e situação da obra residem no topo e as métricas de apreciação pessoal residem na base.

3. **Abas de Status em Estilo Pílula com Taxonomia Desambiguada**
   - **Escolha:** Mapear a aba `WATCHING_READING` para `Assistindo / Lendo` (em vez de `Em Andamento`) e renderizar as abas como botões em pílula com fundo mineral `#1A1820`, acento ativo carmim `#E05347` e contador numérico em pílula sutil.
   - **Alternativas consideradas:**
     - Abas com linha inferior estilo tabs clássicas: descartadas por poluir a leitura com muitas bordas horizontais.
   - **Justificativa:** Alinha o vocabulário à perspectiva do usuário e harmoniza esteticamente com as abas de categoria do catálogo.

## Risks / Trade-offs

- **[Risco]** Obras sem total de episódios/capítulos cadastrado (total nulo ou desconhecido) quebrarem o cálculo da barra de progresso → **Mitigação:** Tratar defensivamente: quando o total for desconhecido, exibir `Ep. X` sem barra proporcional ou com barra indeterminada sutil.
- **[Risco]** Alvo de toque de 44x44px estourar a altura do card em grades muito densas → **Mitigação:** Alinhar o botão no rodapé flexível com preenchimento centralizado e layout responsivo.

## Migration Plan

- Não requer migrações de dados ou deploys de backend.
- Alterações restritas aos componentes de interface em `apps/web/src/components/library/`.
- Rollback imediato via Git se necessário.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/components/library/library-helpers.ts` — Taxonomia desambiguada de abas e formatação contextual de progresso com total de unidades.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Componente tátil de progresso ("Ep. 8/16" + barra visual + alvo 44px), reposicionamento do status pessoal e badges editoriais.
- `[MODIFY]` `apps/web/src/components/library/library-filters.tsx` — Abas de status em estilo pílula sutil com contadores e seletores de categoria no plural.
- `[MODIFY]` `apps/web/src/components/library/library-view.tsx` — Remoção do painel recortado dissonante e alinhamento ao container global `max-w-7xl`.
- `[CREATE]` `tests/tactile-personal-library.test.mjs` — Testes de interface e validação de contratos de acessibilidade tátil.

## Data Model

Utiliza os DTOs existentes de `packages/shared`:
- `LibraryItemDto`: id, userId, mediaItemId, status (`PersonalStatus`), progress, progressVolumes, rating, isFavorite, rewatchCount, isUpToDate, mediaItem (`MediaItemSummaryDto`).
- `PersonalStatus`: `ASSISTINDO`, `LENDO`, `QUERO_ASSISTIR`, `QUERO_LER`, `CONCLUIDO`, `ASSISTIDO`, `PAUSADO`, `DROPADO`.

## Contracts

- **Ações no Card (`LibraryCardProps`)**:
  - `item: LibraryItemDto`
  - `onQuickIncrement?: (item: LibraryItemDto) => void`
  - `onToggleFavorite?: (item: LibraryItemDto) => void`
  - `onOpenEdit?: (item: LibraryItemDto) => void`
  - `isMutating?: boolean`
- **Abas e Filtros (`LibraryFiltersProps`)**:
  - `selectedTab: StatusTabKey`
  - `onTabChange: (tab: StatusTabKey) => void`
  - `selectedCategory: Category | 'ALL'`
  - `countsByTab?: Record<StatusTabKey, number>`

## Research

- **Custo Zero:** Uso estrito de utilitários Tailwind CSS nativos e React hooks existentes.
- **Acessibilidade Tátil:** Alvos de clique de no mínimo 44x44px conforme recomendação internacional WCAG 2.2 Critério de Sucesso 2.5.8 (Target Size).

