/**
 * X-Spec Engine v2.0.1 — Calculador Determinístico de Merge de Deltas em Memória (RENAMED -> REMOVED -> MODIFIED -> ADDED)
 * Zero-dependency module
 */

import { ErrorCodes, XSpecError } from '../errors/codes.mjs';
import { parseMarkdownDocument } from '../parser/markdown-ast.mjs';

/**
 * Extrai os blocos brutos `### Requirement: <Name>` dentro de uma seção H2,
 * delimitando cada bloco do seu `### Requirement:` até antes do próximo `### Requirement:` ou próximo `## `.
 */
function extractRequirementBlocksFromSection(rawLines, section) {
  if (!section || section.requirements.length === 0) return [];

  const blocks = [];
  for (let i = 0; i < section.requirements.length; i += 1) {
    const req = section.requirements[i];
    const startIdx = req.lineStart - 1;
    const endLine =
      i + 1 < section.requirements.length
        ? section.requirements[i + 1].lineStart - 1
        : section.lineEnd;

    const slice = rawLines.slice(startIdx, endLine);
    // Remove linhas vazias extras no final do bloco
    while (slice.length > 0 && slice[slice.length - 1].trim() === '') {
      slice.pop();
    }

    blocks.push({
      name: req.name,
      normalizedName: req.normalizedName,
      lineStart: req.lineStart,
      rawBlock: slice.join('\n'),
    });
  }

  return blocks;
}

/**
 * Valida estruturalmente uma Living Spec consolidada em memória antes de autorizar escrita no staging (Estágio 2: VALIDATING).
 */
export function validateMergedLivingSpec(capability, mergedMarkdown) {
  const fileLabel = `xspec/specs/${capability}/spec.md`;
  const ast = parseMarkdownDocument(mergedMarkdown, { file: fileLabel });

  if (ast.syntaxErrors.length > 0 || ast.malformedHeadings.length > 0 || ast.duplicateH2Sections.length > 0) {
    const firstIssue =
      ast.syntaxErrors[0]?.message ||
      ast.malformedHeadings[0]?.reason ||
      `Duplicate H2 '${ast.duplicateH2Sections[0]?.title}'`;
    throw new XSpecError(
      ErrorCodes.E007_MERGE_FAILED,
      `Post-merge Living Spec validation failed for '${capability}': ${firstIssue}`,
      { file: fileLabel }
    );
  }

  // Regra de limpeza: nenhum cabeçalho de delta pode existir na Living Spec final
  const forbiddenDeltaSection = ast.sections.find((s) =>
    /^(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements$/i.test(s.title)
  );
  if (forbiddenDeltaSection) {
    throw new XSpecError(
      ErrorCodes.E007_MERGE_FAILED,
      `Post-merge Living Spec for '${capability}' still contains residual delta section '## ${forbiddenDeltaSection.title}'.`,
      { file: fileLabel, line: forbiddenDeltaSection.lineStart }
    );
  }

  const purposeSec = ast.getSection('Purpose');
  if (!purposeSec || purposeSec.cleanText.length < 50) {
    throw new XSpecError(
      ErrorCodes.E002_MISSING_PURPOSE,
      `Post-merge Living Spec for '${capability}' is missing valid '## Purpose' (>= 50 chars).`,
      { file: fileLabel }
    );
  }

  const reqSec = ast.getSection('Requirements');
  if (!reqSec) {
    throw new XSpecError(
      ErrorCodes.E007_MERGE_FAILED,
      `Post-merge Living Spec for '${capability}' is missing '## Requirements' section.`,
      { file: fileLabel }
    );
  }

  const seenNames = new Set();
  for (const req of reqSec.requirements) {
    if (seenNames.has(req.normalizedName)) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `Post-merge Living Spec for '${capability}' contains duplicate requirement '${req.name}'.`,
        { file: fileLabel, line: req.lineStart }
      );
    }
    seenNames.add(req.normalizedName);

    if (!req.hasShallOrMust || req.charLength === 0 || req.charLength > 500) {
      throw new XSpecError(
        ErrorCodes.E003_INVALID_SCENARIO,
        `Post-merge requirement '${req.name}' in '${capability}' violates SHALL/MUST or length rules.`,
        { file: fileLabel, line: req.lineStart }
      );
    }

    if (req.scenarios.length === 0) {
      throw new XSpecError(
        ErrorCodes.E003_INVALID_SCENARIO,
        `Post-merge requirement '${req.name}' in '${capability}' has 0 scenarios.`,
        { file: fileLabel, line: req.lineStart }
      );
    }

    for (const scen of req.scenarios) {
      if (!scen.hasWhen || !scen.hasThen) {
        throw new XSpecError(
          ErrorCodes.E003_INVALID_SCENARIO,
          `Post-merge scenario '${scen.name}' in '${capability}' is missing WHEN or THEN.`,
          { file: fileLabel, line: scen.lineStart }
        );
      }
    }
  }

  return true;
}

