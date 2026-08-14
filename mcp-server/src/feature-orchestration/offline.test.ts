import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectOfflinePath } from "./offline.js";

describe("OFFLINE_FALLBACK REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION", () => {
  it("hands off to the documented manual path when Node or MCP is unavailable", () => {
    const result = selectOfflinePath({ feature_orchestrator: false, tied_cli: false, node: false, mcp: false }, "/project");
    assert.equal(result.kind, "manual");
    assert.match(result.command, /using-tied-without-mcp\.md/);
    assert.match(result.references.join(" "), /agentstream/);
    assert.equal(result.mutated_configuration, false);
  });

  it("preserves tied-cli as an explicit advanced path", () => {
    const result = selectOfflinePath({ feature_orchestrator: false, tied_cli: true, node: true, mcp: true }, "/project");
    assert.equal(result.kind, "tied-cli");
    assert.match(result.command, /tied-cli\.sh/);
    assert.match(result.references.join(" "), /TIED YAML MCP/);
  });
});
