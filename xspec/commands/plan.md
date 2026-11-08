---
description: "X-Spec Etapa 2 (PLAN): Gera design.md (condicional), tasks.md rastreável e executa a análise cruzada de consistência"
---

# X-Spec — Etapa 2: PLAN (`/xspec-plan`)

**Entrada do usuário:** considere qualquer texto ou flags escritos pelo usuário após o comando (ou em `$ARGUMENTS` / `{{args}}` quando substituídos pela ferramenta). Se o placeholder aparecer literal, utilize o texto da mensagem do usuário.

Você está executando a etapa **PLAN** do framework **X-Spec** (arquitetura técnica, plano de tarefas e análise cruzada de consistência).
**Regra Inegociável:** Nenhum código de produção pode ser escrito ou alterado nesta etapa.

---

## Passo 1: Localizar a Mudança Ativa e Carregar Contexto

1. **Selecionar a mudança em `xspec/changes/` (ignorando `archive/`):**
   - Se o usuário informou o ID ou prefixo (ex.: `001` ou `001-add-dark-mode`), selecione a pasta correspondente.
   - Caso contrário, se houver **exatamente 1 pasta ativa**, selecione-a automaticamente e informe: `"Usando mudança: <id-mudanca>"`.
   - Se houver **mais de 1 pasta ativa**, liste-as e pergunte qual o usuário deseja planejar.
   - Se **não houver nenhuma pasta ativa**, pare e oriente o usuário a executar `/xspec-define`.
2. **Carregar contexto obrigatório:**
   - `xspec/config.yaml` e `xspec/constitution.md`.
   - `xspec/changes/<id-mudanca>/.xspec.yaml`, `proposal.md` e todos os arquivos em `specs/`.
3. **Capturar Diretrizes Técnicas e Bibliotecas dos Argumentos:**
   - Se o usuário passou instruções técnicas, bibliotecas ou ferramentas na invocação do `/xspec-plan` (ex.: *"Use GSAP ScrollTrigger para o parallax, busque componentes no 21st.dev, use shadcn/ui ou Material UI"*), trate essas escolhas como **diretrizes técnicas prioritárias** para esta mudança (desde que não violem `xspec/constitution.md`).
4. **Inspecionar o código-fonte real:**
   - Analise os diretórios, módulos, tipos, `package.json`/manifestos e testes reais do repositório que serão criados ou modificados para garantir que o plano respeite a arquitetura existente e todos os princípios da `xspec/constitution.md`.

---

## Passo 2: Decidir e Gerar `design.md` (Condicional)

Verifique a chave `artifacts.design` em `xspec/config.yaml` (`auto` | `always` | `never`):
- **`never`:** não crie `design.md`.
- **`always`:** crie `xspec/changes/<id-mudanca>/design.md`.
- **`auto` (padrão):** crie `xspec/changes/<id-mudanca>/design.md` se **qualquer** uma das condições abaixo for verdadeira:
  1. Mais de 1 capacidade é afetada pela mudança;
  2. Há introdução de nova dependência externa (ex.: biblioteca de animação, 3D, UI kit) ou mudança relevante em modelo de dados / banco;
  3. Há criação ou alteração de contrato público (API, CLI, eventos, schemas compartilhados);
  4. Há impacto de segurança, autenticação, performance ou migração/rollback;
  5. Há decisão arquitetural entre alternativas (ou integração de bibliotecas passadas nos argumentos do `/xspec-plan`) que precisa ficar documentada antes de codificar.

Quando `design.md` for criado:
- Use o modelo `xspec/templates/design.md`.
- Preencha `## Context`, `## Goals / Non-Goals`, `## Decisions` (com alternativas consideradas e justificativa), `## Risks / Trade-offs`, `## Migration Plan` e `## Touch-Points (Arquivos Impactados)` (`[CREATE]`, `[MODIFY]`, `[DELETE]`).
- **Contratos Front ↔ Back / Entre Módulos:** Sempre que a mudança envolver comunicação entre Frontend e Backend (ou entre pacotes de um monorepo), documente explicitamente o contrato da interface (formato de entrada/saída, códigos de erro, estados de loading/timeout e idempotência) em `design.md` antes das tarefas de implementação de cada lado.
- Se `artifacts.technical_docs: true` estiver ativo em `xspec/config.yaml`, inclua e preencha também as seções `## Data Model`, `## Contracts` e `## Research`.

---

## Passo 3: Gerar `tasks.md` (Fases Numeradas + Rastreabilidade)

Leia o modelo `xspec/templates/tasks.md` e crie `xspec/changes/<id-mudanca>/tasks.md`:

1. **Grupos Numerados Obrigatórios:**
   - Organize as tarefas sob cabeçalhos de nível 2 numerados: `## 1. Setup & Foundational`, `## 2. Core Implementation (<User Stories>)`, `## 3. Validation & Integration` (ou um grupo numerado por User Story `P1`, `P2`...).
   - No grupo `## 1. Setup & Foundational`, inclua explicitamente tarefas para instalar pacotes ainda ausentes no projeto, configurar plugins (ex.: GSAP `ScrollTrigger`, CSS layers entre Tailwind e bibliotecas de UI) ou buscar/gerar componentes externos (ex.: `shadcn`, `21st.dev`) necessários para as fases seguintes.
