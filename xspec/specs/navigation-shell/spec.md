# navigation-shell Specification

## Purpose

Fornecer a estrutura de navegação global responsiva da aplicação, compreendendo Sidebar lateral no desktop, barra de navegação inferior no mobile, controle de temas visuais e avisos de proveniência com atribuição legal de dados.

## Requirements

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

### Requirement: Theme Selection and Accessibility Foundations
O sistema SHALL disponibilizar suporte ao Design System Asian Editorial baseado em nanquim, papel e carmim com tipografia em três níveis, alternância acessível em tempo real para Light Editorial, persistência local e respeito estrito a preferências de movimento reduzido.

#### Scenario: Alternancia dinamica de tema visual
- **GIVEN** a interface carregada com o tema Dark Editorial mineral padrão
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

#### Scenario: Aplicacao da escala tipografica editorial e paleta mineral
- **GIVEN** a renderização de títulos, metadados e corpo de texto no tema padrão
- **WHEN** os elementos de interface são exibidos
- **THEN** os títulos SHALL empregar fonte serifada editorial, o corpo e rótulos SHALL utilizar sans-serif neutra com metadados nunca inferiores a 12px e contraste mínimo de 4.5:1

### Requirement: Provenance Attribution and Legal Notices
A aplicação SHALL apresentar créditos obrigatórios e avisos legais das APIs externas integradas (TMDB, ANN, TVmaze e MangaUpdates) nas telas de detalhes e rodapé global da aplicação.

#### Scenario: Exibicao de notices legais e atribuicao de fontes
- **GIVEN** a navegação na interface ou consulta aos detalhes de uma obra ingerida
- **WHEN** o usuário visualiza o rodapé ou a seção de proveniência
- **THEN** o sistema SHALL exibir o aviso obrigatório do TMDB e as atribuições requeridas pelas fontes parceiras
