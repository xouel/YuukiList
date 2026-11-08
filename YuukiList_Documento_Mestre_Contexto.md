# YuukiList — Documento Mestre de Contexto e Consolidação

**Versão:** 1.0  
**Data de consolidação:** 06/11/2026  
**Finalidade:** reunir o contexto conhecido do projeto YuukiList para servir como material de entrada na consolidação posterior com OpenSpec ou SpecKit.  
**Status:** documento de contexto abrangente; não substitui validação jurídica, testes técnicos, nem os artefatos formais de especificação.

---

## 0. Como interpretar este documento

Este documento reúne decisões, intenções, recomendações adotadas como baseline, informações técnicas pesquisadas e questões que ainda dependem de validação externa.

Para evitar que uma recomendação seja confundida com uma autorização ou fato comprovado, os itens são classificados assim:

- **DECIDIDO / BASELINE:** direção definida para o produto ou arquitetura e adotada na consolidação.
- **RECOMENDADO:** solução recomendada para orientar a implementação; deve ser mantida salvo evidência ou necessidade contrária.
- **CONDICIONADO:** depende de teste, fornecedor, licença, plano gratuito, dispositivo ou revisão jurídica.
- **PENDENTE:** informação ou regra ainda não validada de forma suficiente.
- **FORA DO MVP:** explicitamente deixado para uma fase posterior.
- **NÃO ADOTAR:** fonte ou abordagem descartada na estratégia atual.

A expressão “tudo levantado” significa todo o contexto disponível nas conversas e memórias do projeto. Não significa que cada requisito já tenha sido transformado em critério de aceite ou que toda integração tenha sido testada em produção.

### 0.1 Princípios de consolidação

1. Preservar as decisões existentes e evitar reabrir escolhas já suficientemente estabelecidas.
2. Não inventar requisitos, métricas, endpoints, permissões ou garantias que não tenham sido discutidos.
3. Separar regras de produto de decisões de implementação.
4. Tratar licenças de dados e direitos de imagem como questões distintas.
5. Não considerar uma API aprovada apenas porque possui documentação pública ou responde a requisições.
6. Manter o catálogo e os dados pessoais do usuário independentes de qualquer fornecedor externo.
7. Evitar overengineering, sem sacrificar qualidade visual, acessibilidade, segurança e experiência.
8. O custo zero é uma meta para desenvolvimento e MVP, não uma promessa de gratuidade permanente.
9. Não iniciar implementação de integração definitiva enquanto os gates de licença e cobertura não forem atendidos.
10. Este documento deve ser revisado junto aos artefatos OpenSpec/SpecKit existentes, e não usado para substituir automaticamente tudo o que já foi produzido.

---

# 1. Visão geral do produto

## 1.1 Nome

**YuukiList**

A grafia adotada no projeto é YuukiList. O nome foi definido para a plataforma de acompanhamento de entretenimento asiático.

## 1.2 Conceito

Plataforma web para organizar, descobrir, acompanhar e registrar experiências com entretenimento asiático, reunindo em um catálogo unificado:

- Doramas e séries asiáticas.
- Filmes asiáticos.
- Animes.
- Mangás.
- Manhwas.
- Manhuas.

O produto não terá player de vídeo, leitura ou distribuição de conteúdo protegido. Seu foco é organização, descoberta, acompanhamento, calendário, biblioteca pessoal, avaliações, anotações e compartilhamento controlado.

## 1.3 Problema que pretende resolver

O usuário precisa alternar entre serviços e trackers diferentes para acompanhar categorias distintas de entretenimento. O YuukiList pretende centralizar a experiência, reduzindo a fragmentação entre listas, progresso, calendários e registros pessoais.

A plataforma deve combinar boas ideias de trackers existentes sem copiar um concorrente isoladamente.

## 1.4 Público

- **Público inicial:** usuário, esposa e amigas, para validação real do produto.
- **Evolução prevista:** possibilidade de abertura ao público em geral.
- O produto deve ser desenhado com qualidade suficiente para crescer, mas sem antecipar complexidade social ou operacional desnecessária.

## 1.5 Posicionamento

- Organização, descoberta e acompanhamento.
- Personalidade moderna, acolhedora e expressiva.
- Identidade própria.
- Experiência pessoal e compartilhável, com privacidade como padrão.
- Busca útil e rápida, sem inteligência artificial no MVP.

## 1.6 Diferenciais pretendidos

1. Catálogo unificado de categorias asiáticas.
2. Biblioteca pessoal inteligente e flexível.
3. Busca global útil, multilíngue e sem IA.
4. Calendário integrado de lançamentos, acompanhamento e agenda pessoal.
5. Experiência pessoal com diário, notas e histórico.
6. Compartilhamento seletivo e privacidade granular.
7. Relações entre obras, franquias e adaptações.
8. Experiência visual refinada e responsiva.

## 1.7 Escopo negativo

- Não é serviço de streaming.
- Não terá player de vídeo.
- Não terá leitor de mangá/manhwa/manhua.
- Não terá IA na busca.
- Não terá feed social amplo no MVP.
- Não terá chat ou mensagens privadas no MVP.
- Não deve depender de um único provedor de metadados.
- Não deve assumir que imagens retornadas por APIs podem ser copiadas ou redistribuídas.

---

# 2. Mercado, referências e concorrentes

## 2.1 Produtos e referências mencionados

- TV Time — aplicativo que a esposa do usuário acredita ter utilizado anteriormente. Foi discutido como encerrado em 15/07/2026, conforme pesquisa realizada na conversa.
- Bingers — apresentado na conversa como produto lançado em agosto de 2026 pelo cofundador do TV Time e sucessor conceitual.
- AniList.
- MyDramaList.
- MyAnimeList.
- Kitsu.
- Trakt.
- MangaDex.
- MyAnimeList.
- TVmaze.
- MangaUpdates.

Esses produtos são referências de mercado e/ou possíveis fontes de dados, não necessariamente integrações aprovadas.

## 2.2 Referências visuais e de experiência

Sites enviados ou citados:

- https://nordpixel.ch/
- https://warmnfuzzy.tv/
- https://lesgmstudios.com/
- https://everwonder.studio/

Também foram mencionadas referências de experiências altamente animadas, como Resn e Landon Norris.

A intenção é absorver a essência visual e de interação dessas referências, não reproduzir obrigatoriamente toda a complexidade de WebGL, canvas ou efeitos pesados.

## 2.3 Direção extraída das referências

- Tema escuro editorial.
- Tipografia grande, expressiva e de alto contraste.
- Capas e imagens com tratamento cinematográfico.
- Navegação minimalista.
- Animações de entrada e transição refinadas.
- Scroll-driven motion.
- Interações contextuais e feedback visual.
- Interface com personalidade, sem prejudicar legibilidade e uso cotidiano.

## 2.4 Vídeo de referência

O usuário compartilhou um vídeo sobre busca inteligente:

https://www.youtube.com/watch?v=UYOr-rpQs1I

A referência serviu para discutir experiência de busca. A decisão do produto é **não utilizar IA na busca**. A busca deve ser baseada em texto, aliases, normalização, correspondência aproximada e filtros.

---

# 3. Plataforma, experiência e navegação

## 3.1 Plataforma

**DECIDIDO:** web responsiva primeiro, com PWA como evolução natural.

- Não desenvolver aplicativos nativos para iOS/Android inicialmente.
- Mobile e desktop devem ser experiências completas.
- Mobile-first como princípio de adaptação e prioridade de validação, sem limitar a qualidade da versão desktop.
- PWA instalável.
- Offline básico apenas para consulta de dados recentes no MVP.
- Sem edição offline no MVP.

## 3.2 Navegação principal

Cinco áreas:

1. Explorar.
2. Buscar.
3. Biblioteca.
4. Calendário.
5. Perfil.

### Desktop

- Sidebar fixa ou recolhível.

### Mobile

- Bottom navigation.

## 3.3 Regra central de UX

As ações frequentes precisam ser simples, rápidas e contextuais.

Exemplos:

- Atualizar progresso.
- Alterar status.
- Marcar favorito.
- Avaliar uma obra.
- Criar anotação.
- Consultar próximo episódio/capítulo.

## 3.4 Biblioteca

Visualizações:

- Grade.
- Lista.

Filtros:

- Categoria.
- Status.
- Progresso.
- País/origem.
- Situação de publicação.
- Gênero.
- Formato.
- Favoritos.

Ordenações previstas:

- Atualizados recentemente.
- Adicionados recentemente.
- Alfabética.
- Progresso.
- Avaliação.
- Data de lançamento.

O usuário poderá definir uma visualização padrão.

## 3.5 Página de obra

Estrutura funcional prevista:

1. Banner/capa e informações principais.
2. Ações de acompanhamento.
3. Status e progresso pessoal.
4. Sinopse e metadados.
5. Temporadas, episódios, capítulos ou volumes.
6. Relações com outras obras.
7. Avaliações e resenhas.
8. Anotações pessoais.
9. Calendário e lançamentos.

