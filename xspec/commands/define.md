---
description: "X-Spec Etapa 1 (DEFINE): Executa Clarification Gate e cria a mudança NNN-slug com .xspec.yaml, proposal.md e deltas specs/"
---

# X-Spec — Etapa 1: DEFINE (`/xspec-define`)

**Entrada do usuário:** considere qualquer texto ou flags escritos pelo usuário após o comando (ou em `$ARGUMENTS` / `{{args}}` quando substituídos pela ferramenta). Se o placeholder aparecer literal, utilize o texto da mensagem do usuário.

Você está executando a etapa **DEFINE** do framework **X-Spec** (descoberta, clarificação, proposta e especificação de deltas).
**Regra Inegociável:** Nenhum código de produção pode ser escrito ou alterado nesta etapa.

---

## Passo 1: Verificar Inicialização e Carregar Configurações

1. Verifique se `xspec/config.yaml` e `xspec/constitution.md` existem. Se faltarem, pare imediatamente e oriente o usuário a executar `/xspec-init`.
2. Leia `xspec/config.yaml` e `xspec/constitution.md`.
3. Aplique os padrões do `profile` (`minimal`, `standard` ou `strict`), deixando chaves explícitas de `xspec/config.yaml` prevalecerem.
4. Se a entrada do usuário contiver `--fast`, trate `gates.after_define` e `gates.after_plan` como `false` para esta execução.

---

## Passo 2: Classificar o Tipo de Mudança

Classifique o pedido do usuário em uma das 3 categorias:
1. **`feature`** (nova funcionalidade ou alteração de comportamento observável):
   - Fluxo completo com `proposal.md` e deltas em `specs/<capability>/spec.md`.
2. **`bugfix`** (correção de defeito/regressão):
   - Fluxo com `proposal.md` documentando causa-raiz e `specs/<capability>/spec.md` adicionando cenário de teste de regressão em `MODIFIED Requirements`.
3. **`refactor`** (mudança interna de código, arquitetura ou testes sem alteração de comportamento externo):
   - Fluxo com `proposal.md` e `skip_specs: true` em `.xspec.yaml`.

---

## Passo 3: Analisar o Contexto Vivo (`xspec/specs/` e Mudanças Ativas)

1. Liste e leia as especificações existentes em `xspec/specs/` para identificar:
   - Quais capacidades já existem (use sempre o caminho exato existente ao modificar uma capacidade, evitando criar nomes quase duplicados).
   - Quais capacidades novas precisarão ser criadas.
2. Inspecione `xspec/changes/` (ignorando `archive/`) para verificar se alguma mudança ativa já está alterando as mesmas capacidades e anote potenciais sobreposições.

---

## Passo 4: Clarification Gate

Avalie o pedido contra escopo funcional, modelo de dados, fluxo de interação/erros, requisitos não-funcionais e casos de borda:

- **Filtre o que importa:** Só gere perguntas cujas respostas alterem **escopo, regras de negócio, comportamento observável ou critérios de aceite**. Detalhes puramente internos de implementação ficam para o `/xspec-plan`.
- **Se `clarify.enabled: true` E houver ambiguidades relevantes ainda não respondidas no chat:**
  1. **PROIBIDO CRIAR ARQUIVOS:** Não crie nenhuma pasta nem arquivo em `xspec/changes/` ainda.
  2. Resuma em 2 linhas o entendimento inicial da mudança.
  3. Apresente até `clarify.max_questions` perguntas (padrão: 3), seguindo o formato recomendado:
     - Enunciado claro terminado em `?` + 1 frase curta de *"Por que importa:"*.
     - Indique a sua recomendação no topo: `**Recomendado:** Opção A — <justificativa curta>` (ou `**Sugerido:** <resposta curta>`).
     - Liste as opções (`A`, `B`, `C`...) e informe que o usuário pode responder apenas com a letra, dizer `"recomendado"` / `"sim"`, ou dar outra resposta curta.
  4. **Pare e aguarde a resposta do usuário.**
- **Se `clarify.enabled: false` OU `clarify.mode: "assume"` OU se o escopo já estiver claro (ou após o usuário responder):**
  - Prossiga para o Passo 5 (registrando eventuais suposições ou as respostas recebidas na seção `## Clarifications` do `proposal.md`).

---

## Passo 5: Criar a Pasta da Mudança e Gerar os Artefatos

1. **Calcular o identificador sequencial (`<prefix><NNN>-<slug>`):**
   - Leia `naming.prefix` (padrão `""`) e `naming.digits` (padrão `3`) em `xspec/config.yaml`.
   - Inspecione as pastas em `xspec/changes/` (padrão `^<prefix>(\d+)-`) e em `xspec/changes/archive/` (padrão `^\d{4}-\d{2}-\d{2}-<prefix>(\d+)-`).
   - Calcule o próximo número sequencial (ex.: `001` se for a primeira mudança).
   - Gere um `<slug>` curto em `kebab-case` iniciado por verbo (ex.: `001-add-dark-mode`, `002-update-invoice-export`).
   - Se `git.branch_per_change: true` e o repositório Git estiver limpo, crie/troque para a branch conforme `git.branch_pattern`.
   - Crie o diretório `xspec/changes/<id-mudanca>/`.

