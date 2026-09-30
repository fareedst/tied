/**
 * [REQ-TIED_JEV_TOOL_SAFETY_GATING] tied_jev_tool_safety_evaluate composition tests
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "./index.js";
import {
  runToolSafetyDiagnostic,
  setToolSafetyEvaluateFnForTests,
} from "./tool-safety-mcp.js";

function toolHandler(name: string) {
  const tool = allTools.find((t) => t.name === name);
  assert.ok(tool, name);
  return tool.handler;
}

describe("REQ-TIED_JEV_TOOL_SAFETY_GATING MCP diagnostic", () => {
  it("registers tied_jev_tool_safety_evaluate", () => {
    assert.ok(allTools.some((t) => t.name === "tied_jev_tool_safety_evaluate"));
  });

  it("SC-D-MCP-AUTHORITY: rejects missing workspace", async () => {
    await assert.rejects(
      () =>
        runToolSafetyDiagnostic({
          tool: "bash",
          arguments: "ls",
          workspace: "",
          projectRoot: process.cwd(),
        }),
      /workspace is required/,
    );
  });

  it("SC-D-MCP-AUTHORITY: no gate allowed or gate_receipt in response", async () => {
    setToolSafetyEvaluateFnForTests(async () => ({
      decision: "block",
      risk: 0.9,
      reason: "jev_high_risk",
      jev_skipped: false,
      destructive_pattern: false,
      scope_class: "unknown",
    }));
    const out = await runToolSafetyDiagnostic({
      tool: "bash",
      arguments: "ls",
      workspace: "/tmp/ws",
      projectRoot: process.cwd(),
      env: { AGENTSTREAM_JEV_HARNESS: "1", JEV_API_KEY: "k" } as NodeJS.ProcessEnv,
    });
    assert.equal(out.decision, "block");
    assert.equal("allowed" in out, false);
    assert.equal("gate_receipt" in out, false);
    setToolSafetyEvaluateFnForTests(undefined);
  });

  it("handler returns JSON payload", async () => {
    setToolSafetyEvaluateFnForTests(async () => ({
      decision: "allow",
      risk: 0.1,
      reason: "jev_allow",
      jev_skipped: false,
      destructive_pattern: false,
    }));
    const handler = toolHandler("tied_jev_tool_safety_evaluate");
    const result = await handler({
      tool: "Shell",
      arguments: "bun test",
      workspace: "/tmp/project",
    });
    const text = result.content[0]?.text ?? "";
    const parsed = JSON.parse(text) as Record<string, unknown>;
    assert.equal(parsed.ok, true);
    assert.equal(parsed.decision, "allow");
    setToolSafetyEvaluateFnForTests(undefined);
  });
});
