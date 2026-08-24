#!/usr/bin/env node
/**
 * [REQ-TIED_ADVERSARIAL_INQUIRY] G6 — fresh stdio MCP session tool catalog check (post-rebuild reload smoke).
 */
"use strict";

const { spawn } = require("node:child_process");

const mcpBin = process.argv[2];
const required = process.argv.slice(3);
if (!mcpBin || required.length === 0) {
  console.error("Usage: g6-mcp-list-tools.cjs <mcp-dist-index.js> <tool>...");
  process.exit(2);
}

const messages = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "g6-reload-smoke", version: "1.0.0" },
    },
  },
  { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
  { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
];

const child = spawn("node", [mcpBin], { stdio: ["pipe", "pipe", "pipe"] });
let buf = "";
child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
});
child.stderr.on("data", (chunk) => process.stderr.write(chunk));
for (const msg of messages) {
  child.stdin.write(`${JSON.stringify(msg)}\n`);
}
child.stdin.end();

child.on("close", () => {
  const lines = buf.split("\n").filter(Boolean);
  let tools = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.result && Array.isArray(parsed.result.tools)) {
        tools = parsed.result.tools.map((tool) => tool.name);
      }
    } catch {
      // ignore non-json lines
    }
  }
  const missing = required.filter((name) => !tools.includes(name));
  const result = {
    ok: missing.length === 0,
    rebuild: "npm run build --prefix mcp-server",
    fresh_stdio_session: true,
    tool_count: tools.length,
    required_tools: required,
    missing_tools: missing,
    catalog_sample: tools.filter((name) => required.includes(name)).sort(),
    timestamp: new Date().toISOString(),
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(missing.length === 0 ? 0 : 1);
});
