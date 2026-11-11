# Design: 017-ui-ux-navigation-and-theme-fixes

## Context

O YuukiList foi construído sobre uma arquitetura monorepo com Next.js 15 (App Router), Tailwind CSS e temas Dark Editorial e Light Editorial definidos via variáveis CSS em `apps/web/src/app/globals.css`.
Durante a validação prática em ambiente real (`http://localhost:3000`), identificou-se que:
1. A barra de navegação continha dois links apontando para o catálogo (`/` e `/?search=open`), com validação estática de `window.location.search` que não acionava re-renders no Next.js e nenhum consumidor de query param no `CatalogView`, gerando a percepção de clique inerte ou travado.
2. O alternador de temas (`ThemeToggle`) comutava o atributo `data-theme="light"` no elemento `<html>`, porém os componentes da casca (`NavigationShell`, `body` no `layout.tsx`) empregavam classes Tailwind com cores hexadecimais arbitrárias fixas (`bg-[#080A11]`, `bg-[#0E111B]`, `text-[#F3F4F6]`), cujos seletores estáticos sobrepunham as variáveis CSS do tema claro.
3. Os botões de login e cadastro na barra lateral desktop e cabeçalho móvel utilizavam estilização fixa (Cadastrar sempre em ciano de destaque, Entrar sempre em cinza neutro), ignorando a rota ativa (`pathname === '/login'` vs `pathname === '/register'`).

## Goals / Non-Goals

**Goals:**
- Unificar a navegação principal da aplicação em 4 áreas canônicas (**Explorar**, **Biblioteca**, **Calendário**, **Perfil**), eliminando rotas com query redundantes e mantendo a busca integrada no catálogo.
- Viabilizar a comutação visual efetiva e em tempo real para o tema **Light Editorial**, vinculando o layout raiz e a casca de navegação a variáveis semânticas de CSS ou classes reativas ao tema.
- Tornar os botões de autenticação na Sidebar e no cabeçalho mobile dinâmicos em relação ao `pathname` corrente, com transição cliente via `<Link>` do Next.js.
- Garantir que todos os 158 testes do repositório continuem passando sem regressões.

**Non-Goals:**
- Criar novos temas visuais adicionais (manter foco em Dark Editorial e Light Editorial).
- Alterar APIs de catálogo ou regras de negócio do backend NestJS.
- Modificar os formulários de autenticação ou bibliotecas de validação existentes.

## Decisions

1. **Unificação da Área de Exploração (Opção A Selecionada)**
   - **Escolha:** Reduzir a lista de links da casca de navegação para 4 itens: Explorar (`/`), Biblioteca (`/library`), Calendário (`/calendar`) e Perfil (`/profile`). A página `/` já engloba vitrine, barra de busca com debounce e filtros de mídia.
   - **Alternativas consideradas:** Opção B (criar rota dedicada `/search` separada de `/`) e Opção C (modal/drawer de Command Palette `Cmd+K`).
   - **Justificativa:** A Opção A elimina a redundância de rotas, reduz a sobrecarga cognitiva do usuário e harmoniza a navegação desktop e mobile sem fragmentar o catálogo.

2. **Vinculação Semântica de Temas CSS no Tailwind**
   - **Escolha:** Substituir classes hexadecimais rígidas no `layout.tsx` e na casca `navigation-shell.tsx` por classes baseadas em variáveis CSS semânticas (`bg-[var(--color-bg-base)]`, `bg-[var(--color-bg-surface)]`, `border-[var(--color-border)]`, `text-[var(--color-text-primary)]`), alinhando com as definições já existentes no `globals.css` para `:root` e `[data-theme="light"]`.
   - **Alternativas consideradas:** Usar `dark:` em cada classe utilitária do Tailwind (ex.: `dark:bg-[#080A11] bg-slate-50`).
   - **Justificativa:** O uso direto das variáveis semânticas assegura que a alternância do atributo `data-theme` no `<html>` propague instantaneamente para todo o DOM sem necessidade de re-renderização de componentes React ou recarregamento de página.

