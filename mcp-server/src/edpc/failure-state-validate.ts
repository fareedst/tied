/**
 * [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

import type { EvidenceAccessMatrix, ProductionTouch } from "./types.js";

export const HEALTH_CLASSIFICATIONS = [
  "healthy_within_observed_scope",
  "degraded",
  "failing",
  "masked_compensated",
  "suspected",
  "unknown",
] as const;

export type HealthClassification = (typeof HEALTH_CLASSIFICATIONS)[number];

export type ObservationWindow = {
  start?: string;
  end?: string;
  timezone?: string;
  environment?: string;
};

export type HealthSnapshotRow = {
  outcome_id?: string;
  classification?: string;
  evidence_ids?: string[];
  claim_class?: string;
  evidence_source?: string;
};

export type OperationalFailureStateBundle = {
  schema_version?: string;
  bundle_path?: string;
  observation_window?: ObservationWindow;
  health_snapshot?: { rows?: HealthSnapshotRow[] };
  blind_spot_gaps?: string[];
  summary_healthy?: boolean;
};

export type EdpcCharterCriticalOutcomes = {
  critical_outcomes?: Array<string | { id?: string; outcome_id?: string }>;
};

const OBSERVATION_WINDOW_FIELDS = ["start", "end", "timezone", "environment"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeOutcomeIds(charter: EdpcCharterCriticalOutcomes): string[] {
  const raw = charter.critical_outcomes ?? [];
  const ids: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) ids.push(item.trim());
    else if (isRecord(item)) {
      const id = item.id ?? item.outcome_id;
      if (typeof id === "string" && id.trim()) ids.push(id.trim());
    }
  }
  return ids;
}

function productionTouch(matrix: EvidenceAccessMatrix): ProductionTouch {
  return matrix.production_touch ?? "none";
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION] — observation window required fields (EDPC principle 7).
export function assertObservationWindow(window: ObservationWindow | undefined): string[] {
  const diagnostics: string[] = [];
  if (!window || !isRecord(window)) {
    diagnostics.push("missing_observation_window");
    return diagnostics;
  }
  for (const field of OBSERVATION_WINDOW_FIELDS) {
    const value = window[field];
    if (typeof value !== "string" || !value.trim()) {
      diagnostics.push(`missing_observation_window_field:${field}`);
    }
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION]
export function assertClassificationRules(
  snapshot: { rows?: HealthSnapshotRow[] } | undefined,
  accessMatrix: EvidenceAccessMatrix,
): string[] {
  const diagnostics: string[] = [];
  const rows = snapshot?.rows;
  if (!Array.isArray(rows)) {
    diagnostics.push("invalid_health_snapshot");
    return diagnostics;
  }
  const touch = productionTouch(accessMatrix);
  const allowed = new Set<string>(HEALTH_CLASSIFICATIONS);
  for (const row of rows) {
    const classification = row.classification?.trim();
    if (!classification || !allowed.has(classification)) {
      diagnostics.push("invalid_classification");
      continue;
    }
    if (classification === "healthy_within_observed_scope") {
      const evidenceIds = row.evidence_ids ?? [];
      if (!Array.isArray(evidenceIds) || evidenceIds.length === 0) {
        diagnostics.push("health_evidence_required");
      }
    }
    if (
      row.claim_class === "Observed" &&
      row.evidence_source === "production" &&
      touch === "none"
    ) {
      diagnostics.push("forbidden_prod_observed");
    }
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
export function assertCriticalOutcomeCoverage(
  charter: EdpcCharterCriticalOutcomes,
  bundle: OperationalFailureStateBundle,
): { diagnostics: string[]; coverage_gaps: string[] } {
  const diagnostics: string[] = [];
  const coverage_gaps: string[] = [];
  const required = normalizeOutcomeIds(charter);
  if (required.length === 0) return { diagnostics, coverage_gaps };

  const rowIds = new Set(
    (bundle.health_snapshot?.rows ?? [])
      .map((r) => r.outcome_id?.trim())
      .filter((id): id is string => Boolean(id)),
  );
  const blindSpots = new Set(
    (bundle.blind_spot_gaps ?? [])
      .map((g) => g.replace(/^blind_spot:/, "").trim())
      .filter(Boolean),
  );

  for (const outcomeId of required) {
    if (rowIds.has(outcomeId) || blindSpots.has(outcomeId)) continue;
    coverage_gaps.push(`blind_spot:${outcomeId}`);
  }
  if (coverage_gaps.length > 0) {
    diagnostics.push("critical_outcome_uncovered");
  }
  return { diagnostics, coverage_gaps };
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION] — SC-EDPC-D-NO-BLANKET-HEALTH
export function assertNoBlanketHealthy(bundle: OperationalFailureStateBundle): string[] {
  const diagnostics: string[] = [];
  if (bundle.summary_healthy !== true) return diagnostics;
  const rows = bundle.health_snapshot?.rows ?? [];
  const hasHealthyRow = rows.some(
    (r) =>
      r.classification === "healthy_within_observed_scope" &&
      Array.isArray(r.evidence_ids) &&
      r.evidence_ids.length > 0,
  );
  if (!hasHealthyRow) diagnostics.push("blanket_health");
  return diagnostics;
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
export function validateEdpcFailureState(input: {
  charter: EdpcCharterCriticalOutcomes;
  access_matrix: EvidenceAccessMatrix;
  ofsm_bundle: OperationalFailureStateBundle;
}): {
  ok: boolean;
  diagnostics: string[];
  coverage_gaps: string[];
  normalized_bundle?: Record<string, unknown>;
} {
  const diagnostics: string[] = [];
  const bundle = input.ofsm_bundle;
  if (!isRecord(bundle)) {
    return { ok: false, diagnostics: ["invalid_bundle"], coverage_gaps: [] };
  }
  if (bundle.schema_version && bundle.schema_version !== "operational-failure-state-bundle.v1") {
    diagnostics.push("invalid_bundle_schema");
  }

  diagnostics.push(...assertObservationWindow(bundle.observation_window));
  diagnostics.push(...assertClassificationRules(bundle.health_snapshot, input.access_matrix));
  diagnostics.push(...assertNoBlanketHealthy(bundle));

  const coverage = assertCriticalOutcomeCoverage(input.charter, bundle);
  diagnostics.push(...coverage.diagnostics);

  const normalized_bundle: Record<string, unknown> = {
    blind_spot_gaps: [...(bundle.blind_spot_gaps ?? [])].sort(),
    bundle_path: bundle.bundle_path ?? null,
    coverage_gaps: [...coverage.coverage_gaps].sort(),
    health_snapshot: bundle.health_snapshot ?? { rows: [] },
    observation_window: bundle.observation_window ?? {},
    schema_version: bundle.schema_version ?? "operational-failure-state-bundle.v1",
    summary_healthy: bundle.summary_healthy ?? false,
  };

  const uniqueDiagnostics = [...new Set(diagnostics)].sort();
  return {
    ok: uniqueDiagnostics.length === 0,
    diagnostics: uniqueDiagnostics,
    coverage_gaps: coverage.coverage_gaps,
    normalized_bundle,
  };
}

/** Publish-facing gap prefixes for OFSM coverage and blanket health. */
export function ofsmPublishGaps(input: {
  charter: EdpcCharterCriticalOutcomes;
  bundle?: OperationalFailureStateBundle | null;
  validation?: ReturnType<typeof validateEdpcFailureState>;
}): string[] {
  const gaps: string[] = [];
  const bundle = input.bundle;
  if (!bundle) {
    gaps.push("ofsm:bundle_missing");
    return gaps.sort();
  }
  const validation =
    input.validation ??
    validateEdpcFailureState({
      charter: input.charter,
      access_matrix: { evidence_access_tier: "toolchain_readonly", production_touch: "none" },
      ofsm_bundle: bundle,
    });
  for (const g of validation.coverage_gaps) {
    gaps.push(`ofsm:${g}`);
  }
  if (validation.diagnostics.includes("blanket_health")) {
    gaps.push("health:blanket_summary");
  }
  if (bundle.summary_healthy === true && !validation.diagnostics.includes("blanket_health")) {
    const rows = bundle.health_snapshot?.rows ?? [];
    const evidenced = rows.some(
      (r) =>
        r.classification === "healthy_within_observed_scope" &&
        Array.isArray(r.evidence_ids) &&
        r.evidence_ids.length > 0,
    );
    if (!evidenced) gaps.push("health:summary_without_row_evidence");
  }
  return [...new Set(gaps)].sort();
}
