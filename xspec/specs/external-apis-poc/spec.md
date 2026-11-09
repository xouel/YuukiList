# external-apis-poc Specification

## Purpose

Prover clientes de consulta, normalizadores de dados e matriz comparativa de cobertura para APIs externas gratuitas (TMDB, TVmaze, Kitsu, Anime News Network e MangaUpdates), validando a precisão de metadados, contagem de unidades e viabilidade jurídica de licenciamento para os 12 títulos de teste representativos das 6 categorias do catálogo.

## Requirements

### Requirement: Audiovisual External API Integration and Normalization
O sistema SHALL consultar e normalizar dados de obras audiovisuais (doramas, filmes e animes) a partir das APIs públicas do TMDB e TVmaze, mapeando títulos, sinopse, ano, episódios e temporadas em DTOs canônicos sem custos de licenciamento.

#### Scenario: Consulta e normalizacao de doramas e series no TMDB e TVmaze
- **GIVEN** um título audiovisual de teste (ex: Moving, Queen of Tears ou Alice in Borderland)
- **WHEN** o cliente da PoC executa a busca e extração de dados nas APIs TMDB e TVmaze
- **THEN** o sistema SHALL converter a resposta externa em uma estrutura normalizada contendo título oficial, ano de lançamento, sinopse e categoria correspondente

#### Scenario: Mapeamento de contagem de episodios e temporadas para doramas
- **GIVEN** uma série de TV ou dorama com múltiplos episódios confirmados
- **WHEN** a consulta detalhada de episódios é efetuada no TVmaze ou TMDB
- **THEN** o sistema SHALL extrair o número total de episódios e temporadas estruturadas preservando a integridade numérica das unidades

#### Scenario: Resiliencia a limites de requisicao e falhas de rede em APIs audiovisuais
- **GIVEN** uma resposta de sobrecarga de taxa (HTTP 429) ou erro de conexão de rede
- **WHEN** o cliente executa uma consulta a uma API externa com controle de rate limit
- **THEN** o sistema SHALL interceptar a falha com política de retry com backoff e notificar erro informativo sem interrupção catastrófica

### Requirement: Literary External API Integration and Normalization
O sistema SHALL consultar e normalizar dados de obras literárias e gráficas (mangás, manhwas e manhuas) a partir das APIs do MangaUpdates, Kitsu e Anime News Network, mapeando capítulos, volumes, autores e status de publicação.

#### Scenario: Consulta e normalizacao de mangás e manhwas no MangaUpdates e Kitsu
- **GIVEN** uma obra literária de teste (ex: One Piece, Berserk, Solo Leveling ou The Beginning After the End)
- **WHEN** o cliente da PoC executa a busca no MangaUpdates e no Kitsu
- **THEN** o sistema SHALL normalizar os campos de capítulos conhecidos, volumes, autor e país de origem para o padrão interno

#### Scenario: Mapeamento e diferenciacao de formatos literarios orientais
- **GIVEN** uma obra originária da Coreia (manhwa) ou China (manhua)
- **WHEN** a resposta da API identifica o tipo específico de publicação
- **THEN** o sistema SHALL preservar a categorização canônica distinta (MANGA, MANHWA ou MANHUA) sem colapsar todos os formatos em uma única categoria genérica

#### Scenario: Processamento de dados estruturados em XML da Anime News Network
- **GIVEN** uma resposta em formato XML retornada pelos endpoints da Anime News Network
- **WHEN** o adaptador da ANN processa o payload de relatório ou detalhes
- **THEN** o sistema SHALL realizar o parse seguro do XML convertendo os nós em estruturas tipadas compatíveis com o modelo do YuukiList

### Requirement: External APIs Coverage Matrix and License Compliance
O sistema SHALL consolidar os resultados da PoC em uma matriz comparativa de cobertura e conformidade jurídica para os 12 títulos de teste, garantindo o princípio de custo zero permanente e isolamento de testes determinísticos com fixtures.

#### Scenario: Geracao da matriz comparativa de cobertura para os 12 titulos de teste
- **GIVEN** o conjunto completo dos 12 títulos de teste oficiais definidos na Seção 10 do Documento Mestre
- **WHEN** o script de avaliação da PoC processa os dados coletados de todas as fontes
- **THEN** o sistema SHALL gerar uma matriz estruturada em Markdown e JSON documentando a presença, confiabilidade e ausência de campos para cada fonte avaliada

#### Scenario: Documentacao de termos de uso e compatibilidade juridica de licencas
- **GIVEN** as políticas e termos de serviço das APIs TMDB, TVmaze, Kitsu, ANN e MangaUpdates
- **WHEN** a auditoria de licenciamento da PoC é consolidada
- **THEN** o sistema SHALL documentar formalmente os requisitos de atribuição, restrições para uso comercial, termos de redistribuição e diretrizes para imagens

#### Scenario: Validacao deterministica de testes com fixtures estaticas sem chamadas de rede
- **GIVEN** o ambiente de testes de integração e regressão automatizada do projeto
- **WHEN** a suíte de testes da PoC é executada pelo test runner nativo
- **THEN** o sistema SHALL executar 100% dos testes utilizando fixtures locais estáticas garantindo execução determinística, rápida e sem necessidade de conexão ativa de rede