A composição final, hierarquia e âncoras devem ser refinadas no protótipo.

## 3.6 Página de franquia/universo

Deve apresentar:

- Obras relacionadas.
- Prequels.
- Sequels.
- Spin-offs.
- Especiais.
- Filmes.
- OVAs/OADs.
- Adaptações.
- Ordem cronológica, quando conhecida.
- Ordem de lançamento.
- Ordem recomendada, quando houver fonte confiável.
- Progresso pessoal por obra.

Concluir uma adaptação não conclui automaticamente outra.

## 3.7 Explorar

Conteúdo planejado:

- Populares.
- Recentes.
- Categorias.
- Países.
- Tendências.
- Recomendações editoriais.
- Sugestões pessoais baseadas em dados permitidos e comportamento autorizado.

No MVP, não haverá recomendação por IA.

A popularidade deverá usar sinais reais e disponíveis, sem inventar números de audiência.

## 3.8 Perfil

Elementos possíveis:

- Avatar.
- Bio.
- Favoritos.
- Obras acompanhadas.
- Estatísticas.
- Atividade pública autorizada.

Estatísticas previstas:

- Obras concluídas.
- Distribuição por categoria.
- Gêneros mais consumidos.
- Países de origem.
- Média das avaliações.
- Tempo estimado de consumo, somente quando houver duração confiável.

Estatísticas privadas até autorização explícita para publicação.

---

# 4. Categorias, formatos e atributos

## 4.1 Categorias principais

- Dorama/série.
- Filme.
- Anime.
- Mangá.
- Manhwa.
- Manhua.

A classificação de BL e GL não será uma categoria principal.

## 4.2 Dimensões transversais

País/origem, formato, gênero e temas são dimensões independentes.

Exemplos:

- K-drama.
- C-drama.
- J-drama.
- Thai-drama.
- BL.
- GL.

BL/GL devem ser atributos/temas ou classificações transversais, não categorias mutuamente exclusivas.

## 4.3 Normalização conceitual

Separar:

- Categoria principal.
- Formato.
- Países de origem.
- Gêneros.
- Temas.
- Idioma original.
- Idiomas disponíveis.
- Idioma de cada título.

Uma obra pode ter múltiplos países, gêneros e títulos em idiomas diferentes.

## 4.4 Títulos

O catálogo deve suportar:

- Título principal.
- Título original.
- Título traduzido.
- Título romanizado.
- Títulos alternativos.
- Idioma associado a cada título.

Não presumir que o título principal seja sempre o título em português.

## 4.5 Idiomas e escrita

A busca e a interface precisam considerar japonês, coreano, chinês e tailandês, além de idiomas ocidentais.

A tipografia deve possuir fallbacks apropriados para CJK e tailandês.

A normalização de busca deve tratar, conforme aplicável:

- Caixa.
- Acentos.
- Pontuação.
- Espaços.
- Variações de romanização.
- Sistemas de escrita.
- Títulos alternativos.

---

# 5. Regras funcionais — biblioteca e progresso

## 5.1 Status por categoria

### Doramas e animes

- Quero assistir.
- Assistindo.
- Pausado.
- Concluído.
- Dropado.

### Filmes

- Quero assistir.
- Assistido.
- Pausado.
- Dropado.

### Mangás, manhwas e manhuas

- Quero ler.
- Lendo.
- Pausado.
- Concluído.
- Dropado.

As listas de desejo Quero assistir e Quero ler são separadas.

## 5.2 Status pessoal versus publicação

A situação de publicação da obra é independente do status pessoal.

Exemplos de situação de publicação:

- Em andamento.
- Finalizada.
- Cancelada.
- Hiato.
- Desconhecida.

O status pessoal responde ao que o usuário está fazendo; a publicação responde à situação da obra.

## 5.3 Progresso de anime e dorama

- Progresso contínuo no nível da obra.
- Divisão visual por temporada.
- Unidades principais contabilizadas no progresso.
- Temporadas/cours podem ser agrupados visualmente.
- A estrutura de temporadas não deve obrigar o usuário a reiniciar o progresso da obra.

## 5.4 Progresso de filmes

- Não haverá percentual.
- O status Assistido representa a conclusão.
- Pausado será um status sem percentual de progresso.
- Não presumir que o usuário precise informar minuto assistido no MVP.

## 5.5 Progresso de mangás, manhwas e manhuas

**Baseline consolidado:**

- Capítulos são a unidade principal de progresso.
- Volumes podem ser usados como unidade alternativa quando capítulos confiáveis não existirem.
- Capítulos e volumes podem ser apresentados quando ambos forem conhecidos.
- Não converter automaticamente capítulo em volume sem correspondência confiável.
- A origem e confiabilidade da contagem devem ser registradas.

## 5.6 Especiais, OVAs, OADs e extras

- Acompanhamento opcional.
- Separados da sequência principal.
- Não devem impedir a conclusão da obra principal.
- Relações com a obra principal devem ser explícitas.
- Não criar automaticamente uma obra independente para todo cour, especial ou episódio duplo.

## 5.7 Episódios divididos, especiais e cours

- Identificar unidades de acordo com a estrutura oficial da fonte.
- Evitar duplicação de episódios.
- Cours são agrupamentos/segmentos de exibição; não são automaticamente obras independentes.
- Episódios duplos devem ser representados de acordo com a unidade oficial, evitando contagem duplicada.
- Casos sem consenso entre fontes devem ser encaminhados para revisão administrativa.

## 5.8 Em dia

“Em dia” é uma condição calculada, não um status pessoal.

Regra consolidada:

- Usuário está Em dia quando alcança a última unidade principal confirmada e disponível.
- A obra pode continuar em publicação e permanecer Assistindo/Lendo + Em dia.
- Em dia não significa Concluído.
- O cálculo usa unidades principais confirmadas; extras opcionais não contam.

## 5.9 Concluído

- Obra oficialmente finalizada: o usuário conclui quando termina a sequência principal.
- Obra ainda em publicação: não é considerada Concluída apenas por alcançar a última unidade disponível.
- Obra cancelada/interrompida: o usuário poderá marcá-la como Concluída se terminou todo o conteúdo principal disponível.
- O usuário pode alterar manualmente o status; o sistema deve avisar sobre inconsistências entre status e progresso.
- A conclusão de uma obra não conclui automaticamente franquias, adaptações ou obras relacionadas.

## 5.10 Reassistir e reler

Duas opções:

1. **Novo ciclo:** novo acompanhamento independente, com progresso próprio; ciclo anterior preservado.
2. **Incrementar contador:** registrar nova experiência sem reiniciar o progresso atual.

O histórico anterior nunca será sobrescrito.

## 5.11 Avaliações

- Nota geral de 0 a 10.
- Favorito independente da avaliação.
- Avaliação de episódio/capítulo opcional.
- Resenhas privadas por padrão.
- Alterações relevantes podem gerar eventos no histórico.

---

# 6. Diário, anotações, histórico e spoilers

## 6.1 Histórico

Linha do tempo de eventos independentes do estado atual da biblioteca.

### Eventos automáticos

- Alteração de status.
- Avanço de progresso.
- Retrocesso de progresso.
- Conclusão.
- Avaliação.
- Favorito.
- Anotação.

### Eventos manuais

- Comentários pessoais.
- Experiências relacionadas à obra.
- Anotações livres.

## 6.2 Regras do histórico

- Ações confirmadas pelo usuário podem gerar eventos.
- Alterações distintas devem ser preservadas.
- Eventos podem ser editados ou excluídos pelo usuário.
- O usuário pode ajustar a data do evento.
- Excluir evento não altera status ou progresso da biblioteca.
- Atualizações técnicas que não representam ação do usuário não devem gerar eventos redundantes.
- O histórico precisa preservar a integridade da sequência de acontecimentos.

## 6.3 Diário

Diário é uma visualização contextual do histórico, não um segundo armazenamento duplicado.

Anotações podem estar vinculadas a:

- Obra.
- Episódio.
- Capítulo.
- Volume.
- Data.

O diário utiliza os registros de histórico e anotações associadas.

## 6.4 Notas

- Privadas por padrão.
- Podem ser livres ou vinculadas a uma unidade.
- Não devem ser expostas em perfil ou compartilhamento sem autorização explícita.
- Devem coexistir com eventos de histórico sem duplicar dados.

## 6.5 Spoilers

- Conteúdo marcado como spoiler fica oculto inicialmente.
- Pode estar vinculado a episódio, capítulo ou volume.
- Usuários autenticados recebem proteção baseada no progresso registrado.
- Visitantes anônimos sempre recebem conteúdo oculto, independentemente do contexto.
- Revelação manual, mediante aviso.
- Compartilhamentos não removem automaticamente a proteção.

Exemplo: anotação sobre episódio 8 não deve ser exibida automaticamente a alguém que está no episódio 5.

