/**
 * X-Spec Engine v2.0.1 — Catálogo Estável de Códigos de Erro e Envelope de Diagnóstico
 * Zero-dependency module
 */

export const ENGINE_VERSION = '2.0.1';
export const CURRENT_SCHEMA_VERSION = 2;
export const SUPPORTED_SCHEMA_VERSIONS = Object.freeze([1, 2]);

export const ErrorCodes = Object.freeze({
  E001_INVALID_YAML: 'E001_INVALID_YAML',
  E002_MISSING_PURPOSE: 'E002_MISSING_PURPOSE',
  E003_INVALID_SCENARIO: 'E003_INVALID_SCENARIO',
  E004_MISSING_REFERENCE: 'E004_MISSING_REFERENCE',
  E005_TRACEABILITY_INCOMPLETE: 'E005_TRACEABILITY_INCOMPLETE',
  E006_CONCURRENCY_CONFLICT: 'E006_CONCURRENCY_CONFLICT',
  E007_MERGE_FAILED: 'E007_MERGE_FAILED',
  E008_LOCK_BUSY: 'E008_LOCK_BUSY',
  E009_TRANSACTION_PENDING: 'E009_TRANSACTION_PENDING',
  E010_VERIFICATION_FAILED: 'E010_VERIFICATION_FAILED',
  E011_SECURITY_VIOLATION: 'E011_SECURITY_VIOLATION',
  E012_GIT_DIRTY_STATE: 'E012_GIT_DIRTY_STATE',
});

export const Severities = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
});

const DEFAULT_SEVERITY_BY_CODE = Object.freeze({
  [ErrorCodes.E001_INVALID_YAML]: Severities.CRITICAL,
  [ErrorCodes.E002_MISSING_PURPOSE]: Severities.HIGH,
  [ErrorCodes.E003_INVALID_SCENARIO]: Severities.HIGH,
  [ErrorCodes.E004_MISSING_REFERENCE]: Severities.HIGH,
  [ErrorCodes.E005_TRACEABILITY_INCOMPLETE]: Severities.CRITICAL,
  [ErrorCodes.E006_CONCURRENCY_CONFLICT]: Severities.CRITICAL,
  [ErrorCodes.E007_MERGE_FAILED]: Severities.CRITICAL,
  [ErrorCodes.E008_LOCK_BUSY]: Severities.CRITICAL,
  [ErrorCodes.E009_TRANSACTION_PENDING]: Severities.CRITICAL,
  [ErrorCodes.E010_VERIFICATION_FAILED]: Severities.CRITICAL,
  [ErrorCodes.E011_SECURITY_VIOLATION]: Severities.CRITICAL,
  [ErrorCodes.E012_GIT_DIRTY_STATE]: Severities.HIGH,
});

export class XSpecError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {object} [details]
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'XSpecError';
    this.code = code;
    this.severity = details.severity || DEFAULT_SEVERITY_BY_CODE[code] || Severities.CRITICAL;
    this.file = details.file ?? null;
    this.line = details.line ?? null;
    this.column = details.column ?? null;
    this.target = details.target ?? null;
    this.fix = details.fix ?? null;
  }

  toDiagnostic() {
    const diag = {
      code: this.code,
      severity: this.severity,
      message: this.message,
    };
    if (this.file !== null) diag.file = this.file;
    if (this.line !== null) diag.line = this.line;
    if (this.column !== null) diag.column = this.column;
    if (this.target !== null) diag.target = this.target;
    if (this.fix !== null) diag.fix = this.fix;
    return diag;
  }
}

/**
 * Cria um objeto de diagnóstico estruturado.
 */
export function createDiagnostic({
  code,
  severity,
  message,
  file = null,
  line = null,
  column = null,
  target = null,
  fix = null,
}) {
  if (!ErrorCodes[code]) {
    throw new Error(`Unknown X-Spec diagnostic code: ${code}`);
  }
  const diag = {
    code,
    severity: severity || DEFAULT_SEVERITY_BY_CODE[code] || Severities.HIGH,
    message,
  };
  if (file !== null) diag.file = String(file).replace(/\\/g, '/');
  if (line !== null) diag.line = Number(line);
  if (column !== null) diag.column = Number(column);
  if (target !== null) diag.target = String(target);
  if (fix !== null) diag.fix = String(fix);
  return diag;
}

/**
 * Determina quais severidades bloqueiam o fechamento/arquivamento de acordo com o perfil.
 */
export function isBlockingDiagnostic(diagnostic, profile = 'standard', blockArchiveOnHigh = true) {
  const sev = diagnostic.severity;
  if (sev === Severities.CRITICAL) return true;
  if (profile === 'strict') {
    return sev === Severities.HIGH || sev === Severities.MEDIUM;
  }
  if (profile === 'standard') {
    return blockArchiveOnHigh ? sev === Severities.HIGH : false;
  }
  // minimal: bloqueia apenas CRITICAL
  return false;
}

/**
 * Constrói o envelope JSON padrão de resposta do X-Spec Engine.
 */
export function createDiagnosticEnvelope({
  command,
  stage = null,
  changeId = null,
  schemaVersion = CURRENT_SCHEMA_VERSION,
  profile = 'standard',
  blockArchiveOnHigh = true,
  diagnostics = [],
  data = null,
}) {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  let hasBlocking = false;
  for (const d of diagnostics) {
    const key = String(d.severity || 'HIGH').toLowerCase();
    if (key in counts) counts[key] += 1;
    if (isBlockingDiagnostic(d, profile, blockArchiveOnHigh)) {
      hasBlocking = true;
    }
  }

  const envelope = {
    ok: !hasBlocking,
    command,
    ...(stage !== null ? { stage } : {}),
    engine_version: ENGINE_VERSION,
    schema_version: schemaVersion,
    ...(changeId !== null ? { change_id: changeId } : {}),
    timestamp: new Date().toISOString(),
    summary: {
      critical: counts.critical,
      high: counts.high,
      medium: counts.medium,
      low: counts.low,
      verdict: hasBlocking ? 'DIVERGED' : 'CONVERGED',
    },
    diagnostics,
  };

  if (data !== null) {
    envelope.data = data;
  }

  return envelope;
}
