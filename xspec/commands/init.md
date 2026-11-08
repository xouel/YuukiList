---
description: "X-Spec: Inicializa xspec/config.yaml, xspec/constitution.md e mapeia as Living Specs iniciais do projeto"
---

# X-Spec — Comando: INIT (`/xspec-init`)

**Entrada do usuário:** considere qualquer texto ou flags escritos pelo usuário após o comando (ou em `$ARGUMENTS` / `{{args}}` quando substituídos pela ferramenta). Se o placeholder aparecer literal, utilize o texto da mensagem do usuário.

Você está executando o comando **INIT** do framework **X-Spec**.
**Regra Inegociável:** Nenhum arquivo de código de produção pode ser criado ou modificado durante esta etapa.

---

## Passo 1: Garantir Estrutura Base do `xspec/`

Verifique e crie (se ainda não existirem) os diretórios:
- `xspec/specs/`
- `xspec/changes/archive/`

Verifique se a pasta `xspec/templates/` está presente no projeto. Caso o usuário esteja lendo o X-Spec a partir de um repositório clonado, garanta que os arquivos de `xspec/` e as pontes de agente estejam acessíveis conforme descrito em `install.md`.

---

## Passo 2: Detectar Ambiente e Inspecionar o Repositório

Analise os manifestos e configurações na raiz e subpastas (`package.json`, `tsconfig.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, scripts de lint/typecheck/test e estrutura de diretórios do código-fonte).
Classifique o projeto como:
- **Greenfield:** Ainda sem código-fonte de negócio implementado.
- **Brownfield:** Já possui código-fonte e capacidades implementadas.

---

## Passo 3: Proteger ou Criar `xspec/config.yaml`

Aplique **proteção uniforme** contra sobrescrita acidental:

1. Se `xspec/config.yaml` **não existir** (ou se o usuário passou `--force`):
   - Leia `xspec/templates/config.yaml`.
   - Preencha `{{TECH_STACK_SUMMARY}}` com o resumo real da stack detectada (linguagens, frameworks, banco de dados).
   - Preencha `{{ARCHITECTURE_SUMMARY}}` com o estilo arquitetural detectado.
   - Preencha `verification.commands` com os comandos reais de lint, typecheck e testes detectados no repositório (ex.: `["npm run lint", "npm test"]` ou `["pytest"]`). Se não houver scripts configurados, mantenha `commands: []`.
   - Grave `xspec/config.yaml`.
2. Se `xspec/config.yaml` **já existir**:
   - Preserve o arquivo intacto (`[SKIP]`), a menos que `--force` tenha sido passado explicitamente.

---

## Passo 4: Gerar ou Emendar `xspec/constitution.md`

1. **Se `xspec/constitution.md` ainda NÃO existir (ou com `--force`):**
   - Se o projeto for **Greenfield** e a stack não puder ser inferida dos arquivos, faça até **2 perguntas diretas** ao usuário sobre a stack e restrições principais antes de gravar.
   - Leia `xspec/templates/constitution.md`.
   - Substitua todos os placeholders (`{{PROJECT_NAME}}`, `{{TECH_LANGUAGES}}`, `{{TECH_FRAMEWORKS}}`, `{{TECH_DATABASE}}`, `{{TECH_PACKAGE_MANAGER}}`, `{{ARCH_STRUCTURE}}`, `{{ARCH_NAMING}}`) pelos dados reais do projeto.
   - Defina `Version: 1.0.0` e preencha `Ratified` e `Last Amended` com a data atual (`YYYY-MM-DD`).
   - Grave `xspec/constitution.md`.

2. **Se `xspec/constitution.md` JÁ existir:**
   - **Se o usuário pediu explicitamente uma emenda** (ex.: `/xspec-init amend ...` ou descreveu novos princípios):
     - Aplique o versionamento semântico (`MAJOR.MINOR.PATCH` — MAJOR para remoção/redefinição incompatível de princípio; MINOR para novo princípio; PATCH para ajustes de redação).
     - Atualize `Last Amended` para a data atual e registre o *Sync Impact Report* no comentário HTML do topo.
   - **Caso contrário:** preserve `xspec/constitution.md` intacto (`[SKIP]`).

---

## Passo 5: Mapear Living Specs Iniciais (Apenas Projetos Brownfield)

Se o projeto for **Brownfield** e `xspec/specs/` estiver vazio:
1. Identifique as capacidades coesas de comportamento existentes no código (nomes em `kebab-case`, como `user-auth`, `billing`, `cli`, `notifications`).
2. Apresente a lista proposta ao usuário e **peça confirmação em uma única pergunta** antes de gerar os arquivos (a menos que o usuário tenha passado `--yes`).
3. Para cada capacidade confirmada, crie `xspec/specs/<capability>/spec.md` seguindo `xspec/templates/living-spec.md`:
   - `# <capability> Specification`
   - `## Purpose` com **no mínimo 50 caracteres** descrevendo o propósito atual da capacidade.
   - `## Requirements` contendo blocos `### Requirement: <Name>` (corpo com `SHALL` ou `MUST` e no máximo **500 caracteres**) e cenários `#### Scenario: <Name>` (`- **GIVEN**`, `- **WHEN**`, `- **THEN**`).
   - **Nunca** inclua cabeçalhos de delta (`## ADDED/MODIFIED/REMOVED/RENAMED Requirements`) dentro de `xspec/specs/`.
4. **Validação Determinística:** Execute `node xspec/bin/xspec.mjs doctor --fix` (ou `node bin/xspec.mjs doctor --fix` se estiver na raiz do próprio repositório X-Spec) para validar a estrutura de diretórios, `config.yaml`, `constitution.md` e as Living Specs iniciais.

---

## Passo 6: Relatório de Conclusão

Apresente um resumo objetivo contendo:
- Status de `xspec/config.yaml` e `xspec/constitution.md` (criados, atualizados ou preservados).
- Comandos de verificação registrados em `verification.commands`.
- Capacidades mapeadas em `xspec/specs/` (se brownfield).
- Próximo passo: `/xspec-define <descrição da sua feature>`.
