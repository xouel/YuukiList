# Design: 039-fix-profile-media-persistence

## Context

O fluxo de customização de perfil em produção (`apps/web` na Vercel + PostgreSQL no Supabase via Prisma ORM) passa por quatro camadas acopladas:
1. Upload (`EditProfileModal` → `POST /api/v1/profile/upload`): tenta gravar no bucket `profiles` do Supabase Storage e faz fallback para Data URL (`data:<mime>;base64,...`).
2. Persistência (`PATCH /api/v1/profile/account` → `ProfileController` → `ProfileService` → `UsersRepository.updateProfile`): executa `prisma.user.update` sobre as colunas `users.avatar_url` e `users.banner_url`.
3. Hidratação de sessão/perfil (`GET /api/v1/auth/me` e `GET /api/v1/profile/account` / `stats`): lê do banco via `UsersRepository.findById` e passa pelo `AuthGuard` (`userCache` TTL 45s por instância serverless).
4. Interface (`ProfilePage`, `EditProfileModal`, `AuthContext`, `NavigationShell` e `sw.js`): exibe banner/avatar no perfil e avatar dentro de `AvatarFrame` ao lado do nick na barra superior.

## Goals / Non-Goals

**Goals:**
- Garantir persistência durável no PostgreSQL para `avatarUrl` e `bannerUrl` (tanto URLs HTTPS de Supabase Storage quanto Data URLs otimizadas geradas no fallback automático).
- Impedir que `UsersRepository.updateProfile` mascare erros reais de banco em memória volátil quando `PrismaClient` estiver ativo.
- Redimensionar e comprimir imagens raster no cliente antes do upload para evitar erro HTTP `413` na Vercel (limite 4,5 MB) e manter payloads JSON/DB compactos.
- Garantir que `EditProfileModal` sincronize seu estado com `initialData` ao abrir e que `/api/v1/auth/me` + `/api/v1/profile/account` sempre retornem dados frescos com `Cache-Control: no-store` entre múltiplas instâncias serverless, exibindo a foto junto ao nick na `NavigationShell`.

**Non-Goals:**
- Provisionamento de bucket pago, CDN externa ou dependência de `SUPABASE_SERVICE_ROLE_KEY`.
- Editor/recorte manual interativo (cropper arrastável) no frontend.

## Decisions

1. **Colunas `TEXT` no PostgreSQL com compressão cliente WebP/JPEG via `<canvas>`:**
   - **Escolha:** Alterar `User.avatarUrl` e `User.bannerUrl` no `schema.prisma` para `@db.Text` com migration `ALTER TABLE "users" ALTER COLUMN ... TYPE TEXT`, mantendo a tentativa opcional de upload para o bucket `profiles` e adicionando um helper puro cliente (`apps/web/src/lib/profile-media.ts`) que redimensiona avatares (máx. `400x400`) e capas (máx. `1440x540`) em WebP/JPEG antes de enviar ao endpoint `/api/v1/profile/upload` (cujo limite de segurança é ajustado para `4 MB` dentro do teto de `4,5 MB` da Vercel).
   - **Alternativas consideradas:** Exigir criação manual do bucket `profiles` e `SUPABASE_SERVICE_ROLE_KEY`; usar serviço pago de imagens (Cloudinary/S3). Rejeitadas pela restrição de custo zero permanente (`R$ 0`), simplicidade operacional e resiliência em deploys sem bucket provisionado.
   - **Justificativa:** Reduz fotos de vários MB para ~15–120 KB, evita HTTP `413` na Vercel, preserva transparência em WebP e funciona tanto com quanto sem Supabase Storage.

2. **Erro explícito em `UsersRepository.updateProfile` e sanitização do retorno:**
   - **Escolha:** Remover o `catch` silencioso quando `this.prisma && UUID_REGEX.test(id)` estiver ativo em `UsersRepository.updateProfile`, propagando erro explícito de persistência em vez de salvar apenas no `Map` em RAM; além disso, `ProfileService.updateProfile` passa a retornar DTO seguro (sem `passwordHash`), mantendo suporte in-memory puro nos testes sem Prisma (`this.prisma === null`).
   - **Alternativas consideradas:** Manter fallback silencioso com log no console. Rejeitada porque viola o Princípio II da Constituição ("supressão de erros silenciosos são estritamente proibidos") e enganava o usuário retornando HTTP 200 sem persistir.
   - **Justificativa:** Falhas reais no banco passam a retornar HTTP 4xx/5xx legíveis no modal, enquanto ambientes de teste unitário em memória continuam funcionando integralmente.

