import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installMcpLayer } from "./mcp.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";
import { ENV_CLIENT_BUNDLE_PATH, ENV_CLIENT_PROJECT_PATH } from "../tied-path-env.mjs";
import { STORE_YAML_REL } from "../tied-runtime-config.mjs";
import yaml from "js-yaml";

describe("mcp layer [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("linked mode sets TIED_CLIENT_BUNDLE_PATH in mcp.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-layer-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    installMcpLayer(tmp, {
      storeRoot: TIED_REPO_ROOT,
      harness: "cursor",
      mode: "linked",
      methodologyBundle: "live",
    });
    const mcpJson = JSON.parse(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf8"));
    const env = mcpJson.mcpServers["tied-yaml"].env;
    assert.ok(env[ENV_CLIENT_PROJECT_PATH]);
    assert.ok(env[ENV_CLIENT_BUNDLE_PATH]);
    assert.ok(env.TIED_STORE_ROOT);
    assert.ok(fs.existsSync(path.join(TIED_REPO_ROOT, STORE_YAML_REL)));
    assert.ok(fs.existsSync(path.join(TIED_REPO_ROOT, ".tied", "store.local.yaml")));
  });

  it("syncs slice-2 operator toggles from store yaml to mcp.json", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-op-store-"));
    const dist = path.join(store, "mcp-server", "dist", "index.js");
    fs.mkdirSync(path.dirname(dist), { recursive: true });
    fs.writeFileSync(dist, "// fixture\n");
    fs.mkdirSync(path.join(store, ".tied"), { recursive: true });
    fs.writeFileSync(
      path.join(store, ".tied", "store.yaml"),
      yaml.dump({
        schema: "tied-store-config.v1",
        operator: {
          mcp: { envelope_hooks: true },
          agentstream: { tied_mcp_preflight: true },
        },
      }),
    );
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-op-client-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    installMcpLayer(tmp, {
      storeRoot: store,
      harness: "cursor",
      mode: "full",
      methodologyBundle: "live",
      env: {
        TIED_ENVELOPE_HOOKS: "1",
        AGENTSTREAM_TIED_MCP_PREFLIGHT: "0",
      },
    });
    const env = JSON.parse(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf8"))
      .mcpServers["tied-yaml"].env;
    assert.equal(env.TIED_ENVELOPE_HOOKS, "1");
    assert.equal(env.AGENTSTREAM_TIED_MCP_PREFLIGHT, "1");
  });

  it("syncs slice-3 JEV operator strings to mcp.json", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-jev-store-"));
    const dist = path.join(store, "mcp-server", "dist", "index.js");
    fs.mkdirSync(path.dirname(dist), { recursive: true });
    fs.writeFileSync(dist, "// fixture\n");
    fs.mkdirSync(path.join(store, ".tied"), { recursive: true });
    fs.writeFileSync(
      path.join(store, ".tied", "operator.local.yaml"),
      yaml.dump({
        jev: { harness: true, decision_provider: "remote" },
        agentstream: { checklist_var_strict: true },
      }),
    );
    fs.writeFileSync(
      path.join(store, ".tied", "store.yaml"),
      yaml.dump({ schema: "tied-store-config.v1", operator: { jev: { harness: false } } }),
    );
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-jev-client-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    installMcpLayer(tmp, {
      storeRoot: store,
      harness: "cursor",
      mode: "full",
      methodologyBundle: "live",
      env: { AGENTSTREAM_JEV_HARNESS: "0", TIED_JEV_DECISION_PROVIDER: "local" },
    });
    const env = JSON.parse(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf8"))
      .mcpServers["tied-yaml"].env;
    assert.equal(env.AGENTSTREAM_JEV_HARNESS, "1");
    assert.equal(env.TIED_JEV_DECISION_PROVIDER, "remote");
    assert.equal(env.AGENTSTREAM_CHECKLIST_VAR_STRICT, "1");
  });

  it("full mode omits bundle env keys", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcp-layer-full-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    installMcpLayer(tmp, {
      storeRoot: TIED_REPO_ROOT,
      harness: "cursor",
      mode: "full",
      methodologyBundle: "live",
    });
    const mcpJson = JSON.parse(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf8"));
    const env = mcpJson.mcpServers["tied-yaml"].env;
    assert.equal(env[ENV_CLIENT_BUNDLE_PATH], undefined);
    assert.equal(env.TIED_STORE_ROOT, undefined);
  });
});
