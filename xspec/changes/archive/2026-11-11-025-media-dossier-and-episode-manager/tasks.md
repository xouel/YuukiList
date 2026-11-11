# Tasks: 025-media-dossier-and-episode-manager

## 1. Setup & Foundational

- [x] 1.1 Criar suíte de testes TDD em `tests/media-dossier-and-episode-manager.test.mjs` cobrindo métricas editoriais, console pessoal, gerenciador de episódios e sidebar analítica (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 1.2 Definir estruturas e helpers determinísticos para episódios, temporadas e distribuição de notas em `apps/web/src/components/catalog/dossier-helpers.ts` (Ref: R:Item Details View and Navigation History / S:Gerenciador de episodios com abas de temporadas e marcacao em lote)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Implementar o componente `DossierMetricsStrip` em `apps/web/src/components/catalog/dossier-metrics-strip.tsx` exibindo as 4 métricas editoriais em destaque na paleta mineral Asian Editorial (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 2.2 [P] [US1] Implementar o componente `PersonalTrackingConsole` em `apps/web/src/components/catalog/personal-tracking-console.tsx` com seletores de status e nota, tempo assistido, barra de progresso visual proporcional e botão de incremento rápido `+ +1 Ep/Cap` com alvo tátil de 44x44px (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 2.3 [P] [US2] Implementar o componente `EpisodeManager` em `apps/web/src/components/catalog/episode-manager.tsx` com abas de temporadas, botão em lote "Marcar Temporada Toda" e lista de cards de episódios com marcação individual (Ref: R:Item Details View and Navigation History / S:Gerenciador de episodios com abas de temporadas e marcacao em lote)
- [x] 2.4 [P] [US3] Implementar o componente `DossierSidebar` em `apps/web/src/components/catalog/dossier-sidebar.tsx` com histograma de distribuição de notas, contadores de comunidade, gêneros/temas, plataformas oficiais onde assistir com links seguros e estúdios de produção (Ref: R:Item Details View and Navigation History / S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica)
- [x] 2.5 [US1] [US2] [US3] Reestruturar o componente principal `ItemDetailView` em `apps/web/src/components/catalog/item-detail-view.tsx` na grade assimétrica 8+4, integrando os novos componentes, sinopse completa, ficha técnica de equipe, franquia e diário, sem resíduos de ciano e sem emojis (Ref: R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug)
- [x] 2.6 [US1] Atualizar a rota `apps/web/src/app/items/[slug]/page.tsx` para adotar a paleta mineral Asian Editorial, loaders refinados e navegação de retorno fluida preservando estado (Ref: R:Item Details View and Navigation History / S:Retorno ao catálogo preservando filtros e rolagem)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes TDD `tests/media-dossier-and-episode-manager.test.mjs` e a regressão completa do monorepo (`npm test`), comprovando aprovação de 100% dos testes (Ref: R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA)
- [x] 3.2 Executar a verificação estática de acessibilidade (anéis de foco, contraste WCAG 2.2 AA, alvos táteis mínimos de 44x44px e ausência estrita de emojis) e validar o build de produção Next.js (Ref: R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Item Details View and Navigation History | S:Navegação para a página de detalhes da obra por slug | 1.1, 2.5, 3.1 | apps/web/src/components/catalog/item-detail-view.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Item Details View and Navigation History | S:Retorno ao catálogo preservando filtros e rolagem | 1.1, 2.6, 3.1 | apps/web/src/app/items/[slug]/page.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Item Details View and Navigation History | S:Acessibilidade de foco e contraste WCAG 2.2 AA | 1.1, 2.2, 3.1, 3.2 | apps/web/src/components/catalog/personal-tracking-console.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Item Details View and Navigation History | S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 1.1, 2.1, 2.2, 2.5, 3.1 | apps/web/src/components/catalog/dossier-metrics-strip.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Item Details View and Navigation History | S:Gerenciador de episodios com abas de temporadas e marcacao em lote | 1.1, 1.2, 2.3, 2.5, 3.1 | apps/web/src/components/catalog/episode-manager.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Item Details View and Navigation History | S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica | 1.1, 2.4, 2.5, 3.1 | apps/web/src/components/catalog/dossier-sidebar.tsx | tests/media-dossier-and-episode-manager.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug | 1.1, 2.5, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Retorno ao catálogo preservando filtros e rolagem | 1.1, 2.6, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA | 1.1, 2.2, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 1.1, 2.1, 2.2, 2.5, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Gerenciador de episodios com abas de temporadas e marcacao em lote | 1.1, 1.2, 2.3, 2.5, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica | 1.1, 2.4, 2.5, 3.1 | COVERED |

- **Constitution Check:** PASS (Zero custo permanente, sem novas dependências externas de terceiros, preservação do monorepo, acessibilidade WCAG 2.2 AA garantida com botões táteis de 44x44px).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas uma mudança ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada (perguntas do Clarification Gate totalmente resolvidas).
- **Coverage Summary:** 100% dos requisitos normativos e cenários cobertos por tarefas de implementação e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
