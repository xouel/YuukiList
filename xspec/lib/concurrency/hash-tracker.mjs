/**
 * X-Spec Engine v2.0.1 — Rastreamento de Hashes SHA-256 de Origem (base_specs) e Capacidades Reais (Entrega 4)
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
import { parseYamlSubset } from '../parser/yaml-subset.mjs';
import { discoverSpecCapabilities, loadAndValidateConfig } from '../validators/artifact-validator.mjs';

/**
 * Calcula o mapa `base_specs` e a lista real de `touched_capabilities` a partir dos diretórios em `changes/<id>/specs/`.
 */
export function computeBaseSpecsForChange(rootDir, changeId) {
  const changeRelDir = `xspec/changes/${changeId}`;
  const capabilities = discoverSpecCapabilities(rootDir, `${changeRelDir}/specs`);
  const baseSpecs = Object.create(null);

  for (const cap of capabilities) {
    const livingRel = `xspec/specs/${cap}/spec.md`;
    const currentHash = hashFileSafe(rootDir, livingRel, { allowMissing: true });
    baseSpecs[cap] = currentHash !== null ? currentHash : 'NEW';
  }

  return {
    touchedCapabilities: capabilities,
    baseSpecs: { ...baseSpecs },
  };
}

/**
 * Serializa `.xspec.yaml` no subconjunto formal de YAML do X-Spec.
 */
export function serializeChangeMetadataYaml(meta) {
  const lines = [
    '# X-Spec Change Metadata (Managed by X-Spec Deterministic Engine)',
    `schema_version: ${meta.schema_version ?? 2}`,
    `id: "${String(meta.id || '').replace(/"/g, '\\"')}"`,
    `type: "${String(meta.type || 'feature').replace(/"/g, '\\"')}"`,
    `status: "${String(meta.status || 'DEFINED').replace(/"/g, '\\"')}"`,
    `skip_specs: ${meta.skip_specs === true ? 'true' : 'false'}`,
  ];

  const touched = Array.isArray(meta.touched_capabilities) ? meta.touched_capabilities : [];
  if (touched.length === 0) {
    lines.push('touched_capabilities: []');
  } else {
    lines.push('touched_capabilities:');
    for (const cap of touched) {
      lines.push(`  - "${String(cap).replace(/"/g, '\\"')}"`);
    }
  }

  const baseSpecs = meta.base_specs && typeof meta.base_specs === 'object' ? meta.base_specs : {};
  const baseKeys = Object.keys(baseSpecs).sort();
  if (baseKeys.length === 0) {
    lines.push('base_specs: {}');
  } else {
    lines.push('base_specs:');
    for (const k of baseKeys) {
      lines.push(`  ${k}: "${String(baseSpecs[k]).replace(/"/g, '\\"')}"`);
    }
  }

  const impacted = Array.isArray(meta.impacted_files) ? meta.impacted_files : [];
  if (impacted.length === 0) {
    lines.push('impacted_files: []');
  } else {
    lines.push('impacted_files:');
    for (const f of impacted) {
      lines.push(`  - "${String(f).replace(/\\/g, '/').replace(/"/g, '\\"')}"`);
    }
  }

  const dependsOn = Array.isArray(meta.depends_on) ? meta.depends_on : [];
  if (dependsOn.length === 0) {
    lines.push('depends_on: []');
  } else {
    lines.push('depends_on:');
    for (const dep of dependsOn) {
      lines.push(`  - "${String(dep).replace(/"/g, '\\"')}"`);
    }
  }

  lines.push(`updated_at: "${new Date().toISOString()}"`);
  return `${lines.join('\n')}\n`;
}

/**
 * Escaneia `xspec/changes/<changeId>/specs/`, sincroniza `touched_capabilities` e grava `base_specs` em `.xspec.yaml`.
 */
