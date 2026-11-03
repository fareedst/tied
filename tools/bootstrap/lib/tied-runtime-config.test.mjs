import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { jsonSafeAbsolute } from "./paths.mjs";
import { ENV_CLIENT_BUNDLE_PATH, ENV_CLIENT_PROJECT_PATH } from "./tied-path-env.mjs";
import {
  deriveStoreRootFromMcpDist,
  loadMergedOperatorConfig,
  mapOperatorConfigToMcpEnv,
  operatorCollectMetricsFromConfig,
  pathsSameResolved,
  refreshStoreRuntimeConfig,
  resolveOperatorFlagsForInstall,
  resolveTiedRuntimeConfig,
  RUNTIME_DIAGNOSTIC_PREFIX,
  STORE_YAML_REL,
} from "./tied-runtime-config.mjs";
import {
  listSharedParityFixtureCases,
  materializeTiedRuntimeFixture,
} from "./tied-runtime-fixture-loader.mjs";
import yaml from "js-yaml";

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

  for (const spec of listSharedParityFixtureCases()) {
    it(`catalog fixture ${spec.id} resolves via tied-runtime-config`, () => {
      const materialized = materializeTiedRuntimeFixture(spec);
      try {
        const cfg = resolveTiedRuntimeConfig({
          cwd: materialized.workspaceRoot,
          processEnv: materialized.processEnv,
        });
        assert.ok(pathsSameResolved(cfg.storeRoot, materialized.storeRoot));
        assert.ok(
          pathsSameResolved(cfg.clientProjectPath, path.join(materialized.workspaceRoot, "tied-project")),
        );
        assert.ok(cfg.mcpDistPath.endsWith("index.js"));
      } finally {
        materialized.cleanup();
      }
    });
  }

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

  it("resolveOperatorFlagsForInstall honors install shell when operator and brownfield omit collect_metrics", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-op-shell-"));
    const flags = resolveOperatorFlagsForInstall({
      storeRoot: store,
      processEnv: { TIED_MCP_COLLECT_METRICS: "1" },
    });
    assert.equal(flags.collectMetrics, true);
  });

  it("resolveOperatorFlagsForInstall uses store operator.collect_metrics and ignores shell export", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-op-store-"));
    const tiedDir = path.join(store, ".tied");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(
      path.join(tiedDir, "store.yaml"),
      yaml.dump({
        schema: "tied-store-config.v1",
        operator: { mcp: { collect_metrics: false } },
      }),
    );
    const flags = resolveOperatorFlagsForInstall({
      storeRoot: store,
      processEnv: { TIED_MCP_COLLECT_METRICS: "1" },
    });
    assert.equal(flags.collectMetrics, false);
  });

  it("resolveOperatorFlagsForInstall honors operator.local.yaml overlay", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-op-local-"));
    const tiedDir = path.join(store, ".tied");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(
      path.join(tiedDir, "store.yaml"),
      yaml.dump({
        schema: "tied-store-config.v1",
        operator: { mcp: { collect_metrics: false } },
      }),
    );
    fs.writeFileSync(
      path.join(tiedDir, "operator.local.yaml"),
      yaml.dump({ mcp: { collect_metrics: true } }),
    );
    const operator = loadMergedOperatorConfig(store);
    assert.equal(operatorCollectMetricsFromConfig(operator), true);
    const flags = resolveOperatorFlagsForInstall({ storeRoot: store, processEnv: {} });
    assert.equal(flags.collectMetrics, true);
  });

  it("mapOperatorConfigToMcpEnv maps envelope and agentstream preflight booleans", () => {
    const { set, remove } = mapOperatorConfigToMcpEnv({
      mcp: { envelope_hooks: true },
      agentstream: { tied_mcp_preflight: true, skip_tied_mcp_preflight: false },
    });
    assert.equal(set.TIED_ENVELOPE_HOOKS, "1");
    assert.equal(set.AGENTSTREAM_TIED_MCP_PREFLIGHT, "1");
    assert.ok(remove.includes("AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT"));
  });

  it("resolveOperatorFlagsForInstall ignores shell for disk-defined envelope_hooks false", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "rt-op-env-"));
    const tiedDir = path.join(store, ".tied");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(
      path.join(tiedDir, "store.yaml"),
      yaml.dump({
        schema: "tied-store-config.v1",
        operator: {
          mcp: { envelope_hooks: false, collect_metrics: false },
          agentstream: { tied_mcp_preflight: true },
        },
      }),
    );
    const flags = resolveOperatorFlagsForInstall({
      storeRoot: store,
      processEnv: {
        TIED_ENVELOPE_HOOKS: "1",
        AGENTSTREAM_TIED_MCP_PREFLIGHT: "0",
      },
    });
    assert.ok(flags.operatorEnvRemove.includes("TIED_ENVELOPE_HOOKS"));
    assert.equal(flags.operatorEnv.AGENTSTREAM_TIED_MCP_PREFLIGHT, "1");
  });

  it("mapOperatorConfigToMcpEnv maps JEV harness and string provider fields", () => {
    const { set, remove } = mapOperatorConfigToMcpEnv({
      jev: {
        harness: true,
        decision_provider: "local",
        local_bridge: "http://127.0.0.1:9999",
      },
      agentstream: { checklist_var_strict: true },
    });
    assert.equal(set.AGENTSTREAM_JEV_HARNESS, "1");
    assert.equal(set.AGENTSTREAM_CHECKLIST_VAR_STRICT, "1");
    assert.equal(set.TIED_JEV_DECISION_PROVIDER, "local");
    assert.equal(set.TIED_JEV_LOCAL_BRIDGE, "http://127.0.0.1:9999");
    assert.equal(remove.length, 0);
  });
});
