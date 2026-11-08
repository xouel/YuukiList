/**
 * X-Spec Engine v2.0.1 — Motor Transacional de 8 Estágios com Write-Ahead Journal Durável (Entrega 6 / B1, B2 & G3)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
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
  sha256Text,
} from '../security/path-guard.mjs';
import {
  discoverSpecCapabilities,
  loadAndValidateConfig,
  validateChange,
} from '../validators/artifact-validator.mjs';
import { ValidationStages } from '../validators/stage-matrix.mjs';
import { parseYamlSubset } from '../parser/yaml-subset.mjs';
import { serializeChangeMetadataYaml, verifyBaseSpecsIntegrity } from '../concurrency/hash-tracker.mjs';
import { isChangeArchived } from '../concurrency/conflict-detector.mjs';
import { acquireMergeLock } from '../concurrency/lock-manager.mjs';
import { computeMergedLivingSpec } from './delta-merger.mjs';
import {
  JournalStates,
  OperationStatuses,
  saveJournalDurable,
  findPendingJournals,
  recoverSingleTransaction,
} from '../recovery/recovery-manager.mjs';
import { generateConvergenceReport } from '../reporting/report-generator.mjs';

/**
 * Lista recursivamente todos os arquivos relativos dentro de um diretório contido em rootDir.
 */
function listRelativeFilesRecursive(rootDir, baseRelDir) {
  const absBase = resolveContainedPath(rootDir, baseRelDir);
  if (!fs.existsSync(absBase)) return [];

  const results = [];
  function walk(curDir) {
    const entries = fs.readdirSync(curDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(curDir, entry.name);
      resolveContainedPath(rootDir, fullPath);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(absBase, fullPath).replace(/\\/g, '/');
        results.push(rel);
      }
    }
  }
  walk(absBase);
  return results.sort();
}

/**
 * Verifica estado sujo do Git respeitando estritamente a regra G3:
 * - Sem `--allow-dirty`: qualquer arquivo modificado/não rastreado no Git bloqueia com E012_GIT_DIRTY_STATE.
 * - Com `--allow-dirty`: permite arquivos não relacionados, mas NUNCA permite alterações locais não commitadas
 *   nos arquivos protegidos que serão sobrescritos pela transação (`xspec/specs/<cap>/spec.md`, `xspec/constitution.md`).
 */
export function checkGitDirtyState(rootDir, protectedTargetSpecs = [], { allowDirty = false } = {}) {
  const safeRoot = resolveContainedPath(rootDir, '.');
  const gitDir = path.join(safeRoot, '.git');
  if (!fs.existsSync(gitDir)) {
    return { isGitRepo: false, dirtyFiles: [], blockedFiles: [] };
  }

  const res = spawnSync('git', ['status', '--porcelain'], {
    cwd: safeRoot,
    shell: false,
    timeout: 10_000,
    encoding: 'utf8',
    windowsHide: true,
  });

  if (res.error || res.status !== 0 || typeof res.stdout !== 'string') {
    return { isGitRepo: false, dirtyFiles: [], blockedFiles: [] };
  }

  const lines = res.stdout
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean);

  const dirtyFiles = [];
  for (const line of lines) {
    // Formato porcelain: XY PATH (ou XY ORIG -> PATH)
    const rawPath = line.slice(3).trim();
    const arrowIdx = rawPath.indexOf(' -> ');
    const effectivePath = (arrowIdx !== -1 ? rawPath.slice(arrowIdx + 4) : rawPath)
      .replace(/^"+|"+$/g, '')
      .replace(/\\/g, '/');
    if (effectivePath) {
      dirtyFiles.push(effectivePath);
    }
  }

  if (dirtyFiles.length === 0) {
    return { isGitRepo: true, dirtyFiles: [], blockedFiles: [] };
  }

  const protectedSet = new Set([
    ...protectedTargetSpecs.map((p) => p.replace(/\\/g, '/')),
    'xspec/constitution.md',
  ]);

  const dirtyProtected = dirtyFiles.filter((df) => protectedSet.has(df));
  if (dirtyProtected.length > 0) {
    throw new XSpecError(
      ErrorCodes.E012_GIT_DIRTY_STATE,
      `Git working tree has uncommitted local changes in transaction-protected file(s): ${dirtyProtected.join(', ')}. Even '--allow-dirty' cannot overwrite local edits to target Living Specs.`,
      {
        file: dirtyProtected[0],
        target: dirtyProtected.join(', '),
        fix: 'Commit, stash, or revert local changes to target Living Specs before running xspec merge.',
      }
    );
  }

  if (!allowDirty) {
    throw new XSpecError(
      ErrorCodes.E012_GIT_DIRTY_STATE,
      `Git working tree is dirty (${dirtyFiles.length} modified/untracked file(s), e.g. '${dirtyFiles[0]}').`,
      {
        file: dirtyFiles[0],
        fix: "Commit your work before merging or pass '--allow-dirty' if the dirty files are unrelated to target Living Specs.",
      }
    );
  }

  return {
    isGitRepo: true,
    dirtyFiles,
    blockedFiles: [],
  };
}

