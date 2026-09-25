/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: Four-way closure join — REQ criterion ↔ IMPL block ↔ test anchor ↔ code block-lead (W3a).
 */

import fs from "node:fs";
import path from "node:path";

import fg from "fast-glob";

import { loadDetail } from "../detail-loader.js";
import {
  isBlockLeadCommentLine,
  PROCEDURE_HEADING_PATTERN,
  scanProcedureBlocks,
} from "./pseudocode-shared.js";

export type ClosureJoinDiagnostic = {
  severity: "error" | "warning";
  code:
    | "UNMAPPED_CRITERION"
    | "BLOCK_MISSING_CRITERION"
    | "BLOCK_MISSING_TEST"
    | "BLOCK_MISSING_CODE"
    | "ORPHAN_BLOCK";
  message: string;
  block?: string;
  criterion_id?: string;
};

export type ClosureJoinBlockRow = {
  name: string;
  line: number;
  impl_token: string;
  criterion_ids: string[];
  test_files: string[];
  code_files: string[];
  block_lead: string;
  ok: boolean;
};

export type ClosureJoinCriterionRow = {
  id: string;
  block_names: string[];
  ok: boolean;
};

export type ClosureJoinReport = {
  schema_version: "closure-join-report.v1";
  ok: boolean;
  gate_mode_applied?: true;
  req_token: string;
  impl_tokens: string[];
  criteria: ClosureJoinCriterionRow[];
  blocks: ClosureJoinBlockRow[];
  orphans: string[];
  diagnostics: ClosureJoinDiagnostic[];
  report_path?: string;
};

export type ClosureJoinBuildInput = {
  req_token: string;
  impl_tokens?: string[];
  satisfaction_criteria_ids?: string[];
  impl_pseudocode?: Array<{ token: string; pseudocode: string }>;
  project_root: string;
  test_globs?: string[];
  code_globs?: string[];
  gate_mode?: boolean;
  persist?: boolean;
};

type RawBlock = {
  name: string;
  line: number;
  impl_token: string;
  start: number;
  end: number;
  tokenScanStart: number;
  tokenScanEnd: number;
};

const ACTIVE_PROCEDURE_PATTERN = /^\s*ACTIVE\s+PROCEDURE\s+([A-Z][A-Z0-9_]*)\b/;
const END_ACTIVE_PATTERN = /^\s*END\s+ACTIVE\s+PROCEDURE\b/i;
const H2_PATTERN = /^##\s+(.+)$/;

function slugifyHeading(title: string): string {
  const cleaned = title.trim().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ");
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length === 0) return "UNNAMED_BLOCK";
  return parts.map((p) => p.toUpperCase()).join("_");
}

/** Scan IMPL blocks: ACTIVE PROCEDURE, procedure/function/block headings, and ## sections. */
function scanClosureBlocks(lines: readonly string[], implToken: string): RawBlock[] {
  const starts: Array<{ name: string; start: number }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const active = line.match(ACTIVE_PROCEDURE_PATTERN);
    if (active) {
      starts.push({ name: active[1], start: index });
      continue;
    }
    const proc = line.match(PROCEDURE_HEADING_PATTERN);
    if (proc) {
      starts.push({ name: proc[2], start: index });
      continue;
    }
    const h2 = line.match(H2_PATTERN);
    if (h2) {
      starts.push({ name: slugifyHeading(h2[1]), start: index });
    }
  }

  const procedureRanges = scanProcedureBlocks(lines);
  const rangeByStart = new Map(procedureRanges.map((r) => [r.start, r]));

  return starts.map((entry, index) => {
    let end = starts[index + 1]?.start ?? lines.length;
    if (lines[entry.start]?.match(ACTIVE_PROCEDURE_PATTERN)) {
      for (let i = entry.start + 1; i < lines.length; i += 1) {
        if (END_ACTIVE_PATTERN.test(lines[i] ?? "")) {
          end = i + 1;
          break;
        }
      }
    }
    const procRange = rangeByStart.get(entry.start);
    let tokenScanStart = entry.start;
    let tokenScanEnd = end;
    if (procRange) {
      tokenScanStart = procRange.tokenScanStart;
      tokenScanEnd = procRange.tokenScanEnd;
    } else {
      for (let i = entry.start - 1; i >= 0; i -= 1) {
        if (!isBlockLeadCommentLine(lines[i] ?? "")) break;
        tokenScanStart = i;
      }
    }
    return {
      name: entry.name,
      line: entry.start + 1,
      impl_token: implToken,
      start: entry.start,
      end,
      tokenScanStart,
      tokenScanEnd,
    };
  });
}

