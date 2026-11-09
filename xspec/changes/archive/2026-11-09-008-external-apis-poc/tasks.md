# Tasks: 008-external-apis-poc

<!-- IMPORTANTE (X-Spec v2.0.1):
     1. Cabeçalhos de grupos de tarefas DEVEM ser numerados (`## 1. Nome`, `## 2. Nome`).
     2. Toda tarefa sob `## N. ...` DEVE usar checkbox e ID começando com `N.` (`- [ ] N.1 ...`).
     3. Toda tarefa DEVE indicar como verificar sua conclusão e terminar com `(Ref: R:<Requirement> / S:<Scenario>)`.
     4. A tabela `## Traceability Matrix` DEVE ter exatamente 9 colunas e cobrir 100% dos cenários normativos.
     5. PROIBIDO usar checkboxes (`- [ ]` ou `- [x]`) nas seções `## Traceability Matrix`, `## Analysis` e `## Drift Log`. -->

## 1. Setup & Foundational

- [x] 1.1 Criar contratos compartilhados e DTOs de dados normalizados de APIs externas em `packages/shared/src/external.ts` e exportar em `packages/shared/src/index.ts` (Ref: R:Audiovisual External API Integration and Normalization / S:Consulta e normalizacao de doramas e series no TMDB e TVmaze)
- [x] 1.2 [P] Estruturar diretório de fixtures estáticas em `tests/fixtures/external/` contendo amostras reais de respostas para os 12 títulos de teste (Ref: R:External APIs Coverage Matrix and License Compliance / S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede)

## 2. Core Implementation (User Stories)

