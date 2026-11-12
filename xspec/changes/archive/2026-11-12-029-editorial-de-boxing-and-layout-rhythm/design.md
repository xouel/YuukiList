# Design: 029-editorial-de-boxing-and-layout-rhythm

## Context

Após a consolidação dos tokens semânticos na fatia R28, as páginas centrais (`/` e `/library`) possuem variáveis CSS unificadas (`--surface-*`, `--stroke-*`, `--accent-*`), mas ainda sofrem com vícios de composição estrutural característicos de layouts gerados por IA:
1. Padrão "card dentro de card": caixas com bordas e sombras aninhadas em `BentoSidebar` (sub-cards de episódios e horas semanais dentro de um card de resumo semanal com borda).
2. Artefatos de iluminação artificial difusa: uso de círculos absolutos com `blur-3xl` e cores chamativas em `HeroSpotlight`.
3. KPIs fragmentados: blocos arredondados flutuantes com ícones isolados e pontos verdes pulsantes (`animate-pulse`) no cabeçalho do `LedgerHeader`.
4. Sobrecarga visual em capas: múltiplos badges flutuantes translúcidos (`backdrop-blur`) concorrendo com a arte da capa em `LibraryCard`.

Esta fatia projeta o de-boxing editorial rigoroso, alinhado à estética "Tactile Asian Broadsheet".

## Goals / Non-Goals

**Goals:**
- Desencaixar os widgets de `BentoSidebar`, substituindo sub-cards fechados por réguas contínuas com divisores verticais discretos (`divide-x divide-stroke-subtle`).
- Remover artefatos visuais difusos (`blur-3xl`) e pílulas redundantes de `HeroSpotlight`, priorizando contraste limpo e tipografia editorial.
- Unificar os três cartões flutuantes de KPI de `LedgerHeader` em uma barra tabular contínua com divisores verticais e números tabulares (`tabular-nums`).
- Eliminar o indicador verde pulsante (`animate-pulse`) em `LedgerHeader` para assegurar estabilidade visual.
- Simplificar as tags de status na imagem de capa em `LibraryCard` para uma tag tipográfica rente à margem com contraste sóbrio.
- Garantir que todos os testes existentes (269 testes) e novas verificações automatizadas passem sem regressão.

**Non-Goals:**
- Introduzir dependências de animação pesadas (Framer Motion, bibliotecas de física complexas — reservadas para a fatia R30).
- Alterar rotas, endpoints da API NestJS ou esquemas do banco de dados Prisma.
- Modificar componentes de catálogo ou calendário fora do escopo estrito de `home-hub` e `personal-library-ui`.

## Decisions

1. **Faixa Tabular Unificada com Divisores Verticais no LedgerHeader**
   - **Escolha:** Substituir os 3 cards individuais de KPI por um contêiner horizontal único com `divide-x divide-stroke-subtle`, fundo `bg-surface-raised`, números monoespaçados (`font-mono tabular-nums`) e rótulos tipográficos sóbrios.
   - **Alternativas consideradas:** Manter caixas soltas e apenas remover bordas; agrupar em lista vertical.
   - **Justificativa:** A régua tabular com divisores verticais é a marca visual de impressos editoriais e jornais financeiros broadsheet, eliminando o aspecto de dashboard genérico.

2. **De-boxing das Métricas Semanais no BentoSidebar**
   - **Escolha:** Integrar os indicadores de "Episódios" e "Horas Vistas" em uma linha única contínua com divisória vertical sutil, eliminando as bordas e fundos aninhados (`bg-surface-overlay border border-stroke-subtle`).
   - **Alternativas consideradas:** Manter cartões aninhados com raio menor; ocultar as horas vistas.
   - **Justificativa:** Elimina a redundância de molduras e reduz o peso visual do painel lateral em relação ao conteúdo nobre do Hero.

3. **Remoção de Iluminação Artificial Difusa no HeroSpotlight**
   - **Escolha:** Remover a `div` com `bg-accent/10 blur-3xl pointer-events-none` e simplificar as pílulas superiores para uma chamada editorial limpa.
   - **Alternativas consideradas:** Reduzir a opacidade do blur para 5%; substituir por gradiente linear.
   - **Justificativa:** O blur esférico difuso é um dos maiores sinais estéticos de templates genéricos de IA; a elegância editorial do Nanquim e Papel requer contraste nítido e superfícies táteis puras.

4. **Tag Sóbria de Margem no LibraryCard**
   - **Escolha:** Redesenhar o selo de status da obra na capa como uma tag tipográfica nítida rente ao canto superior com fundo sólido escuro e borda sutil, preservando a arte da capa e removendo múltiplos chips de vidro.
   - **Alternativas consideradas:** Remover completamente o selo da capa e colocar apenas no rodapé; manter o badge com `backdrop-blur`.
   - **Justificativa:** Garante identificação imediata do status (*Em andamento*, *Concluído*) sem competir com a composição gráfica da capa.

## Risks / Trade-offs

- **[Risco] Quebra de testes legados que verificam classes específicas de KPI ou animações:**
  → **Mitigação:** Manter os data-testids e referências estruturais semânticas existentes, ajustando os testes para verificar o novo padrão unificado `divide-x` e ausência de `animate-pulse`.
- **[Risco] Compressão em telas mobile (< 360px):**
  → **Mitigação:** Utilizar `flex-col sm:flex-row` ou grid adaptativo com `divide-y sm:divide-y-0 sm:divide-x` para reorganizar a faixa em telas extremamente estreitas sem perda de legibilidade.

## Migration Plan

Não aplicável. As alterações são puramente no frontend web e retrocompatíveis com os contratos de dados existentes.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/editorial-deboxing.test.mjs` — Testes automatizados cobrindo a ausência de sub-cards aninhados, a faixa com `divide-x`, a eliminação de `animate-pulse` e tags refinadas.
- `[MODIFY]` `apps/web/src/components/home/bento-sidebar.tsx` — Desencaixe das métricas de resumo semanal.
- `[MODIFY]` `apps/web/src/components/home/hero-spotlight.tsx` — Remoção do círculo de difusão `blur-3xl` e chips redundantes.
- `[MODIFY]` `apps/web/src/components/library/ledger-header.tsx` — Transformação de KPIs em barra tabular com `divide-x` e remoção de `animate-pulse`.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Simplificação do selo de status sobre a capa.

## Data Model

Sem alterações em entidades, modelos de dados ou esquemas Prisma.

## Contracts

Nenhum contrato público de API foi alterado. Todas as interfaces de componentes continuam aceitando as mesmas props TypeScript (`BentoSidebarProps`, `HeroSpotlightProps`, `LedgerHeaderProps`, `LibraryCardProps`).

## Research

- **Emil Kowalski — Interface Craft:** Enfatiza o uso de espaçamento negativo e divisores hairlines em vez de contêineres aninhados com bordas duplicadas.
- **Apple Human Interface Guidelines:** Recomenda contraste tipográfico natural, eliminação de efeitos puramente decorativos sem função cognitiva (como luzes difusas falsas) e números tabulares (`tabular-nums`) para dados comparáveis.
- **21st.dev & Asian Broadsheet:** Uso de réguas horizontais e verticais finas de nanquim para criar ritmo de jornal sem enclausurar informações em caixas flutuantes.

