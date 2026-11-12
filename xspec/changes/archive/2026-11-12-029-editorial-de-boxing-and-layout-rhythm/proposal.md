# Proposal: Editorial De-Boxing & Layout Rhythm

> **X-Spec** · ID: `029-editorial-de-boxing-and-layout-rhythm` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

Após a unificação dos tokens de design na fatia R28, as páginas centrais (Home Hub e Biblioteca Pessoal) ainda exibem caixas repetitivas, sombras excessivas e o padrão artificial de "card dentro de card" herdado de protótipos de IA. Além disso, múltiplos badges flutuantes translúcidos e pontos verdes piscantes (animate-pulse) poluem o ritmo de leitura. Esta mudança implementa o de-boxing editorial, transformando contêineres fechados em faixas contínuas broadsheet com divisores verticais (divide-x), removendo artefatos difusos (blur-3xl) e restaurando um ritmo visual sóbrio, limpo e legível.

## What Changes

- **De-boxing do Bento Sidebar**: remoção de sub-cards aninhados com bordas duplas em "Episódios" e "Horas Vistas", integrando as métricas semanais em uma régua única com separador vertical discreto.
- **Limpeza do Hero Spotlight**: remoção da luz difusa artificial circular (`blur-3xl`) e redução de chips concorrentes sobre a arte, mantendo contraste puro e acabamento editorial.
- **Faixa de KPIs contínua no Ledger**: substituição dos três cartões flutuantes isolados no cabeçalho da biblioteca pessoal por uma régua tabular broadsheet com divisores verticais (`divide-x divide-stroke-subtle`) e números tabulares (`tabular-nums`).
- **Remoção de badges pulsantes**: erradicação do ponto verde piscante (`animate-pulse`) no cabeçalho do Ledger para eliminar distrações periféricas desnecessárias.
- **Simplificação visual nos cards da biblioteca**: simplificação dos indicadores de status pessoal sobre a capa para tags sóbrias e limpas, liberando o foco para a arte e o ritmo da grade.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `home-hub`: atualiza os requisitos de Hero Spotlight e Bento Sidebar com erradicação de sub-cards aninhados e eliminação de luz difusa artificial.
- `personal-library-ui`: atualiza o requisito de visualização da biblioteca pessoal e cabeçalho do Ledger com faixa única de KPIs broadsheet, divisores verticais e simplificação de selos na capa.

## Impact

- `apps/web/src/components/home/hero-spotlight.tsx`: remoção de `blur-3xl` e pílulas redundantes.
- `apps/web/src/components/home/bento-sidebar.tsx`: reestruturação do resumo semanal sem caixas aninhadas.
- `apps/web/src/components/library/ledger-header.tsx`: substituição de cartões isolados de KPI por faixa contínua com divisores verticais e remoção de `animate-pulse`.
- `apps/web/src/components/library/library-card.tsx`: simplificação das tags sobre a imagem de capa.
- `tests/editorial-deboxing.test.mjs`: criação de testes automatizados para verificar ausência de card-in-card, divisores verticais e remoção de animações pulsantes.

## User Stories

### US1 — Faixa de Métricas do Ledger Unificada (Priority: P1)
Como usuário navegando pela minha biblioteca pessoal, quero visualizar o resumo de concluídos, em andamento e tempo total em uma régua contínua e elegante com divisores verticais, para que a leitura dos meus dados pareça um sumário editorial impresso e não um mosaico de caixas soltas.

- **Why this priority:** O cabeçalho do Ledger é o elemento focal da rota `/library` e define a percepção de qualidade do produto.
- **Independent Test:** Renderizar `LedgerHeader` e validar que as métricas são renderizadas em um contêiner unificado com `divide-x divide-stroke-subtle` e sem classes de animação pulsante (`animate-pulse`).

### US2 — Desencaixe dos Widgets do Home Hub (Priority: P1)
Como usuário na página inicial, quero que o resumo semanal do Bento Sidebar apresente seus números em fluxo contínuo e sem bordas duplas em caixas internas, para que o painel lateral seja leve e respire harmoniosamente ao lado da coluna principal.

- **Why this priority:** A página inicial é o cartão de visitas do aplicativo e o painel lateral Bento atualmente sofre com excesso de contêineres aninhados.
- **Independent Test:** Renderizar `BentoSidebar` e validar que os blocos de episódios e horas semanais não possuem bordas internas redundantes (`border border-stroke-subtle` aninhado) e compartilham linha divisória sutil.

### US3 — Foco Editorial na Arte da Capa dos Cards (Priority: P2)
Como colecionador visual, quero que os cards da biblioteca exibam a arte da capa com o mínimo de interferência de selos flutuantes, para que o acervo visual se destaque sem poluição de camadas sobrepostas.

- **Why this priority:** O ritmo visual da grade depende do equilíbrio entre a arte de capa e os metadados de progresso.
- **Independent Test:** Renderizar `LibraryCard` e validar a apresentação da tag de status rente à margem superior com visual tipográfico sóbrio.

## Success Criteria

- **SC-001**: O componente `LedgerHeader` renderiza as 3 métricas em uma barra horizontal unificada com `divide-x` e sem elementos com `animate-pulse`.
- **SC-002**: O componente `BentoSidebar` renderiza o resumo semanal sem sub-contêineres aninhados com bordas duplas (`border border-stroke-subtle` dentro de contêiner já com borda).
- **SC-003**: O componente `HeroSpotlight` não renderiza círculos ou elementos com efeito de difusão extrema (`blur-3xl`).
- **SC-004**: O componente `LibraryCard` renderiza tag de status integrada sem acúmulo de badges de vidro flutuantes sobrepostos.
- **SC-005**: 100% dos testes unitários e de integração existentes continuam passando com zero quebras de regressão.

## Edge Cases

- **Telas ultra-estreitas (< 360px)**: A faixa unificada de KPIs no Ledger deve se reorganizar graciosamente sem transbordar texto ou truncar números tabulares.
- **Valores numéricos elevados (e.g., 999+ episódios)**: Os campos de métricas em `BentoSidebar` e `LedgerHeader` devem manter alinhamento óptico com fontes tabulares (`font-mono` / `tabular-nums`).

## Out of Scope

- Animações físicas interativas complexas com molas ou transições de gestos (reservadas para a fatia R30).
- Alterações em esquemas de banco de dados, rotas de API do backend NestJS ou endpoints HTTP.

## Clarifications

### Session 2026-11-12
- Q: Como a faixa de métricas (Concluídos, Em Andamento, Total de Horas) deve ser estruturada visualmente no cabeçalho da biblioteca pessoal? → A: Faixa única contínua integrada com divisores verticais (`divide-x divide-stroke-subtle`), números tabulares (`tabular-nums`) e remoção do indicador verde piscante (`animate-pulse`).
- Q: Qual o nível de desconstrução das caixas aninhadas nos widgets da Home? → A: Desencaixar completamente as métricas do Bento (remover caixas internas com bordas em "Episódios" e "Horas Vistas", integrando-as em linha única dividida por hairline) e remover a luz difusa circular (`blur-3xl`) e pílulas redundantes do Hero Spotlight.
- Q: Como os indicadores de status pessoal e selos sobrepostos na capa do card devem se comportar visualmente? → A: Simplificar o selo de status para uma tag tipográfica discreta rente à borda superior com fundo sóbrio, mantendo foco na arte e no ritmo da grade.

