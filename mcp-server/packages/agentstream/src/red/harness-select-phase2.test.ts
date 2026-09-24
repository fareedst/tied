/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
 * How: contract tests for SELECT_AGENT_HARNESS (--harness claude); included in default npm test after GREEN.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { selectAgentHarness } from "../harness-select.js";

describe("SELECT_AGENT_HARNESS [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("maps --harness claude to claude profile", () => {
    assert.equal(selectAgentHarness(["--harness", "claude"], {}), "claude");
  });

  it("defaults to cursor when no harness flag", () => {
    assert.equal(selectAgentHarness([], {}), "cursor");
  });

  it("does not treat --agent-path as harness selection", () => {
    assert.equal(selectAgentHarness(["--agent-path", "claude"], {}), "cursor");
  });

  it("maps dry-run mode to dry_run profile when --dry-run present", () => {
    assert.equal(selectAgentHarness(["--dry-run"], { dryRun: true }), "dry_run");
  });
});
