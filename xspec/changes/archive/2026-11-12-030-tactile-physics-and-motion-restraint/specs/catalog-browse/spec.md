# Spec Delta: catalog-browse

## MODIFIED Requirements

### Requirement: Media Card Quick Actions and Enhanced Exploration
A interface do catálogo SHALL fornecer cards de mídia com física tátil e micro-pressão no clique (:active:scale-[0.98]), números tabulares (tabular-nums), ausência de zoom agressivo de capa (hover:scale-105), ações rápidas de inclusão e badges editoriais discretos.

#### Scenario: Adicao rapida de obra a biblioteca pessoal a partir do card
- **GIVEN** um usuário autenticado visualizando a grade de obras do catálogo
- **WHEN** o usuário aciona o botão de ação rápida no card da obra
- **THEN** o sistema SHALL fornecer resposta elástica imediata no clique e registrar o item na biblioteca com o status canônico padrão atualizando o estado visual imediatamente

#### Scenario: Alternancia visual do botao de acao rapida para obras salvas
- **GIVEN** uma obra já presente na biblioteca pessoal do usuário
- **WHEN** o usuário visualiza o card correspondente na grade de exploração
- **THEN** o botão de ação rápida exibe o estado de confirmação visual "Na Biblioteca" em vez de opção de inclusão

#### Scenario: Disposicao anti-colisao e badges editoriais no card de midia
- **GIVEN** obras com múltiplos gêneros e status de publicação longo
- **WHEN** os cards de mídia são renderizados na grade
- **THEN** os metadados de gênero e status ocupam slots independentes com números tabulares e a capa é destacada sem distorção de escala hover:scale-105

