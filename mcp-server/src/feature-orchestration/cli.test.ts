import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FeatureStore } from "./store.js";
import { runFeatureOrchestrator } from "./cli.js";

describe("FEATURE_ORCHESTRATOR REQ-FEAT_ORCHESTRATION_SURFACE", () => {
  it("parses a standalone lifecycle request and returns structured output", () => {
    const tiedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "feature-cli-"));
    const store = new FeatureStore(tiedRoot);
    const created = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    // [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: parse lifecycle arguments and delegate without mutating tied-cli.sh.
    const result = runFeatureOrchestrator(
      ["specify", "--feature", created.manifest.feature_id, "--revision", "1", "--tied", tiedRoot],
      store,
    );
    assert.equal(result.status, 0);
    assert.equal(result.result.ok, true);
  });

  it("rejects invalid arguments without touching repository state", () => {
    const tiedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "feature-cli-"));
    const before = fs.readdirSync(tiedRoot);
    const result = runFeatureOrchestrator(["--unknown"], new FeatureStore(tiedRoot));
    assert.equal(result.status, 2);
    assert.deepEqual(fs.readdirSync(tiedRoot), before);
  });
});
