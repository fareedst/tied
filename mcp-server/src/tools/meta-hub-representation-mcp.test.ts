import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("meta-hub representation MCP [REQ-TIED_META_HUB_REPRESENTATION]", () => {
  it("registers tied_citdp_reconcile_run and tied_corpus_map_build", () => {
    for (const name of ["tied_citdp_reconcile_run", "tied_corpus_map_build"]) {
      assert.ok(allTools.some((t) => t.name === name), name);
    }
  });

  it("tied_citdp_reconcile_run dry-run returns ledger", async () => {
    const result = await toolHandler("tied_citdp_reconcile_run")({ dry_run: true });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ledger?: { row_count?: number };
    };
    assert.ok((payload.ledger?.row_count ?? 0) >= 35);
  });
});
