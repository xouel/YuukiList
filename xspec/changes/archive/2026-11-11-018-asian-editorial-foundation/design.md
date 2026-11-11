# Design: 018-asian-editorial-foundation

## Context

O YuukiList consolidou seu catálogo unificado, mas sua identidade visual e casca de navegação apresentavam traços marcantes de "dashboard de monitoramento / SaaS": fundo quase preto com tom azulado (`#080A11`), logotipo com gradiente tech ciano-violeta, acentos neon e variação na largura máxima dos containers entre telas (259px a 344px de margem).
Esta mudança estabelece a fundação estética do produto: o **Design System Asian Editorial**, ancorado em pigmentos minerais de nanquim, papel escuro e vermelho carmim, tipografia em três níveis de inspiração editorial e um grid horizontal unificado em `max-w-7xl`.

## Goals / Non-Goals

**Goals:**
- Implementar a nova paleta de cores Asian Editorial no `globals.css` e tokens Tailwind: Base Nanquim (`#121115`), Superfície Estante (`#1A1820`), Bordas Fio (`#2B2735`), Texto Principal Papel (`#F4EFEA`), Metadados Grafite Neutro (`#9C96A2`) e Acento Carmim (`#E05347`).
- Configurar a escala tipográfica em 3 níveis: serifa editorial para títulos e destaques (`Shippori Mincho` / `Cinzel` / `Playfair`), sans-serif geométrica para interface (`Plus Jakarta Sans` / `Inter`) e suporte estético a ideogramas asiáticos (Hangul, Kanji, Hanzi) com 70% de opacidade.
- Substituir o gradiente ciano-roxo e subtítulo em caixa alta da Sidebar por um logotipo e wordmark tipográfico minimalista.
- Unificar a largura máxima dos containers em `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` para todas as telas da aplicação.
- Humanizar os rótulos de rodapé e navegação ("Notificações & Aparência" e "Privacidade & Seus Dados").

**Non-Goals:**
- Redesenhar os controles de busca e cards internos do catálogo (Fatia R19).
- Modificar o fluxo de progresso da biblioteca (Fatia R20).
- Alterar as visões de calendário e perfil (Fatias R21 e R22).

## Decisions

1. **Paleta Orgânica de Nanquim e Carmim (Substituição do Ciano Neon)**
   - **Escolha:** Adotar `#121115` como cor base de fundo e `#1A1820` para superfícies e cartões, com acento primário em vermelho carmim `#E05347` (para botões ativos, favoritos e alertas críticos).
   - **Alternativas consideradas:** Paleta 100% monocromática cinza (rejeitada por eliminar a expressividade e legibilidade de status) ou manter acento azul ciano (rejeitada por perpetuar o aspecto SaaS).
   - **Justificativa:** O nanquim profundo combinado com o vermelho carmim e o papel off-white evoca a estética literária, caligráfica e cinematográfica do entretenimento asiático.

2. **Escala Tipográfica em 3 Níveis com Fontes Editoriais**
   - **Escolha:** Definir classes semânticas `font-serif-editorial` e `font-sans-ui` no CSS global com fallbacks sólidos para sistemas locais e Google Fonts (`Shippori Mincho`, `Plus Jakarta Sans`, `Noto Sans CJK`).
   - **Alternativas consideradas:** Fonte única monospaçada ou sans-serif genérica.
   - **Justificativa:** A combinação entre serifa refinada nos títulos e sans-serif neutra no corpo equilibra atmosfera editorial com máxima legibilidade em metadados densos.

3. **Container Global Unificado `max-w-7xl`**
   - **Escolha:** Padronizar o layout principal no `NavigationShell` com `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, garantindo que todas as páginas herdem o mesmo alinhamento horizontal sem margens recortadas.
   - **Alternativas consideradas:** Manter `max-w-5xl` no Perfil e `max-w-6xl` na Biblioteca.
   - **Justificativa:** Elimina o desalinhamento identificado nas capturas de tela e uniformiza a experiência visual em monitores widescreen.

## Risks / Trade-offs

- **[Risco]** Queda de contraste nos textos secundários no novo tema escuro nanquim.  
  → **Mitigação:** Calibragem de `--color-text-secondary: #9C96A2` sobre `#121115` e `#1A1820`, garantindo razão de contraste superior a 5.5:1 (acima do mínimo de 4.5:1 da WCAG 2.2 AA).
- **[Risco]** Atraso na renderização de fontes web externas (FOIT).  
  → **Mitigação:** Declaração de `font-display: swap` com pilha completa de fontes de fallback locais.

## Migration Plan

- Não há impacto de banco de dados ou backend.
- Mudança puramente de apresentação no pacote `apps/web`.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/asian-editorial-foundation.test.mjs` — Testes TDD da fundação editorial, tokens CSS e container.
- `[MODIFY]` `apps/web/src/app/globals.css` — Tokens de tema mineral/papel/carmim e utilitários tipográficos.
- `[MODIFY]` `apps/web/src/app/layout.tsx` — Tipografia global, títulos e container base.
- `[MODIFY]` `apps/web/src/components/layout/navigation-shell.tsx` — Novo wordmark tipográfico, container `max-w-7xl` e rótulos humanizados.
- `[MODIFY]` `apps/web/src/components/layout/legal-footer.tsx` — Ajuste de cores e tipografia editorial no rodapé.
- `[MODIFY]` `apps/web/tailwind.config.ts` — Extensão de tokens minerais e fontes.

## Data Model

Não aplicável.

## Contracts

- **CSS Custom Properties (Dark Editorial)**:
  - `--color-bg-base`: `#121115`
  - `--color-bg-surface`: `#1A1820`
  - `--color-bg-card`: `#201D28`
  - `--color-border`: `#2B2735`
  - `--color-text-primary`: `#F4EFEA`
  - `--color-text-secondary`: `#9C96A2`
  - `--color-accent`: `#E05347` (Carmim)
- **CSS Custom Properties (Light Editorial)**:
  - `--color-bg-base`: `#F8FAFC`
  - `--color-bg-surface`: `#FFFFFF`
  - `--color-border`: `#CBD5E1`
  - `--color-text-primary`: `#1A1820`
  - `--color-accent`: `#C8453B`

## Research

- **Análise Cromática**: A cor `#121115` (Nanquim) é um preto quente com matiz de 270° e saturação leve (11%), reduzindo a fadiga visual em comparação com pretos puros `#000000` e pretos azulados `#080A11`.
- **Acessibilidade WCAG 2.2 AA**: Contraste `#F4EFEA` sobre `#121115` = 15.6:1; `#9C96A2` sobre `#121115` = 6.2:1; `#E05347` sobre `#121115` = 4.8:1.

