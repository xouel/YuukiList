# Spec Delta

## Purpose

Gerenciar a central interna de notificacoes in-app do YuukiList, alertando sobre lancamentos de obras acompanhadas, controlando status de leitura e respeitando configuracoes de Horario Silencioso (Quiet Hours).

## ADDED Requirements

### Requirement: In-App Notification Center and Unread Counter
O sistema SHALL disponibilizar uma central interna de notificacoes acessivel por icone na barra de navegacao, exibindo contador visual de notificacoes nao lidas e historico de avisos de novos lancamentos.

#### Scenario: Notificacao automatica de novo episodio de obra acompanhada
- **GIVEN** um usuario acompanhando ativamente uma obra no YuukiList
- **WHEN** um novo episodio ou capitulo dessa obra e registrado no calendario
- **THEN** o sistema SHALL criar uma notificacao interna associada ao usuario e incrementar o contador de itens nao lidos

#### Scenario: Marcacao individual e em massa de notificacoes como lidas
- **GIVEN** uma lista de notificacoes contendo itens com status nao lido
- **WHEN** o usuario clica em uma notificacao especifica ou aciona a opcao Marcar todas como lidas
- **THEN** o sistema SHALL atualizar o status para lido e decrementar ou zerar o contador do badge da interface

### Requirement: Quiet Hours and Silent Delivery Preferences
O sistema SHALL oferecer configuracao de Horario Silencioso (padrao das 22h as 08h), durante o qual as notificacoes geradas sao gravadas de forma silenciosa sem toasts intrusivos ou sinais sonoros.

#### Scenario: Entrega silenciosa durante a janela noturna de descanso
- **GIVEN** o horario silencioso ativo no intervalo entre 22h e 08h
- **WHEN** um evento de lancamento ocorre as 23h30
- **THEN** o sistema SHALL persistir a notificacao internamente e atualizar o badge sem disparar toasts sonoros ou banners invasivos

#### Scenario: Customizacao de horarios silenciosos pelo usuario
- **GIVEN** as preferencias de notificacao do usuario
- **WHEN** o usuario altera o horario inicial e final da janela de silencio e salva as configuracoes
- **THEN** o sistema SHALL validar o intervalo horario e aplicar as novas regras imediatamente aos proximos eventos

