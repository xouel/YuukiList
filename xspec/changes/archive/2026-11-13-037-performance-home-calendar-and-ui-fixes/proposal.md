# Proposal: Otimização de Performance, Correções de Fluxo (Temporada, Home, Calendário) e Avatar na Navbar

> **X-Spec** · ID: `037-performance-home-calendar-and-ui-fixes` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

Testes em produção local revelaram gargalos severos de latência e falhas de fluxo: `/api/v1/library` e `/api/v1/profile/stats` excedem 8s (timeout) por loops N+1 em consultas sequenciais, buscas disparam 4 APIs externas mesmo com resultados locais, rotas críticas causam hard reloads e falhas de contrato impedem o funcionamento do botão "Marcar Temporada Toda", da seção "Continuar Acompanhando", das capas/dados reais do `/calendar`, do avatar na navbar e da variedade de recomendações na Home.

## What Changes

- **Busca local-first & performance SQL/Cache:** Eliminar loops N+1 com joins/consultas em lote em `LibraryService` e `ProfileService`; acionar APIs externas no `/explore` apenas com menos de 3 resultados locais ou sob demanda; adicionar caches em memória com TTL (catálogo, destaques por categoria e `AuthGuard`) invalidados em mutações.
- **Fluidez de navegação & UI otimista:** Substituir hard reloads (`window.location.href`) por navegação SPA (`router.push`/`<Link prefetch>`), pré-carregar dados iniciais via Server Components com `loading.tsx`, tratar aborts `'ABORTED'` no catálogo e aplicar atualização otimista em ações rápidas.
- **Botão "Marcar Temporada Toda" & rotas do Diário:** Alinhar `DiaryApiClient`, `/api/v1/diary` e `DiaryController` (`create`/`remove`/`update`); promover status para `CONCLUIDO` ao marcar até o total da obra, sincronizar `activeSeasonIndex` e desacoplar falhas secundárias do diário do estado da biblioteca.
- **"Continuar Acompanhando" & Carrossel na Home:** Corrigir crash `diaryApi.listHistory()` -> `diaryApi.list()` e leitura `event.number` na `BentoSidebar`; substituir `#alive`/fallback `Solo Leveling` por carrossel clicável e arrastável (`pointer`/touch) com 1 obra melhor avaliada de cada uma das 6 categorias canônicas e remover `hover:scale-105` restante.
- **Calendário real com capas oficiais:** Alimentar `CalendarRepository`/`CalendarService` com obras reais `EM_ANDAMENTO` do Supabase PostgreSQL (mantendo mock isolado apenas quando instanciado sem banco em testes unitários), adicionar fallback `onError` nas capas e corrigir payload `{ progress }` no botão `+1 Visto`.
- **Avatar na Barra Superior:** Expor `avatarUrl` e `avatarFrame` em `AuthUserResponse`, `AuthService`, `AuthGuard` e `AuthContext`, exibindo a foto envolvida pela moldura escolhida (`AvatarFrame`) ao lado de `<ThemeToggle />`.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `catalog-search`: Busca local-first (< 3 resultados locais ou botão sob demanda), cache em memória com TTL e consulta/destaque da obra mais bem avaliada por categoria.
- `catalog-browse`: Pré-carregamento SSR, `loading.tsx`, navegação SPA sem hard reload, tratamento seguro de `ABORTED`, promoção a `CONCLUIDO` em "Marcar Temporada Toda" e sincronização de `activeSeasonIndex`.
- `personal-library`: Consultas em lote/join eliminando loops N+1 em `LibraryService`/`LibraryRepository`.
- `personal-diary`: Alinhamento das rotas `/api/v1/diary` e `/api/v1/diary/:id` aos métodos de `DiaryController` e `DiaryApiClient`.
- `home-hub`: Correção do carregamento de `Continuar Acompanhando` (`diaryApi.list`), ajuste de `event.number` na `BentoSidebar`, remoção de `hover:scale-105` em `TrendingShowcase` e carrossel clicável/arrastável por categoria no `HeroSpotlight`.
- `calendar-events`: Geração de eventos a partir das obras reais `EM_ANDAMENTO` no catálogo Supabase com UUID, slug e capas oficiais quando conectado ao repositório Prisma.
- `calendar-ui`: Fallback `onError` de capas em `EventCard` e `CalendarSidebarWidgets` e correção da mutação `{ progress }` em `+1 Visto`.
- `user-profile-stats`: Consolidação das métricas de `ProfileService.getStats` via busca em lote sem N+1.
- `auth-session`: Inclusão de `avatarUrl` e `avatarFrame` na resposta autenticada e cache de curta duração no `AuthGuard` com invalidação em alterações de perfil/logout.
- `navigation-shell`: Exibição da foto de perfil com `AvatarFrame` (ou inicial fallback) ao lado de `<ThemeToggle />` sincronizada com `AuthContext`.

