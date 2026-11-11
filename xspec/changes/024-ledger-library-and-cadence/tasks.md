# Tasks: 024-ledger-library-and-cadence

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD em tests/ledger-library-and-cadence.test.mjs cobrindo KPIs do Ledger, busca local, popover de nota, card tracejado e sparkline SVG (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 1.2 Criar módulo de utilitários e cálculos de agregação em apps/web/src/components/library/ledger-helpers.ts para horas totais, média diária e pontos do sparkline (Ref: R:Consumption Cadence and Activity Sparkline / S:Renderizacao do banner de cadencia de consumo com sparkline SVG)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Criar o componente apps/web/src/components/library/ledger-header.tsx com tag de versão LEDGER PESSOAL V2.4, indicador de sincronização, 3 cards de KPI (Concluídos, Em Andamento, Tempo Total) e botão de ação "+ Adicionar Obra" (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 2.2 [P] [US1] Atualizar apps/web/src/components/library/library-filters.tsx adicionando campo de busca local textual "Filtrar nesta lista...", seletor de ordenação e alternador de layout (Ref: R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica)
- [x] 2.3 [US1] Conectar a busca local com debounce no cliente e filtros de categoria no orquestrador apps/web/src/components/library/library-view.tsx (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria)
- [x] 2.4 [US1] Preservar alternância persistente entre modos grade e lista via localStorage em library-view.tsx (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)
- [x] 2.5 [US1] Garantir proteção de rota com redirecionamento de usuário anônimo em library-view.tsx (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.6 [P] [US2] Criar o componente apps/web/src/components/library/quick-rating-popover.tsx com seletor flutuante de notas de 1 a 10 estrelas e atualização imediata via API (Ref: R:Quick Progress Tracking and Detail Modal / S:Avaliacao rapida inline com popover de estrelas e atalho para diario)
- [x] 2.7 [US2] Refatorar apps/web/src/components/library/library-card.tsx para integrar o gatilho de avaliação rápida, botão de atalho para notas do diário e alvo tátil de 44x44px (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)
- [x] 2.8 [US2] Preservar incremento rápido de unidade (+1) com atualização otimista em library-card.tsx e library-view.tsx (Ref: R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista)
- [x] 2.9 [US2] Manter exibição destacada do badge "Em dia" para obras cujo progresso atingiu o total de episódios/capítulos (Ref: R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas)
- [x] 2.10 [US2] Preservar modal de edição detalhada de status, nota, progresso e notas privadas (Ref: R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado)
- [x] 2.11 [P] [US3] Criar o componente apps/web/src/components/library/dashed-register-card.tsx com borda tracejada, texto convidativo de registro e botão "Pesquisa Global" apontando para /explore (Ref: R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca)
- [x] 2.12 [P] [US3] Criar o componente apps/web/src/components/library/consumption-cadence-banner.tsx exibindo total dos últimos 30 dias, média diária calculada, gráfico sparkline em SVG fluido e botão de exportação CSV (Ref: R:Consumption Cadence and Activity Sparkline / S:Renderizacao do banner de cadencia de consumo com sparkline SVG)
- [x] 2.13 [US3] Implementar função utilitária de exportação de dados da biblioteca em formato CSV com cabeçalhos padronizados e codificação UTF-8 com BOM (Ref: R:Consumption Cadence and Activity Sparkline / S:Exportacao de dados da biblioteca para arquivo CSV)
- [x] 2.14 [US3] Integrar o card tracejado na grade e o banner de cadência no rodapé de apps/web/src/components/library/library-view.tsx (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 2.15 [US3] Preservar estados visuais assíncronos de carregamento, falha com botão de nova tentativa e acervo vazio convidativo (Ref: R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas)
- [x] 2.16 [US3] Validar comportamento resiliente com tratamento de erro e ação de tentar novamente em library-view.tsx (Ref: R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente)
- [x] 2.17 [US3] Garantir que as abas de status em pílula mantenham contadores integrados e taxonomia amigável (Ref: R:Library Filtering and Asynchronous States / S:Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados)
- [x] 2.18 [US3] Manter posicionamento superior dos selos de status pessoal e harmonia com a paleta Asian Editorial (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.19 [US3] Assegurar consumo robusto e desserialização de itens com suporte a data e items em library-view.tsx (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes unitários e de integração tests/ledger-library-and-cadence.test.mjs (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 3.2 Executar a suíte completa de regressão com todos os 220 testes existentes garantindo 100% de aprovação (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria)
- [x] 3.3 Executar build de produção npm --prefix apps/web run build e validar /library no servidor local (Ref: R:Consumption Cadence and Activity Sparkline / S:Renderizacao do banner de cadencia de consumo com sparkline SVG)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 1.1, 2.14, 3.1 | apps/web/src/components/library/library-view.tsx | tests/ledger-library-and-cadence.test.mjs, tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.4, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.5, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.18, 3.2 | apps/web/src/components/library/library-card.tsx | tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Personal Library View and Layout Toggle | S:Carregamento robusto e desserializacao de itens da biblioteca | 2.19, 3.2 | apps/web/src/components/library/library-view.tsx | tests/consolidated-shell-and-home-hub.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Personal Library View and Layout Toggle | S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.1, 3.1 | apps/web/src/components/library/ledger-header.tsx, apps/web/src/components/library/ledger-helpers.ts | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Personal Library View and Layout Toggle | S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.11, 3.1 | apps/web/src/components/library/dashed-register-card.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Quick Progress Tracking and Detail Modal | S:Incremento rapido de unidade com atualizacao otimista | 2.8, 3.2 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Quick Progress Tracking and Detail Modal | S:Exibicao destacada do badge Em dia para obras alcancadas | 2.9, 3.2 | apps/web/src/components/library/library-card.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Quick Progress Tracking and Detail Modal | S:Edicao de status e nota pessoal atraves do modal detalhado | 2.10, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Quick Progress Tracking and Detail Modal | S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 2.7, 3.1 | apps/web/src/components/library/library-card.tsx | tests/ledger-library-and-cadence.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Quick Progress Tracking and Detail Modal | S:Avaliacao rapida inline com popover de estrelas e atalho para diario | 2.6, 2.7, 3.1 | apps/web/src/components/library/quick-rating-popover.tsx, apps/web/src/components/library/library-card.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Library Filtering and Asynchronous States | S:Filtragem combinada por aba de status e categoria | 2.3, 3.2 | apps/web/src/components/library/library-view.tsx, apps/web/src/components/library/library-filters.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Library Filtering and Asynchronous States | S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.15, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Library Filtering and Asynchronous States | S:Tratamento de erro com acao de tentar novamente | 2.16, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Library Filtering and Asynchronous States | S:Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados | 2.17, 3.2 | apps/web/src/components/library/library-filters.tsx | tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-017 | R:Library Filtering and Asynchronous States | S:Busca local instantanea por texto com ordenacao dinamica | 2.2, 2.3, 3.1 | apps/web/src/components/library/ledger-helpers.ts, apps/web/src/components/library/library-filters.tsx, apps/web/src/components/library/library-view.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-018 | R:Consumption Cadence and Activity Sparkline | S:Renderizacao do banner de cadencia de consumo com sparkline SVG | 1.2, 2.12, 3.1 | apps/web/src/components/library/ledger-helpers.ts, apps/web/src/components/library/consumption-cadence-banner.tsx, apps/web/src/components/library/library-view.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-019 | R:Consumption Cadence and Activity Sparkline | S:Exportacao de dados da biblioteca para arquivo CSV | 2.13, 3.1 | apps/web/src/components/library/ledger-helpers.ts, apps/web/src/components/library/consumption-cadence-banner.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 1.1, 2.14, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 2.4, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.5, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.18, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca | 2.19, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.1, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.11, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista | 2.8, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas | 2.9, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado | 2.10, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 2.7, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Avaliacao rapida inline com popover de estrelas e atalho para diario | 2.6, 2.7, 3.1 | COVERED |
| R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria | 2.3, 3.2 | COVERED |
| R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.15, 3.2 | COVERED |
| R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente | 2.16, 3.2 | COVERED |
| R:Library Filtering and Asynchronous States / S:Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados | 2.17, 3.2 | COVERED |
| R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica | 2.2, 2.3, 3.1 | COVERED |
| R:Consumption Cadence and Activity Sparkline / S:Renderizacao do banner de cadencia de consumo com sparkline SVG | 1.2, 2.12, 3.1 | COVERED |
| R:Consumption Cadence and Activity Sparkline / S:Exportacao de dados da biblioteca para arquivo CSV | 2.13, 3.1 | COVERED |

- **Constitution Check:** PASS (Todas as decisões respeitam estritamente a Constituição: monólito modular desacoplado, custo R$ 0, sem dependências proprietárias, bundle leve, WCAG 2.2 AA e privacidade por padrão).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas uma mudança ativa `024-ledger-library-and-cadence`).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos 19 cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
