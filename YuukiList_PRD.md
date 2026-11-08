# YuukiList — Escopo do Projeto (PRD / MVP)

**Tipo de projeto:** Pessoal, solo, sem orçamento (todas as dependências devem ter tier gratuito permanente)
**Metodologia:** Spec-Driven Development (GitHub Spec Kit)
**Versão da constitution vinculada:** v1.0.0

\---

## 1\. Objetivo do MVP

Desenvolver uma aplicação web funcional que permita ao usuário navegar, buscar e organizar sua
lista pessoal de doramas, animes, mangás e manwhas em um catálogo unificado, com busca inteligente
(full-text + similaridade) como funcionalidade central do produto.

Ao final do MVP deverá ser possível executar o fluxo abaixo:

**Usuário**
Cadastro/Login → Catálogo → Busca/Filtros → Detalhes do Item → Adicionar à Lista Pessoal →
Acompanhar Progresso → Logout

\---

## 2\. Estrutura de desenvolvimento (fases)

Cada fase abaixo corresponde a **uma spec independente** no Spec Kit (seu próprio ciclo
`specify → clarify → plan → tasks → checklist → analyze → implement`). Uma fase só é considerada
concluída quando:

* estiver implementada e funcionando;
* estiver coberta por testes nos pontos críticos (regra de negócio, contrato de API, busca), conforme
a constitution;
* não possuir erros que impeçam o fluxo previsto;
* atender aos critérios de aceite descritos abaixo;
* estiver rodando localmente (hospedagem em homologação é opcional no MVP solo, mas recomendada
antes de considerar o projeto "pronto").

### Fase 1 — Catálogo e Busca (seed fixo)

**Objetivo:** validar a experiência central do produto (navegação, filtros e busca inteligente) sem
depender de integração externa.

Funcionalidades:

* catálogo público com exatamente 20 obras fictícias de seed: cinco doramas, cinco animes, cinco
  mangás e cinco manwhas; cada tipo cobre uma vez os status planejado, em andamento, completo,
  pausado e cancelado;
* listagem com capa, título, tipo, gêneros, status e avaliação; avaliação ausente é apresentada como
  indisponível;
* capas SVG originais e locais, uma por `slug`, servidas pela própria API; falha de capa usa um
  substituto visual sem impedir a seleção do item;
* busca por título completo ou parcial, sem diferença de maiúsculas, acentos ou pontuação;
* normalização de busca que remove diacríticos, substitui pontuação e caracteres não alfanuméricos
  por espaços e colapsa espaços múltiplos, sem alterar o título exibido;
* tolerância a uma inserção, remoção, substituição ou transposição por palavra individual do título;
  artigos e preposições curtas são ignorados nessa tolerância;
* busca aproximada com `pg_trgm` e similaridade mínima de `0.35`; resultados são ordenados por
  correspondência exata, parcial e aproximada, com desempate alfabético por título em cada faixa;
  sem busca, a ordenação é alfabética por título;
* filtros por tipo (dorama/anime/mangá/manwha), gênero e status, com no máximo um valor por dimensão
  no MVP; dimensões ativas são combinadas por `AND`;
* página de detalhes em URL pública baseada em `slug` (`/items/:slug` no frontend e
  `GET /api/v1/catalog/items/{slug}` na API), nunca em UUID;
* retorno dos detalhes restaura busca, filtros e posição de rolagem quando existe estado anterior;
  para uma URL aberta diretamente, retorna ao catálogo padrão sem busca ou filtros;
* estados distintos de carregamento, catálogo vazio, busca sem resultados e erro com retry;
* backend modular em duas áreas: `data` (Prisma e repositório, isolando a origem dos dados) e
  `catalog` (service, controller e DTOs). A futura ingestão externa substitui a fonte de dados sem
  alterar navegação, busca, filtros ou detalhes;
* nenhuma consulta a fonte externa em tempo real nesta fase.

Critérios de aceite:

* \[ ] O seed contém exatamente 20 itens, cinco por tipo, com todos os cinco status canônicos em
  cada tipo; a listagem exibe capa, título, tipo, gêneros, status e avaliação ou indisponibilidade.
* \[ ] Para os 20 títulos do seed, testes table-driven encontram cada obra por título exato, trecho
  distintivo e variação de uma edição; a ordenação segue exata → parcial → aproximada e alfabética
  dentro de cada faixa.
* \[ ] Busca sem termo ordena alfabeticamente por título; busca em branco equivale à ausência de
  busca; a normalização e o limiar `0.35` do `pg_trgm` são cobertos por testes PostgreSQL reais.
* \[ ] Cada filtro aceita somente um valor; tipo, gênero e status podem ser combinados e todo resultado
  atende a todos os critérios ativos. Limpar critérios restaura o catálogo completo.
