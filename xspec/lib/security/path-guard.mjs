/**
 * X-Spec Engine v2.0.1 — Segurança de Caminhos, Bloqueio de Symlinks, Detecção de Binários e Escrita Durável
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ErrorCodes, XSpecError } from '../errors/codes.mjs';

/**
 * Verifica se um caminho contém caracteres ilegais ou sequências maliciosas.
 */
export function assertSafeRelativeInput(inputPath, contextFile = null) {
  if (typeof inputPath !== 'string' || inputPath.trim().length === 0) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      'Invalid empty path provided.',
      { file: contextFile }
    );
  }
  if (inputPath.includes('\0')) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      'Path contains null byte (\\0).',
      { file: contextFile }
    );
  }
}

/**
 * Resolve e valida que targetPath está estritamente contido dentro de rootDir,
 * inspecionando cada segmento existente com lstatSync para bloquear symlinks.
 */
export function resolveContainedPath(rootDir, targetPath) {
  assertSafeRelativeInput(rootDir);
  assertSafeRelativeInput(targetPath);

  const resolvedRoot = fs.existsSync(rootDir) ? fs.realpathSync(rootDir) : path.resolve(rootDir);
  const candidate = path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(resolvedRoot, targetPath);

  const rel = path.relative(resolvedRoot, candidate);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Path traversal blocked: '${targetPath}' resolves outside project root.`,
      { file: targetPath, fix: 'Use only relative paths inside the project workspace.' }
    );
  }

  // Inspeciona cada segmento do caminho a partir de resolvedRoot para bloquear symlinks
  const segments = rel === '' ? [] : rel.split(path.sep);
  let current = resolvedRoot;
  for (const seg of segments) {
    current = path.join(current, seg);
    let stat = null;
    try {
      stat = fs.lstatSync(current);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        break; // segmento ainda não existe no disco
      }
      throw err;
    }
    if (stat.isSymbolicLink()) {
      throw new XSpecError(
        ErrorCodes.E011_SECURITY_VIOLATION,
        `Symbolic link blocked at '${path.relative(resolvedRoot, current).replace(/\\/g, '/')}'.`,
        {
          file: path.relative(resolvedRoot, current).replace(/\\/g, '/'),
          fix: 'Remove symbolic links from X-Spec artifacts and target files.',
        }
      );
    }
  }

  return candidate;
}

/**
 * Calcula hash SHA-256 canônico (normalizando CRLF para LF em strings para consistência entre SOs,
 * ou operando sobre Buffer bruto quando rawBuffer = true).
 */
export function sha256Text(text) {
  const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const digest = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
  return `sha256:${digest}`;
}

/**
 * Verifica se um Buffer contém bytes nulos (indicativo de arquivo binário não suportado).
 */
export function assertNotBinaryBuffer(buffer, displayPath) {
  if (buffer.includes(0x00)) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Unexpected binary content (null byte detected) in '${displayPath}'.`,
      {
        file: displayPath,
        fix: 'Ensure artifact and source files referenced by X-Spec are UTF-8 text files.',
      }
    );
  }
}

/**
 * Lê um arquivo de texto com proteção contra path traversal, symlinks e conteúdo binário.
 * Diferencia explicitamente arquivo inexistente (lança ENOENT ou retorna null se allowMissing=true)
 * de arquivo vazio (retorna "").
 */
