/**
 * X-Spec Engine v2.0.1 — Validador Determinístico de Artefatos por Estágio (E001..E012)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ErrorCodes,
  Severities,
  SUPPORTED_SCHEMA_VERSIONS,
  createDiagnostic,
  createDiagnosticEnvelope,
} from '../errors/codes.mjs';
import { resolveContainedPath, readTextFileSafe, hashFileSafe } from '../security/path-guard.mjs';
import { parseYamlSubset } from '../parser/yaml-subset.mjs';
import { parseMarkdownDocument } from '../parser/markdown-ast.mjs';
import { getStageRules, ValidationStages } from './stage-matrix.mjs';
import { validateTraceabilityMatrix } from '../traceability/matrix-parser.mjs';

const ALLOWED_PROFILES = new Set(['minimal', 'standard', 'strict']);

/**
 * Descobre recursivamente todos os arquivos spec.md sob um diretório `specs/`.
 * Retorna lista de capability paths em formato POSIX (ex: "auth", "identity/user-auth").
 */
export function discoverSpecCapabilities(rootDir, specsBaseRelDir) {
  const absBase = resolveContainedPath(rootDir, specsBaseRelDir);
  if (!fs.existsSync(absBase)) return [];

  const capabilities = [];
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      // Verifica se não é symlink via resolveContainedPath
      resolveContainedPath(rootDir, fullPath);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === 'spec.md') {
        const capRel = path.relative(absBase, path.dirname(fullPath)).replace(/\\/g, '/');
        if (capRel && capRel !== '.') {
          capabilities.push(capRel);
        }
      }
    }
  }

  walk(absBase);
  return capabilities.sort();
}

/**
 * Carrega e valida xspec/config.yaml.
 */
export function loadAndValidateConfig(rootDir) {
  const diagnostics = [];
  const configRel = 'xspec/config.yaml';
  let raw;
  try {
    raw = readTextFileSafe(rootDir, configRel, { allowMissing: true });
  } catch (err) {
    diagnostics.push(
      createDiagnostic({
        code: err.code || ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: configRel,
        message: err.message,
      })
    );
    return { config: null, diagnostics };
  }

  if (raw === null) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: configRel,
        line: 1,
        message: "Missing project configuration file 'xspec/config.yaml'.",
        fix: 'Initialize X-Spec with xspec/config.yaml.',
      })
    );
    return { config: null, diagnostics };
  }

  let parsed;
  try {
    parsed = parseYamlSubset(raw, { file: configRel });
  } catch (err) {
    diagnostics.push(
      err.toDiagnostic
        ? err.toDiagnostic()
        : createDiagnostic({
            code: ErrorCodes.E001_INVALID_YAML,
            severity: Severities.CRITICAL,
            file: configRel,
            message: err.message,
          })
    );
    return { config: null, diagnostics };
  }

  const version = parsed.version ?? 1;
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(version)) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: configRel,
        line: 1,
        message: `Unsupported schema version '${version}' in xspec/config.yaml. Supported: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}.`,
        fix: 'Set version: 2 in xspec/config.yaml.',
      })
    );
  }

  const profile = parsed.profile || 'standard';
  if (!ALLOWED_PROFILES.has(profile)) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: configRel,
        line: 1,
        message: `Invalid profile '${profile}' in xspec/config.yaml. Allowed: minimal, standard, strict.`,
        fix: 'Use profile: "minimal", "standard", or "strict".',
      })
    );
  }

  return { config: parsed, diagnostics };
}

/**
 * Converte erros de sintaxe/headings do Markdown AST em diagnósticos estruturados.
 */
