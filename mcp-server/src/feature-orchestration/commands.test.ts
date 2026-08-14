import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FeatureStore } from "./store.js";
import { executeLifecycleCommand } from "./commands.js";

describe("ORCHESTRATION_COMMANDS REQ-FEAT_ORCHESTRATION_COMMANDS", () => {
  it("maps specify and refine to the shared lifecycle engine", () => {
    const store = new FeatureStore(fs.mkdtempSync(path.join(os.tmpdir(), "feature-commands-")));
    const created = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    // [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: map the command to a Batch 0 transition and delegate persistence.
    const result = executeLifecycleCommand(store, {
      command: "specify",
      feature_identifier: created.manifest.feature_id,
      expected_revision: 1,
      command_input: { validated: true },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.current_state, "refining");
      assert.equal(result.revision, 2);
      assert.equal(result.next_permitted_phase, "specified");
    }
  });

  it("reports deferred Batch 2 gates without implementing them", () => {
    const store = new FeatureStore(fs.mkdtempSync(path.join(os.tmpdir(), "feature-commands-")));
    const created = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const result = executeLifecycleCommand(store, {
      command: "plan",
      feature_identifier: created.manifest.feature_id,
      expected_revision: 1,
      command_input: {},
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.match(result.diagnostics.join(" "), /Batch 2|refining/);
  });
});