---

# 7. Calendário e notificações

## 7.1 Tipos de calendário

Três visualizações:

1. **Lançamentos:** estreias, episódios, capítulos e demais lançamentos gerais.
2. **Acompanhamento:** próximas unidades das obras acompanhadas.
3. **Minha agenda:** lembretes e eventos pessoais.

## 7.2 Tipos de evento

- Estreia de obra.
- Lançamento de temporada.
- Episódio.
- Capítulo.
- Volume.
- Filme.
- Especial.

Cada evento pode exibir:

- Capa.
- Título.
- Horário/data.
- Tipo.
- Confiabilidade.
- Fonte, quando pertinente.

## 7.3 Datas e regiões

- Datas devem ser associadas à região/país de referência.
- Preservar a data original informada pela fonte.
- Converter a apresentação para o fuso do usuário quando existir horário definido.
- Não alterar silenciosamente a data de origem.
- Registrar datas anteriores e adiamentos quando disponíveis.

## 7.4 Confiabilidade

Três estados:

- Confirmada.
- Estimada.
- Não confirmada.

Datas estimadas devem ser identificadas visualmente como estimativas.

## 7.5 Conflitos de data

Prioridade de fontes:

1. Fonte oficial da produção, emissora ou editora.
2. Distribuidor ou plataforma licenciada.
3. Provedor de metadados confiável.
4. Fonte secundária.

Conflitos não devem ser descartados silenciosamente. Registrar divergências e encaminhar casos relevantes para revisão.

## 7.6 Notificações

Canais no MVP:

- Notificações internas.
- Push do navegador/PWA, mediante permissão.

Fora do MVP:

- E-mail de notificações.

Tipos:

- Lembretes automáticos.
- Lembretes manuais.
- Próximos episódios/capítulos.
- Lançamentos de obras acompanhadas.

## 7.7 Preferências

- Notificações configuráveis por categoria.
- Horários silenciosos configuráveis.
- Padrão inicial recomendado: 22h–8h.
- Usuário pode desativar cada categoria independentemente.
- Push exige consentimento explícito.
- Central interna de notificações.
- Validar funcionamento em iOS/PWA em dispositivo real.

---

# 8. Catálogo, dados e relações

## 8.1 Estratégia geral

**DECIDIDO:** estratégia híbrida:

- APIs externas.
- Banco próprio.
- Complementação administrativa.
- Cadastro provisório quando não houver fonte adequada.

Nenhum provedor será dono absoluto do catálogo do YuukiList.

## 8.2 Identidade interna

Cada obra terá ID próprio do YuukiList.

Identificadores externos serão associados como referências, não como chave primária do domínio.

Uma obra poderá ter múltiplos IDs externos e múltiplas fontes.

## 8.3 Proveniência dos dados

Registrar, conforme o campo:

- Fonte/provedor.
- Identificador externo.
- Data da coleta/atualização.
- Origem do valor.
- Estado de validação.
- Se houve correção manual/administrativa.
- Condições de uso/licença aplicáveis.

A arquitetura deve permitir saber de onde veio cada informação.

## 8.4 Seleção por campo

É possível combinar provedores diferentes na mesma obra.

A escolha da fonte deve ocorrer por campo, não por uma regra que declare um provedor vencedor para todos os dados.

Exemplo conceitual: título de uma fonte, relação de outra, data confirmada de fonte oficial.

## 8.5 Correções manuais

- Correções administrativas devem ser protegidas contra sobrescrita automática.
- Manter histórico de valor anterior e novo.
- Registrar autor, fonte e data da alteração.
- Falhas de API nunca apagam dados válidos.
- Complementação automática não deve substituir correção manual protegida.

## 8.6 Atualização

Modelo híbrido:

- Atualização automática periódica.
- Atualização sob demanda, quando adequada.
- Revisão administrativa para conflitos.
- Frequência ajustada por campo, limite e termos de cada API.
- Cache dentro das regras de cada fornecedor.
- Controle de concorrência e tentativas progressivas.

## 8.7 Deduplicação

Estratégia híbrida:

1. IDs externos iguais são indicadores fortes.
2. Títulos alternativos, ano, país, formato e metadados complementam a comparação.
3. Unificação automática somente em alta confiança.
4. Casos duvidosos vão para revisão.
5. Administração pode desfazer união.
6. Histórico de união/desunião preservado.
7. Obras parecidas não são automaticamente duplicadas.
8. IDs externos originais devem ser preservados.

## 8.8 Obras provisórias

Quando não existir fonte adequada:

- Permitir cadastro provisório mínimo.
- Campos mínimos: título, categoria, origem quando conhecida, ano quando conhecido e formato.
- Identificar como pendente.
- Permitir que o usuário adicione à biblioteca pessoal.
- Não considerar automaticamente como catálogo oficial validado.
- Permitir complementação posterior.
- Não sobrescrever correções manuais.
- Diferenciar dado fornecido pelo usuário, dado de fonte externa e dado confirmado pela administração.

## 8.9 Relações

O modelo deve suportar:

- Temporadas.
- Continuações.
- Prequels.
- Sequels.
- Spin-offs.
- OVAs.
- OADs.
- Filmes.
- Especiais.
- Adaptações.
- Obras relacionadas.
- Franquias/universos.

As relações devem ser explícitas e tipadas. Adaptações permanecem obras independentes.

## 8.10 Modelo de dados conceitual

**DECIDIDO:** modelo híbrido: entidade base comum + estruturas especializadas por categoria.

Entidades conceituais esperadas (não constituem ainda schema Prisma definitivo):

- Obra/Media.
- Categoria.
- Formato.
- Título/alias localizado.
- País de origem.
- Idioma.
- Gênero.
- Tema/atributo.
- Identificador externo.
- Fonte/provedor.
- Proveniência de campo.
- Temporada.
- Episódio.
- Capítulo.
- Volume.
- Especial/unidade extra.
- Relação entre obras.
- Franquia/universo.
- Data/evento de lançamento.
- Registro de calendário.
- Usuário.
- Biblioteca/entrada de acompanhamento.
- Ciclo de reassistir/reler.
- Progresso.
- Avaliação.
- Favorito.
- Resenha.
- Anotação.
- Evento de histórico.
- Preferência de notificação.
- Notificação.
- Solicitação de inclusão.
- Usuário administrativo/papel.
- Auditoria.
- Link de compartilhamento.

Os nomes finais, cardinalidades, constraints e tabelas precisam ser definidos nos artefatos técnicos.

---

# 9. Pesquisa de APIs e fontes de dados

## 9.1 Princípio geral

Não existe uma única API que cubra adequadamente todas as categorias e países do YuukiList sem restrições.

A estratégia recomendada é usar adaptadores independentes, avaliar cobertura real e validar direitos antes de persistir ou redistribuir dados.

A disponibilidade técnica de uma API não representa autorização jurídica.

## 9.2 Matriz de decisão atual

| Fonte | Uso pretendido | Estado |
|---|---|---|
| TMDB | Filmes e séries/doramas | PoC prioritária, uso condicionado |
| TVmaze | Séries, episódios e calendário | PoC prioritária, licença a avaliar |
| Kitsu | Anime e mangá | PoC condicionada |
| Anime News Network (ANN) | Anime e mangá | PoC condicionada |
| MangaUpdates | Mangás, manhwas, manhuas e releases | PoC condicionada |
| Shikimori | Anime e mangá, alternativa | Reserva |
| Wikidata | IDs, nomes, países, relações e complementação | Fonte complementar |
| AniList | Não adotar sem autorização expressa | Não adotar |
| Jikan | Não adotar | Não adotar |
| MangaDex | Não usar como dependência de catálogo | Não adotar |
| TheTVDB | Alternativa futura | Adiar por custo/licenciamento |
| MyAnimeList API | Não integrar sem validação/autorização | Pendente; não priorizar |
| AniDB | Não priorizar até validação | Pendente |

## 9.3 TMDB

Documentação enviada:

https://developer.themoviedb.org/docs/getting-started

### Capacidades relevantes

- Filmes.
- Séries/TV.
- Atores e equipe.
- Temporadas.
- Episódios.
- Pessoas.
- Gêneros.
- Idiomas.
- Países.
- Traduções.
- Imagens.
- IDs externos.
- Trending/popularidade.

### Uso técnico

- REST API v3 e v4.
- Autenticação por API key/token.
- Fluxo de busca seguido de detalhes.
- `append_to_response` para recursos relacionados.
- Imagens dependem de configuração, tamanho e caminho obtidos pelo endpoint de configuração.
- Tratar HTTP 429 e limites dinâmicos.
- O antigo limite de 40 chamadas/10 segundos foi desativado em 2019; não presumir limite fixo permanente.

### Licença e riscos

