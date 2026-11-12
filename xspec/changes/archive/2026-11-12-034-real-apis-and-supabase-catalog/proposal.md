# Proposal: 034-real-apis-and-supabase-catalog

> **X-Spec** · ID: `034-real-apis-and-supabase-catalog` · Type: `feature` · Status: `ARCHIVED` · Created: `2026-11-12`

## Why

O catálogo do YuukiList dependia de uma massa de dados estática em memória e não estava conectado ao banco PostgreSQL persistente nem consumia as APIs reais de entretenimento asiático. Com a configuração das APIs abertas (Kitsu, TVmaze e MangaUpdates) e da chave oficial do TMDB autenticada, esta entrega conecta o catálogo ao Supabase PostgreSQL via Prisma ORM, popula o banco de dados com uma carga inicial ampliada de 120 obras reais de alta relevância (Top 20 por categoria: doramas, filmes, animes, mangás, manhwas e manhuas) e implementa busca federada híbrida com ingestão sob demanda (Just-in-Time). Isso assegura um catálogo dinâmico, infinito, com sinopses ricas em português, pôsteres em alta resolução e soberania definitiva de dados no Supabase.

## What Changes

- Implementação do `PrismaCatalogRepository` conectado ao Supabase PostgreSQL via Prisma ORM, substituindo a lista estática em memória.
- Sincronização e ingestão em lote de uma carga inicial de 120 obras reais de alta repercussão através de script e serviço de catálogo (`CatalogIngestionService`).
- Cobertura completa das 6 categorias do YuukiList:
  - Doramas: TMDB (emissoras coreanas, sinopses pt-BR, pôsteres oficiais) e TVmaze.
  - Filmes Asiáticos: TMDB (longas-metragens da Coreia, Japão e China).
  - Animes: Kitsu API (títulos originais em japonês, contagem de episódios, pôsteres HD) e TMDB.
  - Mangás: Kitsu API e MangaUpdates (volumes, capítulos, autores e demografia).
  - Manhwas: MangaUpdates (obras sul-coreanas de destaque) e Kitsu.
  - Manhuas: MangaUpdates (obras chinesas com títulos originais e traduzidos).
- Implementação de Busca Federada Híbrida: a API de busca consulta o Supabase (`pg_trgm`); caso a busca retorne poucos resultados ou o usuário deseje consultar o catálogo global, o backend consulta as APIs externas em tempo real.
- Ingestão Sob Demanda (*Just-in-Time*): qualquer obra encontrada nas APIs externas que o usuário clique ou adicione à lista é instantaneamente convertida em entidade soberana, gravada no Supabase e associada a um UUID interno.

## Capabilities

### Modified Capabilities

- `catalog-data`: Conexão definitiva do catálogo com o banco PostgreSQL Supabase via Prisma ORM e expansão do seed determinístico para carga real de 120 obras.
- `catalog-ingestion`: Integração dos clientes reais TMDB, Kitsu, TVmaze e MangaUpdates no pipeline de ingestão e proveniência de dados.
- `catalog-search`: Atualização do endpoint de catálogo e busca para consultar o Supabase e fornecer busca federada híbrida com ingestão sob demanda.

## Impact

- **Banco de Dados:** Tabela `media_items`, `item_genres` e `item_aliases` no Supabase PostgreSQL populadas com registros reais.
- **Backend / APIs:** `apps/api/src/data/`, `apps/api/src/external/`, `apps/api/src/catalog/`, `apps/web/src/server/container.ts` e endpoints em `apps/web/src/app/api/v1/catalog/`.
- **Frontend:** Barra de busca de catálogo em `apps/web/src/components/catalog/` e visualização de itens com suporte a badge de proveniência de dados e imagens remotas em alta resolução.
- **Dependências:** Nenhuma biblioteca externa paga (conformidade estrita com custo permanente R$ 0).

## User Stories

