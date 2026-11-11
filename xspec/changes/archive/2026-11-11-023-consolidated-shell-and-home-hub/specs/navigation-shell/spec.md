# navigation-shell Specification Delta

## MODIFIED Requirements

### Requirement: App Navigation Shell and Responsive Layout
A aplicação SHALL estruturar o layout em torno de uma casca de navegação responsiva (Top Command Bar integrada no desktop e Bottom Navigation em dispositivos móveis) conectando as áreas centrais do produto em container uniforme de largura máxima max-w-7xl, provendo busca rápida, menu de usuário e rodapé com avisos legais.

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