- Uso gratuito para projetos não comerciais, com atribuição e aviso/logo exigidos.
- Projeto comercial exige licença comercial negociada.
- Aviso exigido: “This product uses the TMDB API but is not endorsed or certified by TMDB.”
- A API não concede automaticamente todos os direitos subjacentes sobre imagens/dados.
- Direitos dos titulares originais continuam relevantes.

### Decisão

Candidata prioritária para filmes e séries no MVP não comercial, condicionada à conformidade com os termos e aos direitos de cada conteúdo. Antes de monetizar, rever licença e eventualmente substituir a fonte.

## 9.4 TVmaze

Documentação enviada:

https://www.tvmaze.com/api

### Capacidades relevantes

- Séries.
- Episódios.
- Temporadas.
- Elenco e equipe.
- Calendário de episódios.
- Busca de séries.
- Dados de programação, inclusive endpoints específicos para programação web.

### Características técnicas levantadas

- API REST/JSON.
- API pública sem chave para endpoints públicos.
- Limite documentado de pelo menos 20 chamadas a cada 10 segundos por IP (reconfirmar no momento da implementação).
- Dados com licença CC BY-SA, conforme política/documentação pesquisada.
- Imagens possuem considerações próprias de direitos; não assumir que a licença dos dados libera automaticamente todas as imagens.

### Riscos

- A licença ShareAlike pode afetar a forma de redistribuição de dados derivados.
- Verificar compatibilidade da licença com o catálogo e os termos de uso do YuukiList.
- Testar cobertura de dramas coreanos, chineses, japoneses e tailandeses.
- Calendário de episódios não equivale a cobertura oficial universal de todas as plataformas.
- Verificar direitos de imagem separadamente.

### Decisão

PoC prioritária para séries, episódios e calendário. Não declarar aprovada até revisar a compatibilidade CC BY-SA, atribuição, compartilhamento pela mesma licença e imagens.

## 9.5 Kitsu

Documentação enviada:

https://kitsu.docs.apiary.io/#

A documentação se refere ao Kitsu de anime/mangá (`kitsu.io`), não ao produto Kitsu da CGWire para produção de animação/VFX.

### Características técnicas

- Base: `https://kitsu.io/api/edge`.
- JSON:API.
- Filtros, paginação, ordenação, includes e sparse fieldsets.
- Endpoints de anime e manga.
- Recursos relacionados: episodes, characters, categories, relations, titles, images.
- Exemplos:
  - `/anime?filter[text]=...`
  - `/manga?filter[text]=...`
  - `/anime?filter[categories]=adventure`
- Paginação default 10, máximo 20, conforme documentação analisada.
- GET público não exige autenticação.
- OAuth2 para recursos protegidos/usuários.
- Limite oficial atual não foi confirmado; não usar números de terceiros como fato.

### Riscos

- Termos para armazenamento persistente e redistribuição de dados não foram suficientemente esclarecidos.
- Direitos de imagens precisam de validação separada.
- Verificar cobertura de anime e mangá com títulos reais.

### Decisão

Boa candidata técnica para PoC, mas não fonte aprovada para persistência/republicação até esclarecer termos.

## 9.6 Anime News Network (ANN)

Documentação enviada:

https://www.animenewsnetwork.com/encyclopedia/api.php

### Características técnicas

- API XML.
- Dois mecanismos principais: reports e detalhes.
- Reports com `nskip` e `nlist`.
- Exemplo documentado de import inicial: `reports.xml?id=155&type=anime&nlist=all`.
- Import incremental diário pode consultar lotes de 50 títulos.
- Detalhes por anime, manga e title.
- Exemplos: `api.xml?anime=id`, `?manga=id`, `?title=id`.
- Busca por `~nome` consulta título principal, não todos os alternativos.
- Batch até 50.
- Cache de detalhes recomendado por uma semana.
- Limite normal: 1 request/s/IP.
- Endpoint `nodelay.api.xml` permite 5 requests em conjunto a cada 5 segundos; exceder pode retornar 503.

### Atribuição e termos

- Exige crédito à ANN.
- Exige link para a entrada relevante em cada página que exibe anime/mangá/pessoa.
- Persistência, uso comercial e direitos de imagens não foram esclarecidos suficientemente.

### Decisão

PoC prioritária para anime/mangá, condicionada à validação de persistência, atribuição, uso comercial e imagens.

## 9.7 MangaUpdates

Documentação enviada:

https://api.mangaupdates.com/

### Características técnicas

- Base: `https://api.mangaupdates.com/v1`.
- OpenAPI/Scalar.
- Consultas públicas em sua maioria; funções de usuário podem exigir Bearer.
- `POST /series/search` com pesquisa por título/descrição, tipo, licenciamento, ano, categorias, gêneros, filtros e ordenação.
- Busca de detalhes de séries.
- Busca de releases.
- Dados sobre autores, categorias, gêneros, grupos, releases e listas pessoais.

### Limitações

- Releases representam releases de grupos/traduções, não necessariamente datas oficiais de publicação.
- Não usar releases como calendário oficial sem validação independente.
- Cobertura de manhwa/manhua precisa ser medida.

### Política

- Crédito.
- Espaçamento razoável entre chamadas.
- Cache.
- Proibição de uso enganoso, fraudulento, ilegal, spam ou dano ao banco.
- Sem garantia de disponibilidade/precisão; política pode mudar.
- Não foi localizada licença aberta explícita para armazenamento e republicação persistente.

### Decisão

Interessante para PoC de mangá/manhwa/manhua e informações de releases, mas solicitar autorização para catálogo persistente e redistribuição.

## 9.8 Shikimori

Documentação enviada:

https://shikimori.io/api/doc

### Características técnicas

- GraphQL recomendado.
- REST v2 e v1 marcados como antigos/outdated.
- Posters recentes de anime/mangá/personagens/pessoas disponíveis via GraphQL.
- OAuth2 para recursos protegidos.
- HTTPS.
- `User-Agent` com nome da aplicação obrigatório.
- Não imitar navegador.
- Limite informado: 5 requests por segundo e 90 por minuto.
- Dados de anime, mangá, pessoas, personagens, estúdios, editoras, gêneros, user rates e relações.

### Riscos

- Licença para armazenar/republicar catálogo público não esclarecida.
- Direitos de imagens não esclarecidos.

### Decisão

Alternativa técnica de reserva; não integrar até esclarecer licença e persistência.

## 9.9 Wikidata

### Uso pretendido

Fonte complementar para:

- Identificadores externos.
- Nomes.
- Países.
- Datas.
- Relações.
- Entidades e vínculos.

### Licença e limitações

- Dados estruturados sob CC0.
- Não é catálogo completo de entretenimento.
- Não substitui provedores especializados.
- Não presumir disponibilidade de imagens ou direitos de mídia a partir do CC0 dos dados.

### Decisão

Usar como complemento seletivo e não como fonte primária de catálogo.

## 9.10 AniList

Documentação/repositório enviado:

https://github.com/AniList/docs

### Características técnicas

- GraphQL.
- Catálogo grande de anime/mangá, personagens, equipe e exibição.
- Queries públicas; OAuth para dados protegidos.
- Limite normal pesquisado: 90 requests/minuto; documentação recente também indicou degradação temporária para 30 rpm.

### Termos

Os termos pesquisados proíbem, entre outras coisas:

- Serviços concorrentes de tracker/listas não complementares.
- Coleta massiva.
- Backup de dados.

A regra de receita inferior a US$150/mês não elimina a proibição de serviço concorrente.

### Decisão

**Não adotar** sem autorização expressa. O YuukiList é conceitualmente um tracker e pode se enquadrar na restrição.

## 9.11 Jikan

### Característica

API não oficial baseada em scraping do MyAnimeList.

### Decisão

**Não adotar.** Evitar dependência de scraping e riscos associados a termos/dados de terceiros.

## 9.12 MangaDex

### Risco pesquisado

Política de uso de API associada a restrições de anúncios/serviços pagos nos projetos que utilizam a API.

### Decisão

Não utilizar como dependência de catálogo, especialmente considerando possibilidade de monetização futura.

## 9.13 TheTVDB

### Risco

Licenciamento comercial/assinatura e possível custo.

### Decisão

Adiar; avaliar apenas se cobertura ou qualidade justificar e houver orçamento/licença.

## 9.14 MyAnimeList API

### Situação

API v2 existe, mas direitos para tracker independente, uso comercial, cache e imagens não foram validados diretamente o suficiente.

### Decisão

Não integrar sem validação/autorização.

## 9.15 AniDB

### Situação

- Documentação oficial `wiki.anidb.net/HTTP_API_Definition` retornou 403 durante a pesquisa.
- Diretório de APIs mencionou chave/API e ausência de HTTPS.
- Autenticação/registro atual, limites, licença, cache e direitos de imagens não foram confirmados.

### Decisão

Não priorizar até resolver segurança e questões legais.

## 9.16 Fontes de cinema coreano

Korean Film Archive (KOFA):

