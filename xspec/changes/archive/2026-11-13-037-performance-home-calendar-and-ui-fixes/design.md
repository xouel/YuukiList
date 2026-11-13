# Design: 037-performance-home-calendar-and-ui-fixes

## Context

Medições em servidor de produção local (`http://localhost:3000`) conectado ao PostgreSQL no Supabase (`aws-0-us-west-2.pooler.supabase.com:6543`) apontaram latência física média de `~1,2s–1,4s` por consulta sequencial (`SELECT 1` entre `1242 ms` e `1434 ms`). Em cima disso, há gargalos de arquitetura e defeitos de contrato:
1. `LibraryService.listUserLibrary` e `ProfileService.getStats` executam `catalogRepo.findById` em loop `for` (N+1), levando `/api/v1/library` e `/api/v1/profile/stats` a `TimeoutError (> 8s)`.
2. `CatalogFederatedSearchService` consulta 4 APIs externas (`TMDB`, `TVmaze`, `Kitsu`, `MangaUpdates` até `3000 ms`) em toda busca sem `includeExternal=false`, mesmo havendo resultados locais; no cliente, `CatalogView` não reconhece `CatalogApiError.code === 'ABORTED'`.
3. `AuthGuard.validateRequest` e `AuthService.getMe` consultam `usersRepository.findById` a cada requisição autenticada (`~1178 ms` por chamada) e omitem `avatarUrl` e `avatarFrame` de `AuthUserResponse`, enquanto `NavigationShell` exibe apenas a inicial estática ao lado de `<ThemeToggle />`.
4. `/api/v1/diary/events` chamado por `DiaryApiClient` não existe, `/api/v1/diary/route.ts` invoca `diaryController.createEvent` (inexistente — o método é `create`) e `[id]/route.ts` chama `deleteEvent` (o método é `remove`), causando rollback em `"Marcar Temporada Toda"`.
5. `HomeHubView` invoca `diaryApi.listHistory()` (inexistente em `DiaryApiClient`) antes de `Promise.allSettled`, quebrando silenciosamente `Continuar Acompanhando` e deixando `#alive` + fallback `Solo Leveling` presos no `HeroSpotlight`.
6. `CalendarRepository` ignora `this.catalogRepo` e retorna 4 eventos fictícios em memória com imagens `/covers/*.svg` inexistentes (404), além de `EventCard` enviar `{ currentProgress }` em vez de `{ progress }`.
7. Cliques em `/explore` usam `window.location.href` (hard reload) e páginas não possuem `loading.tsx` nem pré-carregamento inicial SSR.

## Goals / Non-Goals

**Goals:**
- Reduzir idas sequenciais ao PostgreSQL em `/api/v1/library` e `/api/v1/profile/stats` para 1–2 queries em lote.
- Tornar buscas do `/explore` local-first (< 3 resultados locais ou `includeExternal=true`) com caches TTL em servidor e tratamento limpo de `'ABORTED'`.
- Eliminar hard reloads com `router.push`/`<Link prefetch>`, adicionar `loading.tsx`, fornecer dados iniciais SSR nas rotas principais e UI otimista nas mutações rápidas.
- Fazer `"Marcar Temporada Toda"` persistir progresso/status (`CONCLUIDO` ao atingir total conhecido) sem rollback por falhas secundárias no diário e alinhar rotas `/api/v1/diary`.
- Corrigir `"Continuar Acompanhando"` (`diaryApi.list()`), substituir o destaque da Home por carrossel clicável e arrastável com 1 recomendação real por categoria canônica e remover `hover:scale-105` residual.
- Alimentar `/calendar` com obras reais `EM_ANDAMENTO` do catálogo PostgreSQL e capas com fallback SVG (preservando mock apenas sem `CatalogRepository`).
- Exibir foto + `AvatarFrame` na `NavigationShell` ao lado do `<ThemeToggle />`, sincronizada via `AuthUserResponse` e `AuthContext`.

**Non-Goals:**
- Migração externa de região do projeto Supabase (`aws-0-us-west-2` -> `sa-east-1`), fora do controle do código no repositório.
- Alteração de schema Prisma para criar nova tabela de grade externa paga ou scraping.
- Integração com Jikan/AniList ou uso de IA na busca (proibidos pela Constituição).

