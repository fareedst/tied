import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  ClarificationStore,
  evaluateClarificationGate,
  normalizeClarificationSidecar,
  resolveClarification,
  type ClarificationSidecar,
} from "./clarification.js";

const leadStore = "// [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Normalize required fields and reject malformed canonical records before persistence.";
const leadGate = "// [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Classify informational and phase-blocking uncertainty without mutation.";

function sidecar(): ClarificationSidecar {
  return {
    schema_version: "clarifications.v1",
    feature_id: "FEAT-003",
    revision: 1,
    clarifications: [
      {
        id: "CLAR-002",
        question: "Which owner approves the API shape?",
        affected_scope: { phases: ["specified"], artifacts: ["architecture"], tokens: [] },
        blocking: "arch_impl_authoring",
        owner: "architect",
        priority: "P1",
        status: "open",
        decision: null,
        resolved_at: null,
        evidence_references: [],
        approval_references: [],
        resolution_revision: null,
      },
    ],
  };
}

describe("NORMALIZE_CLARIFICATION_SIDECAR REQ-FEAT_CLARIFICATION_RECORDS", () => {
  it("normalizes canonical records and rejects view markers", () => {
    // [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Normalize required fields and reject malformed canonical records before persistence.
    const result = normalizeClarificationSidecar(sidecar());
    assert.equal(result.ok, true);
    const markerResult = normalizeClarificationSidecar({ ...sidecar(), clarifications: [{ ...sidecar().clarifications[0], marker: "[NEEDS_CLARIFICATION]" }] });
    assert.equal(markerResult.ok, false);
    if (!markerResult.ok) assert.equal(markerResult.error, "INVALID_RECORD");
    assert.equal(leadStore.includes("IMPL-FEAT_CLARIFICATION_STORE"), true);
  });

  it("requires ownership and durable resolution evidence", () => {
    const result = resolveClarification(sidecar().clarifications[0], "other", 2, "decided", [], []);
    assert.deepEqual(result, { ok: false, error: "UNAUTHORIZED_RESOLUTION" });
    const accepted = resolveClarification(sidecar().clarifications[0], "architect", 2, "decided", ["evidence-1"], []);
    assert.equal(accepted.ok, true);
  });
});

describe("PUBLISH_CLARIFICATION_SIDECAR REQ-FEAT_CLARIFICATION_RECORDS", () => {
  it("publishes atomically and rejects stale writers", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "clarification-store-"));
    const store = new ClarificationStore(root);
    store.publish("FEAT-003-chat", sidecar(), 0);
    assert.throws(() => store.publish("FEAT-003-chat", sidecar(), 0), /STALE_REVISION/);
    assert.equal(store.read("FEAT-003-chat").revision, 1);
  });
});

describe("EVALUATE_CLARIFICATION_GATE REQ-FEAT_CLARIFICATION_GATES", () => {
  it("blocks only intersecting open or stale classified uncertainty", () => {
    // [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Classify informational and phase-blocking uncertainty without mutation.
    const input = sidecar();
    input.clarifications.push({
      ...input.clarifications[0],
      id: "CLAR-001",
      blocking: "informational",
      affected_scope: { phases: ["specified"], artifacts: ["requirements"], tokens: [] },
    });
    const result = evaluateClarificationGate(2, input, "specified", ["architecture"]);
    assert.equal(result.ready, false);
    assert.deepEqual(result.blockers.map((item) => item.id), ["CLAR-002"]);
    assert.equal(leadGate.includes("REQ-FEAT_CLARIFICATION_GATES"), true);
  });

  it("marks an affected resolved decision stale after revision", () => {
    const input = sidecar();
    input.clarifications[0].status = "resolved";
    input.clarifications[0].decision = "approved";
    input.clarifications[0].resolved_at = "2026-08-13T00:00:00.000Z";
    input.clarifications[0].resolution_revision = 1;
    const result = evaluateClarificationGate(2, input, "specified", ["architecture"]);
    assert.equal(result.blockers[0].status, "stale");
  });
});
