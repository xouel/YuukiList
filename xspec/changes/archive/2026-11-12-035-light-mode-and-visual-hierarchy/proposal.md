# Proposal: 035-light-mode-and-visual-hierarchy

> **X-Spec** · ID: `035-light-mode-and-visual-hierarchy` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

O modo claro do YuukiList apresentava inconsistências visuais críticas decorrentes de cores escuras e hexadecimais estáticos hardcoded nos componentes. Isso gerava contêineres pretos ou roxos que permaneciam escuros mesmo com o tema claro ativado, enquanto textos com cores claras fixas desapareciam sobre superfícies brancas. Esta entrega estabelece a harmonia visual definitiva entre Dark e Light Mode: refina os tokens semânticos em globals.css para a paleta nobre Light Editorial Washi (papel mineral acolhedor #F9F8F5, cartões alvos #FFFFFF e tipografia em nanquim profundo #16141A com alto contraste WCAG AAA), erradica todos os hexadecimais fixos nos componentes principais (Home Hub, Biblioteca, Perfil, Modais e Diário) e assegura badges escuros protegidos contra colisão exclusivamente sobre imagens de capa.

## What Changes

- Calibração de tokens CSS semânticos em `globals.css` para a paleta Light Editorial Washi:
  - Fundo base `--surface-canvas`: `#F9F8F5`.
  - Superfícies elevadas `--surface-raised`: `#FFFFFF`.
  - Camada de toque/inputs `--surface-overlay`: `#F1EFEA`.
  - Trilhos e afundamentos `--surface-sunken`: `#E7E3DA`.
  - Texto primário `--color-text-primary`: `#16141A` (Nanquim profundo, contraste WCAG AAA).
  - Texto secundário `--color-text-secondary`: `#5A5462` (Carvão editorial).
  - Texto atenuado `--color-text-muted`: `#7E7786`.
  - Contornos e refração `--stroke-subtle`: `rgba(24, 22, 27, 0.08)`.
- Erradicação de hexadecimais escuros hardcoded (`bg-[#1A1820]`, `bg-[#181C2B]`, `bg-[#0B0D13]`, `border-[#2B2735]`, etc.) nos componentes do Home Hub:
  - `ContinueWatching` (`continue-watching.tsx`): substituição de caixas fixas escuras por `bg-surface-raised` e tipografia semântica.
  - `TrendingShowcase` (`trending-showcase.tsx`): contêineres com `bg-surface-raised` e bordas semânticas.
- Saneamento do contêiner da Biblioteca:
  - `apps/web/src/app/library/page.tsx`: remoção do contêiner rígido `bg-[#0B0D13] text-[#F3F4F6]`.
  - `LibraryCard` e `EditItemModal`: migração integral para tokens de superfície e contorno.
- Saneamento da página e modais de Perfil:
  - `apps/web/src/app/profile/page.tsx`: erradicação de `#1A1820`, `#24202C` e `#2B2735`.
  - `EditProfileModal`, `FavoritesShowcase` e `ProfileStats`: adoção das superfícies semânticas.
- Saneamento dos modais e visões de Diário:
  - `CreateNoteModal` e `TimelineView`: migração de `#181C2B` e `#121520` para `bg-surface-raised` e `bg-surface-overlay`.
- Proteção anti-colisão em sobreposições de capas:
  - Badges e pílulas flutuantes sobrepostas a pôsteres (`MediaCard`, `LibraryCard`, `TrendingShowcase`) mantêm fundo escuro translúcido com texto branco explícito (`bg-black/75 text-white border-white/10`) para não herdar cor preta em fundos escuros de imagens.

## Capabilities

### Modified Capabilities

- `navigation-shell`: Ajuste normativo de `Theme Selection and Accessibility Foundations` para consolidação dos tokens semânticos Light Editorial Washi em conformidade com WCAG 2.2 AA.
- `home-hub`: Atualização normativa de `Continue Watching Feed and Active Progress` exigindo adesão estrita aos tokens semânticos de superfície e texto sem hexadecimais estáticos.
- `personal-library-ui`: Atualização normativa de `Personal Library View and Layout Toggle` exigindo desvinculação de fundos escuros fixos no contêiner da rota `/library`.
- `user-profile-stats`: Atualização normativa de `Profile Showcase and Activity Feed Privacy` assegurando superfícies semânticas e contraste tipográfico em ambos os temas.

## Impact

- **Código:** `apps/web/src/app/globals.css`, `apps/web/src/components/layout/theme-toggle.tsx`, `apps/web/src/components/home/continue-watching.tsx`, `apps/web/src/components/home/trending-showcase.tsx`, `apps/web/src/app/library/page.tsx`, `apps/web/src/components/library/edit-item-modal.tsx`, `apps/web/src/app/profile/page.tsx`, `apps/web/src/components/profile/edit-profile-modal.tsx`, `apps/web/src/components/profile/favorites-showcase.tsx`, `apps/web/src/components/profile/profile-stats.tsx`, `apps/web/src/components/diary/create-note-modal.tsx`, `apps/web/src/components/diary/timeline-view.tsx`.
- **Testes:** Nova suíte automatizada `tests/light-mode-and-visual-hierarchy.test.mjs` e manutenção da taxa de 100% de aprovação nos 319 testes existentes.

## User Stories

### US1 — Calibração dos Tokens Light Editorial Washi e Erradicação de Fundos Fixos (P1)
Como usuário navegando no YuukiList durante o dia ou em ambiente iluminado, quero ativar o Modo Claro e visualizar superfícies acolhedoras em papel mineral washi com cartões brancos e texto nanquim nítido, para que a leitura seja confortável e visualmente integrada.
- **Independent Test:** Alternar o tema visual para `light` via `ThemeToggle` e verificar que o fundo global adota `--surface-canvas` (`#F9F8F5`), cartões adotam `--surface-raised` (`#FFFFFF`) e o texto primário adota `--color-text-primary` (`#16141A`) com contraste superior a 14:1.

### US2 — Harmonização Visual do Home Hub e Biblioteca em Modo Claro (P1)
Como usuário acompanhando minhas obras ativas no Início e na Biblioteca, quero que as seções Continuar Acompanhando, Tendências e os cards da estante adotem imediatamente as cores do tema claro sem blocos pretos remanescentes ou títulos brancos invisíveis.
- **Independent Test:** Renderizar `ContinueWatching`, `TrendingShowcase` e `LibraryPage` em Modo Claro e validar ausência de classes `bg-[#1A1820]`, `bg-[#0B0D13]` e `text-[#F4EFEA]`, confirmando legibilidade e contraste WCAG AA.

### US3 — Saneamento de Perfil, Diário e Modais Interativos (P2)
Como usuário personalizando meu perfil, registrando notas no diário ou editando progresso de obras, quero que os modais e telas secundárias respeitem a mesma harmonia visual clara com inputs legíveis e bordas sutis.
- **Independent Test:** Abrir `EditProfileModal`, `CreateNoteModal` e `EditItemModal` em Modo Claro e verificar que o fundo do modal e seus inputs utilizam superfícies semânticas com rótulos e textos escuros legíveis.

## Success Criteria

- **SC-001:** Zero ocorrências de classes hexadecimais escuras fixas (`bg-[#1A1820]`, `bg-[#181C2B]`, `bg-[#0B0D13]`, `bg-[#24202C]`, `text-[#F4EFEA]`, `text-[#F3F4F6]`) nos componentes visuais do Home Hub, Biblioteca, Perfil e Diário.
- **SC-002:** Contraste mínimo de texto verificado conforme WCAG 2.2 AA (mínimo de 4.5:1 para texto secundário e 14:1 para texto primário em superfícies claras).
- **SC-003:** Preservação estrita de legibilidade em badges sobrepostos a capas através de contraste explícito (`bg-black/75 text-white`).
- **SC-004:** Aprovação de 100% dos testes existentes no monorepo (`319/319 PASS`) sem quebras de funcionalidade ou regressões.

## Edge Cases

- **Badges sobre capas escuras:** Badges de categoria e status sobre imagens devem reter contraste escuro com texto branco garantido para não herdarem texto preto do tema claro.
- **Bordas em superfícies brancas:** Em Modo Claro, as bordas devem utilizar opacidade translúcida sutil nanquim (`rgba(24, 22, 27, 0.08)`), garantindo separação visual sem criar linhas duras ou artificiais.

## Out of Scope

- Criação de novos temas visuais além de Dark Editorial e Light Editorial (ex.: modo alto contraste monocromático).
- Modificação na lógica de banco de dados, APIs externas ou rotas do servidor.

## Clarifications

### Session 2026-11-12
- Q: Qual direção estética você prefere para o fundo e superfícies do Modo Claro? → A: Opção A (Light Editorial Washi — fundo off-white #F9F8F5, cartões brancos #FFFFFF e tipografia em nanquim #16141A).
- Q: Qual a abrangência desejada para a erradicação de cores hardcoded nesta mudança? → A: Opção A (Varredura Completa — saneamento de Home Hub, Biblioteca, Perfil, Diário e Modais).

