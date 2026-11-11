# Tasks: 020-tactile-personal-library

## 1. Setup & Baseline

- [x] 1.1 Criar suíte de testes TDD em `tests/tactile-personal-library.test.mjs` cobrindo componente tátil de progresso ("Ep. X/Y" + barra visual + alvo 44px), remoção do painel recortado, posicionamento do status no canto superior e abas em pílula (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)

## 2. Core Implementation (US1, US2, US3)

- [x] 2.1 [P] [US1] Atualizar `library-helpers.ts` para desambiguar a taxonomia de status das abas (`Assistindo / Lendo`, `Planejados`, `Concluídos`, `Pausados`, `Dropados`) e calcular progresso com total de unidades conhecidas (Ref: R:Library Filtering and Asynchronous States / S:Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados)
- [x] 2.2 [P] [US1] Atualizar `library-filters.tsx` com estilo pílula sutil para as abas de status, contadores numéricos integrados e categorias no plural (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria)
- [x] 2.3 [P] [US2] Atualizar `LibraryCard` em `apps/web/src/components/library/library-card.tsx` com componente tátil de progresso (`Ep. X/Y` ou `Cap. X/Y`), barra visual de progresso proporcional e botão de avanço com área mínima de 44x44px (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)
- [x] 2.4 [P] [US3] Atualizar `LibraryCard` em `apps/web/src/components/library/library-card.tsx` com reposicionamento do selo de status pessoal no canto superior e badges de categoria editoriais (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)
- [x] 2.5 [US2] Assegurar incremento rápido otimista no card mantendo consistência de estado com o backend (Ref: R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista)
- [x] 2.6 [US2] Validar exibição destacada do badge "Em dia" para obras com progresso igual ao total (Ref: R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas)
- [x] 2.7 [US2] Preservar e alinhar o modal de edição detalhada de status, nota e notas privadas (Ref: R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado)
- [x] 2.8 [US1] Atualizar `LibraryView` em `apps/web/src/components/library/library-view.tsx` eliminando o painel de fundo recortado e unificando com o container global `max-w-7xl` (Ref: R:Personal Library View and Layout Toggle / S:Exibicao da biblioteca pessoal em modo grade)
- [x] 2.9 [US1] Validar alternância entre modo grade e lista com persistência em localStorage (Ref: R:Personal Library View and Layout Toggle / S:Alternancia para modo lista com persistencia em localStorage)
- [x] 2.10 [US1] Assegurar redirecionamento automático de visitantes anônimos para login com parâmetro returnTo (Ref: R:Personal Library View and Layout Toggle / S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca)
- [x] 2.11 [US1] Validar estados assíncronos de biblioteca vazia e tratamento resiliente de erros com nova tentativa (Ref: R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas)
- [x] 2.12 [US1] Validar recuperação resiliente em falhas de rede com botão de repetição (Ref: R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados `tests/tactile-personal-library.test.mjs` e a suíte completa de regressão do projeto (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)
- [x] 3.2 Executar build de produção do frontend (`npm --prefix apps/web run build`) e validar renderização no servidor daemon (Ref: R:Personal Library View and Layout Toggle / S:Harmonizacao de layout e posicionamento superior do status pessoal)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Personal Library View and Layout Toggle | S:Exibicao da biblioteca pessoal em modo grade | 2.8 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Personal Library View and Layout Toggle | S:Alternancia para modo lista com persistencia em localStorage | 2.9 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Personal Library View and Layout Toggle | S:Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.10 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Personal Library View and Layout Toggle | S:Harmonizacao de layout e posicionamento superior do status pessoal | 2.4, 3.2 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-view.tsx | tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Quick Progress Tracking and Detail Modal | S:Incremento rapido de unidade com atualizacao otimista | 2.5 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Quick Progress Tracking and Detail Modal | S:Exibicao destacada do badge Em dia para obras alcancadas | 2.6 | apps/web/src/components/library/library-card.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Quick Progress Tracking and Detail Modal | S:Edicao de status e nota pessoal atraves do modal detalhado | 2.7 | apps/web/src/components/library/edit-item-modal.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Quick Progress Tracking and Detail Modal | S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 1.1, 2.3, 3.1 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/library/library-helpers.ts | tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Library Filtering and Asynchronous States | S:Filtragem combinada por aba de status e categoria | 2.2 | apps/web/src/components/library/library-filters.tsx, apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Library Filtering and Asynchronous States | S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.11 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Library Filtering and Asynchronous States | S:Tratamento de erro com acao de tentar novamente | 2.12 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs, tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Library Filtering and Asynchronous States | S:Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados | 2.1 | apps/web/src/components/library/library-filters.tsx, apps/web/src/components/library/library-helpers.ts | tests/tactile-personal-library.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

### Coverage Table

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| Personal Library View and Layout Toggle / Exibicao da biblioteca pessoal em modo grade | 2.8 | Coberto |
| Personal Library View and Layout Toggle / Alternancia para modo lista com persistencia em localStorage | 2.9 | Coberto |
| Personal Library View and Layout Toggle / Redirecionamento de usuario anonimo ao tentar acessar a biblioteca | 2.10 | Coberto |
| Personal Library View and Layout Toggle / Harmonizacao de layout e posicionamento superior do status pessoal | 2.4, 3.2 | Coberto |
| Quick Progress Tracking and Detail Modal / Incremento rapido de unidade com atualizacao otimista | 2.5 | Coberto |
| Quick Progress Tracking and Detail Modal / Exibicao destacada do badge Em dia para obras alcancadas | 2.6 | Coberto |
| Quick Progress Tracking and Detail Modal / Edicao de status e nota pessoal atraves do modal detalhado | 2.7 | Coberto |
| Quick Progress Tracking and Detail Modal / Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 1.1, 2.3, 3.1 | Coberto |
| Library Filtering and Asynchronous States / Filtragem combinada por aba de status e categoria | 2.2 | Coberto |
| Library Filtering and Asynchronous States / Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.11 | Coberto |
| Library Filtering and Asynchronous States / Tratamento de erro com acao de tentar novamente | 2.12 | Coberto |
| Library Filtering and Asynchronous States / Abas inteligentes em estilo pilula com taxonomia desambiguada e contadores integrados | 2.1 | Coberto |

### Verification Checks

1. **Coverage Gaps:** 100% dos requisitos normativos e cenários da especificação delta estão mapeados em tarefas e na Traceability Matrix.
2. **Constitution Check:** O plano respeita a regra de custo zero, sem adição de bibliotecas externas pagas ou proprietárias.
3. **Inconsistency Check:** Nomenclaturas de arquivos, componentes (`LibraryCard`, `LibraryFilters`, `LibraryView`) e tipos DTO perfeitamente alinhados entre proposal, specs, design e tasks.
4. **Sub-specification Check:** Todas as tarefas trazem caminhos exatos de arquivos e referências normativas sem placeholders.
5. **Duplication Check:** Não há tarefas nem cenários duplicados.
6. **Active Conflicts Check:** Nenhuma outra mudança ativa concorre com a fatia 020.
