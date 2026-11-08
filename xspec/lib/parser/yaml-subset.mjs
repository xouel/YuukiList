/**
 * X-Spec Engine v2.0.1 — Parser Determinístico para o Subconjunto Formal de YAML (EBNF G1)
 * Zero-dependency module
 */

import { ErrorCodes, XSpecError } from '../errors/codes.mjs';

const KEY_REGEX = /^[a-zA-Z0-9_][a-zA-Z0-9_./-]*$/;
const INT_REGEX = /^-?[0-9]+$/;

function yamlError(message, file, line, column = 1) {
  return new XSpecError(ErrorCodes.E001_INVALID_YAML, message, {
    file,
    line,
    column,
    fix: 'Conform to X-Spec YAML Subset (2-space indentation, no tabs, quoted strings for ": ", no duplicate keys).',
  });
}

/**
 * Remove comentário final (# precedido de espaço) fora de aspas simples ou duplas.
 * Também detecta tabs ilegais fora de strings.
 */
function stripCommentAndCheckTabs(rawExpr, file, lineNo, baseCol) {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < rawExpr.length; i += 1) {
    const ch = rawExpr[i];
    if (!inSingle && !inDouble && ch === '\t') {
      throw yamlError('Tab character (\\t) is forbidden in X-Spec YAML.', file, lineNo, baseCol + i);
    }

    if (inDouble) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }

    if (inSingle) {
      if (ch === "'") {
        if (rawExpr[i + 1] === "'") {
          i += 1; // escape ''
        } else {
          inSingle = false;
        }
      }
      continue;
    }

    if (ch === '"') {
      inDouble = true;
    } else if (ch === "'") {
      inSingle = true;
    } else if (ch === '#' && (i === 0 || rawExpr[i - 1] === ' ')) {
      return rawExpr.slice(0, i).trimEnd();
    }
  }

  if (inDouble || inSingle) {
    throw yamlError('Unclosed quoted string in YAML scalar.', file, lineNo, baseCol);
  }

  return rawExpr.trimEnd();
}

/**
 * Faz o parse de um escalar conforme a gramática EBNF G1.
 */
export function parseYamlScalar(rawToken, file = null, lineNo = 1, colNo = 1) {
  const cleaned = stripCommentAndCheckTabs(rawToken.trimStart(), file, lineNo, colNo);

  if (cleaned.length === 0) {
    return null;
  }

  // String com aspas duplas
  if (cleaned.startsWith('"')) {
    if (!cleaned.endsWith('"') || cleaned.length < 2) {
      throw yamlError('Malformed double-quoted string.', file, lineNo, colNo);
    }
    let out = '';
    for (let i = 1; i < cleaned.length - 1; i += 1) {
      const ch = cleaned[i];
      if (ch === '\\') {
        i += 1;
        if (i >= cleaned.length - 1) {
          throw yamlError('Trailing backslash in double-quoted string.', file, lineNo, colNo + i);
        }
        const esc = cleaned[i];
        if (esc === '"') out += '"';
        else if (esc === '\\') out += '\\';
        else if (esc === 'n') out += '\n';
        else if (esc === 'r') out += '\r';
        else if (esc === 't') out += '\t';
        else {
          throw yamlError(`Unsupported escape sequence '\\${esc}' in double-quoted string.`, file, lineNo, colNo + i);
        }
      } else if (ch === '"') {
        throw yamlError('Unescaped double quote inside double-quoted string.', file, lineNo, colNo + i);
      } else {
        out += ch;
      }
    }
    return out;
  }

  // String com aspas simples
  if (cleaned.startsWith("'")) {
    if (!cleaned.endsWith("'") || cleaned.length < 2) {
      throw yamlError('Malformed single-quoted string.', file, lineNo, colNo);
    }
    let out = '';
    for (let i = 1; i < cleaned.length - 1; i += 1) {
      const ch = cleaned[i];
      if (ch === "'") {
        if (cleaned[i + 1] === "'") {
          out += "'";
          i += 1;
        } else {
          throw yamlError("Unescaped single quote inside single-quoted string (use '' to escape).", file, lineNo, colNo + i);
        }
      } else {
        out += ch;
      }
    }
    return out;
  }

  // Coleções vazias inline permitidas
  if (cleaned === '[]') return [];
  if (cleaned === '{}') return {};

  // Rejeita coleções inline não-vazias e construções YAML avançadas proibidas
  if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
    throw yamlError(
      'Non-empty flow collections ([...] or {...}) are forbidden in X-Spec YAML Subset; use block lists or maps.',
      file,
      lineNo,
      colNo
    );
  }
  if (cleaned.startsWith('&') || cleaned.startsWith('*') || cleaned.startsWith('!')) {
    throw yamlError(
      `Unsupported YAML construct '${cleaned[0]}' (anchors, aliases, and tags are forbidden).`,
      file,
      lineNo,
      colNo
    );
  }

  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;
  if (cleaned === 'null' || cleaned === '~') return null;
  if (INT_REGEX.test(cleaned)) return Number.parseInt(cleaned, 10);

  // PlainScalar: proibido conter ': ' ou terminar com ':'
  if (cleaned.includes(': ') || cleaned.endsWith(':')) {
    throw yamlError(
      `Unquoted scalar '${cleaned}' contains ambiguous colon (': '). Wrap the value in double quotes.`,
      file,
      lineNo,
      colNo
    );
  }

  return cleaned;
}

