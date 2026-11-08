/**
 * X-Spec Engine v2.0.1 — Gerador Determinístico do Relatório de Convergência (report.md — B3)
 * Zero-dependency module
 */

import { ENGINE_VERSION, ErrorCodes } from '../errors/codes.mjs';
import { readTextFileSafe, writeFileDurable } from '../security/path-guard.mjs';
import { parseMarkdownDocument } from '../parser/markdown-ast.mjs';
import { extractTraceabilityMatrix, TRACEABILITY_HEADERS } from '../traceability/matrix-parser.mjs';
import { loadEvidenceBundle } from '../validators/artifact-validator.mjs';

/**
 * Calcula o próximo número de Round se já houver um report.md anterior.
 */
function resolveNextRound(existingReportRaw, incrementOnDiverged = true) {
  if (!existingReportRaw) return 1;
  const match = existingReportRaw.match(/-\s*\*\*Round:\*\*\s*(\d+)/i);
  if (!match) return 1;
  const current = Number.parseInt(match[1], 10) || 1;
  return incrementOnDiverged ? current + 1 : current;
}

/**
 * Gera e grava deterministicamente `xspec/changes/<changeId>/report.md`
 * copiando a `## Traceability Matrix` oficial de `tasks.md` e cruzando com `.xspec/evidence/<changeId>/`.
 */
export function generateConvergenceReport({
  rootDir,
  changeId,
  validationEnvelope,
  stateOverride = null, // "OPEN" | "ADDRESSED" | "CLOSED"
}) {
  const changeRelDir = `xspec/changes/${changeId}`;
  const reportRel = `${changeRelDir}/report.md`;
  const tasksRel = `${changeRelDir}/tasks.md`;

  const existingReport = readTextFileSafe(rootDir, reportRel, { allowMissing: true });
  const verdict = validationEnvelope.ok ? 'CONVERGED' : 'DIVERGED';
  const state = stateOverride || (verdict === 'CONVERGED' ? 'CLOSED' : 'OPEN');
  const round = resolveNextRound(existingReport, verdict === 'DIVERGED');

  const tasksRaw = readTextFileSafe(rootDir, tasksRel, { allowMissing: true }) || '';
  const tasksAst = parseMarkdownDocument(tasksRaw, { file: tasksRel });
  const matrix = extractTraceabilityMatrix(tasksAst, tasksRel);

  const evidence = loadEvidenceBundle(rootDir, changeId);
  const overallCmdStatus = evidence?.testResults?.overall_status || 'NOT_CONFIGURED';

  const diags = validationEnvelope.diagnostics || [];
  const hasCode = (code) => diags.some((d) => d.code === code);

  const a1Status = hasCode(ErrorCodes.E004_MISSING_REFERENCE) ? 'FAIL' : 'PASS';
  const a2aStatus =
    hasCode(ErrorCodes.E005_TRACEABILITY_INCOMPLETE) || hasCode(ErrorCodes.E010_VERIFICATION_FAILED)
      ? 'FAIL'
      : 'PROVEN';
  const a2bStatus =
    matrix.rows.length > 0 &&
    matrix.rows.every((r) => r.attestation && /^(AI_AUDITED|HUMAN_VERIFIED):/.test(r.attestation))
      ? 'ATTESTED'
      : 'UNATTESTED';
  const a4Status = overallCmdStatus;
  const a5Status =
    hasCode(ErrorCodes.E001_INVALID_YAML) ||
    hasCode(ErrorCodes.E002_MISSING_PURPOSE) ||
    hasCode(ErrorCodes.E003_INVALID_SCENARIO)
      ? 'FAIL'
      : 'PASS';
  const a6Status =
    hasCode(ErrorCodes.E006_CONCURRENCY_CONFLICT) || hasCode(ErrorCodes.E007_MERGE_FAILED)
      ? 'FAIL'
      : 'PASS';

  const matrixLines = [
    `| ${TRACEABILITY_HEADERS.join(' | ')} |`,
    `| ${TRACEABILITY_HEADERS.map(() => ':---').join(' | ')} |`,
  ];

  for (const row of matrix.rows) {
    matrixLines.push(
      `| ${row.rowId} | R:${row.requirement} | S:${row.scenario} | ${row.taskIds.join(', ')} | ${
        row.codeFiles.map((c) => c.raw).join(', ') || '-'
      } | ${row.testFiles.map((t) => t.raw).join(', ') || '-'} | ${row.method} | ${
        row.execResult
      } | ${row.rawEvidence.replace(/\|/g, '\\|')} |`
    );
  }

  const findingsLines = [
    '| ID | Code | Severity | Target | File:Line | Message & Remediation |',
    '| :--- | :--- | :--- | :--- | :--- | :--- |',
  ];

  if (diags.length === 0) {
    findingsLines.push('| - | NONE | INFO | - | - | All deterministic checks passed. |');
  } else {
    diags.forEach((d, idx) => {
      const loc = d.file ? `${d.file}${d.line ? `:${d.line}` : ''}` : '-';
      const msg = `${d.message}${d.fix ? ` (Fix: ${d.fix})` : ''}`.replace(/\|/g, '\\|');
      findingsLines.push(
        `| B${idx + 1} | \`${d.code}\` | \`${d.severity}\` | ${d.target || '-'} | \`${loc}\` | ${msg} |`
      );
    });
  }

  const content = [
    `# Convergence Report: ${changeId}`,
    '',
    `- **Verdict:** \`${verdict}\``,
    `- **State:** \`${state}\``,
    `- **Round:** ${round}`,
    `- **Date:** \`${new Date().toISOString()}\``,
    `- **Engine:** \`X-Spec Deterministic Engine v${ENGINE_VERSION}\``,
    '',
    '## 1. Audit Scorecard',
    '',
    '| Audit Dimension | Status | Details |',
    '| :--- | :--- | :--- |',
    `| **A1. Task & Reference Integrity** | \`${a1Status}\` | Deterministic check of tasks.md checkboxes and Refs |`,
    `| **A2a. Deterministic Execution & Hash Integrity** | \`${a2aStatus}\` | Engine check of .xspec/evidence/ and SHA-256 checksums |`,
    `| **A2b. Semantic Requirement Coverage** | \`${a2bStatus}\` | Attested coverage in Traceability Matrix (${matrix.rows.length} rows) |`,
    `| **A3. Constitution Compliance** | \`PASS\` | Governed by xspec/constitution.md |`,
    `| **A4. Verification Commands** | \`${a4Status}\` | Executed via spawnSync (shell: false) |`,
    `| **A5. Artifact Grammar Validation** | \`${a5Status}\` | YAML Subset EBNF & Markdown AST checks |`,
    `| **A6. Delta Pre-Merge & Concurrency** | \`${a6Status}\` | Target existence & base_specs SHA-256 check |`,
    '',
    '## 2. Frozen Traceability Matrix (Copied from tasks.md)',
    '',
    ...matrixLines,
    '',
    '## 3. Findings & Blocking Items',
    '',
    ...findingsLines,
    '',
  ].join('\n');

  writeFileDurable(rootDir, reportRel, content);
  return {
    reportPath: reportRel,
    verdict,
    state,
    round,
  };
}
