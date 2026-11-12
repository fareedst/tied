/**
 * [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  WF_TRIAL_SESSION_LIMIT_HEADLINE,
  appendSessionLimitHighlightOnce,
  detectClaudeSessionLimitLine,
  formatSessionLimitHighlightBlock,
} from "./session-limit-highlight.js";

describe("session-limit-highlight [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]", () => {
  it("detectClaudeSessionLimitLine matches provider text [SC-WF-ABS-08]", () => {
    const line =
      "You've hit your session limit · resets 2:20pm (America/Los_Angeles)";
    assert.equal(detectClaudeSessionLimitLine(line), line);
    assert.equal(detectClaudeSessionLimitLine("unrelated agent output\n"), null);
  });

  it("highlight idempotence emits once per run [SC-WF-ABS-08]", () => {
    const limit =
      "You've hit your session limit · resets 2:20pm (America/Los_Angeles)";
    const state = { emitted: false };
    const blocks: string[] = [];
    const sink = (b: string) => blocks.push(b);
    assert.equal(
      appendSessionLimitHighlightOnce(limit, state, sink),
      true,
    );
    assert.equal(
      appendSessionLimitHighlightOnce(limit, state, sink),
      false,
    );
    assert.equal(blocks.length, 1);
    assert.match(blocks[0]!, new RegExp(`^${WF_TRIAL_SESSION_LIMIT_HEADLINE}`));
  });

  it("formatSessionLimitHighlightBlock includes headline and hint", () => {
    const block = formatSessionLimitHighlightBlock("session limit soon");
    assert.match(block, /^ERROR: WF trial stopped: Claude session capacity limit/);
    assert.match(block, /session limit soon/);
    assert.match(block, /harness=cursor/);
  });
});
