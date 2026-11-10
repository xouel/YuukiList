# Design: 013-media-relations-and-franchises

## Context

O YuukiList já possui catálogo consolidado com 6 categorias (DORAMA, FILME, ANIME, MANGA, MANHWA, MANHUA), biblioteca pessoal isolada por usuário, histórico cronológico de consumo e diário contextual com proteção anti-spoiler. No entanto, mídias transmídia de um mesmo universo (como *The Untamed* em dorama e *Mo Dao Zu Shi* em anime/manhua) figuram atualmente de forma desarticulada, sem links explícitos de adaptação, prequel, sequel ou visão consolidada de universo. Este design estabelece a camada de relacionamentos tipados e a visualização de franquias com respeito absoluto ao Princípio do Desacoplamento e Independência de Progresso do Documento Mestre.

## Goals / Non-Goals

**Goals:**
- Prover modelo de dados e enum para relacionamentos explícitos (`ADAPTATION`, `PREQUEL`, `SEQUEL`, `SPIN_OFF`, `SIDE_STORY`, `ALTERNATIVE_VERSION`, `RELATED`).
- Algoritmo de inversão semântica simétrica (ex: `PREQUEL` inverso gera `SEQUEL`, `ADAPTATION` conecta mutuamente).
- Estrutura de Franquia/Universo com ordem de lançamento (`releaseOrder`) e cronológica (`chronologicalOrder`).
- Seção visual "Obras Relacionadas & Adaptações" na página de detalhes da obra (`/items/:slug`).
- Página dedicada de Franquia/Universo (`/franchises/:slug`) no tema Dark Editorial com alternância interativa de ordens de visualização.
- Independência estrita de progresso: completar uma obra da franquia nunca altera o progresso das demais.

**Non-Goals:**
- Não permitir mutação pública desregulada de relações por usuários comuns (gestão aberta fica para R16 / moderação).
- Não unificar itens de biblioteca em cascata ou sincronizar status automaticamente entre adaptações.
- Não incorporar player de vídeo ou leitor digital de capítulos (fora do escopo do YuukiList).

## Decisions

1. **Inversão Semântica Simétrica em Tempo de Consulta**
   - **Escolha:** Armazenar uma única direção explícita da relação no repositório e calcular dinamicamente a relação inversa na camada de serviço (`RelationsService`), garantindo integridade referencial sem redundância de registros.
   - **Alternativas consideradas:** Duplicação física de linhas no banco (descartada por risco de descompasso e integridade frágil) ou consulta puramente unilateral (descartada por quebrar a navegação mútua entre mídias).
   - **Justificativa:** Reduz o overhead de armazenamento e simplifica a manutenção dos dados canônicos mantendo paridade bidirecional.

2. **Independência Estrita de Progresso por Obra**
   - **Escolha:** O progresso e status da biblioteca continuam mapeados pela chave estrita `(userId, mediaItemId)`. Ao listar a franquia, o serviço agrega o status pessoal de cada obra individualmente.
   - **Alternativas consideradas:** Unificar o progresso da franquia em um único status consolidado.
   - **Justificativa:** Violação direta da Constituição do YuukiList e da Seção 3.6 do Documento Mestre ("Concluir uma adaptação não conclui automaticamente outra").

3. **Página de Franquia com Alternância Interativa de Linha do Tempo**
   - **Escolha:** Página `/franchises/[slug]` com tabs "Ordem de Lançamento" e "Ordem Cronológica", permitindo ao usuário entender tanto a data de exibição original quanto o fluxo da história.
   - **Alternativas consideradas:** Lista única fixa sem opção de ordenação.
   - **Justificativa:** Enriquecimento significativo da experiência do usuário em universos complexos com filmes, OVAs e prequels.

## Risks / Trade-offs

- **[Risco]** Ausência de relacionamentos em títulos avulsos ou novos → **Mitigação:** Componentes frontend tratam elegantemente o estado vazio, omitindo a seção na página da obra caso não haja obras relacionadas ou franquia vinculada.
- **[Risco]** Consultas de relação sobrecarregarem a renderização da página de detalhes → **Mitigação:** Endpoints REST otimizados com projeção enxuta de campos e in-memory cache nos repositórios locais.

## Migration Plan

