# Proposal: Fix Profile Media Persistence & Navbar Avatar Display

> **X-Spec** · ID: `039-fix-profile-media-persistence` · Type: `bugfix` · Status: `ARCHIVED` · Created: `2026-11-13`

## Why

Em produção (`https://yuuki-list-two.vercel.app/`), o salvamento de foto de perfil (`avatarUrl`) e foto de capa (`bannerUrl`) falha silenciosamente e a foto não aparece na barra de navegação junto ao nick. A investigação identificou três causas encadeadas: (1) o bucket `profiles` do Supabase Storage não existe (`NoSuchBucket`), fazendo `/api/v1/profile/upload` retornar Data URLs (`data:image/...;base64,...`) maiores que 512 caracteres; (2) `schema.prisma` limita `avatar_url` e `banner_url` a `@db.VarChar(512)` e `UsersRepository.updateProfile` suprime silenciosamente o erro do Prisma em memória volátil, retornando HTTP 200 enquanto futuras leituras trazem `null` do PostgreSQL; e (3) `/api/v1/auth/me` e `/api/v1/profile/account` não forçam leitura fresca sem cache entre lambdas nem o `EditProfileModal` redimensiona/sincroniza estado ao abrir.

## What Changes

- Alterar `User.avatarUrl` e `User.bannerUrl` no `schema.prisma` de `@db.VarChar(512)` para `@db.Text` com nova migration SQL não-destrutiva para Supabase/PostgreSQL.
- Remover a supressão silenciosa de erros do Prisma em `UsersRepository.updateProfile` e sanitizar a resposta de `ProfileService.updateProfile` sem expor `passwordHash`.
- Redimensionar/comprimir imagens raster no cliente dentro de `EditProfileModal` (evitando erro `413` da Vercel de 4.5 MB e mantendo Data URLs leves), sincronizar o estado do formulário ao abrir/atualizar dados e proteger `url(...)` em CSS para capa.
- Ajustar `/api/v1/profile/upload` para respeitar limite seguro de payload serverless e manter o fallback automático de Data URL quando Supabase Storage estiver ausente.
- Garantir `dynamic = 'force-dynamic'`, `Cache-Control: no-store` e leitura fresca em `/api/v1/auth/me` e `/api/v1/profile/account` (além de excluir `/api/v1/profile` do cache do Service Worker e melhorar exibição de foto + nick na `NavigationShell`).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `user-profile-stats`: Persistência durável de `avatarUrl` e `bannerUrl` como `TEXT` (suportando Supabase Storage ou Data URL comprimida), falha explícita quando PostgreSQL recusar gravação, compressão cliente e sincronização de estado em `EditProfileModal`.
- `auth-session`: Hidratação fresca sem cache estaleado entre lambdas serverless em `GET /api/v1/auth/me` com `force-dynamic` e `Cache-Control: no-store`.
- `navigation-shell`: Exibição confiável da foto de perfil autenticada (URL remota ou Data URL) dentro de `AvatarFrame` junto ao nick (`user.username`) na barra superior e atualização imediata após salvar o perfil.

## Impact

- Banco de Dados / Prisma: `apps/api/prisma/schema.prisma`, nova migration em `apps/api/prisma/migrations/`
- Backend (`apps/api`): `apps/api/src/auth/users.repository.ts`, `apps/api/src/auth/auth.guard.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/profile/profile.service.ts`
- Rotas API Next.js (`apps/web`): `apps/web/src/app/api/v1/profile/upload/route.ts`, `apps/web/src/app/api/v1/profile/account/route.ts`, `apps/web/src/app/api/v1/profile/stats/route.ts`, `apps/web/src/app/api/v1/auth/me/route.ts`
- Frontend & PWA (`apps/web`): `apps/web/src/components/profile/edit-profile-modal.tsx`, `apps/web/src/app/profile/page.tsx`, `apps/web/src/components/layout/navigation-shell.tsx`, `apps/web/src/services/auth-api.client.ts`, `apps/web/src/context/auth-context.tsx`, `apps/web/public/sw.js`
- Testes: novos testes de regressão cobrindo persistência real, rejeição explícita de erro do Prisma, upload/otimização e navbar com avatar + nick.

