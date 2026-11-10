# Design: 015-profile-stats-and-sharing

## Context

O YuukiList consolida a experiencia de acompanhamento de entretenimento asiatico. Apos a implementacao do calendario integrado e central de notificacoes (R14), a fatia R15 estabelece a pagina `/profile` com agregacao analitica de consumo, o sistema de compartilhamento granular publico (`/share/:token`) e os recursos de soberania de dados e conformidade com a LGPD (exportacao em `JSON`/`CSV` e exclusao definitiva de conta).
A governanca do projeto (`xspec/constitution.md`) exige monólito modular desacoplado, estrita soberania de dados, tipagem TypeScript estrita e custo zero permanente (Princípios I, II, IV, V e VII).

## Goals / Non-Goals

**Goals:**
- Computar e exibir estatisticas consolidadas da biblioteca do usuario: total de concluidos, tempo total estimado de consumo (horas), capitulos/volumes lidos, distribuicao percentual pelas 6 categorias, top generos e paises, e media geral de avaliacoes.
- Renderizar na pagina `/profile` o resumo analitico no tema Dark Editorial e a vitrine de obras favoritas (`♥`).
- Gerar links de compartilhamento publico somente leitura com tokens seguros, prazos de expiracao configuraveis (7, 30 ou 90 dias) e botao de revogacao instantanea.
- Implementar a rota publica `/share/[token]` com mascaramento estrito de notas privadas e spoilers confidenciais.
- Disponibilizar endpoints e botoes para download completo de dados pessoais nos formatos padronizados `JSON` e `CSV`.
- Implementar o fluxo de exclusao definitiva de conta (direito ao esquecimento / LGPD) com confirmacao nominal em duas etapas exigindo a digitacao do `username`.

**Non-Goals:**
- Rede social aberta ou feed de comentarios publicos entre usuarios (fora do MVP).
- Login social com provedores externos via OAuth (fora do MVP).
- Importacao automatizada de historicos externos proprietarios (MyAnimeList / AniList).

## Decisions

1. **Calculo Local de Metricas e Estimativas de Tempo**
   - **Escolha:** Calcular metricas e horas estimadas no proprio servico de perfil no backend sem bibliotecas pesadas de analytics. Estimativas canônicas: Doramas = 1h/ep, Animes = 24min/ep, Filmes = 2h/unidade.
   - **Alternativas consideradas:** Delegar analytics para servicos externos (Mixpanel, Google Analytics, PostHog).
   - **Justificativa:** Mantem a soberania total de dados do usuario (Princípio V) e garante a meta de Custo Zero permanente (Princípio IV) sem envio de telemetria a terceiros.

2. **Segurança e Isolamento em Links Compartilhados (`/share/:token`)**
   - **Escolha:** Geracao de tokens criptograficos aleatorios unicos (`crypto.randomBytes(16).toString('hex')`) associados a uma data de expiracao e flag `isRevoked`. A rota publica filtra estritamente o payload eliminando notas pessoais e campos confidenciais antes do envio.
   - **Alternativas consideradas:** Expor perfis publicos indexados diretamente pelo username (ex: `/u/username`).
   - **Justificativa:** Respeita o principio de Privacidade por Padrao (Princípio VII). O usuario decide explicitamente com quem e por quanto tempo compartilhar seu perfil.

3. **Confirmação no Modal para Exclusão de Conta (LGPD)**
   - **Escolha:** Confirmação via modal de segurança com checkbox de consentimento explícito ("Entendo que meus dados serão permanentemente apagados") antes da liberação da ação definitiva de exclusão.
   - **Alternativas consideradas:** Exigir digitação do username ou botão direto sem checkbox.
   - **Justificativa:** Atende à decisão do usuário no Clarification Gate (Opção B), garantindo consentimento inequívoco e proteção contra cliques involuntários sem atrito excessivo.

## Risks / Trade-offs

- **[Risco]** Usuario com biblioteca vazia acessar o perfil e causar quebras por divisao por zero no calculo de porcentagens e médias. → **Mitigacao:** Tratamento seguro com valores padrão (0 para porcentagens, `null` para média de avaliacoes quando nao ha notas atribuidas).
- **[Risco]** Vazamento de anotacoes intimas ou spoilers em links publicos compartilhados. → **Mitigacao:** DTO especifico `SharedProfileViewDto` que nem sequer possui os campos de `notes` ou `spoiler` em sua interface.

## Migration Plan