function collectAstSyntaxDiagnostics(ast, relFile, defaultCode = ErrorCodes.E003_INVALID_SCENARIO) {
  const diagnostics = [];
  for (const err of ast.syntaxErrors) {
    diagnostics.push(
      createDiagnostic({
        code: defaultCode,
        severity: Severities.CRITICAL,
        file: relFile,
        line: err.line,
        message: err.message,
        fix: 'Close all opened code fences (```) and HTML comments (<!-- -->).',
      })
    );
  }
  for (const mh of ast.malformedHeadings) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E003_INVALID_SCENARIO,
        severity: Severities.HIGH,
        file: relFile,
        line: mh.line,
        target: mh.raw,
        message: mh.reason,
        fix: "Use '### Requirement: <Name>' (3 #) and '#### Scenario: <Name>' (4 #).",
      })
    );
  }
  for (const dup of ast.duplicateH2Sections) {
    diagnostics.push(
      createDiagnostic({
        code: defaultCode,
        severity: Severities.HIGH,
        file: relFile,
        line: dup.duplicateLine,
        target: `## ${dup.title}`,
        message: `Duplicate H2 section '## ${dup.title}' at line ${dup.duplicateLine} (first defined at line ${dup.firstLine}).`,
        fix: `Consolidate '## ${dup.title}' into a single section.`,
      })
    );
  }
  for (const mt of ast.malformedTables) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E005_TRACEABILITY_INCOMPLETE,
        severity: Severities.HIGH,
        file: relFile,
        line: mt.line,
        target: mt.section,
        message: mt.reason,
        fix: 'Ensure every Markdown table row starts and ends with "|" and matches the header column count.',
      })
    );
  }
  return diagnostics;
}

/**
 * Carrega o pacote de evidências reais de .xspec/evidence/<changeId>/ se existir.
 */
