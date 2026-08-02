/**
 * [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Validate pseudo-code structure and token-linked contracts without claiming runtime behavior.
 *
 * Layer A (`tied_validate_consistency`) checks TIED records and references.
 * This module checks the pseudo-code body itself and deliberately does not
 * claim behavioral test coverage.
 */

export type PseudocodeDiagnostic = {
  severity: "error" | "warning";
  code:
    | "MISSING_TOKEN_LINK"
    | "UNKNOWN_TOKEN"
    | "MISSING_BLOCK_TOKEN_LINK"
    | "MISSING_CONTRACT"
    | "MISSING_FAILURE_MODES"
    | "MISSING_DATA_TRANSITION"
    | "MISSING_TERMINATION"
    | "UNRESOLVED_SYMBOL"
    | "MISSING_COVERAGE_REFERENCE";
  message: string;
  line: number;
  block?: string;
};

export type PseudocodeBlock = {
  name: string;
  line: number;
  token_refs: string[];
  contract_fields: string[];
};

export type PseudocodeDependency = {
  caller: string;
  callee: string;
  line: number;
};

export type PseudocodeCoverage = {
  block: string;
  branch_lines: number[];
  failure_modes: string[];
  references: string[];
};

export type PseudocodeValidationInput = {
  token: string;
  pseudocode: string;
  known_tokens?: string[];
  require_contracts?: boolean;
  require_behavioral_coverage?: boolean;
  coverage_references?: Record<string, string[]>;
};

export type PseudocodeValidationReport = {
  schema_version: "layer-b-pseudocode-validator.v1";
  ok: boolean;
  proof_boundary: string;
  blocks: PseudocodeBlock[];
  dependencies: PseudocodeDependency[];
  coverage: PseudocodeCoverage[];
  diagnostics: PseudocodeDiagnostic[];
};

const TOKEN_RE = /\[(REQ-[A-Z0-9_-]+|ARCH-[A-Z0-9_-]+|IMPL-[A-Z0-9_-]+)\]/g;
const REQUIRED_CONTRACT_FIELDS = ["INPUT", "OUTPUT", "PRE", "POST", "EFFECTS"];
const BUILTIN_CALLS = new Set([
  "NORMALIZE",
  "NORMALIZE_COMMAND_RESULTS",
  "NORMALIZE_QUALITY_ROWS",
  "SORT",
]);

function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN_RE)].map((match) => match[1]);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function contractFields(lines: string[]): string[] {
  const fields = new Set<string>();
  for (const line of lines) {
    const match = line.match(/^\s*(INPUT|OUTPUT|DATA|CONTROL|PRE|POST|EFFECTS|FAILURE_MODES|DATA_TRANSITION|TERMINATION)\s*:/);
    if (match) fields.add(match[1]);
  }
  return [...fields];
}

function hasContractHeading(lines: string[]): boolean {
  return lines.some((line) => /^\s*Contract\s*:/i.test(line));
}

/**
 * [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Parse blocks, validate token linkage and contract shape, resolve dependencies, and report structural findings.
 */
