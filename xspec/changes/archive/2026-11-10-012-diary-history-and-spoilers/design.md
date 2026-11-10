# Design: 012-diary-history-and-spoilers

## Context

A plataforma YuukiList possui uma camada de biblioteca pessoal (`personal-library`) onde o estado atual das obras de cada usuário é mantido de forma privada (status, progresso, nota, favorito, rewatch). Conforme a Seção 6 do Documento Mestre de Contexto (`YuukiList_Documento_Mestre_Contexto.md`), o sistema necessita de uma camada de histórico (`HistoryEvent`) cronológica e cumulativa que registre os acontecimentos da jornada do usuário de forma estritamente desacoplada do estado atual da biblioteca.

Adicionalmente, os usuários precisam registrar anotações e reflexões contextuais vinculadas a unidades específicas (episódio, capítulo, volume) e contar com proteção inteligente contra spoilers baseada no progresso alcançado em cada obra.

## Goals / Non-Goals

**Goals:**
- Prover a entidade `HistoryEvent` suportando eventos automáticos (`STATUS_CHANGE`, `PROGRESS_UPDATE`, `COMPLETED`, `RATING_SET`, `FAVORITE_TOGGLED`, `REWATCH_CYCLE`) e manuais (`NOTE`, `EXPERIENCE`).
- Garantir desacoplamento estrito: editar a data (`occurredAt`) ou excluir um evento histórico não altera status, progresso ou nota na biblioteca pessoal.
- Suportar anotações vinculadas a unidades (`episodeNumber`, `chapterNumber`, `volumeNumber`) com marcação de spoiler (`containsSpoiler`).
- Implementar algoritmo de proteção contextual contra spoilers: mascarar preventivamente notas com spoiler para visitantes anônimos e para usuários com progresso inferior à unidade da nota, permitindo revelação em 1 clique.
- Renderizar linha do tempo cronológica agrupada com filtros por obra e tipo na aba "Histórico & Diário" da biblioteca e na página da obra.

**Non-Goals:**
- Exportação em massa em arquivos ZIP com imagens (escopo de R15).
- Feed social público com comentários ou interação entre usuários (fora do escopo do MVP).
- Sincronização offline PWA para edição de histórico (escopo de R16).

## Decisions

1. **Desacoplamento Estrito entre Histórico e Biblioteca**
   - **Escolha:** A tabela/coleção de `HistoryEvent` é append-only por padrão em mutações da biblioteca. Excluir ou alterar um evento nunca altera o registro em `UserLibraryItem`.
   - **Alternativas consideradas:**
     - Calcular o progresso e status da biblioteca através de Event Sourcing (replaying events). Rejeitada: violaria o princípio de simplicidade do monólito, tornaria leituras da biblioteca lentas e criaria forte acoplamento onde a exclusão de um registro histórico corromperia o status atual.
     - Não registrar eventos automáticos para mudanças de progresso. Rejeitada: violaria o requisito 6.1 do Documento Mestre que especifica avanço/retrocesso de progresso como evento de histórico.
   - **Justificativa:** Garante soberania do usuário sobre suas memórias (pode ajustar uma data de quando assistiu um dorama em 2022 sem afetar seu progresso atual de 2026).

2. **Proteção Contextual Inteligente Anti-Spoiler**
   - **Escolha:** A função pura `computeSpoilerVisibility` compara o `episodeNumber`/`chapterNumber` da nota contra o `progress` registrado do visualizador na mesma obra. Se `viewerProgress < targetUnit` ou visitante anônimo, a nota inicia mascarada (`isMasked: true`). Se `viewerProgress >= targetUnit` ou autor visualizando, inicia legível.
   - **Alternativas consideradas:**
     - Ocultação universal de 100% dos spoilers com clique obrigatório. Rejeitada: fricção desnecessária para quem já assistiu/leu a unidade.
     - Mascaramento apenas no cliente. Rejeitada: dados sem proteção poderiam vazar em chamadas de API públicas. O backend envia um indicador `isMasked` e apenas os dados seguros quando o usuário não tiver permissão.
   - **Justificativa:** Cumpre a Seção 6.5 garantindo conforto ao leitor sem cliques supérfluos para quem já concluiu a unidade.

3. **Arquitetura de Navegação do Diário**
   - **Escolha:** Aba integrada "Histórico & Diário" na tela de biblioteca (`/library`) combinada com bloco cronológico na página de detalhes da obra (`/items/:slug`).
   - **Alternativas consideradas:**
     - Rota exclusiva `/diary`. Rejeitada: fragmentaria a navegação principal de 5 seções já consolidada em R10.
     - Apenas modal flutuante. Rejeitada: limitaria a visão geral de linha do tempo do usuário.
   - **Justificativa:** Oferece visão ampla na biblioteca e visão focada na página da obra.

