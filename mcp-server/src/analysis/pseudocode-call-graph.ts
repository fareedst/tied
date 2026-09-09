/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Pseudo-code call graph (distinct from TIED dependency graph).
 */
import type { AnalysisDiagnostic, IrProgram, PseudocodeAnalysisBudgets } from "./pseudocode-ir.js";

export type CallGraphEdge = {
  caller: string;
  callee: string;
  kind: "call" | "run";
  line: number;
};

export type CallGraphSection = {
  edges: CallGraphEdge[];
  unresolved: string[];
  truncated: boolean;
};

const BUILTIN_CALLS = new Set([
  "NORMALIZE",
  "NORMALIZE_COMMAND_RESULTS",
  "NORMALIZE_QUALITY_ROWS",
  "SORT",
]);

function diagnosticSort(a: AnalysisDiagnostic, b: AnalysisDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code);
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Collect local CALL edges and RUN edges with unresolved target reporting.
 */
export function buildCallGraph(
  program: IrProgram,
  budgets: PseudocodeAnalysisBudgets,
): { section: CallGraphSection; diagnostics: AnalysisDiagnostic[] } {
  const diagnostics: AnalysisDiagnostic[] = [];
  const edges: CallGraphEdge[] = [];
  const unresolved: string[] = [];
  const defined = new Set(program.procedures.map((p) => p.name));
  let truncated = false;

  for (const proc of program.procedures) {
    for (const stmt of proc.statements) {
      if (edges.length >= budgets.max_call_graph_edges) {
        truncated = true;
        diagnostics.push({
          severity: "warning",
          code: "TRUNCATED_CALL_GRAPH",
          message: "Call graph truncated at max_call_graph_edges",
          line: stmt.span.line,
          block: proc.name,
        });
        break;
      }
      if (stmt.kind === "call") {
        edges.push({
          caller: proc.name,
          callee: stmt.callee,
          kind: "call",
          line: stmt.span.line,
        });
        if (!defined.has(stmt.callee) && !BUILTIN_CALLS.has(stmt.callee)) {
          const key = `${proc.name}->${stmt.callee}`;
          if (!unresolved.includes(key)) unresolved.push(key);
          diagnostics.push({
            severity: "error",
            code: "UNRESOLVED_CALL",
            message: `Unresolved CALL target ${stmt.callee}`,
            line: stmt.span.line,
            block: proc.name,
            span: stmt.span,
          });
        }
      }
      if (stmt.kind === "run") {
        edges.push({
          caller: proc.name,
          callee: stmt.target,
          kind: "run",
          line: stmt.span.line,
        });
        diagnostics.push({
          severity: "info",
          code: "UNRESOLVED_RUN",
          message: `RUN target ${stmt.target} treated as external (not resolved locally)`,
          line: stmt.span.line,
          block: proc.name,
          span: stmt.span,
        });
      }
    }
    if (truncated) break;
  }

  edges.sort((a, b) => a.caller.localeCompare(b.caller) || a.line - b.line || a.callee.localeCompare(b.callee));
  unresolved.sort((a, b) => a.localeCompare(b));

  return {
    section: { edges, unresolved, truncated },
    diagnostics: diagnostics.sort(diagnosticSort),
  };
}
