/**
 * TIED consistency validator: indexes, detail files, token references, REQ→ARCH→IMPL traceability, IMPL pseudo-code.
 * Used by tied_validate_consistency MCP tool.
 */

import path from "node:path";
import fs from "node:fs";
import {
  loadIndex,
  listTokens,
  validateIndex,
  getBasePath,
  type IndexName,
} from "./yaml-loader.js";
import { loadDetail, getDetailPath, listDetailTokens, DETAIL_FORMAT } from "./detail-loader.js";

const INDEX_NAMES: IndexName[] = [
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
];

const TIED_INDEX_NAMES: IndexName[] = [
  "requirements",
  "architecture",
  "implementation",
];

function indexForToken(token: string): IndexName | null {
  if (token.startsWith("REQ-")) return "requirements";
  if (token.startsWith("ARCH-")) return "architecture";
  if (token.startsWith("IMPL-")) return "implementation";
  return null;
}

/** Collect all token strings from an array field. */
function tokensFromArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((t): t is string => typeof t === "string");
}

/** Collect REQ/ARCH/IMPL token references from a record (index or detail). */
export function collectTokenRefsFromRecord(
  record: Record<string, unknown>,
  kind: "REQ" | "ARCH" | "IMPL"
): { req: string[]; arch: string[]; impl: string[] } {
  const req: string[] = [];
  const arch: string[] = [];
  const impl: string[] = [];

  const cross = record.cross_references;
  if (Array.isArray(cross)) {
    for (const t of cross) {
      if (typeof t !== "string") continue;
      if (t.startsWith("REQ-")) req.push(t);
      else if (t.startsWith("ARCH-")) arch.push(t);
      else if (t.startsWith("IMPL-")) impl.push(t);
    }
  }

  const trace = record.traceability as Record<string, unknown> | undefined;
  if (trace) {
    for (const t of tokensFromArray(trace.requirements)) if (t.startsWith("REQ-")) req.push(t);
    for (const t of tokensFromArray(trace.architecture)) if (t.startsWith("ARCH-")) arch.push(t);
    for (const t of tokensFromArray(trace.implementation)) if (t.startsWith("IMPL-")) impl.push(t);
  }

  const related = record.related_decisions as Record<string, unknown> | undefined;
  if (related) {
    for (const t of tokensFromArray(related.depends_on)) {
      if (t.startsWith("REQ-")) req.push(t);
      else if (t.startsWith("ARCH-")) arch.push(t);
      else if (t.startsWith("IMPL-")) impl.push(t);
    }
    for (const t of tokensFromArray(related.informs)) if (t.startsWith("ARCH-")) arch.push(t);
    for (const t of tokensFromArray(related.see_also)) {
      if (t.startsWith("REQ-")) req.push(t);
      else if (t.startsWith("ARCH-")) arch.push(t);
      else if (t.startsWith("IMPL-")) impl.push(t);
    }
    for (const t of tokensFromArray(related.supersedes)) {
      if (t.startsWith("REQ-")) req.push(t);
      else if (t.startsWith("ARCH-")) arch.push(t);
      else if (t.startsWith("IMPL-")) impl.push(t);
    }
    for (const t of tokensFromArray(related.composed_with)) if (t.startsWith("IMPL-")) impl.push(t);
  }

  const relatedReq = record.related_requirements as Record<string, unknown> | undefined;
  if (relatedReq) {
    for (const t of tokensFromArray(relatedReq.depends_on)) if (t.startsWith("REQ-")) req.push(t);
    for (const t of tokensFromArray(relatedReq.related_to)) if (t.startsWith("REQ-")) req.push(t);
    for (const t of tokensFromArray(relatedReq.supersedes)) if (t.startsWith("REQ-")) req.push(t);
  }

  return { req, arch, impl };
}