* \[ ] Detalhes são acessíveis por `slug`; `400` identifica slug inválido, `404` identifica item
  inexistente e o retorno restaura o estado anterior ou, em acesso direto, abre o catálogo padrão.
* \[ ] Os quatro estados assíncronos possuem título, mensagem e ação contextual próprios; retry não
  duplica itens nem mantém mensagem de erro após sucesso.
* \[ ] Em ambiente local, pelo menos 19 de 20 navegações medidas manualmente no DevTools, do início
  da navegação à renderização completa da lista ou estado vazio, concluem em até dois segundos.
* \[ ] Em 360, 768 e 1280 pixels não há rolagem horizontal; busca, filtros, cards, retorno e retry
  funcionam somente com teclado, têm foco visível e nome acessível.
* \[ ] A interface atende WCAG AA: contraste mínimo de `4.5:1` para texto normal e `3:1` para texto
  grande; a verificação é registrada no roteiro manual da fase.
* \[ ] Vitest, React Testing Library e Supertest cobrem regras de negócio, contratos de entrada/saída,
  busca e filtros contra PostgreSQL real. Playwright e testes E2E ficam adiados para fases com
  autenticação e lista pessoal.
* \[ ] As camadas `data` e `catalog` isolam a fonte do seed da API e da UI; nenhuma rota da Fase 1
  depende de uma API externa em tempo real.

### Fase 2 — Autenticação

**Objetivo:** permitir que o usuário crie conta, faça login e tenha uma sessão reconhecida pela
aplicação.

Funcionalidades:

* cadastro de usuário (e-mail/usuário + senha);
* login e logout;
* sessão via JWT;
* rotas protegidas (catálogo público, lista pessoal exige login);
* senha nunca armazenada em texto puro (hash bcrypt/argon2) — regra de backend.

Critérios de aceite:

* \[ ] Cadastro cria usuário novo e trata e-mail/usuário duplicado.
* \[ ] Login autentica corretamente e trata credenciais inválidas.
* \[ ] Sessão se mantém ao atualizar a página.
* \[ ] Logout encerra a sessão corretamente.
* \[ ] Rotas protegidas redirecionam usuário não autenticado para o login.
* \[ ] Senha nunca é exposta ou logada no frontend/backend.
* \[ ] Estados de loading e erro tratados no formulário de login/cadastro.

### Fase 3 — Lista Pessoal

**Objetivo:** permitir que o usuário autenticado monte sua própria lista e acompanhe o progresso.

Funcionalidades:

* adicionar/remover item da lista pessoal a partir do catálogo;
* marcar status pessoal (ex.: assistindo/lendo, completo, quero ver/ler, pausado);
* registrar progresso (ex.: episódio/capítulo atual);
* visualizar a lista pessoal separada do catálogo geral, com os mesmos filtros de tipo/status.

Critérios de aceite:

* \[ ] Usuário consegue adicionar e remover itens da própria lista.
* \[ ] Status pessoal é salvo e refletido corretamente na lista.
* \[ ] Progresso é editável e persistido.
* \[ ] Lista pessoal é privada por usuário (um usuário não vê a lista de outro).
* \[ ] Estados de carregamento, lista vazia e erro tratados.
* \[ ] Layout responsivo.

### Fase 4 — Integração com APIs externas reais

**Objetivo:** substituir os dados de seed por dados reais, mantendo o catálogo e a busca já validados
na Fase 1 funcionando sem alterações estruturais.

Funcionalidades:

* integração com TMDB (doramas);
* integração com Jikan ou AniList (mangás/manwhas);
* normalização dos dados das APIs externas para o schema interno do catálogo;
* cache dos dados externos no próprio banco (evita depender de disponibilidade/rate limit de terceiros
em tempo real);
* remoção dos dados mockados após a integração estar validada.

Critérios de aceite:

* \[ ] Dados reais substituem os mocks sem quebrar catálogo, busca ou filtros já existentes.
* \[ ] Falha ou indisponibilidade de uma API externa não derruba a aplicação (tratamento de erro/cache).
* \[ ] Cache evita chamadas repetidas desnecessárias às APIs externas.
* \[ ] Nenhuma chave/API key exposta no frontend.
* \[ ] Mocks removidos ou claramente isolados como fallback documentado.

\---

## 3\. Requisitos transversais

Aplicam-se a todas as fases em que forem pertinentes; não são funcionalidades à parte.

**Responsividade**

* funcionamento adequado em computador, tablet e celular;
* listagens, formulários e cards se adaptam ao espaço disponível.

**Acessibilidade básica**

