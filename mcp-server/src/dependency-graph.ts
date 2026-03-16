/**
 * Dependency graph for requirements (and optionally IMPL) from TIED indexes.
 * Supports cycle detection, topological order, and backlog views.
 * [PROC-TIED_DEPENDENCY_GRAPH]
 */

import { loadIndex } from "./yaml-loader.js";

export type GraphKind = "requirements" | "implementation";

function getRequirementDependsOn(token: string): string[] {
  const data = loadIndex("requirements");
  if (!data) return [];
  const record = data[token] as Record<string, unknown> | undefined;
  if (!record || typeof record !== "object") return [];
  const related = record.related_requirements as Record<string, unknown> | undefined;
  if (!related) return [];
  const deps = related.depends_on;
  if (!Array.isArray(deps)) return [];
  return deps.filter((t): t is string => typeof t === "string" && t.startsWith("REQ-"));
}

function getImplDependsOn(token: string): string[] {
  const data = loadIndex("implementation");
  if (!data) return [];
  const record = data[token] as Record<string, unknown> | undefined;
  if (!record || typeof record !== "object") return [];
  const related = record.related_decisions as Record<string, unknown> | undefined;
  if (!related) return [];
  const deps = related.depends_on;
  if (!Array.isArray(deps)) return [];
  return deps.filter((t): t is string => typeof t === "string" && (t.startsWith("IMPL-") || t.startsWith("REQ-")));
}

/**
 * Build adjacency list: for each token, list of tokens it depends on (outgoing edges).
 * So edge A -> B means "A depends_on B".
 */
export function buildRequirementGraph(): Map<string, string[]> {
  const data = loadIndex("requirements");
  const graph = new Map<string, string[]>();
  if (!data) return graph;
  for (const token of Object.keys(data)) {
    if (token.startsWith("#") || !token.startsWith("REQ-")) continue;
    const record = data[token];
    if (typeof record !== "object" || record === null) continue;
    const deps = getRequirementDependsOn(token);
    graph.set(token, deps);
  }
  return graph;
}

/**
 * Build adjacency list for implementation index (depends_on).
 */
export function buildImplementationGraph(): Map<string, string[]> {
  const data = loadIndex("implementation");
  const graph = new Map<string, string[]>();
  if (!data) return graph;
  for (const token of Object.keys(data)) {
    if (token.startsWith("#") || !token.startsWith("IMPL-")) continue;
    const record = data[token];
    if (typeof record !== "object" || record === null) continue;
    const deps = getImplDependsOn(token);
    graph.set(token, deps);
  }
  return graph;
}

/**
 * Detect cycles in a directed graph. Returns list of cycles (each cycle is an array of tokens).
 * Uses DFS with recursion stack.
 */
export function findCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();
  const cycleSet = new Set<string>();

  function visit(node: string): boolean {
    if (cycleSet.has(node)) return false;
    if (stack.has(node)) {
      const start = pathIndex.get(node) ?? 0;
      cycles.push(path.slice(start, path.length).concat(node));
      for (const t of cycles[cycles.length - 1]) cycleSet.add(t);
      return true;
    }
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    const idx = path.length;
    path.push(node);
    pathIndex.set(node, idx);

    const deps = graph.get(node) ?? [];
    for (const d of deps) {
      if (graph.has(d)) visit(d);
    }

    path.pop();
    pathIndex.delete(node);
    stack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) visit(node);
  }
  return cycles;
}

/**
 * Topological sort (roots first). Returns empty array if graph has cycles.
 */
export function topologicalSort(graph: Map<string, string[]>): string[] {
  const cycles = findCycles(graph);
  if (cycles.length > 0) return [];

  const rev = new Map<string, string[]>();
  for (const node of graph.keys()) {
    rev.set(node, []);
  }
  for (const [node, deps] of graph) {
    for (const d of deps) {
      if (graph.has(d)) {
        rev.get(d)!.push(node);
      }
    }
  }
  const inDegree = new Map<string, number>();
  for (const node of graph.keys()) {
    inDegree.set(node, (graph.get(node) ?? []).length);
  }
  const queue: string[] = [];
  for (const node of graph.keys()) {
    if (inDegree.get(node) === 0) queue.push(node);
  }
  const order: string[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    order.push(n);
    for (const m of rev.get(n) ?? []) {
      const d = inDegree.get(m)! - 1;
      inDegree.set(m, d);
      if (d === 0) queue.push(m);
    }
  }
  return order.length === graph.size ? order : [];
}

/**
 * Backlog view: quick-wins (roots), blockers (have unmet deps), or critical (topological order filtered by priority).
 */
export function getBacklogView(
  graph: Map<string, string[]>,
  kind: "quick-wins" | "blockers" | "critical",
  options?: { statusByToken?: Record<string, string>; priorityByToken?: Record<string, string> }
): string[] {
  const statusByToken = options?.statusByToken ?? {};
  const priorityByToken = options?.priorityByToken ?? {};
  const implemented = (t: string) => (statusByToken[t] ?? "").toLowerCase() === "implemented" || (statusByToken[t] ?? "").toLowerCase() === "active";

  if (kind === "quick-wins") {
    return [...graph.keys()].filter((node) => (graph.get(node) ?? []).length === 0);
  }

  if (kind === "blockers") {
    return [...graph.keys()].filter((node) => {
      const deps = graph.get(node) ?? [];
      return deps.some((d) => graph.has(d) && !implemented(d));
    });
  }

  if (kind === "critical") {
    const order = topologicalSort(graph);
    const highPriority = order.filter((t) => /^P[01]$/.test(priorityByToken[t] ?? ""));
    return highPriority.length > 0 ? highPriority : order;
  }

  return [];
}

export function getRequirementStatusAndPriority(): { statusByToken: Record<string, string>; priorityByToken: Record<string, string> } {
  const data = loadIndex("requirements");
  const statusByToken: Record<string, string> = {};
  const priorityByToken: Record<string, string> = {};
  if (!data) return { statusByToken, priorityByToken };
  for (const [token, record] of Object.entries(data)) {
    if (token.startsWith("#") || typeof record !== "object" || record === null) continue;
    const r = record as Record<string, unknown>;
    statusByToken[token] = (r.status as string) ?? "";
    priorityByToken[token] = (r.priority as string) ?? "";
  }
  return { statusByToken, priorityByToken };
}
