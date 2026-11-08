<!--
Sync Impact Report:
- Version: {{VERSION}} (Initial ratification / Amendment)
- Ratified: {{RATIFIED_DATE}}
- Last Amended: {{LAST_AMENDED_DATE}}
-->

# {{PROJECT_NAME}} Constitution

> Este documento define os princípios técnicos, a stack e as restrições inegociáveis deste repositório (governança X-Spec). Nenhum plano (`/xspec-plan`) ou implementação (`/xspec-build`) pode violar estas regras sem justificativa explícita aprovada.

## Core Principles

### I. Modularidade e Responsabilidade Única
Módulos, componentes e funções MUST manter responsabilidade única, baixo acoplamento e fronteiras claras. Evitar abstrações prematuras (YAGNI).

### II. Tipagem Explícita e Contratos Seguros
O código MUST utilizar tipagem explícita e validar todas as entradas externas (APIs, CLI, banco de dados, variáveis de ambiente) nas fronteiras do sistema. É proibido usar tipos implícitos ou suprimir erros silenciosamente.

### III. Rastreabilidade Spec-First (NON-NEGOTIABLE)
Nenhuma funcionalidade ou alteração de comportamento observável MUST ser implementada sem especificação prévia (`proposal.md` + deltas `specs/`) e tarefas rastreáveis (`tasks.md`).

### IV. Verificação e Não-Regressão
Toda mudança MUST preservar o funcionamento do build, linter, typecheck e suíte de testes configurados em `xspec/config.yaml`, além de comprovar a cobertura dos cenários `GIVEN/WHEN/THEN`.

### V. Segurança por Padrão
Credenciais, tokens, chaves de API e segredos MUST NOT ser gravados no código-fonte ou em arquivos versionados; utilizar exclusivamente variáveis de ambiente (`.env` listado no `.gitignore`).

## Technology Stack & Environment

- **Linguagens e Runtimes:** {{TECH_LANGUAGES}}
- **Frameworks Principais:** {{TECH_FRAMEWORKS}}
- **Banco de Dados / Persistência:** {{TECH_DATABASE}}
- **Gerenciador de Pacotes / Build / Testes:** {{TECH_PACKAGE_MANAGER}}

## Architecture & Code Conventions

- **Estrutura de Diretórios:** {{ARCH_STRUCTURE}}
- **Padrões de Nomenclatura:** {{ARCH_NAMING}}

## Explicit Constraints (O que NÃO fazer)

- MUST NOT adicionar novas dependências externas sem justificativa registrada em `design.md` (ou na seção `## Analysis` do `tasks.md`).
- MUST NOT refatorar arquivos ou alterar comportamentos fora do escopo listado na mudança ativa.

## Governance

- Esta Constituição prevalece sobre qualquer outra prática local.
- Conflitos com princípios `MUST` são classificados como **CRITICAL** durante `/xspec-plan` (Analysis) e `/xspec-close` (Convergence Audit).
- Emendas a esta Constituição seguem versionamento semântico (`MAJOR.MINOR.PATCH`):
  - **MAJOR**: Remoção ou redefinição incompatível de princípio existente.
  - **MINOR**: Adição de novo princípio ou expansão material de governança.
  - **PATCH**: Esclarecimentos de redação sem alterar o sentido normativo.

**Version**: {{VERSION}} | **Ratified**: {{RATIFIED_DATE}} | **Last Amended**: {{LAST_AMENDED_DATE}}
