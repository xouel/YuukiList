# YuukiList - Catálogo e Rastreador de Entretenimento Asiático
Em fase final de desenvolvimento e integração.

> Plataforma unificada, minimalista e de alta fidelidade para catalogar, acompanhar e registrar o consumo de doramas, filmes, animes, mangás, manhwas e manhuas em um único lugar — sem anúncios e com estética editorial asiática.

---

## Visão Geral

O **YuukiList** resolve a fragmentação do consumo de mídia oriental, reunindo em uma experiência unificada e coesa o catálogo canônico, o rastreamento tátil de progresso, diário de impressões, calendário de lançamentos e perfil público editorial.

O projeto foi construído sob governança determinística **X-Spec v2.0.1**, cobrindo 22 incrementos funcionais com **207 testes automatizados** e 100% de convergência.

---

## Funcionalidades Principais

- **Exploração e Catálogo Unificado**:
  - Filtros por categoria (Dorama, Filme, Anime, Mangá, Manhwa, Manhua), status de publicação, país de origem (JP, KR, CN, TW, TH), gênero e temática.
  - Rolagem infinita com preservação de estado na URL e debounce de busca.
  - Detalhes canônicos de obras com sinopse, elenco, estúdios, títulos originais e árvore de relacionamentos/franquias.

- **Biblioteca Pessoal Tátil**:
  - Alternância imediata entre visualização em Grade (*Grid*) e Lista (*Row*).
  - Barra de progresso visual proporcional e botão de incremento rápido (*+1*) com alvo tátil de 44x44px (WCAG 2.2 AA).
  - Abas inteligentes em estilo pílula (*Assistindo/Lendo*, *Planejados*, *Completos*, *Pausados*, *Dropados*).

- **Diário de Consumo & Notas**:
  - Registro de episódios/capítulos com data, nota de 0 a 10, impressões textuais e controle de spoiler.
  - Linha do tempo cronológica com marcos de consumo.

- **Calendário Semanal (*Weekly Strip*)**:
  - Barra horizontal de 7 dias com contadores dinâmicos de lançamentos.
  - Agrupamento temporal por turnos (*Manhã*, *Tarde*, *Noite*).
  - Ação rápida de *"Lembrar / Seguir"* e badges de honestidade de fontes.

- **Perfil Editorial Showcase & LGPD**:
  - Vitrine de favoritos em destaque com proporção editorial 2:3.
  - Analítica compacta de consumo (tempo assistido, capítulos lidos, distribuição por mídias).
  - Conformidade LGPD com exportação de dados em CSV e JSON, além de exclusão definitiva de conta.

- **Experiência PWA & Modo Offline**:
  - Manifesto instalável W3C em conformidade com dispositivos móveis e desktop.
  - Service Worker resiliente com estratégia *Network-First* e cache seguro offline.

---

## Design System: Asian Editorial Foundation

A identidade visual do YuukiList adota a estética minimalista e mineral inspirada na tradição oriental e publicações editoriais contemporâneas:

- **Paleta Mineral**:
  - Fundo base: Nanquim escuro profundo (`#0B0A0F` / `var(--color-bg-base)`)
  - Superfícies elevadas: Nanquim suave (`#14131A` e `#1A1820`)
  - Bordas e divisores: Traço sutil grafite (`#2B2735`)
  - Acento e destaque: Carmim mineral (`#E05347` / `var(--color-accent)`)
  - Texto e contraste: Papel cru (`#EDEDED`) e cinza mineral (`#9C96A2`)
- **Tipografia**: Escala balanceada em 3 níveis de legibilidade editorial com links de salto acessíveis e anel de foco visível.

---

## Arquitetura

O projeto é estruturado como um monorepo modular:

```text
YuukiList/
├── apps/
│   ├── api/          # Backend API (NestJS Modular Monolith + Prisma ORM + SQLite/PostgreSQL)
│   └── web/          # Frontend Web (Next.js 15 App Router, React 19, Tailwind CSS)
├── packages/
│   └── shared/       # DTOs compartilhados, schemas Zod, interfaces e constantes de domínio
├── tests/            # Suíte determinística de 207 testes automatizados
└── xspec/            # Especificações vivas, governança e CLI do motor X-Spec v2.0.1
```

---

## Como Executar

### Pré-requisitos

- **Node.js**: v22.x ou superior
- **npm**: v10.x ou superior

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd YuukiList

# Instale as dependências de todos os workspaces
npm install
```

### Executar os Testes

```bash
npm test
```

### Compilar a Aplicação

```bash
npm run build
```

### Iniciar em Desenvolvimento

```bash
# Iniciar o frontend web
npm --prefix apps/web run dev

# Ou iniciar o build de produção
npm --prefix apps/web run start
```

Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## Governança e Especificação

Este repositório é governado pelo framework **X-Spec**:

- `xspec/constitution.md`: Princípios arquiteturais inegociáveis.
- `xspec/specs/`: 23 Living Specs refletindo as capacidades em produção.
- `xspec/bin/xspec.mjs doctor`: Verificação determinística de saúde do repositório.

---

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
