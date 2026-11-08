/**
 * X-Spec Engine v2.0.1 — Gerenciador de Recuperação Transacional e Rollback Idempotente Orientado a Hashes (Entrega 6 / B1 & B2)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ErrorCodes,
  Severities,
  XSpecError,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../errors/codes.mjs';
import {
  resolveContainedPath,
  readTextFileSafe,
  writeFileDurable,
  hashFileSafe,
  syncParentDirectory,
} from '../security/path-guard.mjs';
import {
  releaseMergeLock,
  recoverOrphanMergeLock,
  inspectMergeLock,
  LockStates,
} from '../concurrency/lock-manager.mjs';
import { loadAndValidateConfig } from '../validators/artifact-validator.mjs';

export const JournalStates = Object.freeze({
  PREPARING: 'PREPARING',
  VALIDATING: 'VALIDATING',
  SNAPSHOTTING: 'SNAPSHOTTING',
  STAGING: 'STAGING',
  COMMIT_INTENT: 'COMMIT_INTENT',
  APPLYING: 'APPLYING',
  VERIFYING: 'VERIFYING',
  FINALIZING: 'FINALIZING',
  COMPLETED: 'COMPLETED',
  ABORTED: 'ABORTED',
  RECOVERY_REQUIRED: 'RECOVERY_REQUIRED',
  ROLLING_BACK: 'ROLLING_BACK',
  ROLLED_BACK: 'ROLLED_BACK',
  RECOVERY_FAILED: 'RECOVERY_FAILED',
});

export const OperationStatuses = Object.freeze({
  PENDING: 'PENDING',
  APPLY_INTENT: 'APPLY_INTENT',
  APPLIED: 'APPLIED',
  VERIFIED: 'VERIFIED',
  RESTORE_INTENT: 'RESTORE_INTENT',
  RESTORED: 'RESTORED',
});

export const TERMINAL_JOURNAL_STATES = new Set([
  JournalStates.COMPLETED,
  JournalStates.ABORTED,
  JournalStates.ROLLED_BACK,
]);

export const PRE_COMMIT_JOURNAL_STATES = new Set([
  JournalStates.PREPARING,
  JournalStates.VALIDATING,
  JournalStates.SNAPSHOTTING,
  JournalStates.STAGING,
]);

/**
 * Persiste o estado do journal no disco de forma atômica e durável (fsyncSync).
 */
export function saveJournalDurable(rootDir, journal) {
  journal.updated_at = new Date().toISOString();
  const relPath = `.xspec/journal/${journal.transaction_id}.json`;
  writeFileDurable(rootDir, relPath, JSON.stringify(journal, null, 2));
  return journal;
}

/**
 * Lista todos os journals em `.xspec/journal/` ordenados por criação.
 */
export function listJournals(rootDir) {
  const journalDirRel = '.xspec/journal';
  const absDir = resolveContainedPath(rootDir, journalDirRel);
  if (!fs.existsSync(absDir)) return [];

  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const journals = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const rel = `${journalDirRel}/${entry.name}`;
    const raw = readTextFileSafe(rootDir, rel, { allowMissing: true });
    if (!raw) continue;
    try {
      journals.push(JSON.parse(raw));
    } catch {
      // ignora arquivo temporário se houver
    }
  }
  return journals.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}

/**
 * Retorna todos os journals não finalizados (que exigem recuperação ou bloqueiam novas transações).
 */
export function findPendingJournals(rootDir) {
  return listJournals(rootDir).filter((j) => !TERMINAL_JOURNAL_STATES.has(j.state));
}

function removeDirectorySafe(rootDir, relDir) {
  if (!relDir) return;
  const abs = resolveContainedPath(rootDir, relDir);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    syncParentDirectory(path.dirname(abs));
  }
}

function removeFileSafe(rootDir, relFile) {
  const abs = resolveContainedPath(rootDir, relFile);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
    syncParentDirectory(path.dirname(abs));
  }
}

/**
 * Verifica se 100% das Living Specs e dos arquivos em `archive_target` já possuem `new_hash`,
 * permitindo Roll-Forward seguro quando uma falha ocorreu exatamente em `FINALIZING` (B1).
 */
function canRollForwardFinalizing(rootDir, journal) {
  for (const op of journal.operations || []) {
    if (op.type === 'SPEC_UPDATE' || op.type === 'SPEC_CREATE') {
      const currentHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
      if (currentHash !== op.new_hash) {
        return false;
      }
    }
  }

  const archiveManifest = journal.archive_manifest || {};
  const archiveKeys = Object.keys(archiveManifest);
  if (archiveKeys.length === 0) return false;

  for (const relInArchive of archiveKeys) {
    const fullArchiveFile = `${journal.archive_target}/${relInArchive}`;
    const currentHash = hashFileSafe(rootDir, fullArchiveFile, { allowMissing: true });
    if (currentHash !== archiveManifest[relInArchive]) {
      return false;
    }
  }

  return true;
}

