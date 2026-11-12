# Tasks: 030-tactile-physics-and-motion-restraint

## 1. Setup & Foundational

- [x] 1.1 Criar suite de testes automatizados `tests/tactile-physics.test.mjs` cobrindo a ausência de `hover:scale-105` e `group-hover:scale-105`, a presença de `active:scale-[0.98]` ou equivalente tátil, e a presença de `tabular-nums` nos componentes de cards. (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] [US2] Refatorar `media-card.tsx` removendo `group-hover:scale-105`, adicionando `active:scale-[0.98]` no card e nos botões de ação rápida, e `tabular-nums` na nota e metadados. (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia)
- [x] 2.2 [P] [US1] Refatorar `media-card.tsx` garantindo resposta elástica imediata no clique de adicionar à biblioteca e na alternância de estado "Na Biblioteca". (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Adicao rapida de obra a biblioteca pessoal a partir do card)
- [x] 2.3 [P] [US1] Garantir alternância visual imediata e feedback tátil no botão de ação rápida para obras já salvas na biblioteca. (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Alternancia visual do botao de acao rapida para obras salvas)
- [x] 2.4 [P] [US1] [US2] Refatorar `library-card.tsx` removendo `group-hover:scale-105`, adicionando `active:scale-[0.98]` no clique do card e nos botões táteis, e `tabular-nums` na barra/contadores de progresso. (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)
- [x] 2.5 [P] [US1] Refatorar `library-card.tsx` no botão de avanço rápido (+1) para resposta de micro-pressão física imediata no clique. (Ref: R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista)
- [x] 2.6 [P] [US1] Assegurar exibição destacada do badge Em dia e micro-interação tátil no card da biblioteca. (Ref: R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas)
- [x] 2.7 [P] [US1] Assegurar que a abertura do modal detalhado de edição a partir do card responda com feedback tátil limpo. (Ref: R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado)
- [x] 2.8 [P] [US1] Garantir resposta elástica imediata no popover de avaliação rápida e botão de atalho para notas do diário. (Ref: R:Quick Progress Tracking and Detail Modal / S:Avaliacao rapida inline com popover de estrelas e atalho para diario)
- [x] 2.9 [P] [US1] [US2] Refatorar `event-card.tsx` removendo `group-hover:scale-105`, adicionando `active:scale-[0.98]` no card e nos botões de ação rápida, e `tabular-nums` nos horários e legendas. (Ref: R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo)
- [x] 2.10 [P] [US3] Garantir que a formatação automática de fuso local utilize números tabulares (`tabular-nums font-mono`) sem layout jitter. (Ref: R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario)
- [x] 2.11 [P] [US1] Garantir que o badge de confiabilidade de data mantenha estilo sutil sem oscilação dimensional. (Ref: R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade)
- [x] 2.12 [P] [US1] Refatorar botão de ação rápida de lembrar/seguir em `event-card.tsx` com resposta tátil de micro-pressão no toque. (Ref: R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de lembrar ou seguir no card de lancamento)
- [x] 2.13 [P] [US1] Refatorar botão de incremento rápido "+1 visto" no card de lançamento com micro-pressão tátil imediata no clique. (Ref: R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca)
- [x] 2.14 [P] [US2] Refatorar `hero-spotlight.tsx` removendo `group-hover:scale-105` na imagem de capa e adicionando `active:scale-[0.98]` no botão de avanço rápido e botões secundários. (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)

## 3. Validation & Integration

