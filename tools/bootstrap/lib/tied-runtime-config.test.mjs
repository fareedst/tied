import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { jsonSafeAbsolute } from "./paths.mjs";
import { ENV_CLIENT_BUNDLE_PATH, ENV_CLIENT_PROJECT_PATH } from "./tied-path-env.mjs";
import {
  deriveStoreRootFromMcpDist,
  pathsSameResolved,
  refreshStoreRuntimeConfig,
  resolveTiedRuntimeConfig,
  RUNTIME_DIAGNOSTIC_PREFIX,
  STORE_YAML_REL,
} from "./tied-runtime-config.mjs";

function seedTiedProject(tiedDir) {
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
}

function writeFakeMcpDist(storeRoot) {
  const indexJs = path.join(storeRoot, "mcp-server", "dist", "index.js");
  fs.mkdirSync(path.dirname(indexJs), { recursive: true });
  fs.writeFileSync(indexJs, "// fixture\n");
  return indexJs;
}

function writeMcpWithDist(projectRoot, rel, tiedDir, storeRoot, { storeRootEnv = true } = {}) {
  const dir = path.dirname(path.join(projectRoot, rel));
  fs.mkdirSync(dir, { recursive: true });
  const dist = writeFakeMcpDist(storeRoot);
  /** @type {Record<string, string>} */
  const env = { [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedDir) };
  if (storeRootEnv) {
    env.TIED_STORE_ROOT = jsonSafeAbsolute(storeRoot);
  }
  const payload = {
    mcpServers: {
      "tied-yaml": {
        command: "node",
        args: [dist],
        env,
      },
    },
  };
  fs.writeFileSync(path.join(projectRoot, rel), `${JSON.stringify(payload, null, 2)}\n`);
}

describe("tied-runtime-config", () => {
  it("derives store root from mcp dist path", () => {
    const store = path.join(os.tmpdir(), "store-derive");
    const dist = path.join(store, "mcp-server", "dist", "index.js");
    assert.equal(deriveStoreRootFromMcpDist(dist), path.resolve(store));
  });

  it("resolves monolithic client from mcp.json without shell env", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-mcp-mono-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcpWithDist(tmp, ".cursor/mcp.json", tiedDir, tmp, { storeRootEnv: false });
    const cfg = resolveTiedRuntimeConfig({ cwd: tmp, processEnv: {} });
    assert.equal(cfg.clientProjectPath, jsonSafeAbsolute(tiedDir));
    assert.ok(cfg.mcpDistPath.endsWith("index.js"));
    assert.equal(cfg.storeRoot, path.resolve(tmp));
  });

  it("ignores shell TIED_MCP_BIN when mcp.json defines dist", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-ignore-env-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-store-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcpWithDist(tmp, ".cursor/mcp.json", tiedDir, store);
    const wrongBin = path.join(os.tmpdir(), "wrong", "index.js");
    const cfg = resolveTiedRuntimeConfig({
      cwd: tmp,
      processEnv: {
        TIED_MCP_BIN: wrongBin,
        TIED_REPO_ROOT: "/wrong/store",
        TIED_STORE_ROOT: "/wrong/store",
      },
    });
    assert.ok(pathsSameResolved(cfg.storeRoot, store));
    assert.notEqual(cfg.mcpDistPath, wrongBin);
  });

  it("resolves linked client with bundle env", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-linked-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-linked-store-"));
    const tiedDir = path.join(tmp, "tied-project");
    const bundleDir = path.join(store, "tied-bundle");
    fs.mkdirSync(bundleDir, { recursive: true });
    seedTiedProject(tiedDir);
    const dist = writeFakeMcpDist(store);
    const mcpDir = path.join(tmp, ".cursor");
    fs.mkdirSync(mcpDir, { recursive: true });
    fs.writeFileSync(
      path.join(mcpDir, "mcp.json"),
      `${JSON.stringify(
        {
          mcpServers: {
            "tied-yaml": {
              args: [dist],
              env: {
                [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedDir),
                [ENV_CLIENT_BUNDLE_PATH]: jsonSafeAbsolute(bundleDir),
                TIED_STORE_ROOT: jsonSafeAbsolute(store),
              },
            },
          },
        },
        null,
        2,
      )}\n`,
    );
    const cfg = resolveTiedRuntimeConfig({ cwd: tmp, processEnv: {} });
    assert.equal(cfg.clientBundlePath, jsonSafeAbsolute(bundleDir));
    assert.ok(pathsSameResolved(cfg.storeRoot, store));
  });

  it("fail-closed on TIED_STORE_ROOT mismatch with derived root", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-mismatch-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-mismatch-store-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    const dist = writeFakeMcpDist(store);
    const otherStore = path.join(tmp, "other-store");
    fs.mkdirSync(otherStore, { recursive: true });
    const mcpDir = path.join(tmp, ".cursor");
    fs.mkdirSync(mcpDir, { recursive: true });
    fs.writeFileSync(
      path.join(mcpDir, "mcp.json"),
      `${JSON.stringify(
        {
          mcpServers: {
            "tied-yaml": {
              args: [dist],
              env: {
                [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedDir),
                TIED_STORE_ROOT: jsonSafeAbsolute(otherStore),
              },
            },
          },
        },
        null,
        2,
      )}\n`,
    );
    assert.throws(
      () => resolveTiedRuntimeConfig({ cwd: tmp, processEnv: {} }),
      (err) => {
        assert.match(String(err.message), /MISMATCH/);
        return true;
      },
    );
  });

  it("resolves store-only from store.yaml + local overlay", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-store-yaml-"));
    const dist = writeFakeMcpDist(store);
    refreshStoreRuntimeConfig(store, { mcpDistPath: dist });
    const cfg = resolveTiedRuntimeConfig({ cwd: store, mode: "store", processEnv: {} });
    assert.ok(pathsSameResolved(cfg.storeRoot, store));
    assert.ok(pathsSameResolved(cfg.mcpDistPath, dist));
    assert.ok(cfg.sources.some((s) => s.startsWith("store:")));
  });

  it("fail-closed when no mcp or store yaml", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-none-"));
    assert.throws(
      () => resolveTiedRuntimeConfig({ cwd: tmp, processEnv: {} }),
      (err) => {
        assert.match(String(err.message), new RegExp(RUNTIME_DIAGNOSTIC_PREFIX));
        return true;
      },
    );
  });

  it("refreshStoreRuntimeConfig writes store.yaml and store.local.yaml", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-refresh-"));
    const dist = writeFakeMcpDist(store);
    refreshStoreRuntimeConfig(store, { mcpDistPath: dist });
    assert.ok(fs.existsSync(path.join(store, STORE_YAML_REL)));
    assert.ok(fs.existsSync(path.join(store, ".tied", "store.local.yaml")));
  });
});
