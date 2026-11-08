#!/usr/bin/env node
/**
 * X-Spec Engine v2.0.1 — CLI Determinística Oficial
 * Zero-dependency executable
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENGINE_VERSION,
  CURRENT_SCHEMA_VERSION,
  ErrorCodes,
  Severities,
  XSpecError,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../lib/errors/codes.mjs';
import { validateChange } from '../lib/validators/artifact-validator.mjs';
import { verifyAndRecordEvidence } from '../lib/traceability/evidence-store.mjs';
import { snapshotBaseSpecs } from '../lib/concurrency/hash-tracker.mjs';
import { detectActiveConflicts, listActiveChangeIds } from '../lib/concurrency/conflict-detector.mjs';
import { computeMergedLivingSpec } from '../lib/transaction/delta-merger.mjs';
import { executeTransactionalMerge } from '../lib/transaction/journal-merge.mjs';
import { recoverWorkspace } from '../lib/recovery/recovery-manager.mjs';
import { runDoctor } from '../lib/doctor/doctor.mjs';
import { discoverSpecCapabilities } from '../lib/validators/artifact-validator.mjs';
import { readTextFileSafe } from '../lib/security/path-guard.mjs';

const SUPPORTED_COMMANDS = new Set([
  'validate',
  'verify',
  'snapshot-base',
  'conflicts',
  'merge',
  'recover',
  'doctor',
]);

function parseCliArgs(argv) {
  const flags = {
    command: null,
    stage: 'close',
    change: null,
    allowDirty: false,
    recoverLock: false,
    dryRun: false,
    failAt: null,
    fix: false,
    json: false,
    attestation: null,
    root: process.cwd(),
    help: false,
    version: false,
    unknownFlags: [],
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('-') && !flags.command) {
      flags.command = arg;
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--version' || arg === '-v') {
      flags.version = true;
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--allow-dirty') {
      flags.allowDirty = true;
    } else if (arg === '--recover-lock' || arg === '--force-orphan-lock') {
      flags.recoverLock = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--fix') {
      flags.fix = true;
    } else if (arg === '--stage' && i + 1 < argv.length) {
      flags.stage = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--stage=')) {
      flags.stage = arg.slice('--stage='.length);
    } else if ((arg === '--change' || arg === '-c') && i + 1 < argv.length) {
      flags.change = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--change=')) {
      flags.change = arg.slice('--change='.length);
    } else if (arg === '--attest' && i + 1 < argv.length) {
      flags.attestation = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--attest=')) {
      flags.attestation = arg.slice('--attest='.length);
    } else if (arg === '--fail-at' && i + 1 < argv.length) {
      flags.failAt = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--fail-at=')) {
      flags.failAt = arg.slice('--fail-at='.length);
    } else if (arg === '--root' && i + 1 < argv.length) {
      flags.root = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--root=')) {
      flags.root = path.resolve(arg.slice('--root='.length));
    } else if (!arg.startsWith('-') && !flags.change) {
      flags.change = arg;
    } else {
      flags.unknownFlags.push(arg);
    }
    i += 1;
  }

  return flags;
}

function resolveActiveChangeId(rootDir, requestedChange) {
  const activeDirs = listActiveChangeIds(rootDir);

  if (requestedChange) {
    if (activeDirs.includes(requestedChange)) {
      return { ok: true, changeId: requestedChange };
    }
    const prefixMatches = activeDirs.filter(
      (dir) => dir.startsWith(`${requestedChange}-`) || dir === requestedChange
    );
    if (prefixMatches.length === 1) {
      return { ok: true, changeId: prefixMatches[0] };
    }
    return {
      ok: false,
      diagnostic: createDiagnostic({
        code: ErrorCodes.E004_MISSING_REFERENCE,
        severity: Severities.CRITICAL,
        file: `xspec/changes/${requestedChange}`,
        line: 1,
        message: `Active change '${requestedChange}' not found in xspec/changes/.`,
        fix: `Available active changes: ${activeDirs.join(', ') || '(none)'}.`,
      }),
    };
  }

  if (activeDirs.length === 1) {
    return { ok: true, changeId: activeDirs[0] };
  }

  if (activeDirs.length === 0) {
    return {
      ok: false,
      diagnostic: createDiagnostic({
        code: ErrorCodes.E004_MISSING_REFERENCE,
        severity: Severities.CRITICAL,
        file: 'xspec/changes',
        line: 1,
        message: 'No active changes found in xspec/changes/.',
        fix: 'Create a change with /xspec-define or specify --change <id>.',
      }),
    };
  }

  return {
    ok: false,
    diagnostic: createDiagnostic({
      code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
      severity: Severities.CRITICAL,
      file: 'xspec/changes',
      line: 1,
      message: `Multiple active changes found (${activeDirs.join(', ')}); specify '--change <id>'.`,
      fix: 'Pass --change <id> explicitly.',
    }),
  };
}

function printOutput(envelope, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
    return;
  }

  const icon = envelope.ok ? '✅' : '❌';
  process.stdout.write(
    `${icon} [X-Spec v${envelope.engine_version}] command=${envelope.command}${
      envelope.stage ? ` stage=${envelope.stage}` : ''
    }${envelope.change_id ? ` change=${envelope.change_id}` : ''} -> ${envelope.summary?.verdict || (envelope.ok ? 'CONVERGED' : 'DIVERGED')}\n`
  );

  if (Array.isArray(envelope.diagnostics) && envelope.diagnostics.length > 0) {
    for (const d of envelope.diagnostics) {
      const loc = d.file ? `${d.file}${d.line ? `:${d.line}` : ''}` : 'workspace';
      process.stdout.write(
        `  - [${d.severity}] ${d.code} (${loc}): ${d.message}${d.fix ? `\n    Fix: ${d.fix}` : ''}\n`
      );
    }
  }
}

function printHelp() {
  const helpText = `X-Spec Deterministic Engine v${ENGINE_VERSION} (schema v${CURRENT_SCHEMA_VERSION})

Usage:
  xspec <command> [options]

Commands:
  validate        Validate project and change artifacts for a lifecycle stage
                  Options: --stage <define|plan|build|pre-close|close> --change <id> [--json]
  verify          Execute pre-close validation, run verification commands, and record SHA-256 evidence
                  Options: --change <id> [--attest <tag>] [--json]
  snapshot-base   Capture SHA-256 base hashes of Living Specs into .xspec.yaml
                  Options: --change <id> [--json]
  conflicts       Detect capability, file, and dependency conflicts across active changes
                  Options: [--change <id>] [--json]
  merge           Execute 8-stage journaled merge of delta specs and archive the change
                  Options: --change <id> [--allow-dirty] [--dry-run] [--json]
  recover         Recover interrupted merge transactions and orphan locks
                  Options: [--recover-lock] [--json]
  doctor          Inspect runtime, directories, Living Specs, locks, journals, and agent bridges
                  Options: [--fix] [--json]

Global Options:
  --root <path>   Project root directory (default: current working directory)
  --json          Emit machine-readable JSON diagnostic envelope
  --version, -v   Print engine and schema version
  --help, -h      Print this help text
`;
  process.stdout.write(helpText);
}

export function runCli(argv = process.argv.slice(2)) {
  const flags = parseCliArgs(argv);

  if (flags.version && !flags.command) {
    if (flags.json) {
      process.stdout.write(
        `${JSON.stringify(
          { engine_version: ENGINE_VERSION, schema_version: CURRENT_SCHEMA_VERSION },
          null,
          2
        )}\n`
      );
    } else {
      process.stdout.write(`xspec v${ENGINE_VERSION} (schema v${CURRENT_SCHEMA_VERSION})\n`);
    }
    return 0;
  }

  if (flags.help || !flags.command) {
    printHelp();
    return flags.help ? 0 : 2;
  }

  if (flags.unknownFlags.length > 0 || !SUPPORTED_COMMANDS.has(flags.command)) {
    const msg = !SUPPORTED_COMMANDS.has(flags.command)
      ? `Unknown command: '${flags.command}'.`
      : `Unknown flags: ${flags.unknownFlags.join(', ')}.`;
    const envelope = createDiagnosticEnvelope({
      command: flags.command || 'unknown',
      changeId: flags.change,
      diagnostics: [
        createDiagnostic({
          code: ErrorCodes.E003_INVALID_SCENARIO,
          severity: Severities.CRITICAL,
          file: 'cli',
          line: 1,
          message: msg,
          fix: 'Run `xspec --help` for valid commands and options.',
        }),
      ],
    });
    printOutput(envelope, flags.json);
    return 2;
  }

  const rootDir = flags.root;

  try {
    switch (flags.command) {
      case 'doctor': {
        const res = runDoctor(rootDir, { fix: flags.fix });
        printOutput(res.envelope, flags.json);
        return res.exit_code;
      }

      case 'conflicts': {
        const envelope = detectActiveConflicts(rootDir, {
          focusChangeId: flags.change,
          blockOnOverlap: true,
        });
        printOutput(envelope, flags.json);
        return envelope.ok ? 0 : 1;
      }

      case 'snapshot-base': {
        const resolved = resolveActiveChangeId(rootDir, flags.change);
        if (!resolved.ok) {
          const envelope = createDiagnosticEnvelope({
            command: 'snapshot-base',
            changeId: flags.change,
            diagnostics: [resolved.diagnostic],
          });
          printOutput(envelope, flags.json);
          return 1;
        }
        const envelope = snapshotBaseSpecs(rootDir, resolved.changeId);
        printOutput(envelope, flags.json);
        return envelope.ok ? 0 : 1;
      }

      case 'validate': {
        const resolved = resolveActiveChangeId(rootDir, flags.change);
        if (!resolved.ok) {
          const envelope = createDiagnosticEnvelope({
            command: 'validate',
            stage: flags.stage,
            changeId: flags.change,
            diagnostics: [resolved.diagnostic],
          });
          printOutput(envelope, flags.json);
          return 1;
        }
        const envelope = validateChange({
          rootDir,
          changeId: resolved.changeId,
          stage: flags.stage,
        });
        printOutput(envelope, flags.json);
        const hasFatal = envelope.diagnostics.some(
          (d) => d.code === ErrorCodes.E011_SECURITY_VIOLATION
        );
        return envelope.ok ? 0 : hasFatal ? 2 : 1;
      }

      case 'verify': {
        const resolved = resolveActiveChangeId(rootDir, flags.change);
        if (!resolved.ok) {
          const envelope = createDiagnosticEnvelope({
            command: 'verify',
            changeId: flags.change,
            diagnostics: [resolved.diagnostic],
          });
          printOutput(envelope, flags.json);
          return 1;
        }
        const envelope = verifyAndRecordEvidence({
          rootDir,
          changeId: resolved.changeId,
          attestationTag: flags.attestation,
        });
        printOutput(envelope, flags.json);
        return envelope.ok ? 0 : 1;
      }

      case 'merge': {
        const resolved = resolveActiveChangeId(rootDir, flags.change);
        if (!resolved.ok) {
          const envelope = createDiagnosticEnvelope({
            command: 'merge',
            changeId: flags.change,
            diagnostics: [resolved.diagnostic],
          });
          printOutput(envelope, flags.json);
          return 1;
        }

        if (flags.dryRun) {
          const closeEnv = validateChange({
            rootDir,
            changeId: resolved.changeId,
            stage: 'close',
          });
          if (!closeEnv.ok) {
            printOutput({ ...closeEnv, command: 'merge' }, flags.json);
            return 1;
          }
          const caps = discoverSpecCapabilities(
            rootDir,
            `xspec/changes/${resolved.changeId}/specs`
          );
          const preview = [];
          for (const cap of caps) {
            const deltaRaw = readTextFileSafe(
              rootDir,
              `xspec/changes/${resolved.changeId}/specs/${cap}/spec.md`
            );
            const livingRaw = readTextFileSafe(rootDir, `xspec/specs/${cap}/spec.md`, {
              allowMissing: true,
            });
            const merged = computeMergedLivingSpec({ capability: cap, deltaRaw, livingRaw });
            preview.push({ capability: cap, counts: merged.counts, existed_before: merged.existedBefore });
          }
          const dryEnvelope = createDiagnosticEnvelope({
            command: 'merge',
            stage: 'close',
            changeId: resolved.changeId,
            diagnostics: [],
            data: { dry_run: true, capabilities: preview },
          });
          printOutput(dryEnvelope, flags.json);
          return 0;
        }

        const faultHook = flags.failAt
          ? (stageName) => {
              if (stageName === flags.failAt) {
                throw new XSpecError(
                  ErrorCodes.E007_MERGE_FAILED,
                  `Simulated fault injected at stage '${stageName}'.`
                );
              }
            }
          : null;

        const envelope = executeTransactionalMerge({
          rootDir,
          changeId: resolved.changeId,
          allowDirty: flags.allowDirty,
          faultHook,
          simulateHardKill: Boolean(flags.failAt),
        });
        printOutput(envelope, flags.json);
        return envelope.ok ? 0 : 1;
      }

      case 'recover': {
        const envelope = recoverWorkspace(rootDir, {
          recoverLock: flags.recoverLock,
        });
        printOutput(envelope, flags.json);
        return envelope.ok ? 0 : 1;
      }

      default:
        return 2;
    }
  } catch (err) {
    const diag = err?.toDiagnostic
      ? err.toDiagnostic()
      : createDiagnostic({
          code: ErrorCodes.E007_MERGE_FAILED,
          severity: Severities.CRITICAL,
          file: 'bin/xspec.mjs',
          line: 1,
          message: err?.message || String(err),
        });
    const envelope = createDiagnosticEnvelope({
      command: flags.command,
      stage: flags.stage,
      changeId: flags.change,
      diagnostics: [diag],
    });
    printOutput(envelope, flags.json);
    return err?.code === ErrorCodes.E011_SECURITY_VIOLATION ? 2 : 1;
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() ===
    path.resolve(fileURLToPath(import.meta.url)).toLowerCase();

if (isMain) {
  const code = runCli(process.argv.slice(2));
  process.exit(code);
}