/**
 * Conta espaços iniciais e rejeita Tab na indentação.
 */
function countIndent(line, file, lineNo) {
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === ' ') {
      count += 1;
    } else if (line[i] === '\t') {
      throw yamlError('Tab character (\\t) is forbidden in indentation; use 2 spaces per level.', file, lineNo, i + 1);
    } else {
      break;
    }
  }
  return count;
}

/**
 * Divide uma linha "key: rest" validando o identificador da chave.
 */
function splitKeyValue(trimmedLine, file, lineNo, indent) {
  const colonIdx = trimmedLine.indexOf(':');
  if (colonIdx === -1) {
    throw yamlError(`Expected 'key: value' mapping entry or '- item' list entry, found '${trimmedLine}'.`, file, lineNo, indent + 1);
  }
  const key = trimmedLine.slice(0, colonIdx).trim();
  if (!KEY_REGEX.test(key)) {
    throw yamlError(`Invalid YAML key '${key}'. Keys must match ${KEY_REGEX}.`, file, lineNo, indent + 1);
  }
  const afterColon = trimmedLine.slice(colonIdx + 1);
  if (afterColon.length > 0 && afterColon[0] !== ' ' && afterColon[0] !== '\t') {
    throw yamlError(`Missing space after colon for key '${key}'.`, file, lineNo, indent + colonIdx + 2);
  }
  if (afterColon.startsWith('\t')) {
    throw yamlError('Tab character (\\t) after colon is forbidden.', file, lineNo, indent + colonIdx + 2);
  }
  return {
    key,
    rest: afterColon.slice(1), // remove 1 espaço após ':'
    restCol: indent + colonIdx + 3,
  };
}

/**
 * Faz o parse de um documento no Subconjunto Formal de YAML do X-Spec.
 * @param {string} sourceText
 * @param {object} [options]
 * @param {string|null} [options.file]
 * @returns {Record<string, any>}
 */
