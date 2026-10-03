import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installMcpLayer } from "./mcp.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";

describe("mcp layer [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("linked mode sets TIED_METHODOLOGY_BUNDLE_PATH in mcp.json", () => {
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
    assert.ok(env.TIED_METHODOLOGY_BUNDLE_PATH);
    assert.ok(env.TIED_STORE_ROOT);
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
    assert.equal(env.TIED_METHODOLOGY_BUNDLE_PATH, undefined);
    assert.equal(env.TIED_STORE_ROOT, undefined);
  });
});
