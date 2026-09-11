/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Report schema helpers for pseudocode-analysis-report.v1.
 */
import { createHash } from "node:crypto";
import {
  ALL_ANALYSIS_PASSES,
  ANALYZER_VERSION,
  DEFAULT_BUDGETS,
  DEFAULT_PROOF_BOUNDARY,
  type GrammarVersion,
  REPORT_SCHEMA_VERSION,
  type AnalysisDiagnostic,
  type AnalysisPass,
  type AnalysisUnknown,
  type InputIdentity,
  type IrProgram,
  type PseudocodeAnalysisBudgets,
} from "./pseudocode-ir.js";
import type { AbstractSection } from "./pseudocode-abstract-analysis.js";
import type { CallGraphSection } from "./pseudocode-call-graph.js";
import type { CfgSection } from "./pseudocode-cfg.js";
import type { ObligationsSection, TraceabilitySection } from "./pseudocode-obligations.js";
import type { SymbolsSection } from "./pseudocode-symbols.js";
import type { PseudocodeValidationReport } from "./pseudocode-validator.js";
import { CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT } from "./pseudocode-constraint-language.js";
import type { ConstraintFlowSection } from "./pseudocode-constraint-ir.js";
import {
  ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT,
  type AsyncBoundarySection,
} from "./pseudocode-async-boundary.js";
import {
  TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
  type TypedFlowSection,
} from "./pseudocode-typed-flow.js";

export type AnalysisReportSections = {
  parse?: {
    procedure_count: number;
    parse_node_count: number;
    token_refs: string[];
    unsupported_syntax_count: number;
  };
  symbols?: SymbolsSection;
  cfg?: CfgSection;
  call_graph?: CallGraphSection;
  abstract?: AbstractSection;
  obligations?: ObligationsSection;
  traceability?: TraceabilitySection;
  structural_compat?: PseudocodeValidationReport;
  typed_flow?: TypedFlowSection;
  async_boundary?: AsyncBoundarySection;
  constraint_language?: ConstraintFlowSection;
};

/** [IMPL-ASYNC_BOUNDARY_ANALYZER] Extend base proof boundary when async_boundary pass runs. */
export function extendProofBoundaryForAsyncBoundary(
  base: string = DEFAULT_PROOF_BOUNDARY,
): string {
  return `${base} ${ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT}`;
}

/** [IMPL-PSEUDOCODE_TYPED_FLOW] Extend base proof boundary when typed_flow pass runs. */
export function extendProofBoundaryForTypedFlow(
  base: string = DEFAULT_PROOF_BOUNDARY,
): string {
  return `${base} ${TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT}`;
}

/** [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] Extend proof boundary when constraint_flow pass runs. */
export function extendProofBoundaryForConstraintFlow(
  base: string = DEFAULT_PROOF_BOUNDARY,
): string {
  return `${base} ${CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT}`;
}

export type PseudocodeAnalysisReport = {
  ok: boolean;
  gate_mode_applied?: true;
  schema_version: typeof REPORT_SCHEMA_VERSION;
  grammar_version: GrammarVersion;
  analyzer_version: typeof ANALYZER_VERSION;
  proof_boundary: string;
  token: string;
  input_identity: InputIdentity;
  budgets_applied: {
    requested: Partial<PseudocodeAnalysisBudgets>;
    effective: PseudocodeAnalysisBudgets;
  };
  truncated: boolean;
  diagnostics_truncated: boolean;
  sections: AnalysisReportSections;
  diagnostics: AnalysisDiagnostic[];
  unsupported_syntax: IrProgram["unsupported_syntax"];
  unknowns: AnalysisUnknown[];
};

export function computeInputIdentity(source: string): InputIdentity {
  const normalized = source.replace(/\r\n/g, "\n");
  const hash = createHash("sha256").update(normalized, "utf8").digest("hex");
  return { algorithm: "sha256", hash, byte_length: Buffer.byteLength(normalized, "utf8") };
}

export function mergeBudgets(requested?: Partial<PseudocodeAnalysisBudgets>): {
  requested: Partial<PseudocodeAnalysisBudgets>;
  effective: PseudocodeAnalysisBudgets;
} {
  const effective = { ...DEFAULT_BUDGETS, ...requested };
  return { requested: requested ?? {}, effective };
}

export function sortDiagnostics(diagnostics: AnalysisDiagnostic[]): AnalysisDiagnostic[] {
  return [...diagnostics].sort(
    (a, b) => a.line - b.line || a.code.localeCompare(b.code) || a.message.localeCompare(b.message),
  );
}

export function capDiagnostics(
  diagnostics: AnalysisDiagnostic[],
  max: number,
): { diagnostics: AnalysisDiagnostic[]; truncated: boolean } {
  if (diagnostics.length <= max) return { diagnostics, truncated: false };
  return { diagnostics: diagnostics.slice(0, max), truncated: true };
}

export function normalizePasses(analyses?: AnalysisPass[]): AnalysisPass[] {
  if (!analyses || analyses.length === 0) return [...ALL_ANALYSIS_PASSES];
  const allowed = new Set(ALL_ANALYSIS_PASSES);
  return analyses.filter((p) => allowed.has(p));
}

/** Deterministic JSON stringify for regression tests. */
export function serializeAnalysisReport(report: PseudocodeAnalysisReport): string {
  return JSON.stringify(report);
}

export function buildParseSection(program: IrProgram): AnalysisReportSections["parse"] {
  return {
    procedure_count: program.procedures.length,
    parse_node_count: program.parse_node_count,
    token_refs: [...program.token_refs],
    unsupported_syntax_count: program.unsupported_syntax.length,
  };
}
