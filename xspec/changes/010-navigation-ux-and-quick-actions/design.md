# Design: 010-navigation-ux-and-quick-actions

## Context

Com o encerramento das fatias R1 a R9, o MVP central do YuukiList está funcional e testado, porém a interface web ainda utilizava um cabeçalho simples de duas rotas (`/` e `/library`), sem suporte a ações rápidas na grade de cards, sem a Sidebar e a Bottom Nav especificadas nas Seções 3.2 e 3.3 do Documento Mestre de Contexto, e sem o alternador de temas visuais (Dark/Light) exigido pela Seção 11.1 (`P-009`).
Esta fatia inaugura a consolidação do Documento Mestre, transformando a navegação da aplicação em um shell global responsivo em 5 áreas fundamentais (`Explorar`, `Buscar`, `Biblioteca`, `Calendário` e `Perfil`), provendo botão rápido de inclusão na biblioteca nos cards (`MediaCard`), enriquecendo filtros com país de origem e temas transversais (`BL`/`GL`), e garantindo conformidade com as exigências de licenciamento e atribuição das APIs externas parceiras (TMDB, ANN, TVmaze).

## Goals / Non-Goals

**Goals:**
- Implementar `NavigationShell` responsivo com Sidebar desktop fixa (>= 1024px) e Bottom Navigation bar mobile (< 768px) conectando as 5 áreas principais: Explorar (`/`), Buscar (`/?search=open`), Biblioteca (`/library`), Calendário (`/calendar`) e Perfil (`/profile`).
- Criar as páginas funcionais `/calendar` (apresentando resumo das obras em acompanhamento) e `/profile` (apresentando identidade do usuário, contadores da biblioteca e atalhos rápidos) sem rotas quebradas.
- Adicionar botão de ação rápida (`+`) diretamente em cada `MediaCard` no catálogo, adicionando a obra com status padrão da categoria e transformando o botão em um badge `"Na Lista ✓"` com feedback visual instantâneo.
- Enriquecer o `FilterBar` com seletor de País de Origem (`Coreia do Sul`, `Japão`, `China`, `Tailândia`) e Temas Transversais (`BL`, `GL`), sincronizados com a URL.
- Implementar alternador de tema `ThemeToggle` suportando Dark Editorial (padrão) e Light Editorial, respeitando preferências do sistema operacional e `prefers-reduced-motion`.
- Exibir seção de proveniência por campo e avisos de atribuição legal (especialmente TMDB notice obrigatório e créditos à ANN/TVmaze) na página de detalhes `/items/[slug]` e no rodapé global.
- Garantir que o contêiner do Next.js carregue as obras ingeridas e enriquecidas da fatia R9.

**Non-Goals:**
- Não implementar agenda avançada com sincronização externa iCal/Google Calendar (escopo da fatia R14).
- Não implementar gráficos analíticos densos ou exportação de dados no perfil (escopo da fatia R15).
- Não alterar as regras canônicas de busca por trigramas `pg_trgm` ou autenticação backend.

## Decisions

1. **Arquitetura de Navegação Híbrida: Sidebar Desktop + Bottom Nav Mobile (`P-011`, `P-012`)**
   - **Escolha:** Componente `NavigationShell` no layout raiz do Next.js, renderizando uma Sidebar lateral à esquerda em telas desktop (com logotipo, links com ícones SVG nativos, atalhos de autenticação e alternador de tema) e uma Bottom Navigation bar fixa na base em telas móveis com padding inferior automático para evitar sobreposição de conteúdo.
   - **Alternativas consideradas:** Manter apenas Navbar superior em todas as telas (rejeitada por violar a Seção 3.2 do Documento Mestre) ou menu hambúrguer oculto (rejeitada por adicionar cliques desnecessários no mobile).
   - **Justificativa:** Padrão ouro de trackers de entretenimento asiático modernos (como TV Time/Bingers), mantendo as 5 áreas a exatamente um toque de distância.

2. **Ação Rápida de Adição com Status Padrão nos Cards (`P-019`, Seção 3.3)**
   - **Escolha:** Botão de ação rápida posicionado no canto inferior/superior do card. Se o usuário estiver autenticado e o item não estiver na lista, um clique adiciona imediatamente com o status padrão da categoria (`Assistindo` para doramas/animes, `Quero Assistir` para filmes, `Lendo` para mangás/manhwas/manhuas) com atualização otimista na interface. Se não estiver autenticado, redireciona para `/login?redirect=...`.
   - **Alternativas consideradas:** Modal obrigatório ao clicar no card (rejeitada por lentidão) ou apenas permitir adicionar entrando na página de detalhes (rejeitada pela regra central de UX da Seção 3.3).
   - **Justificativa:** Agiliza a montagem da lista em sessões de exploração rápida.

3. **Gerenciador de Temas CSS com Dark Editorial como Baseline (`P-009`, Seção 11.1)**
   - **Escolha:** Controle baseado no atributo `data-theme="dark"` / `data-theme="light"` na tag `<html>`, usando classes Tailwind CSS e variáveis CSS para cores de fundo, texto e bordas. A preferência é salva no `localStorage` com chave `yuuki-theme`. Se ausente, detecta `prefers-color-scheme`.
   - **Alternativas consideradas:** Biblioteca externa pesada como `next-themes` (rejeitada para manter dependências zero e custo zero, Princípio IV).
   - **Justificativa:** Implementação ultra-leve em TypeScript puro nativo do React, com transição CSS suave e conformidade WCAG 2.2 AA.

