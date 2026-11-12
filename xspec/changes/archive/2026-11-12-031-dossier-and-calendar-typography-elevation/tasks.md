# Tasks: 031-dossier-and-calendar-typography-elevation

## 1. Setup & Foundational

- [x] 1.1 Criar suite de testes automatizados `tests/dossier-calendar-typography.test.mjs` cobrindo a presença de `font-serif` nos títulos do dossiê e calendário, ausência de `group-hover:scale-105` e do badge "#2 Global" na capa do dossiê, purga de hexadecimais brutos e uso de `tabular-nums` na Weekly Strip e relógio JST. (Ref: R:Item Details View and Navigation History / S:Tipografia Shippori Mincho e capa cinematografica despoluida)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Refatorar `item-detail-view.tsx` aplicando `font-serif tracking-tight` no título principal da obra (H1) e nos subtítulos de seções principais (Sinopse, Gerenciador de Episódios, Universo). (Ref: R:Item Details View and Navigation History / S:Tipografia Shippori Mincho e capa cinematografica despoluida)
- [x] 2.2 [P] [US1] Refatorar o container de capa em `item-detail-view.tsx` removendo o selo flutuante "#2 Global", removendo a classe `group-hover:scale-105` e fixando proporção 2:3 rígida com moldura sutil `border-stroke-subtle`. (Ref: R:Item Details View and Navigation History / S:Tipografia Shippori Mincho e capa cinematografica despoluida)
- [x] 2.3 [P] [US2] Purgar valores hexadecimais hardcoded em `item-detail-view.tsx` substituindo por tokens semânticos (`bg-surface-base`, `bg-surface-raised`, `bg-surface-overlay`, `border-stroke-subtle`, `text-[var(--color-text-primary)]`, `text-[var(--color-text-secondary)]`, `accent`). (Ref: R:Item Details View and Navigation History / S:Paineis e consoles baseados integralmente em tokens semanticos)
- [x] 2.4 [P] [US2] Refatorar `dossier-metrics-strip.tsx` substituindo cores hexadecimais por tokens semânticos e aplicando `font-mono tabular-nums` na nota global e métricas. (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 2.5 [P] [US2] Refatorar `dossier-sidebar.tsx` substituindo hexadecimais por tokens semânticos e alinhando o histograma de distribuição de notas. (Ref: R:Item Details View and Navigation History / S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica)
- [x] 2.6 [P] [US2] Refatorar `personal-tracking-console.tsx` substituindo hexadecimais por tokens semânticos e adicionando resposta tátil nos botões e controles. (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 2.7 [P] [US1] Assegurar navegação e histórico intactos no dossiê `/items/:slug` preservando retorno acessível ao catálogo. (Ref: R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug)
- [x] 2.8 [P] [US1] Garantir preservação de filtros e posição de rolagem prévia ao retornar do dossiê para a grade de exploração. (Ref: R:Item Details View and Navigation History / S:Retorno ao catálogo preservando filtros e rolagem)
- [x] 2.9 [P] [US1] Garantir acessibilidade com anéis de foco visíveis e contraste WCAG 2.2 AA em todos os controles do dossiê. (Ref: R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA)
- [x] 2.10 [P] [US1] Garantir gerenciador de episódios organizado em abas de temporadas com ações de marcação individual e em lote. (Ref: R:Item Details View and Navigation History / S:Gerenciador de episodios com abas de temporadas e marcacao em lote)
- [x] 2.11 [P] [US3] Refatorar `calendar-view.tsx` aplicando `font-serif` nos títulos principais e padronizando os 7 seletores da Weekly Strip com grid uniforme e contadores com `font-mono tabular-nums`. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip)
- [x] 2.12 [P] [US3] Refatorar `calendar-sidebar-widgets.tsx` com tipografia `font-mono tabular-nums` no relógio de fuso duplo comparativo (Local vs Tóquio JST). (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Relogio de fuso duplo comparativo com numeros tabulares estaveis)
- [x] 2.13 [P] [US3] Assegurar alternância fluida entre as 3 abas de visualização do calendário (Lançamentos Gerais, Acompanhamento, Minha Agenda). (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao)
- [x] 2.14 [P] [US3] Assegurar agrupamento cronológico diário de lançamentos na linha do tempo do calendário. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos)
- [x] 2.15 [P] [US3] Assegurar navegação interativa por dia selecionado na Weekly Strip com filtragem imediata. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia)
- [x] 2.16 [P] [US3] Assegurar agrupamento de lançamentos diários por turnos do dia (Manhã, Tarde, Noite). (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia)
- [x] 2.17 [P] [US3] Assegurar cabeçalho ao vivo com faixa de 3 KPIs e destaque da data atual com selo textual minimalista HOJE. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE)
- [x] 2.18 [P] [US3] Assegurar barra lateral de widgets com mais esperados da semana e exportação de arquivo .ics para calendários externos. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal)

## 3. Validation & Integration

