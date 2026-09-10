/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: Constraint-language IR — refinement predicate AST, budgets, and analysis section types.
 */
import type { AnalysisUnknown, SourceSpan } from "./pseudocode-ir.js";

export type MutabilityTag = "immutable" | "mutable";

export type CompareOp = ">" | ">=" | "<" | "<=" | "=" | "!=";

export type PredicateValue =
  | { kind: "ref"; name: string }
  | { kind: "field"; base: string; field: string }
  | { kind: "length"; target: string }
  | { kind: "size"; target: string }
  | { kind: "number"; value: number }
  | { kind: "bool"; value: boolean };

export type PredicateNode =
  | { kind: "compare"; op: CompareOp; left: PredicateValue; right: PredicateValue }
  | { kind: "is_not_null"; target: PredicateValue }
  | { kind: "field_defined"; base: string; field: string }
  | { kind: "and"; children: PredicateNode[] }
  | { kind: "or"; children: PredicateNode[] }
  | { kind: "not"; child: PredicateNode }
  | { kind: "forall"; var: string; start: number; end: number; body: PredicateNode };

export type RefinementPredicate = {
  text: string;
  ast?: PredicateNode;
  node_count?: number;
  span?: SourceSpan;
};

export type ParseRefinementResult =
  | { ok: true; predicate: RefinementPredicate }
  | { ok: false; cause: "predicate_unsupported" | "CONSTRAINT_UNSUPPORTED_SYNTAX" | "empty"; message: string };

export type SummaryKind = "call" | "return";

export type SummaryEntry = {
  key: string;
  value: string;
  span?: SourceSpan;
};

export type ProcedureSummary = {
  kind: SummaryKind;
  entries: SummaryEntry[];
  span?: SourceSpan;
};

export type AliasPolicyEntry = {
  rule: string;
  span?: SourceSpan;
};

export type AliasPolicy = {
  entries: AliasPolicyEntry[];
  span?: SourceSpan;
};

export type ConstraintAnalysisBudgets = {
  max_solver_steps: number;
  max_summary_depth: number;
  max_predicate_nodes: number;
};

export const DEFAULT_CONSTRAINT_BUDGETS: ConstraintAnalysisBudgets = {
  max_solver_steps: 256,
  max_summary_depth: 8,
  max_predicate_nodes: 512,
};

export type ConstraintDiagnosticCode =
  | "REFINEMENT_VIOLATION"
  | "CONSTRAINT_UNSUPPORTED_SYNTAX"
  | "SUMMARY_CONFLICT"
  | "MUTATION_VIOLATION"
  | "ALIAS_VIOLATION";

export type SolverMetadata = {
  solver_truncation?: boolean;
  truncation_cause?: "max_solver_steps" | "max_summary_depth";
  solver_steps?: number;
  summary_depth?: number;
  budgets_applied?: ConstraintAnalysisBudgets;
  interproc_calls_analyzed?: number;
  interproc_facts_propagated?: number;
};

export type ResolvedProcedureSummaries = {
  call: SummaryEntry[];
  return: SummaryEntry[];
};

export type ConstraintDiagnostic = {
  severity: "warning" | "error";
  code: ConstraintDiagnosticCode;
  message: string;
  line: number;
  procedure?: string;
  span?: SourceSpan;
};

export type EntailmentOutcome = "proven_true" | "proven_false" | "inconclusive";

export type EntailmentResult = {
  outcome: EntailmentOutcome;
  cause?: string;
};

export type ConstraintFlowSection = {
  procedures_analyzed: number;
  diagnostics: ConstraintDiagnostic[];
  unknowns: AnalysisUnknown[];
  refinements_checked: number;
  refinements_proven: number;
  solver_metadata?: SolverMetadata;
  interproc_enabled?: boolean;
  alias_mut_checked?: number;
  alias_mut_violations?: number;
};
