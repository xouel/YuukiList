# Proposal: Consolidated Shell, Home Hub & Library Fix (R23)

> **X-Spec** · ID: `023-consolidated-shell-and-home-hub` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

A interface atual do YuukiList apresenta estrutura de listas isoladas com navegação lateral simples, sem a densidade informacional e hierarquia de produto consolidado observadas nas referências visuais do produto. A rota inicial exibia diretamente uma grade plana sem acolhimento do progresso do usuário, e uma assimetria de desserialização na biblioteca impedia a renderização correta de itens salvos. Esta mudança eleva a casca de navegação para uma Top Command Bar integrada, transforma a rota raiz no Home Hub dinâmico (Hero Spotlight, Continuar Acompanhando e Sidebar Bento de 4 colunas) e corrige o consumo de dados da biblioteca pessoal, conferindo acabamento tátil e editorial de alto nível tanto no desktop quanto no mobile.

## What Changes

- **Top Command Bar no Desktop**: Transição da barra lateral exclusiva para uma Top Command Bar horizontal unificada (Início, Minha Lista, Explorar, Calendário) com busca global rápida, contadores contextuais de atividade, sino de notificações e menu dropdown de perfil/tema/logout, mantendo a Bottom Navigation otimizada para mobile.
- **Home Hub na rota raiz (`/`)**: Transformação da página inicial em um painel consolidado com grid 8+4 colunas:
  - **Coluna Principal (8 col)**: Hero Spotlight com obra em destaque e progresso integrado, seção "Continuar Acompanhando" com cards táteis de marcação rápida (+1) e vitrine editorial "Tendências & Recomendações".
  - **Sidebar Bento (4 col)**: Cartões analíticos de "Resumo Semanal" (episódios/horas), régua de "Constância Diária" (7 dias com chamas de streak), "Próximas Estreias" do calendário e "Feed de Atividade" pessoal do próprio usuário.
- **Catálogo Completo em `/explore`**: Migração da tela de exploração com filtros avançados e rolagem infinita para a rota `/explore`, mantendo redirecionamento transparente de buscas diretas (`/?q=...` para `/explore?q=...`).
- **Correção da Desserialização da Biblioteca**: Ajuste no cliente HTTP da biblioteca pessoal para normalizar o envelope de resposta (`data` vs `items`), garantindo carregamento imediato dos itens salvos e exibição precisa de badges de confirmação em toda a aplicação.

## Capabilities

### New Capabilities

- `home-hub`: Painel dinâmico da rota raiz que combina Hero Spotlight de destaque com progresso integrado, seção tátil Continuar Acompanhando, vitrines de recomendação e Sidebar Bento de métricas e atividade recente.

### Modified Capabilities

- `navigation-shell`: Transição para Top Command Bar no desktop com busca rápida, indicadores de atividade, menu de usuário e Bottom Nav mobile preservada.
- `catalog-browse`: Estabelece a rota dedicada `/explore` para exploração avançada e rolagem infinita, preservando compatibilidade para parâmetros de busca legados.
- `personal-library-ui`: Normalização de resposta para garantir carregamento e renderização fidedigna dos itens da biblioteca pessoal nos cards e listagens.

## Impact

- **Frontend (`apps/web`)**:
  - `apps/web/src/components/layout/navigation-shell.tsx`: Evolução para Top Command Bar no desktop e menu contextual de usuário.
  - `apps/web/src/app/page.tsx` & novos componentes em `apps/web/src/components/home/`: Construção do Home Hub (Hero Spotlight, Continuar Acompanhando, Bento Sidebar).
  - `apps/web/src/app/explore/page.tsx`: Instanciação da visão completa do catálogo na rota `/explore`.
  - `apps/web/src/services/library-api.client.ts`: Normalização do retorno de `list` e `listItems` para expor `items` e `data` conjuntamente.
  - `apps/web/src/components/library/library-view.tsx` & `apps/web/src/components/catalog/catalog-view.tsx`: Consumo defensivo da lista de itens.
- **Testes (`tests/`)**: Criação da suíte `tests/consolidated-shell-and-home-hub.test.mjs` e manutenção da compatibilidade estrita com todos os 207 testes existentes.

## User Stories

### US1 — Casca de Navegação Consolidada com Top Command Bar (Priority: P1)

Como usuário do YuukiList no desktop ou dispositivo móvel, desejo uma barra de navegação superior ágil e limpa que me permita saltar rapidamente entre as áreas centrais do produto, realizar buscas imediatas e gerenciar minha sessão sem ocupar espaço lateral excessivo da tela.

