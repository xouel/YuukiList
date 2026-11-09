/**
 * X-Spec Engine v2.0.1 — Parser e Validador da Matriz de Rastreabilidade Oficial (tasks.md — B3)
 * Zero-dependency module
 */

import fs from 'node:fs';
import { ErrorCodes, Severities, createDiagnostic } from '../errors/codes.mjs';
import { resolveContainedPath, hashFileSafe } from '../security/path-guard.mjs';

export const TRACEABILITY_HEADERS = Object.freeze([
  'Row ID',
  'Requirement',
  'Scenario',
  'Task IDs',
  'Code Files',
  'Test Files',
  'Verification Method',
  'Exec Result',
  'Evidence & Attestation',
]);

export const VALID_VERIFICATION_METHODS = Object.freeze([
  'unit-test',
  'integration-test',
  'e2e-test',
  'cli-check',
  'static-analysis',
  'manual-review',
  'automated-test',
  'static-check',
  'manual-artifact',
]);

const TEST_FILE_REQUIRED_METHODS = new Set([
  'unit-test',
  'integration-test',
  'e2e-test',
  'automated-test',
]);
const ROW_ID_RE = /^TR-\d{3,}$/;
const ATTESTATION_RE = /^(AI_AUDITED|HUMAN_VERIFIED):[a-zA-Z0-9_.-]+$/;

/**
 * Separa caminho base do arquivo de sufixos auxiliares de linha (:20 ou #L20-L35).
 */
export function parseFileReferenceToken(rawToken) {
  const token = String(rawToken || '').trim().replace(/^`+|`+$/g, '');
  const upper = token.toUpperCase();
  if (!token || token === '-' || upper === 'N/A' || upper === 'TBD' || upper === 'PENDING') {
    return null;
  }

  let filePath = token;
  let locator = null;

  const hashIdx = filePath.indexOf('#L');
  if (hashIdx !== -1) {
    locator = filePath.slice(hashIdx);
    filePath = filePath.slice(0, hashIdx);
  } else {
    // Suporta caminho/arquivo.ts:20 ou caminho/arquivo.ts:20-35 (sem quebrar C:/ no Windows)
    const colonMatch = filePath.match(/^(.+?):(\d+(?:-\d+)?)$/);
    if (colonMatch) {
      filePath = colonMatch[1];
      locator = `:${colonMatch[2]}`;
    }
  }

  return {
    raw: token,
    filePath: filePath.trim().replace(/\\/g, '/'),
    locator,
  };
}

export function parseFileReferenceList(cellValue) {
  if (!cellValue) return [];
  return String(cellValue)
    .split(',')
    .map((item) => parseFileReferenceToken(item))
    .filter(Boolean);
}

/**
 * Extrai e parseia a seção `## Traceability Matrix` de um AST de tasks.md.
 */
