/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Build per-procedure control-flow graphs from parsed IR.
 */
import type { AnalysisDiagnostic, IrProgram, PseudocodeAnalysisBudgets, SourceSpan } from "./pseudocode-ir.js";

export type CfgNode = {
  id: string;
  kind: "entry" | "statement" | "branch" | "merge" | "loop" | "exit";
  label: string;
  line: number;
  span?: SourceSpan;
};

export type CfgEdge = {
  from: string;
  to: string;
  kind: "sequential" | "true" | "false" | "loop_back" | "exceptional";
};

export type ProcedureCfg = {
  procedure: string;
  nodes: CfgNode[];
  edges: CfgEdge[];
  reachable: string[];
  truncated: boolean;
};

export type CfgSection = {
  procedures: ProcedureCfg[];
};

function diagnosticSort(a: AnalysisDiagnostic, b: AnalysisDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code);
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Construct entry/exit, branch merge, loop back-edges, and reachability per procedure.
 */
export function buildCfg(
  program: IrProgram,
  budgets: PseudocodeAnalysisBudgets,
): { section: CfgSection; diagnostics: AnalysisDiagnostic[] } {
  const diagnostics: AnalysisDiagnostic[] = [];
  const procedures: ProcedureCfg[] = [];

  for (const proc of program.procedures) {
    const nodes: CfgNode[] = [];
    const edges: CfgEdge[] = [];
    let truncated = false;

    const entryId = `${proc.name}::entry`;
    nodes.push({ id: entryId, kind: "entry", label: "entry", line: proc.span.line });
    let prev = entryId;
    let nodeIndex = 0;

    for (const stmt of proc.statements) {
      if (nodes.length >= budgets.max_cfg_blocks_per_procedure) {
        truncated = true;
        diagnostics.push({
          severity: "warning",
          code: "TRUNCATED_CFG",
          message: `CFG truncated for ${proc.name} at max_cfg_blocks_per_procedure`,
          line: stmt.span.line,
          block: proc.name,
        });
        break;
      }
      nodeIndex += 1;
      const nodeId = `${proc.name}::n${nodeIndex}`;
      const kind =
        stmt.kind === "if" || stmt.kind === "switch"
          ? "branch"
          : stmt.kind === "while" || stmt.kind === "for"
            ? "loop"
            : stmt.kind === "else"
              ? "merge"
              : stmt.kind === "error"
                ? "branch"
                : "statement";
      const label =
        stmt.kind === "if"
          ? `IF ${stmt.condition}`
          : stmt.kind === "while"
            ? `WHILE ${stmt.condition}`
            : stmt.kind === "call"
              ? `CALL ${stmt.callee}`
              : stmt.kind === "return"
                ? "RETURN"
                : stmt.kind;
      nodes.push({ id: nodeId, kind, label, line: stmt.span.line, span: stmt.span });
      edges.push({ from: prev, to: nodeId, kind: "sequential" });

      if (stmt.kind === "if") {
        const mergeId = `${proc.name}::merge${nodeIndex}`;
        nodes.push({ id: mergeId, kind: "merge", label: "merge", line: stmt.span.line });
        edges.push({ from: nodeId, to: mergeId, kind: "true" });
        edges.push({ from: nodeId, to: mergeId, kind: "false" });
        prev = mergeId;
      } else if (stmt.kind === "while" || stmt.kind === "for") {
        edges.push({ from: nodeId, to: nodeId, kind: "loop_back" });
        prev = nodeId;
      } else if (stmt.kind === "error") {
        const exitId = `${proc.name}::exit`;
        if (!nodes.some((n) => n.id === exitId)) {
          nodes.push({ id: exitId, kind: "exit", label: "exit", line: stmt.span.line });
        }
        edges.push({ from: nodeId, to: exitId, kind: "exceptional" });
        prev = exitId;
      } else {
        prev = nodeId;
      }
    }

    const exitId = `${proc.name}::exit`;
    if (!nodes.some((n) => n.id === exitId)) {
      nodes.push({ id: exitId, kind: "exit", label: "exit", line: proc.span.line });
    }
    if (prev !== exitId) {
      edges.push({ from: prev, to: exitId, kind: "sequential" });
    }

    const reachable = computeReachable(entryId, edges);
    procedures.push({
      procedure: proc.name,
      nodes: nodes.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id)),
      edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
      reachable: reachable.sort((a, b) => a.localeCompare(b)),
      truncated,
    });
  }

  return { section: { procedures }, diagnostics: diagnostics.sort(diagnosticSort) };
}

function computeReachable(entry: string, edges: CfgEdge[]): string[] {
  const reachable = new Set<string>([entry]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) {
      if (reachable.has(edge.from) && !reachable.has(edge.to)) {
        reachable.add(edge.to);
        changed = true;
      }
    }
  }
  return [...reachable];
}