export function validateEssencePseudocode(
  input: PseudocodeValidationInput,
): PseudocodeValidationReport {
  // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Parse source-located blocks, validate contracts and symbols, then emit structural-only diagnostics.
  const lines = input.pseudocode.split(/\r?\n/);
  const diagnostics: PseudocodeDiagnostic[] = [];
  const allTokens = uniqueSorted(tokensIn(input.pseudocode));
  const knownTokens = new Set(input.known_tokens ?? []);
  const blocks: PseudocodeBlock[] = [];
  const procedureRanges: Array<{ name: string; start: number; end: number }> = [];

  if (!allTokens.includes(input.token)) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_TOKEN_LINK",
      message: `Pseudo-code does not reference ${input.token}.`,
      line: 1,
    });
  }

  for (const token of allTokens) {
    if (knownTokens.size > 0 && !knownTokens.has(token)) {
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_TOKEN",
        message: `Pseudo-code references unknown token ${token}.`,
        line: lines.findIndex((line) => line.includes(`[${token}]`)) + 1,
      });
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*(?:procedure|function|block)\s+([A-Z][A-Z0-9_]*)\b/i);
    if (match) procedureRanges.push({ name: match[1], start: index, end: lines.length });
  }
  procedureRanges.forEach((range, index) => {
    range.end = procedureRanges[index + 1]?.start ?? lines.length;
  });

  const globalContractStart = lines.findIndex((line) => /^\s*Contract\s*:/i.test(line));
  const globalContractEnd =
    globalContractStart >= 0
      ? procedureRanges.find((range) => range.start > globalContractStart)?.start ?? lines.length
      : -1;
  const globalContract = globalContractStart >= 0
    ? contractFields(lines.slice(globalContractStart, globalContractEnd))
    : [];

  for (const range of procedureRanges) {
    const body = lines.slice(range.start, range.end);
    const bodyText = body.join("\n");
    const refs = uniqueSorted(tokensIn(bodyText));
    const fields = contractFields(body);
    const effectiveFields = uniqueSorted([...globalContract, ...fields]);
    const block: PseudocodeBlock = {
      name: range.name,
      line: range.start + 1,
      token_refs: refs,
      contract_fields: effectiveFields,
    };
    blocks.push(block);

    if (!refs.includes(input.token)) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_BLOCK_TOKEN_LINK",
        message: `Block ${range.name} does not reference ${input.token}.`,
        line: range.start + 1,
        block: range.name,
      });
    }

    if (input.require_contracts !== false) {
      const missing = REQUIRED_CONTRACT_FIELDS.filter((field) => !effectiveFields.includes(field));
      if (missing.length > 0 || (!hasContractHeading(body) && globalContractStart < 0)) {
        diagnostics.push({
          severity: "error",
          code: "MISSING_CONTRACT",
          message: `Block ${range.name} is missing contract fields: ${missing.join(", ") || "Contract"}.`,
          line: range.start + 1,
          block: range.name,
        });
      }
    }

    if (/\b(?:RETURN|RAISE)\s+(?:error|failure)|\berror\b|\bFAILURE_MODE\b/i.test(bodyText)
      && !effectiveFields.includes("FAILURE_MODES")) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_FAILURE_MODES",
        message: `Block ${range.name} has an error path without FAILURE_MODES.`,
        line: range.start + 1,
        block: range.name,
      });
    }
    if (/\b(?:mutat|state transition|DATA_TRANSITION)\w*/i.test(bodyText)
      && !effectiveFields.includes("DATA_TRANSITION")) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_DATA_TRANSITION",
        message: `Block ${range.name} mutates state without DATA_TRANSITION.`,
        line: range.start + 1,
        block: range.name,
      });
    }
    if (/\b(?:WHILE|AWAIT|WAIT|RECURS|open-ended)\b/i.test(bodyText)
      && !effectiveFields.includes("TERMINATION")) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_TERMINATION",
        message: `Block ${range.name} has open-ended control flow without TERMINATION.`,
        line: range.start + 1,
        block: range.name,
      });
    }
  }

  const dependencies: PseudocodeDependency[] = [];
  const defined = new Set(procedureRanges.map((range) => range.name));
  for (const range of procedureRanges) {
    for (let index = range.start; index < range.end; index += 1) {
      const match = lines[index].match(/\bCALL\s+([A-Z][A-Z0-9_]*)\s*\(/);
      if (!match) continue;
      const callee = match[1];
      dependencies.push({ caller: range.name, callee, line: index + 1 });
      if (!defined.has(callee) && !BUILTIN_CALLS.has(callee)) {
        diagnostics.push({
          severity: "error",
          code: "UNRESOLVED_SYMBOL",
          message: `CALL references undefined procedure ${callee}.`,
          line: index + 1,
          block: range.name,
        });
      }
    }
  }

  const coverage: PseudocodeCoverage[] = procedureRanges.map((range) => {
    const body = lines.slice(range.start, range.end);
    const branchLines = body
      .map((line, index) => (/\bIF\b|\bELSE\b|\bCASE\b/i.test(line) ? range.start + index + 1 : 0))
      .filter((line) => line > 0);
    const failureModes = body
      .filter((line) => /\b(?:error|failure|FAILURE_MODE)\b/i.test(line))
      .map((line) => line.trim());
    const references = input.coverage_references?.[range.name] ?? [];
    if (input.require_behavioral_coverage && (branchLines.length > 0 || failureModes.length > 0) && references.length === 0) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_COVERAGE_REFERENCE",
        message: `Block ${range.name} has branches or failure modes without a coverage reference.`,
        line: range.start + 1,
        block: range.name,
      });
    }
    return {
      block: range.name,
      branch_lines: branchLines,
      failure_modes: failureModes,
      references: [...references],
    };
  });

  return {
    schema_version: "layer-b-pseudocode-validator.v1",
    ok: diagnostics.every((diagnostic) => diagnostic.severity !== "error"),
    proof_boundary: "Structural pseudo-code shape, token linkage, and dependency diagnostics only; behavioral test coverage remains separate.",
    blocks,
    dependencies,
    coverage,
    diagnostics,
  };
}