export function extractTraceabilityMatrix(tasksAst, tasksRelPath = 'tasks.md') {
  const diagnostics = [];
  const section = tasksAst.getSection(/^Traceability\s+Matrix$/i);

  if (!section) {
    return {
      exists: false,
      rows: [],
      diagnostics,
    };
  }

  if (section.tables.length === 0) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
        severity: Severities.CRITICAL,
        file: tasksRelPath,
        line: section.lineStart,
        message: "Section '## Traceability Matrix' exists but contains no valid Markdown table.",
        fix: `Add the 9-column Traceability Matrix table: | ${TRACEABILITY_HEADERS.join(' | ')} |`,
      })
    );
    return { exists: true, rows: [], diagnostics };
  }

  const table = section.tables[0];
  const headersMatch =
    table.headers.length === TRACEABILITY_HEADERS.length &&
    TRACEABILITY_HEADERS.every((h, idx) => table.headers[idx].toLowerCase() === h.toLowerCase());

  if (!headersMatch) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
        severity: Severities.CRITICAL,
        file: tasksRelPath,
        line: table.lineStart,
        message: `Invalid Traceability Matrix headers. Expected 9 columns: '${TRACEABILITY_HEADERS.join(' | ')}', found '${table.headers.join(' | ')}'.`,
        fix: `Use exact headers: | ${TRACEABILITY_HEADERS.join(' | ')} |`,
      })
    );
    return { exists: true, rows: [], diagnostics };
  }

  const rows = [];
  const seenRowIds = new Set();

  for (const rawRow of table.rows) {
    const [
      rowIdRaw,
      requirementRaw,
      scenarioRaw,
      taskIdsRaw,
      codeFilesRaw,
      testFilesRaw,
      methodRaw,
      execResultRaw,
      evidenceRaw,
    ] = rawRow.cells;

    const rowId = rowIdRaw.trim().replace(/^`+|`+$/g, '');
    const requirement = requirementRaw.trim().replace(/^`+|`+$/g, '').replace(/^R:\s*/i, '');
    const scenario = scenarioRaw.trim().replace(/^`+|`+$/g, '').replace(/^S:\s*/i, '');
    const taskIds = taskIdsRaw
      .split(',')
      .map((t) => t.trim().replace(/^`+|`+$/g, ''))
      .filter(Boolean);
    const codeFiles = parseFileReferenceList(codeFilesRaw);
    const testFiles = parseFileReferenceList(testFilesRaw);
    const method = methodRaw.trim().replace(/^`+|`+$/g, '').toLowerCase();
    const execResult = execResultRaw.trim().replace(/^`+|`+$/g, '').toUpperCase();

    // Evidence & Attestation: "<cmd-id> | <attestation>"
    const evParts = evidenceRaw
      .split('|')
      .map((p) => p.trim().replace(/^`+|`+$/g, ''))
      .filter(Boolean);
    const commandId = evParts[0] || null;
    const attestation = evParts[1] || null;

    if (!ROW_ID_RE.test(rowId)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.HIGH,
          file: tasksRelPath,
          line: rawRow.line,
          target: rowId || 'Row ID',
          message: `Invalid Row ID '${rowId}'. Must match 'TR-001' format (${ROW_ID_RE}).`,
          fix: 'Assign stable Row IDs such as TR-001, TR-002.',
        })
      );
    } else if (seenRowIds.has(rowId)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: rawRow.line,
          target: rowId,
          message: `Duplicate Row ID '${rowId}' in Traceability Matrix.`,
          fix: 'Ensure every row in ## Traceability Matrix has a unique Row ID.',
        })
      );
    } else {
      seenRowIds.add(rowId);
    }

    rows.push({
      line: rawRow.line,
      rowId,
      requirement,
      normalizedRequirement: requirement.toLowerCase(),
      scenario,
      normalizedScenario: scenario.toLowerCase(),
      taskIds,
      codeFiles,
      testFiles,
      method,
      execResult,
      commandId,
      attestation,
      rawEvidence: evidenceRaw.trim(),
    });
  }

  return {
    exists: true,
    tableLine: table.lineStart,
    rows,
    diagnostics,
  };
}

/**
 * Valida a Matriz de Rastreabilidade de acordo com a política do estágio e evidências reais (B3).
 */
