import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
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
  "../../test/fixtures/source-graph/mini-repo",
);

describe("tied_source_graph_* MCP [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]", () => {
  it("registers refresh and returns receipt with map", async () => {
    const result = await handler("tied_source_graph_refresh")({ repo_root: fixtureRoot });
    const value = body(result) as { ok?: boolean; schema_version?: string; map?: unknown };
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "source-graph-receipt.v1");
    assert.ok(value.map);
  });

  it("does not mutate tied-project requirements index mtime", async () => {
    const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
    const requirementsPath = path.join(repoRoot, "tied-project/requirements.yaml");
    const before = await stat(requirementsPath);
    await handler("tied_source_graph_map")({ repo_root: fixtureRoot });
    const after = await stat(requirementsPath);
    assert.equal(after.mtimeMs, before.mtimeMs);
  });
});
