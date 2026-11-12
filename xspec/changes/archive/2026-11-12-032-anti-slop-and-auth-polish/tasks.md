# Tasks: 032-anti-slop-and-auth-polish

## 1. Setup & Foundational

- [x] 1.1 Criar a suíte de testes automatizados `tests/anti-slop-and-auth-polish.test.mjs` com casos validando a ramificação correta do Hero Spotlight e enums canônicos (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo)
- [x] 1.2 Definir casos de teste para validação de ausência de tingimento de categoria (`CATEGORY_COLORS`) nos cards e cabeçalho limpo sem rótulo Ledger v2.4 (Ref: R:Personal Library View and Layout Toggle / S:Cards da biblioteca em cromo neutro sem tingimento por categoria)
- [x] 1.3 Definir casos de teste verificando remoção de eyebrows no calendário e ausência de selos fictícios e emojis no perfil (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Refatorar `apps/web/src/components/home/hero-spotlight.tsx` ramificando por `isAuthenticated` para exibir "+ Adicionar à Lista" e "Ver Detalhes" para logados sem o item no acervo e remover a tag "Destaque do Diário" (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo)
- [x] 2.2 [P] [US1] Garantir exibição de boas-vindas para visitante anônimo em `apps/web/src/components/home/hero-spotlight.tsx` estritamente quando `!isAuthenticated` (Ref: R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo)
- [x] 2.3 [US1] Corrigir em `apps/web/src/components/home/home-hub-view.tsx` e `apps/web/src/components/home/continue-watching.tsx` a busca de obras ativas para os enums canônicos `ASSISTINDO` e `LENDO` (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo)
- [x] 2.4 [P] [US2] De-boxing do `apps/web/src/components/home/bento-sidebar.tsx` unificando a coluna lateral com divisores horizontais leves e substituindo `font-mono` por `tabular-nums` nas estatísticas semanais e constância (Ref: R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias)
- [x] 2.5 [P] [US2] Integrar próximas estreias e eventos do diário no fluxo unificado da lateral sem caixas isoladas pesadas em `apps/web/src/components/home/bento-sidebar.tsx` (Ref: R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario)
- [x] 2.6 [P] [US2] Remover de `apps/web/src/components/library/ledger-header.tsx` a tag "LEDGER PESSOAL V2.4" e o indicador "Sincronizado recentemente", preservando título editorial e faixa de KPIs com divisores verticais (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 2.7 [P] [US2] Remover de `apps/web/src/components/calendar/calendar-header-kpis.tsx` a etiqueta eyebrow de temporada ("Temporada de Outono 2026") (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE)
- [x] 2.8 [P] [US2] Remover de `apps/web/src/app/profile/page.tsx` os selos decorativos vazios "Colecionador" e "Acervo Privado", e erradicar o emoji no botão "Compartilhar Perfil" (Ref: R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis)
- [x] 2.9 [US3] Reestruturar `apps/web/src/components/library/library-filters.tsx` substituindo as 3 linhas de botões em formato de pílula inflada por abas editoriais limpas em linha única para status com linha indicadora de foco e seletores planos (Ref: R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados)
- [x] 2.10 [US3] Refatorar `apps/web/src/components/library/library-card.tsx` removendo `CATEGORY_COLORS` e tingimento artificial em favor de cromo neutro translúcido, eliminando `originalTitle` duplicado e saneando `font-mono` (Ref: R:Personal Library View and Layout Toggle / S:Cards da biblioteca em cromo neutro sem tingimento por categoria)
- [x] 2.11 [US3] Integrar a visualização da biblioteca diretamente na superfície do canvas sem contêiner externo restritivo em `apps/web/src/components/library/library-view.tsx` (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.12 [US3] Assegurar renderização responsiva em grade e lista da biblioteca preservando persistência no localStorage (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 2.13 [US3] Manter bloqueio e redirecionamento de usuário anônimo na rota da biblioteca pessoal em `apps/web/src/app/library/page.tsx` (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.14 [US3] Garantir desserialização robusta de dados paginados da API da biblioteca em `apps/web/src/components/library/library-view.tsx` (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)
- [x] 2.15 [US3] Preservar card pontilhado com borda tracejada de registrar nova obra ao final da grade da biblioteca (Ref: R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca)
- [x] 2.16 [US3] Validar filtragem combinada por status e categoria com contadores precisos na nova barra de abas limpas (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria)
- [x] 2.17 [US3] Assegurar feedback de estado vazio convidativo e tratamento de erro de rede com botão de nova tentativa na biblioteca (Ref: R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas)
- [x] 2.18 [US3] Validar busca local instantânea em tempo real por título com ordenação dinâmica preservada em `apps/web/src/components/library/library-filters.tsx` (Ref: R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica)
- [x] 2.19 [US3] Assegurar alternância fluida entre as três visões do calendário e agrupamento diário com turnos (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao)
- [x] 2.20 [US3] Preservar Weekly Strip com sete dias balanceados e relógio de fuso duplo comparativo com números tabulares (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip)
- [x] 2.21 [US3] Garantir vitrine de favoritos posicionada no topo do perfil com ocultação de anotações privadas para terceiros e estado acolhedor (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados com `npm test` garantindo cobertura integral dos cenários normativos e não-regressão (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo)
- [x] 3.2 Executar auditoria de acessibilidade WCAG 2.2 AA (foco visível, navegação por teclado e alvos de toque) nas abas refatoradas da biblioteca e nos controles do Hero (Ref: R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados)
- [x] 3.3 Executar build de produção Next.js com `npm --prefix apps/web run build` validando compilação estática de todas as rotas (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo | 2.1 | apps/web/src/components/home/hero-spotlight.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo | 1.1, 2.3, 3.1 | apps/web/src/components/home/hero-spotlight.tsx, apps/web/src/components/home/home-hub-view.tsx, apps/web/src/components/home/continue-watching.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Hero Spotlight and Quick Tracking | S:Apresentacao editorial de acolhimento para visitante anonimo | 2.2 | apps/web/src/components/home/hero-spotlight.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Bento Sidebar and Personal Analytics | S:Renderizacao do resumo semanal e constancia de sete dias | 2.4 | apps/web/src/components/home/bento-sidebar.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Bento Sidebar and Personal Analytics | S:Exibicao de proximos lancamentos e atividade do diario | 2.5 | apps/web/src/components/home/bento-sidebar.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 2.12 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.12 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.13 | apps/web/src/app/library/page.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.11, 3.3 | apps/web/src/components/library/library-view.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Personal Library View and Layout Toggle | S:Carregamento robusto e desserializacao de itens da biblioteca | 2.14 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Personal Library View and Layout Toggle | S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.6 | apps/web/src/components/library/ledger-header.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Personal Library View and Layout Toggle | S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.15 | apps/web/src/components/library/library-view.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Personal Library View and Layout Toggle | S:Cards da biblioteca em cromo neutro sem tingimento por categoria | 1.2, 2.10 | apps/web/src/components/library/library-card.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Library Filtering and Asynchronous States | S:Filtragem combinada por aba de status e categoria | 2.16 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Library Filtering and Asynchronous States | S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.17 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Library Filtering and Asynchronous States | S:Tratamento de erro com acao de tentar novamente | 2.17 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-017 | R:Library Filtering and Asynchronous States | S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados | 2.9, 3.2 | apps/web/src/components/library/library-filters.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-018 | R:Library Filtering and Asynchronous States | S:Busca local instantanea por texto com ordenacao dinamica | 2.18 | apps/web/src/components/library/library-filters.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-019 | R:Responsive Calendar Timeline with Day Grouping | S:Alternancia entre as tres abas de visualizacao | 2.19 | apps/web/src/components/calendar/calendar-view.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-020 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento cronologico diario de lancamentos | 2.19 | apps/web/src/components/calendar/calendar-view.tsx | tests/calendar-notifications.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-021 | R:Responsive Calendar Timeline with Day Grouping | S:Navegacao por Weekly Strip horizontal com selecao de dia | 2.19 | apps/web/src/components/calendar/calendar-view.tsx | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-022 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento de lancamentos diarios por turnos do dia | 2.19 | apps/web/src/components/calendar/day-group.tsx | tests/weekly-strip-calendar.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-023 | R:Responsive Calendar Timeline with Day Grouping | S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 1.3, 2.7 | apps/web/src/components/calendar/calendar-header-kpis.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-024 | R:Responsive Calendar Timeline with Day Grouping | S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 2.20 | apps/web/src/components/calendar/calendar-sidebar-widgets.tsx | tests/live-calendar-and-widgets.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-025 | R:Responsive Calendar Timeline with Day Grouping | S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip | 2.20 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-026 | R:Responsive Calendar Timeline with Day Grouping | S:Relogio de fuso duplo comparativo com numeros tabulares estaveis | 2.20 | apps/web/src/components/calendar/calendar-sidebar-widgets.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-027 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.21 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-028 | R:Profile Showcase and Activity Feed Privacy | S:Ocultacao estrita de anotacoes privadas para terceiros | 2.21 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-029 | R:Profile Showcase and Activity Feed Privacy | S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.21 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-030 | R:Profile Showcase and Activity Feed Privacy | S:Estado amigavel para vitrine sem favoritos | 2.21 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-031 | R:Profile Showcase and Activity Feed Privacy | S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.8 | apps/web/src/app/profile/page.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo | 2.1 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo | 1.1, 2.3, 3.1 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo | 2.2 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias | 2.4 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario | 2.5 | COVERED |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 2.12 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 2.12 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.13 | COVERED |
| R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.11, 3.3 | COVERED |
| R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca | 2.14 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.6 | COVERED |
| R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.15 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cards da biblioteca em cromo neutro sem tingimento por categoria | 1.2, 2.10 | COVERED |
| R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria | 2.16 | COVERED |
| R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.17 | COVERED |
| R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente | 2.17 | COVERED |
| R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados | 2.9, 3.2 | COVERED |
| R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica | 2.18 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao | 2.19 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos | 2.19 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia | 2.19 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia | 2.19 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 1.3, 2.7 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 2.20 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip | 2.20 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Relogio de fuso duplo comparativo com numeros tabulares estaveis | 2.20 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil | 2.21 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros | 2.21 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.21 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos | 2.21 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.8 | COVERED |

- **Constitution Check:** PASS (zero custos, zero emojis, monorepo modular e sem dependências desnecessárias)
- **Active Change Conflicts:** Nenhum conflito detectado.
- **Ambiguities / Underspecification:** Nenhuma pendência.
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas e na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
