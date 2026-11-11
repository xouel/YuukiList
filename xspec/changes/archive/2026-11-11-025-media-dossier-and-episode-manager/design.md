# Design: 025-media-dossier-and-episode-manager

## Context

A rota `/items/[slug]` em `apps/web/src/app/items/[slug]/page.tsx` e o componente `ItemDetailView` em `apps/web/src/components/catalog/item-detail-view.tsx` mantinham a paleta visual legada com tons de ciano (`#06B6D4`) e azul escuro (`#181C2B`), destoando do ecossistema Asian Editorial (`#121115`, `#1A1820`, `#201D28`, `#2B2735`, `#E05347`, `#F4EFEA`) já adotado na Home Hub (`/`) e na Biblioteca (`/library`).
Além da discrepância de cores, a interface anterior apresentava uma estrutura plana sem hierarquia editorial para obras de grande porte:
1. Ausência de faixa resumida de métricas de alto impacto (Média Global, Contagem de Temporadas/Volumes, Membros na comunidade e Duração média);
2. Console pessoal fragmentado, sem barra visual de progresso proporcional e sem cálculo intuitivo de tempo total assistido;
3. Ausência de um gerenciador de episódios estruturado por temporadas/arcos com ação em lote ("Marcar Temporada Toda") e marcação direta por episódio;
4. Ausência de painéis laterais dedicados para distribuição analítica de notas (histograma 10 a 6 estrelas), provedores oficiais onde assistir/ler de forma legal e créditos da equipe técnica.

Esta mudança estabelece o layout em grade assimétrica 8+4 (8 colunas para conteúdo principal e episódios, 4 colunas para sidebar analítica), mantendo total interoperabilidade com os contratos de API existentes (`CatalogApiClient`, `LibraryApiClient`, `DiaryApiClient`, `RelationsApiClient`) sem quebras de compatibilidade.

## Goals / Non-Goals

**Goals:**
- Eliminar 100% dos resíduos de ciano (`#06B6D4`) e azul escuro (`#181C2B`) da rota `/items/[slug]`, adotando a paleta mineral Asian Editorial.
- Implementar o Hero Editorial com Capa ampliada, selos de ranking/status e a faixa de 4 métricas editoriais formatadas.
- Construir o Console Pessoal de Acompanhamento com seleção de status, nota (1-10), tempo assistido estimado, barra de progresso visual proporcional e botão de incremento rápido `+ +1 Ep/Cap` com alvo tátil mínimo de 44x44px (WCAG 2.2 AA).
- Construir o Gerenciador de Episódios com abas interativas de temporadas/arcos, botão de ação em lote "Marcar Temporada Toda" e cards individuais de episódio com alternância de visto/não visto.
- Construir a Barra Lateral Analítica com histograma de notas da comunidade, métricas de engajamento (*Assistindo Agora*, *Completaram*, *Abandonaram*), chips de gêneros/temas, plataformas oficiais onde assistir com links seguros (`rel="noopener noreferrer"`) e créditos de estúdios.
- Manter total conformidade com a suíte de testes existente (229+ testes) e adicionar suíte TDD específica em `tests/media-dossier-and-episode-manager.test.mjs`.

**Non-Goals:**
- Reprodução ou streaming de vídeo ou leitor interno de mangá (YuukiList é estritamente plataforma de catálogo e acompanhamento).
- Alteração no esquema de banco de dados relacional ou criação de novos endpoints backend nesta fatia (as operações utilizam os contratos existentes de biblioteca e diário).
- Substituição da seção de obras relacionadas da franquia (`RelatedWorksSection`), que continuará integrada ao final do dossiê.

## Decisions

