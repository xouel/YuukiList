# Spec Delta

## Purpose

Garantir os direitos fundamentais de autodeterminacao informativa e conformidade com a LGPD no YuukiList, viabilizando exportacao integral de dados pessoais nos formatos JSON/CSV e expurgo definitivo de contas.

## ADDED Requirements

### Requirement: Personal Data Portability and Multi-Format Export
O sistema SHALL fornecer endpoints para exportacao integral dos dados do usuario, disponibilizando arquivos estruturados nos formatos padronizados JSON e CSV contendo biblioteca, progresso, avaliacoes e historico de diario.

#### Scenario: Exportacao de dados pessoais em formato JSON
- **GIVEN** um usuario solicitando o download dos seus dados no formato JSON
- **WHEN** a requisicao de exportacao e efetuada
- **THEN** o sistema SHALL gerar uma resposta contendo todos os dados do usuario em estrutura JSON valida e legivel

#### Scenario: Exportacao da biblioteca em formato tabular CSV
- **GIVEN** um usuario solicitando o download da sua biblioteca no formato CSV
- **WHEN** a requisicao de exportacao CSV e recebida
- **THEN** o sistema SHALL formatar os registros em colunas tabulares com cabecalhos claros e separadores compativeis com planilhas eletronicas

### Requirement: Definite Account Erasure and Right to be Forgotten
O sistema SHALL fornecer um fluxo de exclusao definitiva de conta com confirmacao via modal de seguranca com checkbox de consentimento explicito do titular, expurgando imediatamente todas as sessoes ativas, links de compartilhamento, historico de diario e registros de biblioteca associados.

#### Scenario: Exclusao irreversivel de conta com consentimento explicito
- **GIVEN** um usuario autenticado confirmando a exclusao com o checkbox de consentimento ativado
- **WHEN** a solicitacao de exclusao definitiva e enviada
- **THEN** o sistema SHALL remover os registros da biblioteca, historico de eventos, tokens de sessao e links compartilhados, invalidando o login imediatamente

#### Scenario: Bloqueio de tentativa de exclusao sem consentimento confirmado
- **GIVEN** um usuario enviando a requisicao de exclusao sem a confirmacao do checkbox de consentimento
- **WHEN** a requisicao de exclusao e processada
- **THEN** o sistema SHALL rejeitar a operacao com erro e manter todos os dados da conta estritamente preservados
