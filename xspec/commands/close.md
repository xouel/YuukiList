---
description: "X-Spec Etapa 4 (CLOSE): Audita convergência (Completude, Corretude, Coerência, Constituição e Testes). Se CONVERGED, mescla deltas em xspec/specs/ e arquiva; se DIVERGED, grava report.md e para"
---

# X-Spec — Etapa 4: CLOSE (`/xspec-close`)

**Entrada do usuário:** considere qualquer texto ou flags escritos pelo usuário após o comando (ou em `$ARGUMENTS` / `{{args}}` quando substituídos pela ferramenta). Se o placeholder aparecer literal, utilize o texto da mensagem do usuário.

Você está executando a etapa **CLOSE** do framework **X-Spec** (auditoria de convergência, consolidação de Living Specs e arquivamento).

Esta etapa divide-se em **Fase A (Auditoria de Convergência)** e **Fase B (Consolidação das Living Specs e Arquivamento)**.

---

## Fase A: Auditoria de Convergência (Executada Integralmente)

Localize a mudança ativa em `xspec/changes/<id-mudanca>/` (via argumento ou seleção automática se houver 1 mudança ativa fora de `archive/`).
Execute **todos os 6 checks abaixo** (mesmo que um falhe antes, conclua os demais para que o diagnóstico seja completo):

### A1. Completude de Tarefas (`tasks.md`)
- Verifique todos os checkboxes em `xspec/changes/<id-mudanca>/tasks.md`.
- **PASS:** 0 tarefas pendentes (`- [ ]`) e pelo menos 1 tarefa concluída (`- [x]`).
- **FAIL:** Qualquer tarefa ainda não marcada como `[x]`.

### A2. Cobertura Comportamental de Requisitos e Cenários (`specs/`)
*(Se `.xspec.yaml` declarar `skip_specs: true` em mudança `refactor`, marque A2 como `PASS (skip_specs)`.)*
Para cada arquivo delta em `xspec/changes/<id-mudanca>/specs/<capability-path>/spec.md`:
- **Requisitos `ADDED` e `MODIFIED`:**
  - Inspecione o código-fonte e os testes reais do projeto.
  - Confirme com evidência (`caminho/arquivo:linha`) que cada `### Requirement:` e cada `#### Scenario:` (`GIVEN/WHEN/THEN`) foi efetivamente implementado e que nenhum comportamento contradiz a spec.
- **Requisitos `REMOVED` (Verificação Invertida):**
  - Leia o requisito original em `xspec/specs/<capability-path>/spec.md` para saber qual comportamento deveria desaparecer.
  - Busque no código-fonte e confirme que **nenhum caminho de código continua executando o comportamento removido**. Se ainda existir no código, registre um finding `CRITICAL` (`contradicts`).
- **Requisitos `RENAMED` (`FROM:` / `TO:`):**
  - Se o nome `TO` não estiver também em `MODIFIED`, confirme que o comportamento original continua implementado no código.

### A3. Conformidade Constitucional (`xspec/constitution.md`)
- Verifique todos os arquivos criados ou modificados contra os princípios `MUST` e restrições expressas de `xspec/constitution.md` (tipagem, segurança, dependências justificadas, escopo contido).
- Qualquer violação não justificada é classificada como `CRITICAL`.

### A4. Execução Determinística e Cofre de Evidências (`xspec verify`)
- Execute o motor determinístico de verificação e geração de evidências:
  ```bash
  node xspec/bin/xspec.mjs verify --change <id-mudanca>
  ```
- O motor executa a validação `pre-close`, roda cada comando de `verification.commands` via `spawnSync` (`shell: false`), atualiza `Exec Result` e `Evidence & Attestation` na `## Traceability Matrix` de `tasks.md` e grava `.xspec/evidence/<id-mudanca>/{validation,test-results,checksums}.json` com hashes SHA-256 dos artefatos.

### A5. Validação Estrutural de Fechamento (`xspec validate --stage close`)
- Execute:
  ```bash
  node xspec/bin/xspec.mjs validate --stage close --change <id-mudanca>
  ```
- Confirma `Why`, `Purpose`, `SHALL`/`MUST`, `#### Scenario:`, tarefas 100% `[x]`, Matriz de Rastreabilidade de 9 colunas com `Exec Result == PASS` e frescor SHA-256 das evidências em `.xspec/evidence/<id-mudanca>/`.

