# Design: 032-anti-slop-and-auth-polish

## Context

A interface web do YuukiList (`apps/web`) implementa o padrão Dark Editorial (Nanquim `#121115`, Papel `#F4EFEA`, Carmim `#E05347`). Durante as iterações anteriores, acumularam-se padrões estéticos excessivamente padronizados que transmitem artificialidade:
1. No `HeroSpotlight`, a condição `{isAuthenticated && libraryItem ? (...) : (...) }` e o enum incorreto (`WATCHING`/`READING` em vez de `ASSISTINDO`/`LENDO`) faziam com que usuários logados vissem o botão de registro "Criar Conta Gratuita".
2. Em todas as telas, os cabeçalhos utilizavam a fórmula repetitiva "eyebrow mono em caixa alta (`DESTAQUE DO DIÁRIO`, `LEDGER PESSOAL V2.4`, `TEMPORADA DE OUTONO 2026`) + título serifado + subtítulo cinza + cards de KPIs".
3. A tipografia utilizava `font-mono` indiscriminadamente para decorar números comuns (`18`, `7.2h`, contadores, dias da semana).
4. O layout sofria de excesso de caixas ("tudo é card"): Hero, widgets Bento, Biblioteca e Empty States tinham o mesmo fundo, borda e raio sem diferenciação de planos.
5. A Biblioteca empilhava três linhas de botões em formato de pílula inflada e aplicava tingimento colorido artificial nas categorias (`CATEGORY_COLORS`), concorrendo com a cor natural das capas.

## Goals / Non-Goals

**Goals:**
- Corrigir o Hero Spotlight para ramificar estritamente por autenticação: usuário conectado sem a obra em sua lista visualiza "+ Adicionar à Lista" e "Ver Detalhes", sem chamada de cadastro.
- Corrigir os filtros de status ativos em `home-hub-view.tsx` e `continue-watching.tsx` para os enums canônicos `ASSISTINDO` e `LENDO`.
- Eliminar sistematicamente todos os rótulos superiores tipo eyebrow (`DESTAQUE DO DIÁRIO`, `LEDGER PESSOAL V2.4`, `Sincronizado recentemente`, `TEMPORADA DE OUTONO 2026`).
- Substituir o empilhamento de pílulas em `LibraryFilters` por abas editoriais limpas em linha única com linha indicadora de estado ativo e seletor plano de categorias.
- De-boxing do `BentoSidebar` na Home: transformar 3 cards isolados com bordas pesadas em uma coluna lateral integrada com divisores horizontais discretos (`divide-y border-stroke-subtle`).
- Adotar cromo neutro nos cards da biblioteca: remover classes de tingimento artificial (`CATEGORY_COLORS`) e títulos duplicados fantasmas (`originalTitle` repetido).
- Purga de decorações vazias no Perfil: remover os selos "Colecionador" e "Acervo Privado", e erradicar o emoji no botão de compartilhamento.
- Restringir `font-mono` estritamente a trechos de código e timestamps técnicos de fuso horário, usando tipografia sans/serif regular com `tabular-nums` para dados numéricos.

**Non-Goals:**
- Não alterar schemas de banco de dados, migrations ou modelos Prisma.
- Não modificar contratos HTTP ou endpoints na API NestJS (`apps/api`).
- Não alterar regras de negócio de cálculo de progresso ou pontuação.

## Decisions

1. **Ramificação de Ações no Hero por Estado de Autenticação**
   - **Escolha:** Separar a verificação de autenticação da presença do item no acervo:
     - `!isAuthenticated`: Exibe "Criar Conta Gratuita" e "Explorar Catálogo".
     - `isAuthenticated && libraryItem`: Exibe barra de progresso visual, botão de avanço "+1 Episódio/Capítulo" e "Ver Detalhes".
     - `isAuthenticated && !libraryItem`: Exibe botão "+ Adicionar à Lista" e "Ver Detalhes".
   - **Alternativas consideradas:** Exibir apenas "Ver Detalhes" para logados sem o item (rejeitada: perde oportunidade de engajamento direto).
   - **Justificativa:** Resolve o defeito crítico de experiência do usuário logado e alinha-se à decisão aprovada no Clarification Gate.

2. **Alinhamento Canônico de Enums de Status Pessoal**
   - **Escolha:** Substituir `item.status === 'WATCHING' || item.status === 'READING'` por `item.status === 'ASSISTINDO' || item.status === 'LENDO'` em `home-hub-view.tsx` e `continue-watching.tsx`.
   - **Alternativas consideradas:** Mapeamento bidirecional inglês-português no frontend (rejeitada: complexidade desnecessária, já que o backend e os DTOs do `@yuukilist/shared` usam enums canônicos em português).
   - **Justificativa:** Garantia de consistência sem camadas intermediárias artificiais.

3. **Substituição de Pílulas por Abas Editoriais Limpas na Biblioteca**
   - **Escolha:** Utilizar navegação em linha única de texto com linha indicadora inferior (`border-b-2 border-accent text-[var(--color-text-primary)] font-semibold`) para os status (*Todas*, *Em andamento*, *Planejadas*, *Concluídas*) e seletores planos e discretos para categorias, com contadores numéricos diretos em texto.
   - **Alternativas consideradas:** Segmented control arredondado fechado (rejeitada: mantém a estética de pílula plástica).
   - **Justificativa:** Restaura a elegância broadsheet, simplifica a hierarquia de escaneamento visual e elimina o ruído de balões pretos aninhados.

