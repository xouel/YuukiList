/**
 * X-Spec Engine v2.0.1 — Execução de Verificação e Persistência Durável de Evidências (.xspec/evidence/<id>/ — B3)
 * Zero-dependency module
 */

import fs from 'node:fs';
import {
  ErrorCodes,
  Severities,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../errors/codes.mjs';
import {
  readTextFileSafe,
  writeFileDurable,
  hashFileSafe,
  resolveContainedPath,
} from '../security/path-guard.mjs';
import { runVerifiedCommand } from '../security/command-runner.mjs';
import { parseMarkdownDocument } from '../parser/markdown-ast.mjs';
import { extractTraceabilityMatrix, TRACEABILITY_HEADERS } from './matrix-parser.mjs';
import {
  loadAndValidateConfig,
  discoverSpecCapabilities,
  validateChange,
} from '../validators/artifact-validator.mjs';
import { ValidationStages } from '../validators/stage-matrix.mjs';

/**
 * Atualiza deterministicamente as colunas `Exec Result` e `Evidence & Attestation`
 * na seção `## Traceability Matrix` de `tasks.md`.
 */
export function updateTraceabilityMatrixInTasksMarkdown(tasksMarkdown, rowUpdatesByRowId) {
  const normalized = tasksMarkdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const ast = parseMarkdownDocument(normalized);
  const extracted = extractTraceabilityMatrix(ast);

  if (!extracted.exists || extracted.rows.length === 0) {
    return normalized;
  }

  for (const row of extracted.rows) {
    const update = rowUpdatesByRowId.get(row.rowId);
    if (!update) continue;

    const lineIdx = row.line - 1;
    const cells = [
      row.rowId,
      `R:${row.requirement}`,
      `S:${row.scenario}`,
      row.taskIds.join(', '),
      row.codeFiles.map((c) => c.raw).join(', ') || '-',
      row.testFiles.map((t) => t.raw).join(', ') || '-',
      row.method,
      update.execResult,
      `${update.commandId} \\| ${update.attestation}`,
    ];
    lines[lineIdx] = `| ${cells.join(' | ')} |`;
  }

  return lines.join('\n');
}

/**
 * Coleta todos os caminhos de artefatos da mudança para registro em checksums.json.
 */
export function collectChangeArtifactPaths(rootDir, changeId) {
  const changeRelDir = `xspec/changes/${changeId}`;
  const candidates = [
    `${changeRelDir}/.xspec.yaml`,
    `${changeRelDir}/proposal.md`,
    `${changeRelDir}/design.md`,
    `${changeRelDir}/tasks.md`,
  ];

  const existing = [];
  for (const rel of candidates) {
    const abs = resolveContainedPath(rootDir, rel);
    if (fs.existsSync(abs) && fs.lstatSync(abs).isFile()) {
      existing.push(rel);
    }
  }

  const caps = discoverSpecCapabilities(rootDir, `${changeRelDir}/specs`);
  for (const cap of caps) {
    existing.push(`${changeRelDir}/specs/${cap}/spec.md`);
  }

  return existing.sort();
}

/**
 * Executa o fluxo de verificação determinística (B3 & G2):
 * 1. Valida a mudança no estágio `pre-close` (sem dependência circular de evidência).
 * 2. Executa os comandos configurados em `xspec/config.yaml` via `spawnSync` (`shell: false`).
 * 3. Atualiza `Exec Result` e o vínculo `cmd-id` na `## Traceability Matrix` de `tasks.md`.
 * 4. Calcula hashes SHA-256 de todos os artefatos, `Code Files` e `Test Files`.
 * 5. Grava de forma durável `.xspec/evidence/<changeId>/{validation,test-results,checksums}.json`.
 */
export function verifyAndRecordEvidence({
  rootDir,
  changeId,
  attestationTag = null, // ex: "AI_AUDITED:round-1" ou "HUMAN_VERIFIED:dev"
}) {
  // Passo 1: Pré-validação estrutural sem circularidade (STAGE_PRE_CLOSE)
  const preCloseEnvelope = validateChange({
    rootDir,
    changeId,
    stage: ValidationStages.PRE_CLOSE,
  });

  if (!preCloseEnvelope.ok) {
    return {
      ...preCloseEnvelope,
      command: 'verify',
    };
  }

  const { config } = loadAndValidateConfig(rootDir);
  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;
  const timeoutMs = config?.verification?.timeout_ms || 120_000;

  // Coleta lista de comandos de verificação + tdd.test_command
  const rawCommands = [];
  if (Array.isArray(config?.verification?.commands)) {
    for (const c of config.verification.commands) {
      if (typeof c === 'string' && c.trim().length > 0) {
        rawCommands.push(c.trim());
      } else if (typeof c === 'object' && c !== null) {
        rawCommands.push(c);
      }
    }
  }
  const tddCmd = typeof config?.tdd?.test_command === 'string' ? config.tdd.test_command.trim() : '';
  if (tddCmd && !rawCommands.includes(tddCmd)) {
    rawCommands.push(tddCmd);
  }

  const tasksRel = `xspec/changes/${changeId}/tasks.md`;
  const tasksRaw = readTextFileSafe(rootDir, tasksRel);
  const tasksAst = parseMarkdownDocument(tasksRaw, { file: tasksRel });
  const extractedMatrix = extractTraceabilityMatrix(tasksAst, tasksRel);
  const allRowIds = extractedMatrix.rows.map((r) => r.rowId);

  // Passo 2: Execução real via spawnSync (G2)
  const executedCommands = [];
  let overallStatus = 'NOT_CONFIGURED';

  if (rawCommands.length > 0) {
    overallStatus = 'PASSED';
    for (let i = 0; i < rawCommands.length; i += 1) {
      const cmdId = `cmd-${i}`;
      const record = runVerifiedCommand({
        rootDir,
        commandSpec: rawCommands[i],
        id: cmdId,
        timeoutMs,
        verifiedRows: allRowIds,
      });
      executedCommands.push(record);
      if (record.status === 'ENV_ERROR') {
        overallStatus = 'ENV_ERROR';
      } else if (record.status === 'FAILED' && overallStatus !== 'ENV_ERROR') {
        overallStatus = 'FAILED';
      }
    }
  }

  // Passo 3: Atualiza tasks.md com o resultado real da execução (nunca autodeclarado pelo agente)
  const primaryCmdId = executedCommands.length > 0 ? executedCommands[0].id : 'cmd-none';
  const execCellResult =
    overallStatus === 'PASSED'
      ? 'PASS'
      : overallStatus === 'NOT_CONFIGURED'
      ? 'NOT_CONFIGURED'
      : 'FAIL';

  const rowUpdates = new Map();
  for (const row of extractedMatrix.rows) {
    const chosenAttestation =
      attestationTag ||
      (row.attestation && row.attestation !== 'PENDING_ATTESTATION'
        ? row.attestation
        : 'PENDING_ATTESTATION');
    rowUpdates.set(row.rowId, {
      execResult: execCellResult,
      commandId: primaryCmdId,
      attestation: chosenAttestation,
    });
  }

  const updatedTasksMarkdown = updateTraceabilityMatrixInTasksMarkdown(tasksRaw, rowUpdates);
  writeFileDurable(rootDir, tasksRel, updatedTasksMarkdown);

  // Passo 4: Calcula checksums SHA-256 de todos os artefatos, code_files e test_files
  const artifactPaths = collectChangeArtifactPaths(rootDir, changeId);
  const artifactHashes = Object.create(null);
  for (const rel of artifactPaths) {
    artifactHashes[rel] = hashFileSafe(rootDir, rel);
  }

  const codeHashes = Object.create(null);
  const testHashes = Object.create(null);
  for (const row of extractedMatrix.rows) {
    for (const cf of row.codeFiles) {
      codeHashes[cf.filePath] = hashFileSafe(rootDir, cf.filePath);
    }
    for (const tf of row.testFiles) {
      testHashes[tf.filePath] = hashFileSafe(rootDir, tf.filePath);
    }
  }

  const nowIso = new Date().toISOString();
  const evidenceDirRel = `.xspec/evidence/${changeId}`;

  const testResultsPayload = {
    change_id: changeId,
    profile,
    executed_at: nowIso,
    overall_status: overallStatus,
    commands: executedCommands,
  };

  const checksumsPayload = {
    change_id: changeId,
    recorded_at: nowIso,
    artifacts: artifactHashes,
    code_files: codeHashes,
    test_files: testHashes,
  };

  writeFileDurable(rootDir, `${evidenceDirRel}/test-results.json`, JSON.stringify(testResultsPayload, null, 2));
  writeFileDurable(rootDir, `${evidenceDirRel}/checksums.json`, JSON.stringify(checksumsPayload, null, 2));

  // Passo 5: Executa validação final no estágio CLOSE e grava validation.json
  const closeEnvelope = validateChange({
    rootDir,
    changeId,
    stage: ValidationStages.CLOSE,
  });

  const finalEnvelope = createDiagnosticEnvelope({
    command: 'verify',
    stage: ValidationStages.CLOSE,
    changeId,
    schemaVersion,
    profile,
    blockArchiveOnHigh,
    diagnostics: closeEnvelope.diagnostics,
    data: {
      overall_status: overallStatus,
      evidence_dir: evidenceDirRel,
      commands_executed: executedCommands.length,
    },
  });

  writeFileDurable(rootDir, `${evidenceDirRel}/validation.json`, JSON.stringify(finalEnvelope, null, 2));
  return finalEnvelope;
}