- Dataset coreano pesquisado com licença indicada como sem restrições.
- Pode complementar cinema coreano.
- Alguns campos podem estar vazios.
- Atualização indicada como anual.
- Não substitui catálogo global.

## 9.17 Trakt

- Pode ser útil para importar/exportar dados do próprio usuário com autorização.
- Não deve ser tratado como fonte para espelhar catálogo completo.

## 9.18 MangaBaka

- Dados próprios indicados como CC BY-NC-SA 4.0.
- Dados de terceiros continuam sujeitos às licenças originais.
- Não utilizar sem direitos específicos compatíveis.

## 9.19 MangaUpdates versus datas de calendário

Releases de tradução/grupos não equivalem a lançamento oficial de capítulo/volume. Não alimentar calendário oficial diretamente com essas datas sem confirmação de editora/fonte confiável.

## 9.20 Matriz final recomendada

### PoCs prioritárias

- TMDB — filmes/séries, uso não comercial condicionado.
- TVmaze — séries/episódios/calendário, CC BY-SA a validar.
- Kitsu — anime/mangá, termos a validar.
- ANN — anime/mangá, termos a validar.
- MangaUpdates — mangá/manhwa/manhua/release, termos a validar.

### Complementar

- Wikidata.

### Reserva

- Shikimori.

### Não adotar sem autorização ou mudança de condições

- AniList.
- Jikan.
- MangaDex.

### Adiar

- TheTVDB.
- AniDB.
- MyAnimeList API.

## 9.21 Consultas formais recomendadas

Enviar consultas a ANN, Kitsu, Shikimori e MangaUpdates, e confirmar condições de TVmaze/TMDB, abordando:

1. Uso em tracker público de entretenimento.
2. Armazenamento persistente em PostgreSQL.
3. Cache e duração permitida.
4. Exibição dos dados aos usuários.
5. Criação de campos normalizados/derivados.
6. Atribuição exigida.
7. Uso de imagens, posters e banners.
8. Uso não comercial no MVP.
9. Possibilidade de obter licença comercial futura.
10. Obrigações de ShareAlike, quando aplicável.
11. Exclusão de dados após encerramento da licença.
12. Limites e requisitos técnicos vigentes.

Nenhuma autorização comercial definitiva foi obtida para as fontes analisadas.

---

# 10. Prova de conceito de cobertura das APIs

## 10.1 Objetivo

Antes de selecionar definitivamente os provedores, executar uma comparação prática de respostas para um conjunto representativo de obras.

## 10.2 Títulos de teste definidos

### Anime

- Naruto.
- Frieren.
- Solo Leveling.

### Mangá

- One Piece.
- Berserk.

### Manhwa

- Solo Leveling.
- The Beginning After the End.

### Manhua

- Heaven Official's Blessing.

### Doramas/séries

- Moving.
- Queen of Tears.
- Alice in Borderland.

### Filmes

- Oldboy.
- Your Name.

## 10.3 Campos a comparar

- Título original.
- Título romanizado.
- Título traduzido.
- Títulos alternativos.
- País.
- Ano.
- Formato.
- Sinopse.
- Episódios.
- Capítulos.
- Volumes.
- Relações.
- Imagem/capa.
- Datas.
- Status de publicação.
- IDs externos.

## 10.4 Critérios de avaliação

- Encontrabilidade da obra.
- Correção dos títulos.
- Cobertura de metadados.
- Precisão de episódios/capítulos/volumes.
- Qualidade das relações.
- Cobertura de datas.
- Disponibilidade de imagens e direitos.
- Limites e estabilidade.
- Licença e persistência.
- Necessidade de correção administrativa.

## 10.5 Resultado esperado

Uma matriz por obra e campo, identificando:

- Fonte que possui o dado.
- Fonte mais confiável.
- Dado ausente.
- Conflitos.
- Licença aplicável.
- Se pode ser persistido.
- Se pode ser exibido.
- Se imagem pode ser utilizada.
- Se exige atribuição.
- Se exige aprovação/contato.

A PoC não deve ser confundida com aprovação jurídica.

---

# 11. Identidade visual e Design System

## 11.1 Direção visual

**Dark Editorial**

- Tema escuro como apresentação principal.
- Tema claro também suportado.
- Base preta/cinza.
- Ciano e violeta como destaques.
- Tipografia editorial expressiva para títulos.
- Sans-serif neutra para textos e interface.
- Capas cinematográficas.
- Interface moderna, premium, acolhedora e expressiva.

## 11.2 Tipografia

- Tipografia editorial para títulos.
- Sans-serif legível para corpo e interface.
- Títulos de obras no idioma preferido, com opção de título original.
- Fallbacks para japonês, coreano, chinês e tailandês.

Famílias tipográficas definitivas ainda não foram selecionadas.

## 11.3 Design System

- Design System próprio.
- Tokens completos.
- Temas dark/light.
- Catálogo documentado.
- Componentes base reutilizáveis.
- Componentes especializados quando houver necessidade real.
- Densidade equilibrada.
- Não criar abstrações desnecessárias.

Stack de UI provisória:

- Tailwind CSS.
- shadcn/ui.
- Motion se necessário.

## 11.4 Microinterações

- Feedback toast.
- Feedback inline.
- Skeletons.
- Atualizações otimistas quando seguras.
- Erros claros.
- Possibilidade de desfazer ações quando apropriado.
- Animações sutis.
- Respeito a reduced motion.

## 11.5 Acessibilidade

Objetivo WCAG 2.2 AA:

- Navegação por teclado.
- Foco visível.
- Contraste adequado.
- Semântica correta.
- Leitores de tela.
- Respeito a `prefers-reduced-motion`.
- Alternativas para interações baseadas apenas em hover.
- Gestos/toque e hover devem coexistir.

## 11.6 Validação visual

- Protótipo navegável.
- Testes com usuário, esposa e amigas.
- Tarefas reais.
- Ciclos curtos de melhoria.
- Métricas de conclusão, tempo, erros e satisfação.

---

# 12. Arquitetura de software

## 12.1 Stack definida

**Frontend**

- Next.js.
- React.
- TypeScript.
- App Router.
- Tailwind CSS.
- shadcn/ui.
- Motion, se necessário.

**Backend**

- NestJS.
- TypeScript.
- REST.
- OpenAPI/Swagger.

**Dados**

- PostgreSQL.
- Prisma.

**Validação compartilhada**

- Zod.

## 12.2 Estilo arquitetural

**DECIDIDO:** monólito modular.

- Não adotar microserviços no MVP.
- Frontend e backend podem ter deploys independentes.
- Módulos de domínio devem possuir responsabilidades claras.
- Integrações externas isoladas por adaptadores.
- A arquitetura deve permitir trocar fornecedores sem reescrever o domínio.

## 12.3 App Router

A decisão registrada para o frontend é Next.js App Router.

## 12.4 Comunicação

- REST.
- OpenAPI/Swagger.
- TypeScript.
- Zod compartilhado onde fizer sentido.
- CORS restrito às origens autorizadas.
- HTTPS.

## 12.5 Cache e filas

- Cache seletivo.
- Fila simples no PostgreSQL no MVP.
- Não usar Redis no MVP.
- Tentativas progressivas.
- Limites por API.
- Logs estruturados.
- Controle de concorrência.
- Jobs/cron precisam ser compatíveis com o provedor gratuito escolhido.

## 12.6 Integrações

- Adaptadores independentes por fornecedor.
- Modelo interno não deve espelhar diretamente o schema de uma API externa.
- Normalização antes de persistir.
- Proveniência por campo.
- Respeitar limites, cache e licenças.
- Falhas externas não devem quebrar leitura da biblioteca ou apagar dados.

## 12.7 Uploads e arquivos

- Object Storage para imagens/arquivos, se houver plano gratuito adequado.
- CDN quando disponível e compatível.
- WebP/AVIF e formatos originais quando necessário/permitido.
- Validar tipo, tamanho e conteúdo.
- Banco guarda metadados e referências; arquivos ficam em armazenamento externo.
- Direitos de imagem verificados separadamente.
- Não baixar e hospedar imagens externas apenas porque uma API fornece URL.

## 12.8 Ambientes

- Desenvolvimento.
- Staging.
- Produção.

A disponibilidade de três ambientes sem custo deve ser testada. Não assumir que planos gratuitos comportam a arquitetura completa.

## 12.9 Região

Preferência registrada: região Brasil, quando tecnicamente e economicamente viável.

---

# 13. Autenticação, autorização e segurança

## 13.1 Cadastro e autenticação

Métodos previstos:

- E-mail e senha.
- Google.
- Apple.

Verificação de e-mail obrigatória antes de liberar funcionalidades da plataforma.

Recursos:

- Recuperação de senha.
- Sessões gerenciáveis.
- Revogação de sessões.
- Logout de dispositivos/sessões quando suportado.

A escolha dos provedores e limites gratuitos permanece condicionada.

## 13.2 Papéis

