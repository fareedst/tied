/**
 * [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

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

describe("resolveJevApiKey", () => {
  it("prefers process.env over mcp.json", () => {
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

  it("falls back to mcp.json when env empty", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-key-"));
    const mcpPath = path.join(tempDir, "mcp.json");
    fs.writeFileSync(
      mcpPath,
      JSON.stringify({
        mcpServers: { "tied-yaml": { env: { JEV_API_KEY: "from_file" } } },
      }),
    );
    const key = resolveJevApiKey({}, { mcpJsonPath: mcpPath });
    assert.equal(key, "from_file");
  });

  it("readJevApiKeyFromMcpJsonFile returns undefined for missing file", () => {
    assert.equal(readJevApiKeyFromMcpJsonFile("/nonexistent/mcp.json"), undefined);
  });
});
