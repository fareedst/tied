/**
 * Plumb audit gate:
 * - Order 2: deterministic plumb diff impact preview (git diff -> implicated tokens)
 * - Order 3: traceability gap report (token subset -> gaps in tests/production markers)
 * - Append-only audit JSONL log with pass/fail and summary references.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import {
  runPlumbDiffImpactPreview,
  type PlumbDiffImpactPreviewArgs,
  type PlumbDiffImpactPreviewReport,
} from "./plumb-diff-impact-preview.js";
import { runScopedAnalysis, type TraceabilityGapReportResult } from "./scoped-analysis.js";

export type PlumbAuditGatePolicy = "warn-only" | "strict";

export type PlumbAuditGateSource = "pre-commit" | "ci" | "manual";

export type PlumbAuditGateArgs = {
  policy?: PlumbAuditGatePolicy;
  source?: PlumbAuditGateSource;

  selection?: PlumbDiffImpactPreviewArgs["selection"];
  paths?: string[];
  include_removed?: boolean;
  max_files?: number;
  max_patch_bytes?: number;
  max_total_patch_bytes?: number;

  /**
   * Optional traceability strict mode override used only for gap report exit-policy fields.
   * Audit pass/fail is derived from the returned gap report dimensions (with strict forced true
   * by the gate by default).
   */
  traceability_strict?: boolean;

  /**
   * Optional token subset overrides for traceability_gap_report (REQ/IMPL only).
   * When undefined, gate uses tokens discovered by preview order 2.
   */
  traceability_requirement_tokens?: string[];
  traceability_implementation_tokens?: string[];

  /**
   * If true, the gate will allow commits even if policy would have blocked.
   * This is intended for "warn-only should not block" or explicit overrides.
   */
  override_applied?: boolean;

  /**
   * Append-only JSONL log path.
   * Default (relative to repo root): `plumb-audit/audit-log.jsonl`
   */
  audit_log_path?: string;

  /**
   * Commit attempt id used for rebases/amends documentation.
   * If undefined, gate generates one for every invocation.
   */
  attempt_id?: string;
};

export type PlumbAuditGateRunResult = {
  ok: boolean;
  policy: PlumbAuditGatePolicy;
  source: PlumbAuditGateSource;

  attempt_id: string;
  commit_allowed: boolean;
  blocked: boolean;

  /**
   * Pass/fail for strict traceability gap dimensions.
   * - pass=true means no enabled traceability gap dimensions reported gaps.
   * - pass=false means at least one enabled traceability dimension count > 0
   *   (req_without_test / req_without_implementation / impl_without_test).
   */
  pass: boolean;

  fail_reason?: string;
  tool_error?: { message: string };

  preview_summary_ref?: {
    id: string;
    selection: string;
    include_removed: boolean;
    touched_files_count: number;
    tokens_added_counts: { REQ: number; ARCH: number; IMPL: number };
    tokens_removed_counts: { REQ: number; ARCH: number; IMPL: number };
    implicated_counts: { requirements: number; architecture: number; implementation: number };
  };

  gap_summary_ref?: {
    id: string;
    would_fail_strict: boolean;
    suggested_exit_code: 0 | 1;
    dimensions_counts: {
      req_without_test: number;
      req_without_implementation: number;
      impl_without_test: number;
    };
    missing_registry_count: number;
  };

  /**
   * Effective roots used by gap check (order 3).
   * Kept small enough to be readable in an audit log line.
   */
  effective_roots?: {
    roots_used: string[];
    ignore_source: { type: "file" | "inline" | "file_and_inline"; path?: string };
    skipped_paths_count: number;
    followed_symlinks: boolean;
  };
};

