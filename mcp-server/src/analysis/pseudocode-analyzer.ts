/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Orchestrate pseudo-code static analysis passes and emit versioned report.
 */
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { analyzeSymbols } from "./pseudocode-symbols.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { buildCallGraph } from "./pseudocode-call-graph.js";
import { runAbstractAnalysis } from "./pseudocode-abstract-analysis.js";
import { extractObligations } from "./pseudocode-obligations.js";
import {
  buildParseSection,
  capDiagnostics,
  computeInputIdentity,
  extendProofBoundaryForTypedFlow,
  mergeBudgets,
  normalizePasses,
  sortDiagnostics,
  type PseudocodeAnalysisReport,
} from "./pseudocode-analyze-report.js";
import {
  applyTypedGateSeverityPromotion,
  isTypedGateErrorsEffective,
  runTypedFlowAnalysis,
  TYPED_GATE_ERRORS_PROOF_BOUNDARY_SUPPLEMENT,
  typedGateDiagnosticsToAnalysis,
} from "./pseudocode-typed-flow.js";
import {
  ANALYZER_VERSION,
  DEFAULT_PROOF_BOUNDARY,
  GRAMMAR_VERSION,
  REPORT_SCHEMA_VERSION,
  type AnalysisDiagnostic,
  type AnalysisPass,
  type AnalysisUnknown,
  type PseudocodeAnalysisBudgets,
} from "./pseudocode-ir.js";
import { validateEssencePseudocode } from "./pseudocode-validator.js";

export type AnalyzeEssencePseudocodeInput = {
  token: string;
  pseudocode: string;
  known_tokens?: string[];
  analyses?: AnalysisPass[];
  budgets?: Partial<PseudocodeAnalysisBudgets>;
  include_structural_compat?: boolean;
  strict_paths?: boolean;
  gate_mode?: boolean;
  typed_flow?: boolean;
  typed_gate_errors?: boolean;
};

export type AnalyzeInputError = {
  ok: false;
  stage: "input" | "parse";
  error: string;
  diagnostics?: AnalysisDiagnostic[];
};

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Run selected analysis passes with budgets and emit deterministic pseudocode-analysis-report.v1.
 */
