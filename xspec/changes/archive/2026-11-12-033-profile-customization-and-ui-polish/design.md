# Design: 033-profile-customization-and-ui-polish

## Context

O YuukiList consolidou seu design system no tema Asian Editorial com a paleta Nanquim/Papel/Carmim (`#121115`, `#1A1820`, `#201D28`, `#2B2735`, `#E05347`, `#F4EFEA`) e física tátil. No entanto, foram identificados detalhes pontuais na interface (duplo sinal visual de adição no botão do Hero e barra de rolagem horizontal nativa do Windows sob as abas da biblioteca) e deficiências na persistência de dados (os repositórios operavam com `Map` volátil em memória e o container Next.js recriava instâncias em produção, impedindo que o histórico de "Continuar Acompanhando" e as obras marcadas como favoritas fossem retidas). O projeto foi conectado ao banco de dados PostgreSQL gerenciado no Supabase com a extensão `pg_trgm` habilitada, e agora precisa de uma camada estruturada de persistência durável via Prisma ORM, acompanhada de novos recursos de edição de perfil (foto de avatar, capa, molduras e bio com sigilo de telefone).

## Goals / Non-Goals

**Goals:**
- Sanar o duplo sinal de adição no botão "Adicionar à Lista" no Hero Spotlight.
- Eliminar a barra de rolagem horizontal indesejada nas abas de status da biblioteca via utility `.scrollbar-none`.
- Persistir e retornar os dados vivos de "Continuar Acompanhando" no Home Hub e "Vitrine de Favoritos" no Perfil.
- Integrar o Prisma Client ao banco Supabase PostgreSQL com migração estruturada.
- Implementar a customização do perfil do usuário com foto de avatar, capa de topo, cinco molduras editoriais, biografia e telefone opcional estritamente privado.
- Disponibilizar upload direto de arquivos de mídia (foto e capa) com validação de tamanho e tipo.

**Non-Goals:**
- Ingestão federada em tempo real com APIs de terceiros (AniList e TMDB), reservada para a fatia sequencial `034`.
- Recuperação de senha por e-mail ou autenticação OAuth social.
- Edição pública ou compartilhamento de telefone em links externos (`/share/:token`).

## Decisions

1. **Camada de Persistência Híbrida e Resiliente com Prisma e Supabase**
   - **Escolha:** Configurar o Prisma Client conectado ao Supabase PostgreSQL com pooler de conexões (`?pgbouncer=true&sslmode=require`) e manter fallback gracioso em memória para suítes de testes unitários isolados que rodam sem conexão externa.
   - **Alternativas consideradas:** Manter apenas Maps em memória (rejeitado por não persistir dados entre reinicializações) ou forçar conexão de banco em 100% dos testes unitários (rejeitado por lentidão nos testes offline).
   - **Justificativa:** Garante persistência real para o usuário no ambiente de desenvolvimento e produção, sem degradar a velocidade da suíte de testes existente (304 testes).

2. **Upload Direto e Armazenamento no Supabase Storage**
   - **Escolha:** Utilizar bucket público `profiles` no Supabase Storage com rotas dedicadas de upload validadas no backend (`POST /api/v1/profile/upload`) para avatar e banner.
   - **Alternativas consideradas:** Armazenar dados em Base64 no banco de dados (rejeitado por inchar o PostgreSQL) ou salvar em disco local do Next.js (rejeitado por não persistir em ambientes de nuvem/Vercel).
   - **Justificativa:** Prática padrão de mercado que fornece CDN global e URLs públicas permanentes de alta performance.

3. **Catálogo de 5 Molduras Editoriais em SVG/CSS**
   - **Escolha:** Implementar as 5 molduras editoriais (`none`, `nanquim`, `carmim`, `ouro`, `sakura`) como componentes SVG responsivos sobrepostos ao avatar, com preview em tempo real no modal.
   - **Alternativas consideradas:** Imagens bitmap pré-renderizadas para molduras (rejeitado por perda de nitidez e peso desnecessário).
   - **Justificativa:** O SVG garante nitidez cristalina em qualquer densidade de pixels (Retina), escala perfeita com o avatar e custo zero de transferência de rede.

