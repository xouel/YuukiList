# Tasks: 010-navigation-ux-and-quick-actions

## 1. Setup & Foundational

- [x] 1.1 [P] Implementar componente de alternância de tema `ThemeToggle` em `apps/web/src/components/layout/theme-toggle.tsx` com persistência em localStorage e respeito a `prefers-reduced-motion` (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)
- [x] 1.2 [P] Implementar rodapé de atribuição legal e avisos obrigatórios `LegalFooter` em `apps/web/src/components/layout/legal-footer.tsx` (Ref: R:Provenance Attribution and Legal Notices / S:Exibicao de notices legais e atribuicao de fontes)
- [x] 1.3 Criar suíte de testes automatizados `tests/navigation-ux-quick-actions.test.mjs` com asserções para todos os 7 cenários normativos antes da implementação (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Construir o componente `NavigationShell` em `apps/web/src/components/layout/navigation-shell.tsx` com Sidebar desktop (largura >= 1024px) exibindo as 5 áreas principais (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 2.2 [P] [US1] Adicionar no `NavigationShell` a Bottom Navigation bar fixa para dispositivos móveis (< 768px) com padding inferior seguro (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar)
- [x] 2.3 [US1] Criar as páginas funcionais `/calendar` em `apps/web/src/app/calendar/page.tsx` e `/profile` em `apps/web/src/app/profile/page.tsx` integradas ao shell (Ref: R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente)
- [x] 2.4 [US1] Integrar o `NavigationShell` ao layout principal em `apps/web/src/app/layout.tsx` e atualizar `globals.css` com variáveis de tema e reduced motion (Ref: R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido)
- [x] 2.5 [US2] Implementar botão de ação rápida (`quick-add`) no `MediaCard` em `apps/web/src/components/catalog/media-card.tsx` permitindo adicionar com 1 clique (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Adicao rapida de obra a biblioteca pessoal a partir do card)
- [x] 2.6 [US3] Atualizar `FilterBar` em `apps/web/src/components/catalog/filter-bar.tsx` com filtros de País de Origem e Temas Transversais (`BL`/`GL`) (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Filtragem combinada por pais de origem e temas transversais)
- [x] 2.7 [US3] Atualizar `ItemDetailView` em `apps/web/src/components/catalog/item-detail-view.tsx` para exibir seção visual de proveniência por campo e créditos legais (Ref: R:Provenance Attribution and Legal Notices / S:Exibicao de notices legais e atribuicao de fontes)

## 3. Validation & Integration

- [x] 3.1 Atualizar o contêiner do servidor web em `apps/web/src/server/container.ts` para sincronizar o lote canônico ingerido na memória do catálogo (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Filtragem combinada por pais de origem e temas transversais)
- [x] 3.2 Executar a suíte de testes completa do monorepo e validar ausência de regressões com `tests/navigation-ux-quick-actions.test.mjs` (Ref: R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:App Navigation Shell and Responsive Layout | S:Navegacao desktop com Sidebar lateral persistente | 1.3, 2.1, 2.3 | apps/web/src/components/layout/navigation-shell.tsx, apps/web/src/app/calendar/page.tsx, apps/web/src/app/profile/page.tsx | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:App Navigation Shell and Responsive Layout | S:Navegacao mobile com Bottom Navigation bar | 2.2 | apps/web/src/components/layout/navigation-shell.tsx | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Theme Selection and Accessibility Foundations | S:Alternancia dinamica de tema visual | 1.1, 3.2 | apps/web/src/components/layout/theme-toggle.tsx, apps/web/src/app/globals.css | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Theme Selection and Accessibility Foundations | S:Respeito a diretiva de movimento reduzido | 2.4 | apps/web/src/app/globals.css, apps/web/src/app/layout.tsx | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Provenance Attribution and Legal Notices | S:Exibicao de notices legais e atribuicao de fontes | 1.2, 2.7 | apps/web/src/components/layout/legal-footer.tsx, apps/web/src/components/catalog/item-detail-view.tsx | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Media Card Quick Actions and Enhanced Exploration | S:Adicao rapida de obra a biblioteca pessoal a partir do card | 2.5 | apps/web/src/components/catalog/media-card.tsx | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Media Card Quick Actions and Enhanced Exploration | S:Filtragem combinada por pais de origem e temas transversais | 2.6, 3.1 | apps/web/src/components/catalog/filter-bar.tsx, apps/web/src/server/container.ts, apps/api/src/data/catalog.repository.ts | tests/navigation-ux-quick-actions.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Sidebar lateral persistente | 1.3, 2.1, 2.3 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar | 2.2 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Alternancia dinamica de tema visual | 1.1, 3.2 | COVERED |
| R:Theme Selection and Accessibility Foundations / S:Respeito a diretiva de movimento reduzido | 2.4 | COVERED |
| R:Provenance Attribution and Legal Notices / S:Exibicao de notices legais e atribuicao de fontes | 1.2, 2.7 | COVERED |
| R:Media Card Quick Actions and Enhanced Exploration / S:Adicao rapida de obra a biblioteca pessoal a partir do card | 2.5 | COVERED |
| R:Media Card Quick Actions and Enhanced Exploration / S:Filtragem combinada por pais de origem e temas transversais | 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Monólito modular preservado, zero custo adicional, acessibilidade WCAG 2.2 AA com temas Dark/Light e respeito a reduced motion).
- **Active Change Conflicts:** Nenhum conflito detectado com outras mudanças ativas.
- **Ambiguities / Underspecification:** Nenhuma pendência; contratos e rotas formalizados.
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix.

## Drift Log

- Nenhum desvio registrado.
