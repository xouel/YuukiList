# Proposal: 033-profile-customization-and-ui-polish

> **X-Spec** · ID: `033-profile-customization-and-ui-polish` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

O YuukiList evoluiu para uma interface editorial refinada, mas apresentava inconsistencias pontuais e deficiencias na personalizacao e persistencia de dados. O botao de acao no Hero Spotlight exibia um duplo sinal visual de soma (+ + Adicionar a Lista), a linha de abas da biblioteca renderizava uma barra de rolagem horizontal desnecessaria em navegadores Windows, e a secao Continuar Acompanhando e a Vitrine de Favoritos necessitavam de persistencia confiavel no banco de dados para sincronizar os registros do usuario. Alem disso, o perfil carecia de customizacao visual e de dados pessoais. Esta entrega integra a persistencia com o Supabase PostgreSQL, soluciona as regressoes de interface, implementa a edicao de perfil com foto via Supabase Storage, cinco molduras editoriais de avatar, capa de topo, biografia e telefone estritamente privado em conformidade com a LGPD.

## What Changes

- Correcao no Hero Spotlight: remocao do caractere literal de adicao no texto do botao, mantendo apenas o icone SVG e o texto "Adicionar a Lista" sem duplicacao.
- Remocao da barra de rolagem horizontal desnecessaria nas abas de status da biblioteca com a classe utilitaria CSS `scrollbar-none` em `globals.css`.
- Integracao da camada de persistencia de dados com o Supabase PostgreSQL via Prisma, garantindo persistencia estavel de contas, biblioteca e favoritos.
- Exibicao confiavel das obras em andamento (status canonicamente filtrados por ASSISTINDO e LENDO) na secao Continuar Acompanhando do Home Hub.
- Retorno garantido das obras marcadas como favoritas pelo usuario na Vitrine de Favoritos do Perfil com base no campo persistido `isFavorite`.
- Extensao do perfil de usuario para suportar: foto de perfil (`avatarUrl`), moldura de avatar (`avatarFrame`), capa de topo (`bannerUrl`), biografia (`bio`), telefone opcional (`phone`) e localizacao (`location`).
- Upload direto de imagens (avatar e capa de perfil) para bucket no Supabase Storage com pre-visualizacao instantanea.
- Catalogo de cinco molduras editoriais de avatar: Nenhuma (`none`), Nanquim Puro (`nanquim`), Carmim Imperial (`carmim`), Ouro Antigo (`ouro`) e Sakura Suave (`sakura`).
- Modal editorial interativo de Edicao de Perfil em `/profile` com validacao de campos, mascara de telefone e atualizacao atomica via API REST.
- Protecao estrita de privacidade: o campo de telefone e de visualizacao restrita ao proprio titular autenticado, sendo omitido em respostas publicas e links compartilhados.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `home-hub`: Remove duplo sinal de soma no Hero Spotlight e assegura que itens em andamento sejam retornados e atualizados em Continuar Acompanhando.
- `personal-library-ui`: Remove barra de rolagem horizontal espuria nas abas de status e garante que alternancia de favorito persista no banco e reflita na interface.
- `user-profile-stats`: Adiciona edicao de perfil com foto de avatar, 5 molduras estilizadas, capa de topo, biografia, telefone privado e vitrine de favoritos conectada aos dados do usuario.

## Impact

- Banco de dados: evolucao do schema Prisma com migracao no Supabase PostgreSQL adicionando campos de customizacao em `User` e flag `isFavorite` em `UserLibraryItem`.
- APIs afetadas: `PATCH /api/v1/profile` para atualizacao de dados cadastrais e upload de midia no Supabase Storage; `GET /api/v1/profile/stats` retornando favoritos sincronizados; rotas de biblioteca mantendo consistencia com o banco.
- Interface: `apps/web/src/components/home/hero-spotlight.tsx`, `apps/web/src/components/home/continue-watching.tsx`, `apps/web/src/components/library/library-filters.tsx`, `apps/web/src/components/library/library-card.tsx`, `apps/web/src/app/profile/page.tsx`, modal de edicao de perfil e molduras de avatar.

## User Stories

