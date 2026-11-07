/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Tool registration composition.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "./tools/index.js";
import { OPTIN_TOOL_NAMES } from "./tool-profiles.js";

describe("server_info MCP registration [REQ-MCP_SERVER_INFO]", () => {
  it("is registered in allTools and not opt-in", () => {
    const tool = allTools.find((t) => t.name === "server_info");
    assert.ok(tool);
    assert.equal(OPTIN_TOOL_NAMES.has("server_info"), false);
    assert.equal(tool!.config.annotations?.readOnlyHint, true);
    assert.equal(tool!.config.annotations?.destructiveHint, false);
    assert.ok(tool!.config.outputSchema);
  });
});