export function validateTraceabilityMatrix({
  rootDir,
  tasksAst,
  tasksRelPath,
  expectedItems = [], // [{ requirement, scenario, capability }]
  definedTaskIds = new Map(), // Map<taskId, { checked, line }>
  policy = 'PROVEN_AND_ATTESTED',
  skipSpecs = false,
  evidenceBundle = null, // { testResults, checksums } carregado no estágio close
}) {
  if (policy === 'OPTIONAL' || skipSpecs) {
    return [];
  }

  const extracted = extractTraceabilityMatrix(tasksAst, tasksRelPath);
  const diagnostics = [...extracted.diagnostics];

  if (!extracted.exists) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
        severity: Severities.CRITICAL,
        file: tasksRelPath,
        line: 1,
        message: "Missing mandatory section '## Traceability Matrix' in tasks.md.",
        fix: 'Add ## Traceability Matrix with 9 columns covering all requirements and scenarios.',
      })
    );
    return diagnostics;
  }

  if (extracted.rows.length === 0 && expectedItems.length > 0) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
        severity: Severities.CRITICAL,
        file: tasksRelPath,
        line: extracted.tableLine || 1,
        message: 'Traceability Matrix has 0 rows, but delta specs define requirements and scenarios.',
        fix: 'Populate one row per Requirement/Scenario pair in ## Traceability Matrix.',
      })
    );
    return diagnostics;
  }

  // 1. Verifica se todos os pares (Requirement, Scenario) dos deltas estão cobertos na matriz
  for (const exp of expectedItems) {
    const reqLower = exp.requirement.toLowerCase();
    const scenLower = exp.scenario.toLowerCase();
    const covered = extracted.rows.some(
      (r) => r.normalizedRequirement === reqLower && r.normalizedScenario === scenLower
    );
    if (!covered) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: extracted.tableLine || 1,
          target: `R:${exp.requirement} / S:${exp.scenario}`,
          message: `Requirement '${exp.requirement}' / Scenario '${exp.scenario}' (${exp.capability}) is missing from ## Traceability Matrix.`,
          fix: `Add a row in ## Traceability Matrix for R:${exp.requirement} and S:${exp.scenario}.`,
        })
      );
    }
  }

  // 2. Valida cada linha da matriz segundo a política do estágio
  for (const row of extracted.rows) {
    if (!VALID_VERIFICATION_METHODS.includes(row.method)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.HIGH,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Invalid Verification Method '${row.method}' in row ${row.rowId}. Allowed: ${VALID_VERIFICATION_METHODS.join(', ')}.`,
          fix: `Set Verification Method to one of: ${VALID_VERIFICATION_METHODS.join(', ')}.`,
        })
      );
    }

    if (row.taskIds.length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.HIGH,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} does not reference any Task IDs.`,
          fix: 'List at least one Task ID (e.g., 1.1, 2.1) in the Task IDs column.',
        })
      );
    } else {
      for (const tid of row.taskIds) {
        if (!definedTaskIds.has(tid)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: tasksRelPath,
              line: row.line,
              target: `${row.rowId} -> Task ${tid}`,
              message: `Traceability Matrix row ${row.rowId} references non-existent Task ID '${tid}'.`,
              fix: `Ensure task '${tid}' exists in tasks.md.`,
            })
          );
        }
      }
    }

    if (policy === 'PREPARED') {
      continue;
    }

    // No estágio BUILD (UPDATING), se todas as tasks da linha estão marcadas [x], exige Code Files preenchido
    const allRowTasksChecked =
      row.taskIds.length > 0 && row.taskIds.every((tid) => definedTaskIds.get(tid)?.checked === true);

    if (policy === 'UPDATING' && !allRowTasksChecked) {
      continue;
    }

    // Para UPDATING (tasks concluídas), FILES_EXIST (pre-close) e PROVEN_AND_ATTESTED (close):
    if (row.codeFiles.length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} has no Code Files listed.`,
          fix: 'Specify the relative path(s) of the implementation files in the Code Files column.',
        })
      );
    }

    if (TEST_FILE_REQUIRED_METHODS.has(row.method) && row.testFiles.length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} uses verification method '${row.method}' which requires at least one Test File.`,
          fix: 'Specify the test file path(s) in the Test Files column.',
        })
      );
    }

    if (policy === 'UPDATING') {
      continue;
    }

    // Verifica existência física de Code Files e Test Files no disco (FILES_EXIST e PROVEN_AND_ATTESTED)
    for (const cf of row.codeFiles) {
      try {
        const abs = resolveContainedPath(rootDir, cf.filePath);
        if (!fs.existsSync(abs) || !fs.lstatSync(abs).isFile()) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
              severity: Severities.CRITICAL,
              file: tasksRelPath,
              line: row.line,
              target: `${row.rowId} -> ${cf.filePath}`,
              message: `Code file '${cf.filePath}' referenced in row ${row.rowId} does not exist on disk.`,
              fix: `Create '${cf.filePath}' or update the path in ## Traceability Matrix.`,
            })
          );
        }
      } catch (err) {
        diagnostics.push(
          createDiagnostic({
            code: err.code || ErrorCodes.E011_SECURITY_VIOLATION,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${cf.filePath}`,
            message: err.message,
          })
        );
      }
    }

    for (const tf of row.testFiles) {
      try {
        const abs = resolveContainedPath(rootDir, tf.filePath);
        if (!fs.existsSync(abs) || !fs.lstatSync(abs).isFile()) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
              severity: Severities.CRITICAL,
              file: tasksRelPath,
              line: row.line,
              target: `${row.rowId} -> ${tf.filePath}`,
              message: `Test file '${tf.filePath}' referenced in row ${row.rowId} does not exist on disk.`,
              fix: `Create '${tf.filePath}' or update the path in ## Traceability Matrix.`,
            })
          );
        }
      } catch (err) {
        diagnostics.push(
          createDiagnostic({
            code: err.code || ErrorCodes.E011_SECURITY_VIOLATION,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${tf.filePath}`,
            message: err.message,
          })
        );
      }
    }

    if (policy === 'FILES_EXIST') {
      continue;
    }

    // Estágio CLOSE (PROVEN_AND_ATTESTED — B3):
    // 1. Exec Result deve ser PASS
    if (row.execResult !== 'PASS') {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} has Exec Result '${row.execResult}' (expected 'PASS' proven by 'xspec verify').`,
          fix: "Run 'node xspec/bin/xspec.mjs verify <change-id>' so the engine executes checks and records PASS.",
        })
      );
    }

    // 2. Evidence & Attestation deve conter <cmd-id> | <AI_AUDITED:...|HUMAN_VERIFIED:...>
    if (!row.commandId || !row.attestation || !ATTESTATION_RE.test(row.attestation)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} has invalid or unattested Evidence & Attestation '${row.rawEvidence}'. Expected '<cmd-id> | AI_AUDITED:<id>' or '<cmd-id> | HUMAN_VERIFIED:<id>'.`,
          fix: "Run 'xspec verify' and ensure semantic coverage is attested as 'cmd-0 | AI_AUDITED:round-1' or 'cmd-0 | HUMAN_VERIFIED:reviewer'.",
        })
      );
    }

    // 3. Vínculo com execução real em .xspec/evidence/<change-id>/ (proíbe PASS autodeclarado!)
    if (!evidenceBundle || !evidenceBundle.testResults || !evidenceBundle.checksums) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E010_VERIFICATION_FAILED,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: row.rowId,
          message: `Row ${row.rowId} declares PASS, but no verified evidence bundle exists in '.xspec/evidence/'. Self-declared PASS is forbidden.`,
          fix: "Run 'node xspec/bin/xspec.mjs verify <change-id>' to generate real execution evidence.",
        })
      );
      continue;
    }

    const cmdRecord = (evidenceBundle.testResults.commands || []).find((c) => c.id === row.commandId);
    if (!cmdRecord) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E010_VERIFICATION_FAILED,
          severity: Severities.CRITICAL,
          file: tasksRelPath,
          line: row.line,
          target: `${row.rowId} -> ${row.commandId}`,
          message: `Row ${row.rowId} references command ID '${row.commandId}', which does not exist in '.xspec/evidence/test-results.json'.`,
          fix: "Run 'node xspec/bin/xspec.mjs verify <change-id>' to bind rows to real executed commands.",
        })
      );
    } else {
      if (cmdRecord.status !== 'PASSED' || cmdRecord.exit_code !== 0) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E010_VERIFICATION_FAILED,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${row.commandId}`,
            message: `Command '${row.commandId}' referenced by row ${row.rowId} did not pass (status: ${cmdRecord.status}, exit_code: ${cmdRecord.exit_code}).`,
            fix: 'Fix the failing test/verification command and re-run xspec verify.',
          })
        );
      }
      if (Array.isArray(cmdRecord.verified_rows) && !cmdRecord.verified_rows.includes(row.rowId)) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E010_VERIFICATION_FAILED,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${row.commandId}`,
            message: `Row ${row.rowId} was not bound to execution '${row.commandId}' during 'xspec verify'.`,
            fix: "Re-run 'node xspec/bin/xspec.mjs verify <change-id>' after updating ## Traceability Matrix.",
          })
        );
      }
    }

    // 4. Verifica se os hashes SHA-256 atuais de Code Files e Test Files batem com checksums.json
    const codeChecksums = evidenceBundle.checksums.code_files || {};
    const testChecksums = evidenceBundle.checksums.test_files || {};

    for (const cf of row.codeFiles) {
      const currentHash = hashFileSafe(rootDir, cf.filePath, { allowMissing: true });
      const recordedHash = codeChecksums[cf.filePath];
      if (!recordedHash || currentHash !== recordedHash) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E010_VERIFICATION_FAILED,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${cf.filePath}`,
            message: `Stale evidence for code file '${cf.filePath}' in row ${row.rowId}: file was modified after 'xspec verify' ran.`,
            fix: "Re-run 'node xspec/bin/xspec.mjs verify <change-id>' to re-verify modified code files.",
          })
        );
      }
    }

    for (const tf of row.testFiles) {
      const currentHash = hashFileSafe(rootDir, tf.filePath, { allowMissing: true });
      const recordedHash = testChecksums[tf.filePath];
      if (!recordedHash || currentHash !== recordedHash) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E010_VERIFICATION_FAILED,
            severity: Severities.CRITICAL,
            file: tasksRelPath,
            line: row.line,
            target: `${row.rowId} -> ${tf.filePath}`,
            message: `Stale evidence for test file '${tf.filePath}' in row ${row.rowId}: file was modified after 'xspec verify' ran.`,
            fix: "Re-run 'node xspec/bin/xspec.mjs verify <change-id>' to re-verify modified test files.",
          })
        );
      }
    }
  }

  return diagnostics;
}
