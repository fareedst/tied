/**
 * [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION] [IMPL-TIED_MCP_TEST_MCP_JSON_ISOLATION]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it } from "node:test";
import {
  bindWritableProjectCorpus,
  restoreClientPathEnv,
  snapshotClientPathEnv,
} from "./client-path-env.js";

const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = path.resolve(mcpServerRoot, "..");

describe("client-path-env mcp.json isolation [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION]", () => {
  let savedEnv: Record<string, string | undefined>;
  const prevRepoRoot = process.env.TIED_MCP_TEST_REPO_ROOT;
  const prevAllow = process.env.TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE;

  afterEach(() => {
    restoreClientPathEnv(savedEnv);
    if (prevRepoRoot === undefined) delete process.env.TIED_MCP_TEST_REPO_ROOT;
    else process.env.TIED_MCP_TEST_REPO_ROOT = prevRepoRoot;
    if (prevAllow === undefined) delete process.env.TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE;
    else process.env.TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE = prevAllow;
  });

  it("T-GUARD-01 refuses bindWritableProjectCorpus on live store tied-project", () => {
    savedEnv = snapshotClientPathEnv();
    process.env.TIED_MCP_TEST_REPO_ROOT = repoRoot;
    delete process.env.TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE;
    const storeTied = path.join(repoRoot, "tied-project");
    assert.throws(
      () => bindWritableProjectCorpus(storeTied),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /TEST_FIXTURE: refusing to write \.cursor\/mcp\.json/);
        return true;
      },
    );
  });

  it("T-GUARD-02 allows bindWritableProjectCorpus under tmpdir", () => {
    savedEnv = snapshotClientPathEnv();
    process.env.TIED_MCP_TEST_REPO_ROOT = repoRoot;
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-json-iso-"));
    const tiedDir = path.join(tempRoot, "tied-project");
    try {
      bindWritableProjectCorpus(tiedDir);
      const mcpPath = path.join(tempRoot, ".cursor", "mcp.json");
      assert.ok(fs.existsSync(mcpPath));
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("mcp-http-server offender scan [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION]", () => {
  it("T-SCAN-01 mcp-http-server.test.ts does not bind store tied-project", () => {
    const src = fs.readFileSync(path.join(mcpServerRoot, "src", "mcp-http-server.test.ts"), "utf8");
    assert.doesNotMatch(src, /path\.join\s*\(\s*storeRoot\s*,\s*["']tied-project["']\s*\)/);
    assert.doesNotMatch(src, /path\.join\s*\(\s*repoRoot\s*,\s*["']tied-project["']\s*\)/);
    assert.match(src, /mkdtempSync/);
  });
});
