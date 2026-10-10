import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";

import { allTools } from "../tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

const tiedBase = path.resolve(import.meta.dirname, "../../../tied-project");

describe("tied_methodology_conformance_effectiveness_pair MCP", () => {
  it("returns paired for demo experiment with conformance refs", async () => {
    const result = await toolHandler("tied_methodology_conformance_effectiveness_pair")({
      experiment_id: "mle-demo-20261010-001",
      conformance_evidence_refs: [
        { kind: "gate_receipt", path: "tied-project/working/REQ-METHODOLOGY-LEARNING-EXPERIMENT/evidence/pre_implementation-gate-result.json" },
      ],
      base_path: tiedBase,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      disposition?: string;
      ok?: boolean;
    };
    assert.equal(payload.disposition, "paired");
    assert.equal(payload.ok, true);
  });
});
