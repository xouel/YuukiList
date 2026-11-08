/**
 * X-Spec Engine v2.0.1 — Parser Estrutural Markdown Orientado à Gramática X-Spec (G1)
 * Zero-dependency module
 */

import { ErrorCodes, XSpecError } from '../errors/codes.mjs';

const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})([^`~]*)$/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;
const MALFORMED_HEADING_NO_SPACE_RE = /^(#{1,6})(Requirement:|Scenario:)(.*)$/i;
const CHECKBOX_RE = /^\s*-\s*\[([ xX])\]\s+(.+)$/;
const STEP_WHEN_RE = /^(?:-\s*)?(?:\*\*WHEN\*\*|WHEN\b)/;
const STEP_THEN_RE = /^(?:-\s*)?(?:\*\*THEN\*\*|THEN\b)/;
const STEP_GIVEN_RE = /^(?:-\s*)?(?:\*\*GIVEN\*\*|GIVEN\b)/;
const STEP_AND_RE = /^(?:-\s*)?(?:\*\*AND\*\*|AND\b)/;
const RENAMED_FROM_RE = /^-\s*FROM:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/;
const RENAMED_TO_RE = /^-\s*TO:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/;

/**
 * Remove código inline (`...`) antes de testar presença de SHALL / MUST normativo.
 */
function stripInlineCode(text) {
  return text.replace(/`[^`]*`/g, '');
}

/**
 * Divide uma linha de tabela Markdown `| a | b | c |` respeitando pipes escapados `\|`.
 */
export function splitMarkdownTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|') || trimmed.length < 2) {
    return null;
  }
  const inner = trimmed.slice(1, -1);
  const cells = [];
  let current = '';
  for (let i = 0; i < inner.length; i += 1) {
    if (inner[i] === '\\' && inner[i + 1] === '|') {
      current += '|';
      i += 1;
    } else if (inner[i] === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += inner[i];
    }
  }
  cells.push(current.trim());
  return cells;
}

function isTableSeparatorRow(cells) {
  if (!cells || cells.length === 0) return false;
  return cells.every((c) => /^:?-{2,}:?$/.test(c));
}

/**
 * Extrai referências estruturadas de um texto de tarefa, ex:
 * "Implementar login (Ref: R:User Auth / S:Valid Login, R:Audit)"
 */
export function parseTaskLineDetails(rawTaskBody) {
  let body = rawTaskBody.trim();
  let refs = null;

  const refMatch = body.match(/\(Ref:\s*([^)]+)\)\s*$/);
  if (refMatch) {
    const rawRefContent = refMatch[1].trim();
    const requirements = [];
    const scenarios = [];
    const tokens = rawRefContent.split(/[/,;]+/).map((t) => t.trim()).filter(Boolean);
    for (const token of tokens) {
      if (token.startsWith('R:')) {
        const name = token.slice(2).trim();
        if (name) requirements.push(name);
      } else if (token.startsWith('S:')) {
        const name = token.slice(2).trim();
        if (name) scenarios.push(name);
      }
    }
    refs = {
      raw: rawRefContent,
      requirements,
      scenarios,
      isValid: requirements.length > 0 || scenarios.length > 0,
    };
    body = body.slice(0, refMatch.index).trim();
  }

  // Extrai ID da tarefa no início: "1.1 ..."
  let taskId = null;
  let rest = body;
  const idMatch = rest.match(/^(\d+\.\d+)\s+(.+)$/);
  if (idMatch) {
    taskId = idMatch[1];
    rest = idMatch[2].trim();
  }

  // Verifica marcadores [P] e [USn]
  let isParallel = false;
  let storyTag = null;
  let keepScanning = true;
  while (keepScanning) {
    keepScanning = false;
    const pMatch = rest.match(/^\[P\]\s+(.+)$/);
    if (pMatch) {
      isParallel = true;
      rest = pMatch[1].trim();
      keepScanning = true;
    }
    const usMatch = rest.match(/^\[(US\d+)\]\s+(.+)$/);
    if (usMatch) {
      storyTag = usMatch[1];
      rest = usMatch[2].trim();
      keepScanning = true;
    }
  }

  return {
    taskId,
    isParallel,
    storyTag,
    description: rest,
    refs,
  };
}

/**
 * Faz o parse estrutural de um documento Markdown do X-Spec usando uma máquina de estados
 * que ignora code fences (``` / ~~~) e comentários HTML (<!-- -->).
 */
