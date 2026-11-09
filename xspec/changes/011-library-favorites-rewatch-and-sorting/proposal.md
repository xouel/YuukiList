# Proposal: 011-library-favorites-rewatch-and-sorting

> **X-Spec** · ID: `011-library-favorites-rewatch-and-sorting` · Type: `feature` · Status: `DEFINED` · Created: `2026-11-09`

## Why

Para consolidar a experiência da biblioteca pessoal conforme as Seções 3.4, 5.8, 5.9, 5.10 e 5.11 do Documento Mestre de Contexto, os usuários precisam gerenciar obras favoritas de maneira independente de suas notas, registrar releituras e novos ciclos de consumo através do contador de reassistir/reler (rewatch), usufruir de ordenações avançadas (avaliação, progresso, lançamento, adições recentes), controlar volumes em mangás e receber avisos não-bloqueantes sobre inconsistências entre status pessoal e progresso.

## What Changes

- Adição do atributo `isFavorite` (booleano) nos itens de biblioteca, permitindo favoritar/desfavoritar com um clique via `♥`, com persistência e filtro dedicado.
- Adição do contador de reassistir/reler `rewatchCount` e suporte a fluxos de Reassistir/Reler: iniciar novo ciclo (reseta progresso para 0 e incrementa contador) ou apenas incrementar contador de visualizações.
- Suporte a progresso de leitura alternativo por volumes (`progressVolumes`) para mangás, manhwas e manhuas no backend e modal de edição.
- Implementação de 6 opções de ordenação na biblioteca: Atualizados Recentemente, Adicionados Recentemente, Alfabética (Título), Progresso, Avaliação (Nota) e Data de Lançamento.
- Filtro dedicado por Favoritos e opções avançadas por país de origem na biblioteca pessoal.
- Aviso visual informativo não-bloqueante no modal de edição alertando o usuário quando marcar uma obra como Concluída com progresso registrado inferior ao total de unidades da obra.

## Capabilities

### Modified Capabilities

- `personal-library`: Adição dos campos `isFavorite`, `rewatchCount`, `progressVolumes` e suporte a ordenações avançadas na listagem da biblioteca.
- `personal-library-ui`: Controles interativos de favoritos (`♥`), modal com ações de Reassistir/Reler, campo de volumes e avisos de inconsistência de status.

## Impact

- `packages/shared/src/library.ts`: Atualização dos DTOs `LibraryItemDto`, `CreateLibraryItemDto`, `UpdateLibraryItemDto` e `LibraryFilterDto` com `isFavorite`, `rewatchCount`, `progressVolumes` e novos valores de `sortBy`.
- `apps/api/src/library/library.repository.ts` e `library.service.ts`: Persistência e regras de negócio para ordenação, favoritos e ciclos de reassistir.
- `apps/web/src/components/library/`: Atualização da grade e lista com botão de favorito, modal de edição com volumes, alerta de inconsistência e ações de rewatch.
- `tests/personal-library-advanced.test.mjs`: Testes automatizados cobrindo os requisitos de favoritos, reassistir, ordenações e avisos de inconsistência.

## User Stories

### US1 — Favoritos Independentes e Filtro Dedicado (Priority: P1)

Como usuário da biblioteca pessoal, quero marcar qualquer obra do meu acervo como favorita (`♥`) com um clique sem que isso dependa de dar nota 10, e poder filtrar unicamente minhas obras favoritas na listagem.

- **Why this priority:** Cumpre a Seção 5.11 do Documento Mestre que determina que obras favoritas são desvinculadas de nota máxima.
- **Independent Test:** Clicar no ícone de coração em um card da biblioteca e verificar a persistência do estado `isFavorite: true` e a filtragem exclusiva na aba/filtro de favoritos.

### US2 — Contador de Reassistir/Reler e Novos Ciclos (Priority: P1)

Como usuário que concluiu uma série ou mangá predileto, quero registrar que estou reassistindo ou relendo a obra, escolhendo entre iniciar um novo ciclo (zerando o progresso atual) ou apenas incrementar o contador geral de repetições.

- **Why this priority:** Atende à Seção 5.10 do Documento Mestre de Contexto permitindo múltiplos ciclos sem perder o registro da experiência anterior.
- **Independent Test:** Acionar a ação de reassistir em uma obra concluída e verificar que o contador `rewatchCount` é incrementado e o progresso ajustado conforme a escolha.

### US3 — Ordenação Avançada, Volumes e Alerta de Inconsistência (Priority: P2)

Como usuário organizando um acervo volumoso, quero ordenar minha biblioteca por nota, progresso, data de adição ou lançamento, registrar volumes de mangá e receber um aviso se marcar uma obra como concluída com episódios pendentes.

- **Why this priority:** Proporciona controle refinado do acervo e previne enganos no status sem retirar a autonomia do usuário.
- **Independent Test:** Alterar a ordenação para 'Avaliação' e constatar a reordenação precisa dos itens; registrar volumes e verificar a exibição no card; marcar 'Concluído' com progresso 2/12 e constatar a exibição do aviso amigável.

## Success Criteria

- **SC-001**: O atributo `isFavorite` é comutado instantaneamente no card ou lista com atualização otimista e persistência em menos de 500ms.
- **SC-002**: O fluxo de Reassistir/Reler oferece as opções de iniciar novo ciclo e de apenas incrementar contador, preservando o valor acumulado em `rewatchCount`.
- **SC-003**: Todas as 6 opções de ordenação da biblioteca (Atualizados, Adicionados, Título, Progresso, Nota, Lançamento) funcionam combinadas com filtros de status e categoria.
- **SC-004**: O campo `progressVolumes` permite registro opcional de volumes lidos em obras literárias sem corromper o progresso em capítulos.
- **SC-005**: Ao selecionar status 'Concluído' em obra com progresso menor que o total conhecido, um aviso visual âmbar não-bloqueante é exibido no modal.

## Edge Cases

- Obra com total de episódios desconhecido (não deve exibir aviso de inconsistência ao marcar concluída).
- Tentativa de decrementar `rewatchCount` para valor negativo (o sistema deve impedir valores inferiores a zero).
- Obras favoritas pertencentes a outro usuário não podem vazar no filtro de favoritos de uma sessão alheia.

## Out of Scope

- Linha do tempo histórica de cada evento individual de rewatch com timestamps de cada episódio (escopo da fatia R12).
- Compartilhamento público da lista de favoritos via link externo (escopo da fatia R15).

## Clarifications

### Session 2026-11-09
- Q: Como o usuário deve interagir com o fluxo de Reassistir/Reler na biblioteca pessoal? → A: Opção A — Modal/Ação com duas escolhas: 'Iniciar novo ciclo' (reseta progresso para 0 e incrementa rewatchCount em +1) ou 'Apenas incrementar contador' (+1 sem zerar progresso).
- Q: Como deve ser tratada a exibição e o controle de progresso por Volumes em obras literárias? → A: Opção A — Campo opcional 'Volumes lidos' no modal de edição e exibição combinada (ex: 'Cap. 45 • Vol. 4') quando ambos forem preenchidos.
- Q: Como o aviso de inconsistência entre status pessoal e progresso deve se comportar ao editar uma obra? → A: Opção A — Aviso informativo não-bloqueante (banner/badge âmbar no modal) alertando se o status for 'Concluído' com progresso < total da obra, respeitando a soberania do usuário.