const AUDIT_LOG_SCHEMA_VERSION = "plumb-audit-gate-log.v1";

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function stablePreviewSummaryRef(preview: PlumbDiffImpactPreviewReport): PlumbAuditGateRunResult["preview_summary_ref"] {
  const refObj = {
    schema_version: preview.schema_version,
    selection: preview.input.selection,
    paths: preview.input.paths ?? null,
    include_removed: preview.input.include_removed,
    max_files: preview.input.max_files,
    max_patch_bytes: preview.input.max_patch_bytes,
    max_total_patch_bytes: preview.input.max_total_patch_bytes,
    touched_files_count: preview.touched_files.length,
    tokens_added_counts: {
      REQ: preview.tokens_detected.added.REQ.length,
      ARCH: preview.tokens_detected.added.ARCH.length,
      IMPL: preview.tokens_detected.added.IMPL.length,
    },
    tokens_removed_counts: {
      REQ: preview.tokens_detected.removed.REQ.length,
      ARCH: preview.tokens_detected.removed.ARCH.length,
      IMPL: preview.tokens_detected.removed.IMPL.length,
    },
    implicated_counts: {
      requirements: preview.implicated.impacted_requirements.length,
      architecture: preview.implicated.impacted_architecture.length,
      implementation: preview.implicated.impacted_implementation.length,
    },
    missing_registry_count:
      preview.token_registry_checks.missing_index_records.REQ.length +
      preview.token_registry_checks.missing_index_records.ARCH.length +
      preview.token_registry_checks.missing_index_records.IMPL.length,
    missing_detail_count:
      preview.token_registry_checks.missing_detail_files.REQ.length +
      preview.token_registry_checks.missing_detail_files.ARCH.length +
      preview.token_registry_checks.missing_detail_files.IMPL.length,
  };

  const id = sha256Hex(JSON.stringify(refObj));

  return {
    id,
    selection: preview.input.selection,
    include_removed: preview.input.include_removed,
    touched_files_count: preview.touched_files.length,
    tokens_added_counts: refObj.tokens_added_counts,
    tokens_removed_counts: refObj.tokens_removed_counts,
    implicated_counts: refObj.implicated_counts,
  };
}

function stableGapSummaryRef(gap: TraceabilityGapReportResult): PlumbAuditGateRunResult["gap_summary_ref"] {
  const dimensions_counts = {
    req_without_test: gap.dimensions.req_without_test.count,
    req_without_implementation: gap.dimensions.req_without_implementation.count,
    impl_without_test: gap.dimensions.impl_without_test.count,
  };

  const refObj = {
    strict: gap.exit_policy.strict,
    would_fail_strict: gap.exit_policy.would_fail_strict,
    suggested_exit_code: gap.exit_policy.suggested_exit_code,
    dimensions_counts,
    missing_registry_count: gap.registry_gaps.missing_count,
  };

  const id = sha256Hex(JSON.stringify(refObj));

  return {
    id,
    would_fail_strict: gap.exit_policy.would_fail_strict,
    suggested_exit_code: gap.exit_policy.suggested_exit_code,
    dimensions_counts,
    missing_registry_count: gap.registry_gaps.missing_count,
  };
}

function defaultAuditLogPath(): string {
  // Repo root assumed to be the current working directory for gate usage.
  return path.resolve(process.cwd(), "plumb-audit", "audit-log.jsonl");
}

function computeAttemptId(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const pid = process.pid;
  const uuid = crypto.randomUUID();
  return `${ts}-${pid}-${uuid}`;
}

