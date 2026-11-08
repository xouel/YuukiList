/**
 * X-Spec Engine v2.0.1 — Diagnóstico de Saúde e Auto-Reparo (`xspec doctor [--fix]`)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import { resolveContainedPath, readTextFileSafe } from '../security/path-guard.mjs';
import { discoverSpecCapabilities, loadAndValidateConfig } from '../validators/artifact-validator.mjs';
import { validateMergedLivingSpec } from '../transaction/delta-merger.mjs';
import { inspectMergeLock, LockStates } from '../concurrency/lock-manager.mjs';
import { findPendingJournals, recoverWorkspace } from '../recovery/recovery-manager.mjs';
import { validateAgentBridges } from '../validators/bridge-validator.mjs';
import {
  ErrorCodes,
  Severities,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../errors/codes.mjs';

/**
 * Executa diagnóstico completo do repositório e aplica reparos seguros quando `fix: true`.
 */
export function runDoctor(rootDir, { fix = false } = {}) {
  const diagnostics = [];
  const checks = [];
  const repairs = [];

  // 1. Node.js Runtime (>=22.0.0)
  const nodeVersion = process.versions.node || '0.0.0';
  const major = Number.parseInt(nodeVersion.split('.')[0], 10);
  if (Number.isNaN(major) || major < 22) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E010_VERIFICATION_FAILED,
        severity: Severities.CRITICAL,
        file: 'node',
        line: 1,
        message: `Node.js >= 22.0.0 is required (detected v${nodeVersion}).`,
        fix: 'Upgrade Node.js to v22 LTS or v24 LTS.',
      })
    );
    checks.push({ id: 'node_runtime', status: 'FAIL', version: nodeVersion });
  } else {
    checks.push({ id: 'node_runtime', status: 'PASS', version: nodeVersion });
  }

  // 2. Estrutura de Diretórios Operacionais
  const requiredDirs = [
    'xspec/specs',
    'xspec/changes/archive',
    '.xspec/evidence',
    '.xspec/locks',
    '.xspec/journal',
  ];
  const missingDirs = [];
  for (const relDir of requiredDirs) {
    const absDir = resolveContainedPath(rootDir, relDir);
    if (!fs.existsSync(absDir)) {
      if (fix) {
        fs.mkdirSync(absDir, { recursive: true });
        repairs.push({ action: 'created_directory', path: relDir });
      } else {
        missingDirs.push(relDir);
      }
    }
  }
  if (missingDirs.length > 0) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E004_MISSING_REFERENCE,
        severity: Severities.HIGH,
        file: missingDirs[0],
        line: 1,
        message: `Missing operational directories: ${missingDirs.join(', ')}.`,
        fix: "Run 'xspec doctor --fix' or '/xspec-init' to create required directories.",
      })
    );
    checks.push({ id: 'directories', status: 'FAIL', missing: missingDirs });
  } else {
    checks.push({ id: 'directories', status: 'PASS', missing: [] });
  }

  // 3. Configuração e Constituição (se xspec/config.yaml existir)
  const configAbs = resolveContainedPath(rootDir, 'xspec/config.yaml');
  if (fs.existsSync(configAbs)) {
    const { diagnostics: cfgDiags } = loadAndValidateConfig(rootDir);
    if (cfgDiags.length > 0) {
      diagnostics.push(...cfgDiags);
      checks.push({ id: 'config', status: 'FAIL' });
    } else {
      checks.push({ id: 'config', status: 'PASS' });
    }

    const constRaw = readTextFileSafe(rootDir, 'xspec/constitution.md', { allowMissing: true });
    if (!constRaw || constRaw.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: 'xspec/constitution.md',
          line: 1,
          message: "Missing or empty 'xspec/constitution.md'.",
          fix: "Create 'xspec/constitution.md' via '/xspec-init'.",
        })
      );
      checks.push({ id: 'constitution', status: 'FAIL' });
    } else {
      checks.push({ id: 'constitution', status: 'PASS' });
    }
  } else {
    checks.push({ id: 'config', status: 'SKIP', note: 'xspec/config.yaml not initialized yet' });
  }

  // 4. Integridade das Living Specs em xspec/specs/
  const capabilities = discoverSpecCapabilities(rootDir, 'xspec/specs');
  let livingSpecsHealthy = true;
  for (const cap of capabilities) {
    const relSpec = `xspec/specs/${cap}/spec.md`;
    try {
      const content = readTextFileSafe(rootDir, relSpec);
      validateMergedLivingSpec(cap, content);
    } catch (err) {
      livingSpecsHealthy = false;
      diagnostics.push(
        err.toDiagnostic
          ? err.toDiagnostic()
          : createDiagnostic({
              code: ErrorCodes.E003_INVALID_SCENARIO,
              severity: Severities.HIGH,
              file: relSpec,
              line: 1,
              message: err.message,
            })
      );
    }
  }
  checks.push({
    id: 'living_specs',
    status: livingSpecsHealthy ? 'PASS' : 'FAIL',
    count: capabilities.length,
  });

  // 5. Locks e Transações Pendentes (.xspec/locks/ & .xspec/journal/)
  const lockInfo = inspectMergeLock(rootDir);
  const pendingJournals = findPendingJournals(rootDir);

  if (lockInfo.status !== LockStates.NO_LOCK || pendingJournals.length > 0) {
    if (fix && (lockInfo.isOrphan || lockInfo.status === LockStates.NO_LOCK)) {
      const recEnv = recoverWorkspace(rootDir, { recoverLock: lockInfo.isOrphan });
      if (recEnv.ok) {
        if (lockInfo.isOrphan) {
          repairs.push({ action: 'recovered_orphan_lock', status: lockInfo.status });
        }
        for (const tx of recEnv.data?.recovered_transactions || []) {
          repairs.push({
            action: 'recovered_transaction',
            transaction_id: tx.transaction_id,
            state: tx.state,
          });
        }
        checks.push({ id: 'transactions_and_locks', status: 'PASS', repaired: true });
      } else {
        diagnostics.push(...recEnv.diagnostics);
        checks.push({ id: 'transactions_and_locks', status: 'FAIL' });
      }
    } else {
      if (lockInfo.status !== LockStates.NO_LOCK) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E008_LOCK_BUSY,
            severity: Severities.CRITICAL,
            file: '.xspec/locks/merge.lock',
            line: 1,
            target: lockInfo.status,
            message: `Merge lock present (status: ${lockInfo.status}).`,
            fix: lockInfo.isOrphan
              ? "Run 'xspec doctor --fix' or 'xspec recover --recover-lock' to clean up the orphan lock."
              : 'Wait for the active merge process to complete.',
          })
        );
      }
      for (const pj of pendingJournals) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E009_TRANSACTION_PENDING,
            severity: Severities.CRITICAL,
            file: `.xspec/journal/${pj.transaction_id}.json`,
            line: 1,
            target: pj.state,
            message: `Pending interrupted transaction '${pj.transaction_id}' in state '${pj.state}'.`,
            fix: "Run 'xspec doctor --fix' or 'xspec recover'.",
          })
        );
      }
      checks.push({
        id: 'transactions_and_locks',
        status: 'FAIL',
        lock_status: lockInfo.status,
        pending_journals: pendingJournals.map((j) => j.transaction_id),
      });
    }
  } else {
    checks.push({ id: 'transactions_and_locks', status: 'PASS' });
  }

  // 6. Pontes de Agentes (se presentes no repositório)
  if (fs.existsSync(path.join(rootDir, '.agents', 'skills'))) {
    const bridgeRes = validateAgentBridges(rootDir);
    if (!bridgeRes.ok) {
      diagnostics.push(...bridgeRes.diagnostics);
      checks.push({ id: 'agent_bridges', status: 'FAIL', checked_count: bridgeRes.checked_count });
    } else {
      checks.push({ id: 'agent_bridges', status: 'PASS', checked_count: bridgeRes.checked_count });
    }
  }

  const envelope = createDiagnosticEnvelope({
    command: 'doctor',
    diagnostics,
    data: {
      checks,
      repairs,
    },
  });

  return {
    ok: envelope.ok,
    exit_code: envelope.ok ? 0 : 1,
    envelope,
  };
}
