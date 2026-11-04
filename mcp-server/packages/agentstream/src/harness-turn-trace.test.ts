/**
 * [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] Harness turn trace JSONL writer.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  HARNESS_TURN_TRACE_SCHEMA,
  appendHarnessTurnTrace,
  buildHarnessTurnTraceRecord,
  defaultHarnessTracePath,
} from "./harness-turn-trace.js";

describe("harness-turn-trace [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]", () => {
  it("writes harness-turn-trace.v1 JSONL with manifest fields", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "harness-trace-"));
    const tracePath = path.join(dir, "trace.jsonl");
    const record = buildHarnessTurnTraceRecord({
      harness: "claude",
      model: "claude-haiku-5-5",
      workspace: dir,
      turnIndex: 2,
      turnTotal: 4,
      sessionId: "sess-abc",
      exitCode: 0,
      requestToken: "REQ-AGENTSTREAM_CLAUDE_WF_PARITY",
      timestamp: "2026-11-04T00:00:00.000Z",
    });
    assert.equal(record.schema_version, HARNESS_TURN_TRACE_SCHEMA);
    appendHarnessTurnTrace(tracePath, record);
    const lines = fs.readFileSync(tracePath, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]!);
    assert.equal(parsed.turn_index, 2);
    assert.equal(parsed.harness, "claude");
    assert.equal(parsed.session_id, "sess-abc");
  });

  it("defaultHarnessTracePath uses tied-project/working/{REQ}/evidence", () => {
    const p = defaultHarnessTracePath("/repo", "REQ-TEST");
    assert.match(p, /tied-project\/working\/REQ-TEST\/evidence\/harness-turn-trace\.jsonl$/);
  });
});
