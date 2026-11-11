# Design: 022-editorial-profile-showcase

## Context

A tela de Perfil (`/profile`) apresenta a identidade do usuário, suas estatísticas de consumo cultural e opções de compartilhamento e soberania de dados (LGPD). Atualmente, a página sofre de uma hierarquia invertida: renderiza no topo grandes blocos e tabelas de métricas analíticas (`ProfileStats`) com gráficos e paleta tech (gradientes ciano, azul e violeta), enquanto a vitrine de obras favoritas (`FavoritesShowcase`), que sintetiza a identidade e o gosto do usuário, fica empurrada para o rodapé da página. Além disso, os cards de favoritos utilizam proporção 3:4 genérica em vez da proporção editorial 2:3, o avatar usa um gradiente neon e os botões de ação e exportação utilizam estilos descompassados da identidade Asian Editorial.

## Goals / Non-Goals

**Goals:**
- Inverter a hierarquia visual em `/profile`, posicionando a **Vitrine de Favoritos** (`FavoritesShowcase`) como o primeiro bloco de conteúdo principal logo abaixo do cabeçalho de identificação do usuário.
- Reformular os cards de favoritos para a **proporção editorial 2:3** com moldura mineral, títulos em serifa moderna, nota em selo dark gold (`★ 9.5`) e coração carmim `#E05347`.
- Compactar as **Métricas Analíticas** (`ProfileStats`): reunir os 4 indicadores-chave em grade elegante e refinada e apresentar a distribuição por categorias em barras horizontais proporcionais com tons minerais/editoriais.
- Redesenhar o **Cabeçalho de Identificação**: monograma tipográfico com acento carmim `#E05347`, título em serifa, rótulos humanizados de privacidade e botões estilizados no padrão Asian Editorial.
- Harmonizar a seção de **Soberania de Dados & LGPD** (exportação JSON/CSV e exclusão) e integrar toda a página ao container unificado `max-w-7xl`.

**Non-Goals:**
- Não alterar endpoints de backend ou contratos da API de perfil (`/api/v1/profile/stats`, `/export/json`, `/export/csv`), mantendo total compatibilidade.
- Não introduzir upload de arquivos de imagem de avatar local (preserva o monograma estilizado).

## Decisions

1. **Inversão Hierárquica: Favoritos como Cartão de Visitas**
   - **Escolha:** Estruturar a página na seguinte ordem vertical:
     1. Cabeçalho de Perfil (Avatar monograma editorial + Nome + Ações rápidas);
     2. Vitrine de Obras Favoritas (Grade destacada de capas 2:3 com notas e títulos);
     3. Métricas Analíticas Compactas (4 cards de métricas + distribuição por categoria);
     4. Painel de Soberania de Dados & LGPD (Exportação e Exclusão).
   - **Alternativas consideradas:**
     - Separar em abas ("Favoritos" vs "Estatísticas"): descartado para manter a página fluida em rolagem única natural, conforme a revisão do designer.
   - **Justificativa:** Transforma o perfil em uma verdadeira vitrine cultural e afetiva do usuário, priorizando a identidade sobre gráficos frios.

2. **Proporção Editorial 2:3 nos Cards de Favoritos**
   - **Escolha:** Utilizar `aspect-[2/3]` nos cards da vitrine de favoritos, espelhando o padrão do catálogo e da biblioteca, com cantos arredondados elegantes (`rounded-xl`), sobreposição sutil de nota pessoal e coração carmim.
   - **Justificativa:** Unifica o ritmo visual e valoriza as artes das capas de doramas, animes e mangás.

3. **Métricas Analíticas Compactas em Grade 4 Colunas / 2x2**
   - **Escolha:** Redesenhar os cards de estatísticas com superfícies `#1A1820`, bordas sutis `#2B2735`, tipografia numérica monospace e rótulos discretos em caixa alta, substituindo o visual pesado de dashboard empresarial por blocos compactos e harmoniosos.
   - **Justificativa:** Mantém a consulta rápida e rica sem competir pelo foco visual com as obras da vitrine.

4. **Paleta Asian Editorial Mineral**
   - **Escolha:** Aplicar nanquim `#121115` no fundo da página, superfícies `#1A1820`, bordas `#2B2735`, texto papel `#F4EFEA` e acento carmim `#E05347` no avatar e botões, erradicando os gradientes ciano neon.

## Risks / Trade-offs

- **[Risco]** Usuário sem nenhuma obra favoritada ver um espaço vazio desolado no topo da página → **Mitigação:** Criar um estado acolhedor e informativo com ilustração/ícone suave e botão de atalho direto para explorar o catálogo.
- **[Risco]** Muitos títulos favoritados sobrecarregarem a rolagem da página → **Mitigação:** Utilizar grade responsiva (2 colunas em mobile, 3 em tablet, 6 em desktop) com espaçamento harmônico e fluidez.

## Migration Plan

- Não requer migrações de banco ou mudanças de infraestrutura.
- Modificações limitadas ao frontend em `apps/web/src/app/profile/` e `apps/web/src/components/profile/`.
- Testes automatizados em `tests/editorial-profile-showcase.test.mjs`.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/app/profile/page.tsx` — Inversão da hierarquia (favoritos no topo, estatísticas compactas), alinhamento a `max-w-7xl` e paleta Asian Editorial.
- `[MODIFY]` `apps/web/src/components/profile/favorites-showcase.tsx` — Cards de favoritos com proporção editorial 2:3, serifa moderna, coração carmim e estado acolhedor.
- `[MODIFY]` `apps/web/src/components/profile/profile-stats.tsx` — Métricas compactas com rótulos humanizados e barras editoriais de distribuição.
- `[CREATE]` `tests/editorial-profile-showcase.test.mjs` — Testes de interface e validação dos cenários normativos de perfil.

## Data Model

Consome o DTO existente de `packages/shared`:
- `ProfileStatsDto`: userId, username, joinedAt, totalCompleted, totalWatchingOrReading, totalChaptersRead, totalVolumesRead, averageRating, totalEstimatedHours, categoryDistribution, topGenres, originCountryDistribution, favorites (`ProfileFavoriteDto[]`).
- `ProfileFavoriteDto`: mediaItemId, title, slug, category, coverUrl, rating.

## Contracts

- **FavoritesShowcaseProps**:
  ```ts
  interface FavoritesShowcaseProps {
    favorites: ProfileStatsDto['favorites'];
  }
  ```
- **ProfileStatsProps**:
  ```ts
  interface ProfileStatsProps {
    stats: ProfileStatsDto;
  }
  ```

## Research

- **Padrão Asian Editorial:** Nanquim `#121115`, superfícies `#1A1820`, bordas `#2B2735`, papel `#F4EFEA`, carmim `#E05347`.
- **Custo Zero:** Utilização estrita de utilitários Tailwind CSS sem bibliotecas de gráficos pesadas ou dependências externas.

