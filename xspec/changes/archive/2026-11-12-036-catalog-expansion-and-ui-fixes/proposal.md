# Proposal: Catalog Expansion, Official Covers and UI Interaction Fixes

> **X-Spec** · ID: `036-catalog-expansion-and-ui-fixes` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

Expandir o catalogo relacional do YuukiList no Supabase PostgreSQL com uma carga abrangente de obras consagradas em todas as 6 categorias canonicas (Dorama, Filme, Anime, Manga, Manhwa e Manhua), dotadas de capas autenticas com fallback resiliente para SVG local. Corrigir a experiencia visual e funcional do usuario: substituir o seletor de temas transversais por filtro refinado de generos, eliminar a duplicidade textual e de icone de soma no botao de avanco de episodio no dossier da obra ('+ +1 Episodio' para '+1 unidade') e conectar integralmente a acao de favoritar da tela de detalhes a biblioteca e ao perfil, viabilizando a exibicao e validacao em tempo real das metricas e da vitrine de favoritos.

## What Changes

- Carga ampliada de obras reais no Supabase PostgreSQL via Prisma com acervo diversificado nas 6 categorias canonicas para validacao plena das estatisticas e metricas de consumo.
- Resolucao de capas oficiais com URLs autenticas e mecanismo automatico de fallback visual para as capas vetoriais SVG locais geradas pelo sistema.
- Substituicao integral do filtro de temas transversais pelo filtro refinado de generos literarios e audiovisuais no catalogo e drawer de filtros.
- Ajuste ergonomico e saneamento do botao de incremento no dossier da obra (`item-detail-view.tsx` / `personal-tracking-console.tsx`), removendo o icone redundante de soma diante de '+1 Episodio/Capitulo'.
- Conexao ponta a ponta da acao de favoritar no console pessoal de acompanhamento da rota `/items/[slug]`, sincronizando a persistencia com o perfil e a biblioteca.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `catalog-data`: Expansao massiva deterministica de obras e suporte resiliente a capas com fallback para SVG local.
- `catalog-browse`: Substituicao do seletor de temas por filtro de generos, saneamento visual do botao de avanco de unidade e conexao da acao de favoritar no dossier.
- `user-profile-stats`: Sincronizacao em tempo real da vitrine de favoritos com o estado atualizado da biblioteca e consolidacao analitica do acervo ampliado.

## Impact

- Banco de dados Supabase PostgreSQL: Carga expandida de obras reais nas 6 categorias canonicas e persistencia de favoritos na biblioteca.
- Componentes Web: `filter-bar.tsx`, `catalog-view.tsx`, `item-detail-view.tsx`, `personal-tracking-console.tsx`, `media-card.tsx`, `favorites-showcase.tsx`.
- Servicos de API: `prisma-catalog.repository.ts`, `seed-real-catalog.mjs`, `library.repository.ts`, `profile.service.ts`.

## User Stories

### US1 — Acervo Expandido e Capas Oficiais Resilientes (Priority: P1)
O usuario e os administradores visualizam um catalogo rico com diversas obras consagradas nas 6 categorias canonicas, exibindo capas oficiais com resolucao transparente e fallback automatico para capas vetoriais locais em caso de indisponibilidade.

- **Why this priority:** Permite testar e alimentar adequadamente as metricas de consumo, tempo assistido e graficos de distribuicao analitica.
- **Independent Test:** Execucao da carga deterministica e verificacao do carregamento de capas na grade de exploracao `/explore` e nos cards.

### US2 — Filtro de Generos no Catalogo e Dossiê Aprimorado (Priority: P1)
O usuario explora o acervo filtrando diretamente por generos tematicos relevantes, e ao abrir o dossier da obra visualiza um botao de incremento ergonomico ('+1 Episodio' ou '+1 Capitulo') sem icones duplicados de soma.

- **Why this priority:** Atende diretamente a preferencia do usuario por generos e elimina o ruido visual de '+ +1 Episodio'.
- **Independent Test:** Abertura da rota `/explore`, selecao de genero no filtro e inspecao do botao de incremento na rota `/items/[slug]`.

### US3 — Conexao da Acao de Favoritar com a Vitrine do Perfil (Priority: P1)
O usuario marca uma obra como favorita diretamente no console pessoal do dossier `/items/[slug]` e a mesma surge imediatamente na vitrine de favoritos do seu perfil `/profile`.

- **Why this priority:** Integra a interatividade da tela de detalhes com o painel de perfil e suas estatisticas de curadoria pessoal.
- **Independent Test:** Favoritar uma obra no dossier, navegar para `/profile` e verificar a presenca do item na vitrine de favoritos.

## Success Criteria

- **SC-001**: O banco de dados contem acervo ampliado de obras nas 6 categorias canonicas e as capas oficiais carregam com fallback para SVG local sem exibir caixas quebradas.
- **SC-002**: O filtro de temas transversais e removido da barra e drawer de filtros, sendo substitudo pelo filtro funcional de generos.
- **SC-003**: O botao de avanco de unidade no dossier da obra exibe rotulo limpo e nao redundante sem duplicidade de glifo de adicao.
- **SC-004**: A acao de favoritar na rota `/items/[slug]` persiste com sucesso e reflete instantaneamente na secao de favoritos da rota `/profile`.

## Edge Cases

- Obras com indisponibilidade de capa remota devem acionar o fallback imediato para o endpoint `/api/v1/catalog/items/:slug/cover`.
- Usuario que desmarca o favorito na tela da obra deve ver a remocao imediata na vitrine de favoritos do perfil.
- Filtragem por genero combinada com busca por texto ou categoria deve filtrar os resultados cumulativamente.

## Out of Scope

- Player de streaming de video ou leitor de manga embutido.
- Reestruturacao de layout do cabecalho global.

## Clarifications

### Session 2026-11-12
- Q: Quais categorias devem receber ampliacao no seed de catalogo? → A: Todas as 6 categorias canonicas (Dorama, Filme, Anime, Manga, Manhwa e Manhua).
- Q: Qual a estrategia para prevencao de falhas nas capas oficiais? → A: Atualizar para URLs validas e adicionar listener de erro automatico para fallback na capa SVG local `/api/v1/catalog/items/:slug/cover`.
- Q: Como tratar o botao '+ +1 Episodio' no dossier? → A: Remover o icone SVG duplicado de soma ou ajustar a legenda para que a combinacao visual resulte em um unico '+1 Episodio/Capitulo'.
- Q: Onde persistir os favoritos da tela de obra? → A: Conectar o botao de favorito de `PersonalTrackingConsole` ao `libraryApi.updateItem` com atualizacao reativa.