## Decisions

1. **Resolução em Lote e Eliminação de N+1 (`LibraryRepository` + `PrismaCatalogRepository`)**
   - **Escolha:** Adicionar `findByIds(ids: string[])` em `CatalogRepository` e `PrismaCatalogRepository` (uma query `WHERE id IN (...)` com `include: { genres: true, aliases: true }`) e suporte em `LibraryRepository.findMany` para incluir dados de mídia/gêneros ou pré-carregar via `findByIds` em `LibraryService.listUserLibrary` e `ProfileService.getStats`.
   - **Alternativas consideradas:** Alterar todas as assinaturas de `LibraryRepository` quebrando repositórios em memória de testes; rejeitado por risco alto em testes legados.
   - **Justificativa:** Mantém compatibilidade 100% com testes unitários em memória e reduz 18+ idas sequenciais ao Supabase para 1 consulta em lote.

2. **Cache TTL em Memória (Zero Dependências Externas)**
   - **Escolha:** Implementar caches em memória leves (Map com expiração TTL e limite de chaves) em `CatalogService` (listagens públicas, `getBySlug` e `getFeaturedByCategories` com TTL curto de 60s e invalidação explícita em `upsertMediaItem`/`ingest`) e em `AuthGuard`/`UsersRepository` (TTL curto de 45s por `userId`, invalidado em `updateProfile`/`logout`), mais cabeçalho HTTP `Cache-Control: public, max-age=30, stale-while-revalidate=60` apenas nas rotas públicas GET de catálogo/capa.
   - **Alternativas consideradas:** Redis/Upstash externo; rejeitado para cumprir R$ 0 sem novas contas externas e evitar latência adicional de rede.
   - **Justificativa:** Alinha ao princípio IV (Custo Zero), é reversível com 1 flag e corta o custo repetido de `AuthGuard` (`~1,2s`) em rajadas de navegação autenticada.

3. **Busca Local-First + Expansão Externa Sob Demanda**
   - **Escolha:** Em `CatalogFederatedSearchService`, mudar a condição para `shouldQueryExternal = searchTerm.length >= 2 && (query.includeExternal === true || (query.includeExternal !== false && localResult.data.length < 3))` e expor controle `"Buscar também em fontes externas"` na barra de `/explore` quando `includeExternal` não foi forçado. Em `CatalogView`, tratar `code === 'ABORTED'` junto com `name === 'AbortError'`.
   - **Alternativas consideradas:** Remover busca federada por completo; rejeitado porque obras ausentes no catálogo local ainda precisam de fallback Just-in-Time.
   - **Justificativa:** Reduz o tempo da busca comum de ~7s para apenas 1 query local sem perder cobertura externa quando há menos de 3 resultados.

4. **Carrossel Clicável/Arrastável de Recomendados por Categoria (`HeroSpotlight` + `HomeHubView`)**
   - **Escolha:** Adicionar método `getFeaturedPerCategory()` em `PrismaCatalogRepository`/`CatalogService` (e endpoint `GET /api/v1/catalog/featured` com fallback local caso algum slot falte) retornando 1 obra de maior `rating` para cada categoria (`DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`). No `HeroSpotlight`, suportar array `featuredSlides` com controles de clique (setas anterior/próximo e botões de categoria) e gesto horizontal de arraste/swipe via Pointer/Touch events, mantendo compatibilidade com prop legada `media` usada em testes antigos.
   - **Alternativas consideradas:** Instalar biblioteca externa de carrossel (`embla-carousel` / `swiper`); rejeitado por peso extra desnecessário para 6 slides simples e risco de bundle.
   - **Justificativa:** Zero dependências, acessível por teclado/leitor de tela, responsivo em mobile (swipe) e desktop (drag/clique).

