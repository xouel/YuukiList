# Design: 031-dossier-and-calendar-typography-elevation

## Context

A arquitetura visual do YuukiList consolidou a paleta Asian Editorial e a infraestrutura de física tátil nas mudanças 028 a 030. No entanto, os componentes do Dossiê da Obra (`/items/[slug]`) herdaram hexadecimais brutos hardcoded (`#1A1820`, `#2B2735`, `#201D28`, `#F4EFEA`) gerados na mudança 025 anterior ao refactoring de tokens semânticos. Além disso, a imagem da capa do dossiê ainda contém dilatação de hover (`group-hover:scale-105`) e sobreposição artificial de badge ("#2 Global"). No Calendário Semanal (`/calendar`), a Weekly Strip e o relógio de fuso duplo necessitam de alinhamento óptico consistente e uso estrito de `tabular-nums` para erradicar tremores dimensionais (*layout jitter*).

## Goals / Non-Goals

**Goals:**
- Aplicar a tipografia editorial Shippori Mincho (`font-serif`) no título principal (H1) e subtítulos de seções principais do dossiê e cabeçalhos do calendário.
- Despoluir a capa do dossiê: remover badge flutuante sobreposto, erradicar `group-hover:scale-105` e fixar proporção 2:3 rígida com moldura sutil `border-stroke-subtle`.
- Substituir 100% dos hexadecimais brutos no dossiê por tokens semânticos (`bg-surface-*`, `border-stroke-*`, `text-[var(--color-text-*)]`, `accent`).
- Padronizar os 7 cartões da Weekly Strip com grid uniforme e contadores com `font-mono tabular-nums`.
- Garantir relógio de fuso duplo estável com números tabulares e ausência de deformação dimensional.

**Non-Goals:**
- Alterações em contratos de APIs do backend ou esquemas do Prisma.
- Adição de novas dependências externas de fontes ou bibliotecas de física.
- Redesenho estrutural da lógica de estado ou rotas de navegação.

## Decisions

1. **Adoção de Shippori Mincho (`font-serif`) nos Títulos Principais**
   - **Escolha:** Aplicar `font-serif tracking-tight` no H1 da obra, títulos de seções (Sinopse, Gerenciador de Episódios, Universo da Franquia) e cabeçalhos do calendário; manter `font-sans` nos blocos de leitura longa (sinopse e descrições) e `font-mono tabular-nums` para métricas e notas.
   - **Alternativas consideradas:** Manter fonte sans-serif genérica em toda a página; aplicar serifada em todo o texto incluindo a sinopse.
   - **Justificativa:** Equilibra autoridade visual da identidade editorial japonesa com alto conforto de leitura para parágrafos longos.

2. **Despoluição e Moldura da Capa do Dossiê**
   - **Escolha:** Excluir o badge absoluto "#2 Global" sobre a capa, remover `group-hover:scale-105`, fixar proporção 2:3 rígida com borda semântica `border-stroke-subtle` e fundo `bg-surface-sunken`.
   - **Alternativas consideradas:** Manter o badge no topo da capa; mover o badge para baixo da capa.
   - **Justificativa:** O poster da obra deve ser tratado como obra de arte cinematográfica, sem sobreposições artificiais de UI genérica.

3. **Purga Integral de Cores Hardcoded para Tokens Semânticos**
   - **Escolha:** Mapear `#1A1820` -> `bg-surface-base` / `bg-surface-raised`, `#201D28` -> `bg-surface-sunken` / `bg-surface-overlay`, `#2B2735` -> `border-stroke-subtle`, `#F4EFEA` -> `text-[var(--color-text-primary)]`, `#9E98A8` -> `text-[var(--color-text-secondary)]`, `#E05347` -> `text-accent` / `border-accent`.
   - **Alternativas consideradas:** Manter variáveis hexadecimais locais nos componentes.
   - **Justificativa:** Permite paridade instantânea e perfeita com o modo Light sem drift de design system.

4. **Alinhamento Óptico na Weekly Strip e Fuso Duplo**
   - **Escolha:** Fixar grid de 7 colunas proporcionais com contadores tabulares e selo minimalista HOJE; no fuso duplo, utilizar `font-mono tabular-nums` e cartões simétricos.
   - **Alternativas consideradas:** Largura variável com rolagem horizontal livre.
   - **Justificativa:** Elimina saltos de layout e preserva simetria visual broadsheet em desktop e tablets.

## Risks / Trade-offs

- **[Risco]** Títulos de obras muito extensos em `font-serif` ocuparem múltiplas linhas no Hero. → **Mitigação:** Uso de `tracking-tight leading-snug break-words` e escala responsiva de tamanho (`text-2xl sm:text-3xl lg:text-4xl`).
- **[Risco]** Falta de contraste de tokens semânticos no modo Claro. → **Mitigação:** Tokens já testados e aprovados nas suítes 028 e 029, garantindo contraste mínimo 4.5:1 WCAG 2.2 AA.

## Migration Plan

Não aplicável. Refatoração exclusivamente client-side sem persistência ou migração de banco de dados.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/dossier-calendar-typography.test.mjs` — Teste automatizado para verificar tipografia serifada, ausência de hexadecimais brutos, proporção de capa sem badges artificiais e números tabulares no calendário.
- `[MODIFY]` `apps/web/src/components/catalog/item-detail-view.tsx` — Tipografia `font-serif`, remoção de `#2 Global`, remoção de `group-hover:scale-105` e adoção de tokens semânticos.
- `[MODIFY]` `apps/web/src/components/catalog/dossier-metrics-strip.tsx` — Saneamento de cores hexadecimais para tokens semânticos.
- `[MODIFY]` `apps/web/src/components/catalog/dossier-sidebar.tsx` — Saneamento de cores hexadecimais para tokens semânticos e histograma tabular.
- `[MODIFY]` `apps/web/src/components/catalog/personal-tracking-console.tsx` — Saneamento de cores e física tátil.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-view.tsx` — Alinhamento da Weekly Strip e tipografia dos títulos.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx` — Fuso duplo com números tabulares e alinhamento geométrico.

## Data Model

Nenhuma alteração no modelo de dados ou no Prisma schema.

## Contracts

Nenhuma alteração nos contratos de API ou DTOs compartilhados.

## Research

- **Custo Zero Permanente:** A refinada hierarquia visual e tipográfica utiliza apenas CSS nativo e fontes já configuradas no Next.js (`Shippori Mincho` / `font-serif`), com custo operacional adicional igual a zero.
- **Prevenção de Jitter:** A propriedade `tabular-nums font-mono` força cada algarismo numérico a ocupar largura idêntica, impedindo que transições em tempo real (como o relógio JST ou contadores de progresso) desalinhem os elementos irmãos.

