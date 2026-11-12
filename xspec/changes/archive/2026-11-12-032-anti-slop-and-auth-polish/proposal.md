# Proposal: 032-anti-slop-and-auth-polish

> **X-Spec** · ID: `032-anti-slop-and-auth-polish` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

Usuários autenticados continuavam recebendo a chamada "Criar Conta Gratuita" na tela inicial devido a uma falha no chaveamento do Hero Spotlight e incompatibilidade com os enums em português (ASSISTINDO e LENDO). Simultaneamente, a aplicação acumulou padrões visuais excessivamente padronizados que transmitem impressão de template gerado por IA: etiquetas mono em caixa alta (eyebrows) em todos os cabeçalhos, salada tipográfica com mono decorando números comuns, caixas repetitivas com o mesmo raio e fundo em toda a tela (falta de hierarquia de superfície), empilhamento de três linhas de botões em pílula na biblioteca e tingimento colorido artificial que concorre com as artes das capas. Esta entrega corrige o fluxo de autenticação e executa um saneamento visual anti-slop profundo, garantindo cromo neutro, abas limpas e foco na experiência editorial autêntica.

## What Changes

- Correção lógica no `HeroSpotlight`: ramificação estrita por `isAuthenticated`. Para usuário autenticado sem a obra no acervo, exibe "+ Adicionar à Lista" e "Ver Detalhes", nunca "Criar Conta Gratuita".
- Alinhamento dos filtros de obras ativas em `home-hub-view.tsx` e `continue-watching.tsx` para os enums canônicos `ASSISTINDO` e `LENDO`.
- Remoção sistemática de etiquetas mono superiores (eyebrows): "Destaque do Diário", "Ledger Pessoal v2.4", "Sincronizado recentemente" e "Temporada de Outono 2026".
- Saneamento tipográfico: erradicação de `font-mono` decorativo em números comuns e métricas (`18`, `7.2h`, contadores e dias da semana), adotando tipografia sans/serif regular com `tabular-nums`.
- Reestruturação de `LibraryFilters`: substituição das 3 linhas de botões pílula por abas editoriais limpas em linha única com sublinhado/indicador sutil e seletor plano de categorias.
- De-boxing e cromo neutro na Biblioteca: remoção de `CATEGORY_COLORS` com fundos coloridos artificiais, eliminação de títulos duplicados redundantes no card e remoção do contêiner externo restritivo.
- De-boxing do `BentoSidebar` na Home: unificação da coluna lateral em fluxo contínuo com divisores leves (`divide-y`), quebrando o padrão de três caixas isoladas idênticas.
- Purga de decorações vazias no Perfil: remoção dos selos "Colecionador" e "Acervo Privado", e remoção do emoji no botão "Compartilhar Perfil".

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `home-hub`: Atualiza Hero Spotlight para ramificar por autenticação sem link indevido de registro e de-boxing do Bento Sidebar sem font-mono decorativo.
- `personal-library-ui`: Remove rótulo Ledger v2.4 e sincronizado, substitui empilhamento de pílulas por abas limpas e neutraliza cromo dos cards sem tingimento artificial.
- `calendar-ui`: Remove etiqueta eyebrow de temporada no cabeçalho do calendário e garante tipografia limpa.
- `user-profile-stats`: Remove selos decorativos vazios (Colecionador, Acervo Privado) e emoji no perfil.

## Impact

Afeta os componentes de interface web em `apps/web/src/components/home/`, `apps/web/src/components/library/`, `apps/web/src/components/calendar/` e `apps/web/src/app/profile/page.tsx`. Zero impacto no banco de dados, no Prisma ou na API NestJS.

## User Stories

### US1 — Experiência Autenticada e Ações Contextuais no Hero (Priority: P1)

Como usuário autenticado acessando a tela inicial, quero visualizar as ações da minha biblioteca pessoal no Hero Spotlight ou atalhos para adicionar a obra ao meu acervo, para que nunca receba chamadas indevidas para criar conta quando já estou conectado.

