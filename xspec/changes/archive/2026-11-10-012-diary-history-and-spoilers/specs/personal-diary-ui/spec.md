# Spec Delta

## Purpose

Prover a interface visual da linha do tempo, diário pessoal e notas contextuais no YuukiList, disponibilizando filtros cronológicos por obra e tipo de evento, modal interativo de anotação com marcação de spoiler e máscara visual de proteção com revelação sob demanda.

## ADDED Requirements

### Requirement: Interactive Timeline View and Unit Notes Interface
A interface do usuário SHALL apresentar a linha do tempo cronológica com agrupamento temporal, permitindo criar, editar e excluir anotações vinculadas a episódios ou capítulos com alternância simples de aviso de spoiler.

#### Scenario: Renderizacao da linha do tempo cronologica na aba de historico
- **GIVEN** um usuário autenticado navegando na aba Histórico e Diário da biblioteca
- **WHEN** a lista de eventos é carregada do servidor
- **THEN** a interface SHALL renderizar os acontecimentos em sequência cronológica decrescente exibindo miniaturas, data legível e tipo de evento

#### Scenario: Criacao de nota vinculada a unidade com flag de spoiler
- **GIVEN** o modal ou painel de anotação aberto para uma obra
- **WHEN** o usuário preenche o número da unidade, digita sua reflexão e marca a opção de conteúdo com spoiler
- **THEN** a interface SHALL enviar a anotação e exibi-la imediatamente na linha do tempo com badge de spoiler

### Requirement: Spoiler Warning Mask and One-Click Reveal
A interface SHALL aplicar máscara visual protetora sobre conteúdos identificados com spoiler, permitindo a revelação controlada pelo usuário através de um único clique sem alterar a persistência original.

#### Scenario: Revelacao sob demanda de conteudo protegido por mascara de spoiler
- **GIVEN** um card de nota exibido com máscara visual de borrão e alerta de spoiler
- **WHEN** o usuário clica sobre o botão de revelar spoiler
- **THEN** a interface SHALL desativar a máscara localmente e exibir o texto integral da anotação preservando a segurança das demais notas

