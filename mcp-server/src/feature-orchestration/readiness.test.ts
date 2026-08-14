import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FeatureStore } from "./store.js";
import { executeLifecycleCommand } from "./commands.js";
import { ClarificationStore } from "./clarification.js";

describe("PROJECT_READINESS_TO_LIFECYCLE_COMMAND REQ-FEAT_CLARIFICATION_GATES", () => {
  it("returns blockers without invoking lifecycle mutation", () => {
    // [IMPL-FEAT_CLARIFICATION_LIFECYCLE_ADAPTER] [ARCH-FEAT_READINESS_PROJECTION] [REQ-FEAT_CLARIFICATION_GATES] — Report blockers before delegating legal transitions to Batch 1.
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "readiness-"));
    const features = new FeatureStore(root);
    const created = features.createIdempotently("request-1", "Chat");
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const clarifications = new ClarificationStore(root);
    clarifications.publish("FEAT-001-chat", {
      schema_version: "clarifications.v1",
      feature_id: created.manifest.feature_id,
      revision: 1,
      clarifications: [{
        id: "CLAR-001",
        question: "Which design?",
        affected_scope: { phases: ["refining"], artifacts: ["requirements"], tokens: [] },
        blocking: "req_authoring",
        owner: "owner",
        priority: "P0",
        status: "open",
        decision: null,
        resolved_at: null,
        evidence_references: [],
        approval_references: [],
        resolution_revision: null,
      }],
    }, 0);
    const result = executeLifecycleCommand(features, {
      command: "specify",
      feature_identifier: created.manifest.feature_id,
      expected_revision: created.manifest.revision,
      command_input: { clarification_artifacts: ["requirements"] },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.current_state, "draft");
      assert.match(result.diagnostics.join(" "), /CLAR-001/);
      assert.equal(result.revision, created.manifest.revision);
    }
  });
});
