# Spec Delta

## Purpose

Fornecer modelagem canonica de relacionamentos explicitos e tipados entre obras e universos de franquias consolidados garantindo a independencia estrita de acompanhamento entre midias.

## ADDED Requirements

### Requirement: Typed Media Relationship Inversion and Traversal

O sistema SHALL gerenciar relacionamentos tipados entre obras e inferir automaticamente as relacoes inversas correspondentes sem duplicidade de armazenamento.

#### Scenario: Inversao automatica de relacao prequel e sequel
- **GIVEN** uma obra A vinculada como PREQUEL da obra B
- **WHEN** o cliente consulta as relacoes da obra B
- **THEN** o sistema SHALL retornar a obra A rotulada como SEQUEL

#### Scenario: Mapeamento reciproco de adaptacao transmidia
- **GIVEN** um manhua ou light novel adaptado para anime ou dorama
- **WHEN** qualquer uma das duas obras e consultada
- **THEN** o sistema SHALL expor a relacao reciproca do tipo ADAPTATION indicando categoria e titulo

### Requirement: Franchise Universe Organization and Independent Progress

O sistema SHALL organizar obras em franquias com suporte a ordem cronologica e de lancamento preservando a independencia do progresso pessoal do usuario em cada midia.

#### Scenario: Listagem de franquia com ordenacao cronologica e de lancamento
- **GIVEN** uma franquia contendo multiplas obras cadastradas
- **WHEN** o usuario consulta a pagina ou endpoint da franquia
- **THEN** o sistema SHALL disponibilizar a lista de obras ordenadas por lancamento e por ordem cronologica da narrativa

#### Scenario: Independencia estrita do progresso entre adaptacoes da franquia
- **GIVEN** um usuario com status Concluido no dorama de uma franquia
- **WHEN** o usuario consulta a franquia ou o manhua adaptado
- **THEN** o status e o progresso do manhua SHALL permanecer inalterados e desacoplados

