# Design: 028-tokens-unification-and-anti-drift

## Context

O frontend do YuukiList foi construído com base no Design System Asian Editorial, mas ao longo das iterações acumulou mais de 1.400 valores hexadecimais literais inline (`#1A1820`, `#201D28`, `#2B2735`, `#E05347`, `#D4A373`, `#9D8DF1`, `#D97757`) e 188 classes `zinc-*`. Essa dispersão gera drift cromático, enfraquece o suporte ao modo Claro (`[data-theme="light"]`) e gerou 45 erros de anel de foco identificados pela ferramenta `@21st-dev/cli`.
Esta mudança estabelece um vocabulário semântico padronizado em CSS e no Tailwind CSS, eliminando cores mágicas nos componentes centrais sem alterar regras de negócio.

## Goals / Non-Goals

**Goals:**
- Definir tokens semânticos completos em `apps/web/src/app/globals.css` para superfícies minerais, contornos com refração, acentos de mídia bimodais e anel de foco.
- Mapear esses tokens em `apps/web/tailwind.config.ts` (`extend.colors` e `extend.boxShadow`) permitindo classes utilitárias semânticas diretas (`bg-surface-raised`, `border-stroke-subtle`, `text-media-video` etc.).
- Implementar regra e utilitário global de `:focus-visible` com anel carmim de 2px e offset de 2px, saneando as 45 advertências de acessibilidade em controles interativos.
- Refatorar componentes centrais para utilizar as novas classes semânticas, garantindo paridade instantânea e contraste WCAG 2.2 AA (>= 4.5:1) em modo Claro e Escuro.

**Non-Goals:**
- Não alterar a estrutura de layout ou o fatiamento de componentes (escopo do Épico E4 / R29).
- Não introduzir bibliotecas externas de estilização ou componentes UI de terceiros.
- Não alterar contratos de API backend, tabelas do banco de dados ou schemas do Prisma.

## Decisions

1. **Arquitetura de Tokens via Variáveis CSS e Mapeamento no Tailwind:**
   - **Escolha:** Definir propriedades customizadas CSS em `:root` (tema Dark padrão) e `[data-theme="light"]` em `globals.css`, e expô-las no `tailwind.config.ts` através de `colors` e `boxShadow`.
   - **Alternativas consideradas:**
     - Classes utilitárias fixas em CSS puro: Rejeitado porque perderia o autocomplete do Tailwind e a capacidade de usar variantes de opacidade (`/10`, `/20`).
     - Substituição massiva cega via script regex em 100% dos arquivos: Rejeitado por alto risco de regressão visual não testada em telas secundárias.
   - **Justificativa:** Proporciona classes expressivas (`bg-surface-raised`, `border-stroke-subtle`) que respeitam o tema ativo automaticamente via cascata de CSS sem custo de runtime JavaScript.

2. **Categorização Semântica Bimodal de Mídia:**
   - **Escolha:** Introduzir tokens semânticos dedicados para as 3 famílias de mídia:
     - `--accent-media-video`: `#D4A373` (Dark) / `#B88350` (Light) para Doramas e Filmes.
     - `--accent-media-print`: `#D97757` (Dark) / `#C25E3E` (Light) para Mangás, Manhwas e Manhuas.
     - `--accent-media-anime`: `#9D8DF1` (Dark) / `#7C6BC9` (Light) para Animes.
   - **Alternativas consideradas:** Unificar todas as categorias na cor carmim. Rejeitado porque prejudica a distinção rápida entre mídias audiovisuais e impressas.
   - **Justificativa:** Preserva a rica identidade visual do produto garantindo contraste mínimo de 4.5:1 no fundo claro.

3. **Padronização do Anel de Foco (`:focus-visible`):**
   - **Escolha:** Adicionar regra nativa `:focus-visible` com `outline: 2px solid var(--ring-focus)` e `outline-offset: 2px` no `globals.css` e substituir classes `outline-none` cegas por anéis visíveis explícitos.
   - **Alternativas consideradas:** Manter `:focus` tradicional. Rejeitado porque polui cliques com mouse em navegadores desktop.
   - **Justificativa:** Atende estritamente ao critério WCAG 2.2 AA (Success Criterion 2.4.7 Focus Visible) e elimina os 45 erros reportados pelo `@21st-dev/cli`.

## Risks / Trade-offs

