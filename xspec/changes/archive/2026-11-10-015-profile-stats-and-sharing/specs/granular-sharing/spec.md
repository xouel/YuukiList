# Spec Delta

## Purpose

Gerenciar o compartilhamento granular e seguro de bibliotecas e perfis no YuukiList via links tokenizados com prazos de expiracao configuraveis e revogacao instantanea.

## ADDED Requirements

### Requirement: Tokenized Public Sharing Links with Configurable Expiration
O sistema SHALL permitir a geracao de links publicos somente leitura (/share/:token) com prazos de expiracao configuraveis de 7, 30 ou 90 dias e capacidade de revogacao imediata pelo titular da conta.

#### Scenario: Criacao de link compartilhado com prazo determinado
- **GIVEN** um usuario solicitando a criacao de um link de compartilhamento com prazo de 30 dias
- **WHEN** a solicitacao de geracao de link e processada
- **THEN** o sistema SHALL gerar um token criptografico unico, persistir a data limite de expiracao e retornar o endereco seguro formatado

#### Scenario: Bloqueio de acesso a link revogado ou expirado
- **GIVEN** um link compartilhado cujo prazo de validade expirou ou que foi expressamente revogado pelo usuario
- **WHEN** um visitante tenta acessar o endereco /share/:token correspondente
- **THEN** o sistema SHALL recusar a visualizacao com o status de expirado ou inexistente e nao exibir dados da biblioteca

### Requirement: Read-Only Shared Library View and Privacy Masking
A rota publica /share/:token SHALL exibir a biblioteca do usuario em modalidade estritamente somente leitura, impedindo qualquer mutacao de progresso e omitindo notas e marcadores de spoiler confidenciais.

#### Scenario: Visualizacao publica somente leitura de biblioteca compartilhada
- **GIVEN** um token de compartilhamento valido e ativo
- **WHEN** a pagina /share/:token e carregada por um visitante anonimo
- **THEN** a interface SHALL renderizar os cards de obras e estatisticas sem botoes de edicao de progresso e com notas privadas ocultas