* campos de formulário com labels;
* todo elemento interativo com nome acessível;
* navegação possível por teclado nos fluxos principais e foco visível em elementos interativos;
* contraste WCAG AA: mínimo de `4.5:1` para texto normal e `3:1` para texto grande; informação não
  depende apenas de cor;
* HTML semântico.
* *Não é exigida auditoria formal externa de acessibilidade neste projeto; as verificações da fase
  são automatizadas quando aplicável e complementadas pelo roteiro manual documentado.*

**Segurança e privacidade**

* senha nunca armazenada nem logada em texto puro;
* nenhum segredo (chave de API, string de conexão) no código-fonte — apenas via `.env`;
* lista pessoal e dados de usuário visíveis apenas para o próprio usuário;
* autorização real decidida sempre no backend, nunca só na UI.

**Zero custo**

* toda ferramenta, biblioteca, API ou serviço de hospedagem usado deve ter tier gratuito permanente
(não trial);
* antes de adicionar ou atualizar qualquer dependência, API, infraestrutura ou hospedagem, registrar
  em `research.md` a fonte consultada, data de verificação, limite gratuito permanente e estratégia
  de saída; a adoção só ocorre depois desse registro.

\---

## 4\. Stack e decisões técnicas

|Camada|Escolha|Motivo|
|-|-|-|
|Frontend|React + TypeScript|Familiaridade prévia (stack MERN/TS)|
|Backend|NestJS + TypeScript|Estrutura pronta (módulos, DI, DTOs), preferida sobre Express|
|Banco de dados|PostgreSQL|Dados relacionais (usuário, lista, itens, categorias) + suporte nativo a busca inteligente|
|ORM|Prisma|Boa integração com TypeScript, migrations simples|
|Busca|Full-text search + `pg\_trgm` (nativo do Postgres)|Normalização local, similaridade mínima `0.35`, ordenação por relevância e índice de busca sem serviço externo pago|
|Autenticação|JWT + hash de senha (bcrypt/argon2)|Padrão simples, sem custo, seguro|
|Documentação de API|Swagger/OpenAPI (nativo do NestJS)|Gerado automaticamente, sem esforço extra|
|Arquitetura do catálogo|`data` + `catalog`|Repositório/Prisma isolam a fonte de dados; service/controller/DTOs expõem a API sem camadas hexagonais prematuras|
|Dados e capas da Fase 1|Seed PostgreSQL de 20 itens + SVG local por `slug`|Sem API ou serviço de imagens externo durante a fase|
|Fontes de dados externas|TMDB (doramas) · Jikan/AniList (animes, mangás e manwhas)|Integrações futuras gratuitas, cacheadas antes de exposição pela API própria|
|Hospedagem|Execução local obrigatória; hospedagem opcional após revalidação|Nenhum serviço gerenciado é requisito da Fase 1; todo tier precisa ser gratuito permanente|
|Testes|Vitest, React Testing Library e Supertest com PostgreSQL real|Regras de negócio, contratos e busca/filtros; Playwright/E2E adiados para fases futuras|
|Commits|Conventional Commits|Rastreabilidade do histórico|

\---

## 5\. Fora do escopo do MVP

* recuperação de senha;
* notificações;
* comentários, avaliações de outros usuários ou comunidade;
* recomendações automáticas/IA de sugestão de conteúdo;
* múltiplos perfis por conta;
* app mobile nativo (apenas responsivo via web);
* qualquer serviço, API ou infraestrutura que exija pagamento.

Qualquer recurso não descrito como obrigatório neste documento deve ser tratado como uma nova
spec, avaliada separadamente, e não implementado dentro do escopo de uma fase já em andamento.

\---

## 6\. Entrega técnica mínima

Ao final de cada fase, o repositório deve conter:

* código-fonte atualizado e versionado (commits seguindo Conventional Commits);
* README com instruções de instalação, execução local e variáveis de ambiente necessárias
(sem valores secretos);
* dependências corretamente declaradas (`package.json`);
* mocks claramente separados das integrações reais (Fases 1–3), removidos ou isolados após a Fase 4;
* ausência de erros críticos no console nos fluxos principais;
* artefatos do Spec Kit (`spec.md`, `plan.md`, `tasks.md`) versionados junto ao código da fase
correspondente.

\---

## 7\. Resultado esperado

Ao final do MVP (Fases 1 a 4) deverá existir uma aplicação web funcional, rodando localmente (e
opcionalmente hospedada em tiers gratuitos), permitindo:

**Fluxo completo do usuário:**
Cadastro/Login → Catálogo → Busca/Filtros → Detalhes do Item → Adicionar à Lista Pessoal →
Acompanhar Progresso → Logout

Com dados reais de doramas, mangás e manwhas vindos de APIs externas gratuitas, busca inteligente
funcionando sobre esses dados, e toda a stack operando sem custo.
