/**
 * X-Spec Engine v2.0.1 — Matriz de Regras de Validação por Estágio (incluindo pre-close sem circularidade - B3)
 * Zero-dependency module
 */

export const ValidationStages = Object.freeze({
  DEFINE: 'define',
  PLAN: 'plan',
  BUILD: 'build',
  PRE_CLOSE: 'pre-close',
  CLOSE: 'close',
});

export const STAGE_RULES = Object.freeze({
  [ValidationStages.DEFINE]: Object.freeze({
    stage: ValidationStages.DEFINE,
    requireProposal: true,
    requireSpecs: true,
    requireTasks: false,
    checkboxPolicy: 'IGNORED',
    traceabilityPolicy: 'OPTIONAL',
    requireRealEvidence: false,
  }),
  [ValidationStages.PLAN]: Object.freeze({
    stage: ValidationStages.PLAN,
    requireProposal: true,
    requireSpecs: true,
    requireTasks: true,
    checkboxPolicy: 'HAS_PENDING',
    traceabilityPolicy: 'PREPARED',
    requireRealEvidence: false,
  }),
  [ValidationStages.BUILD]: Object.freeze({
    stage: ValidationStages.BUILD,
    requireProposal: true,
    requireSpecs: true,
    requireTasks: true,
    checkboxPolicy: 'IN_PROGRESS',
    traceabilityPolicy: 'UPDATING',
    requireRealEvidence: false,
  }),
  [ValidationStages.PRE_CLOSE]: Object.freeze({
    stage: ValidationStages.PRE_CLOSE,
    requireProposal: true,
    requireSpecs: true,
    requireTasks: true,
    checkboxPolicy: 'ALL_CHECKED',
    traceabilityPolicy: 'FILES_EXIST',
    requireRealEvidence: false,
  }),
  [ValidationStages.CLOSE]: Object.freeze({
    stage: ValidationStages.CLOSE,
    requireProposal: true,
    requireSpecs: true,
    requireTasks: true,
    checkboxPolicy: 'ALL_CHECKED',
    traceabilityPolicy: 'PROVEN_AND_ATTESTED',
    requireRealEvidence: true,
  }),
});

export function getStageRules(stage = ValidationStages.CLOSE) {
  const normalized = String(stage || ValidationStages.CLOSE).trim().toLowerCase();
  const rules = STAGE_RULES[normalized];
  if (!rules) {
    throw new Error(
      `Invalid validation stage '${stage}'. Supported stages: ${Object.values(ValidationStages).join(', ')}`
    );
  }
  return rules;
}
