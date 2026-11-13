# Spec Delta

## MODIFIED Requirements

### Requirement: App Navigation Shell and Responsive Layout
A aplicação SHALL estruturar o layout em torno de uma casca de navegação responsiva em container `max-w-7xl` com busca rápida, `<ThemeToggle />`, menu de usuário exibindo a foto de perfil autenticada envolvida pela moldura escolhida (`AvatarFrame`, ou inicial em fallback) junto ao nick do usuário ao lado do seletor de tema, e rodapé legal.

#### Scenario: Navegacao desktop com Top Command Bar horizontal
- **GIVEN** um usuário acessando o YuukiList em uma tela com largura desktop (>= 1024px)
- **WHEN** a interface é renderizada
- **THEN** o sistema SHALL exibir uma Top Command Bar horizontal contendo atalhos para Início, Minha Lista, Explorar e Calendário, barra de busca rápida, sino de notificações e menu do avatar

#### Scenario: Navegacao mobile com Bottom Navigation bar
- **GIVEN** um usuário acessando o YuukiList em um dispositivo móvel (< 768px)
- **WHEN** qualquer página principal é visualizada
- **THEN** o sistema SHALL fixar uma barra de navegação inferior com ícones e rótulos acessíveis para as quatro áreas principais

#### Scenario: Destaque dinamico dos botoes de autenticacao conforme rota ativa
- **GIVEN** um usuário visitante na tela de login (/login) ou de cadastro (/register)
- **WHEN** a barra superior ou o cabeçalho móvel são renderizados
- **THEN** o sistema SHALL destacar o botão correspondente à rota atual com acento editorial e manter o botão alternativo em estado secundário neutro

#### Scenario: Alinhamento horizontal em container global padronizado
- **GIVEN** a navegação em qualquer uma das quatro telas principais
- **WHEN** o conteúdo é estruturado na viewport
- **THEN** o sistema SHALL posicionar a área principal em um container uniforme com largura máxima de max-w-7xl e espaçamentos laterais consistentes

#### Scenario: Exibição de foto de perfil e moldura ao lado do alternador de tema e nick
- **GIVEN** um usuário autenticado com `avatarUrl` (URL remota ou Data URL comprimida) e/ou `avatarFrame` definidos no perfil
- **WHEN** a `NavigationShell` é renderizada ou o perfil é atualizado no `AuthContext`
- **THEN** a barra superior SHALL exibir imediatamente ao lado de `<ThemeToggle />` a foto de perfil recortada em círculo dentro de `AvatarFrame` junto ao nick (`user.username`), resetando estados de erro ao mudar a URL e utilizando a inicial apenas como fallback quando não houver foto válida

