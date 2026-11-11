# Spec Delta

## MODIFIED Requirements

### Requirement: App Navigation Shell and Responsive Layout
A aplicação SHALL estruturar o layout em torno de uma casca de navegação responsiva (Sidebar em telas largas e Bottom Navigation em dispositivos móveis) conectando as quatro áreas principais: Explorar, Biblioteca, Calendário e Perfil, destacando visualmente a rota ativa e refletindo reativamente o estado dos botões de autenticação.

#### Scenario: Navegacao desktop com Sidebar lateral persistente
- **GIVEN** um usuário acessando o YuukiList em uma tela com largura desktop (>= 1024px)
- **WHEN** a interface é renderizada
- **THEN** o sistema SHALL exibir uma Sidebar vertical contendo links diretos para as rotas /, /library, /calendar e /profile com destaque visual da rota ativa

#### Scenario: Navegacao mobile com Bottom Navigation bar
- **GIVEN** um usuário acessando o YuukiList em um dispositivo móvel (< 768px)
- **WHEN** qualquer página principal é visualizada
- **THEN** o sistema SHALL fixar uma barra de navegação inferior com ícones e rótulos acessíveis para as quatro áreas principais

#### Scenario: Destaque dinamico dos botoes de autenticacao conforme rota ativa
- **GIVEN** um usuário visitante na tela de login (/login) ou de cadastro (/register)
- **WHEN** a barra lateral ou o cabeçalho móvel são renderizados
- **THEN** o sistema SHALL destacar em ciano primário o botão correspondente à rota atual e manter o botão alternativo em estado secundário neutro

### Requirement: Theme Selection and Accessibility Foundations
O sistema SHALL disponibilizar suporte a temas visuais (Dark Editorial padrão e Light Editorial) com alternância acessível em tempo real aplicada a todas as superfícies e textos da aplicação, persistência local e respeito estrito a preferências de movimento reduzido.

#### Scenario: Alternancia dinamica de tema visual
- **GIVEN** a interface carregada com o tema Dark Editorial padrão
- **WHEN** o usuário aciona o controle de alternância de tema
- **THEN** o sistema SHALL comutar as variáveis CSS e classes de tema para Light Editorial e salvar a preferência no armazenamento local

#### Scenario: Respeito a diretiva de movimento reduzido
- **GIVEN** um sistema operacional com a opção prefers-reduced-motion ativada
- **WHEN** animações e transições de navegação são disparadas
- **THEN** a interface SHALL desativar transições de movimento bruscas mantendo apenas esmaecimentos sutis sem prejudicar o usuário

#### Scenario: Aplicacao efetiva de cores claras nas superficies e textos
- **GIVEN** a interface comutada para o tema Light Editorial
- **WHEN** a casca de navegação, cabeçalhos e conteúdo principal são renderizados
- **THEN** as superfícies SHALL adotar tons claros e o texto principal SHALL utilizar tipografia escura de alto contraste conforme WCAG 2.2 AA

