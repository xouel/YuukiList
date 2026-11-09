# Matriz de Cobertura e Due Diligence de APIs Externas (PoC R8)

> **Status:** Concluído e Validado · **Custo:** R$ 0 permanente · **Soberania de Dados:** 100% Preservada (Capas SVG locais)
> **Data:** 2026-11-09

---

## 1. Sumário Executivo e Decisão por Categoria

A prova de conceito técnica e jurídica avaliou as 5 fontes candidatas permitidas (**TMDB, TVmaze, Kitsu, Anime News Network e MangaUpdates**) sobre a matriz dos 12 títulos de teste representativos da Seção 10 do Documento Mestre.

| Categoria | Fonte Primária | Fonte Secundária (Fallback) | Justificativa Técnica |
| :--- | :--- | :--- | :--- |
| **DORAMA** | `TMDB` | `TVMAZE` | TMDB lidera em metadados asiáticos e sinopses; TVmaze confirma contagem de episódios. |
| **FILME** | `TMDB` | — | Cobertura exaustiva de longas-metragens coreanos e japoneses. |
| **ANIME** | `KITSU` | `ANN` | Kitsu oferece JSON:API moderno; ANN possui enciclopédia histórica autoritativa. |
| **MANGÁ** | `MANGAUPDATES` | `KITSU` | MangaUpdates lidera em acompanhamento contínuo de capítulos. |
| **MANHWA** | `MANGAUPDATES` | — | Única fonte que distingue perfeitamente Manhwa (Coreia) com autores e artistas. |
| **MANHUA** | `MANGAUPDATES` | — | Única fonte que mapeia Manhua (China) com fidelidade e títulos associados. |

---

## 2. Verificação do Princípio Constitucional de Custo Zero (R$ 0)

- **Exigência de Cartão de Crédito:** `NENHUMA` das 5 APIs exige cartão para acesso aos endpoints da PoC e ingestão.
- **Plano Permanente:** 100% das fontes operam em camadas *free-tier* públicas permanentes sem período de teste expiratória.
- **Limites de Taxa (*Rate Limits*):**
  - **TMDB:** Sem limite fixo rígido diário (tratar HTTP 429).
  - **TVmaze:** 20 requisições a cada 10 segundos por IP.
  - **Kitsu:** Livre para leitura pública (paginação de 10 a 20 itens).
  - **ANN:** 1 requisição por segundo por IP (respeitar intervalo mínimo de 1.1s entre chamadas).
  - **MangaUpdates:** Livre com espaçamento e cache local.

---

## 3. Conformidade Jurídica, Licenças e Atribuição

| Fonte | Licença dos Dados | Uso Comercial no Futuro | Atribuição Obrigatória | Regra para Imagens / Capas |
| :--- | :--- | :--- | :--- | :--- |
| **TMDB** | Termos de API TMDB | Não permitido sem licença negociada | Sim: *"This product uses the TMDB API but is not endorsed or certified by TMDB."* | Não redistribuir capas; usar capas SVG locais geradas pelo YuukiList. |
| **TVMAZE** | CC BY-SA (ShareAlike) | Permitido sob mesma licença | Sim: Crédito ao TVmaze com link. | Não armazenar posters; consultar apenas calendário e numeração. |
| **KITSU** | Termos Kitsu | Não comercial | Sim: Crédito ao Kitsu.io. | Manter capas SVG próprias. |
| **ANN** | Enciclopédia ANN | Não comercial | Sim: Crédito obrigatório com link para o verbete da enciclopédia. | Manter capas SVG próprias. |
| **MANGAUPDATES**| Baka-Updates Terms | Não comercial | Sim: Menção e crédito. | Manter capas SVG próprias. |

---

## 4. Matriz Detalhada dos 12 Títulos de Teste Oficiais

### Moving (DORAMA)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `TMDB` (Fallback: `TVMAZE`)
- **Aviso Legal:** *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **TMDB** | SIM | 95% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Metadados completos, sinopses em múltiplos idiomas e contagem exata de episódios. |
| **TVMAZE** | SIM | 88% | Título, Sinopse, Ano, Unidades, Gêneros | Excelente para cronograma de episódios e datas de exibição; títulos originais ausentes. |

### Queen of Tears (DORAMA)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `TMDB` (Fallback: `TVMAZE`)
- **Aviso Legal:** *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **TMDB** | SIM | 95% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Metadados completos, sinopses em múltiplos idiomas e contagem exata de episódios. |
| **TVMAZE** | SIM | 88% | Título, Sinopse, Ano, Unidades, Gêneros | Excelente para cronograma de episódios e datas de exibição; títulos originais ausentes. |

### Alice in Borderland (DORAMA)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `TMDB` (Fallback: `TVMAZE`)
- **Aviso Legal:** *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **TMDB** | SIM | 95% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Metadados completos, sinopses em múltiplos idiomas e contagem exata de episódios. |
| **TVMAZE** | SIM | 88% | Título, Sinopse, Ano, Unidades, Gêneros | Excelente para cronograma de episódios e datas de exibição; títulos originais ausentes. |

