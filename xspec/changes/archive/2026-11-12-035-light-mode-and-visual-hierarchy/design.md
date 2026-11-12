# Design: 035-light-mode-and-visual-hierarchy

## Context

O YuukiList implementa o *Asian Editorial Design System* com arquitetura bimodal de temas (`dark` e `light`), gerenciada pelo atributo HTML `data-theme` na raiz do documento (`document.documentElement`). Atualmente, embora tokens para o modo claro existam em `globals.css`, eles utilizavam uma paleta fria baseada em tons de ardósia (Slate/Tailwind padrão), divergindo da atmosfera editorial clássica de papel oriental (Washi) e nanquim.

Além disso, múltiplos componentes centrais nas páginas Home Hub, Biblioteca Pessoal, Perfil do Usuário e modais secundários (Diário, Edição de Perfil e Edição de Obra) continham classes utilitárias de Tailwind com valores hexadecimais estáticos escuros (ex.: `bg-[#1A1820]`, `bg-[#181C2B]`, `bg-[#0B0D13]`, `bg-[#24202C]`, `text-[#F4EFEA]`, `text-[#F3F4F6]`). Ao alternar para `[data-theme="light"]`, esses contêineres permaneciam escuros ou seus textos em marfim/branco ficavam completamente ilegíveis contra fundos claros.

Este design estabelece a transição para a paleta Washi Editorial Mineral Quente (Opção 1-A), mapeia a hierarquia de 4 superfícies semânticas e orquestra a erradicação de hexadecimais estáticos em favor de variáveis semânticas desacopladas.

## Goals / Non-Goals

**Goals:**
- Definir os tokens semânticos do modo claro com base na paleta Washi Editorial (`#F9F8F5`, `#FFFFFF`, `#F1EFEA`, `#E7E3DA`, `#16141A`, `#5A5462`, `#7E7786`, `#C8453B`).
- Garantir contraste estrito WCAG 2.2 AAA ($\ge 14:1$) para texto primário sobre as superfícies Canvas e Raised no modo claro.
- Substituir contêineres escuros fixos nas rotas `/library`, `/profile`, `/` (Home Hub) e modais por superfícies semânticas adaptativas (`bg-surface-raised`, `bg-surface-canvas`, `bg-surface-overlay`, `bg-surface-sunken`).
- Preservar o padrão de *anti-collision badges* (selos escuros com texto branco sobre posters de mídia) para evitar colisões entre texto e imagens fotográficas.
- Assegurar anéis de foco acessíveis (`:focus-visible`) utilizando o Carmim semântico (`#C8453B`).

**Non-Goals:**
- Não alterar a lógica de negócio, rotas de API, esquemas Prisma ou endpoints de catálogo.
- Não introduzir bibliotecas externas pesadas de estilização ou temas runtime adicionais.
- Não modificar a paleta do modo escuro (`[data-theme="dark"]`), que permanece como baseline estética inalterada.

## Decisions

1. **Paleta Washi Editorial Mineral Quente (Opção 1-A)**
   - **Escolha:** Adotar `#F9F8F5` para Canvas (fundo do papel mineral), `#FFFFFF` para Raised (cartões elevados), `#F1EFEA` para Overlay e `#E7E3DA` para Sunken, com texto primário em nanquim profundo `#16141A` e destaque Carmim `#C8453B`.
   - **Alternativas consideradas:** Manter tons frios Slate (`#F8FAFC`, `#0F172A`) ou bege pergaminho envelhecido saturado (`#F5EEDB`).
   - **Justificativa:** A paleta Slate conferia um aspecto genérico de dashboard SaaS corporativo, destoando da identidade editorial asiática. O pergaminho saturado reduzia o contraste tipográfico e conferia aspecto amarelado excessivo. O papel mineral Washi equilibra pureza editorial, sofisticação e acessibilidade máxima (contraste 14.5:1).

