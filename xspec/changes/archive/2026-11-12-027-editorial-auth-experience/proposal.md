# Proposal: Editorial Auth Experience & Split Dossier (R27)

> **X-Spec** · ID: `027-editorial-auth-experience` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-11`

## Why

As telas de autenticação (/login e /register) ainda utilizam a estética legada com fundo azulado (#121520), bordas (#181C2B) e acentos em ciano (#06B6D4), destoando profundamente da nova identidade Asian Editorial (Nanquim/Carmim) consolidada nas demais rotas do YuukiList. Além disso, a navegação entre login e cadastro exige recarregamento total de página, não há controle tátil para exibição de senha e falta um painel visual que comunique o propósito da plataforma ao usuário que chega para autenticar. Inspirada no padrão Auth UI do 21st.dev, esta fatia implementa o contêiner Editorial Split Dossier unificando login e cadastro em um card tátil de alta densidade, com alternador fluído de abas, revelador de senha, foco acessível WCAG 2.2 AA e total erradicação de resíduos ciano.

## What Changes

- **Contêiner Editorial Split Dossier**:
  - Layout 5+7 em desktop (`grid-cols-1 lg:grid-cols-12`):
    - Coluna Esquerda (5 slots): Vitrine editorial com citação marcante ("Seu refúgio para catalogar, vivenciar e revisitar histórias orientais"), wordmark tipográfico YUUKILIST em `font-serif` e selos de soberania/fuso.
    - Coluna Direita (7 slots): Card de formulário em `#1A1820` com bordas `#2B2735`.
  - Empilhamento fluido e responsivo no mobile.
- **Alternador Fluido de Abas (Entrar / Criar Conta)**:
  - Abas em estilo pílula sutil no topo do card de formulário.
  - Alternância instantânea no cliente mantendo os campos e parâmetros de redirecionamento sem recarregar a rota.
  - Ambas as rotas `/login` e `/register` continuam ativas como portas de entrada canônicas com a respectiva aba selecionada por padrão.
- **Formulários Táteis com Alternador de Visibilidade de Senha**:
  - Inputs com altura de 44px, preenchimento em `#24202C` e foco com anel Carmim `#E05347`.
  - Botão inline tátil com alvo de 44x44px para mostrar/ocultar senha com ícones SVG vetoriais (olho aberto / fechado).
  - Botão de submissão em Vermelho Carmim `#E05347` com micro-elevação e estado de carregamento sem alteração dimensional.
- **Erradicação Integral de Cores Legadas**:
  - Remoção de todos os resíduos `#06B6D4`, `#22D3EE`, `#121520` e `#181C2B` nos componentes de autenticação.
  - Zero emojis em todo o fluxo de autenticação.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `auth-ui`: Atualização dos requisitos de login e cadastro para incorporar o contêiner Editorial Split Dossier, alternância fluida de abas, controle tátil de visibilidade de senha e alinhamento à paleta mineral Asian Editorial.

## Impact

- **Código Frontend**: Refatoração de `apps/web/src/components/auth/login-form.tsx`, `register-form.tsx`, `apps/web/src/app/login/page.tsx` e `apps/web/src/app/register/page.tsx`.
- **Novo Componente**: Criação de `apps/web/src/components/auth/auth-dossier-card.tsx` para unificar a experiência.
- **Dependências & Banco**: Zero alterações de backend ou banco de dados; total conformidade com `AuthApiClient` e sessões HttpOnly existentes.

## User Stories

### US1 — Experiência Editorial Split Dossier e Alternância Fluida de Abas (Priority: P1)
Como visitante ou usuário recorrente,
Quero acessar a página de autenticação e visualizar um ambiente editorial acolhedor com a opção de alternar instantaneamente entre Entrar e Criar Conta,
Para que eu possa me autenticar rapidamente sem ser forçado a navegar entre páginas desconexas.

- **Why this priority:** É o núcleo da modernização visual e da convergência com a referência 21st.dev.
- **Independent Test:** Navegar para `/login` e alternar para a aba "Criar Conta", confirmando a troca imediata do formulário sem recarregar a página e exibindo os campos correspondentes.

### US2 — Formulário Tátil com Alternador de Visibilidade de Senha (Priority: P2)
Como usuário preenchendo credenciais,
Quero interagir com campos acessíveis e poder alternar a visibilidade da minha senha com um toque,
Para que eu possa conferir se digitei a senha corretamente sem erros de digitação.

- **Why this priority:** Ergonomia mobile essencial e redução de atrito na autenticação.
- **Independent Test:** Digitar uma senha no campo e clicar no ícone de visualização, confirmando a transição do tipo de input entre `password` e `text` acompanhada pela troca do ícone SVG.

### US3 — Validação Resiliente e Redirecionamento Dinâmico (Priority: P3)
Como usuário autenticando-se a partir de uma obra ou rota privada,
Quero que o sistema valide meus dados com clareza e me redirecione de volta à tela de origem após o login bem-sucedido,
Para que meu fluxo de navegação seja contínuo e sem perda de contexto.

- **Why this priority:** Preservação dos fluxos de navegação e integridade das regras de segurança de rota.
- **Independent Test:** Simular login com parâmetro `?redirect=/items/frieren` e verificar a resolução correta da URL de destino.

## Success Criteria

- **SC-001**: 100% de erradicação de cores legadas (`#06B6D4`, `#22D3EE`, `#121520`, `#181C2B`) nas telas e componentes de autenticação.
- **SC-002**: Alternância entre as abas Entrar e Criar Conta ocorre instantaneamente no cliente em menos de 50ms sem recarga completa de página.
- **SC-003**: Todos os botões e campos de entrada de texto respeitam o alvo tátil mínimo de 44x44px (WCAG 2.2 AA).
- **SC-004**: Botão de visibilidade de senha alterna o atributo `type` entre `password` e `text` com ícone SVG vetorial inline e rótulo acessível `aria-label`.
- **SC-005**: 100% dos testes existentes de autenticação (`tests/auth-frontend.test.mjs` e `tests/auth-backend.test.mjs`) permanecem aprovados sem falhas ou regressões.

## Edge Cases

- **Tentativa de acesso por usuário já autenticado**: Se a sessão estiver ativa, redirecionar imediatamente para a rota principal `/` sem piscar o formulário.
- **Parâmetro de redirecionamento malicioso ou externo**: Preservar validação de caminhos relativos para evitar vulnerabilidade de *Open Redirect*.
- **Conflito de credencial (409 Conflict) ou erro 401**: Exibir alerta visual amigável sem limpar os campos já preenchidos.

## Out of Scope

- Autenticação OAuth/Social de terceiros (Google, Apple) que exija credenciais externas ou serviços pagos.
- Recuperação de senha por e-mail com envio SMTP externo.

## Clarifications

### Session 2026-11-11
- Q: Como tratar o roteamento entre /login e /register? → A: Manter ambas as rotas ativas, compartilhando o componente AuthDossierCard com a respectiva aba ativada por padrão e alternador fluído no cliente (Opção A).
- Q: Qual a composição visual do contêiner? → A: Editorial Split Dossier com proporção 5+7 em desktop (vitrine à esquerda, formulário à direita) colapsando em coluna única no mobile (Opção A).
- Q: Deve ser incluído controle de exibição de senha? → A: Sim, botão inline tátil com alvo de 44x44px e ícones SVG vetoriais (olho aberto / fechado) para mostrar/ocultar senha (Opção A).

