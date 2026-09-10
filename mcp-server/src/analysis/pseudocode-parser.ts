/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Parse essence_pseudocode grammar v1 into normalized IR.
 */
import {
  DEFAULT_BUDGETS,
  GRAMMAR_VERSION,
  GRAMMAR_VERSION_V2,
  type ContractFields,
  type GrammarVersion,
  type IrProcedure,
  type IrProgram,
  type IrStatement,
  type PseudocodeAnalysisBudgets,
  type SourceSpan,
  type UnsupportedSyntax,
} from "./pseudocode-ir.js";
import {
  detectGrammarVersion,
  findV2ContractEnd,
  parseV2ContractSection,
  type DetectGrammarVersionOptions,
  type GrammarVersionOverride,
} from "./pseudocode-grammar-v2.js";
import {
  parseCallArgExpressions,
  splitCallArgs,
} from "./pseudocode-expression-parser.js";
import {
  CONTRACT_FIELD_PATTERN,
  extractSemanticTokens,
  PROCEDURE_HEADING_PATTERN,
  scanProcedureBlocks,
} from "./pseudocode-shared.js";
import { extractContractBinding } from "./pseudocode-typed-ir.js";
const ASSIGNMENT_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/;
const IF_RE = /^\s*IF\s+(.+?)\s*:\s*$/i;
const ELSE_RE = /^\s*ELSE\s*:\s*$/i;
const WHILE_RE = /^\s*WHILE\s+(.+?)\s*:\s*$/i;
const FOR_RE = /^\s*FOR\s+(.+?)\s*:\s*$/i;
const SWITCH_RE = /^\s*SWITCH\s+(.+?)\s*:\s*$/i;
const CASE_RE = /^\s*CASE\s+(.+?)\s*:\s*$/i;
const CALL_WITH_ARGS_RE = /^\s*CALL\s+([A-Z][A-Z0-9_]*)\s*\(([^)]*)\)\s*$/;
const CALL_NO_ARGS_RE = /^\s*CALL\s+([A-Z][A-Z0-9_]*)\s*$/;
const RUN_RE = /^\s*RUN\s+(.+?)\s*$/i;
const RETURN_RE = /^\s*RETURN(?:\s+(.+))?\s*$/i;
const ERROR_RE = /^\s*(?:RAISE|RETURN)\s+(?:error|failure)\b/i;

export type ParseOptions = DetectGrammarVersionOptions;

export type ParseResult =
  | { ok: true; program: IrProgram }
  | { ok: false; error: string; diagnostics: Array<{ code: string; message: string; line: number }> };

export { detectGrammarVersion, type GrammarVersionOverride };

function spanAt(lineIndex: number, line: string, startCol = 0): SourceSpan {
  const trimmed = line.trimStart();
  const column = startCol > 0 ? startCol : line.indexOf(trimmed) + 1;
  return {
    line: lineIndex + 1,
    column: Math.max(column, 1),
    end_line: lineIndex + 1,
    end_column: line.length,
  };
}

function contractValueFromLine(line: string): string {
  const match = line.match(/^\s*(?:INPUT|OUTPUT|DATA|CONTROL|PRE|POST|EFFECTS|FAILURE_MODES|DATA_TRANSITION|TERMINATION)\s*:\s*(.*)$/i);
  return match?.[1]?.trim() ?? "";
}

function contractFieldsIn(lines: string[]): ContractFields {
  const fields: string[] = [];
  const entries: ContractFields["entries"] = [];
  const values: Record<string, string> = {};
  const type_tags: ContractFields["type_tags"] = {};
  let firstLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(CONTRACT_FIELD_PATTERN);
    if (!match) continue;
    const field = match[1];
    const value = contractValueFromLine(lines[i]);
    const binding = extractContractBinding(value);
    if (firstLine < 0) firstLine = i;
    if (!fields.includes(field)) fields.push(field);
    entries!.push({
      field,
      value,
      type_tag: binding.type_tag,
    });
    values[field] = value;
    if (binding.name && binding.type_tag) {
      type_tags![binding.name] = binding.type_tag;
    } else if (binding.type_tag && !binding.name) {
      type_tags![field.toLowerCase()] = binding.type_tag;
    }
  }
  return {
    fields,
    entries,
    values,
    type_tags,
    span: firstLine >= 0 ? spanAt(firstLine, lines[firstLine]) : undefined,
  };
}