- [x] 3.1 Executar a suite de testes automatizados `node --test tests/tactile-physics.test.mjs` e a suite de regressão global `npm test`, garantindo 100% de aprovação. (Ref: R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px)
- [x] 3.2 Executar a compilação de produção `npm --prefix apps/web run build` para validar que todas as 35 páginas e componentes compilam sem erros de tipagem ou de renderização. (Ref: R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Media Card Quick Actions and Enhanced Exploration | S:Adicao rapida de obra a biblioteca pessoal a partir do card | 2.2, 3.1, 3.2 | apps/web/src/components/catalog/media-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Media Card Quick Actions and Enhanced Exploration | S:Alternancia visual do botao de acao rapida para obras salvas | 2.3, 3.1, 3.2 | apps/web/src/components/catalog/media-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Media Card Quick Actions and Enhanced Exploration | S:Disposicao anti-colisao e badges editoriais no card de midia | 1.1, 2.1, 3.1 | apps/web/src/components/catalog/media-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Quick Progress Tracking and Detail Modal | S:Incremento rapido de unidade com atualizacao otimista | 2.5, 3.1, 3.2 | apps/web/src/components/library/library-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Quick Progress Tracking and Detail Modal | S:Exibicao destacada do badge Em dia para obras alcancadas | 2.6, 3.1, 3.2 | apps/web/src/components/library/library-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Quick Progress Tracking and Detail Modal | S:Edicao de status e nota pessoal atraves do modal detalhado | 2.7, 3.1, 3.2 | apps/web/src/components/library/library-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Quick Progress Tracking and Detail Modal | S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 2.4, 2.14, 3.1 | apps/web/src/components/library/library-card.tsx, apps/web/src/components/home/hero-spotlight.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Quick Progress Tracking and Detail Modal | S:Avaliacao rapida inline com popover de estrelas e atalho para diario | 2.8, 3.1, 3.2 | apps/web/src/components/library/library-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Local Timezone Conversion and Reliability Badges | S:Formatacao automatica para o fuso local do usuario | 2.10, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Local Timezone Conversion and Reliability Badges | S:Exibicao visual de badge de confiabilidade | 2.11, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Local Timezone Conversion and Reliability Badges | S:Card de lancamento despoluido com destaque para horario e titulo | 2.9, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Local Timezone Conversion and Reliability Badges | S:Acao rapida de lembrar ou seguir no card de lancamento | 2.12, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Local Timezone Conversion and Reliability Badges | S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca | 2.13, 3.1, 3.2 | apps/web/src/components/calendar/event-card.tsx | tests/tactile-physics.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Media Card Quick Actions and Enhanced Exploration / S:Adicao rapida de obra a biblioteca pessoal a partir do card | 2.2, 3.1, 3.2 | COVERED |
| R:Media Card Quick Actions and Enhanced Exploration / S:Alternancia visual do botao de acao rapida para obras salvas | 2.3, 3.1, 3.2 | COVERED |
| R:Media Card Quick Actions and Enhanced Exploration / S:Disposicao anti-colisao e badges editoriais no card de midia | 1.1, 2.1, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Incremento rapido de unidade com atualizacao otimista | 2.5, 3.1, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Exibicao destacada do badge Em dia para obras alcancadas | 2.6, 3.1, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Edicao de status e nota pessoal atraves do modal detalhado | 2.7, 3.1, 3.2 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Controle tatil com barra de progresso visual e alvo minimo de toque de 44px | 2.4, 2.14, 3.1 | COVERED |
| R:Quick Progress Tracking and Detail Modal / S:Avaliacao rapida inline com popover de estrelas e atalho para diario | 2.8, 3.1, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Formatacao automatica para o fuso local do usuario | 2.10, 3.1, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Exibicao visual de badge de confiabilidade | 2.11, 3.1, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Card de lancamento despoluido com destaque para horario e titulo | 2.9, 3.1, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de lembrar ou seguir no card de lancamento | 2.12, 3.1, 3.2 | COVERED |
| R:Local Timezone Conversion and Reliability Badges / S:Acao rapida de mais um visto no card de lancamento integrada a biblioteca | 2.13, 3.1, 3.2 | COVERED |

- **Constitution Check:** PASS (Diretrizes de fidelidade técnica, ausência de novas dependências pesadas e foco em acabamento nativo cumpridas).
- **Active Change Conflicts:** Nenhum conflito detectado (apenas a mudança 030 está ativa).
- **Ambiguities / Underspecification:** Nenhuma pendência (requisitos e cenários mapeados 1:1 com os deltas de especificação).
- **Coverage Summary:** 100% dos requisitos e cenários cobertos por tarefas acionáveis e rastreados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
