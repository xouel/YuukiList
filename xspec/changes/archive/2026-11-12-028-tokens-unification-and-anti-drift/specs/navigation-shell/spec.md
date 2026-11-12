# Spec Delta

## MODIFIED Requirements

### Requirement: Theme Selection and Accessibility Foundations
O sistema SHALL disponibilizar suporte ao Design System Asian Editorial baseado em nanquim, papel e carmim com tipografia em três níveis, arquitetura de design tokens semânticos (superfícies, contornos de refração e acentos de mídia bimodais), alternância acessível em tempo real para Light Editorial, anel de foco visível em conformidade com WCAG 2.2 AA e respeito estrito a preferências de movimento reduzido.

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

#### Scenario: Suporte a tokens semanticos de superficie e contornos de refracao
- **GIVEN** a aplicacao em execucao nos temas Dark Editorial ou Light Editorial
- **WHEN** qualquer componente renderiza conteineres, bordas ou destaques
- **THEN** o sistema SHALL utilizar variaveis semanticas (--surface-canvas, --surface-raised, --stroke-subtle, --accent-carmim) mapeadas via classes Tailwind

#### Scenario: Padronizacao semantica de acentos de midia bimodais
- **GIVEN** a exibicao de badges e selos de categoria (Audiovisual, Impresso ou Animacao)
- **WHEN** os elementos de identificacao de midia sao apresentados
- **THEN** o sistema SHALL aplicar os tokens dedicados (--accent-media-video, --accent-media-print, --accent-media-anime) preservando contraste minimo de 4.5:1 em ambos os temas

#### Scenario: Anel de foco visivel semantico para navegacao acessivel
- **GIVEN** um elemento interativo (botao, link ou input) recebendo foco via teclado
- **WHEN** o estado :focus-visible e acionado
- **THEN** a interface SHALL exibir anel de contorno de 2px com offset de 2px na cor do acento carmim sem supressao cega de outline