- [x] 2.1 [US1] Escrever testes automatizados em `tests/external-apis-poc.test.mjs` para consulta e normalização de obras audiovisuais (TMDB e TVmaze), contagem de episódios/temporadas e resiliência a rate limit (Ref: R:Audiovisual External API Integration and Normalization / S:Consulta e normalizacao de doramas e series no TMDB e TVmaze, S:Mapeamento de contagem de episodios e temporadas para doramas, S:Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais)
- [x] 2.2 [US1] Implementar clientes HTTP `TmdbClient` e `TvmazeClient` com suporte a rate limit e normalização em `apps/api/src/external/` (Ref: R:Audiovisual External API Integration and Normalization / S:Consulta e normalizacao de doramas e series no TMDB e TVmaze, S:Mapeamento de contagem de episodios e temporadas para doramas, S:Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais)
- [x] 2.3 [US2] Escrever testes automatizados em `tests/external-apis-poc.test.mjs` para consulta de mangás/manhwas/manhuas (MangaUpdates, Kitsu e ANN) e parser XML seguro (Ref: R:Literary External API Integration and Normalization / S:Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu, S:Mapeamento e diferenciacao de formatos literarios orientais, S:Processamento de dados estruturados em XML da Anime News Network)
- [x] 2.4 [US2] Implementar clientes HTTP `MangaUpdatesClient`, `KitsuClient`, `AnnClient` com parser XML e normalização diferenciada de categorias em `apps/api/src/external/` (Ref: R:Literary External API Integration and Normalization / S:Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu, S:Mapeamento e diferenciacao de formatos literarios orientais, S:Processamento de dados estruturados em XML da Anime News Network)
- [x] 2.5 [US3] Escrever testes automatizados em `tests/external-apis-poc.test.mjs` para geração da matriz comparativa dos 12 títulos e conformidade de termos/licenças (Ref: R:External APIs Coverage Matrix and License Compliance / S:Geracao da matriz comparativa de cobertura para os 12 titulos de teste, S:Documentacao de termos de uso e compatibilidade juridica de licencas, S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede)
- [x] 2.6 [P] [US3] Implementar o script executável `scripts/poc-external-apis.mjs` e gerar os artefatos `docs/poc/external-apis-coverage-matrix.md` e `docs/poc/external-apis-coverage-matrix.json` (Ref: R:External APIs Coverage Matrix and License Compliance / S:Geracao da matriz comparativa de cobertura para os 12 titulos de teste, S:Documentacao de termos de uso e compatibilidade juridica de licencas, S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes completa em `tests/external-apis-poc.test.mjs`, validar as 5 APIs sobre os 12 títulos de teste oficiais e certificar a conformidade das 9 colunas da Traceability Matrix (Ref: R:Audiovisual External API Integration and Normalization / S:Consulta e normalizacao de doramas e series no TMDB e TVmaze, S:Mapeamento de contagem de episodios e temporadas para doramas, S:Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais, R:Literary External API Integration and Normalization / S:Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu, S:Mapeamento e diferenciacao de formatos literarios orientais, S:Processamento de dados estruturados em XML da Anime News Network, R:External APIs Coverage Matrix and License Compliance / S:Geracao da matriz comparativa de cobertura para os 12 titulos de teste, S:Documentacao de termos de uso e compatibilidade juridica de licencas, S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Audiovisual External API Integration and Normalization | S:Consulta e normalizacao de doramas e series no TMDB e TVmaze | 1.1, 2.1, 2.2, 3.1 | packages/shared/src/external.ts, apps/api/src/external/tmdb.client.ts, apps/api/src/external/tvmaze.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Audiovisual External API Integration and Normalization | S:Mapeamento de contagem de episodios e temporadas para doramas | 1.1, 2.1, 2.2, 3.1 | packages/shared/src/external.ts, apps/api/src/external/tmdb.client.ts, apps/api/src/external/tvmaze.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Audiovisual External API Integration and Normalization | S:Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais | 1.1, 2.1, 2.2, 3.1 | apps/api/src/external/tmdb.client.ts, apps/api/src/external/tvmaze.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Literary External API Integration and Normalization | S:Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu | 1.1, 2.3, 2.4, 3.1 | packages/shared/src/external.ts, apps/api/src/external/mangaupdates.client.ts, apps/api/src/external/kitsu.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Literary External API Integration and Normalization | S:Mapeamento e diferenciacao de formatos literarios orientais | 1.1, 2.3, 2.4, 3.1 | packages/shared/src/external.ts, apps/api/src/external/mangaupdates.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Literary External API Integration and Normalization | S:Processamento de dados estruturados em XML da Anime News Network | 1.1, 2.3, 2.4, 3.1 | packages/shared/src/external.ts, apps/api/src/external/ann.client.ts | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:External APIs Coverage Matrix and License Compliance | S:Geracao da matriz comparativa de cobertura para os 12 titulos de teste | 1.2, 2.5, 2.6, 3.1 | scripts/poc-external-apis.mjs, docs/poc/external-apis-coverage-matrix.md, docs/poc/external-apis-coverage-matrix.json | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:External APIs Coverage Matrix and License Compliance | S:Documentacao de termos de uso e compatibilidade juridica de licencas | 1.2, 2.5, 2.6, 3.1 | scripts/poc-external-apis.mjs, docs/poc/external-apis-coverage-matrix.md | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:External APIs Coverage Matrix and License Compliance | S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede | 1.2, 2.5, 2.6, 3.1 | tests/fixtures/external/tmdb.json, tests/fixtures/external/tvmaze.json, tests/fixtures/external/kitsu.json, tests/fixtures/external/ann.xml, tests/fixtures/external/mangaupdates.json | tests/external-apis-poc.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

<!-- Gerado automaticamente pelo /xspec-plan (auditoria de consistência cruzada do X-Spec). Não use checkboxes aqui. -->

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Audiovisual External API Integration and Normalization / S:Consulta e normalizacao de doramas e series no TMDB e TVmaze | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Audiovisual External API Integration and Normalization / S:Mapeamento de contagem de episodios e temporadas para doramas | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Audiovisual External API Integration and Normalization / S:Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais | 1.1, 2.1, 2.2, 3.1 | COVERED |
| R:Literary External API Integration and Normalization / S:Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu | 1.1, 2.3, 2.4, 3.1 | COVERED |
| R:Literary External API Integration and Normalization / S:Mapeamento e diferenciacao de formatos literarios orientais | 1.1, 2.3, 2.4, 3.1 | COVERED |
| R:Literary External API Integration and Normalization / S:Processamento de dados estruturados em XML da Anime News Network | 1.1, 2.3, 2.4, 3.1 | COVERED |
| R:External APIs Coverage Matrix and License Compliance / S:Geracao da matriz comparativa de cobertura para os 12 titulos de teste | 1.2, 2.5, 2.6, 3.1 | COVERED |
| R:External APIs Coverage Matrix and License Compliance / S:Documentacao de termos de uso e compatibilidade juridica de licencas | 1.2, 2.5, 2.6, 3.1 | COVERED |
| R:External APIs Coverage Matrix and License Compliance / S:Validacao deterministica de testes com fixtures estaticas sem chamadas de rede | 1.2, 2.5, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (Custo R$ 0 permanente, zero dependências externas adicionais, Soberania de Dados preservada, isolamento estrito sem alterar dados do banco em produção).
- **Active Change Conflicts:** PASS (Nenhum conflito com mudanças ativas).
- **Ambiguities / Underspecification:** PASS (12 títulos de teste mapeados exatamente conforme Seção 10 do Documento Mestre).
- **Coverage Summary:** 100% dos 3 requisitos normativos e 9 cenários cobertos por tarefas numeradas com precedência TDD e mapeados na Traceability Matrix de 9 colunas (`TR-001` a `TR-009`).

## Drift Log

<!-- Atualizado pelo /xspec-build caso ocorram desvios técnicos em relação ao design.md / plano inicial. Não use checkboxes aqui. -->
- Nenhum desvio registrado.