## User Stories

### US1 — Persistência Real de Foto de Perfil e Capa (Priority: P1)
Como usuário autenticado no YuukiList, quero enviar minha foto de perfil e minha foto de capa no modal de edição e tê-las salvas permanentemente no banco de dados mesmo após recarregar a página.

- **Why this priority:** Bug crítico em produção: usuários perdem avatar e capa imediatamente ao salvar devido ao truncamento `VARCHAR(512)` e supressão silenciosa de erro.
- **Independent Test:** Executar `UsersRepository.updateProfile` com Data URL longa (> 512 chars) contra mock/instância Prisma verificando persistência de `avatarUrl` e `bannerUrl`, recusa explícita em erro de DB, e resposta sem `passwordHash` em `PATCH /api/v1/profile/account`.

### US2 — Exibição Imediata da Foto junto ao Nick na Navbar (Priority: P1)
Como usuário autenticado que acabou de atualizar meu avatar, quero ver minha nova foto de perfil exibida na barra de navegação superior junto ao meu nick imediatamente após salvar e também após recarregar a página ou navegar entre rotas.

- **Why this priority:** Completa o feedback visual esperado pelo usuário na navegação global em todas as páginas da aplicação.
- **Independent Test:** Verificar via testes de contrato/UI que `GET /api/v1/auth/me` ignora cache local desatualizado entre instâncias serverless com `no-store`, que `AuthContext` atualiza imediatamente o usuário após `save` e que `NavigationShell` renderiza `<img>` com `user.avatarUrl` dentro de `AvatarFrame` ao lado de `user.username`.

## Success Criteria

- **SC-001**: 100% dos uploads de avatar e capa (via Storage ou Data URL comprimida até ~4 MB) são persistidos em colunas `TEXT` sem truncamento nem perda após reload (`F5`).
- **SC-002**: 0% de supressão silenciosa de falhas de banco em `UsersRepository.updateProfile` quando o PostgreSQL estiver configurado e retornar erro.
- **SC-003**: Avatar e nick (`user.username`) permanecem sincronizados na barra superior (`NavigationShell`) imediatamente após salvar o perfil e após navegação/reload em múltiplos containers serverless.

## Edge Cases

- Imagem enviada pelo usuário maior que 4 MB em resolução alta (foto de celular PNG/JPEG): deve ser redimensionada/comprimida no navegador para WebP/JPEG leve antes do `POST /api/v1/profile/upload`.
- Reabertura do modal `EditProfileModal` após fechar sem salvar ou após atualização assíncrona dos dados do perfil: os previews e campos devem refletir o estado salvo atual, não um rascunho antigo.
- Usuário com nome de usuário visível em viewports desktop e tablet (`sm:`+) ou dentro do menu móvel mantendo responsividade no header sem quebra de layout.

## Out of Scope

- Criação paga de CDN/bucket externo fora do tier gratuito ou obrigatoriedade de provisionar `SUPABASE_SERVICE_ROLE_KEY`.
- Edição avançada/crop manual interativo com arraste de imagem neste bugfix.

## Clarifications

### Session 2026-11-13
- Q: Qual estratégia de armazenamento usar considerando que o bucket `profiles` do Supabase Storage retornou `NoSuchBucket` e `.env` possui apenas chave pública anon? → A: Manter tentativa opcional no Supabase Storage (quando o bucket existir) e corrigir a persistência do fallback de Data URL comprimida em colunas `TEXT` no PostgreSQL, mantendo custo R$ 0 e zero dependência de configuração manual externa.
- Q: É necessário alterar o comportamento de leitura de sessão após editar o perfil? → A: Sim; `/api/v1/auth/me` deve ler dados frescos sem cache HTTP/serverless obsoleto para evitar que outra instância da Vercel devolva o avatar antigo após salvar.

