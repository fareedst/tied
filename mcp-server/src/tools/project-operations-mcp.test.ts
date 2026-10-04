import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

// [IMPL-TIED_PROJECT_LINT] [IMPL-TIED_GIT_HYGIENE] [IMPL-TIED_SPONSOR_QUESTIONS] — How: composition registration and JSON handlers.
describe("project operations MCP composition", () => {
  it("registers tied_project_lint, tied_git_hygiene, tied_sponsor_questions", () => {
    for (const name of ["tied_project_lint", "tied_git_hygiene", "tied_sponsor_questions"]) {
      assert.ok(allTools.some((t) => t.name === name), name);
    }
  });

  it("tied_project_lint returns structured lint payload", async () => {
    const result = await toolHandler("tied_project_lint")({});
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as { base_path?: string };
    assert.ok(payload.base_path?.includes("tied-project"));
  });

  it("tied_git_hygiene preview mode does not require apply", async () => {
    const result = await toolHandler("tied_git_hygiene")({ context_mode: "agent_preview" });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as { mode?: string };
    assert.equal(payload.mode, "preview");
  });

  it("tied_sponsor_questions returns questions array", async () => {
    const result = await toolHandler("tied_sponsor_questions")({
      pending_decisions: [{ description: "Minor copy tweak" }],
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as { questions?: unknown[] };
    assert.ok(Array.isArray(payload.questions));
  });
});
