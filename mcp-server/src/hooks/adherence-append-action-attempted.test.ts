import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, beforeEach, afterEach } from "node:test";

import { callAdherenceAppendActionAttempted } from "./adherence-append-action-attempted.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
describe("adherence append action attempted TS bridge [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  let tmpDir: string;
  let workspace: string;
  const token = "REQ-BRIDGE-TEST";
  let ledger: string;
  let markerPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "adherence-bridge-ts-"));
    workspace = path.join(tmpDir, "repo");
    ledger = path.join(workspace, "working", token, "adherence", "events.jsonl");
    markerPath = path.join(workspace, "working", token, "adherence", "active-turn.json");
    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    fs.writeFileSync(
      markerPath,
      `${JSON.stringify({
        schema_version: "active-turn-marker.v1",
        request_token: token,
        run_id: "run-bridge",
        turn_index: 1,
        step_slug: "step-one",
        instruction_nonce: "run-bridge:1:abc",
        instruction_hash: "sha256:abc",
        adherence_ledger_path: ledger,
        workspace_root: workspace,
        source_revision: "deadbeef",
        written_at: "2026-08-25T18:00:00Z",
      })}\n`,
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("appends when marker present", () => {
    callAdherenceAppendActionAttempted(
      {
        hook_event_name: "postToolUse",
        workspace_roots: [workspace],
        normalized: {
          details: {
            tool_name: "Shell",
            tool_use_id: "tool-1",
          },
        },
      },
      { hookLogPath: "/tmp/hook.yaml", hookLogLine: 7 },
    );

    const lines = fs.readFileSync(ledger, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const row = JSON.parse(lines[0]!) as Record<string, unknown>;
    assert.equal(row["event_class"], "action_attempted");
    assert.deepEqual(row["evidence_refs"], ["tool:Shell"]);
    assert.deepEqual(row["hook_log_ref"], { path: "/tmp/hook.yaml", line: 7 });
    assert.ok(!JSON.stringify(row).includes("tool_input"));
  });

  it("silent when marker absent", () => {
    fs.rmSync(markerPath);
    callAdherenceAppendActionAttempted(
      {
        hook_event_name: "postToolUse",
        workspace_roots: [workspace],
        normalized: { details: { tool_name: "Shell" } },
      },
      { hookLogPath: "/tmp/hook.yaml", hookLogLine: 1 },
    );
    assert.equal(fs.existsSync(ledger), false);
  });
});
