# Tasks: 018-asian-editorial-foundation

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 [TDD] Criar suíte de testes automatizados para verificar a paleta mineral (Nanquim/Papel/Carmim), escala tipográfica de 3 níveis e container max-w-7xl em `tests/asian-editorial-foundation.test.mjs` (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 1.2 [TDD] Adicionar asserções de testes para o novo wordmark tipográfico, rótulos humanizados e alinhamento uniforme do layout em `tests/asian-editorial-foundation.test.mjs` (Ref: R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Configurar variáveis CSS da paleta Asian Editorial (Nanquim `#121115`, Superfície `#1A1820`, Bordas `#2B2735`, Papel `#F4EFEA`, Grafite `#9C96A2` e Carmim `#E05347`) em `apps/web/src/app/globals.css` (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 2.2 [US1] Configurar as classes e fontes da escala tipográfica em 3 níveis (Serifa Editorial nos títulos, Sans Neutra na interface e estilização suave para ideogramas CJK) em `apps/web/src/app/globals.css` e `apps/web/tailwind.config.ts` (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 2.3 [US3] Substituir o logotipo com gradiente tech e subtítulo em caixa alta da Sidebar por um wordmark tipográfico minimalista em `apps/web/src/components/layout/navigation-shell.tsx` (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 2.4 [US3] Atualizar os botões de ação e navegação da casca para utilizarem acento Carmim `#E05347` e fundo Nanquim em `apps/web/src/components/layout/navigation-shell.tsx` (Ref: R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa)
- [x] 2.5 [US3] Humanizar os rótulos do menu lateral ("Central & Tema" → "Notificações & Aparência"; "Soberania de Dados & LGPD" → "Privacidade & Seus Dados") no rodapé da Sidebar em `apps/web/src/components/layout/navigation-shell.tsx` (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 2.6 [US2] Unificar o container da área principal em `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` no `NavigationShell` e alinhar o rodapé legal `LegalFooter` (Ref: R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado)
- [x] 2.7 [US1] Ajustar o layout móvel (Top Header e Bottom Nav) para adotar as cores Nanquim e ícones refinados sem gradientes artificiais (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar)
- [x] 2.8 [US1] Garantir persistência de tema e calibração de contraste no tema claro Light Editorial conforme WCAG 2.2 AA (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos)
- [x] 2.9 [US1] Validar que transições e seletores respeitam a diretiva prefers-reduced-motion e foco acessível visível (Ref: R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido)
- [x] 2.10 [US1] Validar a comutação dinâmica e fluida entre Dark Editorial e Light Editorial (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte dedicada `node --experimental-strip-types --test tests/asian-editorial-foundation.test.mjs` garantindo aprovação total dos cenários (Ref: R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral)
- [x] 3.2 Executar a regressão integral de testes do repositório `npm test` confirmando conformidade de todas as suítes (Ref: R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:App Navigation Shell and Responsive Layout | S:Navegacao desktop com Sidebar lateral persistente | 1.2, 2.3, 2.5, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:App Navigation Shell and Responsive Layout | S:Navegacao mobile com Bottom Navigation bar | 1.2, 2.7, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:App Navigation Shell and Responsive Layout | S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 1.2, 2.4, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:App Navigation Shell and Responsive Layout | S:Alinhamento horizontal em container global padronizado | 1.2, 2.6, 3.2 | apps/web/src/components/layout/navigation-shell.tsx, apps/web/src/components/layout/legal-footer.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Theme Selection and Accessibility Foundations | S:Alternancia dinamica de tema visual | 1.1, 2.10, 3.1 | apps/web/src/app/globals.css | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Theme Selection and Accessibility Foundations | S:Respeito a diretiva de movimento reduzido | 1.1, 2.9, 3.1 | apps/web/src/app/globals.css | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Theme Selection and Accessibility Foundations | S:Aplicacao efetiva de cores claras nas superficies e textos | 1.1, 2.8, 3.1 | apps/web/src/app/globals.css, apps/web/src/app/layout.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Theme Selection and Accessibility Foundations | S:Aplicacao da escala tipografica editorial e paleta mineral | 1.1, 2.1, 2.2, 3.2 | apps/web/src/app/globals.css, apps/web/tailwind.config.ts | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente | 1.2, 2.3, 2.5, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar | 1.2, 2.7, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 1.2, 2.4, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado | 1.2, 2.6, 3.2 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual | 1.1, 2.10, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido | 1.1, 2.9, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao efetiva de cores claras nas superficies e textos | 1.1, 2.8, 3.1 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Aplicacao da escala tipografica editorial e paleta mineral | 1.1, 2.1, 2.2, 3.2 | COVERED |

- **Constitution Check:** PASS — Nenhuma dependência externa paga adicionada; tipografia e tokens nativos do Tailwind/CSS em conformidade estrita.
- **Active Change Conflicts:** Nenhum conflito detectado (mudança isolada).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas e mapeados na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.
