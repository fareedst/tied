import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: prove the shared read-only validator is registered and callable through MCP.
describe("tied_checklist_gate_validate composition [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("registers the shared gate and returns an allowed result", async () => {
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "close_out",
      tracker: {
        steps: [{
          slug: "traceable-commit",
          disposition: "completed",
          evidence_refs: ["checklist-gate-mcp.test.ts"],
        }],
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["missing close-out evidence"],
            falsification_questions: ["Can close-out pass without a tracker?"],
            disconfirming_observations: ["the shared gate rejects missing evidence"],
            evidence_references: ["checklist-gate-mcp.test.ts"],
          },
        },
      },
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      allowed?: boolean;
      blocking?: boolean;
    };
    assert.equal(payload.allowed, true);
    assert.equal(payload.blocking, false);
  });
});
