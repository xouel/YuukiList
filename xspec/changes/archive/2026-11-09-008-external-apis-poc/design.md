# Design: 008-external-apis-poc

## Context

O YuukiList possui catálogo unificado (R1-R3), autenticação por cookies seguros (R4-R5) e biblioteca pessoal (R6-R7) operando sobre 30 obras semeadas inicialmente.
A Seção 9 e 10 do Documento Mestre de Contexto e a Fase 4 do PRD estabelecem a necessidade de uma prova de conceito (PoC) prática e de due diligence jurídica antes de substituir o seed por ingestão externa na fatia R9.
A PoC avalia 5 APIs candidatas (TMDB, TVmaze, Kitsu, Anime News Network e MangaUpdates) sobre 12 títulos de teste oficiais distribuídos nas 6 categorias do catálogo, garantindo Custo Zero permanente (R$ 0) e Soberania de Dados.

## Goals / Non-Goals

**Goals:**
- Implementar clientes HTTP tipados para TMDB, TVmaze, Kitsu, ANN e MangaUpdates com tratamento de rate limiting e timeouts.
- Criar normalizador de dados mapeando payloads heterogêneos para `CanonicalExternalMediaDto` com rastreamento de proveniência por campo.
- Executar a matriz comparativa sobre os 12 títulos de teste (Doramas: Moving, Queen of Tears, Alice in Borderland; Filmes: Oldboy, Your Name; Animes: Naruto, Frieren, Solo Leveling; Mangás: One Piece, Berserk; Manhwas: Solo Leveling, The Beginning After the End; Manhua: Heaven Official's Blessing).
- Gerar os relatórios formais da PoC em `docs/poc/external-apis-coverage-matrix.md` e `docs/poc/external-apis-coverage-matrix.json`.
- Prover suíte de testes automatizados com fixtures estáticas sem chamadas de rede externas para execução determinística no CI/Node test runner.

**Non-Goals:**
- Persistência e alteração de dados no banco de dados relacional de produção (escopo exclusivo da fatia R9).
- Armazenamento em disco de arquivos binários de imagem externos (violação da Soberania de Dados e direitos autorais).
- Agendamento de rotinas de sincronização periódica (cron jobs da ingestão).

## Decisions

1. **Clientes HTTP Nativos com Zero Dependências Externas Adicionais**
   - **Escolha:** Utilizar a API nativa `globalThis.fetch` do Node.js com parser XML leve para ANN sem adicionar bibliotecas pesadas de terceiros (como Axios ou xml2js).
   - **Alternativas consideradas:** Instalar bibliotecas externas de requisição e parsers XML.
   - **Justificativa:** Cumpre estritamente o Princípio IV (Custo R$ 0) e Princípio I (Simplicidade arquitetural e higiene de dependências).

2. **Fixtures Determinísticas para Testes de Integração**
   - **Escolha:** Os testes automatizados em `tests/external-apis-poc.test.mjs` consom payloads JSON e XML reais salvos em `tests/fixtures/external/`, permitindo execução em menos de 200ms sem risco de quebras por instabilidade de rede ou esgotamento de quota.
   - **Alternativas consideradas:** Fazer requisições ao vivo para as APIs externas durante os testes automatizados.
   - **Justificativa:** Garante 100% de estabilidade determinística em ambientes offline e no pipeline de verificação do X-Spec.

3. **Script Executável Separado para Amostragem Real sob Demanda**
   - **Escolha:** O script `scripts/poc-external-apis.mjs` realiza consultas reais à rede com intervalo de segurança (delay de 1s para respeitar limites da ANN e TVmaze) e salva/atualiza as fixtures e a matriz comparativa.
   - **Alternativas consideradas:** Integrar a rotina de amostragem na inicialização do servidor NestJS.
   - **Justificativa:** Isola o tráfego de rede exploratório do ciclo de vida da aplicação de produção.

## Risks / Trade-offs

- **[Risco] Chave de API do TMDB ausente em ambiente de teste** → **Mitigação:** O cliente TMDB utiliza `process.env.TMDB_API_KEY` se fornecido, e nos testes automatizados consome as fixtures capturadas.
- **[Risco] Bloqueio por excesso de requisições na ANN (1 req/s) ou TVmaze (20 req/10s)** → **Mitigação:** Implementar rate limiter simples com delay de 1.1s entre requisições no script da PoC.
- **[Risco] Licença CC BY-SA do TVmaze exigir viralidade na redistribuição de dados derivados** → **Mitigação:** A matriz de decisão documenta claramente a restrição e recomenda o TVmaze primariamente para consulta de calendário e numeração de episódios, sem mesclar dados textuais derivados restritos.

## Migration Plan

1. Não há impacto de migração de banco de dados ou alteração nas tabelas existentes do PostgreSQL.
2. A suíte de testes da PoC é adicionada ao `verification.commands` em `xspec/config.yaml`.
3. O catálogo em produção permanece servindo as 30 obras semeadas.

## Touch-Points (Arquivos Impactados)

- `[CREATE]` `packages/shared/src/external.ts` — Contratos e DTOs de dados normalizados de APIs externas.
- `[MODIFY]` `packages/shared/src/index.ts` — Exportação dos novos contratos de APIs externas.
- `[CREATE]` `apps/api/src/external/tmdb.client.ts` — Cliente HTTP para TMDB.
- `[CREATE]` `apps/api/src/external/tvmaze.client.ts` — Cliente HTTP para TVmaze.
- `[CREATE]` `apps/api/src/external/kitsu.client.ts` — Cliente HTTP para Kitsu.
- `[CREATE]` `apps/api/src/external/ann.client.ts` — Cliente HTTP e parser XML para Anime News Network.
- `[CREATE]` `apps/api/src/external/mangaupdates.client.ts` — Cliente HTTP para MangaUpdates.
- `[CREATE]` `apps/api/src/external/external-normalizer.ts` — Normalizador de campos e identificadores.
- `[CREATE]` `scripts/poc-external-apis.mjs` — Script de execução e amostragem da PoC sobre os 12 títulos.
- `[CREATE]` `docs/poc/external-apis-coverage-matrix.md` — Relatório formal e matriz comparativa por campo/obra.
- `[CREATE]` `docs/poc/external-apis-coverage-matrix.json` — Estrutura de dados da matriz comparativa.
- `[CREATE]` `tests/fixtures/external/` — Fixtures estáticas das respostas das APIs para os títulos de teste.
- `[CREATE]` `tests/external-apis-poc.test.mjs` — Suíte de testes automatizados determinísticos.

## Data Model

```ts
export type ExternalApiSource = 'TMDB' | 'TVMAZE' | 'KITSU' | 'ANN' | 'MANGAUPDATES';

export interface CanonicalExternalMediaDto {
  source: ExternalApiSource;
  externalId: string;
  category: Category;
  title: string;
  originalTitle?: string;
  synopsis?: string;
  releaseYear?: number;
  originCountry?: string;
  totalEpisodes?: number;
  totalChapters?: number;
  totalVolumes?: number;
  genres: string[];
  coverUrl?: string;
  rawPayload?: unknown;
}

export interface ExternalCoverageEntry {
  title: string;
  category: Category;
  sourcesFound: ExternalApiSource[];
  fieldCoverage: Record<string, boolean>;
  primaryRecommendedSource: ExternalApiSource;
  licensingNotes: string;
}
```

## Contracts

### `ExternalApiClient<T>`
- `search(query: string): Promise<T[]>`
- `getDetails(externalId: string): Promise<T | null>`
- `normalize(raw: T): CanonicalExternalMediaDto`

## Research

- **TMDB:** REST v3/v4, uso gratuito não-comercial com atribuição obrigatória ("This product uses the TMDB API but is not endorsed or certified by TMDB").
- **TVmaze:** REST pública sem autenticação, licença CC BY-SA (ShareAlike exige atenção para redistribuição), excelente para contagem de episódios e cronograma de exibição.
- **Kitsu:** JSON:API (`https://kitsu.io/api/edge`), busca pública sem autenticação, boa cobertura de sinopses e categorias de animes e mangás.
- **ANN (Anime News Network):** API XML (`reports.xml` e `api.xml`), exige atribuição explícita e link para a enciclopédia; limite de 1 requisição por segundo.
- **MangaUpdates:** OpenAPI v1 (`https://api.mangaupdates.com/v1`), excelente cobertura de mangás, manhwas e manhuas com distinção de tipo e contagem precisa de capítulos/volumes.

