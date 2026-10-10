import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allTools } from "../tools/index.js";
import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "../methodology-learning-experiment/constants.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("tied_methodology_production_system_enrollment_validate MCP [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]", () => {
  it("enrolls prompt_type_workflow with leaf surface_ref", async () => {
    const result = await toolHandler("tied_methodology_production_system_enrollment_validate")({
      record: {
        schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
        experiment_id: "mle-w5-mcp-pt",
        production_system_surface: "prompt_type_workflow",
        surface_ref: "build-plan",
        methodology_hypothesis: "H",
        proof_boundary: "P",
        privacy_tier: "operator_local",
      },
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      enrollment_disposition?: string;
    };
    assert.equal(payload.ok, true);
    assert.equal(payload.enrollment_disposition, "enrolled");
  });
});
