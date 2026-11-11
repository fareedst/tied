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

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

describe("tied_path_declared_composition_validate MCP [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE]", () => {
  it("registers and returns path-declared-composition-validate.v1", async () => {
    const result = await handler("tied_path_declared_composition_validate")({
      repo_root: fixtureRoot,
      composition_integration_required: true,
    });
    const value = JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
    assert.equal(value.schema_version, "path-declared-composition-validate.v1");
    assert.equal(value.satisfied, true);
    assert.equal(typeof value.proof_boundary, "string");
  });
});
