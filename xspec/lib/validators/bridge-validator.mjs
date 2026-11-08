/**
 * X-Spec Engine v2.0.1 — Validador Determinístico de Pontes de Agentes, Comandos Canônicos e Contratos (Entrega 9)
 * Zero-dependency module
 */

import fs from 'node:fs';
import path from 'node:path';
import { readTextFileSafe } from '../security/path-guard.mjs';
import { parseYamlSubset } from '../parser/yaml-subset.mjs';
import { ErrorCodes, Severities, createDiagnostic } from '../errors/codes.mjs';

export const CANONICAL_COMMANDS = Object.freeze([
  'init',
  'explore',
  'define',
  'plan',
  'build',
  'close',
]);

const FORBIDDEN_VENDOR_TERMS = Object.freeze([
  ['open', 'spec'].join(''),
  ['spec', 'kit'].join(''),
  ['open', '-', 'spec'].join(''),
  ['spec', '-', 'kit'].join(''),
  ['fis', 'sion'].join(''),
]);

function extractFrontmatter(text) {
  const lines = String(text).split('\n');
  if (lines[0]?.trim() !== '---') {
    return null;
  }
  const endIdx = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');
  if (endIdx === -1) {
    return null;
  }
  const yamlText = lines.slice(1, endIdx).join('\n');
  const bodyText = lines.slice(endIdx + 1).join('\n');
  return { yamlText, bodyText };
}

function checkForbiddenTerms(text, relPath, diagnostics) {
  const lower = String(text).toLowerCase();
  for (const term of FORBIDDEN_VENDOR_TERMS) {
    if (lower.includes(term)) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E003_INVALID_SCENARIO,
          severity: Severities.CRITICAL,
          file: relPath,
          line: 1,
          message: `File '${relPath}' contains forbidden external vendor term.`,
          fix: 'Remove external references and keep only native X-Spec terminology.',
        })
      );
    }
  }
}

/**
 * Valida os 6 comandos canônicos, 8 templates normativos, 30 pontes de IDE (5 famílias x 6 comandos)
 * e os 2 contratos universais (AGENTS.md e GEMINI.md).
 */