4. **Sigilo Absoluto de Telefone Conforme LGPD**
   - **Escolha:** O campo `phone` é gravado no modelo `User`, exposto unicamente na rota autenticada `/api/v1/profile/account` e filtrado/removido de todas as rotas públicas ou compartilhadas (`/api/v1/profile/stats` e `/share/:token`).
   - **Alternativas consideradas:** Deixar telefone visível no perfil público (rejeitado por violação de privacidade e LGPD).
   - **Justificativa:** Conformidade inegociável com a privacidade do usuário e diretrizes de governança do projeto.

## Risks / Trade-offs

- **[Risco]** Latência de rede para requisições no Supabase PostgreSQL durante o uso local → **Mitigação:** Uso do transaction pooler do Supabase (`port 6543`) com conexão persistente e atualizações otimistas na interface para ações como favorito e progresso.
- **[Risco]** Falha no upload caso o usuário envie arquivo corrompido ou acima do limite de 5 MB → **Mitigação:** Validação antecipada no cliente (`input type="file" accept="image/*"`) e validação estrita no backend com resposta HTTP 400 amigável.
- **[Risco]** Conflito de estilos na barra de rolagem entre navegadores (Chrome/Edge vs Firefox/Safari) → **Mitigação:** Declaração cruzada de `scrollbar-width: none; -ms-overflow-style: none; &::-webkit-scrollbar { display: none; }` na classe utilitária `.scrollbar-none`.

## Migration Plan

1. Atualizar `apps/api/prisma/schema.prisma` com os novos campos em `User` (`avatarUrl`, `avatarFrame`, `bannerUrl`, `bio`, `phone`, `location`) e `isFavorite` em `UserLibraryItem`.
2. Executar `npx prisma db push` para aplicar as novas colunas diretamente no Supabase PostgreSQL.
3. Gerar novo Prisma Client (`npx prisma generate`).
4. Conectar serviços de perfil e biblioteca à persistência durável.
5. Em caso de necessidade de rollback: os campos adicionados são nulos por padrão (`nullable`), permitindo reversão segura de código sem perda de dados anteriores.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/components/profile/edit-profile-modal.tsx` — Modal de edição de dados do perfil, molduras e mídias
- `[CREATE]` `apps/web/src/components/profile/avatar-frame.tsx` — Componente das 5 molduras editoriais em SVG
- `[CREATE]` `apps/web/src/app/api/v1/profile/upload/route.ts` — Rota de upload de arquivos para Supabase Storage
- `[CREATE]` `tests/profile-customization-and-ui-polish.test.mjs` — Suíte de testes automatizados da fatia 033
- `[MODIFY]` `apps/api/prisma/schema.prisma` — Extensão do modelo User e UserLibraryItem
- `[MODIFY]` `packages/shared/src/profile.ts` — Atualização dos DTOs de perfil e customização
- `[MODIFY]` `packages/shared/src/user.ts` — Tipagem de avatar, moldura, bio e telefone
- `[MODIFY]` `apps/api/src/auth/users.repository.ts` — Persistência de campos de perfil
- `[MODIFY]` `apps/api/src/profile/profile.service.ts` — Sincronização de favoritos e dados do perfil
- `[MODIFY]` `apps/api/src/profile/profile.controller.ts` — Endpoints de atualização cadastral
- `[MODIFY]` `apps/web/src/app/globals.css` — Utility `.scrollbar-none`
- `[MODIFY]` `apps/web/src/components/home/hero-spotlight.tsx` — Remoção do duplo sinal visual de soma
- `[MODIFY]` `apps/web/src/components/home/continue-watching.tsx` — Exibição e atualização otimista de itens ativos
- `[MODIFY]` `apps/web/src/components/library/library-filters.tsx` — Aplicação da classe utilitária sem scrollbar
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx` — Persistência direta de favorito
- `[MODIFY]` `apps/web/src/app/profile/page.tsx` — Botão e acionamento do modal de edição e integração das molduras
- `[MODIFY]` `apps/web/src/server/container.ts` — Singleton consistente em produção

