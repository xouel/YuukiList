# Tasks: 039-fix-profile-media-persistence

## 1. Setup & Foundational

- [x] 1.1 Criar suíte TDD de regressão `tests/profile-media-persistence.test.mjs` cobrindo schema `TEXT`, erro explícito em `UsersRepository.updateProfile`, sanitização sem `passwordHash`, `bypassCache` em `/api/v1/auth/me`, helpers de compressão/CSS e exibição na `NavigationShell` (Ref: R:User Profile Customization and Media Upload / S:Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente)
- [x] 1.2 Alterar `User.avatarUrl` e `User.bannerUrl` para `@db.Text` em `apps/api/prisma/schema.prisma`, criar migration SQL `apps/api/prisma/migrations/20261113040000_widen_profile_media_columns/migration.sql` e regenerar Prisma Client (`npx prisma generate`) (Ref: R:User Profile Customization and Media Upload / S:Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente)

## 2. Core Implementation (Persistence, API & UI)

- [x] 2.1 Remover supressão silenciosa de falhas do Prisma em `UsersRepository.updateProfile` (`apps/api/src/auth/users.repository.ts`) para lançar erro explícito quando `this.prisma` falhar e verificar via teste unitário (Ref: R:User Profile Customization and Media Upload / S:Falha explicita ao falhar persistencia do perfil no PostgreSQL)
- [x] 2.2 [P] Atualizar `ProfileService.updateProfile` (`apps/api/src/profile/profile.service.ts`) para retornar DTO sanitizado do perfil sem `passwordHash` mantendo invalidação de cache e compatibilidade com `getAccount` (Ref: R:User Profile Customization and Media Upload / S:Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente)
- [x] 2.3 [P] Ajustar `apps/web/src/app/api/v1/profile/upload/route.ts` para limite de `4 MB` compatível com body serverless da Vercel mantendo Supabase Storage opcional e fallback Data URL (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 2.4 Implementar `bypassCache` opcional em `AuthGuard.validateRequest` (`apps/api/src/auth/auth.guard.ts`) e `AuthController.getMe` (`apps/api/src/auth/auth.controller.ts`), ativando leitura fresca + `dynamic = 'force-dynamic'` + `Cache-Control: no-store` em `apps/web/src/app/api/v1/auth/me/route.ts` e `apps/web/src/app/api/v1/profile/account/route.ts` (Ref: R:Identity Verification and Route Protection / S:Leitura fresca entre multiplas instancias serverless no endpoint me)
- [x] 2.5 Criar `apps/web/src/lib/profile-media.ts` com compressão cliente WebP/JPEG para avatar (`400x400`) e banner (`1440x540`) e escape seguro `formatCssBackgroundUrl`, integrando-o em `EditProfileModal` (`apps/web/src/components/profile/edit-profile-modal.tsx`) com `useEffect` de sincronização de estado ao abrir/atualizar `initialData` (Ref: R:User Profile Customization and Media Upload / S:Sincronizacao de estado do modal ao reabrir ou carregar dados)
- [x] 2.6 Atualizar `AuthApiClient.getMe` (`apps/web/src/services/auth-api.client.ts`), `AuthContext` (`apps/web/src/context/auth-context.tsx`), `ProfilePage` (`apps/web/src/app/profile/page.tsx`), `apps/web/public/sw.js` e `NavigationShell` (`apps/web/src/components/layout/navigation-shell.tsx`) para `cache: 'no-store'`, sincronização imediata do usuário após salvar, exclusão de `/api/v1/profile` do cache SW e exibição da foto junto ao nick em desktop e tablet (`sm:`) (Ref: R:App Navigation Shell and Responsive Layout / S:Exibição de foto de perfil e moldura ao lado do alternador de tema e nick)

## 3. Validation & Integration

- [x] 3.1 Executar suítes automatizadas (`node --experimental-strip-types --test tests/profile-media-persistence.test.mjs tests/profile-customization-and-ui-polish.test.mjs tests/profile-sharing-lgpd.test.mjs tests/performance-home-calendar-and-ui-fixes.test.mjs` e `npm test`), além do build Next.js (`npm run --workspace=@yuukilist/web build`) (Ref: R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal)
- [x] 3.2 Aplicar migration no PostgreSQL Supabase (`npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`) e validar todas as colunas, consultas e rotas ponta a ponta antes do fechamento/deploy (Ref: R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me)

## Traceability Matrix

| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TR-001 | R:User Profile Customization and Media Upload | S:Atualizacao de perfil com foto moldura e capa via modal | 2.3, 2.5, 2.6, 3.1 | apps/web/src/app/api/v1/profile/upload/route.ts, apps/web/src/lib/profile-media.ts, apps/web/src/components/profile/edit-profile-modal.tsx, apps/web/src/app/profile/page.tsx | tests/profile-media-persistence.test.mjs, tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-002 | R:User Profile Customization and Media Upload | S:Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente | 1.1, 1.2, 2.2 | apps/api/prisma/schema.prisma, apps/api/prisma/migrations/20261113040000_widen_profile_media_columns/migration.sql, apps/api/src/profile/profile.service.ts | tests/profile-media-persistence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-003 | R:User Profile Customization and Media Upload | S:Falha explicita ao falhar persistencia do perfil no PostgreSQL | 1.1, 2.1 | apps/api/src/auth/users.repository.ts | tests/profile-media-persistence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-004 | R:User Profile Customization and Media Upload | S:Sincronizacao de estado do modal ao reabrir ou carregar dados | 1.1, 2.5 | apps/web/src/components/profile/edit-profile-modal.tsx, apps/web/src/lib/profile-media.ts | tests/profile-media-persistence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-005 | R:User Profile Customization and Media Upload | S:Selecao de moldura de avatar entre os cinco estilos editoriais | 2.5, 3.1 | apps/web/src/components/profile/edit-profile-modal.tsx, apps/web/src/components/profile/avatar-frame.tsx | tests/profile-customization-and-ui-polish.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-006 | R:User Profile Customization and Media Upload | S:Sigilo estrito do telefone opcional conforme LGPD | 2.2, 3.1 | apps/api/src/profile/profile.service.ts, packages/shared/src/profile.ts | tests/profile-customization-and-ui-polish.test.mjs, tests/profile-sharing-lgpd.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-007 | R:Identity Verification and Route Protection | S:Consulta de perfil do usuário autenticado no endpoint me | 2.4, 3.2 | apps/web/src/app/api/v1/auth/me/route.ts, apps/api/src/auth/auth.controller.ts | tests/auth-backend.test.mjs, tests/profile-media-persistence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-008 | R:Identity Verification and Route Protection | S:Leitura fresca entre multiplas instancias serverless no endpoint me | 1.1, 2.4, 2.6 | apps/api/src/auth/auth.guard.ts, apps/api/src/auth/auth.controller.ts, apps/web/src/app/api/v1/auth/me/route.ts, apps/web/src/services/auth-api.client.ts, apps/web/public/sw.js | tests/profile-media-persistence.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-009 | R:Identity Verification and Route Protection | S:Bloqueio de acesso a rota protegida sem credenciais | 2.4, 3.1 | apps/api/src/auth/auth.guard.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-010 | R:Identity Verification and Route Protection | S:Autenticação alternativa via Header Authorization Bearer | 2.4, 3.1 | apps/api/src/auth/auth.guard.ts | tests/auth-backend.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-011 | R:Identity Verification and Route Protection | S:Cache curto em memória e invalidação imediata ao editar perfil | 2.2, 2.4, 3.1 | apps/api/src/auth/auth.guard.ts, apps/api/src/profile/profile.service.ts | tests/performance-home-calendar-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-012 | R:App Navigation Shell and Responsive Layout | S:Navegacao desktop com Top Command Bar horizontal | 2.6, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-013 | R:App Navigation Shell and Responsive Layout | S:Navegacao mobile com Bottom Navigation bar | 2.6, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-014 | R:App Navigation Shell and Responsive Layout | S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 2.6, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-015 | R:App Navigation Shell and Responsive Layout | S:Alinhamento horizontal em container global padronizado | 2.6, 3.1 | apps/web/src/components/layout/navigation-shell.tsx | tests/asian-editorial-foundation.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |
| TR-016 | R:App Navigation Shell and Responsive Layout | S:Exibição de foto de perfil e moldura ao lado do alternador de tema e nick | 1.1, 2.6, 3.1 | apps/web/src/components/layout/navigation-shell.tsx, apps/web/src/context/auth-context.tsx, apps/web/src/app/profile/page.tsx | tests/profile-media-persistence.test.mjs, tests/performance-home-calendar-and-ui-fixes.test.mjs | automated-test | PASS | cmd-0 \| AI_AUDITED:round-1 |

## Analysis

| Requirement / Scenario | Tasks | Status |
| :--- | :--- | :--- |
| R:User Profile Customization and Media Upload / S:Atualizacao de perfil com foto moldura e capa via modal | 2.3, 2.5, 2.6, 3.1 | COVERED |
| R:User Profile Customization and Media Upload / S:Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente | 1.1, 1.2, 2.2 | COVERED |
| R:User Profile Customization and Media Upload / S:Falha explicita ao falhar persistencia do perfil no PostgreSQL | 1.1, 2.1 | COVERED |
| R:User Profile Customization and Media Upload / S:Sincronizacao de estado do modal ao reabrir ou carregar dados | 1.1, 2.5 | COVERED |
| R:User Profile Customization and Media Upload / S:Selecao de moldura de avatar entre os cinco estilos editoriais | 2.5, 3.1 | COVERED |
| R:User Profile Customization and Media Upload / S:Sigilo estrito do telefone opcional conforme LGPD | 2.2, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Consulta de perfil do usuário autenticado no endpoint me | 2.4, 3.2 | COVERED |
| R:Identity Verification and Route Protection / S:Leitura fresca entre multiplas instancias serverless no endpoint me | 1.1, 2.4, 2.6 | COVERED |
| R:Identity Verification and Route Protection / S:Bloqueio de acesso a rota protegida sem credenciais | 2.4, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Autenticação alternativa via Header Authorization Bearer | 2.4, 3.1 | COVERED |
| R:Identity Verification and Route Protection / S:Cache curto em memória e invalidação imediata ao editar perfil | 2.2, 2.4, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao desktop com Top Command Bar horizontal | 2.6, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Navegacao mobile com Bottom Navigation bar | 2.6, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Destaque dinamico dos botoes de autenticacao conforme rota ativa | 2.6, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Alinhamento horizontal em container global padronizado | 2.6, 3.1 | COVERED |
| R:App Navigation Shell and Responsive Layout / S:Exibição de foto de perfil e moldura ao lado do alternador de tema e nick | 1.1, 2.6, 3.1 | COVERED |

- **Constitution Check:** PASS (nenhuma nova dependência paga ou serviço externo; supressão silenciosa removida; rastreabilidade 100%).
- **Active Change Conflicts:** Nenhum conflito detectado.
- **Ambiguities / Underspecification:** Nenhuma pendência.
- **Coverage Summary:** 100% dos 3 requisitos modificados e 16 cenários cobertos por tarefas numeradas e na Matriz de Rastreabilidade de 9 colunas.

## Drift Log

- Nenhum desvio registrado.
