/**
 * X-Spec Engine v2.0.1 — Detector de Conflitos e Dependências entre Mudanças Ativas (Entrega 4)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ErrorCodes,
  Severities,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../errors/codes.mjs';
import { resolveContainedPath, readTextFileSafe } from '../security/path-guard.mjs';
import { parseYamlSubset } from '../parser/yaml-subset.mjs';
import { discoverSpecCapabilities, loadAndValidateConfig } from '../validators/artifact-validator.mjs';
import { verifyBaseSpecsIntegrity } from './hash-tracker.mjs';

/**
 * Lista todos os IDs de mudanças ativas em `xspec/changes/` (excluindo `archive`).
 */
export function listActiveChangeIds(rootDir) {
  const changesRel = 'xspec/changes';
  const absChanges = resolveContainedPath(rootDir, changesRel);
  if (!fs.existsSync(absChanges)) return [];

  const entries = fs.readdirSync(absChanges, { withFileTypes: true });
  const ids = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'archive' || entry.name.startsWith('.')) continue;
    resolveContainedPath(rootDir, path.join(absChanges, entry.name));
    ids.push(entry.name);
  }
  return ids.sort();
}

/**
 * Verifica se uma mudança já foi arquivada em `xspec/changes/archive/`.
 */
export function isChangeArchived(rootDir, depChangeId) {
  const archiveRel = 'xspec/changes/archive';
  const absArchive = resolveContainedPath(rootDir, archiveRel);
  if (!fs.existsSync(absArchive)) return false;

  const entries = fs.readdirSync(absArchive, { withFileTypes: true });
  return entries.some(
    (e) =>
      e.isDirectory() &&
      (e.name === depChangeId || e.name.endsWith(`-${depChangeId}`))
  );
}

/**
 * Detecta ciclos em grafos de dependência `depends_on`.
 */
function findDependencyCycles(depGraph) {
  const visited = new Set();
  const inStack = new Set();
  const cycles = [];

  function dfs(node, pathStack) {
    visited.add(node);
    inStack.add(node);

    const neighbors = depGraph.get(node) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next, [...pathStack, next]);
      } else if (inStack.has(next)) {
        const idx = pathStack.indexOf(next);
        cycles.push([...pathStack.slice(idx), next]);
      }
    }

    inStack.delete(node);
  }

  for (const node of depGraph.keys()) {
    if (!visited.has(node)) {
      dfs(node, [node]);
    }
  }

  return cycles;
}

/**
 * Analisa todas as mudanças ativas e detecta:
 * 1. Divergência de `base_specs` (hash SHA-256 alterado externamente ou por outro merge).
 * 2. Inconsistência entre `touched_capabilities` e diretórios reais em `specs/`.
 * 3. Sobreposição de capacidades tocadas entre mudanças ativas concorrentes.
 * 4. Sobreposição de `impacted_files` entre mudanças ativas concorrentes.
 * 5. Ciclos de dependência (`depends_on`) ou dependências ainda não arquivadas antes do merge.
 */
