/**
 * [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT] [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

const tiedBase = path.resolve(import.meta.dirname, "../../../tied-project");

describe("pseudocode_validate path input MCP [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]", () => {
  it("M1 sponsor JSON returns layer-b schema without input-stage -32602", async () => {
    // [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [ARCH-PSEUDOCODE_INPUT_RESOLUTION]
    const result = await handler("pseudocode_validate")({
      token: "IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK",
      gate_mode: true,
      pseudocode_path: "implementation-decisions/IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK-pseudocode.md",
    });
    const value = body(result);
    assert.notEqual(value.stage, "input");
    assert.equal(value.schema_version, "layer-b-pseudocode-validator.v1");
  });

  it("M2 inline regression unchanged", async () => {
    const result = await handler("pseudocode_validate")({
      token: "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      known_tokens: [
        "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
        "ARCH-QUALITY_ASSURANCE_PROFILES",
        "REQ-QUALITY_ASSURANCE_EVIDENCE",
      ],
      pseudocode:
        "# [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]\nprocedure RUN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n    TERMINATION: total",
    });
    const value = body(result);
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "layer-b-pseudocode-validator.v1");
  });

  it("M3 gate_mode on path input matches inline gate behavior", async () => {
    const pseudo = `# [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]\nprocedure RUN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n    TERMINATION: total\n  RETURN y`;
    const rel = "implementation-decisions/IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT-gate-fixture.md";
    const abs = path.join(tiedBase, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, pseudo, "utf8");
    const shared = {
      token: "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      known_tokens: [
        "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
        "ARCH-QUALITY_ASSURANCE_PROFILES",
        "REQ-QUALITY_ASSURANCE_EVIDENCE",
      ],
      gate_mode: true,
    };
    try {
      const fromPath = body(await handler("pseudocode_validate")({ ...shared, pseudocode_path: rel }));
      const fromInline = body(await handler("pseudocode_validate")({ ...shared, pseudocode: pseudo }));
      assert.equal(fromPath.schema_version, "layer-b-pseudocode-validator.v1");
      assert.notEqual(fromPath.stage, "input");
      assert.equal(fromPath.ok, fromInline.ok);
    } finally {
      fs.rmSync(abs, { force: true });
    }
  });
});
