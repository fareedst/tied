/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * Unit tests: PARSE_CLAUDE_STREAM + EXTRACT_CLAUDE_SESSION against frozen oracles.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  extractClaudeSession,
  parseClaudeStream,
} from "./claude-stream.js";
import { claudeFixturesDirFromModule } from "./paths.js";

function readClaudeFixture(name: string): string {
  const p = path.join(claudeFixturesDirFromModule(import.meta.url), name);
  return fs.readFileSync(p, "utf8");
}

describe("PARSE_CLAUDE_STREAM [REQ-TIED_CLAUDE_LIVE_DRIVER]", () => {
  it("parses assistant and thinking content from stream-assistant-basic.ndjson", () => {
    const parsed = parseClaudeStream(readClaudeFixture("stream-assistant-basic.ndjson"));
    assert.ok(!("error" in parsed));
    const assistants = parsed.events.filter((e) => e.kind === "assistant");
    assert.equal(assistants.length, 1);
    assert.match(String(assistants[0]!.kind === "assistant" && assistants[0]!.text), /Hello from Claude fixture/);
    const thinking = parsed.events.filter((e) => e.kind === "thinking");
    assert.ok(thinking.length >= 1);
    assert.equal(parsed.exitMetadata.isError, false);
  });

  it("extracts session id from stream-session-id.ndjson", () => {
    const parsed = parseClaudeStream(readClaudeFixture("stream-session-id.ndjson"));
    assert.ok(!("error" in parsed));
    const session = extractClaudeSession(parsed.events);
    assert.equal(session, "claude-fixture-session-abc123");
  });

  it("derives error exit metadata from stream-error-exit.ndjson", () => {
    const parsed = parseClaudeStream(readClaudeFixture("stream-error-exit.ndjson"));
    assert.ok(!("error" in parsed));
    assert.equal(parsed.exitMetadata.isError, true);
    assert.equal(parsed.exitMetadata.exitCode, 1);
    assert.equal(parsed.exitMetadata.errorCode, "permission_denied");
  });
});
