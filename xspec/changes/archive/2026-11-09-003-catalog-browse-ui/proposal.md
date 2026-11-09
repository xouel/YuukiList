# Proposal: 003-catalog-browse-ui

> **X-Spec** · ID: `003-catalog-browse-ui` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de uma interface web imersiva e de alta performance para permitir aos usuários explorar, buscar e visualizar detalhes das obras do catálogo unificado de entretenimento asiático. Esta mudança implementa a aplicação frontend em Next.js 15 (App Router, Tailwind CSS e componentes acessíveis no tema Dark Editorial), consumindo a API de catálogo desenvolvida na fatia R2. A interface oferece busca com debounce sincronizada na URL, barra de filtros combinados, grade de cards com capas SVG e rolagem infinita automática, página de detalhes `/items/:slug` com restauração de rolagem ao voltar, os 4 estados assíncronos (skeletons, vazio, sem resultados e erro com retry) e total conformidade com WCAG 2.2 AA.

## What Changes

- Configuração da fundação do frontend Next.js 15 App Router em `apps/web` com Tailwind CSS e tokens no tema Dark Editorial (base escura, acentos ciano/violeta e tipografia editorial de alto contraste).
- Implementação de cliente HTTP tipado (`CatalogApiClient`) consumindo `@yuukilist/shared` e os endpoints `GET /api/v1/catalog/items`, `GET /api/v1/catalog/items/:slug` e `GET /api/v1/catalog/items/:slug/cover`.
- Página inicial de catálogo (`/`) contendo barra de busca com debounce (300ms) e barra de filtros combinados (`category`, `status`, `genre`).
- Sincronização bidirecional em tempo real do estado de busca e filtros com os searchParams da URL (`/?q=...&category=...`).
- Grade responsiva de cards de mídia com capas SVG, badges de categoria/status, ano de lançamento e rolagem infinita automática (`Infinite Scroll`) via IntersectionObserver.
- Página de detalhes da obra (`/items/:slug`) exibindo imagem ampliada, sinopse completa, gêneros, aliases, contagem de episódios/capítulos e botão "Voltar" que restaura a busca, filtros e posição de rolagem.
- Tratamento explícito e polido dos 4 estados assíncronos:
  1. **Loading:** Skeletons com pulso sutil em grid para a carga inicial e indicador discreto no rodapé durante o scroll infinito.
  2. **Catálogo Vazio:** Mensagem contextual e visual limpo quando não há dados.
  3. **Busca sem Resultados:** Mensagem amigável sugerindo termos alternativos e botão "Limpar filtros".
  4. **Erro:** Alerta visual com feedback do problema e botão "Tentar novamente" (retry).
- Conformidade estrita com acessibilidade WCAG 2.2 AA (navegação 100% por teclado, foco visível e contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande).

## Capabilities

### New Capabilities
- `catalog-browse`: Interface web de catálogo com busca, filtros, rolagem infinita, página de detalhes e estados assíncronos resilientes.

### Modified Capabilities
- Nenhuma (a API backend `catalog-search` permanece preservada como contrato consumido).

## Impact

- **Frontend (`apps/web`):** Criação das rotas `/` e `/items/[slug]`, componentes de catálogo, layouts e cliente HTTP.
- **Contratos (`packages/shared`):** Consumo direto de DTOs e enums já existentes em `@yuukilist/shared`.
- **Acessibilidade & Design:** Aplicação rigorosa das diretrizes de Dark Editorial e WCAG 2.2 AA sem bibliotecas pagas ou WebGL pesado.

## User Stories

### US1 — Exploração e Busca Interativa no Catálogo (Priority: P1)
Como usuário do YuukiList,
Quero navegar pela grade de obras, pesquisar por título com feedback instantâneo e rolar infinitamente para descobrir mais títulos,
Para explorar o catálogo unificado de entretenimento asiático de forma fluida e sem interrupções.

