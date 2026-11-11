# Tasks: 017-ui-ux-navigation-and-theme-fixes

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 [TDD] Criar suíte de testes automatizados para verificar as 4 abas unificadas, links clientes com Next Link e destaque reativo de auth em `tests/navigation-theme-fixes.test.mjs` (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 1.2 [TDD] Adicionar asserções de testes para comutação semântica de tema visual e contraste em `tests/navigation-theme-fixes.test.mjs` (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Unificar os itens da navegação em 4 áreas principais (Explorar, Biblioteca, Calendário, Perfil) e substituir tags `<a>` por `<Link>` do Next.js em `apps/web/src/components/layout/navigation-shell.tsx` (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 2.2 [US1] Ajustar a barra de navegação móvel inferior para exibir exatamente as 4 áreas unificadas com layout equilibrado e rótulos acessíveis (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar)
- [x] 2.3 [US3] Implementar destaque dinâmico dos botões de autenticação na barra lateral e cabeçalho mobile reagindo a `usePathname()` (`/login` destaca Entrar; `/register` destaca Cadastrar) em `apps/web/src/components/layout/navigation-shell.tsx` (Ref: R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa)
- [x] 2.4 [US2] Vincular `apps/web/src/app/layout.tsx` às variáveis semânticas de fundo e texto (`bg-[var(--color-bg-base)] text-[var(--color-text-primary)]`), removendo o hardcode de classes hexadecimais estáticas escuras no `<body>` (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)
- [x] 2.5 [US2] Adaptar a barra lateral, cabeçalho móvel e rodapé da casca de navegação em `navigation-shell.tsx` para utilizarem variáveis semânticas de superfície, borda e texto claro/escuro (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)
- [x] 2.6 [US2] Validar e calibrar variáveis CSS de contraste no `globals.css` e diretiva `prefers-reduced-motion` para ambos os temas (Ref: R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes de navegação e temas `node --experimental-strip-types --test tests/navigation-theme-fixes.test.mjs` e garantir aprovação integral de todos os cenários (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 3.2 Executar a regressão completa do monorepo com `npm test` verificando que todas as suítes passam sem quebras (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:App Navigation Shell and Responsive Layout | S:Navegacao desktop com Sidebar lateral persistente | 1.1, 2.1, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:App Navigation Shell and Responsive Layout | S:Navegacao mobile com Bottom Navigation bar | 1.1, 2.2, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:App Navigation Shell and Responsive Layout | S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 1.1, 2.3, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Theme Selection and Accessibility Foundations | S:Alternancia dinamica de tema visual | 1.2, 2.5, 3.1 | apps/web/src/components/layout/navigation-shell.tsx, apps/web/src/app/globals.css | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Theme Selection and Accessibility Foundations | S:Respeito a diretiva de movimento reduzido | 1.2, 2.6, 3.1 | apps/web/src/app/globals.css | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Theme Selection and Accessibility Foundations | S:Aplicacao efetiva de cores claras nas superficies e textos | 1.2, 2.4, 3.2 | apps/web/src/app/layout.tsx, apps/web/src/app/globals.css | tests/navigation-theme-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente | 1.1, 2.1, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar | 1.1, 2.2, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 1.1, 2.3, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual | 1.2, 2.5, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido | 1.2, 2.6, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos | 1.2, 2.4, 3.2 | COVERED |

- **Constitution Check:** PASS — Nenhuma dependência externa adicionada, stack e arquitetura 100% aderentes à xspec/constitution.md.
- **Active Change Conflicts:** Nenhum conflito detectado (mudança isolada).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas e mapeados na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.