1. **Arquitetura de Componentes Desacoplada para o Dossiê**
   - **Escolha:** Fragmentar o dossiê em submódulos coesos em `apps/web/src/components/catalog/`:
     - `DossierMetricsStrip`: Faixa de 4 métricas de alto impacto.
     - `PersonalTrackingConsole`: Console pessoal de acompanhamento e progresso.
     - `EpisodeManager`: Gerenciador de episódios com abas de temporadas e marcação rápida.
     - `DossierSidebar`: Coluna lateral com histograma de notas, contadores de engajamento, gêneros, provedores oficiais e estúdios.
     - `ItemDetailView`: Orquestrador central em grid 8+4, unificando sinopse, ficha técnica, franquia e histórico do diário.
   - **Alternativas consideradas:** Manter tudo em um único arquivo monolítico `item-detail-view.tsx` de 1200+ linhas.
   - **Justificativa:** A modularização melhora a legibilidade, facilita testes unitários isolados, previne regressões e atende aos princípios de manutenibilidade da constituição.

2. **Geração Determinística de Episódios e Histograma no Cliente**
   - **Escolha:** Como os itens do catálogo possuem `totalEpisodes`, `totalChapters`, `releaseYear` e `category`, o frontend gera deterministicamente a grade de temporadas e episódios correspondente quando não houver lista explícita vinda do backend. Para a distribuição de notas, o histograma é gerado deterministicamente em torno do `rating`/`score` da obra (distribuição normal balanceada ponderada).
   - **Alternativas consideradas:** Requerer novas tabelas de episódios e migração de banco no backend.
   - **Justificativa:** Permite entregar densidade visual de produto de forma imediata sem impactar a arquitetura backend consolidada, garantindo total custo zero e performance pura no cliente.

3. **Sincronização Atômica de Marcação em Lote e Episódios Individuais**
   - **Escolha:** O botão "Marcar Temporada Toda" calcula o número do último episódio da temporada selecionada e executa `libraryApi.updateItem(itemId, { progress: targetEpisode })`, disparando adicionalmente um evento de nota/histórico em `diaryApi.createEvent` indicando a conclusão da temporada.
   - **Alternativas consideradas:** Enviar dezenas de requisições HTTP individuais para cada episódio.
   - **Justificativa:** Preserva a integridade da rede, evita esgotamento de conexões e atualiza a barra de progresso e o status da biblioteca de forma atômica e otimista.

4. **Diretriz de Design: Ausência Estrita de Emojis e Paleta Mineral**
   - **Escolha:** Todos os ícones, badges e indicadores são renderizados exclusivamente via SVG vetorial inline e glifos tipográficos neutros (ex.: traços, barras e rótulos textuais claros). Qualquer caractere emoji ou símbolo ilustrativo é estritamente proibido.
   - **Alternativas consideradas:** Usar emojis para representar temporadas, diário, coração e estrelas.
   - **Justificativa:** Conformidade obrigatória com as regras do usuário e garantia de estética Asian Editorial comercial sóbria e refinada.

## Risks / Trade-offs

- **[Risco]** Itens de volume único (como filmes ou oneshots) quebrarem a navegação por abas de temporada.
  - **Mitigação:** O `EpisodeManager` detecta categorias de volume único (`FILME`) ou obras com apenas 1 episódio e renderiza um layout simplificado de unidade única, sem abas desnecessárias.
- **[Risco]** Discrepância entre o progresso da biblioteca e a temporada ativa exibida.
  - **Mitigação:** Ao carregar a tela, a aba da temporada correspondente ao progresso atual do usuário é selecionada por padrão automaticamente (ex.: se o usuário está no ep. 30, abre automaticamente na Temporada 2).
- **[Risco]** Sobrecarga de eventos de histórico no diário ao avançar múltiplos episódios.
  - **Mitigação:** A ação em lote consolida o avanço em uma única chamada de biblioteca e um registro sumarizado no diário.

## Migration Plan

