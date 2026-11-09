/**
 * [REQ-WF_TRIAL_MODEL_EFFORT] model effort resolution and Cursor slug diagnostic.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyCursorModelForAgent,
  cursorModelBracketEffortDisabled,
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

  it("applyCursorModelForAgent appends effort bracket", () => {
    const prev = process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    const prevOv = process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES;
    delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    delete process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES;
    assert.equal(
      applyCursorModelForAgent("composer-2.5-fast", "medium"),
      "composer-2.5-fast[effort=medium]",
    );
    assert.equal(applyCursorModelForAgent("Auto", "high"), "Auto");
    assert.equal(
      applyCursorModelForAgent("gpt-5[context=1m]", "high"),
      "gpt-5[context=1m,effort=high]",
    );
    process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES = "fast=false";
    assert.equal(
      applyCursorModelForAgent("slug", "low"),
      "slug[effort=low,fast=false]",
    );
    process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT = "0";
    assert.equal(
      applyCursorModelForAgent("composer-2.5-fast", "medium"),
      "composer-2.5-fast",
    );
    assert.equal(cursorModelBracketEffortDisabled(), true);
    if (prev === undefined) {
      delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    } else {
      process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT = prev;
    }
    if (prevOv === undefined) {
      delete process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES;
    } else {
      process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES = prevOv;
    }
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
