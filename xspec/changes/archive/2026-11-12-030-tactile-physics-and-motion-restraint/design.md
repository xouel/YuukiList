# Design: 030-tactile-physics-and-motion-restraint

## Context

Após o de-boxing editorial realizado na fatia R29, a composição estrutural das páginas centrais foi saneada, mas os elementos interativos ainda sofrem com vícios de animação e resposta física:
1. Zoom de capa agressivo (`hover:scale-105` / `group-hover:scale-105`) em `MediaCard`, `LibraryCard`, `EventCard` e `HeroSpotlight`, que distorce as proporções das artes de capa e causa sobrecarga na GPU.
2. Ausência de micro-pressão no toque (`:active:scale-[0.98]`): botões e cards clicáveis não fornecem compressão física imediata no estado ativo, transmitindo uma sensação de software web lento e desengonçado.
3. Oscilação de layout (*layout jitter*) em dados numéricos: contadores de episódios (Ep. 8/16), notas (★ 9.6) e horários de transmissão (14:00 BRT) utilizam dígitos proporcionais variáveis em vez de `tabular-nums`.

Esta fatia projeta a física tátil alinhada às diretrizes da Apple e de Emil Kowalski.

## Goals / Non-Goals

**Goals:**
- Erradicar 100% dos efeitos de dilatação dimensional `hover:scale-105` e `group-hover:scale-105` em todas as capas de obras e eventos.
- Implementar micro-pressão elástica imediata no clique/toque (`:active:scale-[0.98]` com `duration-75` ou equivalente tátil) em todos os botões de ação e cards navegáveis.
- Generalizar a classe tipográfica `tabular-nums` em contadores de episódios/capítulos, notas numéricas e horários do calendário.
- Preservar acessibilidade de foco com anéis `:focus-visible` semânticos e respeito a `prefers-reduced-motion`.
- Garantir que todos os testes existentes (275 testes) e novas verificações passem com 100% de sucesso.

**Non-Goals:**
- Adicionar dependências pesadas de física de partículas ou bibliotecas 3D.
- Alterar contratos de backend, esquemas Prisma ou endpoints de dados.

## Decisions

1. **Substituição de Zoom de Escala por Realce de Borda e Elevação Suave**
   - **Escolha:** Remover `hover:scale-105` e `group-hover:scale-105`, aplicando em seu lugar realce sutil de borda (`hover:border-stroke-accent`) e sombra suave (`hover:shadow-lg`).
   - **Alternativas consideradas:** Manter micro-escala de 1%; manter escala apenas no Hero.
   - **Justificativa:** Conforme Emil Kowalski e as diretrizes Apple HIG, imagens de arte editorial devem manter proporção estável; a percepção de foco deve vir de contraste e iluminação sutil, não de distorção dimensional.

2. **Micro-Pressão Tátil no Clique (`:active:scale-[0.98]`)**
   - **Escolha:** Aplicar `:active:scale-[0.98]` com `transition-transform duration-75` nos botões de ação (+1 episódio, adicionar obra, favoritos) e nos cards inteiros com `role="button"`.
   - **Alternativas consideradas:** Limitar a pressão aos botões primários; usar feedback puramente de opacidade (`opacity-70`).
   - **Justificativa:** A micro-pressão imediata de 2% cria sensação instantânea de engrenagem física e resposta de app nativo sem atraso perceptual.

3. **Generalização de Números Tabulares (`tabular-nums`)**
   - **Escolha:** Aplicar `tabular-nums font-mono` a todas as sequências numéricas dinâmicas (notas, horários, contadores de progresso).
   - **Alternativas consideradas:** Manter dígitos proporcionais padrão da fonte; aplicar apenas em cabeçalhos.
   - **Justificativa:** Garante que alterações em dígitos (de 1 para 8) não provoquem micro-saltos de largura na tipografia circunvizinha.

## Risks / Trade-offs

- **[Risco] Conflito entre transformações de escala ativa e anéis `:focus-visible`:**
  → **Mitigação:** Separar o anel de foco como propriedade de contorno (`outline-offset` e `ring`) da propriedade `transform`, evitando que a escala corte o anel visível.
- **[Risco] Regressão em testes que verificavam literais de escala:**
  → **Mitigação:** Inspecionar e atualizar as asserções de testes para garantir que validem as novas classes táteis sem quebra.

## Migration Plan

Não aplicável. As alterações são puramente no frontend web.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/tactile-physics.test.mjs` — Testes automatizados cobrindo a ausência de `hover:scale-105`, presença de `active:scale-[0.98]` e `tabular-nums`.
- `[MODIFY]` `apps/web/src/components/catalog/media-card.tsx` — Remoção de escala e adição de micro-pressão ativa e números tabulares.
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Remoção de escala e adição de micro-pressão ativa e números tabulares.
- `[MODIFY]` `apps/web/src/components/calendar/event-card.tsx` — Remoção de escala e adição de micro-pressão ativa e números tabulares.
- `[MODIFY]` `apps/web/src/components/home/hero-spotlight.tsx` — Remoção de escala na imagem de capa e refinamento tátil.

## Data Model

Sem alterações em entidades, modelos de dados ou esquemas Prisma.

## Contracts

Nenhum contrato público de API foi alterado.

## Research

- **Emil Kowalski — Micro-interactions & Physics:** Defende tempos de resposta curtos (<100ms) no estado `:active` com curvas desaceleradas e eliminação de expansões invasivas de escala em grids de mídia.
- **Apple Human Interface Guidelines — Touch and Feedback:** Recomenda resposta elástica imediata no contato inicial e números monoespaçados/tabulares para evitar jitter visual.

