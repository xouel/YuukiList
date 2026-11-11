# Tasks: 019-catalog-editorial-browse

## 1. Setup & Baseline

- [x] 1.1 Criar suíte de testes TDD em `tests/catalog-editorial-browse.test.mjs` cobrindo barra de controles condensada, drawer expansível, ausência de colisão no card, badges de categoria editoriais e alternância do botão rápido (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)

## 2. Core Implementation (US1, US2, US3)

- [x] 2.1 [P] [US2] Atualizar `MediaCard` em `apps/web/src/components/catalog/media-card.tsx` com paleta editorial bimodal/categoria, badges de status dedicados sobre a capa e rodapé de gêneros sem colisão (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia)
- [x] 2.2 [P] [US3] Atualizar `MediaCard` em `apps/web/src/components/catalog/media-card.tsx` com alternância visual do botão de ação rápida (`+ Adicionar` vs `✓ Na Biblioteca`) e suporte à verificação de status na biblioteca (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Alternancia visual do botao de acao rapida para obras salvas)
- [x] 2.3 [US3] Garantir que o acionamento do botão rápido adicione o item com status canônico e atualize imediatamente o estado visual (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Adicao rapida de obra a biblioteca pessoal a partir do card)
- [x] 2.4 [P] [US1] Refatorar `FilterBar` em `apps/web/src/components/catalog/filter-bar.tsx` para barra primária condensada de categorias com botão sanfona/drawer "Mais Filtros" para país, status da obra, temas e ordenação (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)
- [x] 2.5 [US1] Atualizar `CatalogView` em `apps/web/src/components/catalog/catalog-view.tsx` para integrar busca global unificada, sincronização de URL com debounce e preservação de rolagem infinita (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Sincronização bidirecional de busca e filtros na URL)
- [x] 2.6 [US1] Validar integração da rolagem infinita e carregamento cumulativo na grade de cards (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Exibição da grade de cards com rolagem infinita automática)
- [x] 2.7 [US1] Integrar e validar filtros combinados de país de origem e temas transversais no drawer recolhível (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Filtragem combinada por pais de origem e temas transversais)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados `tests/catalog-editorial-browse.test.mjs` e a suíte completa de regressão do projeto (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)
- [x] 3.2 Executar build de produção do frontend (`npm --prefix apps/web run build`) e validar renderização no servidor daemon (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Catalog Exploration and Infinite Scroll Interface | S:Exibição da grade de cards com rolagem infinita automática | 2.6 | apps/web/src/components/catalog/catalog-view.tsx | tests/catalog-browse-ui.test.mjs, tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Catalog Exploration and Infinite Scroll Interface | S:Sincronização bidirecional de busca e filtros na URL | 2.5 | apps/web/src/components/catalog/catalog-view.tsx | tests/catalog-browse-ui.test.mjs, tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Catalog Exploration and Infinite Scroll Interface | S:Barra de controles condensada com drawer de filtros avancados | 1.1, 2.4, 3.1 | apps/web/src/components/catalog/filter-bar.tsx | tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Media Card Quick Actions and Enhanced Exploration | S:Adicao rapida de obra a biblioteca pessoal a partir do card | 2.3 | apps/web/src/components/catalog/media-card.tsx | tests/catalog-browse-ui.test.mjs, tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Media Card Quick Actions and Enhanced Exploration | S:Alternancia visual do botao de acao rapida para obras salvas | 2.2 | apps/web/src/components/catalog/media-card.tsx | tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Media Card Quick Actions and Enhanced Exploration | S:Disposicao anti-colisao e badges editoriais no card de midia | 2.1, 3.2 | apps/web/src/components/catalog/media-card.tsx | tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Media Card Quick Actions and Enhanced Exploration | S:Filtragem combinada por pais de origem e temas transversais | 2.7 | apps/web/src/components/catalog/filter-bar.tsx | tests/catalog-browse-ui.test.mjs, tests/catalog-editorial-browse.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

### Coverage Table

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| Catalog Exploration and Infinite Scroll Interface / Exibição da grade de cards com rolagem infinita automática | 2.6 | Coberto |
| Catalog Exploration and Infinite Scroll Interface / Sincronização bidirecional de busca e filtros na URL | 2.5 | Coberto |
| Catalog Exploration and Infinite Scroll Interface / Barra de controles condensada com drawer de filtros avancados | 1.1, 2.4, 3.1 | Coberto |
| Media Card Quick Actions and Enhanced Exploration / Adicao rapida de obra a biblioteca pessoal a partir do card | 2.3 | Coberto |
| Media Card Quick Actions and Enhanced Exploration / Alternancia visual do botao de acao rapida para obras salvas | 2.2 | Coberto |
| Media Card Quick Actions and Enhanced Exploration / Disposicao anti-colisao e badges editoriais no card de midia | 2.1, 3.2 | Coberto |
| Media Card Quick Actions and Enhanced Exploration / Filtragem combinada por pais de origem e temas transversais | 2.7 | Coberto |

### Verification Checks

1. **Coverage Gaps:** 100% dos requisitos normativos e cenários da especificação delta estão mapeados em tarefas e na Traceability Matrix.
2. **Constitution Check:** O plano respeita a regra de custo zero, sem adição de bibliotecas externas pagas ou proprietárias.
3. **Inconsistency Check:** Nomenclaturas de arquivos, componentes (`MediaCard`, `FilterBar`, `CatalogView`) e tipos DTO perfeitamente alinhados entre proposal, specs, design e tasks.
4. **Sub-specification Check:** Todas as tarefas trazem caminhos exatos de arquivos e referências normativas sem placeholders.
5. **Duplication Check:** Não há tarefas nem cenários duplicados.
6. **Active Conflicts Check:** Nenhuma outra mudança ativa concorre com a fatia 019.
