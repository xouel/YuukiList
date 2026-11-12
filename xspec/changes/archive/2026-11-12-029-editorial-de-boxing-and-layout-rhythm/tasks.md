# Tasks: 029-editorial-de-boxing-and-layout-rhythm

## 1. Setup & Foundational

- [x] 1.1 Criar suite de testes automatizados `tests/editorial-deboxing.test.mjs` cobrindo a ausência de sub-cards aninhados em `BentoSidebar`, ausência de `blur-3xl` em `HeroSpotlight`, presença de `divide-x` e ausência de `animate-pulse` em `LedgerHeader`, e tags nítidas em `LibraryCard`. (Ref: R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US2] Refatorar `bento-sidebar.tsx` para eliminar os sub-cards aninhados com bordas duplas em "Episódios" e "Horas Vistas", integrando as métricas em uma única régua tabular com separador vertical discreto. (Ref: R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias)
- [x] 2.2 [P] [US2] Refatorar `bento-sidebar.tsx` nos módulos de próximas estreias e feed do diário para assegurar ritmo de espaçamento limpo e respiro broadsheet. (Ref: R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario)
- [x] 2.3 [P] [US2] Refatorar `hero-spotlight.tsx` para remover o círculo difuso `blur-3xl` e chips redundantes, preservando contraste puro e tipografia editorial sobre a arte de destaque. (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado)
- [x] 2.4 [P] [US2] Refatorar `hero-spotlight.tsx` no modo de acolhimento para visitante anônimo para manter a mesma contenção editorial e ausência de artefatos artificiais. (Ref: R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo)
- [x] 2.5 [P] [US1] Refatorar `ledger-header.tsx` unificando os três blocos isolados de KPI em uma barra contínua com divisores verticais (`divide-x divide-stroke-subtle`), números tabulares (`tabular-nums`) e removendo o indicador verde pulsante (`animate-pulse`). (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)
- [x] 2.6 [P] [US3] Refatorar `library-card.tsx` para simplificar os selos de status pessoal sobrepostos na capa para uma tag tipográfica sóbria e minimalista rente à margem superior, mantendo foco na arte. (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.7 [US1] Verificar e assegurar exibição responsiva em modo grade na rota `/library` com as capas e alinhamento harmônico do de-boxing. (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 2.8 [US1] Garantir persistência e alternância para o modo lista no localStorage com a nova estrutura de cabeçalho. (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)
- [x] 2.9 [US1] Validar que o redirecionamento de visitante anônimo para login ao tentar acessar `/library` permanece íntegro com a casca desencaixada. (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.10 [US1] Garantir carregamento robusto e desserialização de itens da biblioteca na rota `/library`. (Ref: R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca)
- [x] 2.11 [US3] Validar e harmonizar o card pontilhado de registrar nova obra na grade desencaixada da biblioteca. (Ref: R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca)

## 3. Validation & Integration

- [x] 3.1 Executar a suite de testes automatizados `node --test tests/editorial-deboxing.test.mjs` e a suite de regressão global `npm test`, garantindo 100% de aprovação. (Ref: R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias)
- [x] 3.2 Executar a compilação de produção `npm --prefix apps/web run build` para validar que todas as 35 páginas e componentes compilam sem erros de tipagem ou de renderização. (Ref: R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado | 2.3, 3.1, 3.2 | apps/web/src/components/home/hero-spotlight.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Hero Spotlight and Quick Tracking | S:Apresentacao editorial de acolhimento para visitante anonimo | 2.4, 3.1, 3.2 | apps/web/src/components/home/hero-spotlight.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Bento Sidebar and Personal Analytics | S:Renderizacao do resumo semanal e constancia de sete dias | 1.1, 2.1, 3.1 | apps/web/src/components/home/bento-sidebar.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Bento Sidebar and Personal Analytics | S:Exibicao de proximos lancamentos e atividade do diario | 2.2, 3.1 | apps/web/src/components/home/bento-sidebar.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 2.7, 3.1, 3.2 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.8, 3.1 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.9, 3.1 | apps/web/src/components/auth/protected-route.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.6, 3.1, 3.2 | apps/web/src/components/library/library-card.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Personal Library View and Layout Toggle | S:Carregamento robusto e desserializacao de itens da biblioteca | 2.10, 3.1 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Personal Library View and Layout Toggle | S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.5, 3.1, 3.2 | apps/web/src/components/library/ledger-header.tsx | tests/editorial-deboxing.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Personal Library View and Layout Toggle | S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.11, 3.1 | apps/web/src/components/library/dashed-register-card.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado | 2.3, 3.1, 3.2 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo | 2.4, 3.1, 3.2 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Renderizacao do resumo semanal e constancia de sete dias | 1.1, 2.1, 3.1 | COVERED |
| R:Bento Sidebar and Personal Analytics / S:Exibicao de proximos lancamentos e atividade do diario | 2.2, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade | 2.7, 3.1, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage | 2.8, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.9, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.6, 3.1, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Carregamento robusto e desserializacao de itens da biblioteca | 2.10, 3.1 | COVERED |
| R:Personal Library View and Layout Toggle / S:Cabecalho do Ledger Pessoal com KPIs consolidados e acao de adicionar obra | 2.5, 3.1, 3.2 | COVERED |
| R:Personal Library View and Layout Toggle / S:Card pontilhado de registrar nova obra na grade da biblioteca | 2.11, 3.1 | COVERED |

- **Constitution Check:** PASS (Todas as diretrizes de custo zero, ausência de novas dependências externas pesadas e preservação de arquitetura e contratos foram rigorosamente cumpridas).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas a mudança 029 está ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência (requisitos e cenários mapeados 1:1 com os deltas de especificação).
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.