5. **Calendário Real Conectado ao Catálogo (`CalendarRepository` + `CalendarService`)**
   - **Escolha:** Quando `CatalogRepository` estiver presente em `CalendarRepository`/`CalendarService`, derivar a grade semanal/mensal a partir de obras reais `EM_ANDAMENTO` no catálogo (priorizando também itens `ASSISTINDO`/`LENDO`/`QUERO_ASSISTIR`/`QUERO_LER` do usuário logado), gerando eventos determinísticos para a semana corrente com `mediaItemId` UUID real, `mediaSlug` real e `coverImage` oficial real (com fallback `onError` para `/api/v1/catalog/items/:slug/cover` em `EventCard` e `CalendarSidebarWidgets`). Quando `CatalogRepository` for omitido (testes unitários isolados), manter `seedDefaultEvents()` inalterado.
   - **Alternativas consideradas:** Chamar TVmaze/Kitsu ao vivo em todo carregamento de `/calendar`; rejeitado por adicionar 2–4s de latência externa e fragilidade de rede (Princípio V).
   - **Justificativa:** Garante dados reais, capas válidas, vínculo direto com `UserLibraryItem` no botão `+1 Visto` e estabilidade offline.

6. **Contrato do Diário, Marcar Temporada Toda e Avatar na Navbar**
   - **Escolha:**
     - Alinhar `DiaryApiClient` para `/api/v1/diary` e `/api/v1/diary/:id`; corrigir `/api/v1/diary/route.ts` para `diaryController.create(...)` e `[id]/route.ts` para `diaryController.remove(...)` + `PATCH` com `diaryController.update(...)`.
     - Em `ItemDetailView.handleMarkSeasonAll`: atualizar estado otimisticamente, promover `status` para `'CONCLUIDO'` quando `lastEpisodeOfSeason === totalUnits`, capturar erro opcional de `diaryApi.createEvent` em `try/catch` interno para não acionar rollback da biblioteca; em `EpisodeManager`, sincronizar `activeSeasonIndex` via `useEffect` quando `currentProgress` mudar após fetch inicial.
     - Estender `AuthUserResponse` com `avatarUrl?: string | null` e `avatarFrame?: AvatarFrameType | string | null` em `packages/shared/src/auth.ts`, `AuthService`, `AuthGuard` e `AuthContext`; renderizar `<AvatarFrame>` compacto com `<img src={user.avatarUrl}>` (ou inicial) ao lado de `<ThemeToggle />` em `NavigationShell`, atualizando o usuário em memória após edição do perfil.
   - **Alternativas consideradas:** Consultar `/api/v1/profile/account` separado dentro da `NavigationShell`; rejeitado por duplicar round-trip (~1,2s) em toda carga de página.
   - **Justificativa:** Uma única chamada `/api/v1/auth/me` (cacheada) já alimenta header, avatar e moldura sem requisições extras.

## Risks / Trade-offs

- **[Risco]** Cache em memória no servidor ficar defasado brevemente em múltiplas instâncias serverless → **Mitigação:** TTL curto (`45s` para auth e `60s` para catálogo) e invalidação direta na mesma instância após `PATCH /profile/account`, `logout` e `ingest`.
- **[Risco]** Conversão de `/explore` e `/items/[slug]` para pré-carregamento SSR falhar caso o banco esteja momentaneamente inacessível no build → **Mitigação:** Envolver fetch SSR inicial em `try/catch` seguro e usar `dynamic = 'force-dynamic'` apenas onde necessário, mantendo carregamento client-side como fallback.
- **[Risco]** Testes legados de `CalendarRepository` e `HeroSpotlight` quebrarem com os novos dados reais → **Mitigação:** Manter fallback `seedDefaultEvents()` quando `catalogRepo` não é passado ao construtor de `CalendarRepository` e preservar suporte à prop `media` singular em `HeroSpotlight`.

## Migration Plan

