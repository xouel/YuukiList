---
description: "X-Spec Etapa 3 (BUILD): Implementa as tarefas de tasks.md, marca [x] em tempo real, consome report.md (DIVERGED) de forma idempotente e registra desvios no Drift Log"
---

# X-Spec — Etapa 3: BUILD (`/xspec-build`)

**Entrada do usuário:** considere qualquer texto, número de grupo/tarefa ou flags escritos pelo usuário após o comando (ou em `$ARGUMENTS` / `{{args}}` quando substituídos pela ferramenta). Se o placeholder aparecer literal, utilize o texto da mensagem do usuário.

Você está executando a etapa **BUILD** do framework **X-Spec** (implementação rastreável de tarefas e testes).

---

## Passo 1: Identificar Mudança Ativa e Carregar Fontes de Verdade

1. **Selecionar a mudança em `xspec/changes/` (ignorando `archive/`):**
   - Se o argumento trouxer o ID da mudança (ex.: `001` ou `001-add-dark-mode`), selecione-a.
   - Se houver **exatamente 1 pasta ativa**, selecione-a automaticamente e anuncie: `"Usando mudança: <id-mudanca>"`.
   - Se houver **mais de 1 pasta ativa**, liste-as e pergunte qual o usuário deseja construir.
2. **Verificar pré-requisitos:**
   - Confirme que `xspec/changes/<id-mudanca>/tasks.md` existe. Se não existir, pare e oriente o usuário a executar `/xspec-plan`.
3. **Carregar contexto completo:**
   - `xspec/config.yaml` e `xspec/constitution.md`.
   - `xspec/changes/<id-mudanca>/proposal.md`, `specs/**`, `design.md` (se existir), `tasks.md` e `report.md` (se existir).

---

## Passo 2: Consumo Idempotente de `report.md` (`DIVERGED`)

Verifique se existe `xspec/changes/<id-mudanca>/report.md`:

- **Se existir `report.md` com `- **Verdict:** \`DIVERGED\`` E `- **State:** \`OPEN\``:**
  1. Leia todos os itens bloqueantes (`B1`, `B2`...) da seção `## 2. Findings & Blocking Items` do `report.md` e o número do `Round` (`<R>`).
  2. No arquivo `tasks.md`, identifique o maior número de grupo `## N. ...` já existente e crie um **novo grupo numerado** (imediatamente antes de `## Analysis`):
     ```markdown
     ## <N+1>. Corrective Round <R> (Convergence)

     - [ ] <N+1>.1 <descrição acionável para resolver B1> (Ref: report B1 / <Source Ref>)
     - [ ] <N+1>.2 <descrição acionável para resolver B2> (Ref: report B2 / <Source Ref>)
     ```
     *(Atenção: o ID de cada tarefa DEVE começar com `<N+1>.` para manter a numeração consistente.)*
  3. **Marcação de Idempotência Imediata:** atualize imediatamente o cabeçalho de `report.md` trocando `- **State:** \`OPEN\`` por `- **State:** \`ADDRESSED\``.
- **Se `report.md` já estiver com `- **State:** \`ADDRESSED\`` (ou `CLOSED`):**
  - **Ignore o `report.md` e NÃO crie um novo grupo corretivo** (isso garante idempotência caso `/xspec-build` seja executado em múltiplas sessões antes do próximo `/xspec-close`).

---

## Passo 3: Determinar Escopo de Execução e Estratégia de Contexto (Bounded Runs & Subagentes)

Analise o argumento do usuário (descontado o nome da mudança, se informado):
- **Sem filtro de fase/tarefa:** execute todas as tarefas pendentes (`- [ ]`) em ordem sequencial de dependência.
- **Execução por Fase / Grupo (ex.: `1` ou `fase 2`):** execute apenas as tarefas pendentes (`- [ ]`) do grupo `## <N>.` indicado, marque `[x]` e pare (evitando exaustão da janela de contexto em features grandes).
- **Execução por Intervalo ou Tarefa Única (ex.: `2.1-2.3` ou `2.1`):** execute estritamente o intervalo ou a tarefa indicada, marque `[x]` e pare.
- **Delegação de Tarefas Paralelas `[P]` para Subagentes:** se o usuário pedir para usar subagentes (ex.: `"delegue tarefas [P] para subagentes"`) e o seu ambiente suportar subagentes, delegue cada tarefa marcada com `[P]` a um subagente passando apenas o contexto necessário (a tarefa, os requisitos/cenários referenciados e o trecho relevante do `design.md`), mantendo o contexto principal enxuto.