function resolveAuditLogPath(p?: string): string {
  if (!p) return defaultAuditLogPath();
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function appendJsonLine(fileAbs: string, lineObj: unknown): void {
  const dir = path.dirname(fileAbs);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(lineObj);
  fs.appendFileSync(fileAbs, `${json}\n`, { encoding: "utf8" });
}

function summarizeCommand(): { argv: string[]; cwd: string } {
  return { argv: process.argv.slice(2), cwd: process.cwd() };
}

export async function runPlumbAuditGate(args: PlumbAuditGateArgs): Promise<PlumbAuditGateRunResult> {
  const policy: PlumbAuditGatePolicy = args.policy ?? "warn-only";
  const source: PlumbAuditGateSource = args.source ?? "manual";
  const attemptId = args.attempt_id ?? computeAttemptId();
  const overrideApplied = args.override_applied ?? (process.env.PLUMB_AUDIT_GATE_OVERRIDE === "1");

  const auditLogPath = resolveAuditLogPath(args.audit_log_path);
  const command = summarizeCommand();

  let previewReport: PlumbDiffImpactPreviewReport | null = null;
  let previewRef: PlumbAuditGateRunResult["preview_summary_ref"] | undefined;
  let gapReport: TraceabilityGapReportResult | null = null;
  let gapRef: PlumbAuditGateRunResult["gap_summary_ref"] | undefined;
  let effectiveRoots: PlumbAuditGateRunResult["effective_roots"] | undefined;

  let pass = true;
  let failReason: string | undefined;
  let toolError: { message: string } | undefined;
  let commitAllowed = true;
  let blocked = false;

  try {
    const previewInput: PlumbDiffImpactPreviewArgs = {
      selection: args.selection ?? "staged",
      paths: args.paths,
      include_removed: args.include_removed ?? true,
      max_files: args.max_files ?? 200,
      max_patch_bytes: args.max_patch_bytes ?? 250_000,
      max_total_patch_bytes: args.max_total_patch_bytes ?? 2_000_000,
    };

    previewReport = runPlumbDiffImpactPreview(previewInput);
    previewRef = stablePreviewSummaryRef(previewReport);

    const reqTokens =
      args.traceability_requirement_tokens !== undefined
        ? args.traceability_requirement_tokens
        : previewReport.tokens_detected.added.REQ;

    const implTokens =
      args.traceability_implementation_tokens !== undefined
        ? args.traceability_implementation_tokens
        : previewReport.tokens_detected.added.IMPL;

    const strictForGate = args.traceability_strict ?? true;

    const gapRun = runScopedAnalysis({
      mode: "traceability_gap_report",
      traceability_strict: strictForGate,
      traceability_requirement_tokens: reqTokens,
      traceability_implementation_tokens: implTokens,
    });

    if (!gapRun.ok || !gapRun.traceability_gap_report) {
      throw new Error(gapRun.error ?? "Gap report failed without ok=true");
    }

    gapReport = gapRun.traceability_gap_report;
    gapRef = stableGapSummaryRef(gapReport);

    pass = gapReport.exit_policy.suggested_exit_code === 0;
    effectiveRoots = {
      roots_used: gapRun.summary.roots_used,
      ignore_source: gapRun.summary.ignore_source,
      skipped_paths_count: gapRun.summary.skipped_paths_count,
      followed_symlinks: gapRun.summary.followed_symlinks,
    };

    // Policy semantics:
    // - warn-only: never block even if gaps exist.
    // - strict: block when gap dimensions report failures (pass=false).
    // - override: allow commit even in strict mode (audit line still records pass/fail).
    if (policy === "warn-only") {
      commitAllowed = true;
      blocked = false;
    } else {
      blocked = !pass && !overrideApplied;
      commitAllowed = !blocked;
    }
  } catch (e) {
    pass = false;
    failReason = "tool_error";
    toolError = { message: e instanceof Error ? e.message : String(e) };

    commitAllowed = policy === "warn-only";
    blocked = policy === "strict";
  } finally {
    // Always write an audit line, even on tool errors.
    const logLine = {
      schema_version: AUDIT_LOG_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      attempt: { attempt_id: attemptId, source, policy, override_applied: overrideApplied },
      command,
      effective_roots: effectiveRoots,
      pass,
      commit_allowed: commitAllowed,
      blocked,
      fail_reason: failReason,
      tool_error: toolError,
      preview: previewRef
        ? {
            summary_ref: previewRef,
            // Minimal pointers: not full diff text.
            token_added_counts: previewRef.tokens_added_counts,
          }
        : null,
      gap: gapRef
        ? {
            summary_ref: gapRef,
          }
        : null,
    };

    try {
      appendJsonLine(auditLogPath, logLine);
    } catch (e) {
      // Never let audit logging cause the gate to block unexpectedly.
      // eslint-disable-next-line no-console
      console.warn(`DIAGNOSTIC: failed to append audit log: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    ok: pass || commitAllowed,
    policy,
    source,
    attempt_id: attemptId,
    commit_allowed: commitAllowed,
    blocked,
    pass,
    fail_reason: failReason,
    tool_error: toolError,
    preview_summary_ref: previewRef,
    gap_summary_ref: gapRef,
    effective_roots: effectiveRoots,
  };
}

