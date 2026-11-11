# Proposal: Editorial Profile Showcase Inversion and Analytics Polish

> **X-Spec** · ID: `022-editorial-profile-showcase` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

A tela de Perfil ('/profile') apresenta uma hierarquia invertida em relação à proposta de valor do YuukiList: exibe inicialmente grandes tabelas e painéis analíticos complexos com gráficos e gradientes ciano/violeta genéricos, empurrando a vitrine de obras favoritas para o rodapé da página. Na experiência de uma plataforma de entretenimento asiático, a identidade cultural e o gosto do usuário (seus doramas, animes e mangás prediletos) devem ser o cartão de visitas imediato. Esta mudança executa o redesign Asian Editorial do perfil: posiciona a vitrine de favoritos no topo logo abaixo do cabeçalho de identificação com capas em proporção 2:3, reorganiza as métricas analíticas em um painel compacto e elegante ou abas secundárias, humaniza os rótulos de dados e privacidade, e harmoniza todo o layout com a paleta mineral (nanquim '#121115', superfícies '#1A1820', bordas '#2B2735' e acento carmim '#E05347').

## What Changes

- **Inversão da Vitrine de Favoritos para o Topo**: Posicionamento da vitrine de favoritos imediatamente abaixo do cabeçalho de identificação do usuário, transformando os títulos prediletos no cartão de visitas central do perfil.
- **Cards Editoriais de Obras Favoritas**: Redesign dos cards de favoritos com proporção 2:3 clássica, tipografia em serifa moderna para títulos, destaque da nota pessoal (`★ 9.5`) e indicador discreto de coração carmim `#E05347`.
- **Métricas Analíticas Compactas**: Reformulação da seção de estatísticas de consumo em painel compacto e refinado, apresentando métricas-chave (horas investidas, títulos concluídos, capítulos e média de avaliações) e distribuição por categoria sem empurrar a vitrine.
- **Rótulos Humanizados de Dados e Privacidade**: Substituição de jargões técnicos por termos claros e amigáveis (ex.: `Acervo Pessoal`, `Soberania dos Seus Dados`, `Membro desde`).
- **Paleta Asian Editorial Unificada**: Eliminação dos gradientes ciano e violeta genéricos no avatar e nos cards, adotando nanquim `#121115`, superfícies `#1A1820`, bordas `#2B2735` e acento carmim `#E05347` alinhados ao container global `max-w-7xl`.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `user-profile-stats`: Atualização dos requisitos da interface de perfil do usuário para priorizar a vitrine de favoritos no topo da página, reorganizar as métricas analíticas em formato compacto e adotar o padrão Asian Editorial.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/app/profile/page.tsx`: Inversão hierárquica (favoritos no topo, estatísticas compactas), cabeçalho editorial e integração com `max-w-7xl`.
  - `apps/web/src/components/profile/favorites-showcase.tsx`: Cards com capas 2:3, selos editoriais, coração carmim e estado acolhedor quando vazio.
  - `apps/web/src/components/profile/profile-stats.tsx`: Formato compacto e equilibrado de métricas-chave e barras proporcionais em tons minerais.
- **Banco de Dados & APIs**: Zero impacto estrutural (utiliza os endpoints existentes de `profileApiClient.getStats()`).
- **Testes**: Criação da suíte de testes de interface editorial do perfil em `tests/editorial-profile-showcase.test.mjs`.

## User Stories

### US1 — Vitrine de Favoritos com Prioridade Máxima no Topo do Perfil (Priority: P1)
Como usuário apaixonado pelas minhas obras prediletas, quero que meus doramas, animes e mangás favoritos fiquem no topo do meu perfil para que qualquer visitante ou eu mesmo vejamos minha identidade cultural antes de tabelas frias de dados.

- **Why this priority:** Corrige a principal falha de narrativa e hierarquia apontada na revisão de design.
- **Independent Test:** Acessar `/profile` e verificar que a seção de Favoritos é renderizada logo abaixo do cabeçalho de identificação, precedendo o painel analítico.

### US2 — Métricas Analíticas Compactas e Rótulos Humanizados (Priority: P1)
Como usuário acompanhando minha rotina de consumo, quero consultar minhas estatísticas de horas, obras concluídas e categorias de forma compacta, limpa e com vocabulário acolhedor.

- **Why this priority:** Fornece clareza sobre o tempo investido sem sobrecarregar a tela com gráficos e tabelas hipertrofiadas.
- **Independent Test:** Visualizar a seção analítica do perfil e constatar o formato compacto das 4 métricas principais e barras de distribuição proporcional em paleta editorial.

### US3 — Harmonização Asian Editorial e Soberania de Dados Acessível (Priority: P2)
Como usuário gerenciando minha conta, quero uma interface coesa na paleta Asian Editorial e opções claras para exportar meus dados ou gerenciar a privacidade sem atritos.

- **Why this priority:** Harmoniza a tela com o container global e respeita a soberania de dados do usuário (LGPD).
- **Independent Test:** Conferir a presença dos botões de exportação (JSON/CSV) e compartilhamento em cartões com a paleta `#1A1820` / `#2B2735`.

## Success Criteria

- **SC-001**: A vitrine de favoritos é renderizada como o primeiro bloco de conteúdo imediatamente abaixo do cabeçalho de identificação em `/profile`.
- **SC-002**: Os cards de obras favoritas utilizam proporção editorial 2:3, tipografia moderna em serifa para títulos, nota destacada e ícone de favorito carmim `#E05347`.
- **SC-003**: As métricas analíticas são estruturadas em painel compacto com rótulos humanizados e paleta mineral Asian Editorial, integrando-se perfeitamente ao container `max-w-7xl`.

## Edge Cases

- Usuários recém-cadastrados ou sem obras favoritadas devem visualizar uma mensagem acolhedora convidando a marcar favoritos no catálogo com link direto.
- Usuários sem obras concluídas visualizam as métricas analíticas zeradas de forma elegante sem erros de divisão ou barras quebradas.
- Em telas estreitas de smartphones, a vitrine de favoritos adapta-se a uma grade fluida de 2 colunas com tipografia legível e sem overflow horizontal.

## Out of Scope

- Edição de campos de bio ou avatar personalizado por upload (mantém as opções existentes do MVP).
- Redes sociais externas integradas com postagem automática.

## Clarifications

### Session 2026-11-10
- Q: Onde deve ficar a vitrine de favoritos? → A: Diretamente no topo, imediatamente abaixo da barra de identificação do usuário, antes das estatísticas analíticas.
- Q: Como compactar as métricas analíticas para não poluir a tela? → A: Reunir os 4 indicadores-chave em grade 2x2 ou 4x1 com cards discretos e dispor a distribuição por categorias em barras proporcionais horizontais sutis.
- Q: Qual a paleta de cores para o avatar e acentos do perfil? → A: Nanquim `#121115`, superfícies `#1A1820`, bordas `#2B2735` e acento carmim `#E05347`, aposentando os gradientes ciano/violeta.

