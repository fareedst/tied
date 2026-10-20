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
const TIED_CLI_BUNDLED = path.join(
  REPO_ROOT,
  "tools/bundled-tied-yaml-skill/scripts/tied-cli.sh"
);
const TIED_CLI_CURSOR = path.join(
  REPO_ROOT,
  ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
);
const TIED_CLI = fs.existsSync(TIED_CLI_BUNDLED) ? TIED_CLI_BUNDLED : TIED_CLI_CURSOR;
const MCP_BIN = path.join(MCP_ROOT, "dist/index.js");
const TIED_BASE = fs.existsSync(path.join(REPO_ROOT, "tied-project", "requirements.yaml"))
  ? path.join(REPO_ROOT, "tied-project")
  : path.join(REPO_ROOT, "tied");
const STDIO_CLIENT = path.join(
  REPO_ROOT,
  "tools/bundled-tied-yaml-skill/scripts/tied-mcp-stdio-client.cjs"
);

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

  it("emits DIAGNOSTIC TIED_CLI_HINDRANCE on JSON-RPC invalid_arguments with exit 2", () => {
    if (!fs.existsSync(MCP_BIN) || !fs.existsSync(STDIO_CLIENT)) {
      console.log("skip: MCP bin or stdio client missing");
      return;
    }
    const argsPath = path.join(os.tmpdir(), `tied-cli-hindrance-${Date.now()}.json`);
    fs.writeFileSync(
      argsPath,
      JSON.stringify({
        index: "semantic-tokens",
        token: "REQ-HINDRANCE-TEST",
        record: ["not", "a", "record"],
      }),
      "utf8"
    );
    try {
      const r = spawnSync(
        process.execPath,
        [STDIO_CLIENT],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            TIED_CLI_MCP_BIN: MCP_BIN,
            TIED_CLI_TOOL_NAME: "yaml_index_insert",
            TIED_CLI_ARGS_FILE: argsPath,
            TIED_CLI_QUIET_MCP_STDERR: "0",
            TIED_BASE_PATH: TIED_BASE,
          },
        }
      );
      assert.strictEqual(r.status, 2, `expected exit 2; stderr: ${r.stderr}`);
      assert.match(r.stderr, /DIAGNOSTIC: TIED_CLI_HINDRANCE/);
      const diagLine = r.stderr
        .split("\n")
        .find((line) => line.startsWith("DIAGNOSTIC: TIED_CLI_HINDRANCE "));
      assert.ok(diagLine, "missing hindrance diagnostic line");
      const jsonPart = diagLine.replace(/^DIAGNOSTIC: TIED_CLI_HINDRANCE /, "");
      const parsed = JSON.parse(jsonPart);
      assert.equal(parsed.failure_kind, "invalid_arguments");
      assert.equal(parsed.jsonrpc_code, -32602);
      assert.ok(typeof parsed.recovery_hint === "string" && parsed.recovery_hint.length > 0);
    } finally {
      try {
        fs.unlinkSync(argsPath);
      } catch {
        /* ignore */
      }
    }
  });
});
