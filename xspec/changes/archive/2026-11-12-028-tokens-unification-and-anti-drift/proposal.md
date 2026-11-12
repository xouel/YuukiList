# Proposal: Unificacao de Design Tokens e Saneamento Anti-Drift

> **X-Spec** · ID: `028-tokens-unification-and-anti-drift` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

O frontend do YuukiList acumulou mais de 1.400 referencias hexadecimais inline hardcoded espalhadas pelos componentes, alem de 45 remocoes de foco sem :focus-visible. Essa dispersao quebra a consistencia visual do Design System Asian Editorial, degrada a paridade entre modo Escuro e Claro e dificulta manutencoes de acessibilidade. Esta mudanca unifica os tokens semanticos (superficies minerais, contornos de refracao, acentos de midia e aneis de foco) em globals.css e tailwind.config.ts, saneando classes literais nos componentes centrais sem alterar regras de negocio.

## What Changes

- Definicao de tokens semanticos completos em `apps/web/src/app/globals.css` para Dark e Light mode: superficies minerais (`--surface-canvas`, `--surface-raised`, `--surface-overlay`, `--surface-sunken`), contornos e refracao (`--stroke-subtle`, `--stroke-strong`, `--stroke-accent`, `--highlight-hairline`) e acentos de midia (`--accent-media-video`, `--accent-media-print`, `--accent-media-anime`).
- Mapeamento dessas variaveis no `apps/web/tailwind.config.ts` sob `extend.colors` e `extend.boxShadow` com suporte a classes utilitarias limpas.
- Implementacao de regra global e utilitario semantico `:focus-visible` com anel carmim de 2px e offset de 2px, saneando as 45 advertencias de acessibilidade em controles interativos.
- Substituicao de hexadecimais literais e fragmentacao de cinzas (`zinc-*`) nos componentes centrais da casca (`navigation-shell.tsx`), do inicio (`home-hub-view.tsx`, `hero-spotlight.tsx`), do catalogo (`catalog-view.tsx`, `media-card.tsx`), da biblioteca (`ledger-header.tsx`, `library-card.tsx`), do calendario (`calendar-header-kpis.tsx`, `calendar-sidebar-widgets.tsx`) e da autenticacao (`auth-dossier-card.tsx`).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `navigation-shell`: Expandir o requisito de selecao de tema e fundacoes de acessibilidade para estipular a arquitetura de tokens semanticos, cores bimodais de categoria e conformidade com anel de foco :focus-visible.

## Impact

- `apps/web/src/app/globals.css`: Adicao de variaveis semanticas para Dark/Light e utilitarios de foco/hairline.
- `apps/web/tailwind.config.ts`: Mapeamento de tokens semanticos em colors e boxShadow.
- Componentes em `apps/web/src/components/`: Atualizacao de classes utilitarias de cores hardcoded para classes semanticas.
- Zero alteracoes em endpoints backend, Prisma ou banco de dados.

## User Stories

### US1 — Navegacao Coerente em Modo Claro e Escuro (Priority: P1)

Como usuario do YuukiList, desejo alternar entre o tema Escuro (Nanquim) e Claro (Papel) e ver todas as superficies, bordas, badges de midia e textos adaptados harmonicamente sem cores duras residuais ou contraste quebrado.

- **Why this priority:** Garante a legibilidade basica, WCAG 2.2 AA e estetica refinada sem regressao visual em nenhuma tela.
- **Independent Test:** Carregar `/`, `/explore`, `/library` e `/calendar` em modo escuro e claro, verificando que variaveis semanticas governam o visual e nenhuma superficie apresenta contraste inferior a 4.5:1.

### US2 — Indicador de Foco Visivel e Acessivel por Teclado (Priority: P2)

Como usuario navegando por teclado (Tab/Shift+Tab), desejo visualizar claramente um anel de foco carmim com 2px de espessura e deslocamento visivel ao focar em qualquer elemento interativo, sem anulacoes cegas de outline.

- **Why this priority:** Requisito normativo de acessibilidade WCAG 2.2 AA (Success Criterion 2.4.7 Focus Visible).
- **Independent Test:** Navegar via teclado pelos botoes e abas da Top Command Bar e dos cards, comprovando anel visivel carmim.

### US3 — Identificacao Cromatica Semantica por Tipo de Midia (Priority: P3)

Como colecionador de obras asiaticas, desejo identificar rapidamente se uma obra e Audiovisual (Dorama/Filme, tom ocre), Impressa (Manga/Manhwa/Manhua, tom terracota) ou Animacao (tom lavanda) atraves de tokens calibrados para ambos os temas.

- **Why this priority:** Melhora a ergonomia cognitiva na exploracao do catalogo e na gestao da biblioteca.
- **Independent Test:** Inspecionar os badges de categoria em `/explore` e `/library` no modo claro e escuro, validando classes semanticas.

## Success Criteria

- **SC-001**: O arquivo `globals.css` exporta tokens semanticos completos para Dark e Light mode cobrindo canvas, superficies, bordas de refracao, acentos de midia e anel de foco.
- **SC-002**: O arquivo `tailwind.config.ts` disponibiliza classes semanticas de cores e sombras que mapeiam diretamente para as variaveis CSS.
- **SC-003**: 100% dos controles com `outline-none` nos componentes centrais possuem anel de foco semantico `:focus-visible` ativo e contrastante.
- **SC-004**: Execucao de `npm --prefix apps/web run build` sem erros de tipagem TypeScript ou compilacao CSS.

## Edge Cases

- Elementos com opacidade customizada (ex.: sintaxe `/20`): devem mapear para canais ou variaveis compativeis com Tailwind sem quebrar estilizacao.
- Navegadores com suporte a `prefers-color-scheme` que nao tenham selecionado tema manual: deve preservar o tema Dark padrao salvo sem flicker.

## Out of Scope

- Mudancas estruturais na disposicao do layout de cards ou fatiamento de componentes (escopo de R29).
- Adicao de novas bibliotecas de animacao ou alteracoes no backend NestJS / banco de dados.

## Clarifications

### Session 2026-11-11
- Q: Como estruturar os tokens no Tailwind? → A: Mapear tokens em extend.colors do Tailwind apontando para variaveis CSS var(--...), permitindo classes semanticas limpas.
- Q: Como tratar cores especificas de categorias (ocre, lavanda, terracota)? → A: Criar tokens semanticos dedicados (--accent-media-video, --accent-media-print, --accent-media-anime) com pares calibrados para Dark e Light.
- Q: Como resolver os erros de anel de foco (:focus-visible)? → A: Implementar regra global e utilitario semantico com anel carmim e offset de 2px em globals.css, sanando os controles interativos na raiz.