- [x] 3.1 Executar a suite de testes automatizados `node --test tests/dossier-calendar-typography.test.mjs` e a suite de regressão global `npm test`, garantindo 100% de aprovação. (Ref: R:Item Details View and Navigation History / S:Tipografia Shippori Mincho e capa cinematografica despoluida)
- [x] 3.2 Executar a compilação de produção `npm --prefix apps/web run build` para validar que todas as 35 páginas e componentes compilam sem erros de tipagem ou de renderização. (Ref: R:Responsive Calendar Timeline with Day Grouping / S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Item Details View and Navigation History | S:Navegação para a página de detalhes da obra por slug | 2.7, 3.1, 3.2 | apps/web/src/components/catalog/item-detail-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Item Details View and Navigation History | S:Retorno ao catálogo preservando filtros e rolagem | 2.8, 3.1, 3.2 | apps/web/src/components/catalog/item-detail-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Item Details View and Navigation History | S:Acessibilidade de foco e contraste WCAG 2.2 AA | 2.9, 3.1, 3.2 | apps/web/src/components/catalog/item-detail-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Item Details View and Navigation History | S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 2.4, 2.6, 3.1 | apps/web/src/components/catalog/dossier-metrics-strip.tsx, apps/web/src/components/catalog/personal-tracking-console.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Item Details View and Navigation History | S:Gerenciador de episodios com abas de temporadas e marcacao em lote | 2.10, 3.1, 3.2 | apps/web/src/components/catalog/item-detail-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Item Details View and Navigation History | S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica | 2.5, 3.1, 3.2 | apps/web/src/components/catalog/dossier-sidebar.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Item Details View and Navigation History | S:Tipografia Shippori Mincho e capa cinematografica despoluida | 1.1, 2.1, 2.2, 3.1 | apps/web/src/components/catalog/item-detail-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Item Details View and Navigation History | S:Paineis e consoles baseados integralmente em tokens semanticos | 2.3, 2.4, 2.5, 3.1 | apps/web/src/components/catalog/item-detail-view.tsx, apps/web/src/components/catalog/dossier-metrics-strip.tsx, apps/web/src/components/catalog/dossier-sidebar.tsx, apps/web/src/components/catalog/personal-tracking-console.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Responsive Calendar Timeline with Day Grouping | S:Alternancia entre as tres abas de visualizacao | 2.13, 3.1, 3.2 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento cronologico diario de lancamentos | 2.14, 3.1, 3.2 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Responsive Calendar Timeline with Day Grouping | S:Navegacao por Weekly Strip horizontal com selecao de dia | 2.15, 3.1, 3.2 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Responsive Calendar Timeline with Day Grouping | S:Agrupamento de lancamentos diarios por turnos do dia | 2.16, 3.1, 3.2 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Responsive Calendar Timeline with Day Grouping | S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 2.17, 3.1, 3.2 | apps/web/src/components/calendar/calendar-header-kpis.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Responsive Calendar Timeline with Day Grouping | S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 2.18, 3.1, 3.2 | apps/web/src/components/calendar/calendar-sidebar-widgets.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Responsive Calendar Timeline with Day Grouping | S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip | 1.1, 2.11, 3.1 | apps/web/src/components/calendar/calendar-view.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Responsive Calendar Timeline with Day Grouping | S:Relogio de fuso duplo comparativo com numeros tabulares estaveis | 2.12, 3.1, 3.2 | apps/web/src/components/calendar/calendar-sidebar-widgets.tsx | tests/dossier-calendar-typography.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Item Details View and Navigation History / S:Navegação para a página de detalhes da obra por slug | 2.7, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Retorno ao catálogo preservando filtros e rolagem | 2.8, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Acessibilidade de foco e contraste WCAG 2.2 AA | 2.9, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 2.4, 2.6, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Gerenciador de episodios com abas de temporadas e marcacao em lote | 2.10, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica | 2.5, 3.1, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Tipografia Shippori Mincho e capa cinematografica despoluida | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Item Details View and Navigation History / S:Paineis e consoles baseados integralmente em tokens semanticos | 2.3, 2.4, 2.5, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Alternancia entre as tres abas de visualizacao | 2.13, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento cronologico diario de lancamentos | 2.14, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Navegacao por Weekly Strip horizontal com selecao de dia | 2.15, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Agrupamento de lancamentos diarios por turnos do dia | 2.16, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Cabecalho ao vivo com faixa de tres KPIs e selo textual HOJE | 2.17, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Barra lateral com relogio de fuso duplo mais esperados e exportacao iCal | 2.18, 3.1, 3.2 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Alinhamento optico uniforme e numeros tabulares na Weekly Strip | 1.1, 2.11, 3.1 | COVERED |
| R:Responsive Calendar Timeline with Day Grouping / S:Relogio de fuso duplo comparativo com numeros tabulares estaveis | 2.12, 3.1, 3.2 | COVERED |

- **Constitution Check:** PASS (Diretrizes de fidelidade técnica, ausência de dependências externas pesadas e conformidade WCAG 2.2 AA cumpridas).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas a mudança 031 está ativa).
- **Ambiguities / Underspecification:** Nenhuma pendência (requisitos e cenários mapeados 1:1 com os deltas de especificação).
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
