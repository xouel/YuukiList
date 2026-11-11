# Design: 016-provisional-works-and-admin

## Context

O catálogo central do YuukiList depende de provedores e ingestão periódica. Obras de nicho asiáticas, produções independentes ou estreias imediatas frequentemente não constam de imediato no catálogo público. O documento mestre (`YuukiList_Documento_Mestre_Contexto.md`, seções 8.5, 15.1-15.4 e 17) estabelece:
1. Cadastro provisório com campos mínimos pelo próprio usuário, para que ele nunca seja bloqueado de catalogar o que consome.
2. Deduplicação híbrida com `pg_trgm`: detectar possíveis duplicatas (limiar 0.35) alertando o usuário, mas sem bloqueio forçado de envio em casos ambíguos.
3. Papéis de usuário (`USER`, `MODERATOR`, `ADMIN`) e painel administrativo (`/admin`) para triagem de solicitações e governança de dados.
4. Proteção contra sobrescrita automática: metadados editados manualmente pela administração recebem flag de proteção (`isManuallyEdited = true` e `lockedFields`), impedindo que sincronizações periódicas apaguem correções legítimas.
5. PWA instalável com navegação offline para dados recentes e limpeza obrigatória de cache privado ao realizar logout.

## Goals / Non-Goals

**Goals:**
- Prover endpoint e formulário de solicitação de inclusão com campos mínimos (título, categoria, formato, ano estimado, país).
- Implementar checagem de similaridade trigram (`pg_trgm` >= 0.35) para detecção proativa de duplicatas com feedback visual.
- Integrar a obra provisória imediatamente na biblioteca do usuário solicitante com badge `Provisório`.
- Criar painel `/admin` restrito a `MODERATOR` e `ADMIN` com visualização de solicitações (`PENDENTE`, `EM_ANALISE`, `APROVADA`, `RECUSADA`).
- Implementar fluxo de aprovação que promove a obra ao catálogo oficial e fluxo de recusa com justificativa.
- Implementar trava de campos manuais (`lockedFields`) para blindar edições administrativas contra sobrescrita por provedores externos.
- Disponibilizar `manifest.json` do PWA e Service Worker seguro com cache offline recente e expurgo no logout.

**Non-Goals:**
- Criação de novos players ou leitores de mídia incorporados (Princípio inegociável).
- Mutação de dados ou edição de biblioteca offline (fora do MVP, explicitado na seção 17.2).
- Servidor remoto dedicado de Web Push com custo financeiro (Princípio IV: Custo Zero).
- Aplicativos nativos para iOS (App Store) ou Android (Google Play).

## Decisions

1. **Ciclo de Vida da Obra Provisória na Biblioteca do Usuário**
   - **Escolha:** Obra provisória entra imediatamente na biblioteca do solicitante com badge `Provisório` (`validationStatus: 'PROVISIONAL'`). Ao ser aprovada pelo admin, a obra é promovida a `'VALIDATED'`/`'OFFICIAL'` no catálogo geral sem descontinuar o progresso ou diário do usuário.
   - **Alternativas consideradas:** Manter solicitação apenas como ticket desacoplado sem criar item na biblioteca; ou publicar obra provisória no catálogo global para todos os usuários.
   - **Justificativa:** Atende ao princípio de soberania e fluidez do usuário: o usuário não precisa esperar dias pela moderação para começar a anotar seus episódios/capítulos.

2. **Detecção de Duplicatas com pg_trgm e Limiar Heurístico de 0.35**
   - **Escolha:** Consulta de similaridade trigram no PostgreSQL via `similarity(title, :title) >= 0.35` ou cálculo de distância Levenshtein/trigram no repositório. Retorna sugestões na interface. Se o usuário clicar "Esta é uma obra diferente", a submissão é liberada normalmente.
   - **Alternativas consideradas:** Bloqueio rígido por colisão exata ou limiar alto; ou nenhuma validação prévia.
   - **Justificativa:** Segue estritamente a Seção 15.3 do documento mestre: "Detectar possíveis duplicatas antes do envio, mostrar resultados próximos, não bloquear automaticamente quando a correspondência não for conclusiva".

3. **RBAC e Blindagem de Campos Manuais**
   - **Escolha:** Adicionar `role: 'USER' | 'MODERATOR' | 'ADMIN'` à entidade de usuário, protegendo `/api/v1/admin/*` com guard NestJS. Na entidade de mídia, campos manuais alterados pelo admin recebem registro em `lockedFields: string[]`. Durante sincronização externa (`syncFromProvider`), campos presentes em `lockedFields` são ignorados.
   - **Alternativas consideradas:** Criar tabela separada de overrides de campos.
   - **Justificativa:** Simples, atômico, compatível com o Prisma e atende diretamente a Seção 8.5 do documento mestre.

4. **PWA Offline e Limpeza no Logout**
   - **Escolha:** Manifesto PWA nativo via `apps/web/src/app/manifest.ts` e Service Worker em `apps/web/public/sw.js` com cache *Stale-While-Revalidate* para dados estáticos e consultas recentes. Ao disparar logout, a aplicação envia mensagem `PURGE_PRIVATE_CACHE` para o Service Worker esvaziar todos os caches sensíveis.
   - **Alternativas consideradas:** Sem Service Worker (apenas manifest); ou cache irrestrito sem expurgo.
   - **Justificativa:** Garante conformidade total com a Seção 17.2: "Consulta de dados recentes em cache, sem edição offline no MVP, limpeza no logout e proteção contra exposição em dispositivos compartilhados".

