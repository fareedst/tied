/**
 * [IMPL-TIED_FILES] [IMPL-MCP_USAGE_METRICS] [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS]
 * How: resolveBootstrapMetricsClient prefers disposable dev/test id over inherited shell env.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildTiedMcpServerEntry,
  initializeClaudeMcpConfig,
  refreshTiedMcpServersJson,
  resolveBootstrapMetricsClient,
  tiedMcpServersUpToDate,
} from "./mcp-config.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

describe("resolveBootstrapMetricsClient [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS]", () => {
  it("uses timestamp basename under dev/test when shell has stdd-dev", () => {
    const projectRoot = path.join("/Users/me/Documents/dev/test", "1700000000");
    const label = resolveBootstrapMetricsClient(projectRoot, {
      TIED_MCP_METRICS_CLIENT: "stdd-dev",
    });
    assert.equal(label, "1700000000");
  });

  it("uses ten-digit basename even outside dev/test path", () => {
    const projectRoot = path.join("/tmp", "custom-root", "1700000001");
    const label = resolveBootstrapMetricsClient(projectRoot, {
      TIED_MCP_METRICS_CLIENT: "stdd-dev",
    });
    assert.equal(label, "1700000001");
  });

  it("uses tagged epoch basename under dev/test [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const projectRoot = path.join("/Users/me/Documents/dev/test", "1700000000-gf-001");
    const label = resolveBootstrapMetricsClient(projectRoot, {
      TIED_MCP_METRICS_CLIENT: "stdd-dev",
    });
    assert.equal(label, "1700000000-gf-001");
  });

  it("uses tagged epoch basename outside dev/test path [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const projectRoot = path.join("/tmp", "custom-root", "1700000002-trial-01");
    const label = resolveBootstrapMetricsClient(projectRoot, {
      TIED_MCP_METRICS_CLIENT: "stdd-dev",
    });
    assert.equal(label, "1700000002-trial-01");
  });

  it("honors explicit env override for named project dirs", () => {
    const projectRoot = path.join("/Users/me/projects", "my-app");
    const label = resolveBootstrapMetricsClient(projectRoot, {
      TIED_MCP_METRICS_CLIENT: "explicit-client",
    });
    assert.equal(label, "explicit-client");
  });

  it("falls back to basename when env unset on named project dirs", () => {
    const projectRoot = path.join("/Users/me/projects", "basename-client");
    const label = resolveBootstrapMetricsClient(projectRoot, {});
    assert.equal(label, "basename-client");
  });
});

describe("refreshTiedMcpServersJson [REQ-MCP_USAGE_METRICS]", () => {
  it("writes core and opt-in entries with profiles and metrics suffix", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-dual-"));
    const mcpJsonPath = path.join(tmp, ".cursor", "mcp.json");
    const tiedBase = path.join(tmp, "tied-project");
    fs.mkdirSync(tiedBase, { recursive: true });
    const dist = path.join(TIED_REPO_ROOT, "mcp-server", "dist", "index.js");
    refreshTiedMcpServersJson({
      mcpJsonPath,
      tiedMcpIndexJs: dist,
      tiedBasePath: tiedBase,
      collectMetrics: true,
      metricsClient: "my-client",
      projectBasename: "my-client",
    });
    const cfg = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
    assert.equal(cfg.mcpServers["tied-yaml"].env.TIED_MCP_TOOL_PROFILE, "core");
    assert.equal(cfg.mcpServers["tied-yaml-optin"].env.TIED_MCP_TOOL_PROFILE, "optin");
    assert.equal(cfg.mcpServers["tied-yaml"].env.TIED_MCP_METRICS_CLIENT, "my-client");
    assert.equal(cfg.mcpServers["tied-yaml-optin"].env.TIED_MCP_METRICS_CLIENT, "my-client-optin");
    assert.equal(cfg.mcpServers["tied-yaml"].disabled, false);
  });

  it("preserves foreign mcpServers keys on brownfield merge", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-brownfield-"));
    const mcpJsonPath = path.join(tmp, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpJsonPath), { recursive: true });
    fs.writeFileSync(
      mcpJsonPath,
      `${JSON.stringify({ mcpServers: { "org-kb": { url: "https://example.test" } } }, null, 2)}\n`,
    );
    const tiedBase = path.join(tmp, "tied-project");
    fs.mkdirSync(tiedBase, { recursive: true });
    refreshTiedMcpServersJson({
      mcpJsonPath,
      tiedMcpIndexJs: path.join(TIED_REPO_ROOT, "mcp-server", "dist", "index.js"),
      tiedBasePath: tiedBase,
      collectMetrics: false,
      projectBasename: "brownfield",
    });
    const cfg = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
    assert.ok(cfg.mcpServers["org-kb"]);
    assert.ok(cfg.mcpServers["tied-yaml"]);
    assert.ok(cfg.mcpServers["tied-yaml-optin"]);
  });

  it("initializeClaudeMcpConfig merges opt-in when tied-yaml already exists", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-claude-merge-"));
    fs.mkdirSync(path.join(tmp, "tied-project"), { recursive: true });
    const mcpJsonPath = path.join(tmp, ".mcp.json");
    const dist = path.join(TIED_REPO_ROOT, "mcp-server", "dist", "index.js");
    fs.writeFileSync(
      mcpJsonPath,
      `${JSON.stringify(
        {
          mcpServers: {
            "tied-yaml": buildTiedMcpServerEntry({
              tiedMcpIndexJs: dist,
              tiedBasePath: path.join(tmp, "tied-project"),
              collectMetrics: false,
              toolProfile: "core",
              projectBasename: "legacy",
            }),
          },
        },
        null,
        2,
      )}\n`,
    );
    assert.equal(tiedMcpServersUpToDate(JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"))), false);
    const result = initializeClaudeMcpConfig(tmp, TIED_REPO_ROOT, { env: {} });
    assert.equal(result.action, "merged");
    const cfg = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
    assert.ok(cfg.mcpServers["tied-yaml-optin"]);
    assert.equal(cfg.mcpServers["tied-yaml-optin"].env.TIED_MCP_TOOL_PROFILE, "optin");
  });
});