## Data Model

```prisma
model User {
  id                 String   @id @default(uuid()) @db.Uuid
  email              String   @unique @db.VarChar(255)
  normalizedEmail    String   @unique @map("normalized_email") @db.VarChar(255)
  username           String   @unique @db.VarChar(64)
  normalizedUsername String   @unique @map("normalized_username") @db.VarChar(64)
  passwordHash       String   @map("password_hash") @db.VarChar(255)
  avatarUrl          String?  @map("avatar_url") @db.VarChar(512)
  avatarFrame        String?  @default("none") @map("avatar_frame") @db.VarChar(32)
  bannerUrl          String?  @map("banner_url") @db.VarChar(512)
  bio                String?  @db.VarChar(500)
  phone              String?  @db.VarChar(32)
  location           String?  @db.VarChar(120)
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  libraryItems       UserLibraryItem[]

  @@index([normalizedEmail])
  @@index([normalizedUsername])
  @@map("users")
}

model UserLibraryItem {
  id             String    @id @default(uuid()) @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  mediaItemId    String    @map("media_item_id") @db.Uuid
  status         String    @db.VarChar(32)
  progress       Int       @default(0)
  rating         Float?
  notes          String?   @db.Text
  isFavorite     Boolean   @default(false) @map("is_favorite")
  rewatchCount   Int       @default(0) @map("rewatch_count")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  mediaItem      MediaItem @relation(fields: [mediaItemId], references: [id], onDelete: Cascade)

  @@unique([userId, mediaItemId])
  @@index([userId, status])
  @@index([userId, createdAt])
  @@map("user_library_items")
}
```

## Contracts

### `PATCH /api/v1/profile`
- **Autenticação:** Obrigatória via cookie de sessão HttpOnly.
- **Corpo da Requisição:**
  ```json
  {
    "avatarUrl": "https://.../avatar.png",
    "avatarFrame": "carmim",
    "bannerUrl": "https://.../banner.png",
    "bio": "Entusiasta de dramas asiáticos e mangás clássicos.",
    "phone": "+55 11 99999-9999",
    "location": "São Paulo, Brasil"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "userId": "uuid",
    "username": "usuario",
    "avatarUrl": "https://.../avatar.png",
    "avatarFrame": "carmim",
    "bannerUrl": "https://.../banner.png",
    "bio": "Entusiasta de dramas asiáticos e mangás clássicos.",
    "location": "São Paulo, Brasil",
    "updatedAt": "2026-11-12T05:20:00Z"
  }
  ```
  *(Nota: O telefone é retornado apenas no endpoint privado `/api/v1/profile/account` e nunca em respostas públicas).*

### `POST /api/v1/profile/upload`
- **Autenticação:** Obrigatória.
- **Formato:** `multipart/form-data` com campo `file` e `type` (`avatar` ou `banner`).
- **Validação:** Formatos `image/png`, `image/jpeg`, `image/webp` com limite máximo de 5 MB.
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "url": "https://qevwvbtssppmtgeqkcut.supabase.co/storage/v1/object/public/profiles/avatars/user-id.webp"
  }
  ```

## Research

- **Supabase Storage API:** O endpoint de upload aceita requisições REST multipart diretamente para `/storage/v1/object/profiles/:path` usando a publishable anon key com o token do usuário.
- **CSS Scrollbar Hiding:** O padrão compatível entre navegadores requer a combinação de `-ms-overflow-style: none;` (para navegadores baseados em Trident/Edge antigo), `scrollbar-width: none;` (padrão CSS moderno do W3C para Firefox) e `::-webkit-scrollbar { display: none; }` (para Chrome, Safari e Edge Chromium).