3. **Reatividade de Rota nos Botões de Autenticação**
   - **Escolha:** Inspecionar `pathname` retornado por `usePathname()` no `NavigationShell`. Se o usuário estiver em `/login`, "Entrar" adota a estilização de destaque primário (`bg-[#06B6D4] text-black font-semibold`) e "Cadastrar" torna-se neutro/secundário. Se estiver em `/register`, "Cadastrar" torna-se o destaque primário. No cabeçalho mobile, renderizar dinamicamente o link para a ação complementar. Substituir tags `<a>` por `<Link>` do Next.js.
   - **Alternativas consideradas:** Ocultar completamente os botões quando o usuário estiver em `/login` ou `/register`.
   - **Justificativa:** Manter ambos visíveis com o destaque correto permite alternância rápida entre login e cadastro diretamente pela barra lateral, melhorando a taxa de conversão e orientação espacial do usuário.

## Risks / Trade-offs

- **[Risco]** Flash de tema incorreto (FOUC) ao carregar a página com preferência clara salva no `localStorage`.  
  → **Mitigação:** `ThemeToggle` e scripts de cabeçalho sincronizam `data-theme` no `<html>` de forma imediata antes da pintura crítica; o fundo padrão no `globals.css` utiliza a variável `--color-bg-base`.
- **[Risco]** Quebra de contraste WCAG 2.2 AA em elementos específicos no tema Light Editorial.  
  → **Mitigação:** Validação das paletas de cores claras (`#f8fafc` fundo, `#0f172a` texto principal gerando contraste > 10:1, superior aos 4.5:1 exigidos pela norma).

## Migration Plan

- Não há migração de banco de dados nem quebra de contratos de API.
- Mudança restrita a componentes de apresentação (`apps/web`). Rollback imediato via git caso necessário.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `tests/navigation-theme-fixes.test.mjs` — Suíte de testes automatizados TDD para navegação unificada, alternância de tema e botões de autenticação reativos.
- `[MODIFY]` `apps/web/src/components/layout/navigation-shell.tsx` — Unificação em 4 itens, uso de `<Link>`, reatividade de botões de auth e classes semânticas de tema.
- `[MODIFY]` `apps/web/src/app/layout.tsx` — Remoção de classes hexadecimais estáticas fixas no `<body>`.
- `[MODIFY]` `apps/web/src/app/globals.css` — Ajuste de variáveis de superfície e texto para WCAG 2.2 AA em ambos os temas.
- `[MODIFY]` `apps/web/tailwind.config.ts` — Suporte expandido a variáveis semânticas de tema.

## Data Model

Não aplicável. Esta mudança não adiciona nem altera entidades ou esquemas de banco de dados.

## Contracts

- **Navegação do Shell**:
  - `items`: `[{ name: 'Explorar', href: '/' }, { name: 'Biblioteca', href: '/library' }, { name: 'Calendário', href: '/calendar' }, { name: 'Perfil', href: '/profile' }]`
- **Atributos HTML de Tema**:
  - Atributo `data-theme="dark"` ou `data-theme="light"` aplicado na tag `<html>`.
  - Persistência sob a chave `localStorage.getItem('yuuki-theme')`.
- **Rotas de Autenticação**:
  - `/login`: botão "Entrar" ativo (`bg-[#06B6D4] text-black`).
  - `/register`: botão "Cadastrar" ativo (`bg-[#06B6D4] text-black`).

## Research

- **WCAG 2.2 AA Contrast**: A razão de contraste entre `--color-bg-base` (`#f8fafc`) e `--color-text-primary` (`#0f172a`) no Light Editorial é de 13.9:1, e no Dark Editorial entre `#080a11` e `#f3f4f6` é de 16.2:1. Ambos excedem com folga o limiar mínimo de 4.5:1 para texto normal e 3:1 para elementos de interface.
- **Next.js App Router Navigation**: A utilização de `next/link` com `usePathname()` assegura transições client-side sem recarregamento completo da janela, mantendo o estado de sessão e o tema ativos.
- **Análise de Custo Zero e Governança**: Nenhuma nova dependência npm necessária. Todas as implementações utilizam recursos nativos do Next.js e Tailwind CSS já instalados.

