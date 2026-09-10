/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: Grammar v2 version detection and contract-section extensions (parse-only).
 */
import {
  GRAMMAR_VERSION,
  GRAMMAR_VERSION_V2,
  type ContractFieldEntry,
  type ContractFields,
  type GrammarVersion,
  type SourceSpan,
} from "./pseudocode-ir.js";
import type {
  AliasPolicy,
  AliasPolicyEntry,
  MutabilityTag,
  ProcedureSummary,
  SummaryEntry,
  SummaryKind,
} from "./pseudocode-constraint-ir.js";
import { CONTRACT_FIELD_PATTERN, PROCEDURE_HEADING_PATTERN } from "./pseudocode-shared.js";
import { extractContractBinding, parseTypeTag } from "./pseudocode-typed-ir.js";

export type GrammarVersionOverride = "v1" | "v2";

export type DetectGrammarVersionOptions = {
  grammar_version_override?: GrammarVersionOverride;
  qualification_mode?: boolean;
};

const GRAMMAR_VERSION_HEADER_RE = /^\s*Grammar-Version:\s*v2\s*$/i;
const SUMMARY_HEADING_RE = /^\s*SUMMARY\s+(CALL|RETURN)\s*:\s*$/i;
const ALIAS_POLICY_HEADING_RE = /^\s*ALIAS\s+POLICY\s*:\s*$/i;
const BULLET_ENTRY_RE = /^\s*-\s*(.+)$/;
const WHERE_SPLIT_RE = /\s+where\s+/i;
const MUTABILITY_BINDING_RE =
  /^([A-Za-z_][A-Za-z0-9_]*)\s*\((immutable|mutable)\)\s*:\s*(.+)$/i;