/**
 * Calcula em memória a nova Living Spec aplicando o delta sobre a Living Spec atual
 * exatamente na ordem: 1º RENAMED -> 2º REMOVED -> 3º MODIFIED -> 4º ADDED.
 */
export function computeMergedLivingSpec({ capability, deltaRaw, livingRaw = null }) {
  const deltaNorm = String(deltaRaw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const deltaLines = deltaNorm.split('\n');
  const deltaAst = parseMarkdownDocument(deltaNorm, { file: `specs/${capability}/spec.md` });

  const addedSec = deltaAst.getSection(/^ADDED\s+Requirements$/i);
  const modifiedSec = deltaAst.getSection(/^MODIFIED\s+Requirements$/i);
  const removedSec = deltaAst.getSection(/^REMOVED\s+Requirements$/i);
  const renamedSec = deltaAst.getSection(/^RENAMED\s+Requirements$/i);

  const addedBlocks = extractRequirementBlocksFromSection(deltaLines, addedSec);
  const modifiedBlocks = extractRequirementBlocksFromSection(deltaLines, modifiedSec);
  const removedBlocks = extractRequirementBlocksFromSection(deltaLines, removedSec);
  const renamedPairs = renamedSec ? renamedSec.renamedPairs : [];

  const counts = {
    renamed: renamedPairs.length,
    removed: removedBlocks.length,
    modified: modifiedBlocks.length,
    added: addedBlocks.length,
  };

  // Caso 1: Capacidade Nova (livingRaw === null)
  if (livingRaw === null) {
    if (counts.renamed > 0 || counts.removed > 0 || counts.modified > 0) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `Cannot apply RENAMED/REMOVED/MODIFIED to non-existent Living Spec '${capability}'.`,
        { target: capability }
      );
    }

    const purposeSec = deltaAst.getSection('Purpose');
    if (!purposeSec || purposeSec.cleanText.length < 50) {
      throw new XSpecError(
        ErrorCodes.E002_MISSING_PURPOSE,
        `New capability '${capability}' is missing a valid '## Purpose' (>= 50 chars).`,
        { target: capability }
      );
    }

    const seenAdded = new Set();
    for (const blk of addedBlocks) {
      if (seenAdded.has(blk.normalizedName)) {
        throw new XSpecError(
          ErrorCodes.E007_MERGE_FAILED,
          `Duplicate requirement '${blk.name}' in ADDED Requirements for '${capability}'.`,
          { target: blk.name }
        );
      }
      seenAdded.add(blk.normalizedName);
    }

    const mergedLines = [
      `# ${capability} Specification`,
      '',
      '## Purpose',
      '',
      purposeSec.cleanText,
      '',
      '## Requirements',
      '',
      addedBlocks.map((b) => b.rawBlock).join('\n\n'),
      '',
    ];

    const mergedContent = mergedLines.join('\n');
    validateMergedLivingSpec(capability, mergedContent);

    return {
      capability,
      existedBefore: false,
      mergedContent,
      counts,
    };
  }

  // Caso 2: Capacidade Existente
  const livingNorm = String(livingRaw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const livingLines = livingNorm.split('\n');
  const livingAst = parseMarkdownDocument(livingNorm, { file: `xspec/specs/${capability}/spec.md` });

  const livingPurposeSec = livingAst.getSection('Purpose');
  const livingReqSec = livingAst.getSection('Requirements');
  if (!livingPurposeSec || !livingReqSec) {
    throw new XSpecError(
      ErrorCodes.E007_MERGE_FAILED,
      `Existing Living Spec for '${capability}' is malformed (missing ## Purpose or ## Requirements).`,
      { target: capability }
    );
  }

  const orderedReqs = extractRequirementBlocksFromSection(livingLines, livingReqSec);

  // 1º Operação: RENAMED
  for (const pair of renamedPairs) {
    const fromNorm = pair.from.toLowerCase();
    const toNorm = pair.to.toLowerCase();
    const targetIdx = orderedReqs.findIndex((r) => r.normalizedName === fromNorm);
    if (targetIdx === -1) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `RENAMED failed: requirement '${pair.from}' does not exist in '${capability}'.`,
        { target: pair.from }
      );
    }

    const collisionIdx = orderedReqs.findIndex(
      (r, idx) => idx !== targetIdx && r.normalizedName === toNorm
    );
    if (collisionIdx !== -1) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `RENAMED collision: target requirement name '${pair.to}' already exists in '${capability}'.`,
        { target: pair.to }
      );
    }

    const item = orderedReqs[targetIdx];
    const blockLines = item.rawBlock.split('\n');
    blockLines[0] = `### Requirement: ${pair.to}`;
    orderedReqs[targetIdx] = {
      ...item,
      name: pair.to,
      normalizedName: toNorm,
      rawBlock: blockLines.join('\n'),
    };
  }

  // 2º Operação: REMOVED
  for (const rem of removedBlocks) {
    const idx = orderedReqs.findIndex((r) => r.normalizedName === rem.normalizedName);
    if (idx === -1) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `REMOVED failed: requirement '${rem.name}' does not exist in '${capability}'.`,
        { target: rem.name }
      );
    }
    orderedReqs.splice(idx, 1);
  }

  // 3º Operação: MODIFIED
  for (const mod of modifiedBlocks) {
    const idx = orderedReqs.findIndex((r) => r.normalizedName === mod.normalizedName);
    if (idx === -1) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `MODIFIED failed: requirement '${mod.name}' does not exist in '${capability}'.`,
        { target: mod.name }
      );
    }
    orderedReqs[idx] = {
      name: mod.name,
      normalizedName: mod.normalizedName,
      lineStart: mod.lineStart,
      rawBlock: mod.rawBlock,
    };
  }

  // 4º Operação: ADDED
  for (const add of addedBlocks) {
    const exists = orderedReqs.some((r) => r.normalizedName === add.normalizedName);
    if (exists) {
      throw new XSpecError(
        ErrorCodes.E007_MERGE_FAILED,
        `ADDED failed: duplicate requirement '${add.name}' already exists in '${capability}'.`,
        { target: add.name }
      );
    }
    orderedReqs.push({
      name: add.name,
      normalizedName: add.normalizedName,
      lineStart: add.lineStart,
      rawBlock: add.rawBlock,
    });
  }

  const mergedLines = [
    `# ${capability} Specification`,
    '',
    '## Purpose',
    '',
    livingPurposeSec.cleanText,
    '',
    '## Requirements',
    '',
    ...(orderedReqs.length > 0 ? [orderedReqs.map((r) => r.rawBlock).join('\n\n'), ''] : []),
  ];

  const mergedContent = mergedLines.join('\n');
  validateMergedLivingSpec(capability, mergedContent);

  return {
    capability,
    existedBefore: true,
    mergedContent,
    counts,
  };
}
