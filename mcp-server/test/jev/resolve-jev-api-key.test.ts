/**
 * [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "bun:test";

import {
  readJevApiKeyFromMcpJsonFile,
  resolveJevApiKey,
} from "../../src/jev/resolve-jev-api-key.js";

let tempDir = "";

afterEach(() => {
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = "";
  }
});

test("resolveJevApiKey prefers process.env over mcp.json", () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-key-"));
  const mcpPath = path.join(tempDir, "mcp.json");
  fs.writeFileSync(
    mcpPath,
    JSON.stringify({
      mcpServers: { "tied-yaml": { env: { JEV_API_KEY: "from_file" } } },
    }),
  );
  const key = resolveJevApiKey(
    { JEV_API_KEY: "from_env" },
    { mcpJsonPath: mcpPath },
  );
  assert.equal(key, "from_env");
});

test("resolveJevApiKey falls back to mcp.json when env empty", () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-key-"));
  const mcpPath = path.join(tempDir, "mcp.json");
  fs.writeFileSync(
    mcpPath,
    JSON.stringify({
      mcpServers: { "tied-yaml": { env: { JEV_API_KEY: "jv_live_fallback" } } },
    }),
  );
  const key = resolveJevApiKey({}, { mcpJsonPath: mcpPath });
  assert.equal(key, "jv_live_fallback");
});

test("readJevApiKeyFromMcpJsonFile returns undefined for missing file", () => {
  assert.equal(readJevApiKeyFromMcpJsonFile("/nonexistent/mcp.json"), undefined);
});

test("resolveJevApiKey whitespace-only env does not fall back to mcp.json", () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-key-"));
  const mcpPath = path.join(tempDir, "mcp.json");
  fs.writeFileSync(
    mcpPath,
    JSON.stringify({
      mcpServers: { "tied-yaml": { env: { JEV_API_KEY: "from_file" } } },
    }),
  );
  const key = resolveJevApiKey({ JEV_API_KEY: "   " }, { mcpJsonPath: mcpPath });
  assert.equal(key, undefined);
});
