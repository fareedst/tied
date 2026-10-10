/**
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT] MCP composition
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "./constants.js";
import { allTools } from "../tools/index.js";

function handler(name: string) {
  const found = allTools.find((t) => t.name === name);
  assert.ok(found, `missing tool ${name}`);
  return found.handler;
}

describe("methodology learning experiment MCP [REQ-METHODOLOGY-LEARNING-EXPERIMENT]", () => {
  it("registers validate, upsert, list tools", () => {
    const names = allTools.map((t) => t.name);
    assert.ok(names.includes("tied_methodology_learning_experiment_validate"));
    assert.ok(names.includes("tied_methodology_learning_experiment_upsert"));
    assert.ok(names.includes("tied_methodology_learning_experiment_list"));
  });

  it("upsert and list via MCP handlers", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mle-mcp-"));
    const record = {
      schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
      experiment_id: "mle-mcp-001",
      production_system_surface: "checklist_step",
      methodology_hypothesis: "MCP path works",
      proof_boundary: "Composition test",
      privacy_tier: "operator_local",
    };
    const upsert = await handler("tied_methodology_learning_experiment_upsert")({
      record,
      base_path: tmp,
    } as never);
    const upsertBody = JSON.parse(upsert.content[0].text) as { ok: boolean };
    assert.equal(upsertBody.ok, true);

    const list = await handler("tied_methodology_learning_experiment_list")({
      base_path: tmp,
    } as never);
    const listBody = JSON.parse(list.content[0].text) as {
      experiments: { experiment_id: string }[];
    };
    assert.equal(listBody.experiments.length, 1);
    assert.equal(listBody.experiments[0]?.experiment_id, "mle-mcp-001");
  });
});