- Usuário.
- Moderador.
- Administrador.

Permissões granulares.

## 13.3 Regras administrativas

- Painel administrativo separado da experiência comum.
- Auditoria de ações relevantes.
- Moderadores não têm acesso automático a dados privados dos usuários.
- Administração pode revisar catálogo e solicitações.
- Acesso a dados pessoais deve ser minimizado e justificado.

## 13.4 Compartilhamento

- Links somente leitura.
- Revogáveis.
- Expiráveis.
- Permissões granulares.
- Nunca expor conteúdo privado por padrão.

## 13.5 Segurança web

Diretrizes:

- HTTPS.
- Cookies seguros.
- `HttpOnly` e `Secure` quando aplicável.
- Política `SameSite` apropriada.
- Proteção CSRF.
- CORS restrito.
- Rate limiting.
- Validação de entrada.
- Controle de acesso no backend.
- Segredos fora do repositório.
- Proteção contra abuso de endpoints.
- Auditoria de operações administrativas.

Os detalhes de sessão, OAuth, CORS, CSRF e estratégia de cookies precisam ser formalizados no design técnico.

## 13.6 Upload

- Limite de tamanho.
- Validação MIME e conteúdo real.
- Lista de formatos permitidos.
- Nomes de arquivo seguros.
- Evitar execução de arquivos.
- Verificação de direitos de uso.
- Controle de acesso e remoção.

---

# 14. Privacidade, social e moderação

## 14.1 Privacidade padrão

Privado por padrão:

- Perfil.
- Biblioteca.
- Avaliações.
- Diário.
- Notas.
- Histórico.
- Estatísticas.

O usuário decide tornar público ou compartilhar.

## 14.2 Compartilhamento

Modalidades:

- Perfil público.
- Coleção/lista específica.
- Página/experiência de uma obra.

O usuário escolhe quais campos expor.

Links:

- Somente leitura.
- Revogáveis imediatamente.
- Expiração configurável: 7, 30 ou 90 dias, ou sem expiração.
- Visitante pode visualizar sem conta quando o conteúdo foi autorizado.

## 14.3 Dados nunca compartilhados automaticamente

- Notas privadas.
- Diário.
- Histórico completo.
- Dados pessoais.
- Conteúdo privado.
- Spoilers sem proteção.

## 14.4 Social no MVP

Incluído:

- Seguir perfis públicos.
- Visualizar perfis públicos.
- Compartilhar coleções.
- Visualizar atividade pública autorizada.
- Bloquear.
- Denunciar.

Fora do MVP:

- Feed amplo.
- Comentários públicos gerais.
- Mensagens privadas.
- Chat.

## 14.5 Moderação

- Denúncias.
- Bloqueios.
- Revisão administrativa.
- Histórico/auditoria das ações.
- Moderadores não acessam automaticamente bibliotecas e notas privadas.

---

# 15. Solicitação de inclusão de obras e administração do catálogo

## 15.1 Solicitação pelo usuário

Campos previstos:

- Título.
- Categoria.
- Link de referência.
- Imagem/capa de referência.
- Descrição/sinopse.
- Ano.
- País.

## 15.2 Fluxo

Estados:

1. Pendente.
2. Em análise.
3. Aprovada.
4. Recusada.

O usuário acompanha o estado e pode receber justificativa quando recusada.

## 15.3 Duplicidade

- Detectar possíveis duplicatas antes do envio.
- Mostrar resultados próximos.
- Não bloquear automaticamente quando a correspondência não for conclusiva.
- Administração decide casos ambíguos.

## 15.4 Administração

- Revisão de catálogo.
- Correção de dados.
- Gestão de relações.
- Gestão de duplicidade.
- Gestão de solicitações.
- Controle de fontes.
- Auditoria.

---

# 16. Armazenamento, backups, exportação e exclusão

## 16.1 Banco

PostgreSQL com Prisma.

## 16.2 Object Storage

Armazenar arquivos/imagens somente quando houver fornecedor e direitos compatíveis.

Banco guarda metadados e referências.

## 16.3 Backup

Meta desejada:

- Backup diário.
- Retenção de 30 dias.
- Testes de restauração.
- Restauração por administradores.

**CONDICIONADO:** os planos gratuitos podem não oferecer retenção, frequência ou restauração adequadas. É obrigatório validar o provedor e documentar limitações.

Backups de arquivos precisam ser tratados separadamente dos backups do banco.

## 16.4 Exportação pessoal

Formatos:

- JSON.
- CSV.
- ZIP.

Conteúdo:

- Dados pessoais do usuário.
- Biblioteca.
- Progresso.
- Avaliações.
- Anotações/histórico, conforme escopo de exportação.
- Arquivos apenas quando os direitos permitirem.

Não exportar/republicar conteúdo de terceiros sem direito.

## 16.5 Exclusão de conta

- Revogar sessões.
- Revogar links de compartilhamento.
- Remover ou anonimizar dados pessoais conforme obrigação legal.
- Solicitar exclusão em terceiros quando aplicável.
- Tratar logs e backups conforme política de retenção e lei.
- Não prometer apagamento instantâneo de cópias de backup se houver ciclo de retenção legítimo; explicar política ao usuário.

---

# 17. PWA e funcionamento offline

## 17.1 PWA

- Instalável.
- Push com permissão explícita.
- Central interna de notificações.
- Preferências de horário silencioso.
- Sincronização de dados online.

## 17.2 Offline no MVP

- Consulta de dados recentes em cache.
- Sem edição offline.
- Cache privado com expiração.
- Limpeza no logout.
- Evitar exposição de dados pessoais em dispositivos compartilhados.
- Tratar cache de conteúdo sensível de forma conservadora.

## 17.3 iOS

Push e comportamento PWA precisam ser testados em dispositivo real, pois há particularidades do iOS e requisitos de instalação/permissão.

---

# 18. Custos e infraestrutura

## 18.1 Restrição de custo

**DECIDIDO:** objetivo de R$ 0 durante desenvolvimento e MVP.

Não significa que o produto deverá ser gratuito para sempre.

Após validar o MVP e o crescimento, poderá ser avaliado investimento em infraestrutura e licenças.

## 18.2 Itens que precisam de plano gratuito ou alternativa

- Hosting frontend.
- Hosting backend.
- PostgreSQL gerenciado.
- Object Storage.
- CDN.
- Domínio.
- Backup.
- E-mail de autenticação/recuperação.
- OAuth Google/Apple.
- Push.
- Analytics.
- Monitoramento.
- Jobs/cron.
- Logs.

## 18.3 Princípios

- Não depender de plano gratuito com limites incompatíveis.
- Não assumir que “free tier” é suficiente sem testar.
- Evitar custo obrigatório para fluxos essenciais do MVP.
- Prever migração de fornecedor.
- Separar custo de desenvolvimento do custo de operação futura.
- Rever licenças antes de monetização.

---

# 19. Testes, qualidade e observabilidade

## 19.1 Testes

- Unitários.
- Integração.
- E2E nos fluxos críticos.
- Segurança.
- Validação de integrações.
- Testes de acessibilidade.
- Testes responsivos.
- Testes PWA/offline.
- Testes de restauração de backup.

## 19.2 Fluxos críticos para E2E

No mínimo:

- Cadastro e verificação.
- Login e recuperação.
- Busca.
- Adicionar obra à biblioteca.
- Alterar status.
- Atualizar progresso.
- Concluir obra.
- Reassistir/reler.
- Criar nota/anotação.
- Spoiler oculto/revelado.
- Compartilhamento e revogação.
- Solicitar inclusão.
- Revisão administrativa.
- Notificação/calendário.
- Exportação.
- Exclusão de conta.

## 19.3 Observabilidade

- Logs estruturados.
- Monitoramento gratuito, se compatível.
- Métricas de disponibilidade.
- Alertas.
- Controle de falhas de integração.
- Não registrar conteúdo privado desnecessário.
- Analytics anônimo/agregado e minimizado.

---

# 20. LGPD e tratamento de dados

Diretrizes já levantadas:

- Coleta mínima.
- Consentimentos separados quando necessários.
- Privacidade granular.
- Exclusão de conta.
- Exportação de dados.
- Analytics anônimo/agregado.
- Minimização de dados.
- Criptografia em trânsito e em repouso, conforme suporte.
- Revisão jurídica real antes da disponibilização pública.
- Política de retenção para logs, backups e terceiros.
- Documentar finalidade e base legal de cada tratamento.
- Não expor dados privados a moderadores sem necessidade.

Este documento não é parecer jurídico nem comprova conformidade com a LGPD.

---

# 21. Git, branches, CI/CD e releases

## 21.1 Repositório

GitHub.

## 21.2 Estratégia de branches

- `main`.
- `develop`.
- `feature/*`.

## 21.3 CI

Verificações previstas:

- Lint.
- TypeScript.
- Testes unitários.
- Build.
- Testes de integração.
- Segurança.

