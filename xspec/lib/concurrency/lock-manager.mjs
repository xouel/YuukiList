/**
 * X-Spec Engine v2.0.1 — Gerenciador de Lock Exclusivo Atômico (wx) e Recuperação Concorrente Segura (Entrega 5 / B4)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { ErrorCodes, XSpecError } from '../errors/codes.mjs';
import { resolveContainedPath, syncParentDirectory } from '../security/path-guard.mjs';

export const MERGE_LOCK_REL_PATH = '.xspec/locks/merge.lock';
export const RECOVER_LOCK_REL_PATH = '.xspec/locks/merge.recover.lock';
export const PARTIAL_WRITE_GRACE_MS = 5_000;

export const LockStates = Object.freeze({
  NO_LOCK: 'NO_LOCK',
  LOCK_ACTIVE: 'LOCK_ACTIVE',
  LOCK_ACTIVE_EPERM: 'LOCK_ACTIVE_EPERM',
  LOCK_ACTIVE_REMOTE_HOST: 'LOCK_ACTIVE_REMOTE_HOST',
  LOCK_ACTIVE_INITIALIZING: 'LOCK_ACTIVE_INITIALIZING',
  ORPHAN_DEAD_PROCESS: 'ORPHAN_DEAD_PROCESS',
  ORPHAN_PID_REUSED: 'ORPHAN_PID_REUSED',
  ORPHAN_PARTIAL_WRITE: 'ORPHAN_PARTIAL_WRITE',
});

/**
 * Obtém o token de início do processo atual (ou em Linux via /proc/<pid>/stat se disponível).
 */
export function getProcessBirthInfo(pid = process.pid) {
  // Em Linux, /proc/<pid>/stat campo 22 (após ')') é o starttime imutável em clock ticks do kernel
  if (process.platform === 'linux') {
    try {
      const statRaw = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
      const closeParen = statRaw.lastIndexOf(')');
      if (closeParen !== -1) {
        const fields = statRaw.slice(closeParen + 2).trim().split(/\s+/);
        const startTicks = fields[19];
        if (startTicks) {
          return {
            startToken: `linux-proc-ticks:${startTicks}`,
            startedAtMs: pid === process.pid ? Math.round(Date.now() - process.uptime() * 1000) : null,
          };
        }
      }
    } catch {
      // fallback abaixo
    }
  }

  if (pid === process.pid) {
    const startedAtMs = Math.round(Date.now() - process.uptime() * 1000);
    // Arredonda para janela de 1s para estabilidade dentro do mesmo processo
    const bucketSec = Math.floor(startedAtMs / 1000);
    return {
      startToken: `self-boot-sec:${bucketSec}`,
      startedAtMs,
    };
  }

  return {
    startToken: null,
    startedAtMs: null,
  };
}

/**
 * Inspetor padrão de processos no sistema operacional (respeitando estritamente EPERM vs ESRCH — B4).
 */
export function defaultProcessInspector(pid) {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) {
    return { state: 'DEAD_ESRCH', startToken: null, startedAtMs: null };
  }

  try {
    process.kill(pid, 0);
  } catch (err) {
    if (err && err.code === 'EPERM') {
      // Regra fundamental B4: EPERM significa que o processo EXISTE e está ativo sob outro usuário/privilégio!
      return { state: 'ALIVE_EPERM', startToken: null, startedAtMs: null };
    }
    if (err && err.code === 'ESRCH') {
      return { state: 'DEAD_ESRCH', startToken: null, startedAtMs: null };
    }
    // Qualquer erro desconhecido é tratado conservadoramente como ativo
    return { state: 'ALIVE_EPERM', startToken: null, startedAtMs: null };
  }

  const birth = getProcessBirthInfo(pid);
  return {
    state: 'ALIVE',
    startToken: birth.startToken,
    startedAtMs: birth.startedAtMs,
  };
}

/**
 * Inspeciona o estado atual de `.xspec/locks/merge.lock` aplicando a árvore de decisão B4.
 */
