# navigation-shell Specification

## Purpose

Fornecer a estrutura de navegação global responsiva da aplicação, compreendendo Sidebar lateral no desktop, barra de navegação inferior no mobile, controle de temas visuais e avisos de proveniência com atribuição legal de dados.

## Requirements

### Requirement: App Navigation Shell and Responsive Layout
A aplicação SHALL estruturar o layout em torno de uma casca de navegação responsiva (Sidebar em telas largas e Bottom Navigation em dispositivos móveis) conectando as cinco áreas principais: Explorar, Buscar, Biblioteca, Calendário e Perfil.

#### Scenario: Navegacao desktop com Sidebar lateral persistente
- **GIVEN** um usuário acessando o YuukiList em uma tela com largura desktop (>= 1024px)
- **WHEN** a interface é renderizada
- **THEN** o sistema SHALL exibir uma Sidebar vertical contendo links diretos para as rotas /, /library, /calendar e /profile com destaque visual da rota ativa

#### Scenario: Navegacao mobile com Bottom Navigation bar
- **GIVEN** um usuário acessando o YuukiList em um dispositivo móvel (< 768px)
- **WHEN** qualquer página principal é visualizada
- **THEN** o sistema SHALL fixar uma barra de navegação inferior com ícones e rótulos acessíveis para todas as áreas essenciais

### Requirement: Theme Selection and Accessibility Foundations
O sistema SHALL disponibilizar suporte a temas visuais (Dark Editorial padrão e Light Editorial) com alternância acessível em tempo real, persistência local e respeito estrito a preferências de movimento reduzido.

#### Scenario: Alternancia dinamica de tema visual
- **GIVEN** a interface carregada com o tema Dark Editorial padrão
- **WHEN** o usuário aciona o controle de alternância de tema
- **THEN** o sistema SHALL comutar as variáveis CSS e classes de tema para Light Editorial e salvar a preferência no armazenamento local

#### Scenario: Respeito a diretiva de movimento reduzido
- **GIVEN** um sistema operacional com a opção prefers-reduced-motion ativada
- **WHEN** animações e transições de navegação são disparadas
- **THEN** a interface SHALL desativar transições de movimento bruscas mantendo apenas esmaecimentos sutis sem prejudicar o usuário

### Requirement: Provenance Attribution and Legal Notices
A aplicação SHALL apresentar créditos obrigatórios e avisos legais das APIs externas integradas (TMDB, ANN, TVmaze e MangaUpdates) nas telas de detalhes e rodapé global da aplicação.

#### Scenario: Exibicao de notices legais e atribuicao de fontes
- **GIVEN** a navegação na interface ou consulta aos detalhes de uma obra ingerida
- **WHEN** o usuário visualiza o rodapé ou a seção de proveniência
- **THEN** o sistema SHALL exibir o aviso obrigatório do TMDB e as atribuições requeridas pelas fontes parceiras