- Modulo de perfil e compartilhamento desacoplado; nao altera a estrutura de dados existente da biblioteca e catalogo.
- Rollback: Reverter o deploy sem impacto na integridade da biblioteca pessoal.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/profile.ts` — DTOs, interfaces e contratos de estatisticas, compartilhamento e exportacao.
- `[MODIFY]` `packages/shared/src/index.ts` — Exportacao do modulo `profile.ts`.
- `[CREATE]` `apps/api/src/profile/profile.repository.ts` — Repositorio em memoria para links de compartilhamento e historico de expurgo.
- `[CREATE]` `apps/api/src/profile/profile.service.ts` — Servico de computacao de estatisticas, links temporarios, exportacao e exclusao LGPD.
- `[CREATE]` `apps/api/src/profile/profile.controller.ts` — Endpoints REST para perfil, compartilhamento e exportacao.
- `[CREATE]` `apps/api/src/profile/profile.module.ts` — Modulo NestJS de perfil e compartilhamento.
- `[MODIFY]` `apps/api/src/app.module.ts` — Registro do `ProfileModule`.
- `[MODIFY]` `apps/api/src/index.ts` — Exportacao do modulo e servicos de perfil.
- `[CREATE]` `apps/web/src/services/profile-api.client.ts` — Cliente HTTP para a API de perfil, compartilhamento e exportacao.
- `[CREATE]` `apps/web/src/components/profile/profile-stats.tsx` — Componente de metricas e barras analiticas.
- `[CREATE]` `apps/web/src/components/profile/favorites-showcase.tsx` — Vitrine de obras favoritas no perfil.
- `[CREATE]` `apps/web/src/components/profile/share-dialog.tsx` — Modal de geracao, expiracao e revogacao de links.
- `[CREATE]` `apps/web/src/components/profile/delete-account-dialog.tsx` — Modal de exclusao de conta LGPD em duas etapas.
- `[CREATE]` `apps/web/src/app/profile/page.tsx` — Pagina completa do perfil do usuario.
- `[CREATE]` `apps/web/src/app/share/[token]/page.tsx` — Pagina publica somente leitura de perfil compartilhado.
- `[CREATE]` `apps/web/src/app/api/v1/profile/stats/route.ts` — Route handler de estatisticas.
- `[CREATE]` `apps/web/src/app/api/v1/profile/share-links/route.ts` — Route handler de gerenciamento de links.
- `[CREATE]` `apps/web/src/app/api/v1/profile/share-links/[id]/route.ts` — Route handler de revogacao de links.
- `[CREATE]` `apps/web/src/app/api/v1/share/[token]/route.ts` — Route handler para consulta publica de link compartilhado.
- `[CREATE]` `apps/web/src/app/api/v1/profile/export/json/route.ts` — Route handler de exportacao JSON.
- `[CREATE]` `apps/web/src/app/api/v1/profile/export/csv/route.ts` — Route handler de exportacao CSV.
- `[CREATE]` `apps/web/src/app/api/v1/profile/account/route.ts` — Route handler de exclusao de conta LGPD.
- `[MODIFY]` `apps/web/src/server/container.ts` — Registro do `profileController` e `profileService`.
- `[CREATE]` `tests/profile-sharing-lgpd.test.mjs` — Suite de testes automatizados com cobertura dos 11 cenarios normativos.

## Data Model

```typescript
export interface ProfileStatsDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  totalCompleted: number;
  totalWatchingOrReading: number;
  totalPlanToWatchOrRead: number;
  totalEstimatedHours: number;
  totalChaptersRead: number;
  totalVolumesRead: number;
  averageRating: number | null;
  categoryDistribution: Record<string, { count: number; percentage: number }>;
  topGenres: Array<{ genre: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  favorites: Array<{
    mediaItemId: string;
    title: string;
    slug: string;
    category: string;
    coverUrl: string;
    rating?: number | null;
  }>;
}

export interface ShareLinkDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  shareScope: 'FULL_LIBRARY' | 'FAVORITES_ONLY';
  publicUrl: string;
}

export interface SharedProfileViewDto {
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  expiresAt: string;
  stats: ProfileStatsDto;
  items: Array<{
    mediaItemId: string;
    title: string;
    slug: string;
    category: string;
    coverUrl: string;
    status: string;
    progress: number;
    isFavorite: boolean;
    rating?: number | null;
  }>;
}
```

## Contracts

- `GET /api/v1/profile/stats`
  - Resposta: `ProfileStatsDto`
- `POST /api/v1/profile/share-links`
  - Corpo: `{ expirationDays: 7 | 30 | 90, shareScope?: string }`
  - Resposta: `ShareLinkDto`
- `GET /api/v1/profile/share-links`
  - Resposta: `{ links: ShareLinkDto[] }`
- `DELETE /api/v1/profile/share-links/:id`
  - Resposta: `{ success: true }`
- `GET /api/v1/share/:token`
  - Resposta: `SharedProfileViewDto`
- `GET /api/v1/profile/export/json`
  - Resposta: `ExportDataDto` (Content-Disposition: attachment)
- `GET /api/v1/profile/export/csv`
  - Resposta: Texto tabular CSV (Content-Disposition: attachment)
- `DELETE /api/v1/profile/account`
  - Corpo: `{ confirmedUsername: string }`
  - Resposta: `{ success: true, message: string }`

## Research

- **Meta R$ 0 / Custo Zero Permanente (Princípio IV):** Agregacoes estatisticas sao processadas puramente em TypeScript na memoria ou via indices do banco de dados existente. Nao ha servico pago de telemetria ou analytics.
- **Tokens Criptograficos Seguros:** Geracao via modulo nativo `node:crypto` (`randomBytes(16).toString('hex')`), oferecendo 128 bits de entropia sem colisao ou necessidade de dependencias externas.
- **Conformidade LGPD (Art. 18):** Os endpoints de exportacao garantem portabilidade dos dados em formato estruturado (JSON e CSV), enquanto o endpoint de exclusao de conta implementa o direito a eliminacao dos dados tratados com o consentimento do titular.
