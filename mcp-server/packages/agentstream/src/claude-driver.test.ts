/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * CLAUDE_AGENT_DRIVER unit tests with test-double launch_fn.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  claudeAgentDriverLaunchAndParse,
  DEFAULT_CLAUDE_PINNED_CONTRACT,
} from "./claude-driver.js";
import { claudeFixturesDirFromModule } from "./paths.js";

function readClaudeFixture(name: string): string {
  const p = path.join(claudeFixturesDirFromModule(import.meta.url), name);
  return fs.readFileSync(p, "utf8");
}

describe("CLAUDE_AGENT_DRIVER [REQ-TIED_CLAUDE_LIVE_DRIVER]", () => {
  it("builds shared receipt from session oracle via launch_fn double", async () => {
    const stdout = readClaudeFixture("stream-session-id.ndjson");
    const out = await claudeAgentDriverLaunchAndParse({
      turnSpec: { requiresSession: true },
      launchFn: () => ({ stdout, exitCode: 0 }),
      pinnedContract: DEFAULT_CLAUDE_PINNED_CONTRACT,
      launchFnIsTestDouble: true,
    });
    assert.ok(!("error" in out));
    assert.equal(out.receipt.harness, "claude");
    assert.equal(out.sessionId, "claude-fixture-session-abc123");
    assert.equal(out.receipt.cliVersion, "synthetic-v1");
    assert.match(out.runResult.finalText, /Session-bound/);
  });

  it("returns LIVE_WITHOUT_FIXTURE_PARITY without gates or test double", async () => {
    const stdout = readClaudeFixture("stream-assistant-basic.ndjson");
    const out = await claudeAgentDriverLaunchAndParse({
      turnSpec: { requiresSession: false },
      launchFn: () => ({ stdout, exitCode: 0 }),
      pinnedContract: DEFAULT_CLAUDE_PINNED_CONTRACT,
      fixtureGatesPassed: false,
      launchFnIsTestDouble: false,
    });
    assert.deepEqual(out, { error: "LIVE_WITHOUT_FIXTURE_PARITY" });
  });
});
