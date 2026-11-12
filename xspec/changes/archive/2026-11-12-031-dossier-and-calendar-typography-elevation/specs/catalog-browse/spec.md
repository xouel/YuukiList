# catalog-browse Specification Delta

## MODIFIED Requirements

### Requirement: Item Details View and Navigation History
A aplicação SHALL fornecer o dossiê detalhado da obra na rota /items/:slug na tipografia Shippori Mincho (font-serif), com capa despoluída em proporção rígida 2:3 sem distorção hover nem badges artificiais sobrepostos, quatro métricas em tokens semânticos, console pessoal de acompanhamento, gerenciador interativo de episódios por temporadas, ficha técnica e sidebar analítica, preservando o retorno acessível ao catálogo e contraste WCAG 2.2 AA.

#### Scenario: Navegação para a página de detalhes da obra por slug
- **GIVEN** um card de obra exibido na grade
- **WHEN** o usuário seleciona o card
- **THEN** a aplicação navega para a rota /items/:slug exibindo capa vetorial, sinopse, gêneros e metadados completos

#### Scenario: Retorno ao catálogo preservando filtros e rolagem
- **GIVEN** o usuário na página de detalhes após navegar a partir de uma busca filtrada
- **WHEN** o usuário aciona o botão de retorno
- **THEN** a aplicação volta à tela de catálogo restaurando os filtros ativos e a posição de rolagem prévia

#### Scenario: Acessibilidade de foco e contraste WCAG 2.2 AA
- **GIVEN** a navegação na interface através do teclado
- **WHEN** o usuário utiliza as teclas Tab e Enter para navegar entre cards e controles
- **THEN** todos os elementos interativos possuem anel de foco claramente visível e contraste de cor em conformidade com o padrão WCAG 2.2 AA

#### Scenario: Exibicao da faixa de metricas editoriais e console pessoal de acompanhamento
- **GIVEN** uma obra carregada na rota /items/:slug
- **WHEN** o cabeçalho do dossiê é renderizado
- **THEN** a interface SHALL exibir faixa com quatro métricas principais em tokens semânticos e console de acompanhamento pessoal com status, nota, tempo assistido e progresso relativo

#### Scenario: Gerenciador de episodios com abas de temporadas e marcacao em lote
- **GIVEN** uma série com episódios e temporadas registradas
- **WHEN** o usuário visualiza o gerenciador de episódios
- **THEN** a interface SHALL organizar os itens em abas de temporadas, prover botão para marcar toda a temporada e permitir alternar o status de cada episódio individual

#### Scenario: Painel lateral com distribuicao de notas provedores oficiais e ficha tecnica
- **GIVEN** a visualização detalhada da obra
- **WHEN** a coluna lateral e a sinopse são carregadas
- **THEN** o sistema SHALL renderizar histograma de distribuição de notas da comunidade, plataformas oficiais onde assistir com links externos seguros e créditos da equipe técnica

#### Scenario: Tipografia Shippori Mincho e capa cinematografica despoluida
- **GIVEN** o usuário acessando a rota /items/:slug
- **WHEN** o dossiê detalhado é renderizado na tela
- **THEN** a interface SHALL exibir o título principal em font-serif (Shippori Mincho) e a capa em proporção 2:3 sem selos artificiais sobrepostos nem distorção de escala hover:scale-105

#### Scenario: Paineis e consoles baseados integralmente em tokens semanticos
- **GIVEN** o dossiê da obra renderizado sob qualquer tema ativo
- **WHEN** a interface apresenta as métricas, console e sinopse
- **THEN** todas as superfícies e textos SHALL utilizar tokens semânticos do sistema sem valores hexadecimais brutos hardcoded

