# Proposal: User Profile, Statistics, Granular Sharing & LGPD

> **X-Spec** · ID: `015-profile-stats-and-sharing` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

Os usuarios do YuukiList dedicam centenas de horas ao entretenimento asiatico e necessitam de uma visao analitica unificada sobre seus habitos de consumo (horas investidas, categorias, generos e paises favoritos), bem como da capacidade de compartilhar suas colecoes com amigos de forma controlada e segura. Alem disso, os principios constitucionais de soberania de dados e as diretrizes da LGPD exigem portabilidade integral (exportacao em JSON e CSV) e o direito ao esquecimento (exclusao definitiva de conta). Esta fatia implementa a pagina `/profile` com estatisticas visuais e vitrine de favoritos, geracao de links publicos temporarios e revogaveis (`/share/:token`), e recursos completos de exportacao e expurgo de dados.

## What Changes

- Modelagem e calculo de estatisticas analiticas de consumo: obras concluidas, tempo estimado investido em doramas/animes (horas), volumes e capitulos lidos, distribuicao percentual por categoria, top generos e paises de origem, e media geral de notas.
- Pagina `/profile` no padrao Dark Editorial exibindo dados do usuario, resumo quantitativo, vitrine de obras favoritas (`♥`), barras analiticas e centro de controle de privacidade e dados.
- Sistema de links publicos de compartilhamento temporario (`/share/:token`): geracao de tokens seguros com prazos configuraveis de expiracao (7, 30 ou 90 dias), somente leitura, mascaramento estrito de notas privadas/spoilers e botao de revogacao instantanea.
- Rota publica `/share/[token]` permitindo que visitantes anonimos visualizem a biblioteca e o perfil compartilhado sem permissao de escrita ou acesso a dados privados.
- Exportacao completa de dados pessoais do usuario nos formatos abertos `JSON` e `CSV` para download imediato (biblioteca, progresso, notas e avaliacoes).
- Fluxo de exclusao definitiva de conta em conformidade com a LGPD com confirmacao no modal via checkbox de consentimento explicito, revogando sessoes ativas e expurgando todos os dados da conta.

## Capabilities

### New Capabilities