### US1 — Polimento Visual Imediato no Hero e Biblioteca (Priority: P1)
Como usuario da plataforma, quero visualizar botoes e controles limpos sem duplicacoes visuais e sem barras de rolagem indesejadas, para ter uma navegacao fluida e profissional.

- **Why this priority:** Remove defeitos visuais gritantes reportados diretamente pelo usuario antes de avancar nas customizacoes.
- **Independent Test:** Carregar a Home e a Biblioteca no navegador; verificar que o botao do Hero exibe "Adicionar a Lista" com um unico icone e que a faixa de abas nao exibe barra de rolagem horizontal.

### US2 — Persistencia e Retorno de Continuar Acompanhando e Favoritos (Priority: P1)
Como usuario autenticado, quero que minhas obras ativas aparecam em Continuar Acompanhando e minhas obras favoritas aparecam na Vitrine de Favoritos, para que meu progresso seja refletido com fidelidade.

- **Why this priority:** O acompanhamento pessoal e a vitrine de favoritos sao o nucleo funcional da experiencia do usuario no YuukiList.
- **Independent Test:** Adicionar obra como ASSISTINDO ou favoritar obra; verificar retorno imediato na tela inicial e na vitrine do perfil.

### US3 — Edicao e Customizacao Completa do Perfil (Priority: P2)
Como usuario, quero editar meu perfil adicionando foto, capa, moldura estilizada, biografia e telefone opcional, para expressar minha identidade no acervo.

- **Why this priority:** Permite ao usuario personalizar sua presenca na plataforma mantendo a privacidade de seus dados sensiveis.
- **Independent Test:** Abrir o modal de edicao em `/profile`, selecionar moldura, preencher bio e telefone, salvar e verificar renderizacao com telefone oculto para terceiros.

## Success Criteria

- **SC-001**: O botao primario de inclusao no Hero Spotlight renderiza exatamente um icone SVG de adicao seguido pelo texto "Adicionar a Lista", sem duplicacao de caractere.
- **SC-002**: A faixa de abas de status da biblioteca nao apresenta barra de rolagem horizontal visivel em telas desktop ou resolucoes padrao.
- **SC-003**: Obras com status ASSISTINDO ou LENDO sao listadas na secao Continuar Acompanhando quando o usuario estiver autenticado.
- **SC-004**: Obras marcadas como favoritas sao exibidas na Vitrine de Favoritos do perfil e podem ser alternadas diretamente pelo card da biblioteca.
- **SC-005**: O modal de edicao de perfil permite atualizar avatar, capa, moldura (escolha entre 5 opcoes), biografia e telefone opcional, persistindo no Supabase.
- **SC-006**: O telefone do usuario e estritamente omitido em visualizacoes publicas (`/share/:token`) e exposto exclusivamente na sessao do titular autenticado.

## Edge Cases

- Usuario tenta enviar arquivo de foto ou capa maior que 5 MB: sistema deve exibir validacao inline amigavel e rejeitar o upload antes do envio.
- Usuario remove todos os favoritos: a vitrine de favoritos deve renderizar o estado amigavel explicativo sem quebrar o layout.
- Perfil sem telefone ou biografia informados: os campos opcionais devem ser tratados com graciosa degradacao visual (sem exibir "undefined" ou "null").

## Out of Scope

- Integracao federada com APIs externas de busca (AniList e TMDB), que sera realizada na fatia sequencial 034.
- Edicao de email ou alteracao de senha de acesso (mantidas nas configuracoes de seguranca de conta existentes).

## Clarifications

### Session 2026-11-12
- Q: Como os usuarios devem definir suas fotos de perfil e capas? → A: Apenas upload direto de arquivo do computador para bucket do Supabase Storage.
- Q: Quais estilos de moldura de avatar devem estar disponiveis no perfil? → A: 5 molduras editoriais em SVG/CSS: Nenhuma, Nanquim Puro, Carmim Imperial, Ouro Antigo e Sakura Suave.
- Q: Qual deve ser o nivel de privacidade do campo de telefone opcional? → A: Estritamente privado: visivel apenas para o proprio usuario e nunca exposto em links publicos (/share/:token) conforme LGPD.

