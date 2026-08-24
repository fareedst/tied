import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [REQ-TIED_YAML_STYLE_CONFIGURATION] — MCP composition registration for styling apply tool.
describe("tied_client_yaml_styling_apply composition [REQ-TIED_YAML_STYLE_CONFIGURATION]", () => {
  it("registers the explicit client styling apply tool", () => {
    const tool = allTools.find((candidate) => candidate.name === "tied_client_yaml_styling_apply");
    assert.ok(tool, "tied_client_yaml_styling_apply must be registered");
  });

  it("returns not_configured when repository hook is absent", async () => {
    const result = await toolHandler("tied_client_yaml_styling_apply")({
      file_path: "tied/requirements.yaml",
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      styling_status?: string;
      styling?: { styling_status?: string };
    };
    assert.equal(payload.ok, true);
    assert.equal(payload.styling_status ?? payload.styling?.styling_status, "not_configured");
  });
});