export function parseMarkdownDocument(sourceText, { file = null } = {}) {
  if (typeof sourceText !== 'string') {
    throw new XSpecError(ErrorCodes.E003_INVALID_SCENARIO, 'Markdown source must be a string.', { file, line: 1 });
  }
  if (sourceText.includes('\0')) {
    throw new XSpecError(ErrorCodes.E011_SECURITY_VIOLATION, 'Binary null byte detected in Markdown input.', { file, line: 1 });
  }

  const normalized = sourceText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');

  const syntaxErrors = [];
  const malformedHeadings = [];
  const duplicateH2Sections = [];
  const malformedTables = [];

  // Passagem 1: Máquina de estados Léxica (Code Fences e Comentários HTML)
  // Produz linhas higienizadas com { lineNo, text, inCodeFence, isCommentOnly }
  const processedLines = [];
  let inCodeFence = false;
  let fenceChar = null;
  let fenceLength = 0;
  let fenceOpenLine = 0;

  let inHtmlComment = false;
  let commentOpenLine = 0;

  for (let i = 0; i < rawLines.length; i += 1) {
    const lineNo = i + 1;
    const rawLine = rawLines[i];

    if (inCodeFence) {
      const closeRe = new RegExp(`^ {0,3}(${fenceChar}{${fenceLength},})\\s*$`);
      if (closeRe.test(rawLine)) {
        inCodeFence = false;
        fenceChar = null;
        fenceLength = 0;
        fenceOpenLine = 0;
      }
      processedLines.push({ lineNo, rawLine, cleanLine: '', inCodeFence: true });
      continue;
    }

    // Se estamos fora de comentário HTML, verifica se abre code fence
    if (!inHtmlComment) {
      const fenceMatch = rawLine.match(FENCE_OPEN_RE);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        const ch = marker[0];
        const info = fenceMatch[2] || '';
        // CommonMark: backtick fence não pode conter backtick na info string
        if (!(ch === '`' && info.includes('`'))) {
          inCodeFence = true;
          fenceChar = ch;
          fenceLength = marker.length;
          fenceOpenLine = lineNo;
          processedLines.push({ lineNo, rawLine, cleanLine: '', inCodeFence: true });
          continue;
        }
      }
    }

    // Processa comentários HTML na linha (suporta múltiplos <!-- --> na mesma linha e multilinhas)
    let cursor = 0;
    let cleanOut = '';
    while (cursor < rawLine.length) {
      if (inHtmlComment) {
        const closeIdx = rawLine.indexOf('-->', cursor);
        if (closeIdx === -1) {
          cursor = rawLine.length;
        } else {
          inHtmlComment = false;
          commentOpenLine = 0;
          cursor = closeIdx + 3;
        }
      } else {
        const openIdx = rawLine.indexOf('<!--', cursor);
        if (openIdx === -1) {
          cleanOut += rawLine.slice(cursor);
          cursor = rawLine.length;
        } else {
          cleanOut += rawLine.slice(cursor, openIdx);
          inHtmlComment = true;
          commentOpenLine = lineNo;
          cursor = openIdx + 4;
        }
      }
    }

    processedLines.push({
      lineNo,
      rawLine,
      cleanLine: cleanOut,
      inCodeFence: false,
    });
  }

  if (inCodeFence) {
    syntaxErrors.push({
      type: 'UNCLOSED_CODE_FENCE',
      line: fenceOpenLine,
      message: `Unclosed code fence opened at line ${fenceOpenLine}.`,
    });
  }

  if (inHtmlComment) {
    syntaxErrors.push({
      type: 'UNCLOSED_HTML_COMMENT',
      line: commentOpenLine,
      message: `Unclosed HTML comment '<!--' opened at line ${commentOpenLine}.`,
    });
  }

  // Passagem 2: Construção da Árvore Estrutural (H1, Seções H2, Requisitos H3, Cenários H4, Tarefas, Tabelas)
  let h1Title = null;
  let h1Line = null;
  const sections = [];
  const seenH2 = new Map();

  let currentSection = null;
  let currentReq = null;
  let currentScenario = null;
  let pendingRenamedFrom = null;

  // Controle de tabela em andamento
  let activeTable = null;

  function flushActiveTable() {
    if (activeTable) {
      if (currentSection) {
        currentSection.tables.push(activeTable);
      }
      activeTable = null;
    }
  }

  for (const item of processedLines) {
    if (item.inCodeFence) {
      flushActiveTable();
      continue;
    }

    const { lineNo, cleanLine } = item;
    const trimmed = cleanLine.trim();

    // Se havia tabela aberta e a linha não começa com '|', fecha a tabela
    if (activeTable && !trimmed.startsWith('|')) {
      flushActiveTable();
    }

    if (trimmed.length === 0) {
      continue;
    }

    // Detecta headings sem espaço após '#' (ex: "####Scenario: Foo")
    const noSpaceMatch = trimmed.match(MALFORMED_HEADING_NO_SPACE_RE);
    if (noSpaceMatch) {
      malformedHeadings.push({
        line: lineNo,
        raw: trimmed,
        reason: `Missing space after '${noSpaceMatch[1]}' before '${noSpaceMatch[2]}'.`,
      });
      continue;
    }

    const headingMatch = cleanLine.match(HEADING_RE);
    if (headingMatch) {
      flushActiveTable();
      const hashes = headingMatch[1];
      const level = hashes.length;
      const title = headingMatch[2].trim();

      // Verifica se é Requirement ou Scenario com nível de heading errado (G1)
      if (/^Requirement\s*:/i.test(title) && level !== 3) {
        malformedHeadings.push({
          line: lineNo,
          raw: trimmed,
          kind: 'REQUIREMENT_LEVEL',
          reason: `Requirement heading MUST use exactly 3 hashtags ('### Requirement:'), found ${level}.`,
        });
        continue;
      }
      if (/^Scenario\s*:/i.test(title) && level !== 4) {
        malformedHeadings.push({
          line: lineNo,
          raw: trimmed,
          kind: 'SCENARIO_LEVEL',
          reason: `Scenario heading MUST use exactly 4 hashtags ('#### Scenario:'), found ${level}.`,
        });
        continue;
      }

      if (level === 1) {
        if (h1Title === null) {
          h1Title = title;
          h1Line = lineNo;
        }
        continue;
      }

      if (level === 2) {
        if (currentSection) {
          currentSection.lineEnd = lineNo - 1;
        }
        const normH2 = title.toLowerCase();
        if (seenH2.has(normH2)) {
          duplicateH2Sections.push({
            title,
            firstLine: seenH2.get(normH2),
            duplicateLine: lineNo,
          });
        } else {
          seenH2.set(normH2, lineNo);
        }

        currentSection = {
          title,
          lineStart: lineNo,
          lineEnd: rawLines.length,
          proseLines: [],
          requirements: [],
          renamedPairs: [],
          tasks: [],
          tables: [],
        };
        sections.push(currentSection);
        currentReq = null;
        currentScenario = null;
        pendingRenamedFrom = null;
        continue;
      }

      if (level === 3) {
        currentScenario = null;
        if (/^Requirement\s*:/i.test(title)) {
          const reqName = title.replace(/^Requirement\s*:\s*/i, '').trim();
          currentReq = {
            name: reqName,
            normalizedName: reqName.toLowerCase(),
            lineStart: lineNo,
            lineEnd: rawLines.length,
            statementLines: [],
            scenarios: [],
          };
          if (currentSection) {
            currentSection.requirements.push(currentReq);
          }
        } else {
          currentReq = null;
          if (currentSection) {
            currentSection.proseLines.push({ lineNo, text: trimmed });
          }
        }
        continue;
      }

      if (level === 4) {
        if (/^Scenario\s*:/i.test(title)) {
          const scenName = title.replace(/^Scenario\s*:\s*/i, '').trim();
          currentScenario = {
            name: scenName,
            normalizedName: scenName.toLowerCase(),
            lineStart: lineNo,
            lineEnd: rawLines.length,
            steps: [],
            hasWhen: false,
            hasThen: false,
            hasGiven: false,
          };
          if (currentReq) {
            currentReq.scenarios.push(currentScenario);
          } else {
            malformedHeadings.push({
              line: lineNo,
              raw: trimmed,
              kind: 'ORPHAN_SCENARIO',
              reason: `Scenario '${scenName}' appears outside of any '### Requirement:' block.`,
            });
          }
        } else {
          currentScenario = null;
        }
        continue;
      }

      // Headings nível 5 ou 6
      continue;
    }

    // Detecta linhas iniciadas por Scenario: ou Requirement: sem '#'
    if (/^Scenario\s*:/i.test(trimmed)) {
      malformedHeadings.push({
        line: lineNo,
        raw: trimmed,
        kind: 'SCENARIO_LEVEL',
        reason: "Scenario heading MUST start with '#### Scenario:'.",
      });
      continue;
    }
    if (/^Requirement\s*:/i.test(trimmed)) {
      malformedHeadings.push({
        line: lineNo,
        raw: trimmed,
        kind: 'REQUIREMENT_LEVEL',
        reason: "Requirement heading MUST start with '### Requirement:'.",
      });
      continue;
    }

    // Linhas de Tabela Markdown
    if (trimmed.startsWith('|')) {
      const cells = splitMarkdownTableRow(trimmed);
      if (!cells) {
        malformedTables.push({
          line: lineNo,
          section: currentSection?.title || null,
          reason: `Malformed Markdown table row at line ${lineNo}: row starting with '|' must also end with '|'.`,
        });
        continue;
      }

      if (!activeTable) {
        activeTable = {
          lineStart: lineNo,
          headers: cells,
          hasSeparator: false,
          rows: [],
        };
      } else if (!activeTable.hasSeparator && activeTable.rows.length === 0 && isTableSeparatorRow(cells)) {
        if (cells.length !== activeTable.headers.length) {
          malformedTables.push({
            line: lineNo,
            section: currentSection?.title || null,
            reason: `Table separator column count (${cells.length}) does not match header count (${activeTable.headers.length}).`,
          });
        }
        activeTable.hasSeparator = true;
      } else {
        if (cells.length !== activeTable.headers.length) {
          malformedTables.push({
            line: lineNo,
            section: currentSection?.title || null,
            reason: `Table row column count (${cells.length}) does not match header count (${activeTable.headers.length}).`,
          });
        } else {
          const rowMap = {};
          for (let c = 0; c < activeTable.headers.length; c += 1) {
            rowMap[activeTable.headers[c]] = cells[c];
          }
          activeTable.rows.push({
            line: lineNo,
            cells,
            map: rowMap,
          });
        }
      }
      continue;
    }

    // Linhas de Checkbox (- [ ] ou - [x])
    const checkboxMatch = cleanLine.match(CHECKBOX_RE);
    if (checkboxMatch && currentSection) {
      const checked = checkboxMatch[1].toLowerCase() === 'x';
      const rawBody = checkboxMatch[2].trim();
      const details = parseTaskLineDetails(rawBody);
      currentSection.tasks.push({
        line: lineNo,
        checked,
        rawBody,
        ...details,
      });
    }

    // Pares RENAMED (FROM / TO)
    if (currentSection && /^RENAMED\s+Requirements$/i.test(currentSection.title)) {
      const fromMatch = trimmed.match(RENAMED_FROM_RE);
      if (fromMatch) {
        pendingRenamedFrom = { name: fromMatch[1].trim(), line: lineNo };
        continue;
      }
      const toMatch = trimmed.match(RENAMED_TO_RE);
      if (toMatch) {
        if (!pendingRenamedFrom) {
          malformedHeadings.push({
            line: lineNo,
            raw: trimmed,
            kind: 'INVALID_RENAMED_PAIR',
            reason: "Found 'TO:' entry in RENAMED Requirements without a preceding 'FROM:' entry.",
          });
        } else {
          currentSection.renamedPairs.push({
            from: pendingRenamedFrom.name,
            to: toMatch[1].trim(),
            lineStart: pendingRenamedFrom.line,
            lineEnd: lineNo,
          });
          pendingRenamedFrom = null;
        }
        continue;
      }
    }

    // Passos dentro de um Scenario (GIVEN / WHEN / THEN / AND)
    if (currentScenario) {
      currentScenario.steps.push({ lineNo, text: trimmed });
      if (STEP_WHEN_RE.test(trimmed)) currentScenario.hasWhen = true;
      if (STEP_THEN_RE.test(trimmed)) currentScenario.hasThen = true;
      if (STEP_GIVEN_RE.test(trimmed)) currentScenario.hasGiven = true;
      if (STEP_AND_RE.test(trimmed)) {
        // AND herda o passo anterior
      }
      continue;
    }

    // Corpo declarativo de um Requirement (antes do primeiro Scenario)
    if (currentReq) {
      currentReq.statementLines.push({ lineNo, text: trimmed });
      continue;
    }

    // Prosa geral da seção H2
    if (currentSection) {
      currentSection.proseLines.push({ lineNo, text: trimmed });
    }
  }

  flushActiveTable();

  if (pendingRenamedFrom && currentSection) {
    malformedHeadings.push({
      line: pendingRenamedFrom.line,
      raw: pendingRenamedFrom.name,
      kind: 'INVALID_RENAMED_PAIR',
      reason: `Found 'FROM: ### Requirement: ${pendingRenamedFrom.name}' without a matching 'TO:' entry.`,
    });
  }

  // Finaliza metadados calculados das seções e requisitos
  for (const sec of sections) {
    sec.cleanText = sec.proseLines.map((l) => l.text).join('\n').trim();
    for (const req of sec.requirements) {
      const statementText = req.statementLines.map((l) => l.text).join(' ').trim();
      req.statementText = statementText;
      req.charLength = statementText.length;
      const withoutBackticks = stripInlineCode(statementText);
      req.hasShallOrMust = /\b(SHALL|MUST)\b/.test(withoutBackticks);
    }
  }

  return {
    file,
    h1Title,
    h1Line,
    sections,
    syntaxErrors,
    malformedHeadings,
    duplicateH2Sections,
    malformedTables,
    getSection(titleRegexOrExact) {
      if (typeof titleRegexOrExact === 'string') {
        const target = titleRegexOrExact.toLowerCase();
        return sections.find((s) => s.title.toLowerCase() === target) || null;
      }
      return sections.find((s) => titleRegexOrExact.test(s.title)) || null;
    },
  };
}
