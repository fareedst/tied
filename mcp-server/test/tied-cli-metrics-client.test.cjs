/**
 * [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
 * How: tied-cli.sh resolves TIED_MCP_METRICS_CLIENT from env, --client, or dev/test project_root.
 */
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
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
const TIED_CLI_SOURCE = fs.existsSync(TIED_CLI_BUNDLED) ? TIED_CLI_BUNDLED : TIED_CLI_CURSOR;
const MCP_BIN = path.join(MCP_ROOT, "dist/index.js");
const TIED_PROJECT = path.join(REPO_ROOT, "tied-project");

function seedInstallMcp(projectRoot, tiedProjectPath) {
  fs.mkdirSync(path.join(projectRoot, ".cursor"), { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, ".cursor/mcp.json"),
    `${JSON.stringify(
      {
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: [MCP_BIN],
            env: {
              TIED_CLIENT_PROJECT_PATH: tiedProjectPath,
              TIED_STORE_ROOT: REPO_ROOT,
            },
          },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function runTiedCliWithStub(stubBody, cliArgs, extraEnv = {}, deleteEnv = []) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-cli-metrics-client-"));
  seedInstallMcp(tempDir, TIED_PROJECT);
  const stubPath = path.join(tempDir, "tied-mcp-stdio-client-stub.cjs");
  fs.writeFileSync(stubPath, stubBody, "utf8");
  const env = {
    ...process.env,
    TIED_MCP_BIN: MCP_BIN,
    TIED_MCP_COLLECT_METRICS: "1",
    TIED_CLI_STDIO_CLIENT_PATH: stubPath,
    ...extraEnv,
  };
  delete env.TIED_BASE_PATH;
  delete env.TIED_CLIENT_PROJECT_PATH;
  delete env.TIED_CLIENT_BUNDLE_PATH;
  delete env.TIED_METHODOLOGY_BUNDLE_PATH;
  delete env.TIED_PATH_AUTHORITY;
  if (!Object.prototype.hasOwnProperty.call(extraEnv, "TIED_MCP_METRICS_CLIENT")) {
    delete env.TIED_MCP_METRICS_CLIENT;
  }
  for (const key of deleteEnv) {
    delete env[key];
  }
  const result = spawnSync("bash", [TIED_CLI_SOURCE, ...cliArgs], {
    encoding: "utf8",
    cwd: tempDir,
    env,
  });
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  return result;
}

describe("tied-cli metrics client attribution", () => {
  const stub = [
    'console.log(JSON.stringify({ client: process.env.TIED_MCP_METRICS_CLIENT || null }));',
    "process.exit(0);",
    "",
  ].join("\n");

  it("preserves TIED_MCP_METRICS_CLIENT from the environment", () => {
    if (!fs.existsSync(TIED_CLI_SOURCE) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }
    const result = runTiedCliWithStub(stub, ["tied_validate_consistency", "{}"], {
      TIED_MCP_METRICS_CLIENT: "explicit-env-client",
    });
    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout.trim()), {
      client: "explicit-env-client",
    });
  });

  it("accepts --client before the tool name", () => {
    if (!fs.existsSync(TIED_CLI_SOURCE) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }
    const result = runTiedCliWithStub(stub, [
      "--client",
      "1787507684",
      "tied_validate_consistency",
      "{}",
    ]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout.trim()), {
      client: "1787507684",
    });
  });

  it("derives client id from project_root under dev/test", () => {
    if (!fs.existsSync(TIED_CLI_SOURCE) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }
    const args = JSON.stringify({
      request_token: "REQ-EXAMPLE",
      project_root: "/Users/fareed/Documents/dev/test/1787507684",
    });
    const result = runTiedCliWithStub(stub, [
      "tied_checklist_activation_collect",
      args,
    ]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout.trim()), {
      client: "1787507684",
    });
  });

  it("falls back to tied-cli when no client hint is available", () => {
    if (!fs.existsSync(TIED_CLI_SOURCE) || !fs.existsSync(MCP_BIN)) {
      console.log("skip: tied-cli.sh or dist/index.js missing");
      return;
    }
    const result = runTiedCliWithStub(stub, ["tied_validate_consistency", "{}"], {}, [
      "TIED_MCP_METRICS_CLIENT",
    ]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout.trim()), {
      client: "tied-cli",
    });
  });
});