/**
 * Executa o Merge Transacional de 8 Estágios com Write-Ahead Journal Durável (B1, B2, G3):
 * 1. PREPARING
 * 2. VALIDATING
 * 3. SNAPSHOTTING
 * 4. STAGING
 * 5. COMMIT_INTENT
 * 6. APPLYING
 * 7. VERIFYING
 * 8. FINALIZING -> COMPLETED
 */
export function executeTransactionalMerge({
  rootDir,
  changeId,
  allowDirty = false,
  datePrefix = new Date().toISOString().slice(0, 10),
  faultHook = null, // Hook opcional para testes de injeção determinística de falhas em cada estágio
  simulateHardKill = false, // Se true, não executa catch/auto-recovery para simular SIGKILL / queda de energia
}) {
  const { config } = loadAndValidateConfig(rootDir);
  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;

  // 0. Bloqueia imediatamente se houver qualquer journal pendente em .xspec/journal/
  const pendingJournals = findPendingJournals(rootDir);
  if (pendingJournals.length > 0) {
    const firstPending = pendingJournals[0];
    return createDiagnosticEnvelope({
      command: 'merge',
      changeId,
      schemaVersion,
      profile,
      blockArchiveOnHigh,
      diagnostics: [
        createDiagnostic({
          code: ErrorCodes.E009_TRANSACTION_PENDING,
          severity: Severities.CRITICAL,
          file: `.xspec/journal/${firstPending.transaction_id}.json`,
          target: firstPending.state,
          message: `Cannot start merge because transaction '${firstPending.transaction_id}' is incomplete (state: ${firstPending.state}).`,
          fix: "Run 'node xspec/bin/xspec.mjs recover' to roll back or finalize the pending transaction first.",
        }),
      ],
    });
  }

  const txId = `tx-${Date.now()}-${changeId}-${crypto.randomBytes(3).toString('hex')}`;
  let lockHandle = null;
  let journal = null;

  try {
    // =========================================================================
    // ESTÁGIO 1: PREPARING (Adquire merge.lock exclusivo via wx)
    // =========================================================================
    lockHandle = acquireMergeLock(rootDir, {
      changeId,
      transactionId: txId,
    });

    const changeRelDir = `xspec/changes/${changeId}`;
    const snapshotDirRel = `.xspec/snapshots/${txId}`;
    const stagingDirRel = `.xspec/staging/${txId}`;
    const archiveTargetRel = `xspec/changes/archive/${datePrefix}-${changeId}`;

    // Verifica se o diretório de destino em archive/ já existe (idempotência / colisão)
    if (fs.existsSync(resolveContainedPath(rootDir, archiveTargetRel))) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `Archive destination '${archiveTargetRel}' already exists.`,
        {
          file: archiveTargetRel,
          fix: 'Verify if this change was already merged/archived.',
        }
      );
    }

    journal = {
      transaction_id: txId,
      change_id: changeId,
      lock_id: lockHandle.lock.lock_id,
      state: JournalStates.PREPARING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active_change_dir: changeRelDir,
      snapshot_dir: snapshotDirRel,
      staging_dir: stagingDirRel,
      archive_target: archiveTargetRel,
      dirty_unmanaged_files: [],
      operations: [],
      change_snapshot_manifest: {},
      archive_manifest: {},
      failure_reason: null,
    };

    saveJournalDurable(rootDir, journal);

    // Validação completa de fechamento (STAGE_CLOSE + evidências reais)
    const closeValidation = validateChange({
      rootDir,
      changeId,
      stage: ValidationStages.CLOSE,
    });

    if (!closeValidation.ok) {
      // Gera report.md registrando o DIVERGED antes de abortar a preparação
      if (fs.existsSync(resolveContainedPath(rootDir, changeRelDir))) {
        generateConvergenceReport({
          rootDir,
          changeId,
          validationEnvelope: closeValidation,
          stateOverride: 'OPEN',
        });
      }
      recoverSingleTransaction(rootDir, journal, { releaseLock: true });
      return {
        ...closeValidation,
        command: 'merge',
      };
    }

    // Verifica integridade de base_specs e dependências depends_on
    const baseIntegrity = verifyBaseSpecsIntegrity(rootDir, changeId);
    if (!baseIntegrity.ok) {
      recoverSingleTransaction(rootDir, journal, { releaseLock: true });
      return createDiagnosticEnvelope({
        command: 'merge',
        changeId,
        schemaVersion,
        profile,
        blockArchiveOnHigh,
        diagnostics: baseIntegrity.diagnostics,
      });
    }

    const meta = baseIntegrity.meta || {};
    const skipSpecs = meta.skip_specs === true;
    const dependsOn = Array.isArray(meta.depends_on) ? meta.depends_on : [];
    for (const depId of dependsOn) {
      if (!isChangeArchived(rootDir, depId)) {
        throw new XSpecError(
          ErrorCodes.E006_CONCURRENCY_CONFLICT,
          `Cannot merge '${changeId}' because dependency '${depId}' in depends_on has not been archived yet.`,
          {
            file: `${changeRelDir}/.xspec.yaml`,
            target: `depends_on -> ${depId}`,
            fix: `Merge and archive '${depId}' before merging '${changeId}'.`,
          }
        );
      }
    }

    const capabilities = skipSpecs ? [] : discoverSpecCapabilities(rootDir, `${changeRelDir}/specs`);
    const protectedSpecTargets = capabilities.map((cap) => `xspec/specs/${cap}/spec.md`);

    // Verifica Git dirty state (G3)
    const gitStatus = checkGitDirtyState(rootDir, protectedSpecTargets, { allowDirty });
    journal.dirty_unmanaged_files = gitStatus.dirtyFiles;

    // Calcula todas as novas Living Specs em memória
    const computedSpecs = [];
    const operations = [];
    let opIndex = 1;

    for (const cap of capabilities) {
      const deltaRel = `${changeRelDir}/specs/${cap}/spec.md`;
      const livingRel = `xspec/specs/${cap}/spec.md`;
      const deltaRaw = readTextFileSafe(rootDir, deltaRel);
      const livingRaw = readTextFileSafe(rootDir, livingRel, { allowMissing: true });
      const originalHash = livingRaw !== null ? sha256Text(livingRaw) : null;

      const computed = computeMergedLivingSpec({
        capability: cap,
        deltaRaw,
        livingRaw,
      });

      const newHash = sha256Text(computed.mergedContent);
      computedSpecs.push({
        ...computed,
        targetRel: livingRel,
        originalHash,
        newHash,
        livingRaw,
      });

      operations.push({
        index: opIndex++,
        type: computed.existedBefore ? 'SPEC_UPDATE' : 'SPEC_CREATE',
        capability: cap,
        target: livingRel,
        existed_before: computed.existedBefore,
        original_hash: originalHash,
        new_hash: newHash,
        status: OperationStatuses.PENDING,
      });
    }

    operations.push({
      index: opIndex++,
      type: 'ARCHIVE_CHANGE',
      source: changeRelDir,
      target: archiveTargetRel,
      status: OperationStatuses.PENDING,
    });

    journal.operations = operations;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook(JournalStates.PREPARING, { journal });
    }

    // =========================================================================
    // ESTÁGIO 2: VALIDATING (Validação completa pós-merge em memória)
    // =========================================================================
    journal.state = JournalStates.VALIDATING;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook(JournalStates.VALIDATING, { journal });
    }

    // =========================================================================
    // ESTÁGIO 3: SNAPSHOTTING (Cópia durável dos originais + verificação de hash)
    // =========================================================================
    journal.state = JournalStates.SNAPSHOTTING;
    saveJournalDurable(rootDir, journal);

    for (const spec of computedSpecs) {
      if (spec.existedBefore && spec.livingRaw !== null) {
        const snapSpecRel = `${snapshotDirRel}/specs/${spec.capability}/spec.md`;
        const writtenSnapHash = writeFileDurable(rootDir, snapSpecRel, spec.livingRaw);
        if (writtenSnapHash !== spec.originalHash) {
          throw new XSpecError(
            ErrorCodes.E007_MERGE_FAILED,
            `Snapshot hash mismatch for '${spec.targetRel}'.`,
            { file: snapSpecRel }
          );
        }
      }
    }

    // Snapshot integral da pasta da mudança ativa
    const changeFiles = listRelativeFilesRecursive(rootDir, changeRelDir);
    const changeSnapshotManifest = Object.create(null);
    for (const relInChange of changeFiles) {
      const srcRel = `${changeRelDir}/${relInChange}`;
      const snapRel = `${snapshotDirRel}/change/${relInChange}`;
      const content = readTextFileSafe(rootDir, srcRel);
      const writtenHash = writeFileDurable(rootDir, snapRel, content);
      changeSnapshotManifest[relInChange] = writtenHash;
    }

    journal.change_snapshot_manifest = changeSnapshotManifest;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook(JournalStates.SNAPSHOTTING, { journal });
    }

    // =========================================================================
    // ESTÁGIO 4: STAGING (Gravação durável dos novos arquivos em .xspec/staging/)
    // =========================================================================
    journal.state = JournalStates.STAGING;
    saveJournalDurable(rootDir, journal);

    for (const spec of computedSpecs) {
      const stageSpecRel = `${stagingDirRel}/specs/${spec.capability}/spec.md`;
      const stagedHash = writeFileDurable(rootDir, stageSpecRel, spec.mergedContent);
      if (stagedHash !== spec.newHash) {
        throw new XSpecError(
          ErrorCodes.E007_MERGE_FAILED,
          `Staging hash mismatch for '${stageSpecRel}'.`,
          { file: stageSpecRel }
        );
      }
    }

    // Prepara pacote de arquivo no staging (incluindo report.md CONVERGED/CLOSED e status ARCHIVED)
    const archiveManifest = Object.create(null);
    for (const relInChange of changeFiles) {
      const srcRel = `${changeRelDir}/${relInChange}`;
      let content = readTextFileSafe(rootDir, srcRel);

      if (relInChange === '.xspec.yaml') {
        const parsedMeta = parseYamlSubset(content, { file: srcRel });
        parsedMeta.status = 'ARCHIVED';
        content = serializeChangeMetadataYaml(parsedMeta);
      } else if (relInChange === 'proposal.md') {
        content = content.replace(/Status:\s*`?[A-Z_]+`?/i, 'Status: `ARCHIVED`');
      }

      const stageArchiveFileRel = `${stagingDirRel}/archive/${relInChange}`;
      const h = writeFileDurable(rootDir, stageArchiveFileRel, content);
      archiveManifest[relInChange] = h;
    }

    // Gera report.md no diretório ativo (ou atualiza) e copia para staging/archive/report.md
    const reportResult = generateConvergenceReport({
      rootDir,
      changeId,
      validationEnvelope: closeValidation,
      stateOverride: 'CLOSED',
    });
    const reportContent = readTextFileSafe(rootDir, reportResult.reportPath);
    const stagedReportHash = writeFileDurable(
      rootDir,
      `${stagingDirRel}/archive/report.md`,
      reportContent
    );
    archiveManifest['report.md'] = stagedReportHash;

    journal.archive_manifest = archiveManifest;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook(JournalStates.STAGING, { journal });
    }

    // =========================================================================
    // ESTÁGIO 5: COMMIT_INTENT (Confirma hashes originais e sela intenção durável)
    // =========================================================================
    for (const spec of computedSpecs) {
      const currentDiskHash = hashFileSafe(rootDir, spec.targetRel, { allowMissing: true });
      if (currentDiskHash !== spec.originalHash) {
        throw new XSpecError(
          ErrorCodes.E006_CONCURRENCY_CONFLICT,
          `External modification detected on '${spec.targetRel}' before COMMIT_INTENT.`,
          { file: spec.targetRel }
        );
      }
    }

    journal.state = JournalStates.COMMIT_INTENT;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook(JournalStates.COMMIT_INTENT, { journal });
    }

    // =========================================================================
    // ESTÁGIO 6: APPLYING (Write-Ahead por operação: APPLY_INTENT -> escrita -> APPLIED)
    // =========================================================================
    journal.state = JournalStates.APPLYING;
    saveJournalDurable(rootDir, journal);

    for (const op of journal.operations) {
      // Passo 6a: Registra intenção durável ANTES de mutar o destino (B1)
      op.status = OperationStatuses.APPLY_INTENT;
      saveJournalDurable(rootDir, journal);

      if (typeof faultHook === 'function') {
        faultHook('APPLYING_BEFORE_WRITE', { opIndex: op.index, op, journal });
      }

      // Passo 6b: Executa mutação durável a partir do staging
      if (op.type === 'SPEC_UPDATE' || op.type === 'SPEC_CREATE') {
        const stagedContent = readTextFileSafe(
          rootDir,
          `${stagingDirRel}/specs/${op.capability}/spec.md`
        );
        writeFileDurable(rootDir, op.target, stagedContent);
      } else if (op.type === 'ARCHIVE_CHANGE') {
        for (const relInArchive of Object.keys(journal.archive_manifest)) {
          const stagedFileContent = readTextFileSafe(
            rootDir,
            `${stagingDirRel}/archive/${relInArchive}`
          );
          writeFileDurable(rootDir, `${archiveTargetRel}/${relInArchive}`, stagedFileContent);
        }
      }

      if (typeof faultHook === 'function') {
        faultHook('APPLYING_BEFORE_ACK', { opIndex: op.index, op, journal });
      }

      // Passo 6c: Registra confirmação durável
      op.status = OperationStatuses.APPLIED;
      saveJournalDurable(rootDir, journal);

      if (typeof faultHook === 'function') {
        faultHook('APPLYING_AFTER_OP', { opIndex: op.index, op, journal });
      }
    }

    // =========================================================================
    // ESTÁGIO 7: VERIFYING (Conferência integral de hashes SHA-256 no destino)
    // =========================================================================
    journal.state = JournalStates.VERIFYING;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook('VERIFYING_START', { journal });
    }

    for (const op of journal.operations) {
      if (op.type === 'SPEC_UPDATE' || op.type === 'SPEC_CREATE') {
        const diskHash = hashFileSafe(rootDir, op.target, { allowMissing: true });
        if (diskHash !== op.new_hash) {
          throw new XSpecError(
            ErrorCodes.E007_MERGE_FAILED,
            `Verification hash mismatch on '${op.target}' during VERIFYING (expected ${op.new_hash}, found ${diskHash}).`,
            { file: op.target }
          );
        }
        op.status = OperationStatuses.VERIFIED;
      } else if (op.type === 'ARCHIVE_CHANGE') {
        for (const [relInArchive, expectedHash] of Object.entries(journal.archive_manifest)) {
          const fullArchivePath = `${archiveTargetRel}/${relInArchive}`;
          const diskHash = hashFileSafe(rootDir, fullArchivePath, { allowMissing: true });
          if (diskHash !== expectedHash) {
            throw new XSpecError(
              ErrorCodes.E007_MERGE_FAILED,
              `Verification hash mismatch on archived file '${fullArchivePath}'.`,
              { file: fullArchivePath }
            );
          }
        }
        op.status = OperationStatuses.VERIFIED;
      }
    }

    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook('VERIFYING_END', { journal });
    }

    // =========================================================================
    // ESTÁGIO 8: FINALIZING -> COMPLETED
    // =========================================================================
    journal.state = JournalStates.FINALIZING;
    saveJournalDurable(rootDir, journal);

    if (typeof faultHook === 'function') {
      faultHook('FINALIZING_BEFORE_CLEANUP', { journal });
    }

    const absActiveChange = resolveContainedPath(rootDir, changeRelDir);
    if (fs.existsSync(absActiveChange)) {
      fs.rmSync(absActiveChange, { recursive: true, force: true });
    }

    const absStaging = resolveContainedPath(rootDir, stagingDirRel);
    if (fs.existsSync(absStaging)) {
      fs.rmSync(absStaging, { recursive: true, force: true });
    }

    if (typeof faultHook === 'function') {
      faultHook('FINALIZING_BEFORE_COMPLETED_MARK', { journal });
    }

    journal.state = JournalStates.COMPLETED;
    saveJournalDurable(rootDir, journal);
    lockHandle.release();
    lockHandle = null;

    return createDiagnosticEnvelope({
      command: 'merge',
      changeId,
      schemaVersion,
      profile,
      blockArchiveOnHigh,
      diagnostics: [],
      data: {
        transaction_id: txId,
        state: JournalStates.COMPLETED,
        archive_path: archiveTargetRel,
        capabilities_merged: computedSpecs.map((s) => ({
          capability: s.capability,
          existed_before: s.existedBefore,
          counts: s.counts,
          new_hash: s.newHash,
        })),
      },
    });
  } catch (err) {
    // Em testes de queda abrupta de energia / SIGKILL, re-lança sem rodar catch recovery
    if (simulateHardKill) {
      throw err;
    }

    let recoveryOutcome = null;
    if (journal) {
      try {
        recoveryOutcome = recoverSingleTransaction(rootDir, journal, { releaseLock: true });
        lockHandle = null;
      } catch (recErr) {
        return createDiagnosticEnvelope({
          command: 'merge',
          changeId,
          schemaVersion,
          profile,
          blockArchiveOnHigh,
          diagnostics: [
            err.toDiagnostic
              ? err.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E007_MERGE_FAILED,
                  severity: Severities.CRITICAL,
                  message: err.message,
                }),
            recErr.toDiagnostic
              ? recErr.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E009_TRANSACTION_PENDING,
                  severity: Severities.CRITICAL,
                  message: recErr.message,
                }),
          ],
        });
      }
    } else if (lockHandle) {
      lockHandle.release();
      lockHandle = null;
    }

    const diag = err.toDiagnostic
      ? err.toDiagnostic()
      : createDiagnostic({
          code: ErrorCodes.E007_MERGE_FAILED,
          severity: Severities.CRITICAL,
          message: err.message,
        });

    return createDiagnosticEnvelope({
      command: 'merge',
      changeId,
      schemaVersion,
      profile,
      blockArchiveOnHigh,
      diagnostics: [diag],
      data: {
        transaction_id: journal?.transaction_id || null,
        recovery: recoveryOutcome,
      },
    });
  }
}