2. **Gravar `.xspec.yaml`:**
   ```yaml
   created: YYYY-MM-DD
   type: feature # feature | bugfix | refactor
   status: DEFINED
   ```
   *(Se o tipo for `refactor`, adicione também `skip_specs: true`.)*

3. **Gerar `proposal.md`:**
   - Leia `xspec/templates/proposal.md`.
   - Preencha todas as seções no idioma configurado (`language`), mantendo os cabeçalhos em inglês:
     - `## Why`: **entre 50 e 1.000 caracteres**.
     - `## What Changes`: lista objetiva (marque quebras com `**BREAKING**`).
     - `## Capabilities`: liste `### New Capabilities` e `### Modified Capabilities` com os caminhos exatos em `kebab-case`.
     - `## Impact`: arquivos, APIs, banco ou dependências impactados.
     - `## User Stories`: histórias priorizadas (`P1`, `P2`, `P3`), cada uma com `**Independent Test:**`.
     - `## Success Criteria`: critérios mensuráveis `SC-001`, `SC-002`...
     - `## Edge Cases`, `## Out of Scope` e `## Clarifications` (`### Session YYYY-MM-DD` com `- Q: ... → A: ...`).

4. **Gerar Deltas de Especificação (`specs/<capability-path>/spec.md`):**
   - *(Pule este item apenas se a mudança for `refactor` com `skip_specs: true`.)*
   - Leia `xspec/templates/spec.md`.
   - Para cada capacidade listada em `## Capabilities` do `proposal.md`, crie `xspec/changes/<id-mudanca>/specs/<capability-path>/spec.md` cumprindo rigorosamente as regras estruturais:
     - **Se for uma capacidade NOVA (`New Capabilities`):** inclua obrigatoriamente a seção `## Purpose` no topo com **50 ou mais caracteres**.
     - **Se for uma capacidade EXISTENTE (`Modified Capabilities`):** **NÃO** inclua `## Purpose`.
     - Utilize apenas os cabeçalhos de operação em inglês: `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`, `## RENAMED Requirements`.
     - Em cada `### Requirement: <Name>` de `ADDED` ou `MODIFIED`:
       - O texto descritivo (antes do primeiro cenário) **DEVE conter `SHALL` ou `MUST`** em inglês maiúsculo (ex.: `O sistema SHALL validar...`) e ter **no máximo 500 caracteres**.
       - Inclua pelo menos um cenário com **exatamente 4 hashtags**: `#### Scenario: <Name>`, contendo `- **GIVEN**` (opcional), `- **WHEN**` (obrigatório) e `- **THEN**` (obrigatório).
     - **Regra Crítica para `MODIFIED Requirements`:** abra `xspec/specs/<capability-path>/spec.md`, copie o bloco **INTEIRO** do requisito original (cabeçalho `### Requirement:`, descrição e todos os cenários existentes) para dentro de `## MODIFIED Requirements` e só então edite-o.
     - Para `REMOVED Requirements`: inclua `**Reason**:` e `**Migration**:`.
     - Para `RENAMED Requirements`: use pares consecutivos `- FROM: \`### Requirement: <Antigo>\`` e `- TO: \`### Requirement: <Novo>\``.

---

## Passo 6: Capturar Snapshot Base SHA-256, Validar (`stage=define`) e Aplicar Gate (`gates.after_define`)

1. **Snapshot Base e Validação Determinística:**
   - Execute no terminal:
     ```bash
     node xspec/bin/xspec.mjs snapshot-base --change <id-mudanca>
     node xspec/bin/xspec.mjs validate --stage define --change <id-mudanca>
     ```
     *(Se estiver executando dentro do próprio repositório do X-Spec, use `node bin/xspec.mjs ...`.)*
   - O motor gravará `touched_capabilities` e `base_specs` (hashes SHA-256 das Living Specs em `xspec/specs/`) dentro de `.xspec.yaml` e validará:
     - `Why`: 50 a 1.000 caracteres.
     - `Purpose`: ≥ 50 caracteres apenas em novas capabilities.
     - `SHALL`/`MUST`: presente no corpo de cada requisito (≤ 500 caracteres).
     - `#### Scenario:`: 4 hashtags com passos `WHEN` e `THEN`.
   - Se o validador retornar código `!= 0`, corrija os arquivos apontados em `findings` e reexecute até obter `PASS`.

2. **Transição de Fluxo (`gates.after_define`):**
   - **Se `gates.after_define: false` (ou com `--fast`):**
     - Leia e execute imediatamente `xspec/commands/plan.md` na mesma resposta.
   - **Se `gates.after_define: true`:**
     - Apresente um resumo conciso da proposta (`proposal.md`), das capacidades/cenários criados em `specs/` e do status da validação.
     - Oriente o usuário a revisar os arquivos e executar `/xspec-plan` para gerar o design e as tarefas.
