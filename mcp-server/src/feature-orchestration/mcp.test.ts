import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FeatureStore } from "./store.js";
import { handleOrchestrationTool } from "./mcp.js";

describe("ORCHESTRATION_MCP REQ-FEAT_ORCHESTRATION_SURFACE", () => {
  it("creates a feature package through the shared store", async () => {
    const store = new FeatureStore(fs.mkdtempSync(path.join(os.tmpdir(), "feature-mcp-")));
    const response = await handleOrchestrationTool(
      "feature_create",
      { request_key: "request-1", title: "Chat" },
      { store },
    );
    assert.equal(response.ok, true);
    if (response.ok) assert.equal((response.manifest as { feature_id: string }).feature_id, "FEAT-001");
  });

  it("routes feature-local lifecycle requests to the shared command adapter", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "feature-mcp-"));
    const store = new FeatureStore(root);
    const created = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    // [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: route requests to shared services and preserve one canonical YAML validation path.
    const response = await handleOrchestrationTool(
      "feature_specify",
      { feature_identifier: created.manifest.feature_id, expected_revision: 1 },
      { store },
    );
    assert.equal(response.ok, true);
    assert.equal(response.current_state, "refining");
  });

  it("delegates canonical TIED operations instead of reimplementing CRUD", async () => {
    let delegated = false;
    const response = await handleOrchestrationTool(
      "feature_update_canonical",
      { token: "REQ-FEAT_STORE_PERSISTENCE", updates: { status: "Implemented" } },
      {
        store: new FeatureStore(fs.mkdtempSync(path.join(os.tmpdir(), "feature-mcp-"))),
        delegateCanonical: async () => {
          delegated = true;
          return { ok: true };
        },
      },
    );
    assert.equal(response.ok, true);
    assert.equal(delegated, true);
  });

  it("routes feature view requests to the Batch 4 projection boundary REQ-FEAT_VIEW_GENERATION", async () => {
    const response = await handleOrchestrationTool(
      "feature_view_render",
      { view_kind: "spec.md", source_input: {} },
      { store: new FeatureStore(fs.mkdtempSync(path.join(os.tmpdir(), "feature-mcp-"))) },
    );
    assert.equal(response.ok, false);
    if (!response.ok) assert.equal(response.error, "INVALID_INPUT");
  });
});