/**
 * Recupera uma transação específica em qualquer estado (`PREPARING` .. `FINALIZING` e `ROLLING_BACK`)
 * aplicando comparação determinística de hashes SHA-256 (B1 & B2).
 */
export function recoverSingleTransaction(
  rootDir,
  journal,
  { faultHook = null, releaseLock = true } = {}
) {
  if (TERMINAL_JOURNAL_STATES.has(journal.state)) {
    return {
      transaction_id: journal.transaction_id,
      action: 'NO_OP',
      state: journal.state,
    };
  }

  if (journal.state === JournalStates.RECOVERY_FAILED) {
    throw new XSpecError(
      ErrorCodes.E009_TRANSACTION_PENDING,
      `Transaction '${journal.transaction_id}' is in RECOVERY_FAILED state: ${journal.failure_reason || 'manual intervention required'}. Snapshot preserved at '${journal.snapshot_dir}'.`,
      {
        file: `.xspec/journal/${journal.transaction_id}.json`,
        target: JournalStates.RECOVERY_FAILED,
        fix: `Inspect snapshot at '${journal.snapshot_dir}' and resolve external file conflicts before retrying.`,
      }
    );
  }

  // Caso 1: Interrupção antes de COMMIT_INTENT (nenhuma mutação autorizada nos alvos)
  if (PRE_COMMIT_JOURNAL_STATES.has(journal.state)) {
    for (const op of journal.operations || []) {
      if (op.type === 'SPEC_UPDATE' || op.type === 'SPEC_CREATE') {
        const currentHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
        if (currentHash !== op.original_hash) {
          journal.state = JournalStates.RECOVERY_FAILED;
          journal.failure_reason = `Unexpected modification on '${op.target}' during pre-commit state '${journal.state}'.`;
          saveJournalDurable(rootDir, journal);
          throw new XSpecError(
            ErrorCodes.E009_TRANSACTION_PENDING,
            journal.failure_reason,
            { file: op.target, target: JournalStates.RECOVERY_FAILED }
          );
        }
      }
    }

    removeDirectorySafe(rootDir, journal.staging_dir);
    journal.state = JournalStates.ABORTED;
    saveJournalDurable(rootDir, journal);

    if (releaseLock) {
      releaseMergeLock(rootDir, journal.lock_id || null);
    }

    return {
      transaction_id: journal.transaction_id,
      action: 'ABORTED_PRE_COMMIT',
      state: JournalStates.ABORTED,
    };
  }

  // Caso 2: Interrupção exatamente durante FINALIZING (B1)
  if (journal.state === JournalStates.FINALIZING) {
    if (canRollForwardFinalizing(rootDir, journal)) {
      if (typeof faultHook === 'function') {
        faultHook('RECOVER_FINALIZING_ROLL_FORWARD', { journal });
      }
      // Conclui a remoção idempotente da mudança ativa e do staging
      removeDirectorySafe(rootDir, journal.active_change_dir);
      removeDirectorySafe(rootDir, journal.staging_dir);

      for (const op of journal.operations || []) {
        op.status = OperationStatuses.VERIFIED;
      }
      journal.state = JournalStates.COMPLETED;
      saveJournalDurable(rootDir, journal);

      if (releaseLock) {
        releaseMergeLock(rootDir, journal.lock_id || null);
      }

      return {
        transaction_id: journal.transaction_id,
        action: 'FINALIZED_ROLL_FORWARD',
        state: JournalStates.COMPLETED,
      };
    }
    // Se qualquer hash divergir em FINALIZING, faz fallback seguro para ROLLING_BACK abaixo
  }

  // Caso 3: Rollback Idempotente Orientado a Hashes (COMMIT_INTENT, APPLYING, VERIFYING, RECOVERY_REQUIRED, ROLLING_BACK)
  if (journal.state !== JournalStates.ROLLING_BACK) {
    journal.state = JournalStates.RECOVERY_REQUIRED;
    saveJournalDurable(rootDir, journal);
    journal.state = JournalStates.ROLLING_BACK;
    saveJournalDurable(rootDir, journal);
  }

  // Passo 3a: Verifica integridade do Snapshot antes de restaurar qualquer arquivo (B2)
  for (const op of journal.operations || []) {
    if (op.type === 'SPEC_UPDATE') {
      const snapFileRel = `${journal.snapshot_dir}/specs/${op.capability}/spec.md`;
      const snapHash = hashFileSafe(rootDir, snapFileRel, { allowMissing: true });
      if (snapHash !== op.original_hash) {
        journal.state = JournalStates.RECOVERY_FAILED;
        journal.failure_reason = `Snapshot corrupted or missing for '${op.target}' (expected ${op.original_hash}, got ${snapHash}).`;
        saveJournalDurable(rootDir, journal);
        throw new XSpecError(
          ErrorCodes.E009_TRANSACTION_PENDING,
          journal.failure_reason,
          { file: snapFileRel, target: JournalStates.RECOVERY_FAILED }
        );
      }
    }
  }

  const changeManifest = journal.change_snapshot_manifest || {};
  for (const [relInChange, expectedOrigHash] of Object.entries(changeManifest)) {
    const snapChangeFile = `${journal.snapshot_dir}/change/${relInChange}`;
    const snapHash = hashFileSafe(rootDir, snapChangeFile, { allowMissing: true });
    if (snapHash !== expectedOrigHash) {
      journal.state = JournalStates.RECOVERY_FAILED;
      journal.failure_reason = `Change snapshot corrupted or missing for '${relInChange}'.`;
      saveJournalDurable(rootDir, journal);
      throw new XSpecError(
        ErrorCodes.E009_TRANSACTION_PENDING,
        journal.failure_reason,
        { file: snapChangeFile, target: JournalStates.RECOVERY_FAILED }
      );
    }
  }

  // Passo 3b: Verifica mutações externas inesperadas nos arquivos alvo antes de reverter (B1 & B2)
  for (const op of journal.operations || []) {
    if (op.type === 'SPEC_UPDATE' || op.type === 'SPEC_CREATE') {
      const currentHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
      const matchesOriginal = currentHash === op.original_hash;
      const matchesNew = currentHash === op.new_hash;

      if (!matchesOriginal && !matchesNew) {
        journal.state = JournalStates.RECOVERY_FAILED;
        journal.failure_reason = `External unexpected modification detected on '${op.target}' (current hash '${currentHash}' matches neither original '${op.original_hash}' nor transaction '${op.new_hash}').`;
        saveJournalDurable(rootDir, journal);
        throw new XSpecError(
          ErrorCodes.E009_TRANSACTION_PENDING,
          journal.failure_reason,
          {
            file: op.target,
            target: JournalStates.RECOVERY_FAILED,
            fix: 'Inspect the external file modification and snapshot manually.',
          }
        );
      }
    }
  }

  // Passo 3c: Executa restauração reversa idempotente por comparação de hash (B2)
  const reversedOps = [...(journal.operations || [])].reverse();
  for (const op of reversedOps) {
    if (op.type === 'SPEC_UPDATE') {
      const currentHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
      if (currentHash === op.original_hash) {
        if (op.status !== OperationStatuses.RESTORED) {
          op.status = OperationStatuses.RESTORED;
          saveJournalDurable(rootDir, journal);
        }
        continue;
      }

      op.status = OperationStatuses.RESTORE_INTENT;
      saveJournalDurable(rootDir, journal);

      const snapFileRel = `${journal.snapshot_dir}/specs/${op.capability}/spec.md`;
      const origContent = readTextFileSafe(rootDir, snapFileRel);
      const restoredHash = writeFileDurable(rootDir, op.target, origContent);
      if (restoredHash !== op.original_hash) {
        journal.state = JournalStates.RECOVERY_FAILED;
        journal.failure_reason = `Failed to verify restored hash for '${op.target}'.`;
        saveJournalDurable(rootDir, journal);
        throw new XSpecError(ErrorCodes.E009_TRANSACTION_PENDING, journal.failure_reason, {
          file: op.target,
        });
      }

      op.status = OperationStatuses.RESTORED;
      saveJournalDurable(rootDir, journal);

      if (typeof faultHook === 'function') {
        faultHook('ROLLING_BACK_AFTER_OP', { op, journal });
      }
    } else if (op.type === 'SPEC_CREATE') {
      const currentHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
      if (currentHash === null) {
        if (op.status !== OperationStatuses.RESTORED) {
          op.status = OperationStatuses.RESTORED;
          saveJournalDurable(rootDir, journal);
        }
        continue;
      }

      op.status = OperationStatuses.RESTORE_INTENT;
      saveJournalDurable(rootDir, journal);

      removeFileSafe(rootDir, op.target);
      const verifyGone = hashFileSafe(rootDir, op.target, { allowMissing: true });
      if (verifyGone !== null) {
        journal.state = JournalStates.RECOVERY_FAILED;
        journal.failure_reason = `Failed to remove newly created spec '${op.target}' during rollback.`;
        saveJournalDurable(rootDir, journal);
        throw new XSpecError(ErrorCodes.E009_TRANSACTION_PENDING, journal.failure_reason, {
          file: op.target,
        });
      }

      op.status = OperationStatuses.RESTORED;
      saveJournalDurable(rootDir, journal);

      if (typeof faultHook === 'function') {
        faultHook('ROLLING_BACK_AFTER_OP', { op, journal });
      }
    } else if (op.type === 'ARCHIVE_CHANGE') {
      op.status = OperationStatuses.RESTORE_INTENT;
      saveJournalDurable(rootDir, journal);

      // Restaura integralmente a pasta da mudança ativa a partir do snapshot
      for (const [relInChange, expectedOrigHash] of Object.entries(changeManifest)) {
        const targetRel = `${journal.active_change_dir}/${relInChange}`;
        const curHash = hashFileSafe(rootDir, targetRel, { allowMissing: true });
        if (curHash !== expectedOrigHash) {
          const snapContent = readTextFileSafe(
            rootDir,
            `${journal.snapshot_dir}/change/${relInChange}`
          );
          const restoredHash = writeFileDurable(rootDir, targetRel, snapContent);
          if (restoredHash !== expectedOrigHash) {
            journal.state = JournalStates.RECOVERY_FAILED;
            journal.failure_reason = `Failed to restore active change file '${targetRel}'.`;
            saveJournalDurable(rootDir, journal);
            throw new XSpecError(ErrorCodes.E009_TRANSACTION_PENDING, journal.failure_reason, {
              file: targetRel,
            });
          }
        }
      }

      // Remove qualquer diretório parcial criado em archive/ somente após confirmar active_change_dir
      if (journal.archive_target) {
        removeDirectorySafe(rootDir, journal.archive_target);
      }

      op.status = OperationStatuses.RESTORED;
      saveJournalDurable(rootDir, journal);

      if (typeof faultHook === 'function') {
        faultHook('ROLLING_BACK_AFTER_OP', { op, journal });
      }
    }
  }

  // Passo 3d: Limpa staging e conclui rollback
  removeDirectorySafe(rootDir, journal.staging_dir);
  journal.state = JournalStates.ROLLED_BACK;
  saveJournalDurable(rootDir, journal);

  if (releaseLock) {
    releaseMergeLock(rootDir, journal.lock_id || null);
  }

  return {
    transaction_id: journal.transaction_id,
    action: 'ROLLED_BACK',
    state: JournalStates.ROLLED_BACK,
  };
}

