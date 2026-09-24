import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { normalizeClaudeHookStdin } from "./claude-adherence-normalize.js";

const FIXTURE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/claude/hooks",
);

function loadFixture(name: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8"));
}

// [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
describe("normalizeClaudeHookStdin [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]", () => {
  it("maps Bash PostToolUse to afterShellExecution", () => {
    const record = normalizeClaudeHookStdin(loadFixture("post-tool-use-bash.json"));
    assert.equal(record["hook_event_name"], "afterShellExecution");
    assert.equal(record["adherence_source"], "claude_hook");
    assert.deepEqual(record["workspace_roots"], ["/tmp/tied-claude-hook-fixture"]);
    const details = (record["normalized"] as Record<string, unknown>)["details"] as Record<string, unknown>;
    assert.equal(details["command"], "npm test --silent");
  });

  it("maps generic tool to postToolUse", () => {
    const record = normalizeClaudeHookStdin(loadFixture("post-tool-use-read.json"));
    assert.equal(record["hook_event_name"], "postToolUse");
    const details = (record["normalized"] as Record<string, unknown>)["details"] as Record<string, unknown>;
    assert.equal(details["tool_name"], "Read");
  });

  it("maps mcp__ tool to afterMCPExecution", () => {
    const record = normalizeClaudeHookStdin(loadFixture("post-tool-use-mcp.json"));
    assert.equal(record["hook_event_name"], "afterMCPExecution");
    const original = record["original"] as Record<string, unknown>;
    assert.equal(original["mcp_server"], "tied-yaml");
    const details = (record["normalized"] as Record<string, unknown>)["details"] as Record<string, unknown>;
    assert.equal(details["tool_name"], "yaml_index_read");
  });
});
