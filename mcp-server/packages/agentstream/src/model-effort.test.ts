/**
 * [REQ-WF_TRIAL_MODEL_EFFORT] model effort resolution and Cursor slug rewrite.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyCursorModelForAgent,
  cursorModelBracketEffortDisabled,
  cursorSlugEffortRewriteBlocked,
  cursorSlugMayMismatchEffort,
  isAllowedModelEffort,
  resolveModelEffort,
} from "./model-effort.js";

describe("model-effort [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
  it("resolveModelEffort prefers CLI over env", () => {
    assert.equal(resolveModelEffort("high", "low"), "high");
    assert.equal(resolveModelEffort("", "medium"), "medium");
    assert.equal(resolveModelEffort("-", "medium"), "medium");
  });

  it("isAllowedModelEffort accepts API levels", () => {
    assert.equal(isAllowedModelEffort("xhigh"), true);
    assert.equal(isAllowedModelEffort("bogus"), false);
  });

  it("applyCursorModelForAgent rewrites hyphen effort tier [SC-CURSOR-SLUG]", () => {
    const prev = process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    assert.equal(
      applyCursorModelForAgent("grok-4.7-low-fast", "medium"),
      "grok-4.7-medium-fast",
    );
    assert.equal(
      applyCursorModelForAgent("claude-opus-5-thinking-high", "max"),
      "claude-opus-5-thinking-max",
    );
    assert.equal(
      applyCursorModelForAgent("gpt-5.6-luna-low-fast", "low"),
      "gpt-5.6-luna-low-fast",
    );
    assert.equal(
      applyCursorModelForAgent("gpt-5.5-high-fast", "xhigh"),
      "gpt-5.5-extra-high-fast",
    );
    assert.equal(applyCursorModelForAgent("Auto", "high"), "Auto");
    assert.equal(
      applyCursorModelForAgent("composer-2.5-fast[effort=medium]", "medium"),
      "composer-2.5-fast",
    );
    assert.equal(
      applyCursorModelForAgent("composer-2.5-fast", "medium"),
      "composer-2.5-fast",
    );
    process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT = "0";
    assert.equal(
      applyCursorModelForAgent("grok-4.7-low-fast", "medium"),
      "grok-4.7-low-fast",
    );
    assert.equal(cursorModelBracketEffortDisabled(), true);
    if (prev === undefined) {
      delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    } else {
      process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT = prev;
    }
  });

  it("cursorSlugEffortRewriteBlocked detects composer", () => {
    assert.equal(cursorSlugEffortRewriteBlocked("composer-2.5-fast"), true);
    assert.equal(cursorSlugEffortRewriteBlocked("grok-4.7-low-fast"), false);
  });

  it("cursorSlugMayMismatchEffort detects missing tier in slug", () => {
    assert.equal(
      cursorSlugMayMismatchEffort("composer-2.5-fast", "medium"),
      true,
    );
    assert.equal(
      cursorSlugMayMismatchEffort("gpt-5.6-luna-low-fast", "low"),
      false,
    );
  });
});
