# Proposal: 008-external-apis-poc

> **X-Spec** · ID: `008-external-apis-poc` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-09`

## Why

O YuukiList necessita de validação técnica e jurídica prévia das fontes de dados externas antes de substituir os dados semeados na camada de catálogo. Nenhuma API única cobre com precisão todas as 6 categorias (doramas, filmes, animes, mangás, manhwas e manhuas), exigindo uma prova de conceito (PoC) prática com 12 obras de teste representativas para avaliar taxas de acerto em metadados, contagem de episódios e capítulos, disponibilidade de imagens, restrições de licença (CC BY-SA, restrições comerciais), políticas de atribuição e garantia estrita do princípio inegociável de custo permanente zero (R$ 0).

## What Changes

- Criação dos clientes de consulta para as APIs gratuitas: TMDB (filmes/doramas), TVmaze (séries/calendário), Kitsu (anime/mangá), Anime News Network (ANN - XML/anime/mangá) e MangaUpdates (mangás, manhwas, manhuas).
- Normalização de respostas externas para a estrutura canônica de dados do YuukiList sem dependência de chaves pagas.
- Script de execução da prova de conceito (`scripts/poc-external-apis.mjs`) consultando os 12 títulos de teste oficiais definidos na Seção 10 do Documento Mestre.
- Geração da matriz comparativa estruturada em Markdown (`docs/poc/external-apis-coverage-matrix.md`) e JSON (`docs/poc/external-apis-coverage-matrix.json`), avaliando cobertura por campo, confiabilidade e restrições de licença.
- Implementação de fixtures determinísticas e suíte de testes de integração (`tests/external-apis-poc.test.mjs`) sem dependência de rede em tempo de teste.

## Capabilities

### New Capabilities

- `external-apis-poc`: Prova de conceito técnica e jurídica para integração com APIs externas gratuitas (TMDB, TVmaze, Kitsu, ANN, MangaUpdates) com matriz de cobertura e conformidade free-tier permanente.

### Modified Capabilities

Nenhuma.

## Impact

- `packages/shared/src/external/`: Interfaces compartilhadas de clientes e modelos de resposta de APIs externas.
- `apps/api/src/external/`: Clientes HTTP tipados com tratamento de rate limiting e normalização para TMDB, TVmaze, Kitsu, ANN e MangaUpdates.
- `scripts/poc-external-apis.mjs`: Script executável para consulta e validação dos 12 títulos de teste.
- `docs/poc/`: Matriz comparativa de cobertura, campos e licenças em Markdown e JSON.
- `tests/external-apis-poc.test.mjs`: Testes automatizados da PoC com fixtures de resposta.

## User Stories

### US1 — Consulta e Normalização de Obras Audiovisuais (TMDB e TVmaze) (Priority: P1)

Como desenvolvedor do catálogo, quero consultar doramas, filmes e animes no TMDB e TVmaze e normalizar seus metadados (títulos, sinopse, ano, total de episódios e temporadas) para validar a precisão e cobertura dessas fontes no catálogo do YuukiList.

- **Why this priority:** Doramas e filmes constituem o núcleo audiovisual do catálogo e exigem fontes robustas e gratuitas para datas e episódios.
- **Independent Test:** Executar a consulta para os títulos de teste audiovisuais (Moving, Queen of Tears, Alice in Borderland, Oldboy, Your Name) e validar o mapeamento normalizado de campos essenciais.

### US2 — Consulta e Normalização de Obras Gráficas e Literárias (Kitsu, ANN e MangaUpdates) (Priority: P1)

Como desenvolvedor do catálogo, quero consultar mangás, manhwas e manhuas no Kitsu, Anime News Network e MangaUpdates, mapeando capítulos, volumes, status de publicação e autores para identificar a fonte mais precisa para publicações orientais de leitura.

- **Why this priority:** Manhwas e manhuas possuem escassa cobertura em APIs ocidentais e necessitam de fontes especializadas como MangaUpdates.
- **Independent Test:** Executar a consulta para os títulos literários de teste (One Piece, Berserk, Solo Leveling, The Beginning After the End, Heaven Official's Blessing) e comparar a acurácia de contagem de capítulos.

### US3 — Matriz Comparativa de Cobertura, Licenciamento e Custo Zero (Priority: P2)

Como mantenedor do projeto, quero inspecionar uma matriz comparativa detalhada por campo e por obra, acompanhada da análise de termos de uso e licenças, para decidir de forma fundamentada quais fontes serão adotadas na etapa de sincronização de catálogo (R9).

- **Why this priority:** Garante conformidade com os Princípios IV (Custo R$ 0) e V (Soberania de Dados e Proveniência) antes de qualquer persistência no banco.
- **Independent Test:** Verificar se o artefato `docs/poc/external-apis-coverage-matrix.md` contém a análise dos 12 títulos em todas as 6 categorias com recomendação por campo.

## Success Criteria

- **SC-001**: 100% dos 12 títulos de teste oficiais do Documento Mestre mapeados e consultados nas respectivas APIs candidatas.
- **SC-002**: Cobertura de metadados obrigatórios (título, categoria, ano, país e status) documentada para cada API testada.
- **SC-003**: Análise jurídica e de licenciamento de dados e imagens documentada para cada uma das 5 fontes (TMDB, TVmaze, Kitsu, ANN, MangaUpdates).
- **SC-004**: Garantia absoluta de Custo Zero (R$ 0 permanente) comprovada nos termos de cada API sem exigência de planos pagos.
- **SC-005**: 100% dos testes automatizados da PoC passando deterministicamente com fixtures estáticas sem chamadas de rede externas em testes de regressão.

## Edge Cases

- Títulos com nomes em caracteres asiáticos (hangul, kanji, hanzi) sem correspondência exata em consultas por alfabeto latino.
- Obras com múltiplas mídias de mesmo título (ex: Solo Leveling como anime vs. manhwa; Alice in Borderland como dorama vs. mangá).
- APIs com rate limiting restrito (ANN limitando a 1 req/s por IP e TVmaze a 20 req/10s).
- APIs retornando XML (Anime News Network) exigindo parser especializado para o mesmo modelo de DTO das APIs REST/JSON.

## Out of Scope

- Persistência e alteração das 30 obras no banco de dados PostgreSQL de produção (escopo exclusivo da fatia R9).
- Armazenamento definitivo de imagens de capas externas no disco (Soberania de Dados).
- Automação de cron jobs periódicos em segundo plano para ingestão contínua.

## Clarifications

### Session 2026-11-09
- Q: Estratégia de execução da PoC e testes automatizados? → A: Clientes HTTP reais e scripts executáveis via terminal (`scripts/poc-external-apis.mjs`) que consultam as APIs reais e geram fixtures, enquanto a suíte de testes automatizados (`tests/external-apis-poc.test.mjs`) roda com fixtures estáticas para garantir execução determinística e offline instantânea.
- Q: Formato e local de entrega da matriz de decisão? → A: Gerar a matriz comparativa completa em Markdown (`docs/poc/external-apis-coverage-matrix.md`) e em formato JSON estruturado (`docs/poc/external-apis-coverage-matrix.json`), detalhando para os 12 títulos a cobertura de metadados, precisão de contagem de unidades, licença/termos, limites e fonte primária recomendada.
- Q: Fronteira de escopo e banco de produção? → A: PoC estritamente isolada — nenhum dado de catálogo existente no PostgreSQL de produção será alterado ou sobrescrito em R8. A integração definitiva e substituição do seed mock ocorrerá na fatia R9 (`009-catalog-ingestion-sync`).

