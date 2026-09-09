/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Obligation extraction and traceability projections from analysis results.
 */
import type { AnalysisDiagnostic, IrProgram } from "./pseudocode-ir.js";
import type { AbstractSection } from "./pseudocode-abstract-analysis.js";

export type DecisionTableRow = {
  procedure: string;
  condition: string;
  line: number;
  branches: string[];
};

export type PathObligation = {
  procedure: string;
  description: string;
  line: number;
  kind: "branch_characterization" | "failure_characterization" | "null_check";
};

export type TraceabilityEdge = {
  block: string;
  tokens: string[];
  line: number;
};

export type ObligationsSection = {
  decision_tables: DecisionTableRow[];
  path_obligations: PathObligation[];
};

export type TraceabilitySection = {
  block_edges: TraceabilityEdge[];
};

function diagnosticSort(a: AnalysisDiagnostic, b: AnalysisDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code);
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Extract decision tables and path characterization obligations without claiming test coverage.
 */
export function extractObligations(
  program: IrProgram,
  abstract: AbstractSection,
): { obligations: ObligationsSection; traceability: TraceabilitySection; diagnostics: AnalysisDiagnostic[] } {
  const diagnostics: AnalysisDiagnostic[] = [];
  const decisionTables: DecisionTableRow[] = [];
  const pathObligations: PathObligation[] = [];
  const blockEdges: TraceabilityEdge[] = [];

  for (const proc of program.procedures) {
    blockEdges.push({
      block: proc.name,
      tokens: [...proc.token_refs].sort((a, b) => a.localeCompare(b)),
      line: proc.span.line,
    });

    for (const stmt of proc.statements) {
      if (stmt.kind === "if") {
        decisionTables.push({
          procedure: proc.name,
          condition: stmt.condition,
          line: stmt.span.line,
          branches: ["true", "false"],
        });
        pathObligations.push({
          procedure: proc.name,
          description: `Characterize branch when ${stmt.condition}`,
          line: stmt.span.line,
          kind: "branch_characterization",
        });
      }
      if (stmt.kind === "switch") {
        decisionTables.push({
          procedure: proc.name,
          condition: stmt.expression,
          line: stmt.span.line,
          branches: ["case"],
        });
      }
      if (stmt.kind === "error") {
        pathObligations.push({
          procedure: proc.name,
          description: `Characterize failure path: ${stmt.message}`,
          line: stmt.span.line,
          kind: "failure_characterization",
        });
      }
    }
  }

  for (const cond of abstract.path_conditions) {
    pathObligations.push({
      procedure: cond.split(":")[0] ?? "unknown",
      description: `Path condition obligation: ${cond}`,
      line: 0,
      kind: "branch_characterization",
    });
  }

  decisionTables.sort((a, b) => a.procedure.localeCompare(b.procedure) || a.line - b.line);
  pathObligations.sort((a, b) => a.procedure.localeCompare(b.procedure) || a.line - b.line);
  blockEdges.sort((a, b) => a.block.localeCompare(b.block));

  return {
    obligations: { decision_tables: decisionTables, path_obligations: pathObligations },
    traceability: { block_edges: blockEdges },
    diagnostics: diagnostics.sort(diagnosticSort),
  };
}