## Risks / Trade-offs

- **[Risco] Volume elevado de eventos por incrementos rápidos (+1)** → **Mitigação:** Registro assíncrono otimizado com índices por `userId` e `occurredAt`, e agrupamento visual inteligente na timeline para múltiplos incrementos no mesmo dia.
- **[Risco] Vazamento involuntário de spoiler em cards de resumo** → **Mitigação:** Tratamento no nível de componente visual (`SpoilerMask`) com blur CSS `filter: blur(8px)` e camada de sobreposição não copiada acidentalmente.

## Migration Plan

- Não aplicável: modelo novo e cumulativo sem quebra de contratos prévios.
- O container em memória e schemas são enriquecidos com a entidade `HistoryEvent`.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/diary.ts` — Contratos, enums `HistoryEventType` e DTOs de eventos e diário.
- `[MODIFY]` `packages/shared/src/index.ts` — Re-exportação do módulo `diary.ts`.
- `[CREATE]` `apps/api/src/diary/diary.repository.ts` — Repositório de persistência de eventos históricos.
- `[CREATE]` `apps/api/src/diary/diary.service.ts` — Regras de negócio, cálculo de spoiler e emissão de eventos.
- `[CREATE]` `apps/api/src/diary/diary.controller.ts` — Endpoints REST para histórico e notas.
- `[CREATE]` `apps/api/src/diary/diary.module.ts` — Módulo NestJS do diário e histórico.
- `[MODIFY]` `apps/api/src/library/library.service.ts` — Integração para registrar eventos automáticos em mutações de biblioteca.
- `[CREATE]` `apps/web/src/services/diary-api.client.ts` — Cliente HTTP para comunicação com a API de diário.
- `[CREATE]` `apps/web/src/components/diary/timeline-view.tsx` — Linha do tempo cronológica com agrupamento de eventos.
- `[CREATE]` `apps/web/src/components/diary/timeline-event-card.tsx` — Card de evento individual com ações.
- `[CREATE]` `apps/web/src/components/diary/spoiler-mask.tsx` — Máscara de spoiler com botão de revelação em 1 clique.
- `[CREATE]` `apps/web/src/components/diary/create-note-modal.tsx` — Modal de anotação contextual com flag de spoiler.
- `[MODIFY]` `apps/web/src/components/library/library-view.tsx` — Adição da aba "Histórico & Diário".
- `[MODIFY]` `apps/web/src/components/catalog/item-detail-view.tsx` — Adição da seção de notas e histórico da obra.
- `[CREATE]` `tests/personal-diary-history.test.mjs` — Suíte de testes TDD cobrindo os 8 cenários normativos.

## Data Model

```ts
export type HistoryEventType =
  | 'STATUS_CHANGE'
  | 'PROGRESS_UPDATE'
  | 'COMPLETED'
  | 'RATING_SET'
  | 'FAVORITE_TOGGLED'
  | 'REWATCH_CYCLE'
  | 'NOTE'
  | 'EXPERIENCE';

export interface HistoryEventRecord {
  id: string;
  userId: string;
  mediaItemId: string;
  type: HistoryEventType;
  occurredAt: string; // ISO-8601
  createdAt: string;
  updatedAt: string;
  // Detalhes da transição
  previousStatus?: PersonalStatus | null;
  newStatus?: PersonalStatus | null;
  previousProgress?: number | null;
  newProgress?: number | null;
  rating?: number | null;
  isFavorite?: boolean | null;
  rewatchCount?: number | null;
  // Anotações e Unidades
  note?: string | null;
  episodeNumber?: number | null;
  chapterNumber?: number | null;
  volumeNumber?: number | null;
  containsSpoiler: boolean;
}
```

## Contracts

- `GET /api/v1/diary/events?mediaItemId=&type=&page=&limit=` -> Retorna lista paginada de eventos cronológicos ordenados por `occurredAt DESC`.
- `POST /api/v1/diary/events` -> Cria evento manual / anotação.
- `PATCH /api/v1/diary/events/:id` -> Atualiza nota, spoiler ou data (`occurredAt`).
- `DELETE /api/v1/diary/events/:id` -> Remove evento sem alterar o item de biblioteca correspondente.

## Research

- Conforme Seção 6.1 e 6.5 do Documento Mestre de Contexto (`YuukiList_Documento_Mestre_Contexto.md`), notas e histórico são privados por padrão e exigem proteção visual de spoiler com revelação sob demanda.

