import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { allTools } from "../tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

describe("tied_project_size_snapshot MCP [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [REQ-TIED_PROJECT_SIZE_LAYERS] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS]", () => {
  it("registers and returns project-size-snapshot-receipt.v1", async () => {
    const result = await handler("tied_project_size_snapshot")({ repo_root: fixtureRoot });
    const value = body(result);
    assert.equal(value.schema_version, "project-size-snapshot-receipt.v1");
    assert.equal(typeof value.proof_boundary, "string");
    const layers = value.layers as Record<string, unknown>;
    assert.ok(layers.atoms);
    assert.ok(layers.operational_intent);
    assert.ok(layers.proof_facets);
    const oi = layers.operational_intent as Record<string, unknown>;
    assert.equal(typeof oi.applied_utf8_bytes, "number");
    assert.ok("operational_intent_utf8_per_atom" in (value.cross_layer as object));
  });
});
