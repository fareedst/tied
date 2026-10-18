/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "../tools/index.js";
import { FIXTURE_PRACTICES } from "../context-adaptive/fixtures.js";
import { CONTEXT_PROFILE_SCHEMA } from "../context-adaptive/constants.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("context-adaptive MCP registration", () => {
  it("registers four context_adaptive tools", () => {
    const names = new Set(allTools.map((t) => t.name));
    for (const name of [
      "context_adaptive_practice_validate",
      "context_adaptive_profile_validate",
      "context_adaptive_select_practices",
      "context_adaptive_reassess",
    ]) {
      assert.ok(names.has(name), `missing tool ${name}`);
    }
  });

  it("does not remove EASAR or checklist gate tools from catalog", () => {
    const names = new Set(allTools.map((t) => t.name));
    for (const name of [
      "tied_easar_validation_suite_run",
      "tied_checklist_gate_validate",
      "tied_methodology_learning_experiment_upsert",
    ]) {
      assert.ok(names.has(name), `expected existing tool ${name}`);
    }
  });

  it("select_practices handler returns deterministic receipt", async () => {
    const result = await toolHandler("context_adaptive_select_practices")({
      contracts: FIXTURE_PRACTICES,
      profile: {
        schema_version: CONTEXT_PROFILE_SCHEMA,
        dimensions: { criticality: "UNKNOWN" },
      },
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      receipt?: { selected_practice_ids: string[] };
    };
    assert.equal(payload.ok, true);
    assert.ok(payload.receipt?.selected_practice_ids.includes("PRACTICE-INTEGRATED-INQUIRY"));
  });
});
