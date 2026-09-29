/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * BIND_LIVE_EXECUTOR_CLAUDE composition with mocked Claude launch boundary.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { bindLiveExecutorDriver } from "./live-driver-bind.js";
import { claudeFixturesDirFromModule } from "./paths.js";

function readClaudeFixture(name: string): string {
  const p = path.join(claudeFixturesDirFromModule(import.meta.url), name);
  return fs.readFileSync(p, "utf8");
}

describe("BIND_LIVE_EXECUTOR_CLAUDE [REQ-TIED_CLAUDE_LIVE_DRIVER]", () => {
  it("routes harness=claude to Claude driver with mocked launch_fn", async () => {
    const stdout = readClaudeFixture("stream-session-id.ndjson");
    const binding = bindLiveExecutorDriver({
      harnessProfile: "claude",
      agentPath: "",
      claudeLaunchFn: () => ({ stdout, exitCode: 0 }),
      claudeLaunchFnIsTestDouble: true,
    });
    assert.equal(binding.driverKind, "claude");
    const { result, exitCode } = await binding.runTurn(["claude", "--print"], []);
    assert.equal(exitCode, 0);
    assert.equal(result.sessionId, "claude-fixture-session-abc123");
  });

  it("G4: Claude binding forwards jevToolGate to default collect launch", async () => {
    const prevOk = process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    process.env.AGENTSTREAM_CLAUDE_LIVE_OK = "1";
    const scriptPath = path.join(os.tmpdir(), `bind-claude-gate-${Date.now()}.js`);
    fs.writeFileSync(
      scriptPath,
      `#!/usr/bin/env node
console.log(JSON.stringify({ type: "system", subtype: "init", session_id: "bind-claude-gate" }));
console.log(JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", name: "Shell", input: { command: "echo x" } }] } }));
console.log(JSON.stringify({ type: "result", subtype: "success", is_error: false }));
`,
      { mode: 0o755 },
    );
    const binding = bindLiveExecutorDriver({
      harnessProfile: "claude",
      agentPath: process.execPath,
      jevToolGate: {
        goal: "g",
        evaluate: async () => ({ decision: "block", reason: "bind_mock" }),
      },
    });
    const out = await binding.runTurn([process.execPath, scriptPath], []);
    fs.unlinkSync(scriptPath);
    if (prevOk === undefined) {
      delete process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    } else {
      process.env.AGENTSTREAM_CLAUDE_LIVE_OK = prevOk;
    }
    assert.equal(out.exitCode, 1);
    assert.match(out.jevGateStderr ?? "", /decision=block/);
  });

  it("keeps cursor binding when harness=cursor even if agent_path is claude", async () => {
    const binding = bindLiveExecutorDriver({
      harnessProfile: "cursor",
      agentPath: "claude",
    });
    assert.equal(binding.driverKind, "cursor");
  });
});