export function readTextFileSafe(rootDir, targetPath, { allowMissing = false, normalizeEol = true } = {}) {
  const absPath = resolveContainedPath(rootDir, targetPath);
  const relDisplay = path.relative(path.resolve(rootDir), absPath).replace(/\\/g, '/');

  let stat;
  try {
    stat = fs.lstatSync(absPath);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      if (allowMissing) return null;
      throw err;
    }
    throw err;
  }

  if (stat.isSymbolicLink()) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Symbolic link blocked at '${relDisplay}'.`,
      { file: relDisplay }
    );
  }

  if (!stat.isFile()) {
    throw new XSpecError(
      ErrorCodes.E011_SECURITY_VIOLATION,
      `Expected regular file at '${relDisplay}', found directory or special file.`,
      { file: relDisplay }
    );
  }

  const rawBuffer = fs.readFileSync(absPath);
  assertNotBinaryBuffer(rawBuffer, relDisplay);

  const rawText = rawBuffer.toString('utf8').replace(/^\uFEFF/, '');
  return normalizeEol ? rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n') : rawText;
}

/**
 * Calcula o hash SHA-256 de um arquivo de texto contido em rootDir.
 */
export function hashFileSafe(rootDir, targetPath, { allowMissing = false } = {}) {
  const content = readTextFileSafe(rootDir, targetPath, { allowMissing, normalizeEol: true });
  if (content === null) return null;
  return sha256Text(content);
}

/**
 * Sincroniza o diretório pai quando suportado pelo sistema operacional.
 * Em POSIX (Linux/macOS), fsyncSync no descritor do diretório garante a persistência do rename.
 * Em Windows (NTFS), abrir/sincronizar diretório lança EPERM/EINVAL/EBADF/EISDIR, que é ignorado com segurança.
 */
export function syncParentDirectory(dirPath) {
  let dirFd = null;
  try {
    dirFd = fs.openSync(dirPath, 'r');
    fs.fsyncSync(dirFd);
  } catch (err) {
    const code = err?.code;
    if (code !== 'EPERM' && code !== 'EINVAL' && code !== 'EBADF' && code !== 'EISDIR' && code !== 'EACCES') {
      throw err;
    }
  } finally {
    if (dirFd !== null) {
      try {
        fs.closeSync(dirFd);
      } catch {
        // ignore close error on directory fd
      }
    }
  }
}

/**
 * Grava um arquivo de texto de forma durável e atômica no diretório:
 * 1. Valida contenção de caminho e ausência de symlinks em todos os ancestrais.
 * 2. Verifica ausência de null-byte no conteúdo.
 * 3. Grava em arquivo temporário no mesmo diretório, chama fs.fsyncSync(fd) e fecha o descritor.
 * 4. Renomeia sobre o destino final e sincroniza o diretório pai.
 * 5. Re-lê e retorna o hash SHA-256 confirmado no disco.
 */
export function writeFileDurable(rootDir, targetPath, content) {
  const absPath = resolveContainedPath(rootDir, targetPath);
  const relDisplay = path.relative(path.resolve(rootDir), absPath).replace(/\\/g, '/');

  const normalized = String(content).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const buffer = Buffer.from(normalized, 'utf8');
  assertNotBinaryBuffer(buffer, relDisplay);

  const parentDir = path.dirname(absPath);
  fs.mkdirSync(parentDir, { recursive: true });
  // Re-valida parentDir após criação para garantir que nenhum symlink intermediário foi usado
  resolveContainedPath(rootDir, parentDir);

  const uniqueSuffix = `${process.pid}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const tempPath = path.join(parentDir, `.xspec-tmp-${path.basename(absPath)}-${uniqueSuffix}`);

  let fd = null;
  try {
    fd = fs.openSync(tempPath, 'wx', 0o600);
    fs.writeFileSync(fd, buffer);
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;

    fs.renameSync(tempPath, absPath);
    syncParentDirectory(parentDir);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore cleanup error
    }
    throw err;
  }

  const verifiedHash = hashFileSafe(rootDir, absPath);
  const expectedHash = sha256Text(normalized);
  if (verifiedHash !== expectedHash) {
    throw new XSpecError(
      ErrorCodes.E007_MERGE_FAILED,
      `Durable write verification failed for '${relDisplay}': expected ${expectedHash}, got ${verifiedHash}.`,
      { file: relDisplay }
    );
  }

  return verifiedHash;
}
