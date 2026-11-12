## MODIFIED Requirements

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a identificação do usuário sem selos decorativos vazios e sem emojis, posicionando a vitrine de favoritos com prioridade visual, assegurando superfícies semânticas adaptadas a ambos os temas e mantendo anotações privadas e telefone restritos ao titular.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuário autenticado com obras sinalizadas com o indicador de favorito no banco de dados
- **WHEN** o perfil do usuário é renderizado na rota /profile
- **THEN** a interface SHALL renderizar uma seção dedicada exibindo os cards das obras favoritas sincronizadas com suas respectivas capas e categorias

#### Scenario: Ocultacao estrita de anotacoes privadas para terceiros
- **GIVEN** uma obra na biblioteca contendo notas pessoais confidenciais do usuário ou dados de contato
- **WHEN** os dados de perfil são solicitados em contexto compartilhado ou de terceiros
- **THEN** o sistema SHALL omitir o campo de notas e telefone garantindo que apenas informações publicamente autorizadas sejam expostas

#### Scenario: Inversao de hierarquia com vitrine de favoritos no topo do perfil
- **GIVEN** um usuário acessando sua página de perfil na rota /profile
- **WHEN** o conteúdo do perfil é renderizado na tela
- **THEN** a vitrine de favoritos SHALL aparecer posicionada com destaque acima dos blocos de métricas analíticas e configurações de dados

#### Scenario: Estado amigavel para vitrine sem favoritos
- **GIVEN** um usuário que ainda não favoritou nenhuma obra
- **WHEN** o perfil é renderizado na interface
- **THEN** o sistema SHALL exibir convite visual acolhedor orientado ao catálogo sem telas de erro

#### Scenario: Identificacao do usuario sem selos decorativos vazios e sem emojis
- **GIVEN** a página de perfil renderizada na rota /profile
- **WHEN** o cabeçalho de perfil do usuário é exibido
- **THEN** a interface SHALL omitir selos decorativos vazios como 'Colecionador' e 'Acervo Privado' e não conter emojis em botões de compartilhamento

#### Scenario: Harmonizacao semantica de superficies e textos do perfil
- **GIVEN** a visualização do perfil do usuário em Modo Claro ou Modo Escuro
- **WHEN** os blocos de perfil, vitrine de favoritos e métricas analíticas são exibidos
- **THEN** os contêineres e textos SHALL adotar superfícies e cores semânticas sem classes hexadecimais escuras fixas (bg-[#1A1820], text-[#F4EFEA])

