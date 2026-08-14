import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { dispatchOnboardingCommand } from "./onboarding.js";

describe("ONBOARDING_COMMANDS REQ-FEAT_ONBOARDING_COMMANDS", () => {
  it("delegates feature new to the shared feature store", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-onboarding-"));
    const result = dispatchOnboardingCommand(["feature", "new", "Count lines"], { project_root: root, capabilities: { node: true, mcp: true, feature_orchestrator: true } });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.delegate, "FeatureStore.createIdempotently");
    assert.match(result.next_action, /feature build/);
    assert.equal(fs.readdirSync(path.join(root, "tied", "features")).some((name) => name.startsWith("FEAT-001-")), true);
  });

  it("reports an actionable prerequisite instead of mutating config", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-onboarding-"));
    const result = dispatchOnboardingCommand(["init"], { project_root: root, capabilities: { node: false, mcp: false, feature_orchestrator: false } });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.diagnostics.join(" "), /using-tied-without-mcp\.md/);
    assert.equal(result.mutated_configuration, false);
  });

  it("reports offline guidance when TIED_MCP_BIN is missing", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-onboarding-"));
    const missingBin = path.join(root, "missing-mcp-server.js");
    const result = dispatchOnboardingCommand(
      ["init"],
      {
        project_root: root,
        capabilities: { node: true, mcp: true, feature_orchestrator: true, tied_cli: true },
        defaults: { mcpBin: missingBin },
      },
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.diagnostics.join(" "), /TIED_MCP_BIN/);
    assert.match(result.diagnostics.join(" "), /using-tied-without-mcp\.md/);
    assert.equal(result.mutated_configuration, false);
  });
});