- **Why this priority:** É um defeito visível de autenticação na página principal do sistema que quebra a coerência da experiência logada.
- **Independent Test:** Acessar a rota raiz autenticado sem ter a obra do destaque na biblioteca e verificar que o botão exibido é "+ Adicionar à Lista" e "Ver Detalhes", sem botão de cadastro.

### US2 — Eliminação de Eyebrows, Selos Fictícios e Emojis (Priority: P1)

Como apreciador de design editorial limpo, quero que os cabeçalhos e o perfil não utilizem etiquetas mono desnecessárias nem selos artificiais, para que o produto transmita uma identidade autêntica, humana e desprovida de clichês visuais de IA.

- **Why this priority:** Restaura a elegância editorial do produto e atende diretamente às diretrizes visuais e constitucionais (zero emojis).
- **Independent Test:** Inspecionar os cabeçalhos da Home, Biblioteca, Calendário e Perfil e comprovar ausência de etiquetas mono em caixa alta e ausência de emojis.

### US3 — De-Pilling, De-Boxing e Cromo Neutro na Biblioteca e Home (Priority: P2)

Como usuário gerenciando minha coleção, quero que a biblioteca utilize abas limpas sem excesso de pílulas e cromo neutro que deixe as capas reais brilharem, para que a navegação seja funcional e a hierarquia visual clara.

- **Why this priority:** Melhora a ergonomia do acervo e elimina o ruído de caixas aninhadas e fundos coloridos artificiais.
- **Independent Test:** Navegar pela biblioteca pessoal e comprovar abas de status em linha única limpa e cards em cromo neutro sem tingimento de categoria.

## Success Criteria

- **SC-001**: Usuário autenticado na rota raiz jamais visualiza botão de "Criar Conta Gratuita", mesmo que não possua a obra do destaque no acervo.
- **SC-002**: Obras em andamento no status `ASSISTINDO` ou `LENDO` são carregadas corretamente no Hero Spotlight e no componente Continuar Acompanhando.
- **SC-003**: Nenhuma página da aplicação contém etiquetas eyebrow em caixa alta com estilo mono ("Destaque do Diário", "Ledger Pessoal v2.4", "Temporada de Outono 2026").
- **SC-004**: A rota `/library` exibe abas de status em linha única limpa sem formato de pílula inflada e cards em cromo neutro sem tingimento colorido artificial por categoria.
- **SC-005**: O painel BentoSidebar e os cards de biblioteca utilizam tipografia regular com `tabular-nums` em vez de `font-mono` para números e métricas comuns.
- **SC-006**: A página `/profile` não contém selos "Colecionador" / "Acervo Privado" e possui zero emojis em botões e elementos visuais.

## Edge Cases

- Usuário autenticado com biblioteca totalmente vazia: o Hero Spotlight exibe botão "+ Adicionar à Lista" e "Ver Detalhes" de forma graciosa sem disparar exceções.
- Títulos com múltiplos gêneros ou caracteres especiais: renderização estável sem textos duplicados ou fantasmas no card.

## Out of Scope

- Modificações no schema do Prisma ou criação de novos endpoints na API NestJS.
- Alterações em serviços ou integração de APIs externas de dados.

## Clarifications

### Session 2026-11-12

- Q: Ação no Hero da Home para usuário logado que ainda não adicionou o destaque ao acervo? → A: Opção A aprovada: Exibir botão "+ Adicionar à Lista" com feedback tátil e botão "Ver Detalhes", preservando a barra de progresso apenas quando a obra já estiver no acervo.
- Q: Reestruturação das abas e filtros na Biblioteca (`LibraryFilters`)? → A: Opção A aprovada: Abas editoriais limpas em linha única para status com linha indicadora de estado ativo (sem formato de pílula) e seletor plano e discreto para categorias.
- Q: De-boxing do painel lateral (Bento Sidebar) na Home? → A: Opção A aprovada: Unificar a coluna lateral em uma seção fluida integrada diretamente na superfície, separando Resumo Semanal, Constância e Próximas Estreias por divisores de linha sutis (`divide-y border-stroke-subtle`) em vez de múltiplos cards isolados com caixas e bordas pesadas.

