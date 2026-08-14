import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyAcceptedTransition, evaluateTransition } from "./lifecycle.js";
import type { FeatureManifest } from "./manifest.js";

const manifestFixture: FeatureManifest = {
  schema_version: "feature-manifest.v1",
  feature_id: "FEAT-003",
  slug: "chat-system",
  title: "Real-time chat system",
  mode: "greenfield",
  status: "draft",
  revision: 1,
  created_at: "2026-08-13T12:00:00.000Z",
  updated_at: "2026-08-13T12:00:00.000Z",
  canonical_tokens: { requirements: [], architecture: [], implementations: [] },
};

describe("LIFECYCLE_TRANSITION_MATRIX REQ-FEAT_LIFECYCLE", () => {
  // [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: encode draft → refining → specified → planned → tasked → verifying → closed and terminal abandoned.
  it("allows a legal transition and increments revision immutably", () => {
    const decision = evaluateTransition("draft", "refining", {}, {});
    assert.deepEqual(decision, { outcome: "allow", requested_phase: "refining" });
    const next = applyAcceptedTransition(manifestFixture, decision);
    assert.equal(next.ok, true);
    if (next.ok) {
      assert.equal(next.manifest.status, "refining");
      assert.equal(next.manifest.revision, 2);
      assert.equal(manifestFixture.status, "draft");
      assert.equal(manifestFixture.revision, 1);
    }
  });

  it("blocks missing evidence and rejects illegal or unknown transitions", () => {
    assert.equal(evaluateTransition("specified", "planned", {}, {}).outcome, "blocked");
    assert.equal(evaluateTransition("draft", "closed", {}, {}).outcome, "illegal_transition");
    assert.equal(evaluateTransition("unknown", "draft", {}, {}).outcome, "unknown_phase");
  });

  it("requires approval for abandonment and rejects applying non-allowed decisions", () => {
    assert.equal(evaluateTransition("draft", "abandoned", {}, {}).outcome, "approval_required");
    const result = applyAcceptedTransition(manifestFixture, { outcome: "blocked", reason: "PRECONDITION_UNMET" });
    assert.deepEqual(result, { ok: false, error: "TRANSITION_NOT_ALLOWED" });
  });
});
