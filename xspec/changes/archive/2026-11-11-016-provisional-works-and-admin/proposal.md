# Proposal: Provisional Works, Inclusion Requests, Admin & PWA

> **X-Spec** · ID: `016-provisional-works-and-admin` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-10`

## Why

O catálogo central do YuukiList depende de provedores e ingestão periódica, mas obras recentes, produções independentes ou produções asiáticas de nicho podem não estar presentes imediatamente. Para não bloquear o registro e acompanhamento dessas obras pelos usuários, esta fatia viabiliza a solicitação de inclusão de obras provisórias com detecção inteligente de duplicidade por trigramas (`pg_trgm`), disponibilização imediata na biblioteca do usuário solicitante, painel administrativo (`/admin`) para triagem, moderação e proteção de edições manuais contra sobrescrita, além de manifesto e Service Worker PWA para navegação offline segura.

## What Changes

- Implementação do formulário de solicitação de inclusão de obras (`/items/request` ou modal) com campos mínimos: título, categoria canônica, formato, ano de lançamento estimado e país de origem.
- Mecanismo de detecção prévia de duplicatas via similaridade trigram (`pg_trgm` limiar 0.35) alertando sobre obras existentes sem bloquear o envio em casos ambíguos.
- Integração da obra provisória diretamente na biblioteca pessoal do solicitante com badge `Provisório`, permitindo acompanhamento imediato de episódios/capítulos.
- Gestão do ciclo de vida das solicitações (`PENDENTE`, `EM_ANALISE`, `APROVADA`, `RECUSADA` com justificativa do moderador).
- Implementação de controle de acesso por papéis (`USER`, `MODERATOR`, `ADMIN`) e painel administrativo (`/admin`) para visualização de métricas e triagem das solicitações.
- Recurso de proteção e travamento de campos editados manualmente (`isManuallyEdited: true` / `lockedFields`) para impedir sobrescrita em sincronizações automáticas externas.
- Manifesto PWA (`manifest.json` / Next.js metadata) para instalação em desktop e mobile, e Service Worker com estratégia de cache seguro para consulta offline e expurgo obrigatório no logout.

## Capabilities

### New Capabilities

- `provisional-works`: Solicitação e registro de obras provisórias com detecção de similaridade (`pg_trgm`), vinculação imediata à biblioteca do usuário e ciclo de vida de status.
- `admin-management`: Painel administrativo com controle de acesso RBAC (`USER`, `MODERATOR`, `ADMIN`), fila de moderação de solicitações e travamento de campos editados manualmente.
- `pwa-offline`: Manifesto de aplicação web progressiva instalável (PWA) e Service Worker com estratégia de cache offline resiliente e limpeza imediata no logout.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/`: Modelagem de enums de papéis de usuário (`Role`), status de solicitação (`RequestStatus`), DTOs de inclusão e auditoria.
- `apps/api/src/auth/`: Suporte a papéis (`role: USER | MODERATOR | ADMIN`) e guards de autorização administrativa.
- `apps/api/src/provisional/`: Repositório e serviço de solicitações provisórias e detecção trigram.
- `apps/api/src/admin/`: Módulo administrativo, endpoints de moderação e governança de campos manuais bloqueados.
- `apps/web/src/app/admin/`: Painel administrativo com visualização de solicitações e ações de moderação.
- `apps/web/src/app/manifest.ts` e Service Worker (`public/sw.js`): Suporte PWA instalável e cache offline.
- `tests/provisional-admin-pwa.test.mjs`: Suíte de testes automatizados cobrindo detecção trigram, fluxo de moderação, proteção de edições e comportamento offline/limpeza de cache.

## User Stories

### US1 — Solicitação de Inclusão e Obra Provisória Pessoal (Priority: P1)
Como usuário do YuukiList, desejo solicitar a inclusão de uma obra asiática não encontrada no catálogo geral, recebendo alertas de possíveis duplicatas e podendo acompanhá-la imediatamente na minha biblioteca pessoal enquanto aguarda moderação.

- **Why this priority:** Elimina atrito e não bloqueia o registro de consumo de obras independentes ou recentes.
- **Independent Test:** Submeter solicitação informando título com similaridade >= 0.35 e verificar alerta de correspondência; salvar a solicitação e comprovar que a obra provisória foi incluída na biblioteca do usuário com status de acompanhamento ativo.