### US1 — Persistência do Catálogo no Supabase PostgreSQL via Prisma (P1)
Como usuário do YuukiList,  
Quero que todo o catálogo de obras seja persistido de forma durável e segura no Supabase PostgreSQL,  
Para que as obras, sinopses, gêneros e avaliações estejam sempre disponíveis de forma soberana e rápida.  
**Independent Test:** Executar consultas de listagem e detalhes verificando que os registros são lidos e gravados diretamente no banco de dados Supabase via Prisma.

### US2 — Carga Inicial Ampliada de 120 Obras Reais Populares (P1)
Como explorador de cultura asiática,  
Quero acessar a plataforma e encontrar imediatamente as obras mais consagradas de doramas, filmes, animes, mangás, manhwas e manhuas com dados autênticos,  
Para que a experiência visual e editorial seja rica e completa desde o primeiro acesso.  
**Independent Test:** Rodar o serviço de sincronização inicial e confirmar que o Supabase contém exatamente 20 títulos por categoria (totalizando 120 obras) com pôsteres válidos e proveniência registrada.

### US3 — Busca Federada Híbrida e Ingestão Sob Demanda (P2)
Como fã buscando títulos específicos,  
Quero pesquisar qualquer obra asiática pelo nome e encontrar resultados mesmo que o item ainda não conste no banco local,  
Para que eu possa cadastrar qualquer título no meu acervo pessoal através de ingestão transparente no Supabase.  
**Independent Test:** Pesquisar por um título inexistente no banco local, validar que a API retorna dados reais das fontes externas e que, ao interagir com o item, ele é gravado de forma durável no Supabase.

## Success Criteria

- **SC-001:** O repositório de catálogo opera sobre o Supabase PostgreSQL utilizando Prisma ORM sem depender de coleções temporárias em memória.
- **SC-002:** Ingestão concluída com sucesso de pelo menos 120 obras reais cobrindo equitativamente as 6 categorias com títulos oficiais e sinopses estruturadas.
- **SC-003:** Suporte a busca aproximada com trigramas (`pg_trgm`) operando nativamente no banco de dados para buscas locais.
- **SC-004:** Busca federada funcional consultando as APIs reais (TMDB, Kitsu, TVmaze, MangaUpdates) em paralelo com tempo de resposta ágil.
- **SC-005:** Ingestão sob demanda idempotente gravando novos itens externos no Supabase com UUID soberano e rastreamento de proveniência por campo.

## Edge Cases

- Rate limit ou falha temporária em uma API externa: o sistema deve retornar graciosamente os dados do banco local sem travar a interface.
- Obra sem pôster externo disponível: geração imediata de capa local em SVG vetorial no padrão visual Dark Editorial.
- Títulos com múltiplos nomes (kanji, pinyin, hangul, romanizado e inglês): normalização e indexação de todos os aliases na tabela `item_aliases` para busca precisa.
- Caracteres especiais e pontuações em títulos asiáticos: normalização sem diacríticos para busca trigrâmica tolerante a erros de digitação.

## Out of Scope

- Autenticação OAuth social de terceiros (Google, Apple, etc.).
- Moderação de catálogo por múltiplos editores em tempo real (já coberto no fluxo de obras provisórias).
- Reprodução de vídeo ou leitura de capítulos protegidos por direitos autorais (o YuukiList é estritamente uma plataforma de acompanhamento e catálogo).

## Clarifications

### Session 2026-11-12

- Q: Quantas obras reais devem ser ingeridas na carga inicial do Supabase? → A: Opção C — Lote ampliado de ~120 obras (Top 20 de cada uma das 6 categorias).
- Q: Como deve se comportar a busca de catálogo para títulos não cadastrados? → A: Opção A — Busca Federada Híbrida (busca no Supabase e, sob demanda, consulta as APIs externas TMDB/Kitsu/TVmaze/MangaUpdates, ingerindo automaticamente ao interagir).
- Q: Quais credenciais externas estão ativas? → A: Kitsu, TVmaze e MangaUpdates (100% abertas) e chave oficial gratuita do TMDB configurada no `.env`.