3. **Leitura fresca em `/api/v1/auth/me`, cabeçalhos `no-store` e atualização imediata do `AuthContext`:**
   - **Escolha:** Adicionar suporte a `{ bypassCache?: boolean }` em `AuthGuard.validateRequest` e `AuthController.getMe`, acionado pela rota `GET /api/v1/auth/me` (mantendo o cache padrão de 45s quando `bypassCache` não é passado para preservar performance e testes existentes do `AuthGuard`). Configurar `export const dynamic = 'force-dynamic'` e `Cache-Control: no-store` em `/api/v1/auth/me` e `/api/v1/profile/account`, passar `cache: 'no-store'` no `AuthApiClient.getMe()` e no fetch de `/api/v1/profile/account`, ignorar `/api/v1/profile` no cache do Service Worker (`sw.js`) e expor método `updateUser` em `AuthContext` para atualização instantânea combinada com `refreshUser()`.
   - **Alternativas consideradas:** Remover todo o cache do `AuthGuard` ou usar Redis externo. Rejeitadas por degradar performance/testes existentes de TTL ou introduzir nova dependência externa.
   - **Justificativa:** Resolve inconsistência entre múltiplas lambdas da Vercel mantendo custo zero e zero regressão no contrato do `AuthGuard`.

## Risks / Trade-offs

- **[Risco]** Imagens Data URL armazenadas em linha do PostgreSQL aumentam o tamanho de resposta de `/api/v1/auth/me` caso o arquivo não seja comprimido → **Mitigação:** compressão cliente para `400x400` (avatar) / `1440x540` (banner) com fallback de validação `4 MB` no servidor (`<= 4.5 MB` Vercel).
- **[Risco]** Navegadores/ambientes de teste sem `HTMLCanvasElement` (Node.js) → **Mitigação:** `optimizeProfileImageFile` degrada de forma segura retornando o `File` original quando APIs DOM/Canvas estiverem ausentes, mantendo funções puras testáveis em Node.
- **[Risco]** Alteração de schema em banco de produção ativo → **Mitigação:** `ALTER COLUMN ... TYPE TEXT` no PostgreSQL é metadado/alargamento não-destrutivo sem perda de registros ou downtime prolongado.

## Migration Plan

