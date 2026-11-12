# Tasks: Catalog Expansion, Official Covers and UI Interaction Fixes

## 1. Fundação e Dados Relacionais

- [x] 1.1 Ampliar o acervo do script de carga determinística `scripts/seed-real-catalog.mjs` com centenas de obras consagradas representativas nas 6 categorias canônicas (DORAMA, FILME, ANIME, MANGA, MANHWA, MANHUA) com metadados completos e dados para demonstrar estatísticas. (Ref: R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais)
- [x] 1.2 Atualizar as URLs de capa para fontes estáveis de CDNs públicas e assegurar a integridade das referências canônicas. (Ref: R:Local SVG Cover Serving and Fallback / S:Resiliencia e fallback automatico para capas oficiais)
- [x] 1.3 Conectar o repositório de biblioteca `apps/api/src/library/library.repository.ts` ao Prisma Client com persistência relacional na tabela `user_library_items` do PostgreSQL (mantendo fallback resiliente em memória). (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)
- [x] 1.4 Adicionar suporte à criação e sincronização de itens da biblioteca com estado de favorito em `apps/api/src/profile/profile.service.ts` e repositórios associados. (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)

## 2. Refatoração de Componentes e Fallback Visual

- [x] 2.1 Substituir o seletor de "Temas Transversais" por filtro funcional de "Gênero" em `apps/web/src/components/catalog/filter-bar.tsx`. (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)
- [x] 2.2 Integrar a seleção de gênero em `apps/web/src/components/catalog/catalog-view.tsx`, enviando o parâmetro `genre` nas requisições da API. (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)
- [x] 2.3 Saneamento do botão de avanço no dossiê em `apps/web/src/components/catalog/personal-tracking-console.tsx`, eliminando o glifo redundante de soma diante de `+1 {unidade}`. (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 2.4 Conectar a ação de favoritar no dossiê da obra em `apps/web/src/components/catalog/item-detail-view.tsx` e `personal-tracking-console.tsx`, propagando a atualização para a biblioteca do usuário. (Ref: R:Item Details View and Navigation History / S:Acao de favoritar conectada e sincronizada no console pessoal)
- [x] 2.5 Implementar listener `onError` resiliente em `media-card.tsx`, `library-card.tsx`, `favorites-showcase.tsx` e `hero-spotlight.tsx`, direcionando falhas para `/api/v1/catalog/items/${slug}/cover`. (Ref: R:Local SVG Cover Serving and Fallback / S:Resiliencia e fallback automatico para capas oficiais)
- [x] 2.6 Assegurar a exibição reativa das obras favoritadas e o recálculo imediato das estatísticas em `apps/web/src/app/profile/page.tsx`. (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)

## 3. Validação e Testes Automatizados

- [x] 3.1 Implementar testes automatizados de regressão e comportamento em `tests/catalog-expansion-and-ui-fixes.test.mjs`. (Ref: R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais)
- [x] 3.2 Executar a suíte de testes completa do monorepo (`npm test`) garantindo zero regressões. (Ref: R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento)
- [x] 3.3 Validar o build de produção do Next.js (`npm --prefix apps/web run build`). (Ref: R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Deterministic Seed Population | S:Execucao idempotente da carga ampliada de obras reais | 1.1, 1.2, 3.1 | scripts/seed-real-catalog.mjs | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Local SVG Cover Serving and Fallback | S:Resiliencia e fallback automatico para capas oficiais | 1.2, 2.5 | apps/web/src/components/catalog/media-card.tsx, apps/web/src/components/library/library-card.tsx | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Catalog Exploration and Infinite Scroll Interface | S:Barra de controles condensada com drawer de filtros avancados | 2.1, 2.2, 3.3 | apps/web/src/components/catalog/filter-bar.tsx, apps/web/src/components/catalog/catalog-view.tsx | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Item Details View and Navigation History | S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 2.3, 3.2 | apps/web/src/components/catalog/personal-tracking-console.tsx | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Item Details View and Navigation History | S:Acao de favoritar conectada e sincronizada no console pessoal | 2.4 | apps/web/src/components/catalog/item-detail-view.tsx, apps/web/src/components/catalog/personal-tracking-console.tsx | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.6 | apps/web/src/app/profile/page.tsx, apps/web/src/components/profile/favorites-showcase.tsx | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:User Profile Metrics and Consumption Analytics | S:Calculo consolidado de metricas de consumo | 1.3, 1.4 | apps/api/src/profile/profile.service.ts, apps/api/src/library/library.repository.ts | tests/catalog-expansion-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Deterministic Seed Population / S:Execucao idempotente da carga ampliada de obras reais | 1.1, 1.2, 3.1 | COVERED |
| R:Local SVG Cover Serving and Fallback / S:Resiliencia e fallback automatico para capas oficiais | 1.2, 2.5 | COVERED |
| R:Catalog Exploration and Infinite Scroll Interface / S:Barra de controles condensada com drawer de filtros avancados | 2.1, 2.2, 3.3 | COVERED |
| R:Item Details View and Navigation History / S:Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento | 2.3, 3.2 | COVERED |
| R:Item Details View and Navigation History / S:Acao de favoritar conectada e sincronizada no console pessoal | 2.4 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil | 2.6 | COVERED |
| R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo | 1.3, 1.4 | COVERED |

- **Constitution Check:** PASS (Aderência estrita à soberania de dados, tipagem TypeScript estrita, conformidade com R$ 0 e zero emojis).
- **Active Change Conflicts:** Nenhum conflito detectado (036 é a única mudança ativa no repositório).
- **Ambiguities / Underspecification:** Nenhuma pendência identificada.
- **Coverage Summary:** 100% dos 5 requisitos e 7 cenários normativos cobertos por tarefas com rastreabilidade bidirecional na Traceability Matrix.

## Drift Log

- `apps/api/src/auth/users.repository.ts` e `apps/api/src/auth/auth.module.ts`: Adicionado suporte opcional ao `PrismaClient` para persistir usuarios no Supabase PostgreSQL (`users`) em execucao web, preservando fallback isolado em memoria quando omitido nos testes unitarios.
- `apps/web/src/server/container.ts`: Injecao do `PrismaClient` compartilhado em `AuthModule`, `LibraryRepository` e `PrismaCatalogRepository`, com guarda no boot para rodar `syncCatalogBatch(SAMPLE_EXTERNAL_TITLES)` somente quando o banco estiver vazio (`count() === 0`), protegendo as capas oficiais.
- `apps/api/src/data/catalog-ingestion.service.ts` e `apps/api/src/data/prisma-catalog.repository.ts`: Preservacao da `coverUrl` HTTP remota na ingestao e validacao regex UUID antes de consultar coluna `@db.Uuid` em `findById`.
- `apps/web/src/components/home/hero-spotlight.tsx`: Removido glifo `+` redundante ao lado de `+1 Episodio` (substituido por seta dupla de avanco) e adicionado fallback `onError` para capa.
- `apps/web/src/components/catalog/dossier-sidebar.tsx`, `apps/web/src/services/library-api.client.ts` e rotas `/api/v1/profile/stats` e `/api/v1/library/items`: Atualizado rotulo lateral para `Generos`, adicionado botao interativo de toggle de favorito nos cards de `favorites-showcase.tsx`, `cache: 'no-store'` no cliente e `force-dynamic` nas rotas.
- `tests/catalog-editorial-browse.test.mjs` e `tests/editorial-profile-showcase.test.mjs`: Atualizadas as assercoes legadas para refletir a substituicao de `filter-theme` (BL/GL) por `filter-genre` (`GENRES`), o token `text-accent` e o link `/explore`.
