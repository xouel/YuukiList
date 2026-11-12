# Tasks: 033-profile-customization-and-ui-polish

## 1. Setup & Database Foundation

- [x] 1.1 Configurar modelo estendido de User e UserLibraryItem em `apps/api/prisma/schema.prisma` com campos de avatar, moldura, capa, bio, telefone e isFavorite, executando migração no Supabase (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 1.2 Atualizar DTOs e tipos compartilhados em `packages/shared/src/profile.ts` e `packages/shared/src/user.ts` com avatarFrame, bannerUrl, bio, phone e location (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 1.3 Configurar classe utilitária `.scrollbar-none` em `apps/web/src/app/globals.css` para ocultar barra de rolagem horizontal nativa sem afetar scroll (Ref: R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados)
- [x] 1.4 Criar suíte de testes TDD em `tests/profile-customization-and-ui-polish.test.mjs` cobrindo validação de botão do Hero, ausência de barra nas abas, persistência de perfil, molduras e privacidade do telefone (Ref: R:User Profile Customization and Media Upload / S:Sigilo estrito do telefone opcional conforme LGPD)

## 2. Core Implementation (User Stories)

- [x] 2.1 [P] [US1] Ajustar o botão de adicionar à lista em `apps/web/src/components/home/hero-spotlight.tsx` removendo o caractere de soma duplicado no texto e mantendo apenas o ícone SVG e o texto 'Adicionar à Lista' (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo)
- [x] 2.2 [P] [US1] Assegurar renderização correta do Hero Spotlight para usuário com obra ativa e para visitante anônimo (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo)
- [x] 2.3 [P] [US1] Manter apresentação convidativa e de acolhimento para visitante não autenticado no Hero (Ref: R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo)
- [x] 2.4 [P] [US1] Aplicar classe `.scrollbar-none` no contêiner de abas de status em `apps/web/src/components/library/library-filters.tsx` (Ref: R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados)
- [x] 2.5 [P] [US1] Garantir filtragem combinada e busca dinâmica local na biblioteca pessoal (Ref: R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria)
- [x] 2.6 [P] [US1] Preservar estados assíncronos de carregamento, erro e acervo vazio na biblioteca (Ref: R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas)
- [x] 2.7 [P] [US1] Preservar tratamento de erro e recuperação na biblioteca (Ref: R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente)
- [x] 2.8 [P] [US1] Preservar busca local instantânea e ordenação dinâmica de obras (Ref: R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica)
- [x] 2.9 [US2] Conectar o `LibraryRepository` e `home-hub-view.tsx` para sincronizar e renderizar itens em andamento (`ASSISTINDO` e `LENDO`) na seção `ContinueWatching` (Ref: R:Continue Watching Feed and Active Progress / S:Exibicao de obras ativas em andamento para usuario autenticado)
- [x] 2.10 [US2] Implementar incremento rápido de unidade com persistência durável no banco a partir da seção Continuar Acompanhando (Ref: R:Continue Watching Feed and Active Progress / S:Incremento rapido de unidade a partir do Home Hub)
- [x] 2.11 [US2] Assegurar persistência do campo `isFavorite` com atualização otimista ao clicar no botão de coração no `library-card.tsx` (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Alternancia imediata de favorito no card ou linha)
- [x] 2.12 [US2] Preservar ações de reassistir/reler no modal da biblioteca (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Execucao de acao de reassistir ou reler no modal)
- [x] 2.13 [US2] Preservar aviso de inconsistência de status e progresso no modal (Ref: R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso)
- [x] 2.14 [US2] Garantir que o endpoint `/api/v1/profile/stats` retorne as obras favoritadas pelo usuário e que sejam renderizadas na `FavoritesShowcase` do perfil (Ref: R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil)
- [x] 2.15 [US2] Assegurar ocultação estrita de notas pessoais confidenciais do usuário para terceiros (Ref: R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros)
- [x] 2.16 [US2] Manter a inversão de hierarquia posicionando a vitrine de favoritos no topo do perfil (Ref: R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil)
- [x] 2.17 [US2] Exibir estado acolhedor explicativo na vitrine de favoritos quando o usuário não tiver títulos favoritados (Ref: R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos)
- [x] 2.18 [US2] Preservar cabeçalho de perfil sem selos decorativos vazios e sem emojis (Ref: R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis)
- [x] 2.19 [US3] Implementar o componente `AvatarFrame` com as 5 molduras editoriais em SVG (`none`, `nanquim`, `carmim`, `ouro`, `sakura`) em `apps/web/src/components/profile/avatar-frame.tsx` (Ref: R:User Profile Customization and Media Upload / S:Selecao de moldura de avatar entre os cinco estilos editoriais)
- [x] 2.20 [US3] Implementar rota de upload de mídia `POST /api/v1/profile/upload` validando arquivos de imagem e enviando para o Supabase Storage (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 2.21 [US3] Implementar o modal `EditProfileModal` em `apps/web/src/components/profile/edit-profile-modal.tsx` permitindo editar foto, capa, moldura, bio e telefone (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 2.22 [US3] Atualizar a página `apps/web/src/app/profile/page.tsx` para integrar o botão de editar perfil, renderização de capa de topo e aplicação da moldura no avatar (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 2.23 [US3] Garantir que o campo de telefone permaneça estritamente restrito à conta autenticada e omitido em respostas públicas e links compartilhados (Ref: R:User Profile Customization and Media Upload / S:Sigilo estrito do telefone opcional conforme LGPD)

## 3. Validation & Integration

- [x] 3.1 Executar a suíte completa de testes automatizados unitários e de integração (`npm test`) validando zero regressões nos 304 testes existentes e aprovação dos novos testes (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 3.2 Executar build de produção do Next.js (`npm --prefix apps/web run build`) confirmando compilação estática limpa de todas as rotas (Ref: R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo)
- [x] 3.3 Atualizar a Traceability Matrix com caminhos reais de código, testes e atestados de execução (Ref: R:User Profile Customization and Media Upload / S:Sigilo estrito do telefone opcional conforme LGPD)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo | 2.2 | apps/web/src/components/home/hero-spotlight.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:Hero Spotlight and Quick Tracking | S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo | 2.1, 3.2 | apps/web/src/components/home/hero-spotlight.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:Hero Spotlight and Quick Tracking | S:Apresentacao editorial de acolhimento para visitante anonimo | 2.3 | apps/web/src/components/home/hero-spotlight.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:Continue Watching Feed and Active Progress | S:Exibicao de obras ativas em andamento para usuario autenticado | 2.9 | apps/web/src/components/home/continue-watching.tsx, apps/web/src/components/home/home-hub-view.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:Continue Watching Feed and Active Progress | S:Incremento rapido de unidade a partir do Home Hub | 2.10 | apps/web/src/components/home/continue-watching.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:Library Filtering and Asynchronous States | S:Filtragem combinada por aba de status e categoria | 2.5 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Library Filtering and Asynchronous States | S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.6 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Library Filtering and Asynchronous States | S:Tratamento de erro com acao de tentar novamente | 2.7 | apps/web/src/components/library/library-view.tsx | tests/personal-library-ui.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Library Filtering and Asynchronous States | S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados | 1.3, 2.4 | apps/web/src/components/library/library-filters.tsx, apps/web/src/app/globals.css | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Library Filtering and Asynchronous States | S:Busca local instantanea por texto com ordenacao dinamica | 2.8 | apps/web/src/components/library/library-view.tsx | tests/ledger-library-and-cadence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Alternancia imediata de favorito no card ou linha | 2.11 | apps/web/src/components/library/library-card.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Execucao de acao de reassistir ou reler no modal | 2.12 | apps/web/src/components/library/edit-item-modal.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:Interactive Favorites Rewatch Actions and Inconsistency Warnings | S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso | 2.13 | apps/web/src/components/library/edit-item-modal.tsx | tests/personal-library-advanced.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:Profile Showcase and Activity Feed Privacy | S:Exibicao da vitrine de obras favoritas no perfil | 2.14 | apps/web/src/app/profile/page.tsx, apps/web/src/app/api/v1/profile/stats/route.ts | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:Profile Showcase and Activity Feed Privacy | S:Ocultacao estrita de anotacoes privadas para terceiros | 2.15 | apps/web/src/app/api/v1/profile/stats/route.ts, apps/api/src/profile/profile.service.ts | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:Profile Showcase and Activity Feed Privacy | S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.16 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-017 | R:Profile Showcase and Activity Feed Privacy | S:Estado amigavel para vitrine sem favoritos | 2.17 | apps/web/src/app/profile/page.tsx | tests/editorial-profile-showcase.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-018 | R:Profile Showcase and Activity Feed Privacy | S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.18 | apps/web/src/app/profile/page.tsx | tests/anti-slop-and-auth-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-019 | R:User Profile Customization and Media Upload | S:Atualizacao de perfil com foto moldura e capa via modal | 1.1, 1.2, 2.20, 2.21, 2.22, 3.1 | apps/web/src/components/profile/edit-profile-modal.tsx, apps/web/src/app/api/v1/profile/account/route.ts, apps/web/src/app/profile/page.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-020 | R:User Profile Customization and Media Upload | S:Selecao de moldura de avatar entre os cinco estilos editoriais | 2.19 | apps/web/src/components/profile/avatar-frame.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-021 | R:User Profile Customization and Media Upload | S:Sigilo estrito do telefone opcional conforme LGPD | 1.4, 2.23, 3.3 | apps/web/src/app/api/v1/profile/account/route.ts, apps/web/src/app/api/v1/profile/stats/route.ts | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado com progresso no acervo | 2.2 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Exibicao de obra em destaque para usuario autenticado sem a obra no acervo | 2.1, 3.2 | COVERED |
| R:Hero Spotlight and Quick Tracking / S:Apresentacao editorial de acolhimento para visitante anonimo | 2.3 | COVERED |
| R:Continue Watching Feed and Active Progress / S:Exibicao de obras ativas em andamento para usuario autenticado | 2.9 | COVERED |
| R:Continue Watching Feed and Active Progress / S:Incremento rapido de unidade a partir do Home Hub | 2.10 | COVERED |
| R:Library Filtering and Asynchronous States / S:Filtragem combinada por aba de status e categoria | 2.5 | COVERED |
| R:Library Filtering and Asynchronous States / S:Exibicao de estado vazio para biblioteca sem obras cadastradas | 2.6 | COVERED |
| R:Library Filtering and Asynchronous States / S:Tratamento de erro com acao de tentar novamente | 2.7 | COVERED |
| R:Library Filtering and Asynchronous States / S:Abas editoriais limpas com taxonomia desambiguada e contadores integrados | 1.3, 2.4 | COVERED |
| R:Library Filtering and Asynchronous States / S:Busca local instantanea por texto com ordenacao dinamica | 2.8 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Alternancia imediata de favorito no card ou linha | 2.11 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Execucao de acao de reassistir ou reler no modal | 2.12 | COVERED |
| R:Interactive Favorites Rewatch Actions and Inconsistency Warnings / S:Exibicao de aviso amigavel sobre inconsistencia entre status e progresso | 2.13 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Exibicao da vitrine de obras favoritas no perfil | 2.14 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Ocultacao estrita de anotacoes privadas para terceiros | 2.15 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Inversao de hierarquia com vitrine de favoritos no topo do perfil | 2.16 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Estado amigavel para vitrine sem favoritos | 2.17 | COVERED |
| R:Profile Showcase and Activity Feed Privacy / S:Identificacao do usuario sem selos decorativos vazios e sem emojis | 2.18 | COVERED |
| R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal | 1.1, 1.2, 2.20, 2.21, 2.22, 3.1 | COVERED |
| R:User Profile Customization and Media Upload / S:Selecao de moldura de avatar entre os cinco estilos editoriais | 2.19 | COVERED |
| R:User Profile Customization and Media Upload / S:Sigilo estrito do telefone opcional conforme LGPD | 1.4, 2.23, 3.3 | COVERED |

- **Constitution Check:** PASS (zero emojis, tipagem TypeScript estrita, tokens semânticos, conformidade estrita com LGPD).
- **Active Change Conflicts:** Nenhum conflito detectado com outras mudanças ativas.
- **Ambiguities / Underspecification:** Nenhuma pendência remanescente.
- **Coverage Summary:** 100% dos 21 cenários normativos cobertos por tarefas acionáveis e mapeados na Traceability Matrix de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
