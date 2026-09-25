/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: W5a ontology-style rules on the TIED token graph (cycles, functional uniqueness, inverse depends_on, disjoint ledger).
 */

import fs from "node:fs";

import {
  loadIndex,
  listTokens,
  validateIndex,
  getBasePath,
  getMethodologyBasePath,
  isTokenInMethodology,
  type IndexName,
} from "./yaml-loader.js";
import { sessionIdsFromLedgerInput } from "./disjoint-verifier.js";
import { isUsableDetailFilePath, resolveDetailFileUnderBase } from "./detail-file-path.js";

export type OntologyIssueKind =
  | "dependency_cycle"
  | "duplicate_detail_file"
  | "inverse_depends_on_missing"
  | "disjoint_verifier_same_session"
  | "disjoint_verifier_missing_session_ids";

export interface OntologyIssue {
  kind: OntologyIssueKind;
  message: string;
  tokens?: string[];
  index?: string;
  detail_path?: string;
}

export interface RunOntologyRulesOptions {
  /** When set, enforce implementer ≠ verifier session ids. */
  adherence_ledger?: unknown;
  verifier_session_id?: string;
  /** When true, flag missing reverse related_requirements links for depends_on edges. */
  require_inverse_depends_on?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tokensFromArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((t): t is string => typeof t === "string");
}

function dependsOnForIndex(
  rec: Record<string, unknown>,
  prefix: "ARCH-" | "IMPL-",
): string[] {
  const out: string[] = [];
  const related = rec.related_decisions;
  if (isRecord(related)) {
    for (const t of tokensFromArray(related.depends_on)) {
      if (t.startsWith(prefix)) out.push(t);
    }
  }
  return out;
}

function reqDependsOn(rec: Record<string, unknown>): string[] {
  const relatedReq = rec.related_requirements;
  if (!isRecord(relatedReq)) return [];
  return tokensFromArray(relatedReq.depends_on).filter((t) => t.startsWith("REQ-"));
}

function reqRelatedTo(rec: Record<string, unknown>): string[] {
  const relatedReq = rec.related_requirements;
  if (!isRecord(relatedReq)) return [];
  return tokensFromArray(relatedReq.related_to).filter((t) => t.startsWith("REQ-"));
}

/** Tarjan SCC; returns components with size > 1 or self-loop. */
export function tarjanStronglyConnectedComponents(
  nodes: string[],
  edges: Map<string, string[]>,
): string[][] {
  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const indices = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const components: string[][] = [];

  function strongConnect(v: string): void {
    indices.set(v, index);
    lowlink.set(v, index);
    index += 1;
    stack.push(v);
    onStack.add(v);

    for (const w of edges.get(v) ?? []) {
      if (!indices.has(w)) {
        strongConnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, indices.get(w)!));
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      components.push(component);
    }
  }

  for (const node of nodes) {
    if (!indices.has(node)) strongConnect(node);
  }
  return components;
}

function collectCycleIssues(
  indexName: IndexName,
  prefix: "ARCH-" | "IMPL-",
  issues: OntologyIssue[],
): void {
  const data = loadIndex(indexName);
  if (!data) return;
  const nodes = listTokens(indexName).filter((t) => t.startsWith(prefix));
  const edges = new Map<string, string[]>();
  for (const token of nodes) {
    const rec = data[token];
    if (!isRecord(rec)) continue;
    const deps = dependsOnForIndex(rec, prefix);
    edges.set(token, deps);
    if (deps.includes(token)) {
      issues.push({
        kind: "dependency_cycle",
        index: indexName,
        tokens: [token],
        message: `Self-loop in ${indexName} related_decisions.depends_on: ${token}`,
      });
    }
  }
  for (const component of tarjanStronglyConnectedComponents(nodes, edges)) {
    if (component.length <= 1) continue;
    const hasCycleEdge = component.some((n) =>
      (edges.get(n) ?? []).some((d) => component.includes(d)),
    );
    if (!hasCycleEdge) continue;
    issues.push({
      kind: "dependency_cycle",
      index: indexName,
      tokens: [...component].sort(),
      message: `Cycle in ${indexName} related_decisions.depends_on: ${component.join(" → ")}`,
    });
  }
}

