# Design: 027-editorial-auth-experience

## Context

O sistema de autenticação do YuukiList opera sobre o Next.js App Router conectado a Route Handlers (`/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`, `/api/v1/auth/logout`), que acoplam o backend NestJS em memória (`AuthModule`, `AuthService`, Prisma) e emitem cookies de sessão seguros HttpOnly (`yuuki_session`).
Embora o fluxo de backend e cliente esteja robustamente validado por testes de integração (`tests/auth-backend.test.mjs` e `tests/auth-frontend.test.mjs`), a camada visual de autenticação (`login-form.tsx`, `register-form.tsx` e as rotas `/login` e `/register`) ainda reflete os protótipos originais com paleta tech azul/ciano (`#121520`, `#181C2B`, `#06B6D4`), páginas fisicamente desconectadas, ausência de controle tátil de visibilidade de senha e falta de conexão com a identidade visual Nanquim/Carmim estabelecida no projeto.

## Goals / Non-Goals

**Goals:**
- Unificar a experiência de login e cadastro em um contêiner `AuthDossierCard` no formato Editorial Split Dossier (5 colunas para vitrine visual com citação e selos; 7 colunas para o formulário de alta densidade).
- Permitir alternância instantânea entre as abas *Entrar* e *Criar Conta* no cliente sem recarregamento de página e mantendo os parâmetros de query (`?redirect=...`).
- Implementar botões táteis inline para alternância de visibilidade de senha (mostrar/ocultar senha) com alvo mínimo de 44x44px e ícones SVG vetoriais.
- Erradicar 100% dos resíduos de cores legadas (`#06B6D4`, `#22D3EE`, `#121520`, `#181C2B`), aplicando os tokens da paleta Asian Editorial (`#121115`, `#1A1820`, `#24202C`, `#2B2735`, `#E05347`, `#F4EFEA`).
- Manter 100% de compatibilidade com os testes existentes sem qualquer quebra de regressão.

**Non-Goals:**
- Integração com provedores OAuth de terceiros (Google, Apple, etc.) ou serviços de terceiros que quebrem o princípio de Custo Zero Permanente.
- Alterações em schemas de banco de dados, assinaturas de API ou cookies de sessão.

## Decisions

1. **Arquitetura Unificada do `AuthDossierCard`**
   - **Escolha:** Criar o componente `apps/web/src/components/auth/auth-dossier-card.tsx` que recebe `initialTab?: 'signin' | 'signup'` e controla a aba ativa no cliente, renderizando a vitrine lateral à esquerda e o formulário correspondente à direita. As rotas `/login` e `/register` continuam ativas para garantir links diretos e deep-links, renderizando este mesmo componente com a respectiva aba selecionada por padrão.
   - **Alternativas consideradas:**
     - *Manter páginas isoladas*: Rejeitado por manter fricção na navegação e destoar do padrão Auth UI do 21st.dev.
     - *Eliminar `/login` e `/register` criando `/auth`*: Rejeitado por quebrar convenções consolidadas do Next.js e redirects configurados na aplicação.
   - **Justificativa:** Proporciona transição fluida sem sacrificar a indexação ou a ergonomia de links diretos.

2. **Transições de Movimento e Acessibilidade**
   - **Escolha:** Utilizar transições puras de Tailwind CSS aceleradas por GPU (`opacity` e `transform: translateY`), com curva suave `cubic-bezier(0.16, 1, 0.3, 1)` e respeito obrigatório a `prefers-reduced-motion`.
   - **Alternativas consideradas:** Instalar bibliotecas externas de animação pesadas.
   - **Justificativa:** Zero dependências adicionais, zero impacto de bundle e conformidade estrita com `xspec/constitution.md`.

3. **Alternador de Visibilidade de Senha**
   - **Escolha:** Estado local nos formulários (`showPassword: boolean`) que altera o atributo `type` entre `password` e `text`, renderizando botões táteis de 44x44px com ícones SVG vetoriais inline e atributos `aria-label` descritivos.
   - **Alternativas consideradas:** Revelação padrão dependente do navegador (inconsistente entre plataformas móveis).
   - **Justificativa:** Máxima ergonomia móvel e conformidade com WCAG 2.2 AA.

## Risks / Trade-offs

- **[Risco] Salto de altura entre formulários (2 campos no login vs 3 campos no cadastro)** → **Mitigação:** Definir `min-height` adequado no contêiner e transição suave de opacidade para evitar trepidação perceptível.
- **[Risco] Ataques de Open Redirect via parâmetro `?redirect=`** → **Mitigação:** Preservar a validação existente que exige caminhos relativos iniciados por `/` e rejeita barras duplas `//` ou protocolos externos.

## Migration Plan

1. Criar a suíte de testes TDD `tests/editorial-auth-experience.test.mjs`.
2. Implementar `AuthDossierCard` em `apps/web/src/components/auth/auth-dossier-card.tsx`.
3. Refatorar `login-form.tsx` e `register-form.tsx` aplicando os novos tokens e o alternador de visibilidade.
4. Conectar as páginas `/login` e `/register` ao `AuthDossierCard`.
5. Validar aprovação completa dos testes e integridade do build de produção.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `apps/web/src/components/auth/auth-dossier-card.tsx` — Contêiner principal Editorial Split Dossier com vitrine e alternador de abas.
- `[CREATE]` `tests/editorial-auth-experience.test.mjs` — Suíte TDD cobrindo os cenários normativos da fatia.
- `[MODIFY]` `apps/web/src/components/auth/login-form.tsx` — Adaptação à paleta mineral, controle de visibilidade de senha e alvos 44px.
- `[MODIFY]` `apps/web/src/components/auth/register-form.tsx` — Adaptação à paleta mineral, controle de visibilidade de senha e alvos 44px.
- `[MODIFY]` `apps/web/src/app/login/page.tsx` — Uso do `AuthDossierCard` com aba `signin`.
- `[MODIFY]` `apps/web/src/app/register/page.tsx` — Uso do `AuthDossierCard` com aba `signup`.

## Data Model

- **`LoginDto`**:
  - `identifier: string` (email ou username, mín. 3 caracteres)
  - `password: string` (mín. 8 caracteres)
- **`RegisterDto`**:
  - `email: string` (formato RFC 5322 válido)
  - `username: string` (alfanumérico, 3 a 30 caracteres)
  - `password: string` (mín. 8 caracteres)

## Contracts

- **Endpoint de Login**:
  - Rota: `POST /api/v1/auth/login`
  - Body: `LoginDto`
  - Retorno Sucesso: `{ id, email, username, displayName, role }` + `Set-Cookie: yuuki_session=...; HttpOnly; SameSite=Lax`
  - Erros: `401 Unauthorized` (credenciais inválidas), `400 Bad Request` (validação de schema)
- **Endpoint de Cadastro**:
  - Rota: `POST /api/v1/auth/register`
  - Body: `RegisterDto`
  - Retorno Sucesso: `{ id, email, username, displayName, role }` + `Set-Cookie: yuuki_session=...; HttpOnly; SameSite=Lax`
  - Erros: `409 Conflict` (email ou username já em uso), `400 Bad Request` (dados inválidos)

## Research

- **Referência Visual 21st.dev**: Componente `@jahed/components/auth-ui` — analisado para a extração do modelo de alternância fluida de abas e botões de revelação de credenciais.
- **Análise de Custo Zero**: Implementação 100% nativa utilizando React 19, Next.js 15 e Tailwind CSS v3 sem adição de pacotes externos, sem serviços de terceiros e sem custos de nuvem.