- **Why this priority:** A casca de navegação estabelece a identidade visual global e a ergonomia de acesso a todas as seções do produto.
- **Independent Test:** Verificar que em viewport desktop (>= 1024px) a barra superior renderiza os 4 links principais, busca e menu de usuário, enquanto em viewport mobile (< 768px) a Bottom Navigation permanece ativa com alvos de toque acessíveis.

### US2 — Home Hub com Hero Spotlight e Continuar Acompanhando (Priority: P1)

Como usuário autenticado na página inicial, desejo visualizar imediatamente a obra em que estou mais engajado (com progresso atual e botão de avanço rápido), a lista das minhas obras ativas prontas para marcar +1 episódio/capítulo e widgets laterais com meu ritmo semanal e constância.

- **Why this priority:** Entrega o valor central do YuukiList como rastreador diário direto na primeira dobra da aplicação.
- **Independent Test:** Carregar `/` com usuário autenticado e verificar a exibição do Hero Spotlight com barra de progresso, a seção Continuar Acompanhando com botões táteis e os cartões de Resumo Semanal e Constância na coluna lateral.

### US3 — Desacoplamento da Rota de Exploração e Correção de Carregamento da Biblioteca (Priority: P2)

Como usuário explorando o acervo completo ou gerenciando minha biblioteca pessoal, desejo navegar por todos os filtros e paginação infinita em `/explore` e ter certeza de que todas as obras da minha lista pessoal carregam imediatamente sem estados vazios espúrios.

- **Why this priority:** Garante integridade funcional no catálogo abrangente e elimina o defeito visual de lista vazia na biblioteca.
- **Independent Test:** Navegar para `/explore`, verificar a renderização dos filtros avançados e testar que a chamada a `libraryApi.list()` preenche a lista de itens tanto na biblioteca quanto no indicador de status do catálogo.

## Success Criteria

- **SC-001**: A barra de navegação no desktop renderiza os 4 atalhos principais, busca global e controles de usuário em layout horizontal de altura controlada (h-16), liberando a largura total do container `max-w-7xl`.
- **SC-002**: A rota `/` renderiza grid assimétrico 8+4 colunas no desktop, empilhando fluidamente em coluna única no mobile.
- **SC-003**: O botão de avanço rápido (+1) na seção "Continuar Acompanhando" possui dimensões mínimas de 44x44px em conformidade com WCAG 2.2 AA.
- **SC-004**: O cliente `LibraryApiClient` normaliza o retorno provendo `items` como array válido, garantindo que usuários com obras cadastradas visualizem seus itens na biblioteca e nos cards.
- **SC-005**: 100% dos 207 testes existentes permanecem verdes e uma nova suíte de testes valida os novos cenários normativos.

## Edge Cases

- **Usuário Visitante (Anônimo) na Home**: Renderiza Hero Spotlight institucional com chamada editorial e vitrines de catálogo, ocultando de forma elegante a lista de progresso e métricas pessoais privadas.
- **Usuário sem Obras em Andamento**: A seção "Continuar Acompanhando" exibe mensagem contextual convidativa para explorar o catálogo em vez de um espaço em branco quebrado.
- **Parâmetros de Busca Legados em `/`**: Redirecionamento transparente de consultas iniciadas via query string (`/?q=exemplo`) para `/explore?q=exemplo`.

## Out of Scope

- Gamificação social com pontos de experiência globais ou ranking público de outros usuários (preservação estrita da privacidade por padrão da Constituição).
- Redesign aprofundado das páginas internas de Detalhes (`/items/[slug]`) e Calendário (`/calendar`), que constituem as fatias subsequentes R24, R25 e R26.

## Clarifications

### Session 2026-11-11

- Q: A navegação no desktop deve migrar para Top Command Bar ou manter a Sidebar lateral? → A: Migrar para Top Command Bar no desktop conforme as 4 referências visuais de produto consolidado, mantendo a Bottom Navigation no mobile.
- Q: A exploração completa do catálogo deve permanecer em `/` ou migrar para `/explore`? → A: `/` torna-se o Home Hub e o catálogo abrangente passa a residir em `/explore`, com redirecionamento de buscas diretas.
- Q: Indicadores de atividade e constância devem ser sociais ou estritamente pessoais? → A: Estritamente pessoais, baseados nas datas de registros de histórico e diário do próprio usuário logado, em consonância com o Artigo VII da Constituição.
- Q: A correção da desserialização de dados da biblioteca pessoal deve entrar nesta entrega? → A: Sim, incluída como requisito de suporte em `personal-library-ui` para desbloquear dados reais no Home Hub.