export function validateAgentBridges(rootDir) {
  const diagnostics = [];
  const checkedFiles = [];

  const hasRootCommands = fs.existsSync(path.join(rootDir, 'commands', 'init.md'));
  const commandsPrefix = hasRootCommands ? 'commands' : 'xspec/commands';
  const templatesPrefix = hasRootCommands ? 'templates' : 'xspec/templates';

  // 1. Comandos canônicos
  for (const cmd of CANONICAL_COMMANDS) {
    const relPath = `${commandsPrefix}/${cmd}.md`;
    const content = readTextFileSafe(rootDir, relPath, { allowMissing: true });
    if (!content || content.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.CRITICAL,
          file: relPath,
          line: 1,
          message: `Canonical command file missing or empty: '${relPath}'.`,
          fix: `Restore '${relPath}'.`,
        })
      );
      continue;
    }
    checkedFiles.push(relPath);
    checkForbiddenTerms(content, relPath, diagnostics);

    const fm = extractFrontmatter(content);
    if (!fm) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E001_INVALID_YAML,
          severity: Severities.HIGH,
          file: relPath,
          line: 1,
          message: `Canonical command '${relPath}' is missing YAML frontmatter ('---').`,
          fix: 'Add YAML frontmatter with description.',
        })
      );
    } else {
      try {
        const parsed = parseYamlSubset(fm.yamlText, { file: relPath });
        if (!parsed.description || typeof parsed.description !== 'string') {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E001_INVALID_YAML,
              severity: Severities.HIGH,
              file: relPath,
              line: 2,
              message: `Missing 'description' in frontmatter of '${relPath}'.`,
              fix: 'Add a non-empty description field in YAML frontmatter.',
            })
          );
        }
      } catch (err) {
        diagnostics.push(
          err.toDiagnostic
            ? err.toDiagnostic()
            : createDiagnostic({
                code: ErrorCodes.E001_INVALID_YAML,
                severity: Severities.HIGH,
                file: relPath,
                line: 1,
                message: err.message,
              })
        );
      }
    }
  }

  // 2. Templates normativos
  const requiredTemplates = [
    'config.yaml',
    'constitution.md',
    'proposal.md',
    'spec.md',
    'living-spec.md',
    'design.md',
    'tasks.md',
    'report.md',
  ];
  for (const tpl of requiredTemplates) {
    const relPath = `${templatesPrefix}/${tpl}`;
    const content = readTextFileSafe(rootDir, relPath, { allowMissing: true });
    if (!content || content.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.CRITICAL,
          file: relPath,
          line: 1,
          message: `Normative template missing or empty: '${relPath}'.`,
          fix: `Restore '${relPath}'.`,
        })
      );
    } else {
      checkedFiles.push(relPath);
      checkForbiddenTerms(content, relPath, diagnostics);
    }
  }

  // 3. 5 famílias de pontes de agentes (30 arquivos)
  for (const cmd of CANONICAL_COMMANDS) {
    const expectedRef = `xspec/commands/${cmd}.md`;

    // 3.1 Skills (.agents/skills/xspec-<cmd>/SKILL.md)
    const skillPath = `.agents/skills/xspec-${cmd}/SKILL.md`;
    const skillContent = readTextFileSafe(rootDir, skillPath, { allowMissing: true });
    if (!skillContent || skillContent.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: skillPath,
          line: 1,
          message: `Skill bridge missing or empty: '${skillPath}'.`,
          fix: `Create '${skillPath}' referencing '${expectedRef}'.`,
        })
      );
    } else {
      checkedFiles.push(skillPath);
      checkForbiddenTerms(skillContent, skillPath, diagnostics);
      const fm = extractFrontmatter(skillContent);
      if (!fm) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E001_INVALID_YAML,
            severity: Severities.HIGH,
            file: skillPath,
            line: 1,
            message: `Skill '${skillPath}' is missing YAML frontmatter.`,
            fix: `Add frontmatter with 'name: xspec-${cmd}' and 'description'.`,
          })
        );
      } else {
        try {
          const parsed = parseYamlSubset(fm.yamlText, { file: skillPath });
          if (parsed.name !== `xspec-${cmd}` || !parsed.description) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E001_INVALID_YAML,
                severity: Severities.HIGH,
                file: skillPath,
                line: 2,
                message: `Invalid frontmatter in '${skillPath}': expected name='xspec-${cmd}' and description.`,
                fix: 'Fix name and description in frontmatter.',
              })
            );
          }
        } catch (err) {
          diagnostics.push(
            err.toDiagnostic
              ? err.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E001_INVALID_YAML,
                  severity: Severities.HIGH,
                  file: skillPath,
                  line: 1,
                  message: err.message,
                })
          );
        }
        if (!fm.bodyText.includes(expectedRef)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: skillPath,
              line: 6,
              message: `Skill '${skillPath}' does not reference '${expectedRef}'.`,
              fix: `Reference '${expectedRef}' in the skill body.`,
            })
          );
        }
      }
    }

    // 3.2 Claude Code (.claude/commands/xspec-<cmd>.md)
    const claudePath = `.claude/commands/xspec-${cmd}.md`;
    const claudeContent = readTextFileSafe(rootDir, claudePath, { allowMissing: true });
    if (!claudeContent || claudeContent.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: claudePath,
          line: 1,
          message: `Claude Code bridge missing or empty: '${claudePath}'.`,
          fix: `Create '${claudePath}' referencing '${expectedRef}'.`,
        })
      );
    } else {
      checkedFiles.push(claudePath);
      checkForbiddenTerms(claudeContent, claudePath, diagnostics);
      const fm = extractFrontmatter(claudeContent);
      if (!fm) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E001_INVALID_YAML,
            severity: Severities.HIGH,
            file: claudePath,
            line: 1,
            message: `Claude bridge '${claudePath}' is missing YAML frontmatter.`,
            fix: 'Add YAML frontmatter with description.',
          })
        );
      } else {
        try {
          const parsed = parseYamlSubset(fm.yamlText, { file: claudePath });
          if (!parsed.description) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E001_INVALID_YAML,
                severity: Severities.HIGH,
                file: claudePath,
                line: 2,
                message: `Missing description in '${claudePath}'.`,
                fix: 'Add description in YAML frontmatter.',
              })
            );
          }
        } catch (err) {
          diagnostics.push(
            err.toDiagnostic
              ? err.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E001_INVALID_YAML,
                  severity: Severities.HIGH,
                  file: claudePath,
                  line: 1,
                  message: err.message,
                })
          );
        }
        if (!fm.bodyText.includes(expectedRef)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: claudePath,
              line: 6,
              message: `Claude bridge '${claudePath}' does not reference '${expectedRef}'.`,
              fix: `Reference '${expectedRef}' in '${claudePath}'.`,
            })
          );
        }
      }
    }

    // 3.3 GitHub Copilot (.github/prompts/xspec-<cmd>.prompt.md)
    const copilotPath = `.github/prompts/xspec-${cmd}.prompt.md`;
    const copilotContent = readTextFileSafe(rootDir, copilotPath, { allowMissing: true });
    if (!copilotContent || copilotContent.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: copilotPath,
          line: 1,
          message: `Copilot prompt bridge missing or empty: '${copilotPath}'.`,
          fix: `Create '${copilotPath}' referencing '${expectedRef}'.`,
        })
      );
    } else {
      checkedFiles.push(copilotPath);
      checkForbiddenTerms(copilotContent, copilotPath, diagnostics);
      const fm = extractFrontmatter(copilotContent);
      if (!fm) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E001_INVALID_YAML,
            severity: Severities.HIGH,
            file: copilotPath,
            line: 1,
            message: `Copilot bridge '${copilotPath}' is missing YAML frontmatter.`,
            fix: 'Add YAML frontmatter with agent and description.',
          })
        );
      } else {
        try {
          const parsed = parseYamlSubset(fm.yamlText, { file: copilotPath });
          if (!parsed.description || !parsed.agent) {
            diagnostics.push(
              createDiagnostic({
                code: ErrorCodes.E001_INVALID_YAML,
                severity: Severities.HIGH,
                file: copilotPath,
                line: 2,
                message: `Missing agent or description in '${copilotPath}'.`,
                fix: 'Add agent and description in YAML frontmatter.',
              })
            );
          }
        } catch (err) {
          diagnostics.push(
            err.toDiagnostic
              ? err.toDiagnostic()
              : createDiagnostic({
                  code: ErrorCodes.E001_INVALID_YAML,
                  severity: Severities.HIGH,
                  file: copilotPath,
                  line: 1,
                  message: err.message,
                })
          );
        }
        if (!fm.bodyText.includes(expectedRef)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: copilotPath,
              line: 6,
              message: `Copilot bridge '${copilotPath}' does not reference '${expectedRef}'.`,
              fix: `Reference '${expectedRef}' in '${copilotPath}'.`,
            })
          );
        }
      }
    }

    // 3.4 Cursor (.cursor/commands/xspec-<cmd>.md)
    const cursorPath = `.cursor/commands/xspec-${cmd}.md`;
    const cursorContent = readTextFileSafe(rootDir, cursorPath, { allowMissing: true });
    if (!cursorContent || cursorContent.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: cursorPath,
          line: 1,
          message: `Cursor bridge missing or empty: '${cursorPath}'.`,
          fix: `Create '${cursorPath}' referencing '${expectedRef}'.`,
        })
      );
    } else {
      checkedFiles.push(cursorPath);
      checkForbiddenTerms(cursorContent, cursorPath, diagnostics);
      if (!cursorContent.includes(expectedRef)) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E004_MISSING_REFERENCE,
            severity: Severities.HIGH,
            file: cursorPath,
            line: 1,
            message: `Cursor bridge '${cursorPath}' does not reference '${expectedRef}'.`,
            fix: `Reference '${expectedRef}' in '${cursorPath}'.`,
          })
        );
      }
    }

    // 3.5 Gemini CLI (.gemini/commands/xspec-<cmd>.toml)
    const geminiPath = `.gemini/commands/xspec-${cmd}.toml`;
    const geminiContent = readTextFileSafe(rootDir, geminiPath, { allowMissing: true });
    if (!geminiContent || geminiContent.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: geminiPath,
          line: 1,
          message: `Gemini CLI bridge missing or empty: '${geminiPath}'.`,
          fix: `Create '${geminiPath}' referencing '${expectedRef}'.`,
        })
      );
    } else {
      checkedFiles.push(geminiPath);
      checkForbiddenTerms(geminiContent, geminiPath, diagnostics);
      const hasDescription = /^description\s*=\s*".+"/m.test(geminiContent);
      const hasPromptBlock = /prompt\s*=\s*"""[\s\S]+"""/m.test(geminiContent);
      if (!hasDescription || !hasPromptBlock || !geminiContent.includes(expectedRef)) {
        diagnostics.push(
          createDiagnostic({
            code: ErrorCodes.E004_MISSING_REFERENCE,
            severity: Severities.HIGH,
            file: geminiPath,
            line: 1,
            message: `Gemini TOML bridge '${geminiPath}' is malformed or does not reference '${expectedRef}'.`,
            fix: `Ensure description, prompt block, and reference to '${expectedRef}'.`,
          })
        );
      }
    }
  }

  // 4. Contratos universais (AGENTS.md, GEMINI.md)
  for (const contractFile of ['AGENTS.md', 'GEMINI.md']) {
    const content = readTextFileSafe(rootDir, contractFile, { allowMissing: true });
    if (!content || content.trim().length === 0) {
      diagnostics.push(
        createDiagnostic({
          code: ErrorCodes.E004_MISSING_REFERENCE,
          severity: Severities.HIGH,
          file: contractFile,
          line: 1,
          message: `Universal contract '${contractFile}' missing or empty.`,
          fix: `Restore '${contractFile}'.`,
        })
      );
    } else {
      checkedFiles.push(contractFile);
      checkForbiddenTerms(content, contractFile, diagnostics);
      for (const cmd of CANONICAL_COMMANDS) {
        if (!content.includes(`/xspec-${cmd}`)) {
          diagnostics.push(
            createDiagnostic({
              code: ErrorCodes.E004_MISSING_REFERENCE,
              severity: Severities.HIGH,
              file: contractFile,
              line: 1,
              message: `Contract '${contractFile}' does not list command '/xspec-${cmd}'.`,
              fix: `Document '/xspec-${cmd}' in '${contractFile}'.`,
            })
          );
        }
      }
    }
  }

  return {
    ok: diagnostics.length === 0,
    checked_count: checkedFiles.length,
    checked_files: checkedFiles,
    diagnostics,
  };
}