export function detectActiveConflicts(rootDir, { focusChangeId = null, blockOnOverlap = false } = {}) {
  const { config } = loadAndValidateConfig(rootDir);
  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;

  const activeIds = listActiveChangeIds(rootDir);
  const diagnostics = [];

  const changeRecords = new Map();
  const depGraph = new Map();

  for (const id of activeIds) {
    const changeRel = `xspec/changes/${id}`;
    const metaRel = `${changeRel}/.xspec.yaml`;
    const metaRaw = readTextFileSafe(rootDir, metaRel, { allowMissing: true });
    let meta = {};
    if (metaRaw !== null) {
      try {
        meta = parseYamlSubset(metaRaw, { file: metaRel });
      } catch (err) {
        if (!focusChangeId || focusChangeId === id) {
          diagnostics.push(
            err.toDiagnostic
              ? err.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E001_INVALID_YAML,
                  severity: Severities.CRITICAL,
                  file: metaRel,
                  message: err.message,
                })
          );
        }
      }
    }

    const actualCaps = discoverSpecCapabilities(rootDir, `${changeRel}/specs`);
    const declaredCaps = Array.isArray(meta.touched_capabilities)
      ? meta.touched_capabilities.map((c) => String(c).trim())
      : [];
    const effectiveCaps = Array.from(new Set([...actualCaps, ...declaredCaps])).sort();
    const impactedFiles = Array.isArray(meta.impacted_files)
      ? meta.impacted_files.map((f) => String(f).trim().replace(/\\/g, '/'))
      : [];
    const dependsOn = Array.isArray(meta.depends_on)
      ? meta.depends_on.map((d) => String(d).trim())
      : [];

    changeRecords.set(id, {
      id,
      metaRel,
      meta,
      effectiveCaps,
      impactedFiles,
      dependsOn,
    });
    depGraph.set(id, dependsOn);

    if (!focusChangeId || focusChangeId === id) {
      const baseIntegrity = verifyBaseSpecsIntegrity(rootDir, id);
      diagnostics.push(...baseIntegrity.diagnostics);
    }
  }

  // 1. Verifica ciclos em depends_on
  const cycles = findDependencyCycles(depGraph);
  for (const cycle of cycles) {
    if (!focusChangeId || cycle.includes(focusChangeId)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
          severity: Severities.CRITICAL,
          file: `xspec/changes/${cycle[0]}/.xspec.yaml`,
          line: 1,
          target: 'depends_on',
          message: `Circular dependency detected between changes: ${cycle.join(' -> ')}.`,
          fix: 'Break the dependency cycle in .xspec.yaml depends_on.',
        })
      );
    }
  }

  // 2. Verifica dependências pendentes (não arquivadas)
  for (const [id, rec] of changeRecords.entries()) {
    if (focusChangeId && focusChangeId !== id) continue;
    for (const depId of rec.dependsOn) {
      if (changeRecords.has(depId)) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: blockOnOverlap ? Severities.CRITICAL : Severities.HIGH,
            file: rec.metaRel,
            line: 1,
            target: `depends_on -> ${depId}`,
            message: `Change '${id}' depends on active change '${depId}', which has not been merged/archived yet.`,
            fix: `Complete and merge '${depId}' before closing '${id}'.`,
          })
        );
      } else if (!isChangeArchived(rootDir, depId)) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: Severities.CRITICAL,
            file: rec.metaRel,
            line: 1,
            target: `depends_on -> ${depId}`,
            message: `Change '${id}' depends on unknown change '${depId}' (neither active nor archived).`,
            fix: `Remove '${depId}' from depends_on or verify the change ID.`,
          })
        );
      }
    }
  }

  // 3. Verifica sobreposição de capabilities e impacted_files entre pares de mudanças ativas
  const overlapSeverity = blockOnOverlap ? Severities.CRITICAL : Severities.HIGH;
  const ids = Array.from(changeRecords.keys());
  const capabilityCollisions = [];
  const fileCollisions = [];

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = changeRecords.get(ids[i]);
      const b = changeRecords.get(ids[j]);
      if (focusChangeId && a.id !== focusChangeId && b.id !== focusChangeId) {
        continue;
      }

      const sharedCaps = a.effectiveCaps.filter((c) => b.effectiveCaps.includes(c));
      if (sharedCaps.length > 0) {
        capabilityCollisions.push({ changes: [a.id, b.id], capabilities: sharedCaps });
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: overlapSeverity,
            file: focusChangeId === b.id ? b.metaRel : a.metaRel,
            line: 1,
            target: sharedCaps.join(', '),
            message: `Concurrent active changes '${a.id}' and '${b.id}' modify the same capability(ies): ${sharedCaps.join(', ')}.`,
            fix: `Declare explicit ordering via 'depends_on' in .xspec.yaml and refresh 'base_specs' after the first change merges.`,
          })
        );
      }

      const sharedFiles = a.impactedFiles.filter((f) => b.impactedFiles.includes(f));
      if (sharedFiles.length > 0) {
        fileCollisions.push({ changes: [a.id, b.id], files: sharedFiles });
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: overlapSeverity,
            file: focusChangeId === b.id ? b.metaRel : a.metaRel,
            line: 1,
            target: sharedFiles.join(', '),
            message: `Concurrent active changes '${a.id}' and '${b.id}' impact the same source file(s): ${sharedFiles.join(', ')}.`,
            fix: 'Coordinate implementation order or split overlapping source file edits.',
          })
        );
      }
    }
  }

  return createDiagnosticEnvelope({
    command: 'conflicts',
    changeId: focusChangeId,
    schemaVersion,
    profile,
    blockArchiveOnHigh,
    diagnostics,
    data: {
      active_changes: activeIds,
      capability_collisions: capabilityCollisions,
      file_collisions: fileCollisions,
    },
  });
}