- **Why this priority:** É a experiência visual central da Fase 1 acordada no PRD e no Documento Mestre.
- **Independent Test:** Digitar no campo de busca ou rolar até o final da página e verificar que a URL é atualizada e novos cards são carregados na grade.

### US2 — Filtragem Combinada e Estados de Feedback (Priority: P2)
Como usuário procurando obras específicas,
Quero aplicar filtros combinados de categoria, status e gênero, e ter feedback imediato caso nenhum título corresponda à busca,
Para refinar minha pesquisa com facilidade e poder limpar os filtros com um único clique.

- **Why this priority:** Permite filtrar obras asiáticas por formato e situação de lançamento com interface resiliente.
- **Independent Test:** Selecionar filtros que retornem zero resultados e verificar exibição do estado de busca vazia com botão funcional "Limpar filtros".

### US3 — Página de Detalhes da Obra e Histórico de Navegação (Priority: P3)
Como usuário interessado em uma obra específica,
Quero clicar no card para abrir a página `/items/:slug` com todos os detalhes e depois voltar para o catálogo exatamente onde parei,
Para ler a sinopse e metadados sem perder o contexto da minha pesquisa anterior.

- **Why this priority:** Permite aprofundar na obra e garante navegabilidade impecável entre a lista e a tela de detalhe.
- **Independent Test:** Clicar em um card, verificar que a rota `/items/:slug` exibe capa e sinopse, e clicar em "Voltar" verificando que os filtros e a rolagem anterior são restaurados.

## Success Criteria

- **SC-001**: A página `/` renderiza a grade de cards com dados reais da API, exibindo título, categoria, status e capa SVG.
- **SC-002**: A rolagem até o final da lista dispara automaticamente a busca da próxima página via Infinite Scroll enquanto houver itens disponíveis.
- **SC-003**: A digitação na busca aplica debounce de 300ms e sincroniza os parâmetros na URL (`/?q=...`).
- **SC-004**: O estado de Loading exibe skeletons pulsantes e o estado de erro exibe mensagem com botão funcional de retry.
- **SC-005**: A página `/items/:slug` exibe todos os detalhes da obra e o retorno ao catálogo restaura busca, filtros e posição de rolagem.
- **SC-006**: Todos os elementos interativos possuem foco visível via teclado e contraste de cores conforme WCAG 2.2 AA.

## Edge Cases

- Rede offline ou falha da API: exibe card de erro amigável com botão de retry sem travar a interface.
- Busca por termo inexistente ou com caracteres especiais: exibe mensagem limpa sem resultados com botão "Limpar filtros".
- Acesso direto por URL externa `/items/:slug`: exibe os detalhes da obra e o botão "Voltar" redireciona suavemente para `/` no catálogo padrão.
- Redimensionamento de tela entre 360px (mobile) e 1440px (desktop): a grade se adapta responsivamente sem rolagem horizontal indesejada.

## Out of Scope

- Autenticação e botões de adicionar à lista pessoal privada (fatias R4 a R7).
- Calendário de lançamentos ou agenda pessoal (Fase 2 / fatias posteriores).
- Animações pesadas em WebGL ou bibliotecas pagas.

## Clarifications

### Session 2026-11-09
- Q: Como a busca e os filtros combinados devem sincronizar seu estado na navegação? → A: (Recommended) Sim, sincronização bidirecional via URL SearchParams (/?q=...&category=...), garantindo restauração pelo botão 'Voltar', histórico e compartilhamento de link.
- Q: Qual padrão de paginação deve ser adotado para a grade de cards do catálogo? → A: Rolagem infinita (Infinite Scroll) automática.
- Q: Qual tratamento visual deve ser aplicado aos 4 estados assíncronos (Loading, Vazio, Sem Resultados, Erro)? → A: (Recommended) Skeletons com pulso sutil no tema Dark Editorial para Loading; Empty State com mensagem contextual e botão 'Limpar filtros'; Error State com botão 'Tentar novamente'.