1. Criar `apps/api/prisma/migrations/20261113040000_widen_profile_media_columns/migration.sql` com `ALTER TABLE "users" ALTER COLUMN "avatar_url" TYPE TEXT, ALTER COLUMN "banner_url" TYPE TEXT;`.
2. Executar `npx prisma generate --schema=apps/api/prisma/schema.prisma`.
3. Aplicar em produção/Supabase com `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma` (sem comandos destrutivos) e publicar atualização via push na branch `main` da Vercel.
4. Rollback (apenas se estritamente necessário após validar que nenhuma URL excede 512 chars): `ALTER COLUMN ... TYPE VARCHAR(512)` após truncamento explícito.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/api/prisma/schema.prisma` — alterar `avatarUrl` e `bannerUrl` de `@db.VarChar(512)` para `@db.Text`.
- `[CREATE]` `apps/api/prisma/migrations/20261113040000_widen_profile_media_columns/migration.sql` — ampliar `avatar_url` e `banner_url` para `TEXT` no PostgreSQL.
- `[MODIFY]` `apps/api/src/auth/users.repository.ts` — remover supressão silenciosa de erro do Prisma em `updateProfile`.
- `[MODIFY]` `apps/api/src/profile/profile.service.ts` — retornar DTO sanitizado sem `passwordHash` em `updateProfile`.
- `[MODIFY]` `apps/api/src/auth/auth.guard.ts` — aceitar `{ bypassCache?: boolean }` em `validateRequest` atualizando `userCache`.
- `[MODIFY]` `apps/api/src/auth/auth.controller.ts` — encaminhar opções `{ bypassCache?: boolean }` em `getMe`.
- `[MODIFY]` `apps/web/src/app/api/v1/auth/me/route.ts` — ativar `force-dynamic`, chamar `getMe(reqMock, { bypassCache: true })` e responder com `Cache-Control: no-store`.
- `[MODIFY]` `apps/web/src/app/api/v1/profile/account/route.ts` — ativar `force-dynamic` e `Cache-Control: no-store` na leitura de conta.
- `[MODIFY]` `apps/web/src/app/api/v1/profile/upload/route.ts` — alinhar limite para `4 MB` compatível com Vercel e preservar Supabase Storage + fallback Data URL.
- `[CREATE]` `apps/web/src/lib/profile-media.ts` — helpers puros e compressão cliente de avatar/banner + `formatCssBackgroundUrl`.
- `[MODIFY]` `apps/web/src/components/profile/edit-profile-modal.tsx` — sincronizar estado ao abrir/atualizar `initialData`, comprimir imagens no cliente antes do upload e usar `formatCssBackgroundUrl`.
- `[MODIFY]` `apps/web/src/app/profile/page.tsx` — usar `cache: 'no-store'` ao buscar conta, atualizar `AuthContext` imediatamente com retorno sanitizado do `PATCH`, manter `refreshUser()` e usar `formatCssBackgroundUrl` na capa.
- `[MODIFY]` `apps/web/src/services/auth-api.client.ts` — enviar `cache: 'no-store'` em `getMe()`.
- `[MODIFY]` `apps/web/src/context/auth-context.tsx` — expor `syncUserProfile` para refletir imediatamente avatar/moldura salvos no navbar enquanto `refreshUser()` confirma com servidor.
- `[MODIFY]` `apps/web/src/components/layout/navigation-shell.tsx` — exibir nick junto ao avatar já a partir de `sm:` (`hidden sm:inline-block`) e garantir exibição da imagem remota/Data URL dentro de `AvatarFrame`.
- `[MODIFY]` `apps/web/public/sw.js` — excluir `/api/v1/profile` do cache offline privado.
- `[CREATE]` `tests/profile-media-persistence.test.mjs` — suíte automatizada de regressão para todos os cenários da mudança `039`.

## Data Model

- Entidade `User` (`users` em `apps/api/prisma/schema.prisma`):
  - `avatar_url`: `TEXT NULL` (anteriormente `VARCHAR(512)`), aceitando URL pública do Supabase Storage, URL HTTPS ou Data URL otimizada (`data:image/<mime>;base64,...`).
  - `banner_url`: `TEXT NULL` (anteriormente `VARCHAR(512)`), idem para imagem de capa do perfil.
  - Demais colunas (`avatar_frame VARCHAR(32)`, `bio VARCHAR(500)`, `phone VARCHAR(32)`, `location VARCHAR(120)`) permanecem inalteradas.

## Contracts

- **`POST /api/v1/profile/upload`**:
  - Entrada: `multipart/form-data` com `file` (`image/jpeg | image/png | image/webp | image/gif`, <= 4 MB após otimização cliente) e `type` (`avatar` | `banner`).
  - Saída `201`: `{ url: string }` (URL pública do bucket `profiles` no Supabase Storage quando configurado, ou Data URL `data:<mime>;base64,...`). Erros: `400` formato/tamanho inválido, `401` não autorizado.
- **`PATCH /api/v1/profile/account`**:
  - Entrada: `UpdateProfileDto` (`avatarUrl`, `avatarFrame`, `bannerUrl`, `bio`, `phone`, `location`).
  - Saída `200`: perfil sanitizado `{ userId, username, email, avatarUrl, avatarFrame, bannerUrl, bio, phone, location, createdAt }` (sem `passwordHash`). Erro explícito `400`/`500` se persistência no PostgreSQL falhar.
- **`GET /api/v1/auth/me`**:
  - Saída `200` com `Cache-Control: no-store`: `AuthUserResponse` fresca do banco contendo `avatarUrl` e `avatarFrame` atualizados.

## Research

- **Análise de Custo Zero (Princípio IV):** Toda a solução usa recursos nativos do navegador (`HTMLCanvasElement` / `File`), Next.js App Router (`force-dynamic` / `Cache-Control`) e PostgreSQL `TEXT` já incluído no plano gratuito permanente do Supabase (500 MB DB no tier Free; avatares/capas comprimidos de ~25–120 KB permitem milhares de perfis sem nenhum custo ou trial). Opcionalmente, caso o usuário crie manualmente o bucket público `profiles` no Supabase Storage (1 GB gratuito), o upload continua utilizando o bucket automaticamente como caminho prioritário.
- **Estratégia de Saída:** O uso de URLs padrão HTTP ou Data URLs padronizadas W3C não cria acoplamento proprietário; caso no futuro seja adotado CDN/Storage dedicado (Cloudflare R2, Supabase Storage com bucket `profiles`, etc.), basta atualizar `upload/route.ts` sem alterar schema nem contrato da API `/profile/account`.