const SLASH_BLOCK_LEAD_PATTERN = /^\s*\/\/\s*\[(?:REQ|ARCH|IMPL)-/;

function isSemanticBlockLeadLine(line: string): boolean {
  return isBlockLeadCommentLine(line) || SLASH_BLOCK_LEAD_PATTERN.test(line);
}

function extractBlockLead(lines: readonly string[], block: RawBlock): string {
  const parts: string[] = [];
  for (let i = block.tokenScanStart; i < block.tokenScanEnd; i += 1) {
    const line = lines[i] ?? "";
    if (isSemanticBlockLeadLine(line)) {
      parts.push(line.trim());
    }
  }
  if (parts.length > 0) return parts.join("\n");
  for (let i = block.start; i < block.end; i += 1) {
    const line = lines[i] ?? "";
    if (isSemanticBlockLeadLine(line)) {
      parts.push(line.trim());
    }
  }
  return parts.join("\n");
}

function blockBodyText(lines: readonly string[], block: RawBlock): string {
  return lines.slice(block.start, block.end).join("\n");
}

function criterionIdsInBody(body: string, criterionIds: readonly string[]): string[] {
  return criterionIds.filter((id) => body.includes(id));
}

function fileHasBlockLead(content: string, blockLead: string, blockName: string): boolean {
  if (blockLead.trim().length > 0) {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      if (isSemanticBlockLeadLine(line) && blockLeadsMatch(blockLead, line)) {
        return true;
      }
    }
    if (content.includes(normalizeBlockLeadForMatch(blockLead))) {
      return true;
    }
  }
  const describePattern = new RegExp(`\\bdescribe\\s*\\(\\s*['"\`]${blockName}\\b`, "i");
  const itPattern = new RegExp(`\\bit\\s*\\(\\s*['"\`][^'"\`]*${blockName}\\b`, "i");
  return describePattern.test(content) || itPattern.test(content);
}

function normalizeBlockLeadForMatch(lead: string): string {
  return lead.replace(/\s+/g, " ").trim();
}

function blockLeadsMatch(left: string, right: string): boolean {
  const a = normalizeBlockLeadForMatch(left);
  const b = normalizeBlockLeadForMatch(right);
  if (a.length === 0 || b.length === 0) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const tokenPattern = /\[(REQ|ARCH|IMPL)-[^\]]+\]/g;
  const tokensA = [...a.matchAll(tokenPattern)].map((m) => m[0]).sort().join("|");
  const tokensB = [...b.matchAll(tokenPattern)].map((m) => m[0]).sort().join("|");
  return tokensA.length > 0 && tokensA === tokensB;
}

function fileHasCodeBlockLead(content: string, blockLead: string, blockName: string): boolean {
  if (blockLead.trim().length > 0) {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      if (isSemanticBlockLeadLine(line) && blockLeadsMatch(blockLead, line)) {
        return true;
      }
    }
    if (content.includes(normalizeBlockLeadForMatch(blockLead))) {
      return true;
    }
  }
  const fnPattern = new RegExp(`\\bfunction\\s+${blockName}\\b`, "i");
  return fnPattern.test(content);
}

export function extractSatisfactionCriterionIds(reqDetail: Record<string, unknown>): string[] {
  const raw = reqDetail.satisfaction_criteria;
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  for (const entry of raw) {
    if (typeof entry === "object" && entry !== null && "id" in entry) {
      const id = (entry as { id: unknown }).id;
      if (typeof id === "string" && id.length > 0) ids.push(id);
    }
  }
  return ids.sort();
}