- **Deploy:** A alteração ocorre puramente no frontend web (`apps/web`), sem requerer migração de banco de dados relacional ou scripts de atualização de schema.
- **Rollback:** Caso necessário, a versão anterior de `item-detail-view.tsx` pode ser restaurada via git sem corromper os dados de biblioteca armazenados, visto que os endpoints de API permanecem inalterados.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/app/items/[slug]/page.tsx` — Eliminação de cores legadas, loaders com spinner mineral, estados de erro elegantes e retorno fluido.
- `[MODIFY]` `apps/web/src/components/catalog/item-detail-view.tsx` — Reestruturação do layout para a grade assimétrica 8+4, incorporando os novos componentes do dossiê e preservando acessibilidade e ficha técnica.
- `[CREATE]` `apps/web/src/components/catalog/dossier-metrics-strip.tsx` — Faixa de 4 métricas editoriais (Média Global, Temporadas/Volumes, Membros e Duração média).
- `[CREATE]` `apps/web/src/components/catalog/personal-tracking-console.tsx` — Console de acompanhamento com status, nota de 1 a 10, tempo assistido, barra de progresso visual e botão de incremento rápido com alvo de 44x44px.
- `[CREATE]` `apps/web/src/components/catalog/episode-manager.tsx` — Gerenciador de episódios com abas dinâmicas de temporadas/arcos, ação em lote e marcação tátil por episódio.
- `[CREATE]` `apps/web/src/components/catalog/dossier-sidebar.tsx` — Sidebar com histograma de distribuição de notas, contadores de comunidade, gêneros/temas, plataformas oficiais com links seguros e estúdios de produção.
- `[CREATE]` `tests/media-dossier-and-episode-manager.test.mjs` — Suíte de testes automatizados TDD validando 100% dos cenários normativos.

## Data Model

Entidades e estruturas tipadas em frontend para suporte ao Dossiê da Obra:

```typescript
export interface EpisodeItemDto {
  number: number;
  seasonNumber: number;
  title: string;
  durationMinutes: number;
  airDate?: string | null;
  rating?: number | null;
  synopsis?: string | null;
}

export interface SeasonGroupDto {
  seasonNumber: number;
  title: string;
  episodesCount: number;
  startEpisode: number;
  endEpisode: number;
  episodes: EpisodeItemDto[];
}

export interface RatingDistributionDto {
  score: number;
  totalVotes: number;
  histogram: Array<{
    stars: number;
    label: string;
    percentage: number;
    count: number;
  }>;
  communityStats: {
    watchingCount: number;
    completedCount: number;
    droppedCount: number;
  };
}

export interface StreamingProviderDto {
  id: string;
  name: string;
  type: 'STREAMING' | 'MANGA_READER';
  url: string;
  badgeText: string;
}

export interface ProductionCreditDto {
  role: string;
  name: string;
}
```

## Contracts

### Contrato de Marcação de Episódio Individual e em Lote
- **Atualização de Progresso na Biblioteca:**
  - Método: `PUT /api/v1/library/items/:mediaItemId`
  - Payload: `{ progress: number, status?: PersonalStatus }`
  - Resposta de Sucesso: `200 OK` com `LibraryItemDto` atualizado.
  - Comportamento de Erro: Rollback otimista no estado do frontend com notificação discreta de erro.
- **Registro no Diário:**
  - Método: `POST /api/v1/diary/events`
  - Payload: `{ mediaItemId: string, episodeNumber?: number, type: 'PROGRESS' | 'NOTE', note?: string }`
  - Resposta de Sucesso: `201 Created` com `HistoryEventDto`.

## Research

- **Análise de Custo Zero e Soberania:**
  - A geração determinística de dados editoriais no cliente utiliza exclusivamente funções de hash e arredondamento em JavaScript, sem consumo de APIs de IA ou serviços pagos de terceiros.
  - A renderização de ícones utiliza SVG puro inline, sem dependência de CDNs externas ou pacotes proprietários.
- **Plano de Saída:**
  - Caso o backend passe a expor metadados de episódios por temporada diretamente via banco de dados no futuro, os componentes `EpisodeManager` e `DossierSidebar` receberão as propriedades via props sem alteração em sua estrutura de apresentação.