export function snapshotBaseSpecs(rootDir, changeId) {
  const { config } = loadAndValidateConfig(rootDir);
  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;

  const changeRelDir = `xspec/changes/${changeId}`;
  const metaRel = `${changeRelDir}/.xspec.yaml`;
  const existingRaw = readTextFileSafe(rootDir, metaRel, { allowMissing: true });

  let meta = {
    schema_version: 2,
    id: changeId,
    type: 'feature',
    status: 'DEFINED',
    skip_specs: false,
    touched_capabilities: [],
    base_specs: {},
    impacted_files: [],
    depends_on: [],
  };

  if (existingRaw !== null) {
    const parsed = parseYamlSubset(existingRaw, { file: metaRel });
    meta = { ...meta, ...parsed };
  }

  const { touchedCapabilities, baseSpecs } = computeBaseSpecsForChange(rootDir, changeId);
  meta.touched_capabilities = touchedCapabilities;
  meta.base_specs = baseSpecs;

  const serialized = serializeChangeMetadataYaml(meta);
  writeFileDurable(rootDir, metaRel, serialized);

  return createDiagnosticEnvelope({
    command: 'snapshot-base',
    changeId,
    schemaVersion,
    profile,
    blockArchiveOnHigh,
    diagnostics: [],
    data: {
      touched_capabilities: touchedCapabilities,
      base_specs: baseSpecs,
    },
  });
}

/**
 * Verifica integridade entre `.xspec.yaml`, os diretórios reais em `changes/<id>/specs/`
 * e os hashes SHA-256 atuais das Living Specs em `xspec/specs/`.
 * Nunca sobrescreve alterações externas.
 */
export function verifyBaseSpecsIntegrity(rootDir, changeId) {
  const diagnostics = [];
  const changeRelDir = `xspec/changes/${changeId}`;
  const metaRel = `${changeRelDir}/.xspec.yaml`;

  const metaRaw = readTextFileSafe(rootDir, metaRel, { allowMissing: true });
  if (metaRaw === null) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: metaRel,
        line: 1,
        message: `Missing '${metaRel}'.`,
      })
    );
    return { ok: false, diagnostics, meta: null, actualCapabilities: [] };
  }

  let meta;
  try {
    meta = parseYamlSubset(metaRaw, { file: metaRel });
  } catch (err) {
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
    return { ok: false, diagnostics, meta: null, actualCapabilities: [] };
  }

  const skipSpecs = meta.skip_specs === true;
  const actualCapabilities = discoverSpecCapabilities(rootDir, `${changeRelDir}/specs`);
  const declaredCapabilities = Array.isArray(meta.touched_capabilities)
    ? [...meta.touched_capabilities].map((c) => String(c).trim()).sort()
    : [];

  if (!skipSpecs) {
    if (actualCapabilities.join('|') !== declaredCapabilities.join('|')) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
          severity: Severities.CRITICAL,
          file: metaRel,
          line: 1,
          target: 'touched_capabilities',
          message: `Declared touched_capabilities ([${declaredCapabilities.join(', ')}]) do not match actual delta capabilities ([${actualCapabilities.join(', ')}]).`,
          fix: `Run 'node xspec/bin/xspec.mjs snapshot-base ${changeId}' to synchronize metadata with actual delta directories.`,
        })
      );
    }

    const baseSpecs = meta.base_specs && typeof meta.base_specs === 'object' ? meta.base_specs : {};
    for (const cap of actualCapabilities) {
      const recordedHash = baseSpecs[cap] ?? baseSpecs[`${cap}/spec.md`] ?? null;
      const livingRel = `xspec/specs/${cap}/spec.md`;
      const currentLivingHash = hashFileSafe(rootDir, livingRel, { allowMissing: true }) ?? 'NEW';

      if (!recordedHash) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: Severities.CRITICAL,
            file: metaRel,
            line: 1,
            target: `base_specs.${cap}`,
            message: `Missing base_specs hash for capability '${cap}' in '${metaRel}'.`,
            fix: `Run 'node xspec/bin/xspec.mjs snapshot-base ${changeId}'.`,
          })
        );
      } else if (recordedHash !== currentLivingHash) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
            severity: Severities.CRITICAL,
            file: livingRel,
            line: 1,
            target: cap,
            message: `Concurrency conflict on capability '${cap}': base_specs hash is '${recordedHash}', but current Living Spec hash on disk is '${currentLivingHash}'.`,
            fix: 'Inspect external/concurrent modifications to the Living Spec, reconcile your delta spec, and re-run snapshot-base.',
          })
        );
      }
    }
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics,
    meta,
    actualCapabilities,
  };
}
