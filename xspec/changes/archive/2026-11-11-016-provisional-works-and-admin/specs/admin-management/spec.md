# Spec Delta: admin-management

## Purpose

Define os contratos e comportamentos normativos para o controle de acesso baseado em papéis (RBAC), fila de moderação administrativa de solicitações de catálogo e governança de travamento de campos editados manualmente.

## ADDED Requirements

### Requirement: Role-Based Access Control and Administration Dashboard
O sistema SHALL restringir o acesso a rotas e recursos administrativos exclusivamente a usuários autenticados portando os papéis MODERATOR ou ADMIN, rejeitando acessos não autorizados de usuários comuns com status HTTP 403 Forbidden ou redirecionamento defensivo.

#### Scenario: Acesso permitido ao painel administrativo por usuario moderador
- **GIVEN** um usuário autenticado com papel MODERATOR ou ADMIN
- **WHEN** requisita a visualização do painel administrativo em /admin ou endpoints administrativos da API
- **THEN** o sistema SHALL autorizar a requisição e fornecer os dados de gestão do catálogo e solicitações pendentes.

#### Scenario: Bloqueio de acesso administrativo para usuario comum sem privilegios
- **GIVEN** um usuário autenticado com papel padrão USER
- **WHEN** tenta acessar rotas administrativas /admin ou chamar endpoints restritos da API
- **THEN** o sistema SHALL bloquear o acesso retornando erro 403 Forbidden e impedir qualquer modificação de moderação.

### Requirement: Inclusion Request Moderation and Manual Field Protection
O sistema SHALL fornecer interface de moderação para aprovação ou recusa de solicitações de inclusão com promoção ao catálogo oficial e suportar travamento de campos editados manualmente para blindá-los contra sobrescrita por sincronizações automáticas externas.

#### Scenario: Aprovacao de solicitacao e promocao de obra provisoria ao catalogo oficial
- **GIVEN** uma solicitação de obra provisória com status PENDENTE ou EM_ANALISE
- **WHEN** um administrador aprova a solicitação com eventuais ajustes nos metadados
- **THEN** o sistema SHALL promover a obra ao catálogo oficial e atualizar as referências na biblioteca dos usuários vinculados.

#### Scenario: Protecao de campos editados manualmente contra sobrescrita automatica
- **GIVEN** uma obra do catálogo que teve metadados editados manualmente por um administrador
- **WHEN** o processo de sincronização e ingestão periódica externa é executado para essa obra
- **THEN** o sistema SHALL preservar os valores manuais nos campos travados e recusar a sobrescrita pelo dado do provedor externo.