2. **Formato, Paralelismo `[P]` e Numeração das Tarefas:**
   - Toda tarefa dentro de `## N. <Nome do Grupo>` **DEVE** ser um checkbox com ID numérico começando por `N.`:
     ```markdown
     - [ ] 1.1 <descrição acionável com caminho do arquivo e como verificar> (Ref: R:<Requirement> / S:<Scenario>)
     - [ ] 2.1 [P] [US1] <tarefa em arquivo independente que pode rodar em paralelo> (Ref: R:<Requirement> / S:<Scenario>)
     ```
   - Marque com `[P]` tarefas que tocam arquivos diferentes e não dependem de tarefas não concluídas da mesma fase (permitindo delegação para subagentes no `/xspec-build`).
   - **Proibido** colocar tarefa `1.x` dentro do grupo `## 2.` ou repetir IDs de tarefa.
3. **Rastreabilidade, Cobertura 100% e `## Traceability Matrix` (9 Colunas):**
   - Cada tarefa deve terminar com `(Ref: R:<Requirement> / S:<Scenario>)` (ou `(Ref: US1 / SC-001)` em mudanças `refactor` com `skip_specs: true`).
   - Todo `### Requirement:` e todo `#### Scenario:` dos deltas em `specs/` deve ser coberto por pelo menos uma tarefa.
   - Preencha a seção `## Traceability Matrix` em `tasks.md` com **exatamente 9 colunas** (`| Row ID | Requirement | Scenario | Task IDs | Code Files | Test Files | Verification Method | Exec Result | Evidence & Attestation |`), inicializando `Code Files`, `Test Files`, `Exec Result` e `Evidence & Attestation` com `` `PENDING` `` e definindo `Verification Method` como `` `automated-test` ``, `` `static-check` `` ou `` `manual-artifact` ``.
   - Se `tdd.mode: "required"` ou `"optional"` estiver configurado em `xspec/config.yaml`, posicione a tarefa de criação do teste automatizado de cada cenário **antes** da tarefa de implementação correspondente.
   - Inclua os testes e a verificação de cada entrega dentro do próprio grupo que a constrói, deixando o grupo final apenas para validação integrada de ponta a ponta.

---

## Passo 4: Executar a Análise Cruzada de Consistência

Antes de finalizar o `tasks.md`, execute os 6 passes de verificação cruzada entre `proposal.md`, `specs/`, `design.md` (se existir), `tasks.md` e `xspec/constitution.md`:
1. **Cobertura (Coverage Gaps):** Algum requisito, cenário ou `SC-###` ficou sem tarefa associada? Alguma tarefa não tem referência?
2. **Alinhamento Constitucional (Constitution Check):** Alguma decisão ou tarefa viola um princípio `MUST` da `xspec/constitution.md` (ex.: nova dependência sem justificativa, refatoração fora de escopo)?
3. **Inconsistência (Inconsistency):** Há divergência de nomes de entidades, arquivos ou termos entre `proposal.md`, `specs/`, `design.md` e `tasks.md`?
4. **Subespecificação / Ambiguidade:** Restou algum placeholder (`TODO`, `TBD`, `{{...}}`) ou adjetivo vago sem critério verificável?
5. **Duplicação:** Há requisitos ou tarefas duplicados?
6. **Conflitos entre Mudanças Ativas:** Outra mudança ativa em `xspec/changes/` modifica ou remove o mesmo requisito?

**Autocorreção imediata:**
- Se encontrar qualquer falha nos passes acima que possa ser corrigida no próprio plano/tarefas, corrija `design.md` e `tasks.md` agora mesmo antes de concluir.
- Se encontrar uma violação constitucional ou lacuna de requisito que exija decisão do usuário, destaque-a como **CRITICAL** e pergunte ao usuário.
- Preencha a seção `## Analysis` no final do `tasks.md` com a tabela de cobertura (`Requirement / Scenario | Tasks | Status`) e o resumo dos checks.
- **ATENÇÃO:** **NUNCA** utilize checkboxes (`- [ ]` ou `- [x]`) dentro de `## Analysis` ou `## Drift Log`, para preservar a contagem precisa de tarefas de implementação.

---

## Passo 5: Atualizar Status, Validar e Aplicar Gate (`gates.after_plan`)

1. Atualize o status da mudança para `PLANNED`:
   - No cabeçalho de `xspec/changes/<id-mudanca>/proposal.md` (`Status: \`PLANNED\``).
   - No arquivo `xspec/changes/<id-mudanca>/.xspec.yaml` (`status: PLANNED`).
2. Execute a detecção determinística de conflitos e a validação do estágio `plan`:
   ```bash
   node xspec/bin/xspec.mjs conflicts --change <id-mudanca>
   node xspec/bin/xspec.mjs validate --stage plan --change <id-mudanca>
   ```
   Se houver qualquer erro estrutural ou de rastreabilidade (`!= 0`), corrija imediatamente e reexecute até obter `PASS`.
3. **Transição de Fluxo (`gates.after_plan`):**
   - **Se `gates.after_plan: false` (ou com `--fast`):**
     - Leia e execute imediatamente `xspec/commands/build.md` na mesma resposta.
   - **Se `gates.after_plan: true`:**
     - Apresente o resumo do plano (se `design.md` foi gerado, total de grupos e tarefas em `tasks.md` e resultado da `## Analysis`).
     - Oriente o usuário a revisar o plano e executar `/xspec-build` quando estiver de acordo.
