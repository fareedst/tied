/**
 * [IMPL-TIED_BOUNDED_SHADOW_COMPARISON] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS, BOUNDED_PROOF_BOUNDARIES } from "./constants.js";
import {
  runShadowComparison,
  validateShadowComparisonReportShape,
} from "./shadow-comparison.js";
import type { TrajectoryManifestV1 } from "./trajectory-manifest.js";

function baseManifest(overrides: Partial<TrajectoryManifestV1> = {}): TrajectoryManifestV1 {
  return {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.trajectoryManifest,
    request_token: "REQ-TIED_BOUNDED_COMPOSITION",
    run_id: "run-1",
    run_namespace: "ns",
    budget_seed: "seed",
    adapter_id: "cursor",
    harness_id: null,
    candidate_hash: "sha256:cand-a",
    exit_code: 0,
    outcome_hash: "sha256:o1",
    tool_sequence_hashes: ["sha256:t1"],
    truncated_summary: null,
    truncated: false,
    provenance_refs: ["prov-1"],
    local_raw_refs: ["tied-bundle/working/REQ-TIED_BOUNDED_COMPOSITION/trajectories/run-1/payload.json"],
    local_raw_content_hash: "sha256:raw",
    privacy_tier: "operator_local",
    proof_boundaries: [],
    captured_at: "2026-10-18T16:00:00.000Z",
    ...overrides,
  };
}

const openBudget = {
  bounded_composition_opt_in: true,
  cost_spent_units: 1,
  cost_ceiling_max_units: 10,
};

describe("runShadowComparison [IMPL-TIED_BOUNDED_SHADOW_COMPARISON]", () => {
  const now = "2026-10-18T18:00:00.000Z";

  it("requires shadow opt-in", () => {
    const result = runShadowComparison([baseManifest()], {
      shadow_opt_in: false,
      budget: openBudget,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "OptInRequired");
  });

  it("rejects exhausted pilot budget", () => {
    const result = runShadowComparison([baseManifest()], {
      shadow_opt_in: true,
      budget: { ...openBudget, cost_spent_units: 10 },
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "BudgetExhausted");
  });

  it("anonymizes candidates deterministically and marks ties", () => {
    const a = baseManifest({ run_id: "run-a", candidate_hash: "sha256:c1", outcome_hash: "sha256:same" });
    const b = baseManifest({ run_id: "run-b", candidate_hash: "sha256:c2", outcome_hash: "sha256:same" });
    const first = runShadowComparison([a, b], {
      shadow_opt_in: true,
      budget: openBudget,
      emit_advisory_recommendation: true,
      now,
    });
    const second = runShadowComparison([a, b], {
      shadow_opt_in: true,
      budget: openBudget,
      emit_advisory_recommendation: true,
      now,
    });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(first.report.content_hash, second.report.content_hash);
    assert.equal(first.report.comparison_summary.tie, true);
    assert.equal(first.report.selection_authority, "none");
    assert.equal(first.report.gate_authority_unchanged, true);
    assert.notEqual(
      first.report.candidate_rows[0]?.anonymized_candidate_id,
      first.report.candidate_rows[0]?.source_run_id,
    );
    assert.deepEqual(first.report.proof_boundaries, [BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn]);
  });

  it("omits candidates not listed in candidate_run_ids", () => {
    const a = baseManifest({ run_id: "run-a" });
    const b = baseManifest({ run_id: "run-b", outcome_hash: "sha256:o2" });
    const result = runShadowComparison([a, b], {
      shadow_opt_in: true,
      budget: openBudget,
      candidate_run_ids: ["run-a"],
      now,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.candidate_rows.length, 1);
    assert.equal(result.report.candidate_rows[0]?.source_run_id, "run-a");
  });

  it("rejects canary secrets in bounded summary fields", () => {
    const manifest = baseManifest({
      truncated_summary: "token sk-livecanarysecret1234567890 in summary",
    });
    const result = runShadowComparison([manifest], {
      shadow_opt_in: true,
      budget: openBudget,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "RedactionFailure");
  });

  it("validateShadowComparisonReportShape rejects missing authority fields", () => {
    const shape = validateShadowComparisonReportShape({
      schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.shadowComparison,
      selection_authority: "operator",
      gate_authority_unchanged: false,
    });
    assert.equal(shape.ok, false);
  });
});
