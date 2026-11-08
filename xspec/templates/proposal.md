# Proposal: {{TITLE}}

> **X-Spec** · ID: `{{CHANGE_ID}}` · Type: `{{feature|bugfix|refactor}}` · Status: `DEFINED` · Created: `{{DATE}}`

## Why

<!-- Obrigatório (X-Spec): 50 a 1000 caracteres explicando o problema ou oportunidade e por que resolvê-lo agora. -->
{{WHY_MOTIVATION}}

## What Changes

<!-- Obrigatório (X-Spec): lista de alterações de alto nível. Marque quebras de compatibilidade com **BREAKING**. -->
- {{CHANGE_BULLET_1}}

## Capabilities

### New Capabilities
<!-- Capacidades novas introduzidas por esta mudança. Use nomes em kebab-case (ex: user-auth ou billing/invoices).
     Cada uma criará `specs/<capability-path>/spec.md` (com seção `## Purpose` obrigatória). Deixe vazio ("Nenhuma.") se não houver. -->
- `{{new-capability-path}}`: {{BRIEF_DESCRIPTION}}

### Modified Capabilities
<!-- Capacidades já existentes em `xspec/specs/` cujos REQUISITOS mudam.
     Use exatamente o caminho existente. Se nenhuma spec mudar (tipo `refactor`), defina `skip_specs: true` em `.xspec.yaml`. -->
- `{{existing-capability-path}}`: {{WHAT_CHANGES_IN_REQUIREMENTS}}

## Impact

<!-- Código, APIs, dependências, banco de dados ou sistemas afetados. -->
{{IMPACT_SUMMARY}}

## User Stories

<!-- Histórias de usuário priorizadas (P1 = MVP crítico, P2, P3), cada uma testável de forma independente. -->

### US1 — {{STORY_TITLE}} (Priority: P1)
{{USER_JOURNEY_DESCRIPTION}}

- **Why this priority:** {{PRIORITY_RATIONALE}}
- **Independent Test:** {{HOW_TO_TEST_INDEPENDENTLY}}

## Success Criteria

<!-- Resultados mensuráveis e agnósticos de implementação. -->
- **SC-001**: {{MEASURABLE_OUTCOME_1}}

## Edge Cases

- {{EDGE_CASE_1}}

## Out of Scope

- {{OUT_OF_SCOPE_1}}

## Clarifications

### Session {{DATE}}
- Q: {{QUESTION_OR_ASSUMPTION}} → A: {{ACCEPTED_ANSWER}}
