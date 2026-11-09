# Spec Delta

## ADDED Requirements

### Requirement: Library Favorites Rewatch Tracking and Advanced Sorting
O backend da biblioteca pessoal SHALL suportar marcação de favoritos independente de notas, controle de ciclos de reassistir/reler com contador cumulativo e ordenações avançadas do acervo.

#### Scenario: Marcacao de obra como favorita independente da nota
- **GIVEN** uma obra presente na biblioteca pessoal do usuário
- **WHEN** o usuário atualiza a propriedade isFavorite para verdadeiro através do endpoint de atualização
- **THEN** o sistema SHALL persistir a marcação de favorito sem alterar a nota atribuída à obra

#### Scenario: Gestao de ciclos de reassistir e reler
- **GIVEN** uma obra na biblioteca pessoal do usuário
- **WHEN** o usuário envia requisição informando incremento de rewatchCount e opcionalmente reinício do progresso
- **THEN** o sistema SHALL atualizar atomicamente o contador de visualizações repetidas e o progresso correspondente

#### Scenario: Ordenacao avancada e filtragem por favoritos
- **GIVEN** um usuário com múltiplos itens cadastrados em sua biblioteca pessoal
- **WHEN** o usuário solicita a listagem especificando ordenação por avaliação, progresso, lançamento ou filtro exclusivo de favoritos
- **THEN** o sistema SHALL retornar os itens rigorosamente ordenados e filtrados pelos critérios solicitados