4. **Rodapé de Atribuição e Selo de Licenciamento (`P-062`, Seção 9.3)**
   - **Escolha:** Componente `LegalFooter` integrado ao shell com o texto obrigatório do TMDB: *"Este produto utiliza a API do TMDB, mas não é endossado ou certificado pelo TMDB"*, acompanhado de créditos à TVmaze e Anime News Network.
   - **Alternativas consideradas:** Omitir atribuição na interface web e manter apenas no código (rejeitada por descumprimento dos termos legais das APIs parceiras).
   - **Justificativa:** Garante conformidade jurídica total sem impactar a estética Dark Editorial.

## Risks / Trade-offs

- **[Risco]** Bottom Navigation cobrindo o conteúdo final de páginas longas no celular → **Mitigação:** Adição de classe utilitária `pb-20 lg:pb-0` no container principal de conteúdo do layout.
- **[Risco]** Disparo múltiplo de requisições ao clicar repetidamente no botão rápido do card → **Mitigação:** Desabilitação do botão durante a requisição com debounce e estado otimista imediato no cliente.
- **[Risco]** Contraste insuficiente no tema Light Editorial → **Mitigação:** Definição rigorosa de tokens de contraste mínimo 4.5:1 para texto normal e 3:1 para texto grande em ambos os modos.

## Migration Plan

1. Criar os novos componentes de layout (`NavigationShell`, `ThemeToggle`, `LegalFooter`).
2. Substituir o uso de `HeaderNav` pelo `NavigationShell` em `apps/web/src/app/layout.tsx`.
3. Criar rotas `/calendar` e `/profile` no App Router.
4. Atualizar `MediaCard` e `FilterBar` com suporte aos novos estados e filtros.
5. Não há necessidade de migração de banco de dados para esta fatia (mudança puramente frontend e contratos de catálogo/biblioteca existentes).

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/components/layout/navigation-shell.tsx` — Casca de navegação unificada com Sidebar desktop e Bottom Nav mobile.
- `[CREATE]` `apps/web/src/components/layout/theme-toggle.tsx` — Alternador de temas Dark/Light com persistência em localStorage.
- `[CREATE]` `apps/web/src/components/layout/legal-footer.tsx` — Rodapé com notices obrigatórios do TMDB, ANN e TVmaze.
- `[CREATE]` `apps/web/src/app/calendar/page.tsx` — Página de calendário funcional com visão das obras acompanhadas.
- `[CREATE]` `apps/web/src/app/profile/page.tsx` — Página de perfil de usuário com contadores da biblioteca pessoal.
- `[MODIFY]` `apps/web/src/app/layout.tsx` — Estruturação do layout com o `NavigationShell`.
- `[MODIFY]` `apps/web/src/components/catalog/media-card.tsx` — Botão de ação rápida (`quick-add`) e estado de presença na lista.
- `[MODIFY]` `apps/web/src/components/catalog/filter-bar.tsx` — Filtros adicionais por País de Origem e Temas Transversais.
- `[MODIFY]` `apps/web/src/components/catalog/item-detail-view.tsx` — Exibição de proveniência detalhada por campo e licença.
- `[MODIFY]` `apps/web/src/server/container.ts` — Inicialização do catálogo em memória com as obras ingeridas e enriquecidas.
- `[CREATE]` `tests/navigation-ux-quick-actions.test.mjs` — Testes automatizados cobrindo os 7 cenários da mudança.

## Data Model

Utiliza os schemas existentes no PostgreSQL (Prisma), consumindo os campos já modelados:
- `originCountry` em `MediaItem` (utilizado para filtragem por país `KR`, `JP`, `CN`, `TH`).
- `provenance` (JSON) em `MediaItem` (utilizado para exibição auditável de fonte por campo).
- `UserLibraryItem` (utilizado para verificação de presença na biblioteca e ação rápida nos cards).

## Contracts

### Filtros Adicionais no Catálogo
```ts
export interface EnhancedCatalogQueryDto extends CatalogQueryDto {
  country?: string; // ex: 'KR', 'JP', 'CN', 'TH'
  theme?: string;   // ex: 'BL', 'GL'
}
```

### Contrato de Ação Rápida no Card
```ts
export interface QuickAddAction {
  mediaItemId: string;
  defaultStatus: PersonalStatus; // 'ASSISTINDO' | 'LENDO' | 'QUERO_ASSISTIR'
}
```

## Research

- Conforme Seção 3.2 do Documento Mestre, a experiência em desktop deve priorizar navegação lateral fixa, enquanto em mobile deve adotar uma barra inferior para as áreas frequentes.
- Conforme Seção 9.3, a atribuição do TMDB exige frase explícita de isenção de certificação, e a Seção 9.6 exige crédito à ANN.
- O padrão Dark Editorial consolidado na Seção 11.1 utiliza base preta/carvão (`#0B0D14`), cinza escuro de superfície (`#181C2B`), destaques ciano (`#06B6D4`) e violeta (`#8B5CF6`). O modo Light Editorial utiliza fundo suave (`#F8FAFC`), superfície de cartões (`#FFFFFF`) e texto de alto contraste (`#0F172A`).

