# Spec Delta

## ADDED Requirements

### Requirement: Media Card Quick Actions and Enhanced Exploration
A interface do catálogo SHALL fornecer ações rápidas de inclusão na biblioteca diretamente nos cards de mídia e filtros combinados por país de origem e atributos transversais.

#### Scenario: Adicao rapida de obra a biblioteca pessoal a partir do card
- **GIVEN** um usuário autenticado visualizando a grade de obras do catálogo
- **WHEN** o usuário aciona o botão de ação rápida no card da obra
- **THEN** o sistema SHALL registrar o item na biblioteca com o status canônico padrão da categoria e atualizar o estado visual do card imediatamente

#### Scenario: Filtragem combinada por pais de origem e temas transversais
- **GIVEN** o catálogo de obras exibido na interface
- **WHEN** o usuário seleciona filtros de país de origem e tema transversal
- **THEN** a interface SHALL atualizar a listagem exibindo somente as obras compatíveis com todos os critérios selecionados

