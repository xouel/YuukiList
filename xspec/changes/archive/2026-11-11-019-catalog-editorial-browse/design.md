# Design: 019-catalog-editorial-browse

## Context

A tela de catálogo (`/`) foi concebida inicialmente com múltiplos controles concorrentes (barra de busca estendida, 7 abas de categoria e 4 caixas suspensas de filtro na mesma dobra visual), além de cards de mídia com cores neon dispersas e colisões de strings entre a lista de gêneros e o status da obra (ex.: `"Suspense, Dr...Desconhecida"`). Com a consolidação da fundação Asian Editorial na fatia R18 (paleta nanquim `#121115`, superfície `#1A1820`, bordas `#2B2735` e acento `#E05347`), esta mudança projeta a nova arquitetura de apresentação e controle do catálogo, organizando os filtros em duas camadas hierárquicas e redesenhando o `MediaCard` para erradicar sobreposições e acomodar taxonomia editorial.

## Goals / Non-Goals

**Goals:**
- Consolidar a área de controle do catálogo em uma faixa primária limpa (busca e categorias principais) com painel expansível/drawer elegante para "Mais Filtros" (país de origem, temas, status e ordenação).
- Erradicar colisão e truncamentos nos cards de mídia (`MediaCard`), alocando slots dedicados para gêneros (rodapé com separadores pontuais) e status de publicação (badge sutil flutuante sobre a capa).
- Desambiguar termos de status da obra (`Em Lançamento`, `Concluída`, `Hiato`, `Cancelada`) e padronizar categorias no plural com paleta editorial bimodal/discreta (Audiovisual em ocre/lavanda e Impresso em terracota).
- Alternar visualmente o botão de ação rápida do card entre `+ Adicionar` e `✓ Na Biblioteca`.

**Non-Goals:**
- Não reestruturar as telas de Biblioteca Pessoal (`/library`), Calendário (`/calendar`) ou Perfil (`/profile`), que são tratadas nas fatias subsequentes (R20, R21, R22).
- Não alterar schemas de banco de dados ou contratos de endpoints REST (a API `/api/v1/catalog/items` já suporta todos os parâmetros necessários).

## Decisions

1. **Faixa Primária com Drawer Colapsável para "Mais Filtros"**
   - **Escolha:** Manter a busca com debounce e as abas de categoria principais em uma barra primária unificada, adicionando um botão de alternância com ícone de ajuste ("Mais Filtros") que desdobra um painel com os filtros secundários (país, temas, status, ordenação e botão limpar).
   - **Alternativas consideradas:**
     - Modal flutuante de filtros: descartado por interromper o fluxo visual de navegação do catálogo no desktop.
     - Sidebar fixa lateral de filtros: descartada por comprimir a grade de cards e quebrar a simetria com a navegação global.
   - **Justificativa:** Reduz a carga cognitiva inicial a um nível editorial acolhedor, mantendo todos os poderes de filtragem avançada a um único clique de distância.

2. **Posicionamento do Status da Obra sobre a Capa (Anti-Colisão)**
   - **Escolha:** Mover o status da obra (`Em Lançamento`, `Concluída`, `Hiato`) para a camada da capa no canto inferior esquerdo como uma pílula sutil com efeito vidro escuro (`bg-black/70 backdrop-blur border border-white/10 text-[10px]`), liberando a linha do rodapé do card para exibir exclusivamente os gêneros formatados com bullet (`Drama • Mistério`) com 100% da largura.
   - **Alternativas consideradas:**
     - Reduzir tamanho da fonte no rodapé: descartada porque palavras longas ainda quebravam em telas menores.
     - Múltiplas linhas no rodapé: descartada porque desnivelava a altura dos cards na grade responsiva.
   - **Justificativa:** Elimina 100% das chances de colisão de strings, garante uniformidade visual de altura nos cards e oferece leitura rápida do status logo na imagem.

3. **Badges de Categoria Editoriais Bimodais**
   - **Escolha:** Substituir as 6 cores neon distintas por tons editoriais com harmonia cromática: Audiovisual (Doramas e Filmes em ocre `#D4A373`, Animes em lavanda `#9D8DF1`) e Impresso (Mangás, Manhwas e Manhuas em terracota `#D97757`), todos com fundos translúcidos e bordas finas.
   - **Alternativas consideradas:**
     - Paleta 100% monocromática cinza: descartada para não comprometer a distinção rápida entre mídias de vídeo e leitura.
   - **Justificativa:** Equilibra sofisticação visual sem perder a riqueza de sinalização essencial para catálogos asiáticos mistos.

## Risks / Trade-offs

- **[Risco]** Usuários em telas ultrapequenas (< 360px) terem quebras na barra de categorias → **Mitigação:** Container de abas com rolagem horizontal suave (`overflow-x-auto scrollbar-none`) e indicadores táteis confortáveis.
- **[Risco]** Obras com muitos gêneros estrapolarem a largura → **Mitigação:** Limitar a amostragem a 3 gêneros principais e aplicar `truncate` CSS nativo com `title` acessível com a lista completa.

## Migration Plan

- Não requer migrações de dados ou deploys de banco.
- Alteração restrita à camada de apresentação React em `apps/web/src/components/catalog/`.
- Rollback imediato via Git se necessário.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/components/catalog/media-card.tsx` — Nova paleta editorial bimodal, status fixado sobre a capa, rodapé anti-colisão e alternância do botão `Na Biblioteca`.
- `[MODIFY]` `apps/web/src/components/catalog/filter-bar.tsx` — Barra primária condensada e drawer colapsável "Mais Filtros".
- `[MODIFY]` `apps/web/src/components/catalog/catalog-view.tsx` — Integração harmônica da nova barra de controles e sincronização de estado.
- `[CREATE]` `tests/catalog-editorial-browse.test.mjs` — Testes de interface e validação de contratos de controle.

## Data Model

Utiliza os DTOs existentes de `packages/shared`:
- `MediaItemSummaryDto`: id, slug, title, originalTitle, category, publicationStatus, coverUrl, genres.
- `CatalogQueryDto`: q, category, status, country, theme, sortBy, page, limit.
- `PublicationStatus`: `EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`, `HIATO`, `DESCONHECIDA`.

## Contracts

- **Interface de Filtros (`FilterBarProps`)**:
  - `selectedCategory?: Category`
  - `selectedStatus?: PublicationStatus`
  - `selectedCountry?: string`
  - `selectedTheme?: string`
  - `sortBy?: CatalogSortBy`
  - `onSelectCategory`, `onSelectStatus`, `onSelectCountry`, `onSelectTheme`, `onSelectSortBy`, `onClearFilters`
  - `totalResults?: number`
- **Ação Rápida (`MediaCardProps`)**:
  - `item: MediaItemSummaryDto`
  - `onNavigate?: (slug: string) => void`
  - `onQuickAdd?: (item: MediaItemSummaryDto) => Promise<void> | void`

## Research

- **Custo Zero:** A implementação utiliza puramente utilitários Tailwind CSS já instalados e hooks nativos do React 19 (`useState`, `useCallback`), sem introduzir nenhuma nova dependência no bundle do frontend.
- **Plano de Saída:** Código 100% padronizado e desacoplado, sem frameworks proprietários de animação ou componentes engessados.