const SUMMARY_ENTRY_RE = /^\s*([^:]+)\s*:\s*(.+)$/;
const REFINEMENT_ONLY_VALUE_RE =
  />=|<=|<>|!=|>|<|\bis not null\b|\bAND\b|\bOR\b|\bNOT\b|\bforall\b|\blength\s*\(/i;

export type V2ContractBinding = {
  name?: string;
  type_tag?: ReturnType<typeof parseTypeTag>;
  mutability?: MutabilityTag;
  refinement?: string;
  prose: boolean;
};

export type V2ContractParseResult = {
  contract: ContractFields;
  summaries: ProcedureSummary[];
  alias_policy?: AliasPolicy;
};

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Scan sidecar preamble for Grammar-Version: v2; default v1; harness override in qualification_mode only.
 */
export function detectGrammarVersion(
  source: string,
  options: DetectGrammarVersionOptions = {},
): GrammarVersion {
  if (options.qualification_mode && options.grammar_version_override === "v2") {
    return GRAMMAR_VERSION_V2;
  }
  if (options.qualification_mode && options.grammar_version_override === "v1") {
    return GRAMMAR_VERSION;
  }

  const lines = source.split(/\r?\n/);
  const firstProcIdx = lines.findIndex((line) => PROCEDURE_HEADING_PATTERN.test(line));
  const preambleEnd = firstProcIdx >= 0 ? firstProcIdx : lines.length;

  for (let i = 0; i < preambleEnd; i += 1) {
    if (GRAMMAR_VERSION_HEADER_RE.test(lines[i])) {
      return GRAMMAR_VERSION_V2;
    }
  }
  return GRAMMAR_VERSION;
}

function spanAt(lineIndex: number, line: string): SourceSpan {
  const trimmed = line.trimStart();
  const column = line.indexOf(trimmed) + 1;
  return {
    line: lineIndex + 1,
    column: Math.max(column, 1),
    end_line: lineIndex + 1,
    end_column: line.length,
  };
}

function contractValueFromLine(line: string): string {
  const match = line.match(
    /^\s*(?:INPUT|OUTPUT|DATA|CONTROL|PRE|POST|EFFECTS|FAILURE_MODES|DATA_TRANSITION|TERMINATION)\s*:\s*(.*)$/i,
  );
  return match?.[1]?.trim() ?? "";
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Split contract value into binding, mutability tag, and refinement predicate (where clause).
 */
export function extractV2ContractBinding(value: string): V2ContractBinding {
  let text = value.trim();
  if (!text) return { prose: true };

  let refinement: string | undefined;
  const whereMatch = text.match(WHERE_SPLIT_RE);
  if (whereMatch && whereMatch.index !== undefined) {
    refinement = text.slice(whereMatch.index + whereMatch[0].length).trim();
    text = text.slice(0, whereMatch.index).trim();
  }

  const mutMatch = text.match(MUTABILITY_BINDING_RE);
  if (mutMatch) {
    const typeTag = parseTypeTag(mutMatch[3]);
    return {
      name: mutMatch[1],
      mutability: mutMatch[2].toLowerCase() as MutabilityTag,
      type_tag: typeTag ?? undefined,
      refinement,
      prose: !typeTag && !refinement,
    };
  }

  const binding = extractContractBinding(text);
  return {
    ...binding,
    refinement,
    prose: binding.prose && !refinement,
  };
}

function isRefinementOnlyContractValue(field: string, value: string): boolean {
  if (field !== "PRE" && field !== "POST") return false;
  const trimmed = value.trim();
  if (!trimmed || /^(true|false)$/i.test(trimmed)) return false;
  return REFINEMENT_ONLY_VALUE_RE.test(trimmed);
}

function parseSummaryEntry(line: string, lineIndex: number): SummaryEntry | null {
  const bullet = line.match(BULLET_ENTRY_RE);
  if (!bullet) return null;
  const entryMatch = bullet[1].match(SUMMARY_ENTRY_RE);
  if (!entryMatch) {
    return { key: "rule", value: bullet[1].trim(), span: spanAt(lineIndex, line) };
  }
  return {
    key: entryMatch[1].trim(),
    value: entryMatch[2].trim(),
    span: spanAt(lineIndex, line),
  };
}

function isV2ContractLine(line: string): boolean {
  return (
    /^\s*Contract\s*:/i.test(line) ||
    CONTRACT_FIELD_PATTERN.test(line) ||
    SUMMARY_HEADING_RE.test(line) ||
    ALIAS_POLICY_HEADING_RE.test(line) ||
    BULLET_ENTRY_RE.test(line)
  );
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Parse v2 contract rows with refinements, SUMMARY blocks, and ALIAS POLICY without mutating shared regex (D13).
 */
export function parseV2ContractSection(
  lines: string[],
  startLineIndex: number,
  endLineIndex: number,
): V2ContractParseResult {
  const fields: string[] = [];
  const entries: ContractFieldEntry[] = [];
  const values: Record<string, string> = {};
  const type_tags: Record<string, NonNullable<ContractFields["type_tags"]>[string]> = {};
  const summaries: ProcedureSummary[] = [];
  const aliasEntries: AliasPolicyEntry[] = [];
  let firstLine = -1;
  let aliasPolicySpan: SourceSpan | undefined;

  let currentSummary: ProcedureSummary | null = null;
  let inAliasPolicy = false;

  for (let i = startLineIndex; i < endLineIndex; i += 1) {
    const line = lines[i];
    if (/^\s*#/.test(line) || !line.trim()) continue;

    const summaryHeading = line.match(SUMMARY_HEADING_RE);
    if (summaryHeading) {
      inAliasPolicy = false;
      currentSummary = {
        kind: summaryHeading[1].toLowerCase() as SummaryKind,
        entries: [],
        span: spanAt(i, line),
      };
      summaries.push(currentSummary);
      continue;
    }

    if (ALIAS_POLICY_HEADING_RE.test(line)) {
      currentSummary = null;
      inAliasPolicy = true;
      aliasPolicySpan = spanAt(i, line);
      continue;
    }

    if (currentSummary) {
      const entry = parseSummaryEntry(line, i);
      if (entry) {
        currentSummary.entries.push(entry);
      }
      continue;
    }

    if (inAliasPolicy) {
      const bullet = line.match(BULLET_ENTRY_RE);
      if (bullet) {
        aliasEntries.push({ rule: bullet[1].trim(), span: spanAt(i, line) });
      }
      continue;
    }

    const match = line.match(CONTRACT_FIELD_PATTERN);
    if (!match) continue;

    const field = match[1];
    const value = contractValueFromLine(line);
    const binding = extractV2ContractBinding(value);
    const refinement =
      binding.refinement ??
      (isRefinementOnlyContractValue(field, value) ? value.trim() : undefined);
    if (firstLine < 0) firstLine = i;

    if (!fields.includes(field)) fields.push(field);
    entries.push({
      field,
      value,
      type_tag: binding.type_tag ?? undefined,
      refinement,
      mutability: binding.mutability,
    });
    values[field] = value;
    if (binding.name && binding.type_tag) {
      type_tags[binding.name] = binding.type_tag;
    } else if (binding.type_tag && !binding.name) {
      type_tags[field.toLowerCase()] = binding.type_tag;
    }
  }

  const contract: ContractFields = {
    fields,
    entries,
    values,
    type_tags,
    span: firstLine >= 0 ? spanAt(firstLine, lines[firstLine]) : undefined,
  };

  const alias_policy: AliasPolicy | undefined =
    aliasEntries.length > 0 ? { entries: aliasEntries, span: aliasPolicySpan } : undefined;

  return { contract, summaries, alias_policy };
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Find contract section end including v2 SUMMARY and ALIAS POLICY blocks.
 */
export function findV2ContractEnd(bodyLines: string[], contractStart: number): number {
  let endIdx = contractStart + 1;
  for (let li = contractStart + 1; li < bodyLines.length; li += 1) {
    const line = bodyLines[li];
    if (PROCEDURE_HEADING_PATTERN.test(line)) {
      endIdx = li;
      break;
    }
    if (isV2ContractLine(line) || /^\s*#/.test(line)) {
      endIdx = li + 1;
      continue;
    }
    if (!line.trim()) {
      endIdx = li + 1;
      continue;
    }
    endIdx = li;
    break;
  }
  return endIdx;
}
