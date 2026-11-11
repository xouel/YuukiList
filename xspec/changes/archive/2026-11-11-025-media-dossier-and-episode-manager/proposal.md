# Proposal: Media Dossier & Episode Manager (R25)

> **X-Spec** · ID: `025-media-dossier-and-episode-manager` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

A página de detalhes da obra em /items/[slug] ainda utiliza a paleta visual legada com tons de ciano (#06B6D4) e azul escuro (#181C2B), divergindo da identidade Asian Editorial consolidada nas demais rotas. Além da disparidade estética, a interface atual exibe uma lista plana básica sem a densidade de informações esperada para um dossiê completo de produto: faltam a faixa de 4 métricas de alto impacto (Média Global, Temporadas, Membros e Duração), o console unificado de status e tempo assistido, o gerenciador interativo de episódios organizado por temporadas com marcação rápida e os painéis laterais de distribuição de notas (histograma), provedores oficiais e estúdios. Esta fatia implementa a reformulação integral da tela da obra para o padrão Dossiê da Obra, harmonizando o design e elevando a experiência de acompanhamento.

## What Changes

- **Migração Estética para Asian Editorial**: Eliminação completa de cores azuis/ciano legadas (#06B6D4, #181C2B) na página `/items/[slug]`, adotando a paleta Nanquim/Papel/Carmim (`#121115`, `#1A1820`, `#201D28`, `#2B2735`, `#E05347`, `#F4EFEA`).
- **Hero da Obra com Faixa de 4 Métricas**:
  - Destaque da capa ampliada com selos de ranking global (ex.: `#2 Global`) e status de conclusão;
  - Título original/nativo, tags contextuais de formato, estúdio e anos de exibição;
  - Faixa com 4 métricas principais: *Média Global* (ex.: `9.05 / 10`), *Temporadas* (ex.: `4 (94 eps)`), *Membros* (ex.: `3.68M`) e *Duração Média* (ex.: `24 min`).
- **Console Pessoal de Acompanhamento**:
  - Seletores de *Meu Status* e *Minha Nota* (1 a 10);
  - Contador de *Tempo Assistido* estimado em dias, horas e minutos;
  - Barra visual de progresso pessoal (ex.: `Progresso Pessoal 86 / 94 eps (91%)`);
  - Botão de avanço rápido `+ +1 Episódio / Capítulo`;
  - Ações secundárias: Favorito (botão Favorito), Lista Personalizada e atalho direto para o Diário/Review.
- **Gerenciador de Episódios / Capítulos**:
  - Organização por abas de temporadas/arcos (ex.: *Temp 1*, *Temp 2*, *The Final Season*);
  - Ação em lote *"Marcar Temporada Toda"* para avançar o progresso até o término da temporada ativa;
  - Lista detalhada de episódios com título, duração, datas de exibição, notas individuais e botão tátil de marcação rápida (*Próximo* / *Marcar Visto*).
- **Painéis da Barra Lateral (4 colunas)**:
  - *Distribuição de Notas*: histograma de barras horizontais (10 a <=6 estrelas) e contadores (*Assistindo Agora*, *Completaram*, *Abandonaram*);
  - *Gêneros & Temas*: chips em estilo pílula;
  - *Onde Assistir Oficialmente*: cartões com links para plataformas oficiais (Crunchyroll, Netflix, etc.);
  - *Estúdios de Produção*: listagem de estúdios por temporada.
- **Sinopse Completa e Ficha Técnica**:
  - Bloco de narrativa expandida com créditos da equipe técnica principal (criador original, direção geral, trilha sonora).

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade criada; ampliação de capacidade existente.)*

### Modified Capabilities

- `catalog-browse`: Ampliação do requisito de visualização detalhada da obra com a inclusão da faixa de métricas, console pessoal, gerenciador de episódios por temporadas e painéis laterais de distribuição e provedores.

## Impact

- **Frontend**:
  - `apps/web/src/app/items/[slug]/page.tsx`
  - `apps/web/src/components/catalog/item-detail-view.tsx`
  - `apps/web/src/components/catalog/episode-manager.tsx`
  - `apps/web/src/components/catalog/dossier-metrics-strip.tsx`
  - `apps/web/src/components/catalog/dossier-sidebar.tsx`
  - `apps/web/src/components/catalog/personal-tracking-console.tsx`
- **Backend / APIs**: Nenhuma alteração no backend; o gerenciamento utiliza as APIs existentes `CatalogApiClient`, `LibraryApiClient` e `DiaryApiClient`.
- **Dependências**: Zero novas dependências; ícones em SVG nativo e estilos Tailwind CSS.

## User Stories

### US1: Hero Editorial com Faixa de Métricas e Console Pessoal (P1)
Como usuário navegando na página da obra, quero visualizar um cabeçalho completo com as 4 métricas principais e um console direto de progresso pessoal, para consultar dados globais e gerenciar meu status de consumo sem dispersão.
**Independent Test:** Acessar `/items/:slug`, verificar a renderização do título, capa, faixa com 4 métricas numéricas e o console pessoal com seletores de status, nota e barra de progresso.

### US2: Gerenciador de Episódios Interativo por Temporadas (P2)
Como acompanhante de séries e animes em exibição, quero poder visualizar a lista de episódios segmentada por temporadas e marcar episódios individuais ou temporadas inteiras como vistos, para manter meu histórico sincronizado com precisão.
**Independent Test:** Interagir com as abas de temporadas, verificar a renderização dos episódios com indicador de visto/não visto e acionar o botão "Marcar Temporada Toda" comprovando o avanço proporcional no console e na biblioteca.

### US3: Painéis Analíticos da Barra Lateral e Ficha Técnica (P3)
Como fã de cultura pop asiática, quero consultar a distribuição de notas da comunidade, plataformas oficiais de exibição e estúdios responsáveis, para entender a recepção da obra e saber onde assisti-la legalmente.
**Independent Test:** Verificar na barra lateral a presença do histograma de notas, chips de gêneros, cartões de plataformas oficiais (Crunchyroll/Netflix) e créditos da equipe técnica na seção de sinopse.

## Success Criteria

- **SC-001**: A página `/items/[slug]` elimina todos os tons azuis/ciano legados e adota integralmente a paleta mineral Nanquim/Papel/Carmim.
- **SC-002**: A faixa de métricas exibe 4 indicadores formatados (*Média Global*, *Temporadas*, *Membros*, *Duração Média*).
- **SC-003**: O console pessoal permite alternar status, atribuir notas de 1 a 10, visualizar tempo assistido e avançar progresso com botão de área tátil mínima de 44x44px.
- **SC-004**: O gerenciador de episódios suporta navegação por abas de temporadas e botão de avanço em lote "Marcar Temporada Toda".
- **SC-005**: A sidebar renderiza o histograma de notas da comunidade, gêneros/temas e provedores oficiais com links externos seguros (`rel="noopener noreferrer"`).
- **SC-006**: Todos os controles interativos cumprem as normas de acessibilidade WCAG 2.2 AA.

## Edge Cases

- Obras de volume único (filmes): o gerenciador oculta abas de temporadas e exibe unidade única com botão de marcar assistido.
- Obras sem pontuação global: histograma exibe mensagem amigável de obra recém-adicionada sem distorção visual.
- Visitante não autenticado: console pessoal exibe convite amigável para login para iniciar o acompanhamento, mantendo a visualização dos dados públicos da obra.

## Out of Scope

- Streaming ou reprodução direta de vídeo (YuukiList é exclusivamente ferramenta de acompanhamento e catálogo).
- Edição de metadados oficiais por usuários comuns sem papel de moderador/admin.

## Clarifications

### Session 2026-11-11
- Q: Como estruturar a listagem de episódios/capítulos no Gerenciador? → A: Geração determinística no frontend com base em `totalEpisodes` e `seasonsCount`, permitindo marcar cada episódio individualmente via `DiaryApiClient` e atualizando o progresso da biblioteca.
- Q: Como alimentar a Distribuição de Notas e Onde Assistir Oficialmente? → A: Histograma calculado deterministicamente em torno da nota média global (`score`) da obra, com provedores oficiais inferidos pela categoria e país.
- Q: Qual o comportamento da ação "Marcar Temporada Toda"? → A: Atualizar o progresso da obra na biblioteca até o último episódio da temporada ativa, registrando o lote correspondente no histórico do diário.