## 21.4 Deploy

- Staging.
- Produção.
- Deploy após verificações/aprovação.
- Migrações versionadas.
- Secrets protegidos.
- Rollback.
- Releases manuais.

## 21.5 Proteção de branch

Recomendações ainda a formalizar:

- Proteger `main`.
- Exigir PR.
- Exigir CI verde.
- Revisão antes de merge, quando aplicável.
- Evitar push direto em produção.
- Testar migrações antes de produção.
- Definir estratégia de rollback de aplicação e banco.

---

# 22. Organização do projeto e OpenSpec/SpecKit

## 22.1 Processo de especificação

O projeto utilizou OpenSpec:

https://openspec.dev/

Repositório inicialmente consultado:

https://github.com/Fission-AI/OpenSpec

Ferramentas escolhidas no setup:

- Antigravity.
- Claude Code.

O usuário pretende consolidar o material com OpenSpec ou SpecKit posteriormente.

## 22.2 Change existente

Pasta:

`openspec/changes/portfolio-mvp/` — pertence a outro projeto e não deve ser confundida com YuukiList.

**Atenção:** o contexto do portfólio pessoal (`portfolioDev`) e suas decisões de OpenSpec não fazem parte do YuukiList. Não misturar as duas documentações.

Para YuukiList, a estrutura formal OpenSpec/SpecKit ainda deverá ser criada ou atualizada separadamente.

## 22.3 Artefatos esperados na consolidação

A organização exata dependerá do framework escolhido, mas o material deve ser decomposto em:

- Visão/proposta.
- Requisitos funcionais.
- Requisitos não funcionais.
- Especificações por domínio/capacidade.
- Design/arquitetura.
- Modelo de dados.
- Integrações.
- Segurança e privacidade.
- UX/UI e Design System.
- Plano de implementação.
- Testes e critérios de aceite.
- Riscos e decisões arquiteturais (ADRs).
- Gates de validação jurídica/técnica.

## 22.4 Regra de trabalho

Não recomeçar do zero sem necessidade. Comparar este documento com os artefatos existentes, preservar o que já estiver correto e atualizar apenas lacunas, contradições ou decisões alteradas.

---

# 23. Requisitos não funcionais consolidados

## 23.1 Usabilidade

- Ações frequentes rápidas.
- Busca multilíngue.
- Biblioteca eficiente.
- Feedback claro.
- Experiência responsiva.
- Estados vazios e de erro bem tratados.

## 23.2 Acessibilidade

- WCAG 2.2 AA como objetivo.
- Teclado.
- Foco.
- Contraste.
- Reduced motion.
- Sem dependência exclusiva de hover.

## 23.3 Segurança

- Autenticação segura.
- Autorização no backend.
- Privacidade por padrão.
- Rate limits.
- Proteção de sessões.
- Segredos protegidos.
- Auditoria administrativa.
- Upload validado.

## 23.4 Disponibilidade e resiliência

- Falha de API externa não deve interromper a biblioteca.
- Dados válidos persistidos não podem ser apagados por falha externa.
- Cache e tentativas progressivas.
- Backup e restauração testados.
- Integrações desacopladas.

## 23.5 Manutenibilidade

- Monólito modular.
- Tipagem TypeScript.
- Contratos REST/OpenAPI.
- Validação Zod.
- Prisma.
- Adaptadores de provedores.
- Testes.
- CI.

## 23.6 Desempenho

Ainda não há metas numéricas aprovadas de Core Web Vitals, latência, throughput ou tempo de resposta. Devem ser definidas após a primeira PoC e protótipo, sem inventar SLOs prematuros.

---

# 24. Riscos identificados

1. **Custo zero incompatível com requisitos:** banco, storage, backup, ambientes, autenticação, push e monitoramento podem exceder limites gratuitos.
2. **Licenças de dados:** fonte gratuita não significa livre para tracker público ou uso comercial.
3. **Licenças de imagens:** direitos das imagens podem ser diferentes dos direitos dos metadados.
4. **Monetização futura:** TMDB e outras fontes podem exigir mudança de fornecedor/licença.
5. **Cobertura asiática:** fontes podem ser fracas para doramas fora da Coreia e para manhwa/manhua.
6. **Datas regionais:** calendários podem divergir por país, plataforma e fuso.
7. **Deduplicação:** títulos multilíngues e adaptações podem gerar falsos positivos.
8. **Busca multilíngue:** tokenização/normalização japonesa, coreana, chinesa e tailandesa requer tratamento específico.
9. **PWA iOS:** push e instalação exigem validação real.
10. **OAuth/e-mail:** fornecedores e limites gratuitos podem ser incompatíveis.
11. **Jobs/cron:** execução confiável pode não estar disponível em planos gratuitos.
12. **Backup de arquivos:** não basta fazer backup do PostgreSQL.
13. **LGPD:** exclusão, logs, backups e terceiros precisam de política coerente.
14. **Privacidade offline:** cache pode expor dados em dispositivo compartilhado.
15. **Spoilers:** visitantes anônimos precisam de proteção conservadora.
16. **Social:** perfis públicos exigem bloqueio, denúncia e moderação.
17. **Histórico:** precisa separar eventos de estado atual.
18. **Progresso:** episódios, especiais, volumes e capítulos precisam de regras de integridade.
19. **Calendário:** fontes secundárias podem apresentar datas não oficiais.
20. **Exportação ZIP:** imagens e arquivos de terceiros dependem de direitos.
21. **Segurança cross-origin:** cookies, CORS, CSRF, OAuth e service worker precisam de desenho específico.
22. **CI/CD:** migrações e rollback precisam ser testados.
23. **Rate limits:** chamadas de múltiplos usuários podem ultrapassar limites de API.
24. **Persistência de dados externos:** cada fornecedor pode impor prazo de cache ou exclusão.
25. **CC BY-SA do TVmaze:** pode impor obrigações de compartilhamento pela mesma licença aos dados derivados, exigindo análise de compatibilidade.

---

# 25. Decisões consolidadas — resumo de referência

| ID | Decisão | Estado |
|---|---|---|
| P-001 | Nome YuukiList | Decidido |
| P-002 | Tracker de entretenimento asiático unificado | Decidido |
| P-003 | Sem player/leitor de conteúdo | Decidido |
| P-004 | Web responsiva primeiro; PWA depois | Decidido |
| P-005 | Público inicial: usuário, esposa e amigas; potencial público geral | Decidido |
| P-006 | Catálogo unificado de doramas, filmes, anime, mangá, manhwa e manhua | Decidido |
| P-007 | BL/GL como atributos/temas transversais | Decidido |
| P-008 | Busca sem IA | Decidido |
| P-009 | Dark Editorial; dark/light | Decidido |
| P-010 | Ciano/violeta sobre base escura | Decidido |
| P-011 | Navegação Explorar, Buscar, Biblioteca, Calendário, Perfil | Decidido |
| P-012 | Sidebar desktop e bottom nav mobile | Decidido |
| P-013 | Catálogo interno com IDs próprios | Decidido |
| P-014 | Múltiplos provedores desacoplados | Decidido |
| P-015 | Proveniência e histórico por campo | Decidido |
| P-016 | Deduplicação híbrida com revisão de casos duvidosos | Decidido |
| P-017 | Cadastro provisório de obra sem fonte | Decidido |
| P-018 | Status pessoais separados da situação de publicação | Decidido |
| P-019 | Em dia é condição calculada, não status | Decidido |
| P-020 | Capítulos como progresso principal de mangá | Decidido |
| P-021 | Volumes como alternativa quando capítulos não forem confiáveis | Decidido |
| P-022 | Filmes sem percentual | Decidido |
| P-023 | Especiais opcionais | Decidido |
| P-024 | Reassistir/reler com novo ciclo ou contador | Decidido |
| P-025 | Nota geral 0–10 e favorito independente | Decidido |
| P-026 | Diário/histórico privados por padrão | Decidido |
| P-027 | Spoilers ocultos; visitantes anônimos sempre protegidos | Decidido |
| P-028 | Perfil e biblioteca privados por padrão | Decidido |
| P-029 | Compartilhamento granular, revogável e expirável | Decidido |
| P-030 | Social básico, sem feed amplo no MVP | Decidido |
| P-031 | Calendário com lançamentos, acompanhamento e agenda pessoal | Decidido |
| P-032 | Datas com confiabilidade e fonte | Decidido |
| P-033 | Solicitação de inclusão com revisão administrativa | Decidido |
| P-034 | Next.js + React + TypeScript | Decidido |
| P-035 | NestJS | Decidido |
| P-036 | Monólito modular, sem microserviços no MVP | Decidido |
| P-037 | Prisma + PostgreSQL | Decidido |
| P-038 | REST + OpenAPI/Swagger | Decidido |
| P-039 | Zod compartilhado quando aplicável | Decidido |
| P-040 | Deploy frontend/backend independente | Decidido |
| P-041 | Cache seletivo e fila PostgreSQL; sem Redis no MVP | Decidido |
| P-042 | PWA offline apenas leitura recente no MVP | Decidido |
| P-043 | Custo R$ 0 como meta de desenvolvimento e MVP | Decidido |
| P-044 | Backup diário/30 dias como meta condicionada ao fornecedor | Condicionado |
| P-045 | Exportação JSON/CSV/ZIP | Decidido |
| P-046 | LGPD, coleta mínima e privacidade granular | Diretriz decidida; validação jurídica pendente |
| P-047 | WCAG 2.2 AA como objetivo | Decidido |
| P-048 | GitHub, main/develop/feature | Decidido |
| P-049 | CI com lint, TS, testes, build e segurança | Decidido |
| P-050 | Staging/produção, migrações versionadas e rollback | Decidido como diretriz |
| P-051 | TMDB como PoC prioritária | Condicionado |
| P-052 | TVmaze como PoC prioritária | Condicionado |
| P-053 | Kitsu e ANN como PoCs condicionadas | Condicionado |
| P-054 | MangaUpdates como PoC condicionada | Condicionado |
| P-055 | Shikimori como reserva | Condicionado |
| P-056 | Wikidata como complementar | Decidido como direção |
| P-057 | AniList não adotar sem autorização expressa | Decidido |
| P-058 | Jikan não adotar | Decidido |
| P-059 | MangaDex não usar como dependência de catálogo | Decidido |
| P-060 | TheTVDB adiar | Decidido |
| P-061 | AniDB não priorizar até validação | Decidido |
| P-062 | Direitos de imagens avaliados separadamente | Decidido |
| P-063 | Não declarar fonte aprovada antes de PoC e validação de licença | Decidido |

