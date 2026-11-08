<!--
Sync Impact Report:
- Version: 1.0.0 (Initial ratification)
- Ratified: 2026-11-08
- Last Amended: 2026-11-08
-->

# YuukiList Constitution

> Este documento define os princípios técnicos, a stack e as restrições inegociáveis deste repositório (governança X-Spec). Nenhum plano (`/xspec-plan`) ou implementação (`/xspec-build`) pode violar estas regras sem justificativa explícita aprovada.

## Core Principles

### I. Modularidade e Responsabilidade Única (Monólito Modular)
O sistema MUST ser construído como um monólito modular desacoplado (`apps/web`, `apps/api`, `packages/shared`). O backend MUST isolar a persistência na camada `data` (Prisma e repositórios) e as regras de negócio/endpoints na camada `catalog` (services, controllers, DTOs). A interface e a API devem ser independentes da fonte de dados (seed inicial vs. ingestão externa futura).

### II. Tipagem Explícita e Contratos Seguros
O código MUST utilizar TypeScript estrito em todas as camadas e validar todas as entradas/saídas com DTOs ou schemas Zod nas fronteiras do sistema. Tipos `any` implícitos e supressão de erros silenciosos são estritamente proibidos.

### III. Rastreabilidade Spec-First (NON-NEGOTIABLE)
Nenhuma funcionalidade, rota ou alteração de comportamento observável MUST ser implementada sem especificação prévia (`proposal.md` + deltas `specs/`), design técnico aprovado e tarefas rastreáveis (`tasks.md`) com a Matriz de Rastreabilidade de 9 colunas.

### IV. Meta R$ 0 / Custo Zero & Due Diligence Obrigatória
Toda biblioteca, API, infraestrutura ou serviço utilizado MUST possuir tier gratuito permanente (sem trials com cartão ou vencimento). Antes de adotar qualquer dependência externa, ela MUST ter sua viabilidade gratuita, limites e estratégia de saída registradas na seção `## Research` do `design.md`.

### V. Soberania do Catálogo e IDs Internos (Independência de Fornecedores)
O YuukiList é o proprietário definitivo do seu catálogo. Toda obra MUST possuir ID interno próprio (UUID/slug). Identificadores de APIs externas (TMDB, TVmaze, Kitsu, etc.) são meras referências secundárias. Falhas ou indisponibilidade de fornecedores externos MUST NOT apagar dados persistidos nem interromper a navegação da biblioteca pessoal.

### VI. Busca Inteligente Baseada em Texto e Determinística (Sem IA)
A busca inteligente do catálogo MUST ser implementada no PostgreSQL usando normalização de texto (remoção de acentos e pontuação em coluna indexada) combinada com similaridade trigrâmica (`pg_trgm`, limiar mínimo 0.35) e tolerância de 1 edição por palavra. É terminantemente proibido o uso de inteligência artificial ou LLMs na busca do MVP.

### VII. Privacidade por Padrão e Segurança no Backend
Contas, perfis, listas pessoais, histórico e notas MUST ser privados por padrão. Senhas MUST ser armazenadas com hash seguro (bcrypt/argon2). A autorização e validação de permissões MUST ocorrer exclusivamente no backend. Credenciais e chaves de API MUST NOT ser expostas no código ou no bundle do frontend (uso exclusivo de variáveis de ambiente via `.env`).

### VIII. Acessibilidade WCAG 2.2 AA e Design Dark Editorial
A interface MUST seguir a direção visual Dark Editorial (base escura, contrastes refinados, toques ciano/violeta) e cumprir requisitos WCAG 2.2 AA: contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande, suporte completo à navegação por teclado com foco visível, suporte a leitores de tela e respeito a `prefers-reduced-motion`.

### IX. Categorias e Status Canônicos de Publicação e Pessoais
O domínio do catálogo MUST modelar as 6 categorias: Dorama/Série, Filme, Anime, Mangá, Manhwa e Manhua. O status de publicação da obra (Em andamento, Finalizada, Cancelada, Hiato, Desconhecida) MUST ser estritamente desacoplado do status de acompanhamento pessoal do usuário (Quero assistir/ler, Assistindo/Lendo, Pausado, Concluído, Dropado). A condição "Em dia" é calculada dinamicamente e não substitui o status.

### X. Verificação, Não-Regressão e Conventional Commits
Toda entrega MUST incluir testes automatizados (unitários para regras de negócio/normalização, integração para PostgreSQL/Prisma e Supertest para contratos de API). Todos os commits no repositório Git MUST seguir o padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## Technology Stack & Environment

- **Linguagens e Runtimes:** TypeScript 5.x, Node.js >=22.0.0
- **Frameworks Principais:** Next.js 15 (App Router, Tailwind CSS v4, shadcn/ui) no Frontend; NestJS no Backend (REST, OpenAPI/Swagger)
- **Banco de Dados / Persistência:** PostgreSQL com Prisma ORM e extensão nativa `pg_trgm`
- **Gerenciador de Pacotes / Build / Testes:** npm workspaces (monorepo), Vitest, Supertest, React Testing Library

## Architecture & Code Conventions

- **Estrutura de Diretórios:** Monorepo com `apps/web` (Next.js), `apps/api` (NestJS modular com `data` e `catalog`), `packages/shared` (tipos, schemas Zod e DTOs comuns) e `docs/`
- **Padrões de Nomenclatura:** camelCase para variáveis/funções, PascalCase para classes/componentes/tipos, kebab-case para arquivos/rotas/slugs/capabilities.

## Explicit Constraints (O que NÃO fazer)

- MUST NOT adotar serviços, APIs ou ferramentas com custo ou trials pagos no MVP (regra permanente de R$ 0).
- MUST NOT usar web scraping ou integrar com Jikan ou AniList (fontes descartadas pelas diretrizes do projeto).
- MUST NOT usar IA generativa na busca do MVP (busca exclusivamente textual com normalização e `pg_trgm`).
- MUST NOT acoplar IDs primários do catálogo a IDs de provedores externos (obrigatoriedade de ID interno do YuukiList).
- MUST NOT armazenar ou trafegar senhas em texto puro ou expor segredos/chaves de API no código/frontend.
- MUST NOT violar acessibilidade WCAG 2.2 AA (contraste mínimo 4.5:1 / 3:1, foco visível, navegação por teclado).
- MUST NOT adicionar dependências externas sem registro prévio na seção `## Research` do `design.md`.
- MUST NOT refatorar arquivos ou alterar comportamentos fora do escopo listado na mudança ativa.

## Governance

- Esta Constituição prevalece sobre qualquer outra prática local ou suposição de agentes.
- Conflitos com princípios `MUST` são classificados como **CRITICAL** durante `/xspec-plan` (Analysis) e `/xspec-close` (Convergence Audit).
- Emendas a esta Constituição seguem versionamento semântico (`MAJOR.MINOR.PATCH`):
  - **MAJOR**: Remoção ou redefinição incompatível de princípio existente.
  - **MINOR**: Adição de novo princípio ou expansão material de governança.
  - **PATCH**: Esclarecimentos de redação sem alterar o sentido normativo.

**Version**: 1.0.0 | **Ratified**: 2026-11-08 | **Last Amended**: 2026-11-08