- **[Risco]** Quebra de opacidade Tailwind em variáveis CSS com formato hex. → **Mitigação:** Estruturar as variáveis CSS de forma compatível com Tailwind CSS v3 (`rgb()` com alpha ou sintaxe direta de valores hex mapeados).
- **[Risco]** Regressão de contraste no tema claro em badges de categorias. → **Mitigação:** Calibrar pares escurecidos no bloco `[data-theme="light"]` com teste automatizado de contraste.

## Migration Plan

Não há migração de banco de dados nem quebra de contratos externos. A migração de código é estritamente de classes CSS/Tailwind no frontend web. Em caso de necessidade de rollback, basta reverter o commit das alterações de estilo.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/tokens-and-anti-drift.test.mjs` — Suite de testes automatizados para validar a presença dos tokens semânticos, mapeamento do Tailwind e conformidade de foco.
- `[MODIFY]` `apps/web/src/app/globals.css` — Declaração dos tokens semânticos (:root e light) e regras de :focus-visible.
- `[MODIFY]` `apps/web/tailwind.config.ts` — Mapeamento dos novos tokens em colors e boxShadow.
- `[MODIFY]` `apps/web/src/components/layout/navigation-shell.tsx` — Adoção de tokens semânticos e saneamento de foco.
- `[MODIFY]` `apps/web/src/components/home/hero-spotlight.tsx` — Adoção de tokens semânticos e remoção de hexadecimais.
- `[MODIFY]` `apps/web/src/components/home/bento-sidebar.tsx` — Adoção de tokens semânticos.
- `[MODIFY]` `apps/web/src/components/catalog/media-card.tsx` — Adoção de tokens semânticos de mídia e superfície.
- `[MODIFY]` `apps/web/src/components/library/ledger-header.tsx` — Adoção de tokens semânticos nos KPIs.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Adoção de tokens semânticos de mídia e progresso.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-header-kpis.tsx` — Adoção de tokens semânticos.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-sidebar-widgets.tsx` — Adoção de tokens semânticos.
- `[MODIFY]` `apps/web/src/components/auth/auth-dossier-card.tsx` — Adoção de tokens semânticos e saneamento de foco.

## Data Model

Nenhuma alteração no modelo de dados ou no banco PostgreSQL/Prisma.

## Contracts

### CSS Custom Properties Contract (`globals.css`)

```css
:root {
  /* Superfícies */
  --surface-canvas: #121115;
  --surface-raised: #1A1820;
  --surface-overlay: #201D28;
  --surface-sunken: #0D0C0F;

  /* Contornos e Refração */
  --stroke-subtle: rgba(255, 255, 255, 0.08);
  --stroke-strong: rgba(255, 255, 255, 0.16);
  --stroke-accent: rgba(224, 83, 71, 0.35);
  --highlight-hairline: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);

  /* Acentos de Mídia */
  --accent-media-video: #D4A373;
  --accent-media-print: #D97757;
  --accent-media-anime: #9D8DF1;

  /* Foco e Ação */
  --ring-focus: #E05347;
}

[data-theme="light"] {
  --surface-canvas: #F8FAFC;
  --surface-raised: #FFFFFF;
  --surface-overlay: #F1F5F9;
  --surface-sunken: #E2E8F0;

  --stroke-subtle: rgba(15, 23, 42, 0.08);
  --stroke-strong: rgba(15, 23, 42, 0.16);
  --stroke-accent: rgba(200, 69, 59, 0.35);
  --highlight-hairline: inset 0 1px 0 0 rgba(255, 255, 255, 0.8);

  --accent-media-video: #B88350;
  --accent-media-print: #C25E3E;
  --accent-media-anime: #7C6BC9;

  --ring-focus: #C8453B;
}
```

## Research

- **Custo Zero Permanente:** A solução utiliza exclusivamente recursos nativos do CSS3 e Tailwind CSS já instalados no projeto, com zero impacto na infraestrutura e sem chamadas externas.
- **Auditoria do 21st UI Review:** Diagnóstico realizado identificou 710 ocorrências de `design-hardcoded-color` e 45 ocorrências de `focus-outline-none`. A unificação de tokens resolve estruturalmente ambas as categorias de achados.
- **Conformidade com a Constituição:** Respeita o Artigo IV (Governança Tecnológica) e Artigo V (Custo Zero e Soberania).

