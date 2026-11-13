# user-profile-stats Specification

## Purpose

Modelar os dados analiticos e metricas de consumo do perfil do usuario no YuukiList, consolidando tempo investido, distribuicao por categoria, genero, pais e vitrine de obras favoritas.

## Requirements

### Requirement: User Profile Metrics and Consumption Analytics
O sistema SHALL consolidar metricas analiticas de consumo em lote sem consultas N+1 por item da biblioteca, apresentando-as em formato compacto com paleta Asian Editorial e rotulos humanizados a partir do acervo completo.

#### Scenario: Calculo consolidado de metricas de consumo
- **GIVEN** um usuario com obras concluidas e em acompanhamento registradas em sua biblioteca
- **WHEN** o endpoint de estatisticas de perfil e consultado
- **THEN** o sistema SHALL retornar a contagem exata de concluidos, a media ponderada de avaliacoes e o tempo estimado calculado para as categorias com duracao disponivel

#### Scenario: Consolidacao de estatisticas do perfil em lote sem loop sequencial
- **GIVEN** um usuário autenticado possuindo dezenas de obras em sua biblioteca
- **WHEN** `ProfileService.getStats` calcula tempo investido, gêneros, países e favoritos
- **THEN** o serviço SHALL utilizar os metadados de `mediaItem` pré-carregados ou resolução em lote único (`findByIds`), evitando chamadas `findById` individuais dentro de loops

### Requirement: Profile Showcase and Activity Feed Privacy
A interface do perfil SHALL renderizar a identificacao do usuario sem selos decorativos vazios e sem emojis, posicionando a vitrine de favoritos conectada a biblioteca com prioridade visual no topo do perfil, assegurando superficies semanticas e mantendo dados privados restritos.

#### Scenario: Exibicao da vitrine de obras favoritas no perfil
- **GIVEN** um usuario autenticado com obras sinalizadas como favoritas na biblioteca pessoal
- **WHEN** o perfil do usuario e renderizado na rota /profile
- **THEN** a interface SHALL renderizar no topo a vitrine exibindo os cards das obras favoritas sincronizadas com suas respectivas capas e categorias a partir do banco de dados

### Requirement: User Profile Customization and Media Upload
O sistema SHALL permitir ao usuário autenticado personalizar seu perfil via modal sincronizado, suportando upload otimizado de foto de avatar e capa (Supabase Storage quando disponível ou Data URL comprimida persistida em colunas PostgreSQL `TEXT`), falha explícita sem fallback silencioso em memória ao falhar gravação no banco, seleção entre cinco molduras editoriais, biografia e telefone opcional privado.

#### Scenario: Atualizacao de perfil com foto moldura e capa via modal
- **GIVEN** um usuário autenticado na página de perfil
- **WHEN** o usuário aciona o botão de editar perfil, realiza upload de foto e capa e confirma as alterações
- **THEN** o sistema SHALL armazenar as mídias no Supabase Storage quando configurado ou em Data URL otimizada no PostgreSQL (`TEXT`), persistir as novas URLs no registro do usuário, atualizar perfil e sessão autenticada sem recarregar a página e manter as imagens após recarregamento completo

#### Scenario: Persistencia de Data URL comprimida quando bucket Supabase Storage esta ausente
- **GIVEN** um ambiente de produção ou desenvolvimento sem bucket público `profiles` configurado no Supabase Storage
- **WHEN** o usuário envia foto de perfil ou capa gerando Data URL acima de 512 caracteres e salva o perfil via `PATCH /api/v1/profile/account`
- **THEN** o sistema SHALL otimizar/comprimir a imagem dentro do limite seguro serverless, gravar a Data URL completa na coluna `TEXT` (`avatar_url` / `banner_url`) do PostgreSQL e retornar o perfil atualizado sem expor `passwordHash`

#### Scenario: Falha explicita ao falhar persistencia do perfil no PostgreSQL
- **GIVEN** um `UsersRepository` conectado ao PostgreSQL (`PrismaClient`) e um usuário com UUID persistido
- **WHEN** uma falha de banco ocorre durante `updateProfile`
- **THEN** o sistema SHALL lançar erro explícito propagado como resposta HTTP de falha sem fingir sucesso salvando apenas na RAM volátil

#### Scenario: Sincronizacao de estado do modal ao reabrir ou carregar dados
- **GIVEN** o modal `EditProfileModal` montado antes do carregamento assíncrono do perfil ou fechado após alterações descartadas
- **WHEN** o usuário abre o modal com `isOpen = true` ou novos `initialData` são carregados
- **THEN** o formulário e os previews de avatar e capa SHALL sincronizar com os valores persistidos atuais

#### Scenario: Selecao de moldura de avatar entre os cinco estilos editoriais
- **GIVEN** o modal de edição de perfil aberto
- **WHEN** o usuário escolhe uma das cinco molduras disponíveis (Nenhuma, Nanquim Puro, Carmim Imperial, Ouro Antigo ou Sakura Suave)
- **THEN** o sistema SHALL renderizar a moldura sobre o avatar no preview em tempo real e persistir o identificador selecionado

#### Scenario: Sigilo estrito do telefone opcional conforme LGPD
- **GIVEN** um usuário com número de telefone cadastrado em seu perfil
- **WHEN** o perfil é visualizado por terceiros ou através de link compartilhado
- **THEN** o sistema SHALL omitir integralmente o número de telefone em respostas de API públicas e na tela compartilhada