- Não aplicável: expansão puramente aditiva sem quebra de schemas existentes.
- Seed inicial de franquias e relações canônicas (*The Untamed / Mo Dao Zu Shi*, *Solo Leveling*, *One Piece*).

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/relations.ts` — Contratos DTOs e enums de relacionamentos e franquias.
- `[MODIFY]` `packages/shared/src/index.ts` — Reexportação de contratos de relações.
- `[CREATE]` `tests/media-relations-franchises.test.mjs` — Suíte de testes automatizados para TR-001 a TR-008.
- `[CREATE]` `apps/api/src/relations/relations.repository.ts` — Persistência em memória de relações e franquias.
- `[CREATE]` `apps/api/src/relations/relations.service.ts` — Inversão semântica e agregação de progresso pessoal.
- `[CREATE]` `apps/api/src/relations/relations.controller.ts` — Endpoints REST `/api/v1/catalog/items/:slug/relations` e `/api/v1/franchises/:slug`.
- `[CREATE]` `apps/api/src/relations/relations.module.ts` — Módulo NestJS de relações.
- `[MODIFY]` `apps/api/src/app.module.ts` — Importação do `RelationsModule`.
- `[MODIFY]` `apps/api/src/index.ts` — Reexportação dos artefatos de relações da API.
- `[CREATE]` `apps/web/src/services/relations-api.client.ts` — Cliente HTTP frontend para relações e franquias.
- `[CREATE]` `apps/web/src/components/relations/related-works-section.tsx` — Seção visual de obras relacionadas na página da obra.
- `[CREATE]` `apps/web/src/components/relations/franchise-view.tsx` — Componente da página de franquia com alternância de ordens.
- `[CREATE]` `apps/web/src/app/franchises/[slug]/page.tsx` — Página Next.js App Router para franquias.
- `[CREATE]` `apps/web/src/app/api/v1/catalog/items/[slug]/relations/route.ts` — Handler Next.js da rota de relações da obra.
- `[CREATE]` `apps/web/src/app/api/v1/franchises/[slug]/route.ts` — Handler Next.js da rota de detalhes da franquia.
- `[MODIFY]` `apps/web/src/components/catalog/item-detail-view.tsx` — Inclusão da seção `RelatedWorksSection`.
- `[MODIFY]` `apps/web/src/server/container.ts` — Registro do `RelationsController` no container web.

## Data Model

```typescript
export type MediaRelationType =
  | 'ADAPTATION'
  | 'PREQUEL'
  | 'SEQUEL'
  | 'SPIN_OFF'
  | 'SIDE_STORY'
  | 'ALTERNATIVE_VERSION'
  | 'RELATED';

export interface MediaRelationDto {
  id: string;
  mediaItemId: string;
  relatedMediaItemId: string;
  relationType: MediaRelationType;
  relatedMedia: {
    id: string;
    slug: string;
    title: string;
    originalTitle?: string;
    category: Category;
    coverUrl: string;
    releaseYear?: number;
    publicationStatus: string;
  };
  userLibraryStatus?: {
    status: PersonalStatus;
    progress: number;
    isFavorite?: boolean;
  };
}

export interface FranchiseItemDto {
  mediaItemId: string;
  slug: string;
  title: string;
  originalTitle?: string;
  category: Category;
  coverUrl: string;
  releaseYear?: number;
  releaseOrder: number;
  chronologicalOrder: number;
  roleInFranchise?: string;
  userLibraryStatus?: {
    status: PersonalStatus;
    progress: number;
    isFavorite?: boolean;
  };
}

export interface FranchiseDto {
  id: string;
  slug: string;
  name: string;
  originalName?: string;
  description?: string;
  items: FranchiseItemDto[];
}
```

## Contracts

- `GET /api/v1/catalog/items/:slug/relations`:
  - Retorna `{ franchise: FranchiseDto | null, relations: MediaRelationDto[] }`
- `GET /api/v1/franchises/:slug`:
  - Retorna `FranchiseDto` com `items` enriquecidos com `userLibraryStatus` caso o usuário esteja autenticado via cookie/bearer token.

## Research

- Conforme Seção 8.9 do Documento Mestre de Contexto: "As relações devem ser explícitas e tipadas. Adaptações permanecem obras independentes. A conclusão de uma obra não conclui automaticamente franquias, adaptações ou obras relacionadas."
- Padrão arquitetural de inversão de relações compatível com modelos canônicos do MyAnimeList, AniList e TVmaze.
