import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  deriveStoreRootFromMcpDist,
  pathsSameResolved,
  resolveTiedRuntimeConfigFromWorkspace,
} from "./tied-runtime-config.js";

// [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-CONSUMERS

function seedTiedProject(tiedDir: string): void {
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
}

function writeFakeMcpDist(storeRoot: string): string {
  const indexJs = path.join(storeRoot, "mcp-server", "dist", "index.js");
  fs.mkdirSync(path.dirname(indexJs), { recursive: true });
  fs.writeFileSync(indexJs, "// fixture\n");
  return indexJs;
}

function writeClientMcpJson(
  clientRoot: string,
  tiedDir: string,
  storeRoot: string,
  { storeRootEnv = true } = {},
): void {
  const dist = writeFakeMcpDist(storeRoot);
  const cursorDir = path.join(clientRoot, ".cursor");
  fs.mkdirSync(cursorDir, { recursive: true });
  /** @type {Record<string, string>} */
  const env: Record<string, string> = {
    TIED_CLIENT_PROJECT_PATH: tiedDir.split(path.sep).join("/"),
  };
  if (storeRootEnv) {
    env.TIED_STORE_ROOT = storeRoot.split(path.sep).join("/");
  }
  fs.writeFileSync(
    path.join(cursorDir, "mcp.json"),
    `${JSON.stringify(
      {
        mcpServers: {
          "tied-yaml": {
            args: [dist],
            env,
          },
        },
      },
      null,
      2,
    )}\n`,
  );
}

describe("tied-runtime-config [SC-RDC-CONSUMERS]", () => {
  it("derives store root from mcp dist path", () => {
    const store = path.join(os.tmpdir(), "as-store-derive");
    const dist = path.join(store, "mcp-server", "dist", "index.js");
    assert.equal(deriveStoreRootFromMcpDist(dist), path.resolve(store));
  });

  it("resolves linked client store from mcp.json", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-client-"));
    const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-store-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    seedTiedProject(tiedDir);
    writeClientMcpJson(clientRoot, tiedDir, storeRoot);

    const cfg = resolveTiedRuntimeConfigFromWorkspace(clientRoot);
    assert.ok(cfg);
    assert.ok(pathsSameResolved(cfg!.storeRoot, storeRoot));
    assert.ok(pathsSameResolved(cfg!.clientProjectPath ?? "", tiedDir));
  });

  it("ignores shell path env when mcp.json defines dist", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-ignore-"));
    const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-store-ignore-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    seedTiedProject(tiedDir);
    writeClientMcpJson(clientRoot, tiedDir, storeRoot);

    process.env.TIED_MCP_BIN = path.join(os.tmpdir(), "wrong", "index.js");
    process.env.TIED_REPO_ROOT = path.join(os.tmpdir(), "wrong-store");
    try {
      const cfg = resolveTiedRuntimeConfigFromWorkspace(clientRoot);
      assert.ok(cfg);
      assert.ok(pathsSameResolved(cfg!.storeRoot, storeRoot));
    } finally {
      delete process.env.TIED_MCP_BIN;
      delete process.env.TIED_REPO_ROOT;
    }
  });

  it("returns null when no mcp.json or store yaml", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-empty-"));
    assert.equal(resolveTiedRuntimeConfigFromWorkspace(clientRoot), null);
  });
});
