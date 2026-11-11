# Proposal: Asian Editorial Foundation & Shell Unificado

> **X-Spec** · ID: `018-asian-editorial-foundation` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

O YuukiList foi construído com arquitetura sólida, mas sua casca visual e paleta padrão herdaram traços de um painel de monitoramento em nuvem genérico (fundo azul-escuro #080A11, acentos ciano neon, gradiente tech no logotipo e desalinhamento de largura entre telas). Para alinhar a experiência à riqueza do catálogo de doramas, animes e mangás, esta mudança estabelece a fundação do Design System Asian Editorial: paleta inspirada em nanquim mineral (#121115), papel (#F4EFEA) e carmim (#E05347), tipografia em três níveis com serifa editorial para títulos e sans geométrica neutra para interface, logotipo tipográfico refinado e unificação do container principal em max-w-7xl em todas as telas.

## What Changes

- **Fundação de Cores Asian Editorial**: Substituição da paleta ciano/neon por tons orgânicos minerais em `globals.css`: Base Nanquim (`#121115`), Superfície Estante (`#1A1820`), Bordas Fio (`#2B2735`), Texto Principal Papel (`#F4EFEA`), Metadados Grafite Neutro (`#9C96A2` com contraste ≥ 4.5:1) e Acento Carmim (`#E05347`) para estados críticos e favoritos.
- **Tipografia em Três Níveis**: Integração de fonte serifada editorial (Shippori Mincho / Playfair Display) para títulos e destaques, sans-serif geométrica neutra (Plus Jakarta Sans / Inter) para corpo e controles de interface, e estilização refinada com 70% de opacidade para títulos nativos asiáticos (Hangul, Kanji, Hanzi).
- **Logotipo e Wordmark Tipográfico**: Remoção do gradiente tech ciano-roxo e subtítulo em caixa alta da Sidebar, adotando um wordmark tipográfico sóbrio e minimalista.
- **Alinhamento e Container Global Unificado**: Padronização da largura máxima em `max-w-7xl` com margens e preenchimentos horizontais idênticos em toda a casca de navegação, eliminando o desalinhamento de margens entre páginas.
- **Humanização dos Rótulos Técnicos**: Atualização dos rótulos do rodapé da barra lateral ("Central & Tema" → "Notificações & Aparência"; "Soberania de Dados & LGPD" → "Privacidade & Seus Dados").

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `navigation-shell`: Atualização dos requisitos da casca de navegação com o Design System Asian Editorial, nova paleta de cores mineral/papel, tipografia em três níveis, wordmark minimalista e container global unificado em max-w-7xl.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/app/globals.css`: Variáveis CSS semânticas de tema mineral/papel/carmim e classes de tipografia editorial.
  - `apps/web/src/app/layout.tsx`: Configuração de fontes web e container global.
  - `apps/web/src/components/layout/navigation-shell.tsx`: Novo wordmark tipográfico, classes semânticas minerais e rótulos amigáveis.
  - `apps/web/src/components/layout/legal-footer.tsx`: Alinhamento visual e tipográfico ao novo tema editorial.
- **Banco de Dados & APIs**: Zero impacto (alteração puramente de camada de apresentação cliente).
- **Testes**: Criação de suíte de testes de design system e tipografia editorial em `tests/asian-editorial-foundation.test.mjs`.

## User Stories

### US1 — Identidade Visual Asian Editorial & Tipografia (Priority: P1)
Como fã de obras asiáticas navegando pelo YuukiList, quero vivenciar uma identidade estética refinada inspirada em papel e nanquim com tipografia serifada elegante nos títulos, para que a plataforma transmita o tom cultural e editorial do catálogo.

- **Why this priority:** É a fundação estética e sensorial de todo o redesign do produto.
- **Independent Test:** Carregar a aplicação e inspecionar visualmente a paleta de fundo `#121115`, textos `#F4EFEA`, acento `#E05347` e a renderização das famílias tipográficas nos títulos e corpo.

### US2 — Alinhamento e Container Global Unificado (Priority: P1)
Como usuário navegando entre as abas principais, quero que todas as páginas compartilhem exatamente o mesmo grid horizontal e alinhamento de bordas, sem saltos de largura entre telas.

- **Why this priority:** Corrige a quebra de consistência e alinhamento identificada nas capturas de tela.
- **Independent Test:** Navegar entre as páginas e verificar que o container principal mantém consistentemente a largura máxima `max-w-7xl` com preenchimentos horizontais padronizados.

### US3 — Wordmark Tipográfico & Rótulos Humanizados na Casca (Priority: P2)
Como visitante interagindo com o menu lateral, quero visualizar uma marca limpa e rótulos compreensíveis sem jargões de desenvolvimento ou gradientes artificiais.

- **Why this priority:** Elimina o aspecto de dashboard SaaS e melhora a clareza para o usuário comum.
- **Independent Test:** Verificar que a sidebar exibe o wordmark tipográfico limpo e que os links de configuração utilizam "Notificações & Aparência" e "Privacidade & Seus Dados".

## Success Criteria

- **SC-001**: O tema padrão aplica com precisão a paleta mineral: fundo `#121115`, superfície `#1A1820`, bordas `#2B2735`, textos `#F4EFEA` e acento `#E05347`.
- **SC-002**: A escala tipográfica em 3 níveis está ativa, aplicando fontes serifadas nos títulos e sans-serif neutra na interface com contraste ≥ 4.5:1 verificado em todos os metadados.
- **SC-003**: Todas as telas renderizam dentro do container `max-w-7xl` com margens perfeitamente consistentes e sem gradientes ciano/neon.

## Edge Cases

- Títulos nativos com ideogramas CJK (Hangul, Kanji, Hanzi) devem manter legibilidade suave e espaçamento regular sem quebra de linha espúria.
- O modo claro (Light Editorial) deve mapear harmoniosamente os tons de papel (`#F8FAFC` / `#FFFFFF`) com tinta escura (`#1A1820`).
- Telas ultralargas (> 1920px) devem centralizar o container `max-w-7xl` sem esticar a tipografia ou desconectar a barra lateral.

## Out of Scope

- Redesign interno dos filtros avançados e cards do catálogo (escopo da fatia R19).
- Modificação dos controles de progresso e abas da biblioteca (escopo da fatia R20).
- Redesign do calendário e do perfil (escopo das fatias R21 e R22).

## Clarifications

### Session 2026-11-10
- Q: Qual a paleta de cores para substituir o visual ciano/neon? → A: Base Nanquim `#121115`, Superfície `#1A1820`, Bordas `#2B2735`, Texto `#F4EFEA`, Metadados `#9C96A2` e Acento Carmim `#E05347`.
- Q: Quais famílias tipográficas compõem a escala editorial? → A: Serifada editorial para títulos, sans-serif neutra geométrica para UI e Noto Sans CJK para títulos nativos com 70% de opacidade.
- Q: Qual a regra de largura de container global? → A: Container uniforme `max-w-7xl` em todas as telas com margens consistentes.