### A6. Pré-Checagem de Merge dos Deltas (Dry Run)
*(Pule se `skip_specs: true`.)*
Para cada delta em `xspec/changes/<id-mudanca>/specs/<capability-path>/spec.md`, verifique contra `xspec/specs/<capability-path>/spec.md`:
- Se a spec viva **ainda não existir** (capacidade nova): o delta só pode conter `## ADDED Requirements` (e `## Purpose`). Presença de `MODIFIED` ou `RENAMED` sem spec viva existente é falha (`FAIL`).
- Se a spec viva **já existir**:
  - Todo requisito listado em `## RENAMED Requirements` (`FROM`) deve existir na spec viva, e o nome `TO` não pode colidir com outro requisito existente.
  - Todo requisito listado em `## REMOVED Requirements` deve existir na spec viva.
  - Todo requisito listado em `## MODIFIED Requirements` deve existir na spec viva (considerando o nome pós-`RENAMED`, se aplicável).
  - Nenhum requisito listado em `## ADDED Requirements` pode ter o mesmo nome normalizado de um requisito já existente na spec viva.

---

## Decisão do Veredito (`DIVERGED` vs. `CONVERGED`)

### Caso 1: `VERDICT: DIVERGED` (Se QUALQUER item A1..A6 falhar)

1. **PROIBIDO ARQUIVAR OU MESCLAR:** Não altere `xspec/specs/` e não mova a pasta para `archive/`.
2. **Calcular o número do `Round`:**
   - Se já existir um `report.md` anterior na pasta da mudança, leia seu campo `Round` e incremente em `+1` (`Round: 2`, `Round: 3`...). Caso contrário, use `Round: 1`.
3. **Gravar `xspec/changes/<id-mudanca>/report.md`:**
   - Use o modelo `xspec/templates/report.md`.
   - Defina `- **Verdict:** \`DIVERGED\`` e `- **State:** \`OPEN\``.
   - Preencha a tabela `## 1. Audit Scorecard` (`A1` a `A6`) e liste na tabela `## 2. Findings & Blocking Items` cada pendência numerada (`B1`, `B2`...), classificando o `Gap Type` (`missing`, `partial`, `contradicts`, `unrequested`), a `Severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), a referência (`Source Ref`), a evidência (`file:line` ou erro de comando) e a ação corretiva exata.
4. **Atualizar Status da Mudança:**
   - Atualize `Status: \`DIVERGED\`` no cabeçalho do `proposal.md` e `status: DIVERGED` em `.xspec.yaml`.
5. **Relatar e Parar:**
   - Apresente no chat o resumo do `report.md` e **PARE IMEDIATAMENTE**, orientando o usuário a executar `/xspec-build` (que consumirá o `report.md` de forma idempotente e criará a rodada corretiva em `tasks.md`).

---

## Caso 2: `VERDICT: CONVERGED` (Se 100% dos itens A1..A6 passarem)

Execute integralmente a **Fase B** abaixo:

## Fase B: Consolidação das Living Specs e Arquivamento

1. **Atualizar Status e Relatório de Auditoria:**
   - Se existir um `report.md` na pasta da mudança, atualize-o para `- **Verdict:** \`CONVERGED\`` e `- **State:** \`CLOSED\``, mantendo o scorecard `PASS` como registro histórico.
   - Atualize o status em `proposal.md` para `Status: \`ARCHIVED\`` e em `.xspec.yaml` para `status: ARCHIVED`.

2. **Executar o Merge Transacional em 8 Estágios e o Arquivamento (`xspec merge`):**
   - Execute o motor transacional com Write-Ahead Journal e lock exclusivo (`wx`):
     ```bash
     node xspec/bin/xspec.mjs merge --change <id-mudanca>
     ```
     *(Use `--allow-dirty` apenas quando houver modificações locais legítimas fora das pastas protegidas da transação.)*
   - O motor executará automaticamente os 8 estágios (`PREPARING → VALIDATING → SNAPSHOTTING → STAGING → COMMIT_INTENT → APPLYING → VERIFYING → FINALIZING → COMPLETED`), aplicando os deltas (`RENAMED → REMOVED → MODIFIED → ADDED`) em `xspec/specs/` com escritas atômicas duráveis (`fsync` + `rename`) e movendo a mudança para `xspec/changes/archive/YYYY-MM-DD-<id-mudanca>/`.
   - Caso ocorra qualquer falha ou interrupção, execute `node xspec/bin/xspec.mjs recover` (ou `doctor --fix`) para restaurar o repositório de forma idempotente a partir dos snapshots.

3. **Relatório Final de Fechamento:**
   - Exiba o veredito `✅ CONVERGED & ARCHIVED`.
   - Liste cada capacidade atualizada em `xspec/specs/` com a contagem de requisitos adicionados, modificados, removidos ou renomeados.
   - Informe o caminho final do pacote arquivado em `xspec/changes/archive/YYYY-MM-DD-<id-mudanca>/`.
