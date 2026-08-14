import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { formatDefaultSourceReport, resolveLocalDefaults } from "./defaults.js";

describe("LOCAL_DEFAULTS REQ-FEAT_LOCAL_DEFAULTS", () => {
  it("uses explicit values before environment and local discovery", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-defaults-"));
    const localBin = path.join(root, "mcp-server", "dist", "index.js");
    fs.mkdirSync(path.dirname(localBin), { recursive: true });
    fs.writeFileSync(localBin, "server");
    const explicitBin = path.join(root, "explicit.js");
    fs.writeFileSync(explicitBin, "server");
    const result = resolveLocalDefaults(
      { mcpBin: explicitBin, basePath: path.join(root, "explicit-tied") },
      { TIED_MCP_BIN: localBin, TIED_BASE_PATH: path.join(root, "env-tied") },
      root,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.defaults.mcp_bin.value, explicitBin);
    assert.equal(result.defaults.mcp_bin.source, "explicit");
    assert.equal(result.defaults.base_path.value, path.join(root, "explicit-tied"));
    assert.equal(result.defaults.base_path.source, "explicit");
    assert.equal(result.mutated_configuration, false);
  });

  it("reports source and corrective command for missing prerequisites", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-defaults-"));
    const result = resolveLocalDefaults({}, {}, root);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.diagnostics.join(" "), /TIED_MCP_BIN/);
    assert.match(result.diagnostics.join(" "), /npm run build/);
    assert.equal(formatDefaultSourceReport(result.report).mutating, false);
  });
});
