/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * G2 pilot: tied-cli subprocess reads match in-process loaders when only TIED_METHODOLOGY_BUNDLE_PATH is set.
 */
"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const MCP_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(MCP_ROOT, "..");
const TIED_CLI_BUNDLED = path.join(
  REPO_ROOT,
  "tools/bundled-tied-yaml-skill/scripts/tied-cli.sh"
);
const TIED_CLI_CURSOR = path.join(
  REPO_ROOT,
  ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
);
const TIED_CLI = fs.existsSync(TIED_CLI_BUNDLED) ? TIED_CLI_BUNDLED : TIED_CLI_CURSOR;
const MCP_BIN = path.join(MCP_ROOT, "dist/index.js");

function tiedCli(tool, argsJson, env) {
  return spawnSync("bash", [TIED_CLI, tool, argsJson], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    maxBuffer: 10 * 1024 * 1024,
  });
}

function parseCliJson(result, label) {
  assert.strictEqual(result.status, 0, `${label} stderr: ${result.stderr}\nstdout: ${result.stdout?.slice(0, 800)}`);
  return JSON.parse(result.stdout.trim());
}

describe("G2 bundled methodology pilot tied-cli parity [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]", () => {
  beforeEach(() => {
    delete process.env.TIED_BASE_PATH;
    delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
  });

  it("tied-cli reads match in-process loaders for bundle-only pilot client (no local methodology/)", async () => {
    if (!fs.existsSync(TIED_CLI) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }

    const { writeCopiedTreeFixture, captureMethodologyReadProbe } = await import(
      "../dist/bundled-methodology-read.js"
    );
    const { clearBasePathCache, listTokens } = await import("../dist/yaml-loader.js");

    const pilotClient = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-g2-client-"));
    const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-g2-bundle-"));
    try {
      writeCopiedTreeFixture(pilotClient, bundleDir, { omitLocalMethodology: true });
      assert.ok(!fs.existsSync(path.join(pilotClient, "methodology")));

      const pilotEnv = {
        TIED_BASE_PATH: pilotClient,
        TIED_METHODOLOGY_BUNDLE_PATH: bundleDir,
        TIED_MCP_BIN: MCP_BIN,
      };

      process.env.TIED_BASE_PATH = pilotClient;
      process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundleDir;
      clearBasePathCache();
      const inProcess = captureMethodologyReadProbe([
        "REQ-METH-ONLY",
        "REQ-FALLBACK",
        "REQ-PROJECT-ONLY",
      ]);

      const cliDetail = parseCliJson(
        tiedCli("yaml_detail_read", '{"token":"REQ-METH-ONLY"}', pilotEnv),
        "yaml_detail_read REQ-METH-ONLY"
      );
      const cliDetailName =
        cliDetail["REQ-METH-ONLY"]?.name ?? cliDetail.name ?? null;
      assert.strictEqual(cliDetailName, inProcess.tokens["REQ-METH-ONLY"].detail_name);

      const cliList = parseCliJson(
        tiedCli("yaml_index_list_tokens", '{"index":"requirements"}', pilotEnv),
        "yaml_index_list_tokens requirements"
      );
      assert.ok(Array.isArray(cliList));
      const inProcessIndexTokens = listTokens("requirements");
      assert.deepStrictEqual([...cliList].sort(), [...inProcessIndexTokens].sort());

      const cliIndexRow = parseCliJson(
        tiedCli("yaml_index_read", '{"index":"requirements","token":"REQ-METH-ONLY"}', pilotEnv),
        "yaml_index_read REQ-METH-ONLY"
      );
      const indexName =
        cliIndexRow["REQ-METH-ONLY"]?.name ??
        cliIndexRow.name ??
        null;
      assert.strictEqual(indexName, "Methodology only");

      const cliFallback = parseCliJson(
        tiedCli("yaml_detail_read", '{"token":"REQ-FALLBACK"}', pilotEnv),
        "yaml_detail_read REQ-FALLBACK"
      );
      const fallbackName =
        cliFallback["REQ-FALLBACK"]?.name ?? cliFallback.name ?? null;
      assert.strictEqual(fallbackName, inProcess.tokens["REQ-FALLBACK"].detail_name);
      assert.strictEqual(fallbackName, "Methodology copy");

      assert.strictEqual(inProcess.bundled, true);
      assert.ok(inProcess.methodology_base?.includes(bundleDir));
    } finally {
      delete process.env.TIED_BASE_PATH;
      delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
      fs.rmSync(pilotClient, { recursive: true, force: true });
      fs.rmSync(bundleDir, { recursive: true, force: true });
    }
  });
});
