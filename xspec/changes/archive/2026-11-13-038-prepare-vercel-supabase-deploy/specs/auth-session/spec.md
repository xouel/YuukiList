# Spec Delta

## ADDED Requirements

### Requirement: Production JWT Secret Enforcement
Em ambientes de produção (`NODE_ENV=production` ou `VERCEL_ENV=production`), o `TokenService` SHALL exigir explicitamente a variável de ambiente `JWT_SECRET` configurada e falhar com erro claro caso ela esteja ausente, mantendo o fallback determinístico apenas em desenvolvimento local e suítes de teste.

#### Scenario: Bloqueio explicito de operacao JWT sem JWT_SECRET em producao
- **GIVEN** o runtime configurado com `NODE_ENV=production` ou `VERCEL_ENV=production` e sem `JWT_SECRET` definido
- **WHEN** o `TokenService` é acionado para assinar ou validar uma sessão sem segredo explícito injetado
- **THEN** o sistema SHALL recusar o segredo padrão de desenvolvimento lançando erro explícito de configuração ausente

#### Scenario: Operacao normal em producao com JWT_SECRET configurado e fallback em dev
- **GIVEN** um ambiente de produção com `JWT_SECRET` forte definido ou um ambiente local de desenvolvimento/teste sem `JWT_SECRET`
- **WHEN** o `TokenService` assina e verifica tokens de sessão JWT
- **THEN** o sistema SHALL emitir e validar os tokens normalmente sem erros falsos de inicialização nem bloqueio de build estático