/** Extract [REQ-*], [ARCH-*], [IMPL-*] from text (e.g. essence_pseudocode, details). */
export function extractTokensFromText(text: string): { req: string[]; arch: string[]; impl: string[] } {
  const req: string[] = [];
  const arch: string[] = [];
  const impl: string[] = [];
  const reReq = /\[(REQ-[A-Z0-9_]+)\]/g;
  const reArch = /\[(ARCH-[A-Z0-9_]+)\]/g;
  const reImpl = /\[(IMPL-[A-Z0-9_]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = reReq.exec(text)) !== null) req.push(m[1]);
  while ((m = reArch.exec(text)) !== null) arch.push(m[1]);
  while ((m = reImpl.exec(text)) !== null) impl.push(m[1]);
  return { req, arch, impl };
}

export interface TokenReferenceIssue {
  kind: "missing_reference" | "orphan_detail";
  token: string;
  referenced_by?: string;
  referenced_token?: string;
  index?: string;
}

export interface TraceabilityIssue {
  kind: "missing_req" | "missing_arch" | "missing_impl";
  token: string;
  referenced_by: string;
  referenced_token: string;
  index: string;
}

export interface DetailFileResult {
  token: string;
  has_file: boolean;
  format?: "yaml" | "markdown";
  top_level_key_ok?: boolean;
  ref_issues: TokenReferenceIssue[];
  error?: string;
}

export interface PseudocodeResult {
  token: string;
  has_essence_pseudocode: boolean;
  essence_pseudocode_empty?: boolean;
  tokens_in_text: { req: string[]; arch: string[]; impl: string[] };
  ref_issues: TokenReferenceIssue[];
}

