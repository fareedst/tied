/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Bounded abstract analysis for def-use, nullability, effects, and paths.
 */
import type { AnalysisDiagnostic, AnalysisUnknown, IrProgram, PseudocodeAnalysisBudgets } from "./pseudocode-ir.js";
import type { CfgSection } from "./pseudocode-cfg.js";

export type AbstractFact = {
  variable: string;
  procedure: string;
  fact: "defined" | "nullable" | "unknown" | "non_null";
  line: number;
};

export type AbstractSection = {
  facts: AbstractFact[];
  path_conditions: string[];
  effect_gaps: string[];
  termination_unknown: string[];
};

function diagnosticSort(a: AnalysisDiagnostic, b: AnalysisDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code);
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Run bounded def-use and nullability propagation with explicit unknown policy.
 */
export function runAbstractAnalysis(
  program: IrProgram,
  _cfg: CfgSection,
  budgets: PseudocodeAnalysisBudgets,
  strictPaths: boolean,
): {
  section: AbstractSection;
  diagnostics: AnalysisDiagnostic[];
  unknowns: AnalysisUnknown[];
} {
  const diagnostics: AnalysisDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  const facts: AbstractFact[] = [];
  const pathConditions: string[] = [];
  const effectGaps: string[] = [];
  const terminationUnknown: string[] = [];
  let iterations = 0;

  for (const proc of program.procedures) {
    const env = new Map<string, AbstractFact["fact"]>();
    for (const stmt of proc.statements) {
      iterations += 1;
      if (iterations > budgets.max_fixed_point_iterations) {
        unknowns.push({
          cause: "budget_exceeded",
          message: `Fixed-point iteration budget exceeded in ${proc.name}`,
          procedure: proc.name,
          line: stmt.span.line,
          proof_boundary: "Abstract facts beyond budget are unknown",
        });
        break;
      }

      if (stmt.kind === "assignment") {
        const nullable = stmt.value.includes("null") || stmt.value.includes("?");
        env.set(stmt.target, nullable ? "nullable" : "defined");
        facts.push({
          variable: stmt.target,
          procedure: proc.name,
          fact: nullable ? "nullable" : "defined",
          line: stmt.span.line,
        });
        if (stmt.value.includes("*") || stmt.value.includes("deref")) {
          diagnostics.push({
            severity: "warning",
            code: "DEREF_OBLIGATION",
            message: `Dereference obligation for ${stmt.target} in ${proc.name}`,
            line: stmt.span.line,
            block: proc.name,
            span: stmt.span,
          });
        }
      }

      if (stmt.kind === "if") {
        if (pathConditions.length >= budgets.max_path_conditions) {
          unknowns.push({
            cause: "path_budget",
            message: "Path condition budget exceeded; remaining paths unknown",
            procedure: proc.name,
            proof_boundary: "Path conditions collapsed to unknown_path_condition",
          });
        } else {
          pathConditions.push(`${proc.name}: ${stmt.condition}`);
          if (stmt.condition.includes("false") && stmt.condition.includes("true")) {
            diagnostics.push({
              severity: strictPaths ? "error" : "warning",
              code: "CONTRADICTORY_PATH",
              message: `Contradictory path condition in ${proc.name}`,
              line: stmt.span.line,
              block: proc.name,
              span: stmt.span,
            });
          }
        }
      }

      if (stmt.kind === "while" || stmt.kind === "for") {
        terminationUnknown.push(proc.name);
        diagnostics.push({
          severity: "info",
          code: "TERMINATION_UNKNOWN",
          message: `Termination unknown for loop in ${proc.name}`,
          line: stmt.span.line,
          block: proc.name,
        });
      }

      if (stmt.kind === "call" && !proc.contract.fields.includes("EFFECTS")) {
        effectGaps.push(`${proc.name}:${stmt.callee}`);
        diagnostics.push({
          severity: "warning",
          code: "EFFECT_MISMATCH",
          message: `Call ${stmt.callee} without declared EFFECTS in ${proc.name}`,
          line: stmt.span.line,
          block: proc.name,
        });
      }

      if (stmt.kind === "error") {
        effectGaps.push(`${proc.name}:failure_path`);
        diagnostics.push({
          severity: "warning",
          code: "FAILURE_PROPAGATION_GAP",
          message: `Failure path in ${proc.name} requires propagation check`,
          line: stmt.span.line,
          block: proc.name,
        });
      }
    }

    for (const [variable, fact] of env) {
      if (fact === "nullable") {
        diagnostics.push({
          severity: "warning",
          code: "NULL_CHECK_OBLIGATION",
          message: `Null-check obligation for ${variable} in ${proc.name}`,
          line: proc.span.line,
          block: proc.name,
        });
      }
    }
  }

  pathConditions.sort((a, b) => a.localeCompare(b));
  effectGaps.sort((a, b) => a.localeCompare(b));
  terminationUnknown.sort((a, b) => a.localeCompare(b));
  facts.sort((a, b) => a.procedure.localeCompare(b.procedure) || a.variable.localeCompare(b.variable));

  return {
    section: {
      facts,
      path_conditions: pathConditions,
      effect_gaps: effectGaps,
      termination_unknown: [...new Set(terminationUnknown)],
    },
    diagnostics: diagnostics.sort(diagnosticSort),
    unknowns,
  };
}
