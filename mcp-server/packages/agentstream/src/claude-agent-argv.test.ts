/**
 * [REQ-TIED_CLAUDE_LIVE_DRIVER] Claude agentstream argv helpers.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  claudeAddDirArgs,
  claudeMcpConfigArgs,
  claudeSkipPermissionsArgs,
} from "./claude-agent-argv.js";
import { agentArgv } from "./executor-dry-run.js";

describe("claude-agent-argv [REQ-TIED_CLAUDE_LIVE_DRIVER]", () => {
  it("adds skip-permissions when AGENTSTREAM_CLAUDE_LIVE_OK=1", () => {
    const prevOk = process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    const prevKeep = process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS;
    process.env.AGENTSTREAM_CLAUDE_LIVE_OK = "1";
    delete process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS;
    assert.deepEqual(claudeSkipPermissionsArgs(), [
      "--dangerously-skip-permissions",
    ]);
    process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS = "1";
    assert.deepEqual(claudeSkipPermissionsArgs(), []);
    if (prevOk === undefined) {
      delete process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    } else {
      process.env.AGENTSTREAM_CLAUDE_LIVE_OK = prevOk;
    }
    if (prevKeep === undefined) {
      delete process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS;
    } else {
      process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS = prevKeep;
    }
  });

  function writeLinkedClientMcp(client: string, store: string): void {
    const dist = path.join(store, "mcp-server/dist/index.js");
    fs.mkdirSync(path.dirname(dist), { recursive: true });
    fs.writeFileSync(dist, "// test dist\n");
    const tiedProject = path.join(client, "tied-project");
    fs.mkdirSync(tiedProject, { recursive: true });
    fs.writeFileSync(path.join(tiedProject, "requirements.yaml"), "REQ-TEST: {}\n");
    fs.mkdirSync(path.join(client, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(client, ".cursor", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: [dist],
            env: {
              TIED_CLIENT_PROJECT_PATH: tiedProject,
              TIED_CLIENT_BUNDLE_PATH: path.join(client, "tied-bundle"),
              TIED_STORE_ROOT: store,
            },
          },
        },
      }),
    );
  }

  it("adds strict MCP flags when client .cursor/mcp.json exists [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "claude-mcp-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "claude-mcp-store-"));
    writeLinkedClientMcp(client, store);
    const prevStrict = process.env.AGENTSTREAM_CLAUDE_STRICT_MCP;
    delete process.env.AGENTSTREAM_CLAUDE_STRICT_MCP;
    const args = claudeMcpConfigArgs(client);
    assert.ok(args.includes("--strict-mcp-config"));
    assert.ok(args.includes("--mcp-config"));
    assert.ok(args.includes(path.join(client, ".cursor", "mcp.json")));
    process.env.AGENTSTREAM_CLAUDE_STRICT_MCP = "0";
    const relaxed = claudeMcpConfigArgs(client);
    assert.ok(!relaxed.includes("--strict-mcp-config"));
    assert.ok(relaxed.includes("--mcp-config"));
    if (prevStrict === undefined) {
      delete process.env.AGENTSTREAM_CLAUDE_STRICT_MCP;
    } else {
      process.env.AGENTSTREAM_CLAUDE_STRICT_MCP = prevStrict;
    }
  });

  it("agentArgv includes --effort for claude when model effort set [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "claude-effort-"));
    const argv = agentArgv(
      "",
      client,
      "claude-opus-5-5",
      "",
      ["hi"],
      "claude",
      "medium",
    );
    assert.ok(argv.includes("--effort"));
    assert.ok(argv.includes("medium"));
  });

  it("agentArgv includes MCP flags for claude harness [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "claude-argv-mcp-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "claude-argv-mcp-store-"));
    writeLinkedClientMcp(client, store);
    const argv = agentArgv("", client, "claude-haiku-5-5", "", ["hi"], "claude");
    assert.ok(argv.includes("--strict-mcp-config"));
    assert.ok(argv.includes("--mcp-config"));
  });

  it("adds --add-dir for TIED_STORE_ROOT from client mcp.json", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "claude-add-dir-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "claude-store-"));
    writeLinkedClientMcp(client, store);
    const args = claudeAddDirArgs(client);
    assert.ok(args.includes("--add-dir"));
    assert.ok(args.includes(path.resolve(store)));
  });

  it("agentArgv includes skip-permissions and add-dir under LIVE_OK", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "claude-argv-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "claude-argv-store-"));
    writeLinkedClientMcp(client, store);
    const prevOk = process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    process.env.AGENTSTREAM_CLAUDE_LIVE_OK = "1";
    const argv = agentArgv("", client, "claude-haiku-5-5", "", ["hi"], "claude");
    assert.ok(argv.includes("--dangerously-skip-permissions"));
    assert.ok(argv.includes("--add-dir"));
    assert.ok(argv.includes(path.resolve(store)));
    if (prevOk === undefined) {
      delete process.env.AGENTSTREAM_CLAUDE_LIVE_OK;
    } else {
      process.env.AGENTSTREAM_CLAUDE_LIVE_OK = prevOk;
    }
  });
});