/**
 * Comando de recuperação geral (`xspec recover [--recover-lock]`):
 * Recupera transações pendentes no journal e, opcionalmente, locks órfãos comprovados.
 */
export function recoverWorkspace(
  rootDir,
  {
    recoverLock = false,
    processInspector = undefined,
    currentHostname = undefined,
    faultHook = null,
  } = {}
) {
  const { config } = loadAndValidateConfig(rootDir);
  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;

  const diagnostics = [];
  const recoveredTransactions = [];
  let lockRecoveryResult = null;

  try {
    if (recoverLock) {
      lockRecoveryResult = recoverOrphanMergeLock(rootDir, {
        ...(processInspector ? { processInspector } : {}),
        ...(currentHostname ? { currentHostname } : {}),
        onBeforeUnlockJournalCheck() {
          const pending = findPendingJournals(rootDir);
          for (const j of pending) {
            const res = recoverSingleTransaction(rootDir, j, {
              faultHook,
              releaseLock: false,
            });
            recoveredTransactions.push(res);
          }
        },
      });
    }

    // Recupera quaisquer journals pendentes restantes (caso o lock já não existisse ou pertencesse a este processo)
    const lockInfo = inspectMergeLock(rootDir, {
      ...(processInspector ? { processInspector } : {}),
      ...(currentHostname ? { currentHostname } : {}),
    });

    if (
      lockInfo.status !== LockStates.NO_LOCK &&
      !lockInfo.isOrphan &&
      lockInfo.lock?.pid !== process.pid
    ) {
      throw new XSpecError(
        ErrorCodes.E008_LOCK_BUSY,
        `Cannot recover journals while an active process (PID ${lockInfo.lock?.pid}) holds merge.lock (${lockInfo.status}).`,
        { file: '.xspec/locks/merge.lock', target: lockInfo.status }
      );
    }

    const pending = findPendingJournals(rootDir);
    for (const j of pending) {
      const res = recoverSingleTransaction(rootDir, j, {
        faultHook,
        releaseLock: true,
      });
      recoveredTransactions.push(res);
    }
  } catch (err) {
    diagnostics.push(
      err.toDiagnostic
        ? err.toDiagnostic()
        : createDiagnostic({
            code: ErrorCodes.E009_TRANSACTION_PENDING,
            severity: Severities.CRITICAL,
            message: err.message,
          })
    );
  }

  return createDiagnosticEnvelope({
    command: 'recover',
    schemaVersion,
    profile,
    blockArchiveOnHigh,
    diagnostics,
    data: {
      recovered_transactions: recoveredTransactions,
      lock_recovery: lockRecoveryResult,
    },
  });
}
