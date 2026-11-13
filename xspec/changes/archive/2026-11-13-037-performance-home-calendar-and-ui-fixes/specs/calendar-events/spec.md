# Spec Delta

## MODIFIED Requirements

### Requirement: Canonical Calendar Event Model and Reliability Scoring
O sistema SHALL modelar eventos de calendario associados a obras reais em andamento (`EM_ANDAMENTO`) do catalogo Supabase quando conectado ao `CatalogRepository` (preservando IDs UUID, slugs e capas oficiais reais), mantendo o fallback em memória apenas quando instanciado isoladamente em testes sem repositório.

#### Scenario: Cadastro e consulta de eventos com confiabilidade explicita
- **GIVEN** eventos de lancamento de episodios e estreias associados a obras do catalogo
- **WHEN** o servico de calendario consulta os registros de um determinado periodo
- **THEN** o sistema SHALL retornar cada evento com seu identificador, tipo, data/horario original, regiao de referencia e badge de confiabilidade associado

#### Scenario: Identificacao visual de datas estimadas e nao confirmadas
- **GIVEN** um evento de lancamento cuja data foi deduzida por projecao ou fonte preliminar
- **WHEN** os dados do evento sao recuperados pela API
- **THEN** o sistema SHALL marcar o evento com o status ESTIMATED ou UNCONFIRMED e sinalizar que a informacao carece de confirmacao oficial

#### Scenario: Geracao de agenda semanal com obras reais em andamento e capas oficiais
- **GIVEN** um `CatalogRepository` conectado ao catálogo PostgreSQL com obras `EM_ANDAMENTO` e `coverPath` oficial
- **WHEN** `CalendarService.getEvents` consulta o período do calendário
- **THEN** o sistema SHALL popular os eventos utilizando obras reais do banco (cruzadas com itens da biblioteca pessoal do usuário), retornando URLs reais de capa oficial, slugs e `mediaItemId` UUID válidos