## Risks / Trade-offs

- **[Risco]** Usuário tentar enviar spam de solicitações duplicadas → **Mitigação:** Validação de duplicidade na API que rejeita submissões idênticas pendentes do mesmo usuário e limitação de taxa (rate limiting defensivo).
- **[Risco]** Cache do PWA expor dados de um usuário para outro em máquina compartilhada após logout → **Mitigação:** O handler de logout invoca a limpeza do `caches.delete()` de todos os caches privados antes do redirecionamento.
- **[Risco]** Provedores externos sobrescreverem correções de sinopse ou títulos corrigidos pelo admin → **Mitigação:** Verificação obrigatória de `lockedFields` em qualquer rotina de ingestão.

## Migration Plan

1. Adicionar campos opcionais/padrão nos modelos compartilhados (`role`, `lockedFields`, `validationStatus`).
2. Adicionar repositórios in-memory / Prisma para `InclusionRequest`.
3. Criar rotas `/api/v1/provisional/*` e `/api/v1/admin/*`.
4. Adicionar rotas web `/items/request` e `/admin`.
5. Registrar Service Worker e manifesto PWA.
6. Não há migração destrutiva de dados pré-existentes.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/provisional.ts` — DTOs, interfaces e enums de papéis e solicitações.
- `[MODIFY]` `packages/shared/src/index.ts` — Exportação do novo módulo `provisional.ts`.
- `[CREATE]` `apps/api/src/admin/admin.controller.ts` — Endpoints REST para painel administrativo.
- `[CREATE]` `apps/api/src/admin/admin.service.ts` — Regras de negócio de moderação e proteção de campos.
- `[CREATE]` `apps/api/src/admin/admin.module.ts` — Módulo administrativo NestJS.
- `[CREATE]` `apps/api/src/provisional/provisional.controller.ts` — Endpoints de submissão e checagem de similaridade.
- `[CREATE]` `apps/api/src/provisional/provisional.service.ts` — Regras de similaridade trigram e vínculo com biblioteca.
- `[CREATE]` `apps/api/src/provisional/provisional.repository.ts` — Repositório de solicitações e obras provisórias.
- `[CREATE]` `apps/api/src/provisional/provisional.module.ts` — Módulo de obras provisórias NestJS.
- `[MODIFY]` `apps/api/src/app.module.ts` — Registro dos módulos `AdminModule` e `ProvisionalModule`.
- `[MODIFY]` `apps/web/src/server/container.ts` — Registro de instâncias para os novos serviços e controllers.
- `[CREATE]` `apps/web/src/app/manifest.ts` — Manifesto oficial PWA do Next.js.
- `[CREATE]` `apps/web/public/sw.js` — Service Worker com cache offline e expurgo no logout.
- `[CREATE]` `apps/web/src/components/pwa-provider.tsx` — Registro do Service Worker no cliente.
- `[CREATE]` `apps/web/src/app/admin/page.tsx` — Página do painel de administração e moderação.
- `[CREATE]` `apps/web/src/app/items/request/page.tsx` — Formulário de solicitação de inclusão com alerta trigram.
- `[CREATE]` `tests/provisional-admin-pwa.test.mjs` — Suíte de testes automatizados cobrindo TR-001 a TR-012.

## Data Model

```typescript
export const UserRole = Object.freeze({
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const);
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RequestStatus = Object.freeze({
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADA: 'APROVADA',
  RECUSADA: 'RECUSADA',
} as const);
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface InclusionRequest {
  id: string;
  userId: string;
  username: string;
  title: string;
  originalTitle?: string;
  category: string;
  format: string;
  releaseYear?: number;
  country: string;
  synopsis?: string;
  status: RequestStatus;
  rejectionReason?: string;
  provisionalMediaItemId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Contracts

- `POST /api/v1/provisional/similarity-check`: Entrada `{ title: string }` &rarr; Saída `{ similarItems: Array<{ id: string, title: string, category: string, similarity: number }> }`.
- `POST /api/v1/provisional/requests`: Entrada `CreateInclusionRequestDto` &rarr; Saída `InclusionRequest` + adição automática à biblioteca pessoal.
- `GET /api/v1/provisional/requests/my`: Retorna lista de solicitações enviadas pelo usuário autenticado.
- `GET /api/v1/admin/requests`: Retorna lista paginada/filtrada de solicitações (restrito a `MODERATOR`/`ADMIN`).
- `PATCH /api/v1/admin/requests/:id/moderate`: Entrada `{ status: 'APROVADA' | 'RECUSADA', rejectionReason?: string, lockedFields?: string[] }` &rarr; Saída `InclusionRequest` atualizada.
- `PATCH /api/v1/admin/items/:id/lock-fields`: Entrada `{ lockedFields: string[] }` &rarr; Atualiza proteção manual do catálogo.

## Research

- **Zero Cost (Princípio IV):** O PWA não utiliza push servers externos pagos nem infraestrutura de nuvem adicional. Os recursos offline residem no browser do cliente (`CacheStorage` e `ServiceWorker`).
- **Soberania do Usuário (Princípio V):** Dados e solicitações do usuário são de fácil rastreio e acompanhamento com total transparência de motivos de recusa.

