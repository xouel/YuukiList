# Proposal: 010-navigation-ux-and-quick-actions

> **X-Spec** · ID: `010-navigation-ux-and-quick-actions` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

Para aproximar o YuukiList do padrão estabelecido no Documento Mestre de Contexto (Seções 3.2, 3.3, 3.7, 4.2, 8.3, 9.3 e 11.1), a interface precisa evoluir de um cabeçalho simples para um shell de navegação completo com Sidebar no desktop e Bottom Navigation no mobile cobrindo as 5 áreas centrais (Explorar, Buscar, Biblioteca, Calendário e Perfil). Além disso, a descoberta de obras exige ações rápidas diretamente nos cards do catálogo, filtros transversais por país e temas (BL/GL), suporte a alternância de tema (Dark/Light) e visibilidade da proveniência com atribuição legal das fontes externas (TMDB, TVmaze, ANN).

## What Changes

- Implementação do componente de casca de navegação unificada (`NavigationShell`) com Sidebar desktop (recolhível/fixa) e Bottom Navigation mobile cobrindo as 5 áreas principais: Explorar (`/`), Buscar (`/?search=open`), Biblioteca (`/library`), Calendário (`/calendar`) e Perfil (`/profile`).
- Criação das páginas iniciais navegáveis `/calendar` e `/profile` com estados informativos reais, contadores e atalhos rápidos.
- Adição do botão de ação rápida (`+`) diretamente nos cards do catálogo (`MediaCard`), permitindo adicionar obras à biblioteca com um único clique com status canônico padrão e feedback visual imediato.
- Inclusão de filtros por País de Origem (`Coreia do Sul`, `Japão`, `China`, `Tailândia`) e por Temas Transversais (`BL`, `GL`) na barra de filtros e exploração.
- Implementação de alternador de tema (`ThemeToggle`) com suporte a Dark Editorial (padrão) e Light Editorial, respeitando preferências do sistema e `prefers-reduced-motion`.
- Exibição de bloco de proveniência por campo e avisos obrigatórios de atribuição legal das fontes (TMDB, ANN, TVmaze, MangaUpdates) na página de detalhes da obra e no rodapé da aplicação.
- Atualização do contêiner do servidor web para disponibilizar as obras enriquecidas e sincronizadas da fatia R9 no catálogo em memória do Next.js.

## Capabilities

### New Capabilities

- `navigation-shell`: Shell de navegação global responsivo (Sidebar e Bottom Nav), alternância de tema (Dark/Light) e exibição de avisos de atribuição e proveniência de metadados.

### Modified Capabilities

- `catalog-browse`: Inclusão de ações rápidas (`quick-add`) nos cards de mídia e filtros transversais por país de origem e temas na navegação do catálogo.

## Impact

- `apps/web/src/components/layout/navigation-shell.tsx`: Novo componente de casca com Sidebar desktop e Bottom Nav mobile.
- `apps/web/src/components/layout/theme-toggle.tsx`: Componente de alternância entre temas Dark e Light.
- `apps/web/src/components/catalog/media-card.tsx`: Botão rápido de adicionar à biblioteca com indicação visual de presença na lista.
- `apps/web/src/components/catalog/filter-bar.tsx`: Suporte a filtros de país e temas transversais.
- `apps/web/src/app/calendar/page.tsx`: Rota navegável de calendário com visão inicial das obras em acompanhamento.
- `apps/web/src/app/profile/page.tsx`: Rota de perfil com resumo do usuário, estatísticas rápidas e atalhos.
- `apps/web/src/components/catalog/item-detail-view.tsx`: Seção visual de proveniência por campo e atribuição de licenciamento.
- `tests/navigation-ux-quick-actions.test.mjs`: Testes automatizados do shell de navegação, ações rápidas e filtros.

## User Stories

### US1 — Navegação Global e Shell Responsivo nas 5 Áreas (Priority: P1)

Como usuário do YuukiList, quero navegar facilmente entre Explorar, Buscar, Biblioteca, Calendário e Perfil através de uma Sidebar no computador e uma Bottom Nav no celular, para que a experiência seja fluida e alinhada às melhores plataformas modernas de entretenimento.

