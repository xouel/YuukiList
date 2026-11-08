<!-- XSPEC:START -->
# X-Spec — Instruções para Agentes de IA (`v2.0.1`)

Este repositório utiliza o framework **X-Spec** (*Spec-Driven Development* modular com governança determinística executável).
Os prompts canônicos residem em `xspec/commands/`, os templates em `xspec/templates/` e o motor determinístico em `xspec/bin/xspec.mjs` (`xspec/lib/`).

## Comandos do Fluxo X-Spec

Quando o usuário invocar qualquer comando abaixo (via `/xspec-<cmd>`, `$xspec-<cmd>` ou pedindo diretamente no chat), leia integralmente e execute o prompt correspondente:

| Comando | Onde ler e executar | Função |
| :--- | :--- | :--- |
| **`/xspec-init`** (`$xspec-init`) | `xspec/commands/init.md` | Inicializa `xspec/config.yaml`, `xspec/constitution.md`, mapeia as Living Specs iniciais e roda `doctor --fix` |
| **`/xspec-explore`** (`$xspec-explore`) | `xspec/commands/explore.md` | Modo de exploração livre, investigação de código e fatiamento de épicos (`ROADMAP.md`) |
| **`/xspec-define`** (`$xspec-define`) | `xspec/commands/define.md` | Faz *Clarification Gate*, cria `xspec/changes/NNN-slug/`, grava snapshot base SHA-256 (`snapshot-base`) e valida (`validate --stage define`) |
| **`/xspec-plan`** (`$xspec-plan`) | `xspec/commands/plan.md` | Gera `design.md` (condicional), `tasks.md` com `## Traceability Matrix` (9 colunas), checa `conflicts` e valida (`validate --stage plan`) |
| **`/xspec-build`** (`$xspec-build`) | `xspec/commands/build.md` | Implementa as tarefas, marca `[x]` em tempo real, atualiza a `## Traceability Matrix`, consome `report.md` e valida (`validate --stage build`) |
| **`/xspec-close`** (`$xspec-close`) | `xspec/commands/close.md` | Executa `verify` + `validate --stage close`, audita convergência e executa o merge transacional em 8 estágios (`merge`) |

## CLI do Motor Determinístico (`xspec/bin/xspec.mjs`)

- `node xspec/bin/xspec.mjs snapshot-base --change <id>`
- `node xspec/bin/xspec.mjs validate --stage <define|plan|build|pre-close|close> --change <id>`
- `node xspec/bin/xspec.mjs conflicts [--change <id>]`
- `node xspec/bin/xspec.mjs verify --change <id>`
- `node xspec/bin/xspec.mjs merge --change <id> [--allow-dirty] [--dry-run]`
- `node xspec/bin/xspec.mjs recover [--transaction <txId>] [--force-orphan-lock]`
- `node xspec/bin/xspec.mjs doctor [--fix] [--json]`

## Regras Globais Inegociáveis

1. **Fontes de Governança:** Sempre respeite `xspec/config.yaml` e `xspec/constitution.md`.
2. **Zero Código Prematuro:** Nunca crie ou altere código de produção durante `init`, `explore`, `define` ou `plan`.
3. **Padrão Normativo:**
   - Cabeçalhos de template, seções de delta (`## ADDED/MODIFIED/REMOVED/RENAMED Requirements`), `### Requirement:`, `#### Scenario:` (exatamente 4 `#`), `- **GIVEN**`, `- **WHEN**`, `- **THEN**`, `- **AND**` e as palavras normativas `SHALL`/`MUST` permanecem sempre em inglês.
   - `## Why` em `proposal.md`: entre 50 e 1.000 caracteres.
   - `## Purpose`: mínimo de 50 caracteres (presente em specs vivas e apenas em deltas de capacidades novas).
   - Corpo de cada `### Requirement:`: deve conter `SHALL` ou `MUST` e ter no máximo 500 caracteres.
   - Checkboxes (`- [ ]` / `- [x]`) em `tasks.md` são exclusivos para tarefas sob cabeçalhos numerados `## N. Nome`.
   - A tabela `## Traceability Matrix` em `tasks.md` deve possuir exatamente 9 colunas e ter `Exec Result == PASS` comprovado em `.xspec/evidence/<id>/` antes do `close`.
4. **Proteção das Living Specs:** Nunca edite `xspec/specs/` manualmente fora do `/xspec-init`; toda atualização de capacidade deve passar pelo `xspec merge` transacional em `/xspec-close`.
<!-- XSPEC:END -->

