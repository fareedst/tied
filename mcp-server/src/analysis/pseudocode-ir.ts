/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Normalized IR types for pseudo-code static analysis grammar v1.
 */

export const GRAMMAR_VERSION = "pseudocode-grammar.v1" as const;
export const REPORT_SCHEMA_VERSION = "pseudocode-analysis-report.v1" as const;
export const ANALYZER_VERSION = "1.0.0" as const;

export const DEFAULT_PROOF_BOUNDARY =
  "Deterministic static analysis of essence_pseudocode within declared grammar and budgets; not runtime execution, not test execution, not complete behavioral verification.";

export type SourceSpan = {
  line: number;
  column: number;
  end_line: number;
  end_column: number;
};

export type PseudocodeAnalysisBudgets = {
  max_parse_nodes: number;
  max_procedures: number;
  max_cfg_blocks_per_procedure: number;
  max_call_graph_edges: number;
  max_fixed_point_iterations: number;
  max_path_conditions: number;
  max_report_diagnostics: number;
  max_source_bytes: number;
};

export const DEFAULT_BUDGETS: PseudocodeAnalysisBudgets = {
  max_parse_nodes: 5000,
  max_procedures: 256,
  max_cfg_blocks_per_procedure: 512,
  max_call_graph_edges: 2048,
  max_fixed_point_iterations: 32,
  max_path_conditions: 64,
  max_report_diagnostics: 500,
  max_source_bytes: 512_000,
};

export type AnalysisPass =
  | "parse"
  | "symbols"
  | "cfg"
  | "call_graph"
  | "abstract"
  | "obligations"
  | "traceability";

export const ALL_ANALYSIS_PASSES: AnalysisPass[] = [
  "parse",
  "symbols",
  "cfg",
  "call_graph",
  "abstract",
  "obligations",
  "traceability",
];

export type ContractFields = {
  fields: string[];
  span?: SourceSpan;
};

export type IrAssignment = {
  kind: "assignment";
  target: string;
  value: string;
  span: SourceSpan;
};

export type IrIf = {
  kind: "if";
  condition: string;
  span: SourceSpan;
};

export type IrElse = {
  kind: "else";
  span: SourceSpan;
};

export type IrWhile = {
  kind: "while";
  condition: string;
  span: SourceSpan;
};

export type IrFor = {
  kind: "for";
  iterator: string;
  span: SourceSpan;
};

export type IrSwitch = {
  kind: "switch";
  expression: string;
  span: SourceSpan;
};

export type IrCase = {
  kind: "case";
  label: string;
  span: SourceSpan;
};

export type IrCall = {
  kind: "call";
  callee: string;
  span: SourceSpan;
};

export type IrRun = {
  kind: "run";
  target: string;
  span: SourceSpan;
};

export type IrReturn = {
  kind: "return";
  value?: string;
  span: SourceSpan;
};

export type IrError = {
  kind: "error";
  message: string;
  span: SourceSpan;
};

export type IrStatement =
  | IrAssignment
  | IrIf
  | IrElse
  | IrWhile
  | IrFor
  | IrSwitch
  | IrCase
  | IrCall
  | IrRun
  | IrReturn
  | IrError;

export type IrProcedure = {
  name: string;
  kind: "procedure" | "function" | "block";
  span: SourceSpan;
  token_refs: string[];
  contract: ContractFields;
  statements: IrStatement[];
};

export type UnsupportedSyntax = {
  construct: string;
  message: string;
  span: SourceSpan;
};

export type IrProgram = {
  grammar_version: typeof GRAMMAR_VERSION;
  procedures: IrProcedure[];
  global_contract: ContractFields;
  token_refs: string[];
  unsupported_syntax: UnsupportedSyntax[];
  parse_node_count: number;
  truncated_parse: boolean;
};

export type AnalysisDiagnosticCode =
  | "UNSUPPORTED_SYNTAX"
  | "UNRESOLVED_CALL"
  | "UNRESOLVED_RUN"
  | "DEREF_OBLIGATION"
  | "NULL_CHECK_OBLIGATION"
  | "CONTRADICTORY_PATH"
  | "EFFECT_MISMATCH"
  | "FAILURE_PROPAGATION_GAP"
  | "TERMINATION_UNKNOWN"
  | "TRUNCATED_PARSE"
  | "TRUNCATED_CFG"
  | "TRUNCATED_CALL_GRAPH"
  | "INPUT_TOO_LARGE"
  | "PATH_NOT_UNDER_TIED_BASE"
  | "AMBIGUOUS_INPUT"
  | "MISSING_INPUT"
  | "DUPLICATE_SYMBOL"
  | "READ_BEFORE_WRITE"
  | "MISSING_CONTRACT_FIELD"
  | "UNKNOWN_TOKEN";

export type AnalysisDiagnostic = {
  severity: "error" | "warning" | "info";
  code: AnalysisDiagnosticCode;
  message: string;
  line: number;
  block?: string;
  span?: SourceSpan;
};

export type AnalysisUnknown = {
  cause: string;
  message: string;
  procedure?: string;
  line?: number;
  proof_boundary: string;
};

export type InputIdentity = {
  algorithm: "sha256";
  hash: string;
  byte_length: number;
};
