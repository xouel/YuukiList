/**
 * X-Spec Engine v2.0.1 — Executor Seguro de Comandos Externos via spawnSync (G2)
 * Zero-dependency module
 */

import { spawnSync } from 'node:child_process';
import { ErrorCodes, XSpecError } from '../errors/codes.mjs';
import { resolveContainedPath, sha256Text } from './path-guard.mjs';

const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_TIMEOUT_MS = 600_000;
const MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10 MiB
const FORBIDDEN_METACHARS_RE = /[;|&`$><\r\n\0]/;

const ENV_WHITELIST_KEYS = Object.freeze([
  'PATH',
  'Path',
  'HOME',
  'USERPROFILE',
  'APPDATA',
  'LOCALAPPDATA',
  'SYSTEMROOT',
  'SystemRoot',
  'COMSPEC',
  'ComSpec',
  'TEMP',
  'TMP',
  'TMPDIR',
  'NODE_ENV',
  'NODE_OPTIONS',
  'CI',
  'LANG',
  'LC_ALL',
]);

/**
 * Constrói ambiente controlado por whitelist para o processo filho.
 */
export function buildControlledEnv(extraEnv = {}) {
  const cleanEnv = Object.create(null);
  for (const key of ENV_WHITELIST_KEYS) {
    if (process.env[key] !== undefined) {
      cleanEnv[key] = process.env[key];
    }
  }
  cleanEnv.FORCE_COLOR = '0';
  cleanEnv.NO_COLOR = '1';
  for (const [k, v] of Object.entries(extraEnv)) {
    if (typeof v === 'string') {
      cleanEnv[k] = v;
    }
  }
  return { ...cleanEnv };
}

/**
 * Tokeniza uma string de comando ("node --test tests/foo.test.mjs") em { command, args }
 * rejeitando metacaracteres de shell (; | & ` $ > <) e path traversal no executável.
 */
export function parseSafeCommandSpec(commandSpec) {
  if (typeof commandSpec === 'object' && commandSpec !== null) {
    const rawCmd = typeof commandSpec.command === 'string' ? commandSpec.command : commandSpec.cmd;
    if (typeof rawCmd === 'string' && rawCmd.trim().length > 0) {
      const cmd = rawCmd.trim();
      const args = Array.isArray(commandSpec.args) ? commandSpec.args.map(String) : [];
      validateTokens(cmd, args);
      return { command: cmd, args };
    }
  }

  if (typeof commandSpec !== 'string' || commandSpec.trim().length === 0) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      'Command specification must be a non-empty string or { command, args } object.'
    );
  }

  if (FORBIDDEN_METACHARS_RE.test(commandSpec)) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Command '${commandSpec}' contains forbidden shell metacharacters (; | & \` $ > <).`,
      { fix: 'Specify a direct executable and arguments without shell operators or pipes.' }
    );
  }

  // Tokenizador simples com suporte a aspas duplas/simples
  const tokens = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < commandSpec.length; i += 1) {
    const ch = commandSpec[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  if (quote) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Unclosed quote in command '${commandSpec}'.`
    );
  }
  if (current.length > 0) {
    tokens.push(current);
  }

  if (tokens.length === 0) {
    throw new XSpecError(ErrorCodes.E011_SECURITY_VIOLATION, 'Empty command tokens.');
  }

  const [command, ...args] = tokens;
  validateTokens(command, args);
  return { command, args };
}

function validateTokens(command, args) {
  if (!command || command.includes('..') || FORBIDDEN_METACHARS_RE.test(command)) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Invalid or unsafe executable '${command}'.`
    );
  }
  for (const arg of args) {
    if (FORBIDDEN_METACHARS_RE.test(arg)) {
      throw new XSpecError(
        ErrorCodes.E011_SECURITY_VIOLATION,
        `Argument '${arg}' contains forbidden shell metacharacters.`
      );
    }
  }
}

/**
 * Executa um único comando via spawnSync com shell: false e classifica o resultado (G2).
 */
export function runVerifiedCommand({
  rootDir,
  commandSpec,
  id = 'cmd-0',
  timeoutMs = DEFAULT_TIMEOUT_MS,
  verifiedRows = [],
}) {
  const safeCwd = resolveContainedPath(rootDir, '.');
  const { command, args } = parseSafeCommandSpec(commandSpec);
  const clampedTimeout = Math.min(Math.max(Number(timeoutMs) || DEFAULT_TIMEOUT_MS, 100), MAX_TIMEOUT_MS);

  const startedAtDate = new Date();
  const startHr = process.hrtime.bigint();

  let execCommand = command;
  let execArgs = args;

  if (process.platform === 'win32') {
    const isBatchOrWrapper =
      /\.(cmd|bat)$/i.test(command) ||
      ['npm', 'npx', 'pnpm', 'yarn', 'corepack'].includes(command.toLowerCase());
    if (isBatchOrWrapper) {
      execCommand = process.env.ComSpec || process.env.COMSPEC || 'cmd.exe';
      execArgs = ['/d', '/s', '/c', command, ...args];
    }
  }

  const res = spawnSync(execCommand, execArgs, {
    cwd: safeCwd,
    shell: false,
    timeout: clampedTimeout,
    maxBuffer: MAX_BUFFER_BYTES,
    encoding: 'utf8',
    windowsHide: true,
    env: buildControlledEnv(),
  });

  const endHr = process.hrtime.bigint();
  const durationMs = Math.max(0, Math.round(Number(endHr - startHr) / 1_000_000));

  const stdoutText = typeof res.stdout === 'string' ? res.stdout : '';
  const stderrText = typeof res.stderr === 'string' ? res.stderr : '';

  let status = 'PASSED';
  let failureKind = null;
  let exitCode = typeof res.status === 'number' ? res.status : null;
  let errorMessage = null;

  if (res.error) {
    const errCode = res.error.code;
    errorMessage = res.error.message;
    if (errCode === 'ENOENT' || errCode === 'EACCES') {
      status = 'ENV_ERROR';
      failureKind = 'spawn_error';
    } else if (errCode === 'ETIMEDOUT') {
      status = 'FAILED';
      failureKind = 'timeout_exceeded';
    } else if (errCode === 'ENOBUFS') {
      status = 'FAILED';
      failureKind = 'buffer_exceeded';
    } else {
      status = 'ENV_ERROR';
      failureKind = 'internal_exec_error';
    }
  } else if (res.signal !== null) {
    status = 'FAILED';
    failureKind = 'terminated_by_signal';
  } else if (res.status !== 0) {
    status = 'FAILED';
    failureKind = 'non_zero_exit';
  }

  return {
    id,
    command,
    args,
    started_at: startedAtDate.toISOString(),
    duration_ms: durationMs,
    exit_code: exitCode,
    signal: res.signal || null,
    status,
    failure_kind: failureKind,
    error_message: errorMessage,
    stdout_hash: sha256Text(stdoutText),
    stderr_excerpt: stderrText.slice(0, 500),
    verified_rows: verifiedRows,
  };
}