export function inspectMergeLock(
  rootDir,
  {
    processInspector = defaultProcessInspector,
    currentHostname = os.hostname(),
    nowMs = Date.now(),
    partialWriteGraceMs = PARTIAL_WRITE_GRACE_MS,
  } = {}
) {
  const lockAbsPath = resolveContainedPath(rootDir, MERGE_LOCK_REL_PATH);

  let stat;
  try {
    stat = fs.lstatSync(lockAbsPath);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return {
        status: LockStates.NO_LOCK,
        isOrphan: false,
        lock: null,
        lockId: null,
        mtimeMs: null,
      };
    }
    throw err;
  }

  if (stat.isSymbolicLink()) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Symbolic link forbidden at lock path '${MERGE_LOCK_REL_PATH}'.`,
      { file: MERGE_LOCK_REL_PATH }
    );
  }

  let rawText = '';
  try {
    rawText = fs.readFileSync(lockAbsPath, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return {
        status: LockStates.NO_LOCK,
        isOrphan: false,
        lock: null,
        lockId: null,
        mtimeMs: null,
      };
    }
    throw err;
  }

  let lock = null;
  try {
    lock = rawText.trim().length > 0 ? JSON.parse(rawText) : null;
  } catch {
    lock = null;
  }

  // 1. Escrita parcial ou JSON inválido
  if (!lock || typeof lock !== 'object' || !lock.lock_id || !lock.pid) {
    const ageMs = Math.max(0, nowMs - stat.mtimeMs);
    if (ageMs < partialWriteGraceMs) {
      return {
        status: LockStates.LOCK_ACTIVE_INITIALIZING,
        isOrphan: false,
        lock: null,
        lockId: null,
        mtimeMs: stat.mtimeMs,
      };
    }
    return {
      status: LockStates.ORPHAN_PARTIAL_WRITE,
      isOrphan: true,
      lock: null,
      lockId: null,
      mtimeMs: stat.mtimeMs,
    };
  }

  // 2. Hostname diferente: NUNCA tratar automaticamente como órfão
  if (lock.hostname && lock.hostname !== currentHostname) {
    return {
      status: LockStates.LOCK_ACTIVE_REMOTE_HOST,
      isOrphan: false,
      lock,
      lockId: lock.lock_id,
      mtimeMs: stat.mtimeMs,
    };
  }

  // 3. Sondagem do processo (EPERM vs ESRCH vs PID reutilizado)
  const probe = processInspector(lock.pid, lock);

  if (probe.state === 'ALIVE_EPERM') {
    return {
      status: LockStates.LOCK_ACTIVE_EPERM,
      isOrphan: false,
      lock,
      lockId: lock.lock_id,
      mtimeMs: stat.mtimeMs,
    };
  }

  if (probe.state === 'DEAD_ESRCH') {
    return {
      status: LockStates.ORPHAN_DEAD_PROCESS,
      isOrphan: true,
      lock,
      lockId: lock.lock_id,
      mtimeMs: stat.mtimeMs,
    };
  }

  // O PID existe no SO ('ALIVE'): verifica se houve reutilização de PID pelo SO (B4)
  if (
    probe.startToken &&
    lock.process_start_token &&
    probe.startToken !== lock.process_start_token
  ) {
    return {
      status: LockStates.ORPHAN_PID_REUSED,
      isOrphan: true,
      lock,
      lockId: lock.lock_id,
      mtimeMs: stat.mtimeMs,
    };
  }

  const lockAcquiredMs = Date.parse(lock.acquired_at);
  if (
    typeof probe.startedAtMs === 'number' &&
    !Number.isNaN(lockAcquiredMs) &&
    probe.startedAtMs > lockAcquiredMs + 1000
  ) {
    return {
      status: LockStates.ORPHAN_PID_REUSED,
      isOrphan: true,
      lock,
      lockId: lock.lock_id,
      mtimeMs: stat.mtimeMs,
    };
  }

  return {
    status: LockStates.LOCK_ACTIVE,
    isOrphan: false,
    lock,
    lockId: lock.lock_id,
    mtimeMs: stat.mtimeMs,
  };
}

/**
 * Adquire `.xspec/locks/merge.lock` usando criação exclusiva atômica (`fs.openSync(..., 'wx')`).
 */
export function acquireMergeLock(
  rootDir,
  {
    changeId,
    transactionId,
    processInspector = defaultProcessInspector,
    currentHostname = os.hostname(),
    nowMs = Date.now(),
    partialWriteGraceMs = PARTIAL_WRITE_GRACE_MS,
  } = {}
) {
  const lockAbsPath = resolveContainedPath(rootDir, MERGE_LOCK_REL_PATH);
  const locksDir = path.dirname(lockAbsPath);
  fs.mkdirSync(locksDir, { recursive: true });
  resolveContainedPath(rootDir, locksDir);

  const birth = getProcessBirthInfo(process.pid);
  const payload = {
    lock_id: crypto.randomUUID(),
    pid: process.pid,
    process_start_token: birth.startToken,
    process_started_at_ms: birth.startedAtMs,
    hostname: currentHostname,
    change_id: changeId || 'unknown',
    transaction_id: transactionId || `tx-${Date.now()}`,
    acquired_at: new Date(nowMs).toISOString(),
  };

  let fd = null;
  try {
    fd = fs.openSync(lockAbsPath, 'wx', 0o600);
    fs.writeFileSync(fd, JSON.stringify(payload, null, 2), 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    syncParentDirectory(locksDir);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }

    if (err && err.code === 'EEXIST') {
      const inspection = inspectMergeLock(rootDir, {
        processInspector,
        currentHostname,
        nowMs,
        partialWriteGraceMs,
      });

      const holderDesc = inspection.lock
        ? `PID ${inspection.lock.pid} on host '${inspection.lock.hostname}' (tx: ${inspection.lock.transaction_id})`
        : 'uninitialized/corrupt lock file';

      const fixHint = inspection.isOrphan
        ? `Lock is classified as orphan (${inspection.status}). Run 'node xspec/bin/xspec.mjs recover --recover-lock' to safely recover.`
        : `Wait for active merge (${inspection.status}) to finish.`;

      throw new XSpecError(
        ErrorCodes.E008_LOCK_BUSY,
        `Cannot acquire merge lock '${MERGE_LOCK_REL_PATH}': status=${inspection.status}, holder=${holderDesc}.`,
        {
          file: MERGE_LOCK_REL_PATH,
          target: inspection.status,
          fix: fixHint,
        }
      );
    }
    throw err;
  }

  return {
    lockPath: lockAbsPath,
    lock: payload,
    release() {
      releaseMergeLock(rootDir, payload.lock_id);
    },
  };
}

/**
 * Libera `.xspec/locks/merge.lock` somente se o `lock_id` ainda pertencer ao chamador.
 */
export function releaseMergeLock(rootDir, expectedLockId = null) {
  const lockAbsPath = resolveContainedPath(rootDir, MERGE_LOCK_REL_PATH);
  if (!fs.existsSync(lockAbsPath)) return false;

  if (expectedLockId) {
    try {
      const current = JSON.parse(fs.readFileSync(lockAbsPath, 'utf8'));
      if (current.lock_id !== expectedLockId) {
        return false;
      }
    } catch {
      // se o arquivo estava ilegível, prossegue apenas se não exigiu lock_id
      return false;
    }
  }

  fs.unlinkSync(lockAbsPath);
  syncParentDirectory(path.dirname(lockAbsPath));
  return true;
}

/**
 * Recupera um `merge.lock` comprovadamente órfão de forma concorrente e segura (B4):
 * 1. Inspeciona `merge.lock` e garante que é `ORPHAN_*` (rejeita `LOCK_ACTIVE`, `EPERM`, `REMOTE_HOST`).
 * 2. Adquire lock exclusivo secundário `.xspec/locks/merge.recover.lock` via `wx`.
 * 3. Re-lê `merge.lock` e verifica proteção ABA (`lock_id` e `mtimeMs` idênticos).
 * 4. Executa `onBeforeUnlockJournalCheck` (para reverter ou concluir transação pendente no journal antes de destravar).
 * 5. Remove `merge.lock` e libera `merge.recover.lock`.
 */
export function recoverOrphanMergeLock(
  rootDir,
  {
    processInspector = defaultProcessInspector,
    currentHostname = os.hostname(),
    nowMs = Date.now(),
    partialWriteGraceMs = PARTIAL_WRITE_GRACE_MS,
    onBeforeUnlockJournalCheck = null,
  } = {}
) {
  const firstCheck = inspectMergeLock(rootDir, {
    processInspector,
    currentHostname,
    nowMs,
    partialWriteGraceMs,
  });

  if (firstCheck.status === LockStates.NO_LOCK) {
    return {
      recovered: false,
      status: LockStates.NO_LOCK,
      previousLock: null,
    };
  }

  if (!firstCheck.isOrphan) {
    throw new XSpecError(
      ErrorCodes.E008_LOCK_BUSY,
      `Cannot recover merge lock because it is NOT orphan (status: ${firstCheck.status}).`,
      {
        file: MERGE_LOCK_REL_PATH,
        target: firstCheck.status,
        fix: 'Do not force-remove an active lock, EPERM lock, or remote host lock.',
      }
    );
  }

  const recoverLockAbsPath = resolveContainedPath(rootDir, RECOVER_LOCK_REL_PATH);
  const locksDir = path.dirname(recoverLockAbsPath);
  fs.mkdirSync(locksDir, { recursive: true });

  let recoverFd = null;
  try {
    recoverFd = fs.openSync(recoverLockAbsPath, 'wx', 0o600);
    fs.writeFileSync(
      recoverFd,
      JSON.stringify({ pid: process.pid, started_at: new Date(nowMs).toISOString() }),
      'utf8'
    );
    fs.fsyncSync(recoverFd);
    fs.closeSync(recoverFd);
    recoverFd = null;
  } catch (err) {
    if (recoverFd !== null) {
      try {
        fs.closeSync(recoverFd);
      } catch {
        // ignore
      }
    }
    if (err && err.code === 'EEXIST') {
      throw new XSpecError(
        ErrorCodes.E008_LOCK_BUSY,
        'Concurrent lock recovery is already in progress by another process.',
        { file: RECOVER_LOCK_REL_PATH, target: 'RECOVER_LOCK_BUSY' }
      );
    }
    throw err;
  }

  try {
    // Re-inspeção dentro da região crítica para impedir condição de corrida ABA
    const secondCheck = inspectMergeLock(rootDir, {
      processInspector,
      currentHostname,
      nowMs,
      partialWriteGraceMs,
    });

    if (secondCheck.status === LockStates.NO_LOCK) {
      return {
        recovered: false,
        status: LockStates.NO_LOCK,
        previousLock: null,
      };
    }

    if (
      !secondCheck.isOrphan ||
      secondCheck.lockId !== firstCheck.lockId ||
      secondCheck.mtimeMs !== firstCheck.mtimeMs
    ) {
      throw new XSpecError(
        ErrorCodes.E008_LOCK_BUSY,
        'Merge lock changed state concurrently during recovery check (ABA race prevented).',
        { file: MERGE_LOCK_REL_PATH, target: secondCheck.status }
      );
    }

    // Verifica e recupera qualquer transação pendente no journal ANTES de remover o lock
    if (typeof onBeforeUnlockJournalCheck === 'function') {
      onBeforeUnlockJournalCheck(secondCheck.lock);
    }

    const lockAbsPath = resolveContainedPath(rootDir, MERGE_LOCK_REL_PATH);
    if (fs.existsSync(lockAbsPath)) {
      fs.unlinkSync(lockAbsPath);
      syncParentDirectory(locksDir);
    }

    return {
      recovered: true,
      status: secondCheck.status,
      previousLock: secondCheck.lock,
    };
  } finally {
    try {
      if (fs.existsSync(recoverLockAbsPath)) {
        fs.unlinkSync(recoverLockAbsPath);
      }
    } catch {
      // ignore
    }
  }
}