function parseCallStatement(line: string): { callee: string; args: string[] } | null {
  const withArgs = line.match(CALL_WITH_ARGS_RE);
  if (withArgs) {
    return { callee: withArgs[1], args: splitCallArgs(withArgs[2]) };
  }
  const noArgs = line.match(CALL_NO_ARGS_RE);
  if (noArgs) {
    return { callee: noArgs[1], args: [] };
  }
  return null;
}

function parseStatements(
  lines: string[],
  start: number,
  end: number,
  unsupported: UnsupportedSyntax[],
  nodeCounter: { count: number },
  maxNodes: number,
): IrStatement[] {
  const statements: IrStatement[] = [];
  for (let i = start; i < end; i += 1) {
    if (nodeCounter.count >= maxNodes) break;
    const line = lines[i];
    if (!line.trim() || line.match(/^\s*#/) || line.match(/^\s*Contract\s*:/i)) continue;

    const procMatch = line.match(PROCEDURE_HEADING_PATTERN);
    if (procMatch) break;

    nodeCounter.count += 1;

    let match: RegExpMatchArray | null;
    let call: ReturnType<typeof parseCallStatement>;
    if ((match = line.match(IF_RE))) {
      statements.push({ kind: "if", condition: match[1].trim(), span: spanAt(i, line) });
    } else if (ELSE_RE.test(line)) {
      statements.push({ kind: "else", span: spanAt(i, line) });
    } else if ((match = line.match(WHILE_RE))) {
      statements.push({ kind: "while", condition: match[1].trim(), span: spanAt(i, line) });
    } else if ((match = line.match(FOR_RE))) {
      statements.push({ kind: "for", iterator: match[1].trim(), span: spanAt(i, line) });
    } else if ((match = line.match(SWITCH_RE))) {
      statements.push({ kind: "switch", expression: match[1].trim(), span: spanAt(i, line) });
    } else if ((match = line.match(CASE_RE))) {
      statements.push({ kind: "case", label: match[1].trim(), span: spanAt(i, line) });
    } else if ((call = parseCallStatement(line))) {
      statements.push({
        kind: "call",
        callee: call.callee,
        args: call.args,
        arg_exprs: parseCallArgExpressions(call.args),
        span: spanAt(i, line),
      });
    } else if ((match = line.match(RUN_RE))) {
      statements.push({ kind: "run", target: match[1].trim(), span: spanAt(i, line) });
    } else if ((match = line.match(RETURN_RE))) {
      statements.push({ kind: "return", value: match[1]?.trim(), span: spanAt(i, line) });
    } else if (ERROR_RE.test(line)) {
      statements.push({ kind: "error", message: line.trim(), span: spanAt(i, line) });
    } else if ((match = line.match(ASSIGNMENT_RE))) {
      statements.push({
        kind: "assignment",
        target: match[1],
        value: match[2].trim(),
        span: spanAt(i, line),
      });
    } else if (/^\s*[A-Z_]+\s/.test(line) && !line.match(/^\s*(INPUT|OUTPUT|PRE|POST|EFFECTS)/)) {
      const stepMatch = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s+(.+)$/);
      if (stepMatch) {
        statements.push({
          kind: "assignment",
          target: stepMatch[1],
          value: stepMatch[2].trim(),
          span: spanAt(i, line),
        });
      } else {
        unsupported.push({
          construct: "unsupported_statement",
          message: `Unsupported statement form: ${line.trim()}`,
          span: spanAt(i, line),
        });
      }
    } else if (line.trim()) {
      unsupported.push({
        construct: "unsupported_statement",
        message: `Unsupported statement form: ${line.trim()}`,
        span: spanAt(i, line),
      });
    }
  }
  return statements;
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Parse source text into grammar v1 IR with spans, token refs, and unsupported_syntax entries.
 */
export function parsePseudocodeToIr(
  source: string,
  budgets: PseudocodeAnalysisBudgets = DEFAULT_BUDGETS,
  options: ParseOptions = {},
): ParseResult {
  const grammarVersion: GrammarVersion = detectGrammarVersion(source, options);
  const isV2 = grammarVersion === GRAMMAR_VERSION_V2;
  if (source.length > budgets.max_source_bytes) {
    return {
      ok: false,
      error: "INPUT_TOO_LARGE",
      diagnostics: [
        {
          code: "INPUT_TOO_LARGE",
          message: `Source exceeds max_source_bytes (${budgets.max_source_bytes})`,
          line: 1,
        },
      ],
    };
  }

  const lines = source.split(/\r?\n/);
  const unsupported: UnsupportedSyntax[] = [];
  const nodeCounter = { count: 0 };
  const procedureRanges = scanProcedureBlocks(lines);

  if (procedureRanges.length > budgets.max_procedures) {
    return {
      ok: false,
      error: "TOO_MANY_PROCEDURES",
      diagnostics: [
        {
          code: "TRUNCATED_PARSE",
          message: `Procedure count exceeds max_procedures (${budgets.max_procedures})`,
          line: 1,
        },
      ],
    };
  }

  const globalContractStart = lines.findIndex((line) => /^\s*Contract\s*:/i.test(line));
  const firstProcStart = procedureRanges[0]?.start ?? lines.length;
  const globalContractEnd =
    globalContractStart >= 0 && globalContractStart < firstProcStart
      ? firstProcStart
      : globalContractStart >= 0
        ? lines.length
        : -1;
  const globalContract =
    globalContractStart >= 0
      ? isV2
        ? parseV2ContractSection(lines, globalContractStart, globalContractEnd).contract
        : contractFieldsIn(lines.slice(globalContractStart, globalContractEnd))
      : { fields: [] };

  const procedures: IrProcedure[] = [];
  for (const range of procedureRanges) {
    const bodyLines = lines.slice(range.start, range.end);
    const bodyText = bodyLines.join("\n");

    const contractStart = bodyLines.findIndex((line) => /^\s*Contract\s*:/i.test(line));
    let contract: ContractFields = { fields: [] };
    let summaries: IrProcedure["summaries"];
    let alias_policy: IrProcedure["alias_policy"];
    let stmtStart = 1;
    if (contractStart >= 0) {
      const endIdx = isV2
        ? findV2ContractEnd(bodyLines, contractStart)
        : (() => {
            let end = contractStart + 1;
            for (let li = contractStart + 1; li < bodyLines.length; li += 1) {
              const line = bodyLines[li];
              if (PROCEDURE_HEADING_PATTERN.test(line)) {
                end = li;
                break;
              }
              if (
                /^\s*Contract\s*:/i.test(line) ||
                CONTRACT_FIELD_PATTERN.test(line) ||
                /^\s*#/.test(line)
              ) {
                end = li + 1;
                continue;
              }
              if (!line.trim()) {
                end = li + 1;
                continue;
              }
              end = li;
              break;
            }
            return end;
          })();

      if (isV2) {
        const absoluteStart = range.start + contractStart;
        const absoluteEnd = range.start + endIdx;
        const parsed = parseV2ContractSection(lines, absoluteStart, absoluteEnd);
        contract = parsed.contract;
        summaries = parsed.summaries.length > 0 ? parsed.summaries : undefined;
        alias_policy = parsed.alias_policy;
      } else {
        contract = contractFieldsIn(bodyLines.slice(contractStart, endIdx));
      }
      stmtStart = endIdx;
    }

    const effectiveFields = [...new Set([...globalContract.fields, ...contract.fields])];
    contract = { ...contract, fields: effectiveFields };

    const statements = parseStatements(
      bodyLines,
      stmtStart,
      bodyLines.length,
      unsupported,
      nodeCounter,
      budgets.max_parse_nodes,
    );

    procedures.push({
      name: range.name,
      kind: range.kind,
      span: spanAt(range.start, lines[range.start]),
      token_refs: extractSemanticTokens(bodyText, { unique: true }),
      contract,
      statements,
      ...(summaries ? { summaries } : {}),
      ...(alias_policy ? { alias_policy } : {}),
    });
  }

  const truncatedParse = nodeCounter.count >= budgets.max_parse_nodes;

  const program: IrProgram = {
    grammar_version: grammarVersion,
    procedures,
    global_contract: globalContract,
    token_refs: extractSemanticTokens(source, { unique: true }),
    unsupported_syntax: unsupported.sort((a, b) => a.span.line - b.span.line || a.span.column - b.span.column),
    parse_node_count: nodeCounter.count,
    truncated_parse: truncatedParse,
  };

  return { ok: true, program };
}

/** Deterministic JSON serialization for IR (testing). */
export function serializeIrProgram(program: IrProgram): string {
  return JSON.stringify(program);
}