- **Why this priority:** Cumpre a Seção 3.2 do Documento Mestre e unifica a experiência entre mobile e desktop.
- **Independent Test:** Carregar a aplicação em resoluções desktop (>= 1024px) e mobile (< 768px) e verificar a presença funcional da Sidebar e da Bottom Nav com links operantes para todas as 5 áreas.

### US2 — Ações Rápidas de Biblioteca nos Cards do Catálogo (Priority: P1)

Como usuário autenticado, quero adicionar uma obra à minha biblioteca diretamente a partir do card na grade do catálogo com um único clique no botão `+`, para que eu não precise abrir a página de detalhes para cada obra que desejo acompanhar.

- **Why this priority:** Elimina fricção de uso frequente conforme exigido na regra central de UX (Seção 3.3 do Documento Mestre).
- **Independent Test:** Clicar no botão `+` de um card no catálogo e verificar a inclusão automática com status padrão na biblioteca pessoal e alteração imediata para o badge `"Na Lista ✓"`.

### US3 — Filtros Transversais, Temas Visuais e Atribuição Legal (Priority: P2)

Como usuário e visitante do catálogo, quero filtrar por país de origem (K-Drama, J-Drama, etc.) e temas (BL/GL), alternar entre tema Claro e Escuro e visualizar os créditos das fontes de dados, garantindo conformidade com a Seção 4.2 e 9 do Documento Mestre.

- **Why this priority:** Enriquece a capacidade de descoberta e garante a conformidade jurídica dos termos de uso das APIs parceiras.
- **Independent Test:** Aplicar filtros por país e tema na listagem e alternar o tema da interface validando contraste e renderização adequada.

## Success Criteria

- **SC-001**: Sidebar no desktop e Bottom Nav no celular ativas em 100% das páginas com links funcionais para as 5 áreas (`/`, `/?search=open`, `/library`, `/calendar`, `/profile`).
- **SC-002**: Ação rápida de adicionar nos cards do catálogo inclui a obra na biblioteca com status padrão da categoria em menos de 1 segundo com feedback visual instantâneo.
- **SC-003**: Filtros combinados por país de origem (`KR`, `JP`, `CN`, `TH`) e temas transversais operantes em conjunto com categorias e gêneros existentes.
- **SC-004**: Alternador de tema Dark/Light funcional preservando acessibilidade WCAG 2.2 AA (contraste mínimo 4.5:1) e respeito a `prefers-reduced-motion`.
- **SC-005**: Atribuição e avisos legais obrigatórios das fontes externas (TMDB, ANN, TVmaze) visíveis nos detalhes e rodapé da aplicação.

## Edge Cases

- Usuário não autenticado tentando clicar no botão rápido `+` no card (deve redirecionar para `/login` com parâmetro de retorno).
- Obra que já está na biblioteca exibida no catálogo (deve exibir badge indicativo com atalho para edição rápida).
- Dispositivo com preferência de sistema `prefers-color-scheme: light` ou `dark` (deve sincronizar como padrão inicial até escolha manual do usuário).

## Out of Scope

- Edição de eventos avançados de calendário ou sincronização com Google Calendar (escopo da fatia R14).
- Exportação em lote de dados e gráficos analíticos aprofundados no perfil (escopo da fatia R15).

## Clarifications

### Session 2026-11-09
- Q: Comportamento do botão rápido de adicionar à lista nos cards do catálogo? → A: Opção A — Adicionar imediatamente com o status inicial padrão da categoria com feedback visual instantâneo e transformar o botão em badge/seletor "Na Lista ✓".
- Q: Comportamento das áreas Calendário e Perfil na nova navegação de 5 áreas? → A: Opção A — Criar desde já as rotas `/calendar` e `/profile` navegáveis com visão inicial real (resumo das obras em acompanhamento e contadores da biblioteca) sem links mortos.
- Q: Escopo de filtros transversais e Tema Claro/Escuro? → A: Opção A — Incluir filtro por País de origem e temas transversais (BL/GL) na busca/exploração, além do seletor Dark/Light Mode com Dark Editorial como padrão.