- Nenhuma migração destrutiva de banco de dados necessária (`MediaItem`, `UserLibraryItem` e `User` já possuem todas as colunas utilizadas: `rating`, `coverPath`, `avatarUrl`, `avatarFrame`).
- Rollback simples via revert do commit caso necessário; nenhuma alteração irreversível de schema ou dados.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `packages/shared/src/auth.ts` — incluir `avatarUrl` e `avatarFrame` opcionais em `AuthUserResponse`.
- `[MODIFY]` `apps/api/src/data/prisma-catalog.repository.ts` — adicionar `findByIds(ids)` em lote, `findFeaturedPerCategory()` e `findOngoingWorks(limit)`.
- `[MODIFY]` `apps/api/src/data/catalog.repository.ts` — adicionar métodos equivalentes `findByIds`, `findFeaturedPerCategory` e `findOngoingWorks` no repositório em memória.
- `[MODIFY]` `apps/api/src/catalog/catalog-federated-search.service.ts` — aplicar regra local-first (`includeExternal === true || (includeExternal !== false && localResult.data.length < 3)`).
- `[MODIFY]` `apps/api/src/catalog/catalog.service.ts` & `catalog.controller.ts` — cache TTL com invalidação em `ingest` e método `getFeaturedByCategory()`.
- `[MODIFY]` `apps/api/src/library/library.service.ts` & `library.repository.ts` — resolver metadados de mídia via `findByIds` em lote eliminando N+1 sequencial.
- `[MODIFY]` `apps/api/src/profile/profile.service.ts` — substituir loop sequencial `findById` por `findByIds` em lote e invalidar cache de auth ao atualizar perfil.
- `[MODIFY]` `apps/api/src/auth/auth.service.ts` & `auth.guard.ts` & `auth.module.ts` — retornar `avatarUrl`/`avatarFrame` e cache TTL curto com invalidação explícita.
- `[MODIFY]` `apps/api/src/calendar/calendar.repository.ts` & `calendar.service.ts` — gerar eventos reais a partir de `catalogRepo` conectado e manter fallback de testes isolados.
- `[MODIFY]` `apps/web/src/app/api/v1/diary/route.ts` & `[id]/route.ts` — corrigir chamadas `diaryController.create`/`remove` e adicionar `PATCH` com `update`.
- `[CREATE]` `apps/web/src/app/api/v1/catalog/featured/route.ts` — endpoint público `GET` retornando 1 obra melhor avaliada por categoria (cacheado).
- `[MODIFY]` `apps/web/src/services/diary-api.client.ts` & `catalog-api.client.ts` — alinhar URLs `/api/v1/diary` e suportar `/api/v1/catalog/featured`.
- `[MODIFY]` `apps/web/src/context/auth-context.tsx` & `apps/web/src/components/layout/navigation-shell.tsx` — expor `refreshUser`/`updateAuthUser` e exibir foto com `AvatarFrame` ao lado do `<ThemeToggle />`.
- `[MODIFY]` `apps/web/src/components/home/home-hub-view.tsx`, `hero-spotlight.tsx`, `trending-showcase.tsx`, `bento-sidebar.tsx` — corrigir `diaryApi.list()`, corrigir `event.number`, remover `hover:scale-105` e implementar carrossel clicável/arrastável de recomendados por categoria.
- `[MODIFY]` `apps/web/src/components/catalog/catalog-view.tsx`, `item-detail-view.tsx`, `episode-manager.tsx`, `apps/web/src/app/explore/page.tsx`, `apps/web/src/app/items/[slug]/page.tsx`, `apps/web/src/app/page.tsx` — SPA navigation (`router.push`), tratamento de `'ABORTED'`, expansão externa sob demanda, pré-carregamento SSR e correção de `"Marcar Temporada Toda"` + UI otimista.
- `[CREATE]` `apps/web/src/app/explore/loading.tsx`, `apps/web/src/app/library/loading.tsx`, `apps/web/src/app/calendar/loading.tsx`, `apps/web/src/app/items/[slug]/loading.tsx` — skeletons imediatos de transição de rota.
- `[MODIFY]` `apps/web/src/components/calendar/event-card.tsx` & `calendar-sidebar-widgets.tsx` — fallback `onError` para `/api/v1/catalog/items/:slug/cover` e correção de `{ progress }` em `+1 Visto`.
- `[CREATE]` `tests/performance-home-calendar-and-ui-fixes.test.mjs` — suíte TDD automatizada cobrindo todos os cenários da mudança `037`.

## Data Model

Nenhuma migração SQL nova é necessária. Os contratos compartilhados são estendidos sem quebra:
- `AuthUserResponse` (`packages/shared/src/auth.ts`) passa a incluir:
  ```ts
  avatarUrl?: string | null;
  avatarFrame?: AvatarFrameType | string | null;
  ```
