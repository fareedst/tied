/**
 * [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS] [IMPL-TIED_FILES]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allTools } from "./tools/index.js";
import {
  OPTIN_TOOL_NAMES,
  InvalidToolProfileError,
  resolveToolProfile,
  selectToolsForProfile,
} from "./tool-profiles.js";

describe("tool-profiles [REQ-MCP_USAGE_METRICS]", () => {
  it("partitions allTools into core and optin", () => {
    const core = selectToolsForProfile(allTools, "core");
    const optin = selectToolsForProfile(allTools, "optin");
    assert.equal(core.length + optin.length, allTools.length);
    assert.equal(optin.length, OPTIN_TOOL_NAMES.size);
    assert.equal(core.length, allTools.length - OPTIN_TOOL_NAMES.size);
    for (const t of optin) {
      assert.ok(OPTIN_TOOL_NAMES.has(t.name));
    }
    const coreNames = new Set(core.map((t) => t.name));
    for (const name of OPTIN_TOOL_NAMES) {
      assert.ok(allTools.some((t) => t.name === name), `missing opt-in tool ${name}`);
      assert.ok(!coreNames.has(name));
    }
  });

  it("resolveToolProfile: unset → full", () => {
    assert.equal(resolveToolProfile({}), "full");
    assert.equal(resolveToolProfile({ TIED_MCP_TOOL_PROFILE: "  " }), "full");
  });

  it("resolveToolProfile: core, optin, full", () => {
    assert.equal(resolveToolProfile({ TIED_MCP_TOOL_PROFILE: "core" }), "core");
    assert.equal(resolveToolProfile({ TIED_MCP_TOOL_PROFILE: "OPTIN" }), "optin");
    assert.equal(resolveToolProfile({ TIED_MCP_TOOL_PROFILE: "full" }), "full");
  });

  it("resolveToolProfile: invalid throws", () => {
    assert.throws(
      () => resolveToolProfile({ TIED_MCP_TOOL_PROFILE: "bogus" }),
      InvalidToolProfileError,
    );
  });

  it("selectToolsForProfile counts match plan targets", () => {
    assert.equal(selectToolsForProfile(allTools, "core").length, 93);
    assert.equal(selectToolsForProfile(allTools, "optin").length, 37);
    assert.equal(selectToolsForProfile(allTools, "full").length, 130);
  });
});
