# Proposal: 012-diary-history-and-spoilers

> **X-Spec** · ID: `012-diary-history-and-spoilers` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

Para consolidar a experiência do usuário conforme a Seção 6 do Documento Mestre de Contexto (Diário, anotações, histórico e spoilers), o YuukiList precisa de uma linha do tempo de eventos (HistoryEvent) independente do estado da biblioteca, permitindo registrar marcos automáticos de consumo, anotações e reflexões vinculadas a episódios ou capítulos específicos, além de proteger os usuários contra spoilers involuntários através de mascaramento inteligente baseado no progresso de cada obra.

## What Changes

- Modelagem e persistência da entidade `HistoryEvent` em `apps/api` e `packages/shared`, suportando tipos automáticos (`STATUS_CHANGE`, `PROGRESS_UPDATE`, `COMPLETED`, `RATING_SET`, `FAVORITE_TOGGLED`, `REWATCH_CYCLE`) e manuais (`NOTE`, `EXPERIENCE`).
- Criação automática assíncrona de eventos de histórico em ações da biblioteca pessoal com desacoplamento estrito (excluir ou editar data de um evento não altera o status ou progresso da obra).
- Suporte a anotações contextuais vinculadas a obra, episódio (`episodeNumber`), capítulo (`chapterNumber`) ou volume (`volumeNumber`) com tag booleana de spoiler (`containsSpoiler`).
- Algoritmo de proteção contextual inteligente anti-spoiler: conteúdo sob máscara/blur se o usuário visualizador tiver progresso inferior à unidade da nota ou for visitante anônimo.
- Nova aba "Histórico & Diário" na tela de biblioteca (`/library`) com linha do tempo cronológica, filtros por obra/tipo e botão de revelar spoiler sob demanda com 1 clique.
- Seção de histórico e notas contextuais na página de detalhes da obra (`/items/:slug`).

## Capabilities

### New Capabilities

- `personal-diary`: Entidade `HistoryEvent`, lifecycle de eventos automáticos e manuais, notas por episódio/capítulo e cálculo de mascaramento de spoiler.
- `personal-diary-ui`: Interface de linha do tempo cronológica, criação/edição de anotações contextuais e máscara protetora de spoiler com revelação por clique.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/`: Criação de `diary.ts` exportando contratos, enums de eventos (`HistoryEventType`) e DTOs de listagem e mutação de eventos e notas.
- `apps/api/src/diary/`: Módulo NestJS com `DiaryRepository`, `DiaryService` e `DiaryController` para gerenciar eventos históricos e regras de spoiler.
- `apps/api/src/library/library.service.ts`: Disparo de eventos de histórico ao adicionar, atualizar progresso, nota, favorito ou status na biblioteca pessoal.
- `apps/web/src/components/diary/`: Componentes visuais `timeline-view.tsx`, `diary-note-card.tsx`, `spoiler-mask.tsx` e `create-note-modal.tsx`.
- `apps/web/src/components/library/library-view.tsx`: Inclusão da aba "Histórico & Diário" com a linha do tempo.

## User Stories

### US1 — Linha do Tempo de Eventos de Consumo (Priority: P1)

Como usuário acompanhando obras asiáticas, quero que minhas ações na biblioteca gerem automaticamente eventos cronológicos em uma linha do tempo pessoal, para que eu possa recordar quando assisti ou li cada obra sem que isso corrompa meu status atual caso eu edite ou remova um registro histórico.

- **Why this priority:** Cumpre as Seções 6.1 e 6.2 do Documento Mestre que estabelecem o histórico desacoplado do estado da biblioteca.
- **Independent Test:** Avançar o progresso de uma obra na biblioteca e constatar a inserção imediata do evento correspondente na linha do tempo; em seguida, excluir o evento e certificar-se de que a biblioteca manteve o progresso intacto.

### US2 — Anotações por Episódio ou Capítulo com Flag de Spoiler (Priority: P1)

Como leitor ou espectador, quero registrar anotações e reflexões vinculadas a episódios ou capítulos específicos, marcando se contêm spoilers para documentar minha jornada com privacidade e segurança.

- **Why this priority:** Atende às Seções 6.3 e 6.4 do Documento Mestre permitindo anotações por unidade física de consumo.
- **Independent Test:** Cadastrar uma nota no episódio 4 marcando a flag de spoiler e verificar sua exibição na linha do tempo e na página da obra com o badge indicativo.

### US3 — Proteção Inteligente Anti-Spoiler com Revelação sob Demanda (Priority: P2)

Como usuário ou visitante explorando a plataforma, quero que notas e comentários com spoilers fiquem borrados/ocultos se meu progresso for inferior ao episódio em questão, podendo revelá-los manualmente com 1 clique caso decida ler.

- **Why this priority:** Concretiza a Seção 6.5 do Documento Mestre evitando que revelações estraguem a experiência de quem está atrasado na obra.
- **Independent Test:** Visualizar uma nota do episódio 10 estando no episódio 3 e confirmar que o texto aparece com máscara de borrão; clicar em "Revelar spoiler" e confirmar que o texto fica legível imediatamente.

## Success Criteria

- **SC-001**: Eventos de alteração de progresso, status, nota, favorito e ciclos de rewatch geram registros no histórico em menos de 300ms.
- **SC-002**: A exclusão ou edição de data de um `HistoryEvent` preserva integralmente o registro atual do usuário em `UserLibraryItem`.
- **SC-003**: Notas marcadas com `containsSpoiler: true` vinculadas à unidade `X` são mascaradas quando `progresso < X` ou para anônimos, revelando em 1 clique.
- **SC-004**: A linha do tempo lista eventos agrupados por data em ordem decrescente com filtros por obra e tipo de evento.

## Edge Cases

- Registro de progresso decrescente (retrocesso de episódio gera evento do tipo `PROGRESS_UPDATE` com delta negativo).
- Obra excluída da biblioteca (os eventos históricos permanecem no diário com o título e capa preservados como snapshot histórico).
- Nota sem número de unidade especificado (nota livre da obra como um todo).

## Out of Scope

- Exportação externa do diário em formato PDF ou ZIP (prevista para a fatia R15).
- Comentários públicos ou feed social compartilhado com outros usuários (fora do escopo do MVP).

## Clarifications

### Session 2026-11-10
- Q: Onde a Linha do Tempo e o Diário Pessoal devem ser visualizados na interface? → A: Opção A — Aba integrada "Histórico & Diário" na tela de biblioteca (`/library`) + seção cronológica de notas e histórico na página de detalhes da obra (`/items/:slug`).
- Q: Como os eventos automáticos de histórico devem ser gerados a partir das ações na biblioteca? → A: Opção A — Registro automático no histórico ao alterar status, nota, favorito ou progresso, permitindo ao usuário editar a data (`occurredAt`) ou excluir o evento sem impactar o status atual da biblioteca.
- Q: Como deve operar a proteção anti-spoiler em notas vinculadas a episódios/capítulos? → A: Opção A — Proteção contextual inteligente: notas com tag de spoiler vinculadas à unidade `X` ficam com máscara/blur se o visitante for anônimo ou se o usuário autenticado tiver progresso menor que `X` (`progresso < X`), com botão de 1 clique "Revelar spoiler"; se o usuário já tiver alcançado ou superado a unidade `X`, a nota é exibida diretamente.

