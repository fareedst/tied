/**
 * [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 * Summary: Shared token, procedure-range, and contract-field parsing primitives for validator and analyzer parser.
 */

export const SEMANTIC_TOKEN_PATTERN =
  /\[(REQ-[A-Za-z0-9_-]+|ARCH-[A-Za-z0-9_-]+|IMPL-[A-Za-z0-9_-]+)\]/g;

export const PROCEDURE_HEADING_PATTERN =
  /^\s*(procedure|function|block)\s+([A-Z][A-Z0-9_]*)\b/i;

export const CONTRACT_FIELD_PATTERN =
  /^\s*(INPUT|OUTPUT|DATA|CONTROL|PRE|POST|EFFECTS|FAILURE_MODES|DATA_TRANSITION|TERMINATION)\s*:/;

export type ProcedureKind = "procedure" | "function" | "block";

export type ProcedureRange = {
  name: string;
  kind: ProcedureKind;
  start: number;
  end: number;
};

export type ExtractSemanticTokensOptions = {
  unique?: boolean;
};

function semanticTokenRegex(): RegExp {
  return new RegExp(SEMANTIC_TOKEN_PATTERN.source, SEMANTIC_TOKEN_PATTERN.flags);
}

/**
 * [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 * How: Extract bracketed REQ/ARCH/IMPL tokens using a fresh regex instance to avoid global state bleed.
 */
export function extractSemanticTokens(
  text: string,
  options: ExtractSemanticTokensOptions = {},
): string[] {
  const tokens = [...text.matchAll(semanticTokenRegex())].map((match) => match[1]);
  if (!options.unique) return tokens;
  return [...new Set(tokens)].sort((left, right) => left.localeCompare(right));
}

/**
 * [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 * How: Scan procedure/function/block headings and derive half-open [start, end) line ranges in source order.
 */
export function scanProcedureBlocks(lines: readonly string[]): ProcedureRange[] {
  const starts: Array<{ name: string; kind: ProcedureKind; start: number }> = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(PROCEDURE_HEADING_PATTERN);
    if (!match) continue;
    starts.push({
      name: match[2],
      kind: match[1].toLowerCase() as ProcedureKind,
      start: index,
    });
  }
  return starts.map((range, index) => ({
    ...range,
    end: starts[index + 1]?.start ?? lines.length,
  }));
}

/**
 * [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 * How: Collect contract field labels in first-seen source order without duplicates.
 */
export function parseContractFields(lines: readonly string[]): string[] {
  const fields: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const match = line.match(CONTRACT_FIELD_PATTERN);
    if (!match || seen.has(match[1])) continue;
    seen.add(match[1]);
    fields.push(match[1]);
  }
  return fields;
}

/**
 * [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 * How: Detect whether a block body declares an explicit Contract heading.
 */
export function hasContractHeading(lines: readonly string[]): boolean {
  return lines.some((line) => /^\s*Contract\s*:/i.test(line));
}