export function parseYamlSubset(sourceText, { file = null } = {}) {
  if (typeof sourceText !== 'string') {
    throw yamlError('YAML input must be a string.', file, 1, 1);
  }
  if (sourceText.includes('\0')) {
    throw new XSpecError(ErrorCodes.E011_SECURITY_VIOLATION, 'Binary null byte detected in YAML input.', { file, line: 1 });
  }

  const normalized = sourceText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');

  let index = 0;

  function peekNextNonEmpty(startIdx) {
    for (let k = startIdx; k < rawLines.length; k += 1) {
      const line = rawLines[k];
      const indent = countIndent(line, file, k + 1);
      const trimmed = line.slice(indent).trimEnd();
      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        continue;
      }
      return { lineIndex: k, indent, trimmed };
    }
    return null;
  }

  function parseBlockScalar(parentIndent, startLineIdx) {
    const collected = [];
    let blockIndent = null;
    let cursor = startLineIdx;

    while (cursor < rawLines.length) {
      const line = rawLines[cursor];
      if (line.includes('\t')) {
        throw yamlError('Tab character (\\t) is forbidden inside block scalar.', file, cursor + 1, line.indexOf('\t') + 1);
      }

      // Linha apenas de espaços
      if (line.trim().length === 0) {
        // Verifica se existe linha subsequente que ainda pertence ao bloco
        let hasMoreBlockLines = false;
        for (let look = cursor + 1; look < rawLines.length; look += 1) {
          if (rawLines[look].trim().length === 0) continue;
          const lookIndent = countIndent(rawLines[look], file, look + 1);
          const minRequired = blockIndent !== null ? blockIndent : parentIndent + 2;
          if (lookIndent >= minRequired) {
            hasMoreBlockLines = true;
          }
          break;
        }
        if (!hasMoreBlockLines) {
          break;
        }
        collected.push('');
        cursor += 1;
        continue;
      }

      const lineIndent = countIndent(line, file, cursor + 1);
      if (lineIndent < parentIndent + 2) {
        break;
      }

      if (blockIndent === null) {
        if (lineIndent % 2 !== 0) {
          throw yamlError(`Block scalar indentation must be a multiple of 2 spaces (found ${lineIndent}).`, file, cursor + 1, 1);
        }
        blockIndent = lineIndent;
      }

      if (lineIndent < blockIndent) {
        break;
      }

      collected.push(line.slice(blockIndent));
      cursor += 1;
    }

    index = cursor;
    return collected.join('\n');
  }

  function parseList(expectedIndent) {
    const items = [];
    while (index < rawLines.length) {
      const lineNo = index + 1;
      const line = rawLines[index];
      const indent = countIndent(line, file, lineNo);
      const trimmed = line.slice(indent).trimEnd();

      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        index += 1;
        continue;
      }

      if (indent < expectedIndent) {
        break;
      }
      if (indent > expectedIndent) {
        throw yamlError(`Unexpected indentation (${indent} spaces, expected ${expectedIndent}) in list.`, file, lineNo, 1);
      }
      if (!trimmed.startsWith('-')) {
        break;
      }
      if (trimmed.length > 1 && trimmed[1] !== ' ') {
        throw yamlError("List item '-' must be followed by a space.", file, lineNo, indent + 2);
      }

      const itemRaw = trimmed.slice(2);
      const value = parseYamlScalar(itemRaw, file, lineNo, indent + 3);
      if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
        throw yamlError('Nested collections inside list items are not supported in X-Spec YAML Subset.', file, lineNo, indent + 3);
      }
      items.push(value);
      index += 1;
    }
    return items;
  }

  function parseMap(expectedIndent) {
    const map = Object.create(null);
    const seenKeys = new Set();

    while (index < rawLines.length) {
      const lineNo = index + 1;
      const line = rawLines[index];
      const indent = countIndent(line, file, lineNo);
      const trimmed = line.slice(indent).trimEnd();

      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        index += 1;
        continue;
      }

      if (trimmed === '---' || trimmed === '...') {
        throw yamlError(`Multi-document YAML marker '${trimmed}' is forbidden in X-Spec YAML Subset.`, file, lineNo, indent + 1);
      }

      if (indent % 2 !== 0) {
        throw yamlError(`Indentation must be a multiple of 2 spaces (found ${indent} spaces).`, file, lineNo, 1);
      }

      if (indent < expectedIndent) {
        break;
      }
      if (indent > expectedIndent) {
        throw yamlError(`Unexpected indentation (${indent} spaces, expected ${expectedIndent}).`, file, lineNo, 1);
      }

      if (trimmed.startsWith('-')) {
        throw yamlError('Unexpected list item inside map at same indentation level.', file, lineNo, indent + 1);
      }

      const { key, rest, restCol } = splitKeyValue(trimmed, file, lineNo, indent);
      if (seenKeys.has(key)) {
        throw yamlError(`Duplicate key '${key}' in YAML mapping.`, file, lineNo, indent + 1);
      }
      seenKeys.add(key);

      const cleanedRest = stripCommentAndCheckTabs(rest.trimStart(), file, lineNo, restCol);

      // Caso 1: Multiline block scalar '|'
      if (cleanedRest === '|') {
        index += 1;
        map[key] = parseBlockScalar(expectedIndent, index);
        continue;
      }

      // Caso 2: Valor inline presente na mesma linha
      if (cleanedRest.length > 0) {
        map[key] = parseYamlScalar(rest, file, lineNo, restCol);
        index += 1;
        continue;
      }

      // Caso 3: Sem valor inline -> verifica próxima linha significativa para lista ou mapa filho
      index += 1;
      const nextInfo = peekNextNonEmpty(index);
      if (!nextInfo || nextInfo.indent <= expectedIndent) {
        map[key] = null;
        continue;
      }

      if (nextInfo.indent !== expectedIndent + 2) {
        throw yamlError(
          `Invalid child indentation under '${key}': expected ${expectedIndent + 2} spaces, found ${nextInfo.indent}.`,
          file,
          nextInfo.lineIndex + 1,
          1
        );
      }

      if (nextInfo.trimmed.startsWith('-')) {
        map[key] = parseList(expectedIndent + 2);
      } else {
        map[key] = parseMap(expectedIndent + 2);
      }
    }

    return { ...map };
  }

  return parseMap(0);
}