## Impact

- **Backend / API / Contrato:** `packages/shared/src/auth.ts`, `apps/api/src/auth/*`, `apps/api/src/catalog/*`, `apps/api/src/library/*`, `apps/api/src/profile/*`, `apps/api/src/calendar/*`, `apps/api/src/data/prisma-catalog.repository.ts`, `apps/web/src/app/api/v1/diary/**`, `apps/web/src/app/api/v1/catalog/**`.
- **Frontend / Páginas / Clientes:** `apps/web/src/app/(page.tsx|loading.tsx)`, `apps/web/src/context/auth-context.tsx`, `apps/web/src/services/diary-api.client.ts`, `apps/web/src/components/layout/navigation-shell.tsx`, `apps/web/src/components/home/*`, `apps/web/src/components/catalog/*`, `apps/web/src/components/calendar/*`.
- **Testes:** `tests/` (regressão de performance em lote, busca local-first, lote de temporada, diário, home/carrossel, calendário com capas reais e avatar na navbar).

## User Stories

### US1 — Navegação e Ações Rápidas sem Travamentos (Priority: P1)
Como usuário do YuukiList, quero que minhas listas, estatísticas e buscas carreguem rapidamente e que as interações (`+1`, favoritar, navegação entre páginas) respondam imediatamente sem reloads completos.

- **Why this priority:** Timeouts acima de 8s em `/api/v1/library` e `/api/v1/profile/stats` e travamentos de até ~7s na busca degradam toda a experiência de uso.
- **Independent Test:** Medir chamadas de `LibraryService.listUserLibrary` e `ProfileService.getStats` garantindo ausência de loop N+1, verificar busca local-first e conferir navegação SPA sem `window.location.href` entre catálogo e detalhes.

### US2 — Marcação de Temporada Completa e Continuar Acompanhando Funcionais (Priority: P1)
Como usuário autenticado, quero concluir uma temporada inteira pelo botão "Marcar Temporada Toda" e visualizar minhas obras `ASSISTINDO`/`LENDO` na seção "Continuar Acompanhando" da Home com atualização instantânea.

- **Why this priority:** Ambos os fluxos centrais de acompanhamento estão falhando silenciosamente hoje devido a 404/mismatch no diário e erro `diaryApi.listHistory()`.
- **Independent Test:** Acionar `handleMarkSeasonAll` com mock/API e validar atualização para `CONCLUIDO` quando atingir o total sem rollback; renderizar `HomeHubView` autenticado e validar exibição dos cards ativos em `Continuar Acompanhando`.

### US3 — Carrossel de Recomendados por Tipo na Home, Calendário Real com Capas e Avatar na Navbar (Priority: P2)
Como usuário, quero alternar (clicando ou arrastando) entre 1 obra recomendada real de cada uma das 6 categorias na Home, ver eventos reais com capas oficiais no Calendário e ver minha foto de perfil com moldura ao lado do alternador de tema após fazer login.

- **Why this priority:** Entrega descoberta editorial completa por categoria, elimina dados/imagens quebradas do calendário e consolida identidade visual na barra superior.
- **Independent Test:** Alternar entre as 6 categorias no `HeroSpotlight` por clique e gesto de arraste; consultar `CalendarService.getEvents` com `CatalogRepository` verificando capas reais; autenticar usuário com `avatarUrl`/`avatarFrame` e verificar renderização na `NavigationShell`.

