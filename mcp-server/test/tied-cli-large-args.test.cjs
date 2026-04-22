/**
 * Regression: tied-cli.sh must deliver tools/call arguments larger than typical
 * execve env limits (via TIED_CLI_ARGS_FILE + Node-built JSON-RPC).
 */
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const MCP_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(MCP_ROOT, "..");
const TIED_CLI = path.join(
  REPO_ROOT,
  ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
);
const MCP_BIN = path.join(MCP_ROOT, "dist/index.js");
const TIED_BASE = path.join(REPO_ROOT, "tied");

describe("tied-cli large arguments", () => {
  it("accepts an args file larger than 256KiB without env truncation", () => {
    if (!fs.existsSync(TIED_CLI) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }
    const pad = "a".repeat(280_000);
    const argsPath = path.join(os.tmpdir(), `tied-cli-large-args-${Date.now()}.json`);
    fs.writeFileSync(
      argsPath,
      JSON.stringify({ index: "requirements", _padding: pad }),
      "utf8"
    );
    try {
      const r = spawnSync(
        "bash",
        [TIED_CLI, "yaml_index_list_tokens", `@${argsPath}`],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            TIED_BASE_PATH: TIED_BASE,
            TIED_MCP_BIN: MCP_BIN,
          },
          maxBuffer: 20 * 1024 * 1024,
        }
      );
      assert.strictEqual(r.status, 0, `stderr: ${r.stderr}\nstdout: ${r.stdout?.slice(0, 500)}`);
      const out = JSON.parse(r.stdout.trim());
      assert.ok(Array.isArray(out));
    } finally {
      try {
        fs.unlinkSync(argsPath);
      } catch {
        /* ignore */
      }
    }
  });
});