export function analyzeEssencePseudocode(
  input: AnalyzeEssencePseudocodeInput,
): PseudocodeAnalysisReport | AnalyzeInputError {
  const passes = normalizePasses(input.analyses);
  const { requested, effective } = mergeBudgets(input.budgets);
  const inputIdentity = computeInputIdentity(input.pseudocode);

  if (input.pseudocode.length > effective.max_source_bytes) {
    return {
      ok: false,
      stage: "input",
      error: "INPUT_TOO_LARGE",
      diagnostics: [
        {
          severity: "error",
          code: "INPUT_TOO_LARGE",
          message: `Source exceeds max_source_bytes (${effective.max_source_bytes})`,
          line: 1,
        },
      ],
    };
  }

  let diagnostics: AnalysisDiagnostic[] = [];
  let unknowns: AnalysisUnknown[] = [];
  let truncated = false;
  const sections: PseudocodeAnalysisReport["sections"] = {};

  if (!passes.includes("parse")) {
    return {
      ok: false,
      stage: "parse",
      error: "parse pass required",
    };
  }

  const parseResult = parsePseudocodeToIr(input.pseudocode, effective);
  if (!parseResult.ok) {
    return {
      ok: false,
      stage: "parse",
      error: parseResult.error,
      diagnostics: parseResult.diagnostics.map((d) => ({
        severity: "error" as const,
        code: d.code as AnalysisDiagnostic["code"],
        message: d.message,
        line: d.line,
      })),
    };
  }

  const program = parseResult.program;
  truncated = program.truncated_parse;
  sections.parse = buildParseSection(program);

  if (passes.includes("symbols")) {
    const sym = analyzeSymbols(program, input.token, input.known_tokens);
    sections.symbols = sym.section;
    diagnostics.push(...sym.diagnostics);
  }

  let cfgSection;
  if (passes.includes("cfg")) {
    const cfg = buildCfg(program, effective);
    cfgSection = cfg.section;
    sections.cfg = cfg.section;
    diagnostics.push(...cfg.diagnostics);
    truncated = truncated || cfg.section.procedures.some((p) => p.truncated);
  }

  if (passes.includes("call_graph")) {
    const cg = buildCallGraph(program, effective);
    sections.call_graph = cg.section;
    diagnostics.push(...cg.diagnostics);
    truncated = truncated || cg.section.truncated;
  }

  let abstractSection;
  if (passes.includes("abstract")) {
    const cfg = cfgSection ?? buildCfg(program, effective).section;
    const abs = runAbstractAnalysis(program, cfg, effective, input.strict_paths === true);
    abstractSection = abs.section;
    sections.abstract = abs.section;
    diagnostics.push(...abs.diagnostics);
    unknowns.push(...abs.unknowns);
  }

  let proofBoundary = DEFAULT_PROOF_BOUNDARY;
  if (input.typed_flow === true) {
    const cfg = cfgSection ?? buildCfg(program, effective).section;
    if (!cfgSection) {
      sections.cfg = cfg;
    }
    const typed = runTypedFlowAnalysis(program, cfg, effective);
    let typedSection = typed.section;
    if (isTypedGateErrorsEffective(input)) {
      typedSection = applyTypedGateSeverityPromotion(program, typedSection);
      diagnostics.push(...typedGateDiagnosticsToAnalysis(typedSection));
    }
    sections.typed_flow = typedSection;
    proofBoundary = extendProofBoundaryForTypedFlow(proofBoundary);
    if (isTypedGateErrorsEffective(input)) {
      proofBoundary = `${proofBoundary} ${TYPED_GATE_ERRORS_PROOF_BOUNDARY_SUPPLEMENT}`;
    }
  }

  if (passes.includes("obligations") || passes.includes("traceability")) {
    const abs =
      abstractSection ??
      runAbstractAnalysis(program, cfgSection ?? buildCfg(program, effective).section, effective, false).section;
    const obl = extractObligations(program, abs);
    if (passes.includes("obligations")) sections.obligations = obl.obligations;
    if (passes.includes("traceability")) sections.traceability = obl.traceability;
    diagnostics.push(...obl.diagnostics);
  }

  if (input.include_structural_compat) {
    sections.structural_compat = validateEssencePseudocode({
      token: input.token,
      pseudocode: input.pseudocode,
      known_tokens: input.known_tokens,
      require_contracts: false,
    });
  }

  diagnostics = sortDiagnostics(diagnostics);
  const capped = capDiagnostics(diagnostics, effective.max_report_diagnostics);

  const gateModeApplied = input.gate_mode === true;
  const hasStrictPathError =
    input.strict_paths === true &&
    capped.diagnostics.some((d) => d.severity === "error" && d.code === "CONTRADICTORY_PATH");
  const hasInputTooLarge =
    capped.diagnostics.some((d) => d.severity === "error" && d.code === "INPUT_TOO_LARGE");
  const hasGateModeError =
    gateModeApplied &&
    (truncated || capped.diagnostics.some((d) => d.severity === "error"));
  const ok = gateModeApplied
    ? !hasGateModeError && !hasInputTooLarge
    : !hasStrictPathError && !hasInputTooLarge;

  return {
    ok,
    ...(gateModeApplied ? { gate_mode_applied: true as const } : {}),
    schema_version: REPORT_SCHEMA_VERSION,
    grammar_version: GRAMMAR_VERSION,
    analyzer_version: ANALYZER_VERSION,
    proof_boundary: proofBoundary,
    token: input.token,
    input_identity: inputIdentity,
    budgets_applied: { requested, effective },
    truncated,
    diagnostics_truncated: capped.truncated,
    sections,
    diagnostics: capped.diagnostics,
    unsupported_syntax: program.unsupported_syntax,
    unknowns,
  };
}
