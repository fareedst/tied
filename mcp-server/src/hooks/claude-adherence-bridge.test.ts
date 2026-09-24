import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, beforeEach, afterEach } from "node:test";

import { runClaudeAdherenceBridgeFromStdin } from "./claude-adherence-bridge.js";

// [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
describe("claude adherence bridge composition [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]", () => {
  let tmpDir: string;
  let workspace: string;
  const token = "REQ-CLAUDE-BRIDGE-COMP";

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "claude-bridge-comp-"));
    workspace = path.join(tmpDir, "repo");
    const ledger = path.join(workspace, "working", token, "adherence", "events.jsonl");
    const markerPath = path.join(workspace, "working", token, "adherence", "active-turn.json");
    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    fs.writeFileSync(
      markerPath,
      `${JSON.stringify({
        schema_version: "active-turn-marker.v1",
        request_token: token,
        run_id: "run-claude-bridge",
        turn_index: 1,
        step_slug: "implement",
        instruction_nonce: "run-claude-bridge:1:xyz",
        instruction_hash: "sha256:xyz",
        adherence_ledger_path: ledger,
        workspace_root: workspace,
        source_revision: "cafebabe",
        written_at: "2026-09-24T22:00:00Z",
      })}\n`,
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("appends action_attempted from PostToolUse stdin when marker present", () => {
    const ledger = path.join(workspace, "working", token, "adherence", "events.jsonl");
    const stdinPayload = JSON.stringify({
      cwd: workspace,
      hook_event_name: "PostToolUse",
      tool_name: "Read",
      tool_input: {},
    });

    const exitCode = runClaudeAdherenceBridgeFromStdin(stdinPayload, ["--project-dir", workspace]);
    assert.equal(exitCode, 0);
    assert.ok(fs.existsSync(ledger));
    const row = JSON.parse(fs.readFileSync(ledger, "utf8").trim()) as Record<string, unknown>;
    assert.equal(row["event_class"], "action_attempted");
    const source = row["source"] as Record<string, unknown>;
    assert.equal(source["kind"], "claude_hook");
  });
});
