/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Project pseudocode_analyze (+ Layer B) into constraint-migration-receipt.v1.
 */
import { createHash, randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { relative } from "node:path";
import {
  METHODOLOGY_PIN_LABEL,
  REPO_ROOT,
} from "./constants.ts";
import type { ManifestEntry } from "./manifest.ts";

const RECEIPT_SCHEMA_REF =
  "working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json";

const IMPL_TOKEN_PATTERN = /^IMPL-[A-Z0-9_]+$/;

const CONSTRAINT_GATE_CODES = new Set([
  "REFINEMENT_VIOLATION",
  "CONSTRAINT_UNSUPPORTED_SYNTAX",
  "SUMMARY_CONFLICT",
  "MUTATION_VIOLATION",
  "ALIAS_VIOLATION",
]);

export type G1AnalyzeOptions = {
  gate_mode: true;
  typed_flow: true;
  constraint_flow: true;
  constraint_gate_errors: false;
  include_structural_compat: true;
};

/** Analyzer flags for receipt projection (G1 advisory or local G2 simulation). */
export type ReceiptAnalyzeProfile = {
  gate_mode: true;
  typed_flow: true;
  constraint_flow: true;
  constraint_gate_errors: boolean;
  include_structural_compat?: true;
};

export type ReceiptProjectionMeta = {
  /** When set, receipt_meta.gate_stage stays G1 but notes record simulated blocking. */
  simulated_gate?: "G2-local-blocking";
};

type AnnotationProfile =
  | "legacy-v1"
  | "header-only-v2"
  | "constraint-ready-v2"
  | "constraint-enforced-v2"
  | "fixture-lab"
  | "unknown-or-mixed";

export type ReceiptGateStage = "G0" | "G1" | "G2" | "G3" | "G4";

export type ReceiptBuildContext = {
  manifest_entry_id?: string;
  sidecar_path: string;
  impl_token: string;
  annotation_profile?: AnnotationProfile;
  layer_a_applicable?: boolean;
  promotion_readiness?: Partial<ReceiptDocument["promotion_readiness"]>;
  collector_notes?: string;
  /** Pilot receipts (Phase 3) use G2; Phase 2 harness defaults G1. */
  gate_stage?: ReceiptGateStage;
  program_gate_policy?: "advisory" | "blocking";
};

type ReceiptSubject = {
  sidecar_path: string;
  impl_token?: string;
  input_identity: { algorithm: "sha256"; hash: string; byte_length: number };
  grammar_version: "pseudocode-grammar.v1" | "pseudocode-grammar.v2";
  annotation_profile: AnnotationProfile;
};

export type ReceiptDocument = {
  $schema: string;
  receipt_meta: {
    schema_version: 1;
    receipt_id: string;
    generated_at: string;
    gate_stage: ReceiptGateStage;
    program_gate_policy: "advisory" | "blocking";
  };
  pin: {
    methodology_pin: string;
    analyzer_build_identity: string;
    manifest_entry_id?: string;
  };
  subject: ReceiptSubject;
  layer_a: {
    applicable: boolean;
    ok: boolean;
    tied_consistency_ok?: boolean;
    token_refs_checked?: number;
    notes?: string;
  };
  layer_b: {
    ok: boolean;
    validator_schema_version: "layer-b-pseudocode-validator.v1";
    blocks_count: number;
    contract_precision: {
      active_blocks_with_contract: number;
      active_blocks_missing_pre_or_post: number;
      active_blocks_missing_failure_modes: number;
      active_blocks_missing_data_transition: number;
      active_blocks_missing_termination: number;
    };
    shape_rows?: Array<{ shape_id: string; ok: boolean; message?: string }>;
    error_count: number;
    warning_count: number;
  };
  layer_c: {
    gate_mode: boolean;
    typed_flow: boolean;
    constraint_flow: boolean;
    constraint_gate_errors_policy: "advisory" | "blocking";
    ok: boolean;
    analysis_truncated: boolean;
    diagnostics_truncated: boolean;
    error_count: number;
    warning_count: number;
    info_count: number;
    procedure_count?: number;
    source_report_schema: "pseudocode-analysis-report.v1";
  };
  constraint: {
    ran: boolean;
    procedures_analyzed: number;
    refinements_checked: number;
    refinements_proven: number;
    alias_mut_checked: number;
    alias_mut_violations: number;
    interproc_enabled?: boolean;
    budgets_applied?: {
      max_solver_steps: number;
      max_summary_depth: number;
      max_predicate_nodes: number;
    };
    solver_truncated: boolean;
    solver_truncation_cause?:
      | "max_solver_steps"
      | "max_summary_depth"
      | "max_predicate_nodes"
      | "solver_truncation"
      | "none";
    alias_analysis_truncated: boolean;
    budget_exceeded: boolean;
    constraint_diagnostics_truncated: boolean;
    solver_steps_used?: number;
    summary_depth_used?: number;
  };
  unknown_summary: {
    unknown: number;
    truncated: number;
    unsupported: number;
    prose_only: number;
    budget_exceeded: number;
  };
  constraint_gate_errors: Array<{
    code: string;
    severity: "warning" | "error";
    message: string;
    line: number;
    procedure?: string;
    proven: boolean;
  }>;
  promotion_readiness: {
    qualification_green: boolean;
    f11_pass: boolean;
    fp_within_threshold: boolean;
    as_of_phase?: string;
  };
  collector_notes?: string;
};

type AnalysisReport = {
  ok?: boolean;
  grammar_version?: string;
  input_identity?: { algorithm: "sha256"; hash: string; byte_length: number };
  truncated?: boolean;
  diagnostics_truncated?: boolean;
  diagnostics?: Array<{ severity: string; code: string; message: string; line: number }>;
  unknowns?: Array<{ cause?: string; message?: string; procedure?: string; line?: number }>;
  sections?: {
    parse?: { procedure_count?: number };
    structural_compat?: StructuralCompat;
    constraint_language?: ConstraintSection;
  };
};

type StructuralCompat = {
  ok: boolean;
  blocks?: Array<{ name: string; contract_fields?: string[] }>;
  diagnostics?: Array<{ severity: string; code: string }>;
  coverage?: Array<{ failure_modes?: string[] }>;
};

type ConstraintSection = {
  procedures_analyzed?: number;
  refinements_checked?: number;
  refinements_proven?: number;
  alias_mut_checked?: number;
  alias_mut_violations?: number;
  interproc_enabled?: boolean;
  diagnostics?: Array<{
    severity: "warning" | "error";
    code: string;
    message: string;
    line: number;
    procedure?: string;
  }>;
  unknowns?: Array<{ cause?: string }>;
  solver_metadata?: {
    solver_truncation?: boolean;
    truncation_cause?: "max_solver_steps" | "max_summary_depth";
    solver_steps?: number;
    summary_depth?: number;
    budgets_applied?: {
      max_solver_steps: number;
      max_summary_depth: number;
      max_predicate_nodes: number;
    };
  };
};

export function analyzerBuildIdentity(): string {
  try {
    const sha = execSync("git rev-parse --short HEAD", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
    return `pseudocode-analyzer/1.0.0+stdd@${sha}`;
  } catch {
    return "pseudocode-analyzer/1.0.0+stdd@unknown";
  }
}

export function repoRelativeSidecarPath(absoluteOrRelative: string): string {
  if (!absoluteOrRelative.startsWith("/")) return absoluteOrRelative;
  return relative(REPO_ROOT, absoluteOrRelative).split("\\").join("/");
}

function unknownBucket(cause: string): keyof ReceiptDocument["unknown_summary"] {
  const c = cause.toLowerCase();
  if (
    c.includes("truncat") ||
    c === "solver_truncation" ||
    c.includes("diagnostics_cap")
  ) {
    return "truncated";
  }
  if (c.includes("unsupported") || c.includes("constraint_unsupported")) {
    return "unsupported";
  }
  if (c.includes("prose")) return "prose_only";
  if (c.includes("budget") || c === "path_budget") return "budget_exceeded";
  return "unknown";
}

function aggregateUnknownSummary(
  report: AnalysisReport,
  constraint?: ConstraintSection,
  extraTruncation = false,
): ReceiptDocument["unknown_summary"] {
  const summary = {
    unknown: 0,
    truncated: 0,
    unsupported: 0,
    prose_only: 0,
    budget_exceeded: 0,
  };
  const all = [...(report.unknowns ?? []), ...(constraint?.unknowns ?? [])];
  for (const u of all) {
    const bucket = unknownBucket(u.cause ?? "unspecified");
    summary[bucket] += 1;
  }
  if (extraTruncation && summary.truncated < 1) {
    summary.truncated = 1;
  }
  if (report.truncated && summary.budget_exceeded === 0) {
    summary.budget_exceeded += 1;
  }
  return summary;
}

function buildLayerB(structural?: StructuralCompat): ReceiptDocument["layer_b"] {
  if (!structural) {
    return {
      ok: true,
      validator_schema_version: "layer-b-pseudocode-validator.v1",
      blocks_count: 0,
      contract_precision: {
        active_blocks_with_contract: 0,
        active_blocks_missing_pre_or_post: 0,
        active_blocks_missing_failure_modes: 0,
        active_blocks_missing_data_transition: 0,
        active_blocks_missing_termination: 0,
      },
      error_count: 0,
      warning_count: 0,
    };
  }
  const blocks = structural.blocks ?? [];
  let withContract = 0;
  let missingPrePost = 0;
  let missingFailure = 0;
  let missingTransition = 0;
  let missingTermination = 0;
  for (const block of blocks) {
    const fields = new Set((block.contract_fields ?? []).map((f) => f.toUpperCase()));
    if (fields.has("PRE") || fields.has("POST") || fields.has("INPUT")) {
      withContract += 1;
      if (!fields.has("PRE") || !fields.has("POST")) missingPrePost += 1;
    }
  }
  for (const d of structural.diagnostics ?? []) {
    if (d.code === "MISSING_FAILURE_MODES") missingFailure += 1;
    if (d.code === "MISSING_DATA_TRANSITION") missingTransition += 1;
    if (d.code === "MISSING_TERMINATION") missingTermination += 1;
  }
  const errors = (structural.diagnostics ?? []).filter((d) => d.severity === "error").length;
  const warnings = (structural.diagnostics ?? []).filter((d) => d.severity === "warning").length;
  return {
    ok: structural.ok,
    validator_schema_version: "layer-b-pseudocode-validator.v1",
    blocks_count: blocks.length,
    contract_precision: {
      active_blocks_with_contract: withContract,
      active_blocks_missing_pre_or_post: missingPrePost,
      active_blocks_missing_failure_modes: missingFailure,
      active_blocks_missing_data_transition: missingTransition,
      active_blocks_missing_termination: missingTermination,
    },
    error_count: errors,
    warning_count: warnings,
  };
}

function mapConstraintGateErrors(
  constraint?: ConstraintSection,
): ReceiptDocument["constraint_gate_errors"] {
  if (!constraint?.diagnostics) return [];
  return constraint.diagnostics
    .filter((d) => CONSTRAINT_GATE_CODES.has(d.code))
    .map((d) => ({
      code: d.code,
      severity: d.severity,
      message: d.message,
      line: d.line,
      procedure: d.procedure,
      proven: d.code !== "CONSTRAINT_UNSUPPORTED_SYNTAX",
    }));
}

function resolveGrammarVersion(
  report: AnalysisReport,
): ReceiptSubject["grammar_version"] {
  return report.grammar_version === "pseudocode-grammar.v2"
    ? "pseudocode-grammar.v2"
    : "pseudocode-grammar.v1";
}

function resolveAnnotationProfile(
  report: AnalysisReport,
  override?: ReceiptSubject["annotation_profile"],
): ReceiptSubject["annotation_profile"] {
  if (override) return override;
  const constraint = report.sections?.constraint_language;
  if (constraint && (constraint.refinements_checked ?? 0) > 0) {
    return "constraint-ready-v2";
  }
  if (report.grammar_version === "pseudocode-grammar.v2") return "header-only-v2";
  return "legacy-v1";
}

export function buildConstraintMigrationReceipt(
  report: AnalysisReport,
  ctx: ReceiptBuildContext,
  profile: ReceiptAnalyzeProfile | G1AnalyzeOptions,
  projectionMeta?: ReceiptProjectionMeta,
): ReceiptDocument {
  const g1 = profile;
  const constraint = report.sections?.constraint_language;
  const solverTruncated = constraint?.solver_metadata?.solver_truncation === true;
  const analysisTruncated = report.truncated === true;
  const diagnosticsTruncated = report.diagnostics_truncated === true;
  const unknownSummary = aggregateUnknownSummary(report, constraint, solverTruncated);

  let layerCOk = report.ok === true;
  if (analysisTruncated || diagnosticsTruncated) layerCOk = false;

  const diagnostics = report.diagnostics ?? [];
  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;
  const infoCount = diagnostics.filter((d) => d.severity === "info").length;

  const truncationCause = solverTruncated
    ? constraint?.solver_metadata?.truncation_cause ?? "solver_truncation"
    : "none";

  const rawBudgets = constraint?.solver_metadata?.budgets_applied;
  const budgets =
    rawBudgets &&
    rawBudgets.max_solver_steps !== undefined &&
    rawBudgets.max_summary_depth !== undefined &&
    rawBudgets.max_predicate_nodes !== undefined
      ? {
          max_solver_steps: rawBudgets.max_solver_steps,
          max_summary_depth: rawBudgets.max_summary_depth,
          max_predicate_nodes: rawBudgets.max_predicate_nodes,
        }
      : undefined;

  const receipt: ReceiptDocument = {
    $schema: RECEIPT_SCHEMA_REF,
    receipt_meta: {
      schema_version: 1,
      receipt_id: randomUUID(),
      generated_at: new Date().toISOString(),
      gate_stage: ctx.gate_stage ?? "G1",
      program_gate_policy: ctx.program_gate_policy ?? "advisory",
    },
    pin: {
      methodology_pin: METHODOLOGY_PIN_LABEL,
      analyzer_build_identity: analyzerBuildIdentity(),
      manifest_entry_id: ctx.manifest_entry_id,
    },
    subject: {
      sidecar_path: repoRelativeSidecarPath(ctx.sidecar_path),
      ...(IMPL_TOKEN_PATTERN.test(ctx.impl_token) ? { impl_token: ctx.impl_token } : {}),
      input_identity: report.input_identity ?? {
        algorithm: "sha256",
        hash: createHash("sha256").update("").digest("hex"),
        byte_length: 0,
      },
      grammar_version: resolveGrammarVersion(report),
      annotation_profile: resolveAnnotationProfile(report, ctx.annotation_profile),
    },
    layer_a: {
      applicable: ctx.layer_a_applicable ?? false,
      ok: true,
      notes: ctx.layer_a_applicable
        ? undefined
        : "Layer A skipped for qualification harness receipt (read-only analyze).",
    },
    layer_b: buildLayerB(report.sections?.structural_compat),
    layer_c: {
      gate_mode: g1.gate_mode,
      typed_flow: g1.typed_flow,
      constraint_flow: g1.constraint_flow,
      constraint_gate_errors_policy: g1.constraint_gate_errors ? "blocking" : "advisory",
      ok: layerCOk,
      analysis_truncated: analysisTruncated,
      diagnostics_truncated: diagnosticsTruncated,
      error_count: errorCount,
      warning_count: warningCount,
      info_count: infoCount,
      procedure_count: report.sections?.parse?.procedure_count,
      source_report_schema: "pseudocode-analysis-report.v1",
    },
    constraint: {
      ran: g1.constraint_flow && constraint !== undefined,
      procedures_analyzed: constraint?.procedures_analyzed ?? 0,
      refinements_checked: constraint?.refinements_checked ?? 0,
      refinements_proven: constraint?.refinements_proven ?? 0,
      alias_mut_checked: constraint?.alias_mut_checked ?? 0,
      alias_mut_violations: constraint?.alias_mut_violations ?? 0,
      interproc_enabled: constraint?.interproc_enabled,
      budgets_applied: budgets,
      solver_truncated: solverTruncated,
      solver_truncation_cause: truncationCause,
      alias_analysis_truncated: (constraint?.unknowns ?? []).some((u) =>
        (u.cause ?? "").includes("alias"),
      ),
      budget_exceeded: analysisTruncated || report.diagnostics?.some((d) => d.code === "budget_exceeded") === true,
      constraint_diagnostics_truncated: diagnosticsTruncated && g1.constraint_flow,
      solver_steps_used: constraint?.solver_metadata?.solver_steps,
      summary_depth_used: constraint?.solver_metadata?.summary_depth,
    },
    unknown_summary: unknownSummary,
    constraint_gate_errors: mapConstraintGateErrors(constraint),
    promotion_readiness: {
      qualification_green: ctx.promotion_readiness?.qualification_green ?? false,
      f11_pass: false,
      fp_within_threshold: false,
      as_of_phase: ctx.promotion_readiness?.as_of_phase ?? "P2-F-harness",
    },
  };
  const notes: string[] = [];
  if (projectionMeta?.simulated_gate) {
    notes.push(`simulated_gate=${projectionMeta.simulated_gate}`);
  }
  if (ctx.collector_notes) notes.push(ctx.collector_notes);
  if (notes.length > 0) receipt.collector_notes = notes.join("; ");
  return receipt;
}

export function manifestEntryToReceiptContext(entry: ManifestEntry): ReceiptBuildContext {
  return {
    manifest_entry_id: entry.id,
    sidecar_path: entry.sidecar_path,
    impl_token: entry.token,
    layer_a_applicable: entry.client_id === "stdd",
  };
}

export const DEFAULT_G1_OPTIONS: G1AnalyzeOptions = {
  gate_mode: true,
  typed_flow: true,
  constraint_flow: true,
  constraint_gate_errors: false,
  include_structural_compat: true,
};

/** G2 pilot — verification-blocking simulation (constraint_gate_errors true). */
export const DEFAULT_G2_PILOT_VERIFICATION_BLOCKING: ReceiptAnalyzeProfile = {
  gate_mode: true,
  typed_flow: true,
  constraint_flow: true,
  constraint_gate_errors: true,
  include_structural_compat: true,
};

/** G2 pilot — advisory constraint_gate_errors (rollback restore path). */
export const DEFAULT_G2_PILOT_ADVISORY: ReceiptAnalyzeProfile = {
  gate_mode: true,
  typed_flow: true,
  constraint_flow: true,
  constraint_gate_errors: false,
  include_structural_compat: true,
};

export function pilotReceiptContext(
  sidecar_path: string,
  impl_token: string,
  opts?: Partial<ReceiptBuildContext>,
): ReceiptBuildContext {
  return {
    sidecar_path,
    impl_token,
    gate_stage: "G2",
    program_gate_policy: "advisory",
    promotion_readiness: { as_of_phase: "P3-E-pilot" },
    ...opts,
  };
}

/** G3 fleet orchestrator — program advisory; layer_c constraint_flow + typed_flow. */
export const DEFAULT_G3_FLEET_OPTIONS: ReceiptAnalyzeProfile = {
  gate_mode: true,
  typed_flow: true,
  constraint_flow: true,
  constraint_gate_errors: false,
  include_structural_compat: true,
};

export function fleetReceiptContext(
  sidecar_path: string,
  impl_token: string,
  opts?: Partial<ReceiptBuildContext>,
): ReceiptBuildContext {
  return {
    sidecar_path,
    impl_token,
    gate_stage: "G3",
    program_gate_policy: "advisory",
    layer_a_applicable: true,
    promotion_readiness: { as_of_phase: "P4-E-fleet-g3" },
    ...opts,
  };
}