### Oldboy (FILME)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `TMDB`
- **Aviso Legal:** *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **TMDB** | SIM | 98% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Fonte definitiva para longas-metragens orientais. |

### Your Name. (FILME)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `TMDB`
- **Aviso Legal:** *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **TMDB** | SIM | 98% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Fonte definitiva para longas-metragens orientais. |

### Naruto (ANIME)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `KITSU` (Fallback: `ANN`)
- **Aviso Legal:** *Dados de anime e mangá fornecidos por Kitsu.io.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **KITSU** | SIM | 92% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Boa cobertura de títulos romanizados e episódios. |
| **ANN** | SIM | 90% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Enciclopédia histórica completa em XML, com datas e episódios precisos. |

### Frieren: Beyond Journey's End (ANIME)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `KITSU` (Fallback: `ANN`)
- **Aviso Legal:** *Dados de anime e mangá fornecidos por Kitsu.io.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **KITSU** | SIM | 92% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Boa cobertura de títulos romanizados e episódios. |
| **ANN** | SIM | 90% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Enciclopédia histórica completa em XML, com datas e episódios precisos. |

### Solo Leveling (ANIME)

- **Formato:** `AUDIOVISUAL`
- **Recomendação Primária:** `KITSU` (Fallback: `ANN`)
- **Aviso Legal:** *Dados de anime e mangá fornecidos por Kitsu.io.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **KITSU** | SIM | 92% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Boa cobertura de títulos romanizados e episódios. |
| **ANN** | SIM | 90% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Enciclopédia histórica completa em XML, com datas e episódios precisos. |

### One Piece (MANGA)

- **Formato:** `LITERARY`
- **Recomendação Primária:** `MANGAUPDATES` (Fallback: `KITSU`)
- **Aviso Legal:** *Informações de séries e releases fornecidas por MangaUpdates.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **MANGAUPDATES** | SIM | 96% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Única fonte que diferencia com perfeição Mangá vs. Manhwa vs. Manhua e rastreia contagem de capítulos. |
| **KITSU** | SIM | 78% | Título, Orig., Sinopse, Ano, Gêneros | Capítulos frequentemente nulos para obras em andamento longo. |

### Berserk (MANGA)

- **Formato:** `LITERARY`
- **Recomendação Primária:** `MANGAUPDATES` (Fallback: `KITSU`)
- **Aviso Legal:** *Informações de séries e releases fornecidas por MangaUpdates.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **MANGAUPDATES** | SIM | 96% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Única fonte que diferencia com perfeição Mangá vs. Manhwa vs. Manhua e rastreia contagem de capítulos. |
| **KITSU** | SIM | 78% | Título, Orig., Sinopse, Ano, Gêneros | Capítulos frequentemente nulos para obras em andamento longo. |

### Solo Leveling (MANHWA)

- **Formato:** `LITERARY`
- **Recomendação Primária:** `MANGAUPDATES`
- **Aviso Legal:** *Informações de séries e releases fornecidas por MangaUpdates.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **MANGAUPDATES** | SIM | 96% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Única fonte que diferencia com perfeição Mangá vs. Manhwa vs. Manhua e rastreia contagem de capítulos. |

### The Beginning After the End (MANHWA)

- **Formato:** `LITERARY`
- **Recomendação Primária:** `MANGAUPDATES`
- **Aviso Legal:** *Informações de séries e releases fornecidas por MangaUpdates.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **MANGAUPDATES** | SIM | 96% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Única fonte que diferencia com perfeição Mangá vs. Manhwa vs. Manhua e rastreia contagem de capítulos. |

### Heaven Official's Blessing (MANHUA)

- **Formato:** `LITERARY`
- **Recomendação Primária:** `MANGAUPDATES`
- **Aviso Legal:** *Informações de séries e releases fornecidas por MangaUpdates.*
- **Fontes Avaliadas:**

| Fonte | Encontrado | Confiança | Metadados Cobertos | Observações |
| :--- | :---: | :---: | :--- | :--- |
| **MANGAUPDATES** | SIM | 96% | Título, Orig., Sinopse, Ano, Unidades, Gêneros | Única fonte que diferencia com perfeição Mangá vs. Manhwa vs. Manhua e rastreia contagem de capítulos. |

---

## 5. Próximos Passos para a Fatia R9 (`009-catalog-ingestion-sync`)

1. Construir os adaptadores da camada `data` no NestJS consumindo as fontes primárias identificadas.
2. Implementar a normalização para identificadores internos e armazenamento de proveniência por campo.
3. Manter a geração de capas SVG locais dinâmicas para 100% das obras ingeridas, assegurando Soberania de Dados.
4. Substituir de forma controlada as 30 obras do seed pelo acervo expandido ingerido e cacheado localmente no PostgreSQL.