## Success Criteria

- **SC-001**: `LibraryService.listUserLibrary` e `ProfileService.getStats` resolvem metadados das obras em lote/join (no máximo 2 consultas ao catálogo por chamada, zero N+1 sequencial).
- **SC-002**: Buscas no catálogo com `>= 3` resultados locais respondem sem aguardar APIs externas, mantendo acionamento explícito sob demanda e tratamento silencioso de requisições `ABORTED`.
- **SC-003**: Botão "Marcar Temporada Toda" persiste o progresso via `PATCH/POST /api/v1/library/items`, promove para `CONCLUIDO` quando atingir o total de unidades da obra e registra evento via `/api/v1/diary` sem reverter a biblioteca em falha secundária.
- **SC-004**: `HomeHubView` carrega `Continuar Acompanhando` exibindo obras `ASSISTINDO`/`LENDO` ativas e apresenta carrossel clicável/arrastável com 1 recomendação real para cada uma das 6 categorias canônicas.
- **SC-005**: `/calendar` exibe eventos originados de obras `EM_ANDAMENTO` reais do Supabase quando conectado, com capas oficiais e fallback SVG em caso de erro de imagem.
- **SC-006**: `AuthUserResponse` inclui `avatarUrl` e `avatarFrame`, e `NavigationShell` renderiza a foto do usuário logado com sua moldura ao lado do `<ThemeToggle />`.

## Edge Cases

- Busca digitada rapidamente cancelando requisições anteriores não pode acionar `ErrorState` quando o erro for `ABORTED`.
- Obras em andamento (`EM_ANDAMENTO`) ou sem total conhecido ao usar "Marcar Temporada Toda" devem manter status ativo (`ASSISTINDO`/`LENDO`) sem promover prematuramente para `CONCLUIDO`.
- Usuário logado sem `avatarUrl` definida deve continuar vendo o fallback limpo da inicial dentro do `AvatarFrame` na barra superior.
- Eventos de calendário cuja URL externa de capa falhe no navegador devem recorrer imediatamente a `/api/v1/catalog/items/:slug/cover`.
- Testes unitários de calendário que instanciam `CalendarRepository()` sem `CatalogRepository` devem preservar compatibilidade com eventos de amostra em memória.

## Out of Scope

- Migração física de região do projeto Supabase (`aws-0-us-west-2` -> `sa-east-1`), pois exige ação externa no painel da infraestrutura.
- Criação de nova tabela SQL exclusiva para programação externa paga ou scraping de grades de TV.
- Streaming de vídeo ou leitura de páginas de mangá.

## Clarifications

### Session 2026-11-12
- Q: Como devem funcionar a busca externa no `/explore` e as otimizações de velocidade (incluindo migração de região do banco)? → A: Opção A (recomendado) — Busca local-first automática apenas se `< 3` resultados locais + botão explícito `"Buscar em fontes externas"`, otimização completa no código da aplicação (lote SQL sem N+1, caches TTL servidor/auth, SSR + `loading.tsx`, navegação SPA e UI otimista), deixando eventual migração externa de região do Supabase fora do escopo automático.
- Q: Como devem se comportar "Marcar Temporada Toda", o Avatar na Navbar e "Continuar Acompanhando"? → A: Opção A (recomendado) — Promover para `CONCLUIDO` ao atingir o total da obra (com diário desacoplado de rollback), exibir foto + moldura selecionada (`AvatarFrame`) ao lado de `<ThemeToggle />` na barra superior e corrigir `Continuar Acompanhando` e `BentoSidebar`.
- Q: Qual fonte de dados usar no `/calendar` e como estruturar o carrossel de recomendados na Home? → A: Opção A (recomendado) — Alimentar `/calendar` com obras reais `EM_ANDAMENTO` do Supabase (cruzadas com a biblioteca e capas reais + fallback SVG, mantendo mock em memória só em testes unitários sem banco) e implementar carrossel clicável e arrastável (`pointer`/touch) no destaque da Home com 1 obra melhor avaliada por categoria (`DORAMA`, `FILME`, `ANIME`, `MANGA`, `MANHWA`, `MANHUA`).