export interface ConsistencyReport {
  index: Record<string, { valid: boolean; error?: string }>;
  index_tokens: Record<string, { tokens: string[]; with_detail_file: string[]; detail_file_exists: string[] }>;
  token_references: TokenReferenceIssue[];
  traceability: TraceabilityIssue[];
  detail_files: Record<string, DetailFileResult>;
  pseudocode: Record<string, PseudocodeResult>;
  ok: boolean;
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export interface ValidateConsistencyOptions {
  include_detail_files?: boolean;
  include_pseudocode?: boolean;
  require_detail_record?: boolean;
}

const DEFAULT_OPTIONS: Required<ValidateConsistencyOptions> = {
  include_detail_files: true,
  include_pseudocode: true,
  require_detail_record: true,
};

export function validateConsistency(options: ValidateConsistencyOptions = {}): ConsistencyReport {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const report: ConsistencyReport = {
    index: {},
    index_tokens: {},
    token_references: [],
    traceability: [],
    detail_files: {},
    pseudocode: {},
    ok: true,
  };

  // --- Index YAML syntax ---
  for (const name of INDEX_NAMES) {
    report.index[name] = validateIndex(name);
    if (!report.index[name].valid) report.ok = false;
  }

  const reqIndex = loadIndex("requirements");
  const archIndex = loadIndex("architecture");
  const implIndex = loadIndex("implementation");
  const semanticIndex = loadIndex("semantic-tokens");

  function tokenExistsInIndex(token: string): boolean {
    const idx = indexForToken(token);
    if (!idx || idx === "semantic-tokens") return false;
    const data = idx === "requirements" ? reqIndex : idx === "architecture" ? archIndex : implIndex;
    return !!data?.[token];
  }

  // --- Index tokens and detail_file presence ---
  for (const indexName of TIED_INDEX_NAMES) {
    const data = loadIndex(indexName);
    const tokens = data ? listTokens(indexName) : [];
    const withDetailFile: string[] = [];
    const detailFileExists: string[] = [];
    for (const token of tokens) {
      const rec = data?.[token] as Record<string, unknown> | undefined;
      if (rec?.detail_file) {
        withDetailFile.push(token);
        const basePath = getBasePath();
        const detailPath = path.join(basePath, String(rec.detail_file));
        if (fs.existsSync(detailPath)) detailFileExists.push(token);
      }
    }
    report.index_tokens[indexName] = { tokens, with_detail_file: withDetailFile, detail_file_exists: detailFileExists };
  }

  // semantic-tokens index tokens list
  const semTokens = semanticIndex ? listTokens("semantic-tokens") : [];
  report.index_tokens["semantic-tokens"] = {
    tokens: semTokens,
    with_detail_file: [],
    detail_file_exists: [],
  };

  // --- Token reference and traceability issues (from indexes) ---
  const refIssues = new Map<string, TokenReferenceIssue>();
  const traceIssues: TraceabilityIssue[] = [];

  function addRefIssue(issue: TokenReferenceIssue) {
    const key = `${issue.kind}:${issue.token}:${issue.referenced_by ?? ""}:${issue.referenced_token ?? ""}`;
    if (!refIssues.has(key)) {
      refIssues.set(key, issue);
      report.ok = false;
    }
  }

  function addTraceIssue(issue: TraceabilityIssue) {
    traceIssues.push(issue);
    report.ok = false;
  }

  function checkRefs(
    ownerToken: string,
    ownerIndex: IndexName,
    refs: { req: string[]; arch: string[]; impl: string[] }
  ) {
    for (const t of dedupe(refs.req)) {
      if (!tokenExistsInIndex(t)) {
        addRefIssue({
          kind: "missing_reference",
          token: t,
          referenced_by: ownerToken,
          index: "requirements",
        });
        addTraceIssue({
          kind: "missing_req",
          token: t,
          referenced_by: ownerToken,
          referenced_token: t,
          index: "requirements",
        });
      }
    }
    for (const t of dedupe(refs.arch)) {
      if (!tokenExistsInIndex(t)) {
        addRefIssue({
          kind: "missing_reference",
          token: t,
          referenced_by: ownerToken,
          index: "architecture",
        });
        addTraceIssue({
          kind: "missing_arch",
          token: t,
          referenced_by: ownerToken,
          referenced_token: t,
          index: "architecture",
        });
      }
    }
    for (const t of dedupe(refs.impl)) {
      if (!tokenExistsInIndex(t)) {
        addRefIssue({
          kind: "missing_reference",
          token: t,
          referenced_by: ownerToken,
          index: "implementation",
        });
        addTraceIssue({
          kind: "missing_impl",
          token: t,
          referenced_by: ownerToken,
          referenced_token: t,
          index: "implementation",
        });
      }
    }
  }

  // Requirements: traceability.architecture, traceability.implementation
  if (reqIndex) {
    for (const [token, rec] of Object.entries(reqIndex)) {
      if (typeof rec !== "object" || rec === null) continue;
      const r = rec as Record<string, unknown>;
      const refs = collectTokenRefsFromRecord(r, "REQ");
      checkRefs(token, "requirements", refs);
    }
  }

  // Architecture: cross_references (REQ), traceability, related_decisions
  if (archIndex) {
    for (const [token, rec] of Object.entries(archIndex)) {
      if (typeof rec !== "object" || rec === null) continue;
      const r = rec as Record<string, unknown>;
      const refs = collectTokenRefsFromRecord(r, "ARCH");
      checkRefs(token, "architecture", refs);
    }
  }

  // Implementation: cross_references (REQ, ARCH), traceability, related_decisions
  if (implIndex) {
    for (const [token, rec] of Object.entries(implIndex)) {
      if (typeof rec !== "object" || rec === null) continue;
      const r = rec as Record<string, unknown>;
      const refs = collectTokenRefsFromRecord(r, "IMPL");
      checkRefs(token, "implementation", refs);
    }
  }

  // Semantic-tokens: REQ/ARCH/IMPL tokens should exist in corresponding index
  if (semanticIndex) {
    for (const token of semTokens) {
      const rec = semanticIndex[token] as Record<string, unknown> | undefined;
      const type = rec?.type as string | undefined;
      if (type === "REQ" || type === "ARCH" || type === "IMPL") {
        if (!tokenExistsInIndex(token)) {
          addRefIssue({
            kind: "orphan_detail",
            token,
            index: type === "REQ" ? "requirements" : type === "ARCH" ? "architecture" : "implementation",
          });
        }
      }
    }
  }

  report.token_references = [...refIssues.values()];
  report.traceability = traceIssues;

  // --- Detail files ---
  if (opts.include_detail_files) {
    for (const type of ["requirement", "architecture", "implementation"] as const) {
      const tokens = listDetailTokens(type);
      for (const token of tokens) {
        const detail = loadDetail(token);
        const pathResult = getDetailPath(token);
        const hasFile = !!pathResult && fs.existsSync(pathResult);
        const result: DetailFileResult = {
          token,
          has_file: hasFile,
          ref_issues: [],
        };
        if (detail) {
          if (detail[DETAIL_FORMAT] === "markdown") {
            result.format = "markdown";
            // Skip ref validation for markdown
          } else {
            result.format = "yaml";
            result.top_level_key_ok = true; // loadDetail already enforces token as top key
            const refs = collectTokenRefsFromRecord(
              detail,
              type === "requirement" ? "REQ" : type === "architecture" ? "ARCH" : "IMPL"
            );
            for (const t of dedupe([...refs.req, ...refs.arch, ...refs.impl])) {
              if (!tokenExistsInIndex(t)) {
                result.ref_issues.push({
                  kind: "missing_reference",
                  token: t,
                  referenced_by: token,
                  referenced_token: t,
                  index: indexForToken(t) ?? undefined,
                });
                report.ok = false;
              }
            }
          }
        } else if (hasFile) {
          result.error = "Failed to parse detail file";
          report.ok = false;
        } else {
          result.error = "Detail file not found";
          if (opts.require_detail_record) report.ok = false;
        }
        report.detail_files[token] = result;
      }
    }
  }

  // --- IMPL pseudo-code ---
  if (opts.include_pseudocode && implIndex) {
    const implTokens = listTokens("implementation");
    for (const token of implTokens) {
      const detail = loadDetail(token);
      const pseudocodeResult: PseudocodeResult = {
        token,
        has_essence_pseudocode: false,
        tokens_in_text: { req: [], arch: [], impl: [] },
        ref_issues: [],
      };
      if (detail && detail[DETAIL_FORMAT] !== "markdown") {
        const ep = detail.essence_pseudocode;
        pseudocodeResult.has_essence_pseudocode = typeof ep === "string";
        pseudocodeResult.essence_pseudocode_empty =
          typeof ep === "string" ? !ep.trim() : undefined;
        let text = typeof ep === "string" ? ep : "";
        const approach = detail.implementation_approach as Record<string, unknown> | undefined;
        if (approach?.details && Array.isArray(approach.details)) {
          text += "\n" + approach.details.map((d) => (typeof d === "string" ? d : "")).join("\n");
        }
        const codeExamples = detail.code_examples as Array<{ body?: string }> | undefined;
        if (Array.isArray(codeExamples)) {
          for (const ex of codeExamples) {
            if (typeof ex?.body === "string") text += "\n" + ex.body;
          }
        }
        pseudocodeResult.tokens_in_text = extractTokensFromText(text);
        for (const t of dedupe([
          ...pseudocodeResult.tokens_in_text.req,
          ...pseudocodeResult.tokens_in_text.arch,
          ...pseudocodeResult.tokens_in_text.impl,
        ])) {
          if (!tokenExistsInIndex(t)) {
            pseudocodeResult.ref_issues.push({
              kind: "missing_reference",
              token: t,
              referenced_by: token,
              referenced_token: t,
              index: indexForToken(t) ?? undefined,
            });
            report.ok = false;
          }
        }
        if (
          opts.require_detail_record &&
          report.detail_files[token]?.has_file &&
          !pseudocodeResult.has_essence_pseudocode
        ) {
          // Warn: IMPL with detail file but no essence_pseudocode (optional warning, we don't set report.ok = false for this by default to allow gradual adoption)
        }
      }
      report.pseudocode[token] = pseudocodeResult;
    }
  }

  return report;
}
