# Proposal: Correção de Navegação, Alternância de Tema e Botões de Autenticação

> **X-Spec** · ID: `017-ui-ux-navigation-and-theme-fixes` · Type: `bugfix` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

A experiência de navegação e acessibilidade do YuukiList apresenta três atritos críticos: a divisão entre 'Explorar' e 'Buscar' aponta para a mesma rota sem consumidor de parâmetros gerando a percepção de tela travada; a alternância para o tema Light Editorial não surte efeito visual devido ao uso de classes Tailwind arbitrárias com valores hexadecimais fixos que sobrepõem as variáveis CSS; e os botões de autenticação na barra lateral e cabeçalho mobile possuem estilização estática que não reflete a rota ativa entre login e cadastro. Esta mudança unifica o catálogo na navegação principal, reestabelece a comutação visual completa entre Dark e Light Editorial e torna os botões de autenticação reativos à rota atual.

## What Changes

- **Unificação da Navegação Principal**: Consolidação das opções de menu em 4 áreas principais (Explorar, Biblioteca, Calendário e Perfil), eliminando a rota redundante `/?search=open` e concentrando busca e vitrines em `/`.
- **Ativação Efetiva do Tema Light Editorial**: Vinculação dos elementos de layout raiz, barra lateral, cabeçalho móvel e superfícies às variáveis de tema do `globals.css` (`--color-bg-base`, `--color-bg-surface`, `--color-text-primary`), permitindo a comutação dinâmica real sem sobreposição de classes hexadecimais estáticas.
- **Reatividade dos Botões de Autenticação**: Adaptação dos botões "Entrar" e "Cadastrar" na barra lateral e cabeçalho mobile para reagirem dinamicamente ao `usePathname()`, destacando em ciano primário a ação da tela corrente e fornecendo navegação cliente via `<Link>`.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `navigation-shell`: Atualização dos requisitos de estrutura de navegação para 4 áreas unificadas, aplicação efetiva de temas visuais e reatividade dos botões de autenticação conforme a rota ativa.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/components/layout/navigation-shell.tsx`: Simplificação dos itens para 4 abas, estilização semântica de tema e botões dinâmicos de autenticação.
  - `apps/web/src/app/layout.tsx`: Remoção de classes hexadecimais estáticas fixas no `<body>`.
  - `apps/web/src/app/globals.css`: Validação das variáveis de tema Dark e Light Editorial.
  - `apps/web/tailwind.config.ts`: Suporte estendido a classes semânticas de fundo e texto.
- **Banco de Dados & APIs**: Zero impacto (alteração exclusivamente de camada de apresentação cliente).
- **Testes**: Atualização e expansão da suíte de testes de interface da casca de navegação.

## User Stories

### US1 — Navegação Unificada no Catálogo (Priority: P1)
Como usuário do YuukiList, quero acessar a área de exploração e encontrar a busca e os filtros integrados diretamente na vitrine, sem me deparar com abas duplicadas ou links travados.

- **Why this priority:** A navegação é o ponto de entrada principal de todos os usuários da aplicação.
- **Independent Test:** Navegar pela barra lateral ou inferior clicando em "Explorar" e verificar se a rota `/` carrega sem links redundantes e com estado ativo destacado.

### US2 — Alternância de Tema Funcional (Priority: P1)
Como usuário que prefere fundos claros durante o dia, quero clicar no alternador de tema e ver todas as telas e painéis mudarem imediatamente para o tema claro com texto escuro e legível.

- **Why this priority:** O suporte a temas e contraste visual é requisito fundamental de acessibilidade (WCAG 2.2 AA).
- **Independent Test:** Clicar no botão de alternância de tema e inspecionar se as cores de fundo e texto de `body`, `aside`, `header` e cartões comutam para os tons de Light Editorial.

### US3 — Destaque Reativo dos Botões de Autenticação (Priority: P2)
Como visitante alternando entre as telas de login e cadastro, quero que o botão correspondente à tela onde me encontro fique visualmente destacado como ativo.

- **Why this priority:** Evita confusão sobre em qual tela de autenticação o usuário está localizado.
- **Independent Test:** Acessar `/login` e confirmar que "Entrar" fica destacado em ciano primário; acessar `/register` e confirmar que "Cadastrar" assume o destaque primário.

## Success Criteria

- **SC-001**: A barra lateral e a barra de navegação móvel exibem exatamente 4 itens principais (Explorar, Biblioteca, Calendário e Perfil) com marcação de ativo precisa e sem links travados.
- **SC-002**: A troca para o tema Light Editorial altera visualmente o plano de fundo do layout e da casca de navegação para tons claros (`#f8fafc` / `#ffffff`) e os textos para tons escuros de alto contraste.
- **SC-003**: Os botões de login e cadastro na barra lateral e o botão no cabeçalho mobile refletem imediatamente a rota ativa do usuário.

## Edge Cases

- Acesso a URLs profundas como `/login?redirect=%2Flibrary` deve manter o destaque visual correto do botão "Entrar".
- Persistência no `localStorage` da preferência de tema deve ser respeitada em novas abas ou recarregamento sem piscamento incorreto de cores (FOUC).
- Dispositivos com `prefers-reduced-motion` ativado devem realizar a transição de cores de forma suave sem movimentos bruscos.

## Out of Scope

- Adição de novos esquemas de cores além do Dark Editorial e Light Editorial.
- Modificação das APIs backend de autenticação ou catálogo.

## Clarifications

### Session 2026-11-10
- Q: Qual a abordagem para a navegação Explorar vs Buscar (Opção A: Unificar Catálogo, Opção B: Rota `/search`, Opção C: Quick Search Modal)? → A: Opção A (Unificar Catálogo com busca e filtros integrados).
- Q: Como o alternador de temas deve funcionar? → A: Remover classes hexadecimais escuras fixas e garantir que o Light Editorial aplique as variáveis CSS de globals.css.
- Q: Como os botões de autenticação na sidebar e header mobile devem se comportar? → A: Reagir dinamicamente à rota atual (`/login` destaca Entrar; `/register` destaca Cadastrar).

