/**
 * [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT] — RED/GREEN: canonical mcp.json key ordering.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalizeMcpJsonDocument } from "./mcp-json-canonical.mjs";

function assertKeysSorted(obj, label = "object") {
  const keys = Object.keys(obj);
  const sorted = [...keys].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(keys, sorted, `${label} keys not sorted: ${keys.join(", ")}`);
}

describe("canonicalizeMcpJsonDocument [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT]", () => {
  it("sorts mcpServers names and tied-yaml env keys alphabetically", () => {
    const cfg = {
      mcpServers: {
        "tied-yaml": {
          type: "stdio",
          disabled: false,
          command: "node",
          args: ["/first/path.js", "/second/path.js"],
          env: {
            TIED_STORE_ROOT: "/store",
            TIED_CLIENT_PROJECT_PATH: "/project",
            TIED_MCP_METRICS_CLIENT: "stdd",
            TIED_MCP_COLLECT_METRICS: "1",
            TIED_CLIENT_BUNDLE_PATH: "/bundle",
          },
        },
        "org-kb": {
          url: "https://example.test",
          headers: { Authorization: "Bearer x", "X-Custom": "y" },
        },
      },
    };
    const out = canonicalizeMcpJsonDocument(cfg);
    assertKeysSorted(out, "root");
    assertKeysSorted(out.mcpServers, "mcpServers");
    assertKeysSorted(out.mcpServers["org-kb"], "org-kb entry");
    assertKeysSorted(out.mcpServers["tied-yaml"], "tied-yaml entry");
    assertKeysSorted(out.mcpServers["tied-yaml"].env, "tied-yaml env");
    assertKeysSorted(out.mcpServers["org-kb"].headers, "org-kb headers");
    assert.deepEqual(out.mcpServers["tied-yaml"].args, ["/first/path.js", "/second/path.js"]);
    assert.deepEqual(Object.keys(out.mcpServers), ["org-kb", "tied-yaml"]);
    assert.deepEqual(Object.keys(out.mcpServers["tied-yaml"].env), [
      "TIED_CLIENT_BUNDLE_PATH",
      "TIED_CLIENT_PROJECT_PATH",
      "TIED_MCP_COLLECT_METRICS",
      "TIED_MCP_METRICS_CLIENT",
      "TIED_STORE_ROOT",
    ]);
  });

  it("does not mutate input object", () => {
    const cfg = { mcpServers: { a: { env: { Z: "1", A: "2" } } } };
    const before = JSON.stringify(cfg);
    canonicalizeMcpJsonDocument(cfg);
    assert.equal(JSON.stringify(cfg), before);
  });
});
