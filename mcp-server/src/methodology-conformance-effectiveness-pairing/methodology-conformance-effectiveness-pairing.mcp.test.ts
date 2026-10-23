import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import path from "node:path";

import { allTools } from "../tools/index.js";
import {
  ensureMethodologyPairingDemoGateReceipt,
  METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH,
} from "./pairing-demo-fixture.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const tiedBase = path.join(projectRoot, "tied-project");

before(() => {
  ensureMethodologyPairingDemoGateReceipt(projectRoot);
});

describe("tied_methodology_conformance_effectiveness_pair MCP", () => {
  it("returns paired for demo experiment with conformance refs", async () => {
    const result = await toolHandler("tied_methodology_conformance_effectiveness_pair")({
      experiment_id: "mle-demo-20261010-001",
      conformance_evidence_refs: [
        { kind: "gate_receipt", path: METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH },
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