export function buildClosureJoinReport(input: ClosureJoinBuildInput): ClosureJoinReport {
  const gateMode = input.gate_mode === true;
  const diagnostics: ClosureJoinDiagnostic[] = [];
  const implSpecs =
    input.impl_pseudocode ??
    (input.impl_tokens ?? []).map((token) => {
      const detail = loadDetail(token);
      const pseudocode =
        typeof detail?.essence_pseudocode === "string" ? detail.essence_pseudocode : "";
      return { token, pseudocode };
    });

  const criterionIds =
    input.satisfaction_criteria_ids ??
    extractSatisfactionCriterionIds(loadDetail(input.req_token) ?? {});

  const implTokens = implSpecs.map((s) => s.token);
  const allBlocks: Array<RawBlock & { lines: readonly string[]; blockLead: string }> = [];

  for (const spec of implSpecs) {
    const lines = spec.pseudocode.split(/\r?\n/);
    for (const block of scanClosureBlocks(lines, spec.token)) {
      allBlocks.push({
        ...block,
        lines,
        blockLead: extractBlockLead(lines, block),
      });
    }
  }

  const blockRows: ClosureJoinBlockRow[] = [];
  const orphans: string[] = [];

  for (const block of allBlocks) {
    const body = blockBodyText(block.lines, block);
    const mappedCriteria = criterionIdsInBody(body, criterionIds);
    const testFiles: string[] = [];
    const codeFiles: string[] = [];

    blockRows.push({
      name: block.name,
      line: block.line,
      impl_token: block.impl_token,
      criterion_ids: mappedCriteria,
      test_files: testFiles,
      code_files: codeFiles,
      block_lead: block.blockLead,
      ok: true,
    });
  }

  const criterionRows: ClosureJoinCriterionRow[] = criterionIds.map((id) => ({
    id,
    block_names: blockRows.filter((b) => b.criterion_ids.includes(id)).map((b) => b.name),
    ok: true,
  }));

  for (const row of criterionRows) {
    if (row.block_names.length === 0) {
      row.ok = false;
      diagnostics.push({
        severity: gateMode ? "error" : "warning",
        code: "UNMAPPED_CRITERION",
        message: `Criterion ${row.id} has no IMPL block reference.`,
        criterion_id: row.id,
      });
    }
  }

  // File scan is sync in build path — collectFiles is async; use sync glob via fg.sync
  const testFiles = fg.sync(input.test_globs ?? [], {
    cwd: input.project_root,
    absolute: true,
    onlyFiles: true,
  }) as string[];
  const codeFiles = fg.sync(input.code_globs ?? [], {
    cwd: input.project_root,
    absolute: true,
    onlyFiles: true,
  }) as string[];

  const testContents = new Map<string, string>();
  for (const file of testFiles) {
    try {
      testContents.set(file, fs.readFileSync(file, "utf8"));
    } catch {
      // skip unreadable
    }
  }
  const codeContents = new Map<string, string>();
  for (const file of codeFiles) {
    try {
      codeContents.set(file, fs.readFileSync(file, "utf8"));
    } catch {
      // skip
    }
  }

  for (const row of blockRows) {
    for (const [file, content] of testContents) {
      if (fileHasBlockLead(content, row.block_lead, row.name)) {
        row.test_files.push(path.relative(input.project_root, file));
      }
    }
    for (const [file, content] of codeContents) {
      if (fileHasCodeBlockLead(content, row.block_lead, row.name)) {
        row.code_files.push(path.relative(input.project_root, file));
      }
    }

    let blockOk = true;
    if (row.criterion_ids.length === 0) {
      blockOk = false;
      diagnostics.push({
        severity: gateMode ? "error" : "warning",
        code: "BLOCK_MISSING_CRITERION",
        message: `Block ${row.name} does not reference any satisfaction criterion id.`,
        block: row.name,
      });
    }
    if (row.test_files.length === 0) {
      blockOk = false;
      diagnostics.push({
        severity: gateMode ? "error" : "warning",
        code: "BLOCK_MISSING_TEST",
        message: `Block ${row.name} has no test anchor (block-lead or describe/it).`,
        block: row.name,
      });
    }
    if (row.code_files.length === 0) {
      blockOk = false;
      diagnostics.push({
        severity: gateMode ? "error" : "warning",
        code: "BLOCK_MISSING_CODE",
        message: `Block ${row.name} has no production code block-lead copy.`,
        block: row.name,
      });
    }

    row.ok = blockOk;
    if (!blockOk) {
      orphans.push(row.name);
      diagnostics.push({
        severity: gateMode ? "error" : "warning",
        code: "ORPHAN_BLOCK",
        message: `Block ${row.name} failed four-way closure join.`,
        block: row.name,
      });
    }
  }

  const hasError = diagnostics.some((d) => d.severity === "error");
  const report: ClosureJoinReport = {
    schema_version: "closure-join-report.v1",
    ok: !hasError,
    ...(gateMode ? { gate_mode_applied: true as const } : {}),
    req_token: input.req_token,
    impl_tokens: implTokens,
    criteria: criterionRows,
    blocks: blockRows,
    orphans: [...new Set(orphans)].sort(),
    diagnostics,
  };

  if (input.persist) {
    const evidenceDir = path.join(input.project_root, "working", input.req_token, "evidence");
    fs.mkdirSync(evidenceDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(evidenceDir, `closure-join-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    report.report_path = reportPath;
  }

  return report;
}

/** Async wrapper when callers prefer await (MCP handler). */
export async function buildClosureJoinReportAsync(
  input: ClosureJoinBuildInput,
): Promise<ClosureJoinReport> {
  return buildClosureJoinReport(input);
}
