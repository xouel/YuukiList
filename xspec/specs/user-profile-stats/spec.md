# user-profile-stats Specification

## Purpose

Modelar os dados analiticos e metricas de consumo do perfil do usuario no YuukiList, consolidando tempo investido, distribuicao por categoria, genero, pais e vitrine de obras favoritas.

## Requirements

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar metricas analiticas de consumo apresentando-as em formato compacto com paleta Asian Editorial e rotulos humanizados a partir do acervo completo da biblioteca.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a identificacao do usuario sem selos decorativos vazios e sem emojis, posicionando a vitrine de favoritos conectada a biblioteca com prioridade visual no topo do perfil, assegurando superficies semanticas e mantendo dados privados restritos.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuario autenticado com obras sinalizadas como favoritas na biblioteca pessoal
- **WHEN** o perfil do usuario e renderizado na rota /profile
- **THEN** a interface SHALL renderizar no topo a vitrine exibindo os cards das obras favoritas sincronizadas com suas respectivas capas e categorias a partir do banco de dados

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
