# Proposal: 007-personal-library-ui

> **X-Spec** · ID: `007-personal-library-ui` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de uma interface rica, responsiva e acessível para a biblioteca pessoal privada (`/library`), permitindo aos usuários autenticados visualizar, filtrar e acompanhar seu acervo de entretenimento asiático (doramas, filmes, animes, mangás, manhwas e manhuas) nos modos de exibição em grade e lista. A interface deve exibir capas com proporção editorial 2:3, destacar visualmente a condição 'Em dia' calculada dinamicamente, oferecer incremento rápido de progresso de 1 clique (+1) com atualização otimista, disponibilizar modal para edição completa de notas e status, tratar os 4 estados assíncronos e garantir proteção contra acessos anônimos com redirecionamento contextual.

## What Changes

- Criação da página `/library` no Next.js 15 App Router (`apps/web/src/app/library/page.tsx`) envelopada por `ProtectedRoute`.
- Criação do cliente de API `LibraryApiClient` (`apps/web/src/services/library-api.client.ts`) para comunicação autenticada com `/api/v1/library`.
- Alternância de layout entre Grade (`grid`) e Lista (`list`) com persistência em `localStorage`.
- Abas inteligentes de status unificado ("Todos", "Em Andamento", "Planejados", "Concluídos", "Pausados", "Dropados") e filtro por categoria.
- Cards e linhas com proporção editorial 2:3, indicação de progresso, pill de status pessoal e badge "Em dia" (`isUpToDate`).
- Botão de incremento rápido "+1" para episódios/capítulos com atualização otimista na interface.
- Modal de edição detalhada para status, nota pessoal (0 a 10), anotações privadas e alteração de progresso.
- Tratamento dos 4 estados assíncronos: loading skeletons, biblioteca vazia com CTA para o catálogo, filtros sem resultados e erro com retry.

## Capabilities

### New Capabilities

- `personal-library-ui`: Interface web da biblioteca pessoal com suporte a modos grade e lista, tracking ágil de progresso e filtros inteligentes.

### Modified Capabilities

Nenhuma.

## Impact

- `apps/web/src/app/library/page.tsx`: Nova rota da biblioteca pessoal.
- `apps/web/src/components/library/`: Novos componentes visuais (grade, lista, card, linha, modal de edição, abas de filtro e skeletons).
- `apps/web/src/services/library-api.client.ts`: Novo cliente HTTP para a API da biblioteca.
- `apps/web/src/components/layout/header-nav.tsx`: Adição do link de navegação para a Biblioteca quando autenticado.
- `tests/personal-library-ui.test.mjs`: Nova suíte de testes de unidade e integração dos componentes e fluxos da biblioteca.

## User Stories

### US1 — Visualização da Biblioteca Pessoal e Alternância de Layouts (Priority: P1)

Como usuário autenticado, quero acessar minha biblioteca pessoal em `/library` e alternar entre visualização em grade e lista, mantendo minha escolha salva no navegador para consultas futuras.

- **Why this priority:** É a experiência fundamental de exploração e visualização do acervo pessoal do usuário no YuukiList.
- **Independent Test:** Acessar `/library` como usuário autenticado, verificar renderização em grade, alternar para lista, checar se a preferência foi salva no `localStorage` e recarregar a página conferindo a restauração do modo lista.

### US2 — Acompanhamento Ágil de Progresso e Modal de Edição (Priority: P1)

Como usuário que consome séries e mangás frequentemente, quero avançar episódios/capítulos com um único clique no botão "+1" ou abrir o modal para registrar nota pessoal, anotações e alterar status.

- **Why this priority:** Reduz atrito no acompanhamento diário e garante a experiência central de tracking do produto.
- **Independent Test:** Clicar no botão "+1" de uma série e verificar a atualização imediata na interface com chamada PATCH assíncrona; em seguida, abrir o modal detalhado, atualizar a nota para 9.5 e conferir o reflexo no card e badge "Em dia".

### US3 — Filtragem por Abas Inteligentes e Tratamento de Estados Assíncronos (Priority: P2)

Como usuário com dezenas de obras na biblioteca, quero filtrar por abas de status ("Em andamento", "Planejados", "Concluídos") e categoria, tendo feedback visual claro em estados de carregamento, lista vazia e erros.

- **Why this priority:** Permite gerenciar grandes acervos com clareza visual e resiliência diante de instabilidades de rede.
- **Independent Test:** Selecionar a aba "Em andamento" e verificar apenas obras correspondentes; testar acervo vazio conferindo link de redirecionamento para o catálogo e simular erro de rede testando o botão de retry.

## Success Criteria

- **SC-001**: Usuários autenticados acessam `/library` e visualizam seus itens em grade ou lista conforme preferência salva no `localStorage`.
- **SC-002**: Botão "+1" incrementa imediatamente o progresso no card/linha e persiste via API sem bloquear a interface.
- **SC-003**: O badge "Em dia" é exibido com destaque visual quando `isUpToDate: true` e a obra está em andamento.
- **SC-004**: Todos os 4 estados assíncronos (loading, vazio, sem resultados, erro com retry) são devidamente renderizados.
- **SC-005**: Acessos anônimos a `/library` são interceptados com redirecionamento para `/login?redirect=/library`.

## Edge Cases

- Filmes (`FILME`) não exibem botão de incremento rápido "+1", pois não possuem episódios contínuos.
- Obra cujo progresso já atingiu o total máximo desabilita o botão "+1" para prevenir envio de valores inválidos.
- Falha de conexão na operação de incremento rápido desfaz a atualização otimista e exibe mensagem descritiva de erro.

## Out of Scope

- Compartilhamento social ou perfis públicos de biblioteca (o acervo é 100% privado no MVP).
- Histórico detalhado de rewatches ou releituras.
- Importação/exportação em massa de listas (MyAnimeList / AniList) nesta fase.

## Clarifications

### Session 2026-11-09
- Q: Como o usuário deve interagir para avançar episódios/capítulos diretamente na listagem da biblioteca? → A: Botão rápido "+1" no card/linha com feedback otimista e sincronização assíncrona, além de modal para edição detalhada.
- Q: Como organizar a navegação por abas/filtros de status pessoal na UI? → A: Abas inteligentes consolidadas no topo ("Todos", "Em Andamento", "Planejados", "Concluídos", "Pausados", "Dropados") compatíveis com a categoria filtrada.
- Q: Como persistir a preferência de visualização entre Grade e Lista? → A: Persistência no localStorage do navegador com fallback padrão para Grade (grid).