function collectDuplicateDetailIssues(issues: OntologyIssue[]): void {
  const pathToTokens = new Map<string, string[]>();
  const indexNames: IndexName[] = ["requirements", "architecture", "implementation"];
  for (const indexName of indexNames) {
    const data = loadIndex(indexName);
    if (!data) continue;
    for (const token of listTokens(indexName)) {
      const rec = data[token] as Record<string, unknown> | undefined;
      const detailFile = rec?.detail_file;
      if (!isUsableDetailFilePath(detailFile)) continue;
      const basePath =
        getMethodologyBasePath() && isTokenInMethodology(indexName, token)
          ? getMethodologyBasePath()!
          : getBasePath();
      const resolved = resolveDetailFileUnderBase(basePath, detailFile);
      if (!resolved) continue;
      let normalized = resolved;
      try {
        normalized = fs.realpathSync(resolved);
      } catch {
        normalized = resolved;
      }
      const key = normalized;
      const list = pathToTokens.get(key) ?? [];
      list.push(token);
      pathToTokens.set(key, list);
    }
  }
  for (const [detailPath, tokens] of pathToTokens) {
    if (tokens.length <= 1) continue;
    issues.push({
      kind: "duplicate_detail_file",
      detail_path: detailPath,
      tokens: [...tokens].sort(),
      message: `Multiple tokens share one detail file: ${tokens.join(", ")} → ${detailPath}`,
    });
  }
}

function collectInverseDependsOnIssues(issues: OntologyIssue[]): void {
  const reqIndex = loadIndex("requirements");
  if (!reqIndex) return;
  const reverseLinks = new Map<string, Set<string>>();
  for (const [token, rec] of Object.entries(reqIndex)) {
    if (!isRecord(rec)) continue;
    for (const target of reqDependsOn(rec)) {
      if (!reverseLinks.has(target)) reverseLinks.set(target, new Set());
      reverseLinks.get(target)!.add(token);
    }
    for (const target of reqRelatedTo(rec)) {
      if (!reverseLinks.has(target)) reverseLinks.set(target, new Set());
      reverseLinks.get(target)!.add(token);
    }
  }
  for (const [token, rec] of Object.entries(reqIndex)) {
    if (!isRecord(rec)) continue;
    for (const dep of reqDependsOn(rec)) {
      if (!reqIndex[dep]) continue;
      const reverse = reverseLinks.get(dep);
      if (!reverse?.has(token)) {
        issues.push({
          kind: "inverse_depends_on_missing",
          index: "requirements",
          tokens: [token, dep],
          message: `REQ ${token} depends_on ${dep} but ${dep} has no reverse depends_on/related_to to ${token}`,
        });
      }
    }
  }
}

function collectDisjointLedgerIssues(
  options: RunOntologyRulesOptions,
  issues: OntologyIssue[],
): void {
  if (options.adherence_ledger === undefined) return;
  const fromLedger = sessionIdsFromLedgerInput(options.adherence_ledger);
  const implementer = fromLedger.implementerSessionId;
  const verifier =
    options.verifier_session_id?.trim() ?? fromLedger.verifierSessionId;
  if (!implementer || !verifier) {
    issues.push({
      kind: "disjoint_verifier_missing_session_ids",
      message: "Adherence ledger present but implementer or verifier session id missing",
    });
    return;
  }
  if (implementer === verifier) {
    issues.push({
      kind: "disjoint_verifier_same_session",
      tokens: [implementer],
      message: "Implementer and verifier session ids must differ when ledger is supplied",
    });
  }
}

export function runOntologyRules(options: RunOntologyRulesOptions = {}): {
  issues: OntologyIssue[];
  ok: boolean;
} {
  const issues: OntologyIssue[] = [];
  collectCycleIssues("architecture", "ARCH-", issues);
  collectCycleIssues("implementation", "IMPL-", issues);
  collectDuplicateDetailIssues(issues);
  if (options.require_inverse_depends_on !== false) {
    collectInverseDependsOnIssues(issues);
  }
  collectDisjointLedgerIssues(options, issues);

  const fatalKinds = new Set<OntologyIssueKind>([
    "dependency_cycle",
    "duplicate_detail_file",
  ]);
  const ok = issues.every((issue) => !fatalKinds.has(issue.kind));
  return { issues, ok };
}