4. **De-Boxing e Cromo Neutro nos Cards da Biblioteca**
   - **Escolha:** Deixar a arte da capa em proporção editorial 2:3 governar 100% da cromática da interface. Badges de status e categoria passam a usar cromo neutro translúcido (`bg-black/60 text-white/90 border-white/10`) em vez de tons saturados artificiais por mídia.
   - **Alternativas consideradas:** Manter bordas coloridas sutis (rejeitada: o usuário solicitou expressamente neutralizar o tingimento por categoria).
   - **Justificativa:** As capas reais fornecem contraste vibrante e natural sem poluição artificial do layout.

5. **Erradicação de Eyebrows e Selos Vazio**
   - **Escolha:** Remover completamente os nós JSX que renderizavam etiquetas em caixa alta no topo dos cabeçalhos, assim como os selos "Colecionador", "Acervo Privado" e o emoji `🔗`.
   - **Alternativas consideradas:** Manter as tags apenas com texto em minúsculas (rejeitada: o usuário solicitou corte de tudo que for pura decoração vazia).
   - **Justificativa:** Respeito absoluto às diretrizes de design editorial autêntico e conformidade com a Constituição do projeto (zero emojis).

## Risks / Trade-offs

- **[Risco]** Quebra de testes existentes que procuravam botões por classes de pílula ou textos de eyebrow específicos. → **Mitigação:** Preservar papéis ARIA semânticos (`role="tab"`, `aria-label`, `data-testid`) e atualizar asserções de teste para validar a ausência de etiquetas vazias e a nova estrutura de abas.
- **[Risco]** O usuário autenticado sem a obra clicar em "+ Adicionar à Lista" no Hero e esperar feedback imediato. → **Mitigação:** Integrar chamada à API da biblioteca com feedback tátil e atualização otimista de estado.

## Migration Plan

- Não há migração de banco de dados nem quebra de contratos de API.
- A alteração é puramente de renderização e estilização nos componentes React do frontend (`apps/web`). Rollback imediato via Git caso necessário.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/components/home/hero-spotlight.tsx` — Ramificação estrita por `isAuthenticated`, remoção da tag eyebrow "Destaque do Diário" e ação "+ Adicionar à Lista".
- `[MODIFY]` `apps/web/src/components/home/home-hub-view.tsx` — Correção do filtro para enums `ASSISTINDO` / `LENDO` e repasse correto de estado ao Hero.
- `[MODIFY]` `apps/web/src/components/home/continue-watching.tsx` — Correção do filtro para enums `ASSISTINDO` / `LENDO`.
- `[MODIFY]` `apps/web/src/components/home/bento-sidebar.tsx` — De-boxing dos widgets laterais em coluna integrada com divisores sutis e substituição de `font-mono` decorativo por `tabular-nums`.
- `[MODIFY]` `apps/web/src/components/library/ledger-header.tsx` — Remoção de "LEDGER PESSOAL V2.4" e "Sincronizado recentemente", mantendo título editorial limpo e métricas integradas.
- `[MODIFY]` `apps/web/src/components/library/library-filters.tsx` — Reestruturação de abas limpas para status e categorias em linha única sem formato de pílula inflada.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Remoção de `CATEGORY_COLORS` em favor de cromo neutro, eliminação de `originalTitle` duplicado e saneamento de `font-mono`.
- `[MODIFY]` `apps/web/src/components/library/library-view.tsx` — Remoção do contêiner externo restritivo em favor de integração direta na superfície do canvas.
- `[MODIFY]` `apps/web/src/components/calendar/calendar-header-kpis.tsx` — Remoção da tag eyebrow "Temporada de Outono 2026" e saneamento tipográfico.
- `[MODIFY]` `apps/web/src/app/profile/page.tsx` — Remoção dos selos "Colecionador" e "Acervo Privado", e remoção do emoji `🔗` no botão de compartilhamento.
- `[CREATE]` `tests/anti-slop-and-auth-polish.test.mjs` — Suíte de testes automatizados cobrindo os cenários normativos da mudança.

## Data Model

Sem alterações de modelo de dados ou entidades Prisma.

## Contracts

Interface do `HeroSpotlightProps`:
```typescript
interface HeroSpotlightProps {
  media?: MediaItemSummaryDto | null;
  libraryItem?: LibraryItemDto | null;
  isAuthenticated: boolean;
  onQuickIncrement?: (mediaItemId: string, nextProgress: number) => Promise<void>;
  onQuickAdd?: (mediaItemId: string) => Promise<void>;
}
```

## Research

- **Custo Zero:** 100% dos componentes utilizam Tailwind CSS v4 já embutido no projeto e React 19 nativo, sem custos ou adições de bibliotecas de terceiros.
- **Diretrizes de Anti-Slop Editorial:** Inspeção profunda de 247 designs de alta qualidade revela que interfaces de acervo (Letterboxd, Linear, Apple Books) colocam o protagonismo visual na arte dos itens, mantendo a tipografia e o cromo escuro neutros, calmos e com hierarquia de espaçamento em vez de caixas repetitivas.

