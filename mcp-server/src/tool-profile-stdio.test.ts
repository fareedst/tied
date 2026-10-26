/**
 * [REQ-MCP_USAGE_METRICS] [IMPL-TIED_FILES] — stdio tools/list counts per TIED_MCP_TOOL_PROFILE.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const mcpBin = path.join(repoRoot, "mcp-server", "dist", "index.js");

function listToolCount(profile: string | undefined): Promise<number> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, TIED_BASE_PATH: path.join(repoRoot, "tied-project") };
    if (profile !== undefined) {
      env.TIED_MCP_TOOL_PROFILE = profile;
    } else {
      delete env.TIED_MCP_TOOL_PROFILE;
    }
    const messages = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "tool-profile-stdio-test", version: "1.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    ];
    const child = spawn("node", [mcpBin], { stdio: ["pipe", "pipe", "pipe"], env });
    let buf = "";
    child.stdout.on("data", (chunk) => {
      buf += chunk.toString();
    });
    child.stderr.on("data", () => {});
    for (const msg of messages) {
      child.stdin.write(`${JSON.stringify(msg)}\n`);
    }
    child.stdin.end();
    child.on("close", (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`MCP exited ${code}`));
        return;
      }
      const lines = buf.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as { result?: { tools?: Array<{ name: string }> } };
          if (parsed.result?.tools) {
            resolve(parsed.result.tools.length);
            return;
          }
        } catch {
          // ignore
        }
      }
      reject(new Error("no tools/list response"));
    });
  });
}

describe("tool profile stdio [REQ-MCP_USAGE_METRICS]", () => {
  it("tools/list counts for core, optin, full, unset", async () => {
    assert.equal(await listToolCount("core"), 92);
    assert.equal(await listToolCount("optin"), 37);
    assert.equal(await listToolCount("full"), 129);
    assert.equal(await listToolCount(undefined), 129);
  });
});