---

# 26. Pendências e gates de validação

Estes itens continuam em aberto porque dependem de evidência, fornecedor, teste ou decisão técnica detalhada.

## 26.1 Gates jurídicos e de licenciamento

- [ ] Confirmar uso de TMDB em tracker público não comercial.
- [ ] Confirmar condições de cache e persistência TMDB.
- [ ] Confirmar direitos e condições de imagens TMDB.
- [ ] Avaliar compatibilidade da licença CC BY-SA do TVmaze com o catálogo.
- [ ] Confirmar uso de imagens TVmaze.
- [ ] Solicitar esclarecimento formal ao Kitsu sobre persistência e redistribuição.
- [ ] Solicitar esclarecimento formal à ANN sobre persistência, uso comercial e imagens.
- [ ] Solicitar esclarecimento formal à MangaUpdates sobre catálogo persistente.
- [ ] Solicitar esclarecimento formal à Shikimori sobre redistribuição.
- [ ] Definir estratégia de substituição de fornecedores antes de monetizar.
- [ ] Revisar obrigações de atribuição e notices por fonte.
- [ ] Revisar política de exclusão de dados se a licença de um fornecedor terminar.

## 26.2 Gates de cobertura

- [ ] Executar PoC com os títulos listados na seção 10.
- [ ] Medir cobertura de dramas coreanos.
- [ ] Medir cobertura de dramas chineses.
- [ ] Medir cobertura de dramas japoneses.
- [ ] Medir cobertura de dramas tailandeses.
- [ ] Medir cobertura de manhwa.
- [ ] Medir cobertura de manhua.
- [ ] Medir precisão de capítulos/volumes.
- [ ] Medir precisão de episódios/temporadas.
- [ ] Medir cobertura de relações e adaptações.
- [ ] Medir datas regionais e calendário.
- [ ] Documentar qualidade e completude por campo.

## 26.3 Gates de arquitetura e infraestrutura

- [ ] Selecionar provedores gratuitos compatíveis para frontend e backend.
- [ ] Selecionar PostgreSQL gerenciado.
- [ ] Selecionar Object Storage.
- [ ] Verificar CDN e limites.
- [ ] Verificar autenticação e e-mail.
- [ ] Verificar OAuth Google e Apple.
- [ ] Verificar push.
- [ ] Verificar cron/jobs.
- [ ] Verificar logs e monitoramento.
- [ ] Verificar backup diário e retenção de 30 dias.
- [ ] Planejar backup de arquivos.
- [ ] Testar restauração.
- [ ] Definir política de rate limit interno e por provedor.
- [ ] Definir estratégia de cookies, CSRF, CORS e OAuth.
- [ ] Definir expiração e limpeza de cache privado.
- [ ] Definir execução segura de jobs no plano gratuito.

## 26.4 Gates funcionais/técnicos

- [ ] Formalizar critérios de aceite de “Em dia”.
- [ ] Formalizar estrutura de unidades principais e extras.
- [ ] Formalizar tratamento de episódio duplo e cour.
- [ ] Formalizar comportamento de status manual inconsistente.
- [ ] Formalizar conflitos de progresso capítulo/volume.
- [ ] Definir regras de edição de eventos históricos sem perder integridade.
- [ ] Definir política de exclusão e retenção de histórico.
- [ ] Definir granularidade de compartilhamento.
- [ ] Definir política de bloqueio/denúncia e fluxo de moderação.
- [ ] Definir matriz completa de permissões.
- [ ] Definir critérios de popularidade e tendências.
- [ ] Definir ordenação e relevância da busca.
- [ ] Definir métricas numéricas de desempenho após protótipo/PoC.
- [ ] Definir schema Prisma final.
- [ ] Definir contratos OpenAPI.
- [ ] Definir estratégia de migrações e rollback de banco.

## 26.5 Gates de UX e visual

- [ ] Finalizar logotipo/identidade visual.
- [ ] Selecionar tipografias.
- [ ] Finalizar tokens de Design System.
- [ ] Criar protótipo navegável.
- [ ] Validar experiência mobile.
- [ ] Validar experiência desktop.
- [ ] Testar dispositivos menos potentes.
- [ ] Testar reduced motion.
- [ ] Validar WCAG 2.2 AA.
- [ ] Testar com usuário, esposa e amigas.
- [ ] Medir tempo de busca e atualização de progresso.

---

# 27. Próxima sequência recomendada

1. Comparar este documento com qualquer documentação já existente do YuukiList.
2. Criar/atualizar proposta e especificações de domínio no OpenSpec ou SpecKit.
3. Transformar regras funcionais em requisitos testáveis e critérios de aceite.
4. Executar a PoC das APIs.
5. Obter respostas de licenciamento.
6. Definir provedores de infraestrutura dentro do orçamento do MVP.
7. Finalizar modelo de dados e contratos de API.
8. Criar protótipo navegável e Design System.
9. Planejar implementação em tarefas pequenas, dependenciadas e verificáveis.
10. Só então liberar integrações definitivas e implementação completa.

---

# 28. Orientação para o próximo agente/assistente

Ao receber este documento:

- Trate-o como contexto consolidado do YuukiList.
- Não misture com o projeto `portfolioDev`.
- Não reabra decisões marcadas como decididas sem apontar motivo concreto.
- Não considere licenças aprovadas apenas por documentação técnica.
- Não invente resultados de PoC.
- Não escolha uma API única para todas as categorias.
- Não implemente scraping.
- Não use AniList ou Jikan como atalho.
- Não presuma direitos de imagens.
- Preserve IDs internos e independência de fornecedores.
- Priorize regras de domínio, integridade de progresso, privacidade e proveniência.
- Mantenha o MVP sem microserviços e sem Redis.
- Respeite a meta de R$ 0 sem assumir que todos os serviços gratuitos serão suficientes.
- Quando consolidar OpenSpec/SpecKit, diferencie requisitos normativos, decisões arquiteturais, riscos, hipóteses e gates externos.
- Se encontrar contradições entre este documento e artefatos mais recentes aprovados pelo usuário, apresente a divergência antes de substituir decisões.

---

## Apêndice A — Links de documentação fornecidos pelo usuário

1. Anime News Network API: https://www.animenewsnetwork.com/encyclopedia/api.php
2. Shikimori API: https://shikimori.io/api/doc
3. Kitsu API: https://kitsu.docs.apiary.io/#
4. MangaUpdates API: https://api.mangaupdates.com/
5. TMDB API: https://developer.themoviedb.org/docs/getting-started
6. AniList docs: https://github.com/AniList/docs
7. AniDB HTTP API: https://wiki.anidb.net/HTTP_API_Definition
8. TVmaze API: https://www.tvmaze.com/api
9. OpenSpec: https://openspec.dev/

## Apêndice B — Observação sobre exatidão

Este arquivo consolida o que foi levantado nas conversas, incluindo informações de pesquisa registradas no contexto. Políticas de API, limites, endpoints, preços, termos e licenças podem mudar. Antes de implementar, consultar novamente as fontes oficiais e guardar evidências datadas. Nenhuma afirmação deste documento deve ser interpretada como parecer jurídico ou garantia de disponibilidade de fornecedor.

**Fim do documento.**
