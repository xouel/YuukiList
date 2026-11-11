# Tasks: 023-consolidated-shell-and-home-hub

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD em tests/consolidated-shell-and-home-hub.test.mjs cobrindo a Top Command Bar, os blocos do Home Hub e o desacoplamento de /explore (Ref: R:Home Hub Dashboard and Asymmetric Layout / S:Visualizacao do Home Hub em tela desktop)
- [x] 1.2 Corrigir e normalizar a resposta de LibraryApiClient em apps/web/src/services/library-api.client.ts garantindo que list() e listItems() forneçam data e items simultaneamente (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)
- [x] 1.3 Atualizar o consumo defensivo em apps/web/src/components/library/library-view.tsx e apps/web/src/components/catalog/catalog-view.tsx para ler res.data ou res.items (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Refatorar apps/web/src/components/layout/navigation-shell.tsx para implementar a Top Command Bar horizontal no desktop com links Início, Minha Lista, Explorar e Calendário, barra de busca rápida, notificações, tema e menu de usuário (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Top Command Bar horizontal)
- [x] 2.2 [US1] Preservar a Bottom Navigation acessível no mobile e alinhamento em container max-w-7xl em navigation-shell.tsx (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar)
- [x] 2.3 [US1] Ajustar botões dinâmicos de autenticação conforme a rota ativa no cabeçalho e menu (Ref: R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa)
- [x] 2.4 [US1] Garantir alinhamento horizontal em container global uniforme max-w-7xl em todas as rotas (Ref: R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado)
- [x] 2.5 [US2] Criar o componente apps/web/src/components/home/hero-spotlight.tsx com capa ampliada, dados da obra prioritária, barra de progresso visual e botão de avanço rápido (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado)
- [x] 2.6 [US2] Implementar no Hero Spotlight a variante de acolhimento editorial e chamada para ação para visitantes anônimos (Ref: R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo)
- [x] 2.7 [US2] Criar o componente apps/web/src/components/home/continue-watching.tsx com lista tátil de obras em andamento, percentuais e botões de incremento com área de toque de 44x44px (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.8 [US2] Criar o componente apps/web/src/components/home/bento-sidebar.tsx implementando o cartão de Resumo Semanal e a régua de Constância Diária de 7 dias com streak pessoal (Ref: R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias)
- [x] 2.9 [US2] Implementar na Sidebar Bento os cartões de Próximas Estreias e Feed de Atividade recente do diário pessoal (Ref: R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario)
- [x] 2.10 [US2] Criar apps/web/src/components/home/trending-showcase.tsx com vitrine de recomendações editoriais da temporada (Ref: R:Home Hub Dashboard and Asymmetric Layout / S:Adaptacao responsiva fluida em dispositivos moveis)
- [x] 2.11 [US2] Construir o orquestrador apps/web/src/components/home/home-hub-view.tsx conectando o grid assimétrico 8+4 colunas no desktop e adaptando para coluna única no mobile (Ref: R:Home Hub Dashboard and Asymmetric Layout / S:Visualizacao do Home Hub em tela desktop)
- [x] 2.12 [US3] Criar a rota dedicada apps/web/src/app/explore/page.tsx instanciando a visão completa do catálogo com rolagem infinita (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita na rota de exploracao)
- [x] 2.13 [US3] Garantir sincronização bidirecional de busca e filtros na URL em /explore (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Sincronização bidirecional de busca e filtros na URL)
- [x] 2.14 [US3] Integrar barra condensada e drawer recolhível de filtros avançados em /explore (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)
- [x] 2.15 [US3] Atualizar apps/web/src/app/page.tsx para renderizar o Home Hub e redirecionar consultas de busca com parâmetros para /explore (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Compatibilidade e redirecionamento de consultas diretas)
- [x] 2.16 [US3] Validar persistência de layout (grade/lista) em apps/web/src/components/library/library-view.tsx (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)
- [x] 2.17 [US3] Garantir redirecionamento de visitante anônimo ao tentar acessar a biblioteca pessoal (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes unitários e de integração tests/consolidated-shell-and-home-hub.test.mjs (Ref: R:Home Hub Dashboard and Asymmetric Layout / S:Visualizacao do Home Hub em tela desktop)
- [x] 3.2 Executar a suíte completa de regressão com todos os 207 testes existentes garantindo 100% de aprovação (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Top Command Bar horizontal)
- [x] 3.3 Executar build de produção npm --prefix apps/web run build e validar rotas no navegador headless (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Home Hub Dashboard and Asymmetric Layout | S:Visualizacao do Home Hub em tela desktop | 1.1, 2.11, 3.1 | apps/web/src/components/home/home-hub-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Home Hub Dashboard and Asymmetric Layout | S:Adaptacao responsiva fluida em dispositivos moveis | 2.10, 2.11, 3.1 | apps/web/src/components/home/home-hub-view.tsx, apps/web/src/components/home/trending-showcase.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado | 2.5, 3.1 | apps/web/src/components/home/hero-spotlight.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Hero Spotlight and Quick Tracking | S:Apresentacao editorial de acolhimento para visitante anonimo | 2.6, 3.1 | apps/web/src/components/home/hero-spotlight.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Bento Sidebar and Personal Analytics | S:Renderizacao do resumo semanal e constancia de sete dias | 2.8, 3.1 | apps/web/src/components/home/bento-sidebar.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Bento Sidebar and Personal Analytics | S:Exibicao de proximos lancamentos e atividade do diario | 2.9, 3.1 | apps/web/src/components/home/bento-sidebar.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:App Navigation Shell and Responsive Layout | S:Navegacao desktop com Top Command Bar horizontal | 2.1, 3.2 | apps/web/src/components/layout/navigation-shell.tsx | tests/consolidated-shell-and-home-hub.test.mjs, tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:App Navigation Shell and Responsive Layout | S:Navegacao mobile com Bottom Navigation bar | 2.2, 3.2 | apps/web/src/components/layout/navigation-shell.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:App Navigation Shell and Responsive Layout | S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 2.3, 3.2 | apps/web/src/components/layout/navigation-shell.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:App Navigation Shell and Responsive Layout | S:Alinhamento horizontal em container global padronizado | 2.4, 3.2 | apps/web/src/components/layout/navigation-shell.tsx | tests/consolidated-shell-and-home-hub.test.mjs, tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Catalog Exploration and Infinite Scroll Interface | S:Exibição da grade de cards com rolagem infinita na rota de exploracao | 2.12, 3.1 | apps/web/src/app/explore/page.tsx, apps/web/src/components/catalog/catalog-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Catalog Exploration and Infinite Scroll Interface | S:Sincronização bidirecional de busca e filtros na URL | 2.13, 3.1 | apps/web/src/components/catalog/catalog-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Catalog Exploration and Infinite Scroll Interface | S:Barra de controles condensada com drawer de filtros avancados | 2.14, 3.1 | apps/web/src/components/catalog/catalog-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Catalog Exploration and Infinite Scroll Interface | S:Compatibilidade e redirecionamento de consultas diretas | 2.15, 3.1 | apps/web/src/app/page.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 1.3, 3.2 | apps/web/src/components/library/library-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.16, 3.2 | apps/web/src/components/library/library-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-017 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.17, 3.2 | apps/web/src/components/library/library-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-018 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.7, 3.2 | apps/web/src/components/home/continue-watching.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-019 | R:Personal Library View and Layout Toggle | S:Carregamento robusto e desserializacao de itens da biblioteca | 1.2, 3.3 | apps/web/src/services/library-api.client.ts | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Home Hub Dashboard and Asymmetric Layout / S:Visualizacao do Home Hub em tela desktop | 1.1, 2.11, 3.1 | COVERED |
| R:Home Hub Dashboard and Asymmetric Layout / S:Adaptacao responsiva fluida em dispositivos moveis | 2.10, 2.11, 3.1 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado | 2.5, 3.1 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo | 2.6, 3.1 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias | 2.8, 3.1 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario | 2.9, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Top Command Bar horizontal | 2.1, 3.2 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar | 2.2, 3.2 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 2.3, 3.2 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado | 2.4, 3.2 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita na rota de exploracao | 2.12, 3.1 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Sincronização bidirecional de busca e filtros na URL | 2.13, 3.1 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados | 2.14, 3.1 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Compatibilidade e redirecionamento de consultas diretas | 2.15, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 1.3, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 2.16, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.17, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.7, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca | 1.2, 3.3 | COVERED |

- **Constitution Check:** PASS (Todas as decisões respeitam estritamente a Constituição: monólito modular desacoplado, custo R$ 0, sem dependências proprietárias ou dados de terceiros no bundle, WCAG 2.2 AA e privacidade por padrão).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas uma mudança ativa `023-consolidated-shell-and-home-hub`).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
