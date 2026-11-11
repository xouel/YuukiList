# Tasks: 022-editorial-profile-showcase

## 1. Setup & Baseline

- [x] 1.1 Criar suíte de testes TDD em `tests/editorial-profile-showcase.test.mjs` cobrindo inversão hierárquica do perfil (vitrine de favoritos no topo), cards de favoritos em proporção 2:3 com serifa moderna e nota destacada, métricas analíticas compactas e remoção de gradientes ciano (Ref: R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil)

## 2. Core Implementation (US1, US2, US3)

- [x] 2.1 [P] [US1] Atualizar `apps/web/src/components/profile/favorites-showcase.tsx` com cards em proporção editorial 2:3 (`aspect-[2/3]`), moldura mineral, títulos em serifa moderna, selo dark gold para notas e ícone de favorito carmim `#E05347` (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)
- [x] 2.2 [P] [US1] Implementar estado acolhedor em `favorites-showcase.tsx` para usuários que ainda não adicionaram favoritos, com convite visual e link para o catálogo (Ref: R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos)
- [x] 2.3 [US1] Reestruturar `apps/web/src/app/profile/page.tsx` invertendo a ordem de seções para posicionar a vitrine de favoritos como o primeiro bloco principal após o cabeçalho de identificação (Ref: R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil)
- [x] 2.4 [P] [US2] Atualizar `apps/web/src/components/profile/profile-stats.tsx` com painel de métricas analíticas compactas em 4 colunas com superfícies `#1A1820`, bordas `#2B2735` e números em monospace limpo (Ref: R:User Profile Metrics and Consumption Analytics / S:Metricas analiticas compactas com navegacao harmonizada)
- [x] 2.5 [US2] Harmonizar a distribuição proporcional de categorias em `profile-stats.tsx` com barras discretas em paleta editorial e rótulos legíveis (Ref: R:User Profile Metrics and Consumption Analytics / S:Calculo consolidado de metricas de consumo)
- [x] 2.6 [US2] Assegurar tratamento resiliente para perfis recentes ou sem obras concluídas com contadores elegantes e sem erros visuais em `profile-stats.tsx` (Ref: R:User Profile Metrics and Consumption Analytics / S:Tratamento de biblioteca recente ou sem obras concluidas)
- [x] 2.7 [US3] Redesenhar o cabeçalho de perfil em `apps/web/src/app/profile/page.tsx` com avatar monograma editorial, acento carmim `#E05347` e rótulos humanizados de privacidade e membresia (Ref: R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros)
- [x] 2.8 [US3] Harmonizar os painéis de Soberania de Dados (exportação JSON/CSV) e Exclusão de Conta em `page.tsx` com a paleta mineral e container `max-w-7xl` (Ref: R:User Profile Metrics and Consumption Analytics / S:Metricas analiticas compactas com navegacao harmonizada)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte de testes automatizados `tests/editorial-profile-showcase.test.mjs` e a suíte completa de regressão do projeto (Ref: R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil)
- [x] 3.2 Executar build de produção do frontend (`npm --prefix apps/web run build`) e validar renderização no servidor daemon (Ref: R:User Profile Metrics and Consumption Analytics / S:Metricas analiticas compactas com navegacao harmonizada)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.1 | apps/web/src/components/profile/favorites-showcase.tsx | tests/editorial-profile-showcase.test.mjs, tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Profile Showcase and Activity Feed Privacy | S:Ocultacao estrita de anotacoes privadas para terceiros | 2.7 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs, tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Profile Showcase and Activity Feed Privacy | S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 1.1, 2.3, 3.1 | apps/web/src/app/profile/page.tsx, apps/web/src/components/profile/favorites-showcase.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Profile Showcase and Activity Feed Privacy | S:Estado amigavel para vitrine sem favoritos | 2.2 | apps/web/src/components/profile/favorites-showcase.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:User Profile Metrics and Consumption Analytics | S:Calculo consolidado de metricas de consumo | 2.5 | apps/web/src/components/profile/profile-stats.tsx | tests/editorial-profile-showcase.test.mjs, tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:User Profile Metrics and Consumption Analytics | S:Tratamento de biblioteca recente ou sem obras concluidas | 2.6 | apps/web/src/components/profile/profile-stats.tsx | tests/editorial-profile-showcase.test.mjs, tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:User Profile Metrics and Consumption Analytics | S:Metricas analiticas compactas com navegacao harmonizada | 2.4, 2.8, 3.2 | apps/web/src/components/profile/profile-stats.tsx, apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

### Coverage Table

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| Profile Showcase and Activity Feed Privacy / Exibicao da vitrine de obras favoritas no perfil | 2.1 | Coberto |
| Profile Showcase and Activity Feed Privacy / Ocultacao estrita de anotacoes privadas para terceiros | 2.7 | Coberto |
| Profile Showcase and Activity Feed Privacy / Inversao de hierarquia com vitrine de favoritos no topo do perfil | 1.1, 2.3, 3.1 | Coberto |
| Profile Showcase and Activity Feed Privacy / Estado amigavel para vitrine sem favoritos | 2.2 | Coberto |
| User Profile Metrics and Consumption Analytics / Calculo consolidado de metricas de consumo | 2.5 | Coberto |
| User Profile Metrics and Consumption Analytics / Tratamento de biblioteca recente ou sem obras concluidas | 2.6 | Coberto |
| User Profile Metrics and Consumption Analytics / Metricas analiticas compactas com navegacao harmonizada | 2.4, 2.8, 3.2 | Coberto |

### Verification Checks

1. **Coverage Gaps:** 100% dos requisitos normativos e cenários da especificação delta estão cobertos por tarefas com IDs numéricos válidos e mapeados na Traceability Matrix de 9 colunas.
2. **Constitution Check:** Cumprimento rigoroso do custo zero, utilizando apenas utilitários Tailwind CSS e React padrão sem novas dependências.
3. **Inconsistency Check:** Nomenclaturas de componentes (`ProfilePage`, `FavoritesShowcase`, `ProfileStats`) e modelos (`ProfileStatsDto`, `ProfileFavoriteDto`) consistentes em todos os artefatos.
4. **Sub-specification Check:** Todas as tarefas trazem caminhos exatos de arquivos e referências normativas completas sem placeholders.
5. **Duplication Check:** Não há tarefas nem cenários duplicados.
6. **Active Conflicts Check:** Nenhuma outra mudança ativa concorre com a fatia 022.