### US2 — Painel Administrativo, Moderação e Proteção de Campos Manuais (Priority: P1)
Como administrador ou moderador, desejo acessar o painel `/admin` para revisar solicitações pendentes, aprovando-as com promoção ao catálogo oficial ou recusando-as com justificativa, além de travar campos editados manualmente contra sobrescrita por APIs externas.

- **Why this priority:** Assegura a integridade do catálogo e respeita o princípio de soberania de dados do documento mestre.
- **Independent Test:** Realizar login com usuário `MODERATOR` e acessar `/admin`; aprovar solicitação pendente comprovando que ela é promovida ao catálogo oficial e que alterações manuais têm flag `isManuallyEdited = true` blindada contra atualizações automáticas.

### US3 — PWA Instalável e Experiência Offline Resiliente (Priority: P2)
Como usuário em dispositivo móvel ou desktop, desejo instalar o YuukiList como aplicativo PWA e consultar dados recentes do catálogo mesmo quando estiver sem conexão com a internet, com garantia de limpeza do cache no logout.

- **Why this priority:** Melhora a experiência em trânsito e em conexões instáveis, cumprindo a diretriz de aplicativo leve sem custos.
- **Independent Test:** Verificar manifesto PWA válido e registro do Service Worker; simular consulta offline aos dados pré-carregados; disparar logout e comprovar que o cache privado foi completamente expurgado.

## Success Criteria

- **SC-001**: O formulário de inclusão detecta duplicatas potenciais com trigramas `pg_trgm` (limiar >= 0.35) alertando o usuário sem bloquear o envio em casos legítimos.
- **SC-002**: A obra provisória fica imediatamente utilizável na biblioteca pessoal do solicitante com badge `Provisório`.
- **SC-003**: O painel `/admin` é estritamente bloqueado (403/redirecionamento) para usuários sem papel `MODERATOR` ou `ADMIN`.
- **SC-004**: A aprovação de uma solicitação promove a obra ao catálogo oficial e preserva o histórico do solicitante.
- **SC-005**: Campos editados manualmente permanecem travados (`lockedFields`) contra sincronizações automáticas externas.
- **SC-006**: O manifesto PWA e o Service Worker fornecem navegação offline para dados recentes e executam limpeza total do cache ao encerrar sessão.

## Edge Cases

- Título submetido com caracteres tipográficos especiais ou variações romanizadas: a normalização trigram deve reconhecer a proximidade fonética/gráfica.
- Usuário tentando submeter múltiplas solicitações idênticas em curto intervalo: sistema deve identificar solicitação já em análise.
- Usuário sem privilégio administrativo tentando acessar rotas da API em `/api/v1/admin/*`: bloqueio rigoroso com HTTP 403 Forbidden.
- Dispositivo operando sem rede desde o início: exibição de tela amigável de contingência offline sem quebrar o layout.

## Out of Scope

- Edição offline ou mutação de dados da biblioteca desconectado da rede (explicitamente fora do MVP conforme documento mestre).
- Notificações push via Web Push Server remoto com custos de infraestrutura paga.
- Aplicativos nativos para lojas App Store ou Google Play.

## Clarifications

### Session 2026-11-10
- Q: Como deve funcionar o ciclo de vida e visibilidade da obra provisória para o solicitante enquanto aguarda moderação? → A: Opção A aceita — Obra provisória fica imediatamente rastreável na biblioteca pessoal do solicitante com badge 'Provisório', migrando automaticamente para o catálogo oficial após aprovação do admin.
- Q: Qual deve ser o rigor da detecção de duplicatas (pg_trgm) no formulário de inclusão? → A: Opção A aceita — Limiar pg_trgm de 0.35 com alerta interativo de obras semelhantes, permitindo ao usuário confirmar e prosseguir em casos ambíguos (remakes, sequências, homônimos).
- Q: Qual a estratégia de cache offline e segurança de dados do PWA (Service Worker)? → A: Opção A aceita — Cache Stale-While-Revalidate para catálogo/biblioteca com expurgo imediato de caches privados no logout e fallback offline seguro.

