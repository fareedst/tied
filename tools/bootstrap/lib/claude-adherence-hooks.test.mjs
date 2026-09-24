/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  mergeClaudeAdherenceHooks,
  bridgeScriptPath,
  TIED_ADHERENCE_BRIDGE_SCRIPT,
} from "./claude-adherence-hooks.mjs";

function tempClient() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tied-claude-adh-hooks-"));
}

describe("mergeClaudeAdherenceHooks [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]", () => {
  it("creates settings.json and hook shell when absent", () => {
    const clientRoot = tempClient();
    const result = mergeClaudeAdherenceHooks(clientRoot, TIED_REPO_ROOT);
    assert.equal(result.action, "created");
    const settingsPath = path.join(clientRoot, ".claude", "settings.json");
    assert.ok(fs.existsSync(settingsPath));
    const cfg = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    assert.ok(Array.isArray(cfg.hooks.PostToolUse));
    assert.ok(fs.existsSync(bridgeScriptPath(clientRoot)));
  });

  it("merge is idempotent", () => {
    const clientRoot = tempClient();
    mergeClaudeAdherenceHooks(clientRoot, TIED_REPO_ROOT);
    const afterFirst = fs.readFileSync(path.join(clientRoot, ".claude", "settings.json"), "utf8");
    const second = mergeClaudeAdherenceHooks(clientRoot, TIED_REPO_ROOT);
    assert.equal(second.action, "noop");
    assert.equal(fs.readFileSync(path.join(clientRoot, ".claude", "settings.json"), "utf8"), afterFirst);
  });

  it("preserves foreign PostToolUse hooks", () => {
    const clientRoot = tempClient();
    fs.mkdirSync(path.join(clientRoot, ".claude"), { recursive: true });
    const foreign = {
      hooks: {
        PostToolUse: [
          {
            matcher: "Bash",
            hooks: [{ type: "command", command: "echo foreign-hook" }],
          },
        ],
      },
    };
    fs.writeFileSync(path.join(clientRoot, ".claude", "settings.json"), `${JSON.stringify(foreign, null, 2)}\n`);

    mergeClaudeAdherenceHooks(clientRoot, TIED_REPO_ROOT);
    const cfg = JSON.parse(fs.readFileSync(path.join(clientRoot, ".claude", "settings.json"), "utf8"));
    assert.equal(cfg.hooks.PostToolUse.length, 2);
    assert.equal(cfg.hooks.PostToolUse[0].hooks[0].command, "echo foreign-hook");
    assert.ok(String(cfg.hooks.PostToolUse[1].hooks[0].command).includes(TIED_ADHERENCE_BRIDGE_SCRIPT));
  });
});
