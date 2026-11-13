# Spec Delta

## MODIFIED Requirements

### Requirement: Private Library Listing and Multi-User Isolation
O sistema SHALL listar os itens da biblioteca pessoal com suporte a filtros combinados e carregamento em lote/join de metadados de mídia sem consultas N+1 sequenciais, garantindo isolamento estrito entre usuários e bloqueio a acessos anônimos.

#### Scenario: Listagem da biblioteca pessoal com filtros por status e categoria
- **GIVEN** um usuário autenticado com múltiplas obras em sua biblioteca pessoal
- **WHEN** o usuário consulta `GET /api/v1/library` informando filtros de status pessoal e categoria
- **THEN** o sistema SHALL retornar a lista paginada contendo apenas as obras que satisfazem simultaneamente os critérios informados

#### Scenario: Isolamento estrito entre usuários impedindo acesso a bibliotecas alheias
- **GIVEN** dois usuários distintos, Usuário A e Usuário B, cada um com itens em sua própria biblioteca
- **WHEN** o Usuário A lista sua biblioteca ou tenta alterar um item pertencente ao Usuário B
- **THEN** o sistema SHALL retornar apenas os itens do Usuário A e bloquear com HTTP 404 Not Found qualquer manipulação de itens de terceiros

#### Scenario: Bloqueio de acesso anônimo aos endpoints de biblioteca pessoal
- **GIVEN** uma requisição sem cookie de sessão ou credenciais válidas
- **WHEN** um cliente tenta acessar qualquer endpoint de `/api/v1/library`
- **THEN** o sistema SHALL interceptar a chamada e responder com HTTP 401 Unauthorized

#### Scenario: Carregamento em lote da biblioteca sem queries N+1 sequenciais
- **GIVEN** um usuário com 15 ou mais obras salvas na tabela `UserLibraryItem` no Supabase PostgreSQL
- **WHEN** `LibraryService.listUserLibrary` consulta a biblioteca via repositório
- **THEN** os metadados de `MediaItem` e gêneros são resolvidos via inclusão/consulta em lote em até 2 chamadas ao repositório, eliminando timeouts por loop sequencial de `findById`

