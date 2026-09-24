/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * BIND_LIVE_EXECUTOR_CLAUDE composition with mocked Claude launch boundary.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
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

  it("keeps cursor binding when harness=cursor even if agent_path is claude", async () => {
    const binding = bindLiveExecutorDriver({
      harnessProfile: "cursor",
      agentPath: "claude",
    });
    assert.equal(binding.driverKind, "cursor");
  });
});
