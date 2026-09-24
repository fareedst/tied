/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
 * How: composition binding — parseDryRunConfig --harness flows to agentArgv dry-run command rendering.
 */
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { parseDryRunConfig } from "./dry-run-config.js";
import { agentArgv } from "./executor-dry-run.js";

describe("harness CLI composition [REQ-TIED_CLAUDE_HARNESS]", () => {
  const workspace = mkdtempSync(join(tmpdir(), "agentstream-harness-"));

  it("binds --harness claude to claude placeholder bin in agentArgv", () => {
    const cfg = parseDryRunConfig(workspace, [
      "--dry-run",
      "--harness",
      "claude",
      "--",
      "hello",
    ]);
    assert.equal(cfg.agentHarness, "claude");
    const argv = agentArgv(
      cfg.agentPath,
      cfg.workspace,
      cfg.model,
      "",
      ["hello"],
      cfg.agentHarness,
    );
    assert.equal(argv[0], "claude");
  });

  it("keeps --agent-path override independent of --harness claude", () => {
    const cfg = parseDryRunConfig(workspace, [
      "--dry-run",
      "--harness",
      "claude",
      "--agent-path",
      "/custom/cursor-agent",
      "--",
      "x",
    ]);
    assert.equal(cfg.agentHarness, "claude");
    const argv = agentArgv(
      cfg.agentPath,
      cfg.workspace,
      cfg.model,
      "",
      ["x"],
      cfg.agentHarness,
    );
    assert.equal(argv[0], "/custom/cursor-agent");
  });
});