export function loadEvidenceBundle(rootDir, changeId) {
  const baseRel = `.xspec/evidence/${changeId}`;
  const testResultsRaw = readTextFileSafe(rootDir, `${baseRel}/test-results.json`, { allowMissing: true });
  const checksumsRaw = readTextFileSafe(rootDir, `${baseRel}/checksums.json`, { allowMissing: true });
  const validationRaw = readTextFileSafe(rootDir, `${baseRel}/validation.json`, { allowMissing: true });

  if (!testResultsRaw || !checksumsRaw) {
    return null;
  }

  try {
    return {
      testResults: JSON.parse(testResultsRaw),
      checksums: JSON.parse(checksumsRaw),
      validation: validationRaw ? JSON.parse(validationRaw) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Valida integralmente uma mudança em `xspec/changes/<changeId>` de acordo com o estágio.
 */
export function validateChange({
  rootDir,
  changeId,
  stage = ValidationStages.CLOSE,
}) {
  const stageRules = getStageRules(stage);
  const { config, diagnostics: configDiags } = loadAndValidateConfig(rootDir);
  const diagnostics = [...configDiags];

  const profile = config?.profile || 'standard';
  const blockArchiveOnHigh = config?.verification?.block_archive_on_high !== false;
  const schemaVersion = config?.version || 2;

  const changeRelDir = `xspec/changes/${changeId}`;
  let changeAbsDir;
  try {
    changeAbsDir = resolveContainedPath(rootDir, changeRelDir);
  } catch (err) {
    diagnostics.push(err.toDiagnostic ? err.toDiagnostic() : createDiagnostic({
      code: ErrorCodes.E011_SECURITY_VIOLATION,
      severity: Severities.CRITICAL,
      file: changeRelDir,
      message: err.message,
    }));
    return createDiagnosticEnvelope({
      command: 'validate',
      stage: stageRules.stage,
      changeId,
      schemaVersion,
      profile,
      blockArchiveOnHigh,
      diagnostics,
    });
  }

  if (!fs.existsSync(changeAbsDir)) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E004_MISSING_REFERENCE,
        severity: Severities.CRITICAL,
        file: changeRelDir,
        message: `Change directory '${changeRelDir}' does not exist.`,
        fix: `Verify change ID '${changeId}' inside 'xspec/changes/'.`,
      })
    );
    return createDiagnosticEnvelope({
      command: 'validate',
      stage: stageRules.stage,
      changeId,
      schemaVersion,
      profile,
      blockArchiveOnHigh,
      diagnostics,
    });
  }

  // 1. Valida .xspec.yaml da mudança
  const metaRel = `${changeRelDir}/.xspec.yaml`;
  let meta = {};
  const metaRaw = readTextFileSafe(rootDir, metaRel, { allowMissing: true });
  if (metaRaw === null) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.CRITICAL,
        file: metaRel,
        line: 1,
        message: `Missing metadata file '${metaRel}'.`,
        fix: 'Create .xspec.yaml in the change folder.',
      })
    );
  } else {
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
    }
  }

  const skipSpecs = meta.skip_specs === true;
  if (skipSpecs && meta.type && meta.type !== 'refactor') {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E001_INVALID_YAML,
        severity: Severities.HIGH,
        file: metaRel,
        line: 1,
        message: "`skip_specs: true` is only permitted when change `type` is 'refactor'.",
        fix: "Set `type: \"refactor\"` or provide delta specs and set `skip_specs: false`.",
      })
    );
  }

  // 2. Valida proposal.md
  const proposalRel = `${changeRelDir}/proposal.md`;
  const proposalRaw = readTextFileSafe(rootDir, proposalRel, { allowMissing: true });
  if (proposalRaw === null) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E003_INVALID_SCENARIO,
        severity: Severities.CRITICAL,
        file: proposalRel,
        line: 1,
        message: `Missing '${proposalRel}'.`,
        fix: 'Create proposal.md with ## Why and ## What Changes.',
      })
    );
  } else {
    const proposalAst = parseMarkdownDocument(proposalRaw, { file: proposalRel });
    diagnostics.push(...collectAstSyntaxDiagnostics(proposalAst, proposalRel, ErrorCodes.E003_INVALID_SCENARIO));

    const whySec = proposalAst.getSection('Why');
    if (!whySec) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E003_INVALID_SCENARIO,
          severity: Severities.HIGH,
          file: proposalRel,
          line: 1,
          target: '## Why',
          message: "Missing mandatory section '## Why' in proposal.md.",
          fix: "Add '## Why' explaining the motivation in 50 to 1000 characters.",
        })
      );
    } else {
      const whyLen = whySec.cleanText.length;
      if (whyLen < 50 || whyLen > 1000) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E003_INVALID_SCENARIO,
            severity: Severities.HIGH,
            file: proposalRel,
            line: whySec.lineStart,
            target: '## Why',
            message: `Section '## Why' has ${whyLen} characters (must be between 50 and 1000 characters excluding HTML comments).`,
            fix: 'Adjust ## Why prose length to 50..1000 characters.',
          })
        );
      }
    }

    const whatSec = proposalAst.getSection('What Changes');
    if (!whatSec || whatSec.cleanText.length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E003_INVALID_SCENARIO,
          severity: Severities.HIGH,
          file: proposalRel,
          line: whatSec ? whatSec.lineStart : 1,
          target: '## What Changes',
          message: "Missing or empty section '## What Changes' in proposal.md.",
          fix: "Populate '## What Changes' with the scope of modifications.",
        })
      );
    }
  }

  // 3. Descobre e valida Deltas em xspec/changes/<id>/specs/**/spec.md
  const actualCapabilities = discoverSpecCapabilities(rootDir, `${changeRelDir}/specs`);
  const declaredCapabilities = Array.isArray(meta.touched_capabilities)
    ? [...meta.touched_capabilities].map((c) => String(c).trim()).sort()
    : null;

  // Confronta touched_capabilities declaradas com as pastas reais no delta (Item 3 / B4)
  if (!skipSpecs && declaredCapabilities !== null) {
    const actualKey = actualCapabilities.join('|');
    const declaredKey = declaredCapabilities.join('|');
    if (actualKey !== declaredKey) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
          severity: Severities.CRITICAL,
          file: metaRel,
          line: 1,
          target: 'touched_capabilities',
          message: `Mismatch between declared touched_capabilities ([${declaredCapabilities.join(', ')}]) in .xspec.yaml and actual delta directories ([${actualCapabilities.join(', ')}]).`,
          fix: "Run 'node xspec/bin/xspec.mjs snapshot-base <change-id>' or synchronize touched_capabilities with changes/<id>/specs/.",
        })
      );
    }
  }

  if (!skipSpecs && actualCapabilities.length === 0) {
    diagnostics.push(
      createDiagnostic({
        code: ErrorCodes.E002_MISSING_PURPOSE,
        severity: Severities.CRITICAL,
        file: `${changeRelDir}/specs`,
        line: 1,
        message: 'No delta specifications found under changes/<id>/specs/ and skip_specs is not true.',
        fix: 'Create at least one delta spec in specs/<capability>/spec.md or set skip_specs: true for pure refactors.',
      })
    );
  }

  // Conjuntos para validação cruzada com tasks.md e Traceability Matrix
  const allDefinedRequirements = new Set(); // lowercase names
  const allDefinedScenarios = new Set(); // lowercase names
  const expectedTraceabilityItems = []; // [{ requirement, scenario, capability }]

  for (const cap of actualCapabilities) {
    const deltaRel = `${changeRelDir}/specs/${cap}/spec.md`;
    const livingRel = `xspec/specs/${cap}/spec.md`;
    const deltaRaw = readTextFileSafe(rootDir, deltaRel);
    const livingRaw = readTextFileSafe(rootDir, livingRel, { allowMissing: true });
    const isExistingCapability = livingRaw !== null;

    // Verifica hash base_specs se registrado em .xspec.yaml (Optimistic Concurrency Control)
    const baseSpecsMap = meta.base_specs && typeof meta.base_specs === 'object' ? meta.base_specs : null;
    if (baseSpecsMap) {
      const recordedBaseHash = baseSpecsMap[cap] ?? baseSpecsMap[`${cap}/spec.md`] ?? null;
      if (recordedBaseHash) {
        const currentLivingHash = isExistingCapability ? hashFileSafe(rootDir, livingRel) : 'NEW';
        if (recordedBaseHash !== currentLivingHash) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E006_CONCURRENCY_CONFLICT,
              severity: Severities.CRITICAL,
              file: livingRel,
              line: 1,
              target: cap,
              message: `Living Spec '${livingRel}' changed concurrently since change creation (expected base hash '${recordedBaseHash}', current is '${currentLivingHash}').`,
              fix: 'Reconcile delta with updated Living Spec and run snapshot-base.',
            })
          );
        }
      }
    }

    const deltaAst = parseMarkdownDocument(deltaRaw, { file: deltaRel });
    diagnostics.push(...collectAstSyntaxDiagnostics(deltaAst, deltaRel, ErrorCodes.E003_INVALID_SCENARIO));

    const purposeSec = deltaAst.getSection('Purpose');
    if (!isExistingCapability) {
      // Capacidade nova: ## Purpose obrigatório >= 50 chars
      if (!purposeSec || purposeSec.cleanText.length < 50) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E002_MISSING_PURPOSE,
            severity: Severities.HIGH,
            file: deltaRel,
            line: purposeSec ? purposeSec.lineStart : 1,
            target: `${cap} -> ## Purpose`,
            message: `New capability '${cap}' MUST include '## Purpose' with at least 50 characters (found ${purposeSec ? purposeSec.cleanText.length : 0}).`,
            fix: "Add a '## Purpose' section with 50+ characters explaining the capability scope.",
          })
        );
      }
    } else if (purposeSec && purposeSec.cleanText.length > 0) {
      // Capacidade existente: proibido ## Purpose no delta
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E002_MISSING_PURPOSE,
          severity: Severities.HIGH,
          file: deltaRel,
          line: purposeSec.lineStart,
          target: `${cap} -> ## Purpose`,
          message: `Existing capability '${cap}' MUST NOT include '## Purpose' in its delta spec.`,
          fix: "Remove '## Purpose' from the delta of existing capabilities.",
        })
      );
    }

    const addedSec = deltaAst.getSection(/^ADDED\s+Requirements$/i);
    const modifiedSec = deltaAst.getSection(/^MODIFIED\s+Requirements$/i);
    const removedSec = deltaAst.getSection(/^REMOVED\s+Requirements$/i);
    const renamedSec = deltaAst.getSection(/^RENAMED\s+Requirements$/i);

    const hasAnyDeltaOp =
      (addedSec && addedSec.requirements.length > 0) ||
      (modifiedSec && modifiedSec.requirements.length > 0) ||
      (removedSec && removedSec.requirements.length > 0) ||
      (renamedSec && renamedSec.renamedPairs.length > 0);

    if (!hasAnyDeltaOp) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E003_INVALID_SCENARIO,
          severity: Severities.HIGH,
          file: deltaRel,
          line: 1,
          target: cap,
          message: `Delta spec '${deltaRel}' contains no ADDED, MODIFIED, REMOVED, or RENAMED requirements.`,
          fix: 'Add at least one requirement operation to the delta spec.',
        })
      );
    }

    // Valida estrutura de cada requisito em ADDED e MODIFIED
    for (const sec of [addedSec, modifiedSec].filter(Boolean)) {
      const seenInSec = new Set();
      for (const req of sec.requirements) {
        if (!req.name) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E003_INVALID_SCENARIO,
              severity: Severities.HIGH,
              file: deltaRel,
              line: req.lineStart,
              message: 'Requirement heading has an empty name.',
              fix: "Provide a descriptive name after '### Requirement:'.",
            })
          );
          continue;
        }

        if (seenInSec.has(req.normalizedName)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E007_MERGE_FAILED,
              severity: Severities.CRITICAL,
              file: deltaRel,
              line: req.lineStart,
              target: req.name,
              message: `Duplicate requirement '${req.name}' inside section '## ${sec.title}'.`,
              fix: 'Remove or rename the duplicate requirement block.',
            })
          );
        }
        seenInSec.add(req.normalizedName);
        allDefinedRequirements.add(req.normalizedName);

        if (!req.hasShallOrMust || req.charLength === 0 || req.charLength > 500) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E003_INVALID_SCENARIO,
              severity: Severities.HIGH,
              file: deltaRel,
              line: req.lineStart,
              target: `R:${req.name}`,
              message: `Requirement '${req.name}' MUST contain 'SHALL' or 'MUST' in uppercase (outside backticks) and be 1..500 characters (found ${req.charLength} chars, hasShallOrMust=${req.hasShallOrMust}).`,
              fix: 'Include normative SHALL or MUST in uppercase within a concise statement (<= 500 chars).',
            })
          );
        }

        if (req.scenarios.length === 0) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E003_INVALID_SCENARIO,
              severity: Severities.HIGH,
              file: deltaRel,
              line: req.lineStart,
              target: `R:${req.name}`,
              message: `Requirement '${req.name}' has 0 scenarios; at least one '#### Scenario:' is required.`,
              fix: "Add at least one '#### Scenario:' with WHEN and THEN steps.",
            })
          );
        }

        for (const scen of req.scenarios) {
          allDefinedScenarios.add(scen.normalizedName);
          expectedTraceabilityItems.push({
            requirement: req.name,
            scenario: scen.name,
            capability: cap,
          });

          if (!scen.hasWhen || !scen.hasThen) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E003_INVALID_SCENARIO,
                severity: Severities.HIGH,
                file: deltaRel,
                line: scen.lineStart,
                target: `R:${req.name} / S:${scen.name}`,
                message: `Scenario '${scen.name}' MUST include both 'WHEN' and 'THEN' steps outside code fences (hasWhen=${scen.hasWhen}, hasThen=${scen.hasThen}).`,
                fix: "Include '- **WHEN** ...' and '- **THEN** ...' steps under the scenario.",
              })
            );
          }
        }
      }
    }

    // Registra também requisitos REMOVED e RENAMED para que possam ser referenciados por tasks
    if (removedSec) {
      for (const req of removedSec.requirements) {
        allDefinedRequirements.add(req.normalizedName);
      }
    }
    if (renamedSec) {
      for (const pair of renamedSec.renamedPairs) {
        allDefinedRequirements.add(pair.from.toLowerCase());
        allDefinedRequirements.add(pair.to.toLowerCase());
      }
    }

    // A6. Dry-Run Pre-Merge Check contra a Living Spec
    if (!isExistingCapability) {
      if (
        (modifiedSec && modifiedSec.requirements.length > 0) ||
        (removedSec && removedSec.requirements.length > 0) ||
        (renamedSec && renamedSec.renamedPairs.length > 0)
      ) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E007_MERGE_FAILED,
            severity: Severities.CRITICAL,
            file: deltaRel,
            line: 1,
            target: cap,
            message: `Capability '${cap}' does not exist in 'xspec/specs/' yet, so only '## ADDED Requirements' is allowed (found MODIFIED/REMOVED/RENAMED).`,
            fix: 'Use only ## ADDED Requirements for new capabilities.',
          })
        );
      }
    } else {
      const livingAst = parseMarkdownDocument(livingRaw, { file: livingRel });
      const livingReqSec = livingAst.getSection(/^Requirements$/i);
      const existingNames = new Set(
        (livingReqSec ? livingReqSec.requirements : []).map((r) => r.normalizedName)
      );

      // 1º RENAMED
      if (renamedSec) {
        for (const pair of renamedSec.renamedPairs) {
          const fromNorm = pair.from.toLowerCase();
          const toNorm = pair.to.toLowerCase();
          if (!existingNames.has(fromNorm)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E007_MERGE_FAILED,
                severity: Severities.CRITICAL,
                file: deltaRel,
                line: pair.lineStart,
                target: `RENAMED FROM: ${pair.from}`,
                message: `Cannot rename non-existent requirement '${pair.from}' in '${livingRel}'.`,
                fix: `Verify exact requirement name in '${livingRel}'.`,
              })
            );
          } else if (fromNorm !== toNorm && existingNames.has(toNorm)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E007_MERGE_FAILED,
                severity: Severities.CRITICAL,
                file: deltaRel,
                line: pair.lineEnd,
                target: `RENAMED TO: ${pair.to}`,
                message: `Rename target '${pair.to}' collides with an existing requirement in '${livingRel}'.`,
                fix: 'Choose a unique target name in RENAMED Requirements.',
              })
            );
          } else {
            existingNames.delete(fromNorm);
            existingNames.add(toNorm);
          }
        }
      }

      // 2º REMOVED
      if (removedSec) {
        for (const req of removedSec.requirements) {
          if (!existingNames.has(req.normalizedName)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E007_MERGE_FAILED,
                severity: Severities.CRITICAL,
                file: deltaRel,
                line: req.lineStart,
                target: `REMOVED: ${req.name}`,
                message: `Cannot remove non-existent requirement '${req.name}' from '${livingRel}'.`,
                fix: `Ensure '${req.name}' exists in '${livingRel}'.`,
              })
            );
          } else {
            existingNames.delete(req.normalizedName);
          }
        }
      }

      // 3º MODIFIED
      if (modifiedSec) {
        for (const req of modifiedSec.requirements) {
          if (!existingNames.has(req.normalizedName)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E007_MERGE_FAILED,
                severity: Severities.CRITICAL,
                file: deltaRel,
                line: req.lineStart,
                target: `MODIFIED: ${req.name}`,
                message: `Cannot modify non-existent requirement '${req.name}' in '${livingRel}'.`,
                fix: `Use '## ADDED Requirements' for new requirements or match the exact title in '${livingRel}'.`,
              })
            );
          }
        }
      }

      // 4º ADDED
      if (addedSec) {
        for (const req of addedSec.requirements) {
          if (existingNames.has(req.normalizedName)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E007_MERGE_FAILED,
                severity: Severities.CRITICAL,
                file: deltaRel,
                line: req.lineStart,
                target: `ADDED: ${req.name}`,
                message: `Cannot add duplicate requirement '${req.name}': already exists in '${livingRel}'.`,
                fix: "Move the requirement to '## MODIFIED Requirements' or give it a unique name.",
              })
            );
          } else {
            existingNames.add(req.normalizedName);
          }
        }
      }
    }
  }

  // 4. Valida tasks.md (se exigido pelo estágio ou se o arquivo existir)
  const tasksRel = `${changeRelDir}/tasks.md`;
  const tasksRaw = readTextFileSafe(rootDir, tasksRel, { allowMissing: true });

  if (tasksRaw === null) {
    if (stageRules.requireTasks) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.CRITICAL,
          file: tasksRel,
          line: 1,
          message: `Missing mandatory '${tasksRel}' for stage '${stageRules.stage}'.`,
          fix: 'Generate tasks.md before running this validation stage.',
        })
      );
    }
  } else {
    const tasksAst = parseMarkdownDocument(tasksRaw, { file: tasksRel });
    diagnostics.push(...collectAstSyntaxDiagnostics(tasksAst, tasksRel, ErrorCodes.E004_MISSING_REFERENCE));

    const definedTaskIds = new Map();
    let totalTasks = 0;
    let checkedTasks = 0;
    let pendingTasks = 0;

    for (const sec of tasksAst.sections) {
      const isForbiddenCheckboxSec = /^(Analysis|Drift\s+Log|Traceability\s+Matrix)$/i.test(sec.title);
      if (isForbiddenCheckboxSec) {
        for (const t of sec.tasks) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: tasksRel,
              line: t.line,
              target: `## ${sec.title}`,
              message: `Checkboxes are forbidden inside section '## ${sec.title}'.`,
              fix: `Use plain bullet points without '[ ]' or '[x]' inside '## ${sec.title}'.`,
            })
          );
        }
        continue;
      }

      const groupMatch = sec.title.match(/^(\d+)\.\s+(.+)$/);
      const groupNum = groupMatch ? groupMatch[1] : null;

      if (!groupNum && sec.tasks.length > 0) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E004_MISSING_REFERENCE,
            severity: Severities.HIGH,
            file: tasksRel,
            line: sec.lineStart,
            target: `## ${sec.title}`,
            message: `Task section '## ${sec.title}' containing checkboxes MUST be numbered as '## N. Group Name'.`,
            fix: 'Number task group headings sequentially (e.g., ## 1. Setup, ## 2. Implementation).',
          })
        );
      }

      for (const t of sec.tasks) {
        totalTasks += 1;
        if (t.checked) checkedTasks += 1;
        else pendingTasks += 1;

        if (!t.taskId) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: tasksRel,
              line: t.line,
              target: t.rawBody,
              message: `Task at line ${t.line} is missing a hierarchical ID ('N.M').`,
              fix: `Prefix the task with '${groupNum || 1}.1'.`,
            })
          );
        } else {
          if (groupNum && !t.taskId.startsWith(`${groupNum}.`)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E004_MISSING_REFERENCE,
                severity: Severities.HIGH,
                file: tasksRel,
                line: t.line,
                target: t.taskId,
                message: `Task ID '${t.taskId}' does not match its parent group number '## ${sec.title}'.`,
                fix: `Renumber task '${t.taskId}' to start with '${groupNum}.'.`,
              })
            );
          }
          if (definedTaskIds.has(t.taskId)) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E004_MISSING_REFERENCE,
                severity: Severities.HIGH,
                file: tasksRel,
                line: t.line,
                target: t.taskId,
                message: `Duplicate task ID '${t.taskId}' in tasks.md.`,
                fix: 'Ensure every task has a unique hierarchical ID.',
              })
            );
          } else {
            definedTaskIds.set(t.taskId, { checked: t.checked, line: t.line });
          }
        }

        // Valida referência (Ref: R:... / S:...)
        if (!skipSpecs) {
          if (!t.refs || !t.refs.isValid) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E004_MISSING_REFERENCE,
                severity: Severities.HIGH,
                file: tasksRel,
                line: t.line,
                target: t.taskId || t.rawBody,
                message: `Task '${t.taskId || t.rawBody}' is missing a valid '(Ref: R:<Req> / S:<Scenario>)' suffix.`,
                fix: 'Append (Ref: R:<Requirement Name> / S:<Scenario Name>) at the end of the task.',
              })
            );
          } else {
            for (const reqRef of t.refs.requirements) {
              if (!allDefinedRequirements.has(reqRef.toLowerCase())) {
                diagnostics.push(
                  createDiagnostic({
                    code: ErrorCodes.E004_MISSING_REFERENCE,
                    severity: Severities.HIGH,
                    file: tasksRel,
                    line: t.line,
                    target: `R:${reqRef}`,
                    message: `Task '${t.taskId}' references non-existent requirement 'R:${reqRef}'.`,
                    fix: 'Update Ref to match an exact ### Requirement: title in the change delta specs.',
                  })
                );
              }
            }
            for (const scenRef of t.refs.scenarios) {
              if (!allDefinedScenarios.has(scenRef.toLowerCase())) {
                diagnostics.push(
                  createDiagnostic({
                    code: ErrorCodes.E004_MISSING_REFERENCE,
                    severity: Severities.HIGH,
                    file: tasksRel,
                    line: t.line,
                    target: `S:${scenRef}`,
                    message: `Task '${t.taskId}' references non-existent scenario 'S:${scenRef}'.`,
                    fix: 'Update Ref to match an exact #### Scenario: title in the change delta specs.',
                  })
                );
              }
            }
          }
        }
      }
    }

    // Valida estado dos checkboxes de acordo com o estágio
    if (stageRules.checkboxPolicy === 'HAS_PENDING' && pendingTasks === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: tasksRel,
          line: 1,
          message: "Stage 'plan' requires at least 1 pending task ('- [ ]') in tasks.md.",
          fix: 'Create tasks with unchecked checkboxes (- [ ]) during planning.',
        })
      );
    } else if (stageRules.checkboxPolicy === 'ALL_CHECKED') {
      if (totalTasks === 0 || checkedTasks === 0 || pendingTasks > 0) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E004_MISSING_REFERENCE,
            severity: Severities.CRITICAL,
            file: tasksRel,
            line: 1,
            message: `Stage '${stageRules.stage}' requires 100% completed tasks (found ${checkedTasks} completed, ${pendingTasks} pending).`,
            fix: 'Complete all pending tasks (- [x]) before closing the change.',
          })
        );
      }
    }

    // 5. Carrega evidências reais se stage === 'close'
    let evidenceBundle = null;
    if (stageRules.requireRealEvidence) {
      evidenceBundle = loadEvidenceBundle(rootDir, changeId);
      if (!evidenceBundle) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E010_VERIFICATION_FAILED,
            severity: Severities.CRITICAL,
            file: `.xspec/evidence/${changeId}`,
            line: 1,
            message: `Missing execution evidence in '.xspec/evidence/${changeId}/'.`,
            fix: `Run 'node xspec/bin/xspec.mjs verify ${changeId}' to execute verification commands and record checksums.`,
          })
        );
      } else {
        // Verifica semântica de overall_status (NOT_CONFIGURED, PASSED, FAILED, ENV_ERROR)
        const overallStatus = evidenceBundle.testResults?.overall_status;
        if (overallStatus === 'FAILED' || overallStatus === 'ENV_ERROR') {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E010_VERIFICATION_FAILED,
              severity: Severities.CRITICAL,
              file: `.xspec/evidence/${changeId}/test-results.json`,
              line: 1,
              message: `Verification commands ended with status '${overallStatus}'.`,
              fix: 'Fix failing verification/test commands and re-run xspec verify.',
            })
          );
        } else if (overallStatus === 'NOT_CONFIGURED') {
          if (profile === 'strict') {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E010_VERIFICATION_FAILED,
                severity: Severities.CRITICAL,
                file: 'xspec/config.yaml',
                line: 1,
                message: "Profile 'strict' forbids closing a change when verification commands are 'NOT_CONFIGURED'.",
                fix: 'Configure verification.commands or tdd.test_command in xspec/config.yaml and run xspec verify.',
              })
            );
          } else {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E010_VERIFICATION_FAILED,
                severity: Severities.LOW,
                file: 'xspec/config.yaml',
                line: 1,
                message: 'Verification commands are NOT_CONFIGURED (allowed with warning in minimal/standard profile; note that automated tests were not executed).',
                fix: 'Add commands to verification.commands in xspec/config.yaml for stronger assurance.',
              })
            );
          }
        }

        // Verifica se os artefatos da mudança não mudaram desde que verify gravou checksums.json
        const artChecksums = evidenceBundle.checksums?.artifacts || {};
        for (const [artRelPath, recordedHash] of Object.entries(artChecksums)) {
          const currentHash = hashFileSafe(rootDir, artRelPath, { allowMissing: true });
          if (currentHash !== recordedHash) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E010_VERIFICATION_FAILED,
                severity: Severities.CRITICAL,
                file: artRelPath,
                line: 1,
                message: `Artifact '${artRelPath}' was modified after 'xspec verify' recorded its checksum.`,
                fix: `Re-run 'node xspec/bin/xspec.mjs verify ${changeId}' to refresh evidence checksums.`,
              })
            );
          }
        }
      }
    }

    // 6. Valida Matriz de Rastreabilidade de acordo com a política do estágio
    const traceDiags = validateTraceabilityMatrix({
      rootDir,
      tasksAst,
      tasksRelPath: tasksRel,
      expectedItems: expectedTraceabilityItems,
      definedTaskIds,
      policy: stageRules.traceabilityPolicy,
      skipSpecs,
      evidenceBundle,
    });
    diagnostics.push(...traceDiags);
  }

  return createDiagnosticEnvelope({
    command: 'validate',
    stage: stageRules.stage,
    changeId,
    schemaVersion,
    profile,
    blockArchiveOnHigh,
    diagnostics,
    data: {
      capabilities: actualCapabilities,
      skip_specs: skipSpecs,
    },
  });
}