- `user-profile-stats`: Modelo de dados e endpoints de agregacao analitica do perfil do usuario, calculando distribuicao por categoria, genero, pais, tempo estimado e vitrine de favoritos.
- `granular-sharing`: Gerador e validador de links de compartilhamento publico via tokens seguros com expiracao temporal (7/30/90 dias), modo somente leitura e revogacao em um clique.
- `data-export-lgpd`: Endpoints e servicos de exportacao de dados pessoais em JSON e CSV e exclusao definitiva de conta com expurgo integral de dados.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/profile.ts`: Novos contratos, tipos de estatisticas, DTOs de link de compartilhamento e schemas de exportacao.
- `packages/shared/src/index.ts`: Exportacao do modulo `profile.ts`.
- `apps/api/src/profile/`: Repositorio e servico de agregacao de perfil, compartilhamento e expurgo LGPD, alem de controller REST.
- `apps/api/src/app.module.ts`: Registro do novo modulo `ProfileModule`.
- `apps/web/src/app/profile/page.tsx`: Pagina completa do perfil com estatisticas, vitrine de favoritos e acoes de exportacao/exclusao.
- `apps/web/src/app/share/[token]/page.tsx`: Pagina publica de visualizacao compartilhada.
- `apps/web/src/components/profile/`: Componentes visuais (`profile-stats.tsx`, `favorites-showcase.tsx`, `share-dialog.tsx`, `delete-account-dialog.tsx`).
- `apps/web/src/server/container.ts`: Registro do controller e servicos de perfil e compartilhamento.
- `tests/profile-sharing-lgpd.test.mjs`: Suite de testes cobrindo calculo de estatisticas, geracao/expiracao/revogacao de links e exportacao/exclusao LGPD.

## User Stories

### US1 — Painel de Perfil e Estatisticas Analiticas de Consumo (Priority: P1)
Como usuario do YuukiList, desejo visualizar meu perfil com estatisticas consolidadas das obras que assisti e li, incluindo horas totais estimadas, distribuicao por categoria e vitrine de favoritos, para entender e celebrar minha jornada de entretenimento.

- **Why this priority:** Atende diretamente a necessidade de valorizacao e centralizacao de registros do usuario.
- **Independent Test:** Criar itens com categorias e status concluidos no repositorio de biblioteca e consultar `/api/v1/profile/stats`; verificar que o total de concluidos, distribuicao e medias coincidem exatamente com os dados cadastrados.

### US2 — Compartilhamento Granular via Link Publico Expiravel e Revogavel (Priority: P1)
Como usuario, desejo gerar um link temporario seguro para compartilhar minha lista e favoritos com amigos sem expor minhas anotacoes privadas e podendo revogar o acesso a qualquer instante.

- **Why this priority:** Permite o compartilhamento social seletivo respeitando estritamente a privacidade por padrao (Principio VII).
- **Independent Test:** Gerar link com expiracao de 7 dias; validar acesso publico em `/share/:token` comprovando que notas privadas foram omitidas; revogar o token e confirmar que novas requisicoes sao rejeitadas com 404/410.

### US3 — Soberania de Dados, Exportacao (JSON/CSV) e Exclusao LGPD (Priority: P2)
Como usuario, desejo exportar todos os meus dados em JSON ou CSV para portabilidade, e poder excluir minha conta definitivamente caso decida deixar a plataforma.

- **Why this priority:** Cumpre os principios de Custo Zero, Soberania do Usuario e conformidade com a legislacao de protecao de dados (LGPD).
- **Independent Test:** Executar download de exportacao em JSON e CSV conferindo campos obrigatorios; disparar exclusao de conta com confirmacao do nome de usuario e validar que todas as sessoes, links e registros sao eliminados.

## Success Criteria

- **SC-001**: O endpoint de estatisticas calcula com precisao o total de obras concluidas, distribuicao percentual pelas 6 categorias, top generos e media de notas.
- **SC-002**: A pagina `/profile` renderiza no padrao Dark Editorial os cards de resumo, barras analiticas e a vitrine de obras favoritas.
- **SC-003**: Os links de compartilhamento possuem tokens criptograficamente unicos, suportam prazos de 7, 30 ou 90 dias, e bloqueiam imediatamente o acesso apos revogacao.
- **SC-004**: O sistema gera downloads validos em JSON e CSV e executa a exclusao definitiva de conta apos confirmacao em duas etapas.

## Edge Cases

- Usuario sem obras concluidas ou sem avaliacoes: exibir metricas zeradas e empty state instrutivo sem quebras por divisao por zero.
- Link de compartilhamento acessado apos a data de expiracao: retornar status 410 Gone com mensagem explicativa amigavel.
- Tentativa de exclusao de conta com nome de usuario divergente: rejeitar operacao e manter a conta intacta.
- Exportacao de dados de usuario com milhares de registros: serializacao em lote sem timeout ou estouro de memoria.

## Out of Scope

- Feed social publico com comentarios entre usuarios (fora do escopo do MVP).
- Login social ou vinculo com redes externas (OAuth).
- Importacao automatica de backups de terceiros (MyAnimeList / AniList / Letterboxd).

## Clarifications

### Session 2026-11-10
- Q: Configuracao e Politica Padrao dos Links de Compartilhamento (/share/:token)? → A: Opcao A aceita — Expiracao padrao de 30 dias (opcoes de 7 e 90 dias), somente leitura, mascaramento estrito de notas privadas/spoilers e revogacao em um clique.
- Q: Formato de Apresentacao das Estatisticas no Perfil (/profile)? → A: Opcao A aceita — Cards de metricas-chave (concluidos, tempo estimado, capitulos/volumes lidos, media) combinados com barras analiticas de distribuicao por categoria, genero e pais.
- Q: Protocolo de Seguranca para Exclusao Definitiva de Conta (LGPD)? → A: Opcao B aceita — Confirmacao direta por modal de seguranca com checkbox de consentimento explicito ("Entendo que meus dados serao permanentemente apagados") e botao de confirmacao de exclusao definitiva da conta.

