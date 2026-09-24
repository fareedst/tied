/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_HARNESS]
 * SELECT_LIVE_DRIVER factory tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { selectLiveDriver } from "./live-driver-select.js";

describe("SELECT_LIVE_DRIVER [REQ-TIED_CLAUDE_LIVE_DRIVER]", () => {
  it("selects claude driver for harness=claude", () => {
    const sel = selectLiveDriver("claude", "");
    assert.equal(sel.driverKind, "claude");
  });

  it("selects cursor driver for default harness", () => {
    const sel = selectLiveDriver("cursor", "");
    assert.equal(sel.driverKind, "cursor");
  });

  it("does not select claude driver when only agent_path is claude", () => {
    const sel = selectLiveDriver("cursor", "claude");
    assert.equal(sel.driverKind, "cursor");
    assert.equal(sel.agentPathMisusedAsHarness, true);
  });

  it("maps dry_run harness to none", () => {
    const sel = selectLiveDriver("dry_run", "");
    assert.equal(sel.driverKind, "none");
  });
});
