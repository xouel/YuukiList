## MODIFIED Requirements

### Requirement: Continue Watching Feed and Active Progress
O Home Hub SHALL consultar a biblioteca do usuário autenticado e renderizar na seção Continuar Acompanhando as obras ativas (ASSISTINDO ou LENDO) com botão de avanço rápido, adotando superfícies semânticas e cores adaptáveis a ambos os temas visuais.

#### Scenario: Exibicao de obras ativas em andamento para usuario autenticado
- **GIVEN** um usuário autenticado com registros na biblioteca com status ASSISTINDO ou LENDO
- **WHEN** a página inicial do Home Hub é carregada
- **THEN** o sistema SHALL renderizar a seção Continuar Acompanhando exibindo os cards das obras ativas com capa, título e progresso atual

#### Scenario: Incremento rapido de unidade a partir do Home Hub
- **GIVEN** uma obra ativa renderizada na seção Continuar Acompanhando
- **WHEN** o usuário clica no botão de incremento rápido de episódio ou capítulo
- **THEN** o sistema SHALL atualizar otimisticamente a contagem na interface e persistir o novo progresso no banco de dados

#### Scenario: Concordancia visual e suporte integral ao tema claro no Home Hub
- **GIVEN** a página inicial renderizada em Modo Claro
- **WHEN** a seção Continuar Acompanhando e os cards de tendências são exibidos
- **THEN** os contêineres SHALL adotar classes de superfície semânticas (bg-surface-raised) e títulos escuros legíveis sem classes hexadecimais estáticas escuras

