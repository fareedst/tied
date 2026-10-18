/**
 * [IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { analyzeTrajectoryDivergence } from "./divergence-analysis.js";
import type { TrajectoryManifestV1 } from "./trajectory-manifest.js";
import { BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS, BOUNDED_PROOF_BOUNDARIES } from "./constants.js";

function baseManifest(overrides: Partial<TrajectoryManifestV1> = {}): TrajectoryManifestV1 {
  return {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.trajectoryManifest,
    request_token: "REQ-TIED_BOUNDED_COMPOSITION",
    run_id: "run-1",
    run_namespace: "ns",
    budget_seed: "seed",
    adapter_id: "cursor",
    harness_id: null,
    candidate_hash: "sha256:c1",
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

describe("analyzeTrajectoryDivergence", () => {
  const now = "2026-10-18T17:00:00.000Z";

  it("reports identical outcome and tool sequence for matching manifests", () => {
    const a = baseManifest({ run_id: "run-a" });
    const b = baseManifest({ run_id: "run-b" });
    const result = analyzeTrajectoryDivergence([a, b], { now });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const outcome = result.report.contrast_rows.find((row) => row.dimension === "outcome");
    assert.equal(outcome?.status, "identical");
    assert.equal(result.report.content_hash.length > 10, true);
    assert.deepEqual(result.report.proof_boundaries, [
      BOUNDED_PROOF_BOUNDARIES.advisoryNotGateAuthority,
    ]);
  });

  it("marks outcome divergent when hashes differ", () => {
    const a = baseManifest({ run_id: "run-a", outcome_hash: "sha256:o-a" });
    const b = baseManifest({ run_id: "run-b", outcome_hash: "sha256:o-b" });
    const result = analyzeTrajectoryDivergence([a, b], { now });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const outcome = result.report.contrast_rows.find((row) => row.dimension === "outcome");
    assert.equal(outcome?.status, "divergent");
  });

  it("marks unknown when truncated summaries present", () => {
    const a = baseManifest({ run_id: "run-a", truncated: true });
    const b = baseManifest({ run_id: "run-b" });
    const result = analyzeTrajectoryDivergence([a, b], { now });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.truncated_data_present, true);
    const order = result.report.contrast_rows.find((row) => row.dimension === "tool_sequence");
    assert.equal(order?.status, "unknown");
  });

  it("rejects request scope violation", () => {
    const a = baseManifest();
    const b = baseManifest({ request_token: "REQ-OTHER", run_id: "run-b" });
    const result = analyzeTrajectoryDivergence([a, b], { now });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "RequestScopeViolation");
  });

  it("rejects stale manifests", () => {
    const stale = baseManifest({ captured_at: "2026-01-01T00:00:00.000Z" });
    const result = analyzeTrajectoryDivergence([stale], {
      now: "2026-10-18T17:00:00.000Z",
      stale_after_ms: 86_400_000,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "StaleManifest");
  });

  it("is deterministic for identical inputs", () => {
    const a = baseManifest({ run_id: "run-a", outcome_hash: "sha256:x" });
    const b = baseManifest({ run_id: "run-b", outcome_hash: "sha256:y" });
    const first = analyzeTrajectoryDivergence([a, b], { now });
    const second = analyzeTrajectoryDivergence([a, b], { now });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(first.report.content_hash, second.report.content_hash);
  });
});
