# Spec Delta

## Purpose
<!-- OBRIGATÓRIO APENAS PARA CAPACIDADES NOVAS (mínimo de 50 caracteres descrevendo o propósito da capacidade).
     REMOVA esta seção `## Purpose` se a capacidade já existir em `xspec/specs/<capability-path>/spec.md`. -->
{{NEW_CAPABILITY_PURPOSE_MIN_50_CHARS}}

## ADDED Requirements

### Requirement: {{REQUIREMENT_NAME}}
<!-- Obrigatório: conter SHALL ou MUST em inglês maiúsculo e ter no máximo 500 caracteres. -->
O sistema SHALL {{NORMATIVE_BEHAVIOR_DESCRIPTION}}.

#### Scenario: {{SCENARIO_NAME}}
<!-- Obrigatório: usar exatamente 4 hashtags (#### Scenario:) e passos WHEN + THEN. -->
- **GIVEN** {{INITIAL_STATE}}
- **WHEN** {{TRIGGER_ACTION}}
- **THEN** {{EXPECTED_OUTCOME}}

<!--
Use as seções abaixo apenas quando aplicável (remova se não utilizar):

## MODIFIED Requirements

### Requirement: {{EXISTING_REQUIREMENT_EXACT_NAME}}
(Copie o bloco INTEIRO do requisito existente em `xspec/specs/<capability>/spec.md` — descrição com SHALL/MUST + todos os cenários que permanecem — e edite-o. Nunca escreva um MODIFIED parcial.)

#### Scenario: {{EXISTING_OR_UPDATED_SCENARIO}}
- **GIVEN** {{INITIAL_STATE}}
- **WHEN** {{TRIGGER_ACTION}}
- **THEN** {{EXPECTED_OUTCOME}}

## REMOVED Requirements

### Requirement: {{REMOVED_REQUIREMENT_EXACT_NAME}}
**Reason**: {{WHY_REMOVED}}
**Migration**: {{HOW_TO_MIGRATE_OR_REPLACE}}

## RENAMED Requirements

- FROM: `### Requirement: {{OLD_EXACT_NAME}}`
- TO: `### Requirement: {{NEW_EXACT_NAME}}`
-->
