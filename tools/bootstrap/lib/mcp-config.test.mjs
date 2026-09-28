/**
 * [IMPL-TIED_FILES] [IMPL-MCP_USAGE_METRICS] [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS]
 * How: resolveBootstrapMetricsClient prefers disposable dev/test id over inherited shell env.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import { resolveBootstrapMetricsClient } from "./mcp-config.mjs";

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
