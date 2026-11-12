# user-profile-stats Specification

## MODIFIED Requirements

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a identificação do usuário sem selos decorativos vazios ('Colecionador', 'Acervo Privado') e sem emojis em botões de ação, posicionando a vitrine de favoritos com prioridade visual conectada aos registros favoritados pelo usuário e mantendo as anotações privadas e telefone restritos ao titular.

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

## ADDED Requirements

### Requirement: User Profile Customization and Media Upload
O sistema SHALL permitir ao usuário autenticado personalizar seu perfil por meio de um modal interativo de edição, suportando upload direto de foto de avatar e capa de topo para o Supabase Storage, seleção de moldura temática entre cinco opções editoriais, biografia e telefone opcional estritamente privado.

#### Scenario: Atualizacao de perfil com foto moldura e capa via modal
- **GIVEN** um usuário autenticado na página de perfil
- **WHEN** o usuário aciona o botão de editar perfil, realiza upload de foto e capa e confirma as alterações
- **THEN** o sistema SHALL armazenar as mídias no Supabase Storage, persistir as novas URLs no registro do usuário e atualizar a interface sem recarregar a página

#### Scenario: Selecao de moldura de avatar entre os cinco estilos editoriais
- **GIVEN** o modal de edição de perfil aberto
- **WHEN** o usuário escolhe uma das cinco molduras disponíveis (Nenhuma, Nanquim Puro, Carmim Imperial, Ouro Antigo ou Sakura Suave)
- **THEN** o sistema SHALL renderizar a moldura sobre o avatar no preview em tempo real e persistir o identificador selecionado

#### Scenario: Sigilo estrito do telefone opcional conforme LGPD
- **GIVEN** um usuário com número de telefone cadastrado em seu perfil
- **WHEN** o perfil é visualizado por terceiros ou através de link compartilhado
- **THEN** o sistema SHALL omitir integralmente o número de telefone em respostas de API públicas e na tela compartilhada

