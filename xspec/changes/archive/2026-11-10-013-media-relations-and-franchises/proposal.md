# Proposal: 013-media-relations-and-franchises

> **X-Spec** · ID: `013-media-relations-and-franchises` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

Para atender às Seções 3.6, 8.9 e 8.10 do Documento Mestre de Contexto (Relações entre obras, universos de franquias e adaptações), o YuukiList necessita de modelagem explícita e tipada para relacionamentos transmídia (adaptações entre mídias como novel/manhua/anime/dorama, prequels, sequels, spin-offs e obras relacionadas). Além disso, o sistema deve garantir a estrita independência de consumo entre adaptações — de modo que concluir uma mídia não conclua automaticamente outra — e oferecer uma página dedicada de Franquia/Universo (/franchises/:slug) com visualização em linha do tempo (ordem de lançamento e cronológica) com progresso pessoal contextual por obra.

## What Changes

- Modelagem de relacionamentos explícitos e tipados entre obras (`MediaRelation`), suportando tipos semânticos (`ADAPTATION`, `PREQUEL`, `SEQUEL`, `SPIN_OFF`, `SIDE_STORY`, `ALTERNATIVE_VERSION`, `RELATED`).
- Algoritmo de inversão semântica e traversal de relações (ex: inferência automática de `SEQUEL` quando uma obra é vinculada como `PREQUEL`, e reciprocidade em `ADAPTATION`).
- Modelagem de universos de franquia (`Franchise`), agrupando obras com atribuição de ano de lançamento, índice cronológico na narrativa e metadados canônicos.
- Regra de negócio inegociável: independência estrita de status e progresso na biblioteca pessoal (concluir ou atualizar uma adaptação não afeta as demais obras da franquia).
- Endpoints REST na API NestJS:
  - `GET /api/v1/catalog/items/:slug/relations`: retorna obras relacionadas e informações da franquia.
  - `GET /api/v1/franchises/:slug`: retorna a visão completa da franquia, lista ordenada de mídias e status pessoal do usuário autenticado.
- Componentes e telas no Next.js App Router:
  - Seção "Obras Relacionadas & Adaptações" na página da obra (`/items/:slug`).
  - Nova página `/franchises/[slug]` com visão de universo, alternância entre "Ordem de Lançamento" e "Ordem Cronológica", e acompanhamento independente de progresso.

## Capabilities

### New Capabilities

- `media-relations`: Modelagem de relacionamentos tipados entre obras, cálculo de inversão semântica, agregação de universos de franquia e controle de independência de progresso.
- `media-relations-ui`: Componentes visuais para obras relacionadas na página de detalhes da obra e página dedicada de exploração do universo da franquia.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/relations.ts`: Contratos canônicos, enums `MediaRelationType`, DTOs de relações e franquias.
- `apps/api/src/relations/`: Módulo NestJS com `RelationsRepository`, `RelationsService` e `RelationsController`.
- `apps/web/src/app/franchises/[slug]/page.tsx`: Página de franquia e linha do tempo do universo.
- `apps/web/src/components/relations/`: Componentes visuais `related-works-section.tsx`, `franchise-timeline-view.tsx` e cards de relação.
- `apps/web/src/components/catalog/item-detail-view.tsx`: Integração da seção de relações e atalho para o universo.

## User Stories

### US1 — Descoberta de Obras Relacionadas e Adaptações (Priority: P1)

Como fã de obras asiáticas navegando na página de uma obra (ex: o dorama *The Untamed*), quero visualizar imediatamente suas obras irmãs e adaptações (como o anime ou o manhua original *Mo Dao Zu Shi*), para descobrir todo o ecossistema da obra com facilidade.

- **Why this priority:** Cumpre a Seção 3.6 do Documento Mestre que estabelece a descoberta de adaptações e continuações.
- **Independent Test:** Navegar até a página de detalhes de uma obra com adaptações e constatar a renderização dos cards relacionados com rótulos semânticos e links funcionais.

### US2 — Linha do Tempo e Universo da Franquia (Priority: P1)

Como colecionador ou maratonista, quero acessar a página dedicada de uma franquia para consultar todas as mídias em ordem de lançamento ou ordem cronológica narrativa, acompanhando meu progresso independente em cada título.

- **Why this priority:** Atende às Seções 3.6 e 8.9 do Documento Mestre para franquias com múltiplas temporadas, filmes e adaptações.
- **Independent Test:** Acessar `/franchises/:slug`, alternar entre visualização por lançamento e cronológica, e certificar-se de que cada obra exibe seu status e progresso individual sem contaminação entre mídias.

## Success Criteria

- **SC-001**: Consulta à API de relações retorna relações diretas e relações inversas semanticamente inferidas.
- **SC-002**: A conclusão de uma adaptação (ex: dorama) não altera o status de outra obra (ex: manhua) na biblioteca pessoal.
- **SC-003**: A página de franquia permite alternar entre ordem de lançamento e ordem cronológica em menos de 100ms.
- **SC-004**: Cobertura de 100% dos cenários normativos por testes automatizados com zero regressões no monorepo.

## Edge Cases

- Obras isoladas sem franquia ou relacionamentos não quebram a página de detalhes (seção simplesmente não é exibida ou exibe estado informativo).
- Franquias com ordem cronológica idêntica à ordem de lançamento funcionam consistentemente sem duplicação de cards.
- Usuários anônimos podem visualizar todo o universo da franquia sem erros de autenticação, com botões para adicionar à biblioteca.

## Out of Scope

- Unificação de status ou conclusão automática em cascata na franquia (proibido pela Constituição e Documento Mestre).
- Edição colaborativa aberta de relações por usuários comuns (reservado para administração em R16).

## Clarifications

### Session 2026-11-10
- Q: Como deve funcionar a reciprocidade das relações entre obras no catálogo? → A: Inversão semântica automática (PREQUEL gera SEQUEL inverso; ADAPTATION conecta mutuamente entre categorias).
- Q: Como a página de Franquia / Universo deve organizar as obras? → A: Linha do tempo alternável entre Ordem de Lançamento e Ordem Cronológica da Narrativa, com progresso independente por obra.
- Q: Onde e como as relações devem ser destacadas na página de detalhes da obra? → A: Seção dedicada "Obras Relacionadas & Adaptações" abaixo dos metadados, com badges tipados e botão para explorar a franquia completa.