- Consultas Prisma usam `MediaItem.findMany({ where: { id: { in: ids } }, include: { genres: true } })` para resolução 1:N em lote nas operações de biblioteca e perfil, mantendo compatibilidade com `UserLibraryItem` e `User` já existentes no `schema.prisma`.

## Contracts

### 1. Endpoints do Diário (`/api/v1/diary` e `/api/v1/diary/:id`)
- **Entrada/Saída:** `GET /api/v1/diary?mediaItemId=...` -> `HistoryEventDto[]` (200); `POST /api/v1/diary` -> `HistoryEventDto` (201) via `DiaryController.create`; `PATCH /api/v1/diary/:id` -> `HistoryEventDto` (200) via `DiaryController.update`; `DELETE /api/v1/diary/:id` -> `{ success: boolean }` (200) via `DiaryController.remove`.
- **Erros:** `401` quando não autenticado; `400` para payload inválido; na UI de biblioteca/detalhes/calendário, o registro automático do diário é desacoplado de rollback da biblioteca (falha no diário não desfaz o avanço persistido em `/api/v1/library/items`).

### 2. Busca Local-First & Destaques por Categoria (`/api/v1/catalog/*`)
- **Busca:** `GET /api/v1/catalog/items?q=...&includeExternal=true|false`: executa consulta local no Supabase; APIs externas rodam somente quando `q.trim().length >= 2` E (`includeExternal === 'true'` OU (`includeExternal !== 'false'` && `localResult.data.length < 3`)), sempre com timeout de `3000 ms`.
- **Destaques:** `GET /api/v1/catalog/featured` -> `{ items: MediaItemSummaryDto[] }` (1 obra por categoria canônica na ordem `DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`), com cache em memória (TTL 60s) e `Cache-Control: public, max-age=30, stale-while-revalidate=60`.

### 3. Autenticação & Avatar (`GET /api/v1/auth/me`, `POST /api/v1/auth/login|register`)
- **Saída (`AuthUserResponse`):** `{ id, email, username, role?, avatarUrl?, avatarFrame?, createdAt }`.
- **Cache/Invalidação:** `AuthGuard` mantém cache TTL de `45s` por `userId` após validar JWT; `ProfileController.updateProfile` e logout invalidam a entrada correspondente imediatamente para garantir atualização reativa do avatar no cliente via `AuthContext`.

### 4. Calendário Real (`GET /api/v1/calendar/events`)
- **Saída:** `{ events: CalendarEvent[], view, total }` onde cada `CalendarEvent` traz `mediaItemId` (UUID real quando com banco), `mediaSlug`, `coverImage` (URL oficial do catálogo com fallback `onError` para `/api/v1/catalog/items/:slug/cover`), `scheduledAt` ISO 8601 e flags `isUserTracking` / `isUserPlanned`.
- **Ação `+1 Visto` (`EventCard`):** `PATCH /api/v1/library/items/:mediaItemId` com `{ progress: targetProgress }` + evento opcional `POST /api/v1/diary`.

## Research

- **Dependências analisadas:** Nenhuma biblioteca externa nova será adicionada. Todas as soluções utilizam recursos nativos existentes no repositório (`PrismaClient.findMany` com `in`, `Map` com TTL em Node.js, `next/navigation` `useRouter`, Next.js `loading.tsx`, Server Components nativos e eventos nativos DOM `onPointerDown`/`onPointerUp`/`Touch` no carrossel).
- **Análise de Custo Zero (Princípio IV):** Custo adicional de **R$ 0,00 permanente**. Reduz consumo de conexões e quota no tier gratuito do Supabase PostgreSQL (menos ~90% das queries em `/library` e `/profile/stats` e menos queries em `/auth/me`) e diminui requisições desnecessárias às APIs gratuitas TMDB/TVmaze/Kitsu/MangaUpdates.
- **Estratégia de saída (Exit Plan):** Todos os caches em memória ficam isolados em helpers locais com TTL substituíveis por variável de ambiente ou removíveis sem alteração de contrato; SSR inicial pode voltar a client-fetch sem impacto em APIs.

