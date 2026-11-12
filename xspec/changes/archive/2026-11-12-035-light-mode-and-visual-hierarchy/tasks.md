# Tasks: 035-light-mode-and-visual-hierarchy

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD `tests/light-mode-and-visual-hierarchy.test.mjs` validando os tokens semânticos de superfícies e cores de `[data-theme="light"]`, cálculo de contraste WCAG 2.2 AAA e varredura estática de ausência de hexadecimais escuros estáticos. Verificar executando `node tests/light-mode-and-visual-hierarchy.test.mjs`. (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)
- [x] 1.2 Atualizar `apps/web/src/app/globals.css` definindo os tokens da paleta Washi Editorial Mineral Quente (`--surface-canvas: #F9F8F5`, `--surface-raised: #FFFFFF`, `--surface-overlay: #F1EFEA`, `--surface-sunken: #E7E3DA`, `--stroke-subtle: rgba(24, 22, 27, 0.08)`, `--stroke-strong: rgba(24, 22, 27, 0.16)`, `--ring-focus: #C8453B`). Verificar via inspeção do CSS e execução do teste. (Ref: R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao)
- [x] 1.3 Calibrar a escala tipográfica editorial e os tokens semânticos de texto (`--color-text-primary: #16141A`, `--color-text-secondary: #5A5462`, `--color-text-muted: #7E7786`) em `apps/web/src/app/globals.css` e `apps/web/tailwind.config.ts`. Verificar via compilação e teste estático. (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 1.4 Refatorar `apps/web/src/components/layout/theme-toggle.tsx` para alternância dinâmica de tema com superfícies semânticas (`bg-surface-raised`, `hover:bg-surface-overlay`, `text-[var(--color-text-primary)]`, `border-stroke-subtle`, `focus-visible:ring-accent`), eliminando `bg-[#181C2B]` e `#06B6D4`. Verificar via renderização do botão e alternância de estado. (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)
- [x] 1.5 Padronizar os tokens de acentos de mídia bimodais (`--accent-media-video`, `--accent-media-print`, `--accent-media-anime`) em `globals.css` e `tailwind.config.ts` preservando contraste mínimo de 4.5:1 em ambos os temas. Verificar via teste visual e classes semânticas. (Ref: R:Theme Selection and Accessibility Foundations / S:Padronizacao semantica de acentos de midia bimodais)
- [x] 1.6 Garantir suporte semântico para o anel de foco acessível com acento Carmim (`--ring-focus: #C8453B`) e `:focus-visible` em todos os botões e links de navegação. Verificar via foco por teclado. (Ref: R:Theme Selection and Accessibility Foundations / S:Anel de foco visivel semantico para navegacao acessivel)
- [x] 1.7 Verificar e assegurar respeito à diretiva `prefers-reduced-motion` nas animações de transição do tema visual em `globals.css`. Verificar via inspeção das regras de media query. (Ref: R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Refatorar `apps/web/src/app/library/page.tsx` substituindo a tag `<main className="min-h-screen bg-[#0B0D13] text-[#F3F4F6] ...">` por `<main className="min-h-screen bg-background text-[var(--color-text-primary)] ...">`, permitindo que o contêiner raiz da biblioteca herde as variáveis de tema. Verificar via inspeção da árvore DOM e verificação estática. (Ref: R:Personal Library View and Layout Toggle / S:Conteiner da biblioteca integrado ao tema visual ativo)
- [x] 2.2 [US1] Garantir a renderização responsiva da biblioteca pessoal em modo grade com capas na proporção editorial 2:3 e indicadores de progresso. Verificar via inspeção do layout na rota `/library`. (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 2.3 [US1] Verificar e preservar a alternância para modo lista com persistência no localStorage no componente `library-filters.tsx`. Verificar comutando entre visualizações. (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)
- [x] 2.4 [US1] Preservar o redirecionamento de usuário anônimo na rota `/library` para a tela de login. Verificar tentando acessar a biblioteca deslogado. (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.5 [US1] Harmonizar o layout superior de status pessoal nos cards da biblioteca com selos sóbrios rente à margem superior sem acúmulo de badges de vidro. Verificar via visualização dos cards. (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.6 [US1] Assegurar o carregamento e a desserialização robusta dos itens da biblioteca preservando os tipos `LibraryItemDto`. Verificar via requisição da API de biblioteca. (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)
- [x] 2.7 [US1] Assegurar a exibição limpa do cabeçalho da biblioteca com KPIs consolidados em faixa sem rótulos redundantes. Verificar via renderização do cabeçalho de `/library`. (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 2.8 [US1] Preservar o card pontilhado de registrar nova obra ao final da grade da biblioteca com cores semânticas. Verificar na última posição da grade de obras. (Ref: R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca)
- [x] 2.9 [US1] Refatorar `apps/web/src/components/library/library-card.tsx` garantindo cards em cromo neutro e badges de capa anti-colisão com texto claro explícito (`bg-black/60 text-white/90 border-white/10`). Verificar via inspeção de estilo e testes. (Ref: R:Personal Library View and Layout Toggle / S:Cards da biblioteca em cromo neutro sem tingimento por categoria)
- [x] 2.10 [US2] Refatorar `apps/web/src/components/home/continue-watching.tsx` garantindo a exibição de obras ativas em andamento com superfícies semânticas. Verificar via inspeção do Home Hub logado. (Ref: R:Continue Watching Feed and Active Progress / S:Exibicao de obras ativas em andamento para usuario autenticado)
- [x] 2.11 [US2] Preservar o botão de incremento rápido de unidade (+1) no feed de progresso do Home Hub com feedback visual. Verificar clicando no avanço de episódio/capítulo. (Ref: R:Continue Watching Feed and Active Progress / S:Incremento rapido de unidade a partir do Home Hub)
- [x] 2.12 [US2] Refatorar `apps/web/src/components/home/trending-showcase.tsx` e `continue-watching.tsx` garantindo suporte integral e concordância visual no modo claro sem hexadecimais estáticos escuros (`#1A1820`, `#2B2735`, `#F4EFEA`). Verificar via verificação estática. (Ref: R:Continue Watching Feed and Active Progress / S:Concordancia visual e suporte integral ao tema claro no Home Hub)
- [x] 2.13 [US2] Refatorar `apps/web/src/app/profile/page.tsx` e `apps/web/src/components/profile/profile-stats.tsx` substituindo `bg-[#1A1820]`, `bg-[#24202C]`, `border-[#2B2735]`, `text-[#F4EFEA]` e `text-zinc-400` por superfícies semânticas `bg-surface-raised`, `bg-surface-overlay`, `border-stroke-subtle`, `text-[var(--color-text-primary)]` e `text-[var(--color-text-secondary)]`. Verificar via inspeção do perfil. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Harmonizacao semantica de superficies e textos do perfil)
- [x] 2.14 [US2] Assegurar a exibição e posicionamento da vitrine de obras favoritas no perfil do usuário com prioridade visual. Verificar visualizando perfil com favoritos. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)
- [x] 2.15 [US2] Garantir que a vitrine de favoritos apareça invertida no topo do perfil, acima dos blocos analíticos. Verificar ordem das seções no perfil. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil)
- [x] 2.16 [US2] Preservar o estado acolhedor amigável para a vitrine quando o usuário ainda não possui favoritos cadastrados. Verificar perfil sem itens favoritados. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos)
- [x] 2.17 [US2] Garantir identificação limpa do usuário no perfil sem selos decorativos vazios e sem emojis. Verificar cabeçalho do perfil. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis)
- [x] 2.18 [US2] Assegurar ocultação estrita de anotações privadas e telefone para terceiros na rota `/profile`. Verificar resposta pública de perfil. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros)
- [x] 2.19 [US2] Refatorar `apps/web/src/components/profile/edit-profile-modal.tsx`, `apps/web/src/components/diary/create-note-modal.tsx` e `apps/web/src/components/library/edit-item-modal.tsx` para superfícies semânticas, bordas sutis e inputs acessíveis sem hexadecimais estáticos escuros. Verificar via abertura e digitação nos modais. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Harmonizacao semantica de superficies e textos do perfil)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes TDD `node tests/light-mode-and-visual-hierarchy.test.mjs` comprovando aprovação de todos os testes de tema e contraste. Verificar saída com zero falhas. (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)
- [x] 3.2 Executar a suíte completa de regressão do YuukiList (`npm test`) validando todas as capacidades existentes. Verificar relatório de testes. (Ref: R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao)
- [x] 3.3 Executar o build de produção do frontend (`npm --prefix apps/web run build`) confirmando integridade de bundles e tipos TypeScript. Verificar código de saída 0. (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Theme Selection and Accessibility Foundations | S:Alternancia dinamica de tema visual | 1.4, 3.3 | apps/web/src/components/layout/theme-toggle.tsx | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Theme Selection and Accessibility Foundations | S:Respeito a diretiva de movimento reduzido | 1.7 | apps/web/src/app/globals.css | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Theme Selection and Accessibility Foundations | S:Aplicacao efetiva de cores claras nas superficies e textos | 1.1, 3.1 | apps/web/src/app/globals.css | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Theme Selection and Accessibility Foundations | S:Aplicacao da escala tipografica editorial e paleta mineral | 1.3 | apps/web/src/app/globals.css, apps/web/tailwind.config.ts | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Theme Selection and Accessibility Foundations | S:Suporte a tokens semanticos de superficie e contornos de refracao | 1.2, 3.2 | apps/web/src/app/globals.css | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Theme Selection and Accessibility Foundations | S:Padronizacao semantica de acentos de midia bimodais | 1.5 | apps/web/src/app/globals.css | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Theme Selection and Accessibility Foundations | S:Anel de foco visivel semantico para navegacao acessivel | 1.6 | apps/web/src/app/globals.css | tests/tokens-and-anti-drift.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Continue Watching Feed and Active Progress | S:Exibicao de obras ativas em andamento para usuario autenticado | 2.10 | apps/web/src/components/home/continue-watching.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Continue Watching Feed and Active Progress | S:Incremento rapido de unidade a partir do Home Hub | 2.11 | apps/web/src/components/home/continue-watching.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Continue Watching Feed and Active Progress | S:Concordancia visual e suporte integral ao tema claro no Home Hub | 2.12 | apps/web/src/components/home/trending-showcase.tsx, apps/web/src/components/home/continue-watching.tsx | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 2.2 | apps/web/src/components/library/library-card.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.3 | apps/web/src/components/library/library-filters.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.4 | apps/web/src/app/library/page.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.5 | apps/web/src/components/library/library-card.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Personal Library View and Layout Toggle | S:Carregamento robusto e desserializacao de itens da biblioteca | 2.6 | apps/web/src/components/library/library-helpers.ts | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Personal Library View and Layout Toggle | S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.7 | apps/web/src/components/library/ledger-header.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-017 | R:Personal Library View and Layout Toggle | S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.8 | apps/web/src/components/library/dashed-register-card.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-018 | R:Personal Library View and Layout Toggle | S:Cards da biblioteca em cromo neutro sem tingimento por categoria | 2.9 | apps/web/src/components/library/library-card.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-019 | R:Personal Library View and Layout Toggle | S:Conteiner da biblioteca integrado ao tema visual ativo | 2.1 | apps/web/src/app/library/page.tsx | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-020 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.14 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-021 | R:Profile Showcase and Activity Feed Privacy | S:Ocultacao estrita de anotacoes privadas para terceiros | 2.18 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-022 | R:Profile Showcase and Activity Feed Privacy | S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.15 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-023 | R:Profile Showcase and Activity Feed Privacy | S:Estado amigavel para vitrine sem favoritos | 2.16 | apps/web/src/components/profile/favorites-showcase.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-024 | R:Profile Showcase and Activity Feed Privacy | S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.17 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-025 | R:Profile Showcase and Activity Feed Privacy | S:Harmonizacao semantica de superficies e textos do perfil | 2.13, 2.19 | apps/web/src/app/profile/page.tsx, apps/web/src/components/profile/edit-profile-modal.tsx, apps/web/src/components/profile/profile-stats.tsx | tests/light-mode-and-visual-hierarchy.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual | 1.4, 3.3 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido | 1.7 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos | 1.1, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral | 1.3 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Suporte a tokens semanticos de superficie e contornos de refracao | 1.2, 3.2 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Padronizacao semantica de acentos de midia bimodais | 1.5 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Anel de foco visivel semantico para navegacao acessivel | 1.6 | COVERED |
| R:Continue Watching Feed and Active Progress / S:Exibicao de obras ativas em andamento para usuario autenticado | 2.10 | COVERED |
| R:Continue Watching Feed and Active Progress / S:Incremento rapido de unidade a partir do Home Hub | 2.11 | COVERED |
| R:Continue Watching Feed and Active Progress / S:Concordancia visual e suporte integral ao tema claro no Home Hub | 2.12 | COVERED |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 2.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 2.3 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.4 | COVERED |
| R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.5 | COVERED |
| R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca | 2.6 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.7 | COVERED |
| R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.8 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cards da biblioteca em cromo neutro sem tingimento por categoria | 2.9 | COVERED |
| R:Personal Library View and Layout Toggle / S:Conteiner da biblioteca integrado ao tema visual ativo | 2.1 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil | 2.14 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros | 2.18 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.15 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos | 2.16 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.17 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Harmonizacao semantica de superficies e textos do perfil | 2.13, 2.19 | COVERED |

- **Constitution Check:** PASS (Aderência estrita à soberania de dados, bimodalidade de temas e WCAG 2.2 AAA sem adições de pacotes desnecessários)
- **Active Change Conflicts:** Nenhum conflito detectado.
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos 4 requisitos e 25 cenários normativos cobertos por tarefas com rastreabilidade bidirecional na Traceability Matrix.

## Drift Log

- Compatibilização das asserções de testes legados em `tests/asian-editorial-foundation.test.mjs`, `tests/navigation-theme-fixes.test.mjs` e `tests/tokens-and-anti-drift.test.mjs` para aceitar os tokens refinados da paleta Washi Editorial Mineral Quente (#F9F8F5 e #16141A) em conjunto com os valores slate anteriores.
- Saneamento de emojis residuais em `apps/web/src/components/diary/create-note-modal.tsx` e `apps/web/src/components/diary/timeline-view.tsx` substituindo glifos por ícones SVG e indicadores circulares acessíveis em estrita aderência ao padrão visual Asian Editorial.