2. **Hierarquia Semântica de 4 Camadas de Superfície**
   - **Escolha:** Padronizar todas as telas em 4 níveis de elevação:
     1. `Canvas` (`var(--surface-canvas)`): Base de fundo da página.
     2. `Raised` (`var(--surface-raised)`): Cartões, cabeçalhos de seção e painéis principais.
     3. `Overlay` (`var(--surface-overlay)`): Modais, dropdowns, tooltips e abas ativas.
     4. `Sunken` (`var(--surface-sunken)`): Trilhas de progresso, campos de formulário e inputs embutidos.
   - **Alternativas consideradas:** Utilizar classes dinâmicas condicionais `dark:...` em cada elemento.
   - **Justificativa:** Classes `dark:...` geram código inflado, duplicação de regras e risco permanente de regressões por esquecimento. O uso de variáveis CSS nativas gerenciadas centralmente no seletor `[data-theme]` garante consistência automática e zero sobrecarga de runtime.

3. **Anti-Collision Badges sobre Capas de Mídia**
   - **Escolha:** Manter selos sobrepostos a pôsteres e banners de mídia com fundo escuro explícito (`bg-black/75 text-white border-white/10` ou `backdrop-blur`).
   - **Alternativas consideradas:** Fazer os selos herdarem as superfícies dinâmicas claras (`bg-surface-raised text-[var(--color-text-primary)]`).
   - **Justificativa:** Capas de mídia e posters são predominantemente escuros ou de luminosidade imprevisível. Um selo semitransparente claro ou texto sem fundo explícito causaria colisão de contraste e ilegibilidade total dependendo da arte da capa.

4. **Extensão do Tailwind Config para Classes Semânticas de Texto**
   - **Escolha:** Atualizar `tailwind.config.ts` para mapear `text-primary`, `text-secondary` e `text-muted` diretamente para `var(--color-text-primary)`, `var(--color-text-secondary)` e `var(--color-text-muted)`.
   - **Alternativas consideradas:** Continuar utilizando sintaxe arbitrária `text-[var(--color-text-primary)]`.
   - **Justificativa:** Classes utilitárias limpas melhoram a manutenibilidade e reduzem a verbosidade do JSX.

## Risks / Trade-offs

- **[Risco]** Elementos com texto branco (`text-white`) inseridos em contêineres que passam a ser brancos no modo claro.
  → **Mitigação:** Auditoria sistemática via script de teste automatizado `light-mode-and-visual-hierarchy.test.mjs` verificando padrões estáticos de contraste e erradicação de `text-[#F4EFEA]` em contêineres sem fundo escuro explícito.

- **[Risco]** Modais de teleporte (`Portal` ou `fixed`) renderizados com fundo transparente ou herdando estilos incorretos.
  → **Mitigação:** Aplicação explícita de `bg-surface-raised` e `border-stroke-subtle` no invólucro principal de todos os modais (`edit-profile-modal.tsx`, `create-note-modal.tsx`, `edit-item-modal.tsx`).

## Migration Plan