---

## Passo 4: Implementação Incremental e Drift Log

Para cada tarefa `- [ ] N.M` do escopo selecionado:

1. **Implementar e Verificar:**
   - Escreva ou modifique o código-fonte e os testes seguindo as decisões de `design.md` (se existir), os cenários `GIVEN/WHEN/THEN` de `specs/` e as regras de `xspec/constitution.md`.
   - Execute a verificação prevista na própria descrição da tarefa.
2. **Marcação Imediata no `tasks.md` e Atualização da `## Traceability Matrix`:**
   - Assim que concluir a tarefa, edite imediatamente `xspec/changes/<id-mudanca>/tasks.md` trocando `- [ ] N.M` por `- [x] N.M`.
   - Na tabela `## Traceability Matrix` de 9 colunas, atualize as colunas `Code Files` e `Test Files` com os caminhos relativos reais dos arquivos criados/modificados e registre o atestado semântico (`caminho/arquivo:linha`) na coluna `Evidence & Attestation` (mantendo `Exec Result` como `PENDING` até a execução determinística do `xspec verify`).
3. **Registro de Desvios Técnicos (`## Drift Log`):**
   - Se uma restrição real do código exigir alterar um caminho de arquivo, assinatura de função ou escolha técnica prevista em `design.md` ou `tasks.md` (sem violar os requisitos de negócio), adicione um item de lista simples (`- ...`, **sem checkbox**) na seção `## Drift Log` do `tasks.md` explicando o que mudou e por quê.
4. **Bloqueio de Regra de Negócio ou Constituição:**
   - Se encontrar um impedimento que torne impossível cumprir um cenário `GIVEN/WHEN/THEN` de `specs/` ou um princípio `MUST` da `xspec/constitution.md`, **pare imediatamente**, mantenha a tarefa como `- [ ]` e pergunte ao usuário como proceder antes de alterar qualquer requisito.

---

## Passo 5: Verificação Opcional, Atualização de Status e Gate (`gates.after_build`)

1. **Verificação Determinística durante o Build:**
   - Execute `node xspec/bin/xspec.mjs validate --stage build --change <id-mudanca>` para validar a integridade de `tasks.md`, arquivos referenciados e a `## Traceability Matrix`.
   - Se `verification.run_on_build: true` em `xspec/config.yaml` e houver comandos em `verification.commands`, execute `node xspec/bin/xspec.mjs verify --change <id-mudanca>`.
2. **Atualizar Status da Mudança:**
   - Conte o total de tarefas concluídas (`X/Y [x]`) em `tasks.md`.
   - Se `X < Y`: atualize o status para `IN_PROGRESS` no cabeçalho do `proposal.md` e em `.xspec.yaml` (`status: IN_PROGRESS`).
   - Se `X == Y` (100% concluídas): atualize o status para `BUILT` no cabeçalho do `proposal.md` e em `.xspec.yaml` (`status: BUILT`).
3. **Transição de Fluxo (`gates.after_build`):**
   - **Se 100% das tarefas estiverem `[x]` (`BUILT`) E `gates.after_build: false`:**
     - Leia e execute imediatamente `xspec/commands/close.md` na mesma resposta.
   - **Caso contrário:**
     - Exiba o progresso (`X/Y tarefas concluídas`), liste os arquivos criados/alterados e eventuais entradas adicionadas ao `## Drift Log`.
     - Se `X == Y`, oriente o usuário a executar `/xspec-close` para auditar a convergência e arquivar a mudança.
