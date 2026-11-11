# Proposal: Redesign Editorial da Exploração do Catálogo e Controles

> **X-Spec** · ID: `019-catalog-editorial-browse` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

A tela de exploração do catálogo ('/') sofre atualmente com poluição visual de controles (barra de busca gigante, 7 chips de categoria e 4 selects na mesma dobra competindo por atenção), colisão de textos no rodapé dos cards de mídia (gêneros colidindo com status, gerando truncamentos como 'Suspense, Dr...Desconhecida'), badges com arco-íris de 6 cores descontextualizadas e falta de distinção de estado para obras já salvas na biblioteca. Esta mudança remodela a experiência de exploração conforme o Design System Asian Editorial: consolida a barra de busca e filtros em uma faixa primária elegante com drawer recolhível para 'Mais Filtros', elimina colisões reservando espaço dedicado para o status da obra, adota badges editoriais discretos diferenciando mídias audiovisuais de impressas e inclui alternância visual no botão de ação rápida ('+ Adicionar' vs '✓ Na Biblioteca').

## What Changes

- **Barra Primária Condensada e Drawer "Mais Filtros"**: Unificação da barra de busca e dos chips de categoria em uma faixa horizontal primária coesa, movendo filtros secundários (país de origem, temas transversais, status da obra e ordenação) para um drawer/painel recolhível acessível.
- **Prevenção Definitiva de Colisão em Cards de Mídia**: Separação estrutural entre gêneros e status nos cards (`MediaCard`), eliminando sobreposição e truncamentos feios através de um espaço dedicado e fixo para cada metadado.
- **Desambiguação e Taxonomia do Status da Obra**: Padronização estrita dos rótulos de publicação da obra (`Em Lançamento`, `Concluída`, `Hiato`, `Cancelada`), eliminando termos ambíguos de status pessoal do usuário na visão de catálogo.
- **Badges de Categoria Editoriais**: Substituição do arco-íris de 6 cores por uma codificação editorial minimalista e discreta (Audiovisual: Doramas e Filmes em ocre `#D4A373`, Animes em lavanda `#9D8DF1`; Impresso: Mangás, Manhwas e Manhuas em terracota `#D97757`).
- **Alternância Visual no Botão de Ação Rápida**: Alternância de estado do botão rápido do card entre `+ Adicionar` (para itens não salvos) e `✓ Na Biblioteca` (para obras já presentes na biblioteca do usuário).

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `catalog-browse`: Atualização dos requisitos de exploração do catálogo com a nova barra condensada e painel expansível de filtros avançados, eliminação de colisão de textos nos cards de mídia, badges editoriais discretos de categoria e alternância visual de presença na biblioteca no botão de ação rápida.

## Impact

- **Código Frontend (`apps/web`)**:
  - `apps/web/src/components/catalog/filter-bar.tsx`: Reestruturação da barra de controles e implementação do drawer recolhível "Mais Filtros".
  - `apps/web/src/components/catalog/media-card.tsx`: Redesenho do rodapé anti-colisão, badges editoriais discretos e estado alternado de inclusão na biblioteca.
  - `apps/web/src/components/catalog/catalog-view.tsx`: Integração da nova barra de controles primária e sincronização com parâmetros de busca da URL.
- **Banco de Dados & APIs**: Zero impacto (reutiliza endpoints existentes de `/items`, parâmetros de busca e consulta à biblioteca).
- **Testes**: Criação de suíte de testes de interface editorial e layout em `tests/catalog-editorial-browse.test.mjs`.

## User Stories

### US1 — Barra de Controles Condensada e Drawer de Filtros (Priority: P1)
Como visitante ou membro navegando pelo catálogo, quero uma interface limpa com busca rápida e categorias principais em destaque, e a possibilidade de abrir filtros avançados sem que eles sobrecarreguem a visão inicial.

- **Why this priority:** Resolve a sobrecarga cognitiva e poluição visual apontada na revisão de design (U2).
- **Independent Test:** Acessar a tela inicial `/`, verificar que a primeira dobra apresenta apenas a barra de busca e categorias principais, e acionar o botão "Mais Filtros" para abrir o painel com filtros de país, status, temas e ordenação.

### US2 — Cards Livres de Colisão com Status Dedicado e Badges Editoriais (Priority: P1)
Como fã explorando obras, quero ler com nitidez os gêneros, o tipo de mídia e o status de lançamento sem que palavras sejam cortadas ou colidam entre si no card.

- **Why this priority:** Corrige o grave defeito visual de colisão de strings ("Suspense, Dr...Desconhecida") e melhora a estética geral.
- **Independent Test:** Renderizar cards com títulos e múltiplos gêneros longos e verificar que os gêneros e o status ocupam linhas/posições independentes sem sobreposição.

### US3 — Indicação Visual de Obra Já Presente na Biblioteca (Priority: P2)
Como usuário logado, quero identificar imediatamente quais obras já adicionei à minha estante ao navegar pelo catálogo, para evitar tentativas redundantes de adição.

- **Why this priority:** Melhora a usabilidade e feedback instantâneo da biblioteca pessoal diretamente no catálogo.
- **Independent Test:** Adicionar uma obra à biblioteca e verificar que o botão do card transiciona de `+ Adicionar` para `✓ Na Biblioteca`.

## Success Criteria

- **SC-001**: A barra de exploração consolida busca e categorias em linha primária elegante, disponibilizando filtros secundários (país, status, temas, ordenação) em drawer ou sanfona expansível.
- **SC-002**: Os cards de mídia (`MediaCard`) não apresentam colisão ou truncamento acidental entre gêneros e status da obra, reservando espaço dedicado para cada metadado e aplicando a paleta editorial por tipo de mídia.
- **SC-003**: O status da obra exibe a taxonomia canônica da obra (`Em Lançamento`, `Concluída`, `Hiato`, `Cancelada`) e o botão de ação rápida indica claramente `✓ Na Biblioteca` quando o item já estiver salvo.

## Edge Cases

- Obras com muitos gêneros longos devem aplicar reticências suaves exclusivamente aos gêneros secundários sem invadir o espaço do status ou dos botões de ação.
- Em telas menores de smartphones (< 640px), o drawer de filtros avançados deve abrir em painel deslizante ou modal acessível preservando o foco de teclado.
- Usuários não autenticados visualizam o botão `+ Adicionar` com redirecionamento apropriado para login sem provocar falhas ou estados inconsistentes.

## Out of Scope

- Redesign da tela "Minha Biblioteca" e controles de episódios/capítulos (escopo da fatia R20).
- Reestruturação do Calendário semanal em turnos (escopo da fatia R21).
- Vitrine de favoritos e reorganização do Perfil (escopo da fatia R22).

## Clarifications

### Session 2026-11-10
- Q: Como acomodar os filtros de país, temas, status e ordenação sem poluir a dobra inicial? → A: Manter busca e seleção de categoria na barra horizontal primária e alocar os demais filtros em um drawer/acordeão expansível "Mais Filtros".
- Q: Como diferenciar categorias sem recorrer ao arco-íris de tags? → A: Adotar codificação editorial discreta agrupada (Audiovisual: ocre/lavanda; Impresso: terracota) ou monocromática elegante com ícone.
- Q: Qual a distinção de status para a obra no catálogo? → A: Status da obra (Explorar e Calendário): Em Lançamento, Concluída, Hiato, Cancelada (não misturar com status de leitura/visualização do usuário).