1. Atualização dos tokens no arquivo `apps/web/src/app/globals.css`.
2. Extensão dos tokens de texto no arquivo `apps/web/tailwind.config.ts`.
3. Refatoração dos arquivos de página e componentes identificados.
4. Execução do teste unitário de conformidade estética e de regressão `npm test`.
5. Validação visual no servidor local de desenvolvimento.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/light-mode-and-visual-hierarchy.test.mjs` — Suíte de testes automatizados para tokens semânticos, contraste WCAG AAA e auditoria estática de ausência de hexadecimais escuros.
- `[MODIFY]` `apps/web/src/app/globals.css` — Ajuste dos tokens CSS de superfícies e cores para Washi Editorial Claro.
- `[MODIFY]` `apps/web/tailwind.config.ts` — Mapeamento das classes semânticas de texto e reforço dos tokens de superfície.
- `[MODIFY]` `apps/web/src/app/library/page.tsx` — Remoção do contêiner escuro fixo `bg-[#0B0D13]` e tipografia estática.
- `[MODIFY]` `apps/web/src/components/home/continue-watching.tsx` — Refatoração para superfícies semânticas no feed de progresso ativo.
- `[MODIFY]` `apps/web/src/components/home/trending-showcase.tsx` — Refatoração para superfícies semânticas nos cards de tendências da Home.
- `[MODIFY]` `apps/web/src/app/profile/page.tsx` — Refatoração do cabeçalho de perfil, botões e cartões de gerenciamento.
- `[MODIFY]` `apps/web/src/components/profile/profile-stats.tsx` — Refatoração dos blocos de métricas e gráficos estatísticos.
- `[MODIFY]` `apps/web/src/components/profile/edit-profile-modal.tsx` — Refatoração das superfícies do modal, seleção de molduras e inputs.
- `[MODIFY]` `apps/web/src/components/layout/theme-toggle.tsx` — Refatoração do botão alternador para refletir a superfície ativa e foco Carmim.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Refinamento dos badges de capa para preservar contraste anti-colisão.
- `[MODIFY]` `apps/web/src/components/library/edit-item-modal.tsx` — Refatoração para superfícies semânticas e inputs acessíveis.
- `[MODIFY]` `apps/web/src/components/diary/create-note-modal.tsx` — Refatoração para superfícies semânticas no modal do diário.
- `[MODIFY]` `apps/web/src/components/diary/timeline-view.tsx` — Refatoração das notas do diário e cards de histórico.

## Data Model

Não aplicável. Esta mudança é estritamente de camada de apresentação visual (CSS, tokens e componentes UI) e não altera entidades, esquemas Prisma ou tabelas de banco de dados.

## Contracts

### Contrato de Variáveis CSS Semânticas (`[data-theme="light"]`)

```css
[data-theme="light"] {
  --color-bg-base: #F9F8F5;
  --color-bg-surface: #FFFFFF;
  --color-bg-card: #FFFFFF;
  --color-bg-card-hover: #F1EFEA;
  --color-border: rgba(24, 22, 27, 0.12);
  --color-border-focus: #C8453B;
  --color-text-primary: #16141A;
  --color-text-secondary: #5A5462;
  --color-text-muted: #7E7786;
  --color-accent: #C8453B;
  --color-accent-subtle: #FBEAE9;
  --color-accent-cyan: #C8453B;
  --color-accent-violet: #7C3AED;

  --surface-canvas: #F9F8F5;
  --surface-raised: #FFFFFF;
  --surface-overlay: #F1EFEA;
  --surface-sunken: #E7E3DA;

  --stroke-subtle: rgba(24, 22, 27, 0.08);
  --stroke-strong: rgba(24, 22, 27, 0.16);
  --stroke-accent: rgba(200, 69, 59, 0.35);
  --highlight-hairline: inset 0 1px 0 0 rgba(255, 255, 255, 0.9);

  --accent-media-video: #B88350;
  --accent-media-print: #C25E3E;
  --accent-media-anime: #7C6BC9;

  --ring-focus: #C8453B;
}
```

### Contrato de Contraste Tipográfico WCAG 2.2 AAA

| Par de Cores | Relação de Contraste | Nível WCAG | Aplicação |
| :--- | :--- | :--- | :--- |
| `#16141A` em `#FFFFFF` | 15.6 : 1 | AAA ($\ge 7:1$) | Títulos e texto primário em cartões |
| `#16141A` em `#F9F8F5` | 14.5 : 1 | AAA ($\ge 7:1$) | Títulos sobre a tela principal (Canvas) |
| `#5A5462` em `#FFFFFF` | 6.8 : 1 | AA ($\ge 4.5:1$) | Metadados e textos secundários |
| `#5A5462` em `#F9F8F5` | 6.3 : 1 | AA ($\ge 4.5:1$) | Metadados sobre a tela principal |
| `#C8453B` em `#FFFFFF` | 5.1 : 1 | AA ($\ge 4.5:1$) | Links e acentos interativos |

## Research

1. **Asian Editorial Design Guidelines (YuukiList Context Document):**
   - O documento mestre especifica a coexistência de dois estados: *Dark Editorial* (Nanquim `#121115` com estantes escuras `#1A1820` e acento Carmim `#E05347`) e *Light Editorial* (Papel Washi `#F9F8F5` com cartões brancos `#FFFFFF` e Carmim temperado `#C8453B`).
   - A transição deve preservar a sobriedade tipográfica e a estética editorial japonesa/coreana, sem saturação estridente.

2. **Auditoria de Fontes no Código Atual:**
   - A investigação constatou que as fontes que "desapareciam" no modo claro decorriam de classes estáticas de marfim/cinza claro (`text-[#F4EFEA]`, `text-[#F3F4F6]`) aplicadas diretamente nos títulos e textos dentro de cartões ou formulários que recebiam fundo claro dinamicamente.

