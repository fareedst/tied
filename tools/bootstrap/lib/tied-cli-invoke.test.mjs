import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { invokeTiedCliMcpTool, resolveTiedMcpStdioClientPath } from "./tied-cli-invoke.mjs";
import { resolveTiedLayout } from "./layout.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";
import { ENV_CLIENT_PROJECT_PATH } from "./tied-path-env.mjs";

function writeClientMcp(projectRoot, rel, tiedBasePath) {
  const dir = path.dirname(path.join(projectRoot, rel));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, rel),
    `${JSON.stringify(
      {
        mcpServers: {
          "tied-yaml": {
            env: { [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedBasePath) },
          },
        },
      },
      null,
      2,
    )}\n`,
  );
}

function seedTiedProject(tiedDir) {
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
}

describe("invokeTiedCliMcpTool [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]", () => {
  it("yaml_index_list_tokens succeeds against engine store", () => {
    const clientJs = resolveTiedMcpStdioClientPath(TIED_REPO_ROOT);
    assert.ok(fs.existsSync(clientJs), clientJs);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-doctor-"));
    const layout = resolveTiedLayout(tmp);
    seedTiedProject(layout.tiedDir);
    const bundle = layout.bundleDir;
    fs.mkdirSync(bundle, { recursive: true });
    fs.copyFileSync(
      path.join(TIED_REPO_ROOT, "tied-bundle", "requirements.yaml"),
      path.join(bundle, "requirements.yaml"),
    );
    const result = invokeTiedCliMcpTool({
      projectRoot: tmp,
      storeRoot: TIED_REPO_ROOT,
      toolName: "yaml_index_list_tokens",
      argsJson: '{"index":"requirements"}',
      env: {
        TIED_BASE_PATH: layout.tiedDir,
        TIED_METHODOLOGY_BUNDLE_PATH: bundle,
      },
    });
    assert.equal(result.ok, true, result.stderr || result.stdout);
  });

  it("tied_config_get_base_path matches .cursor/mcp.json without TIED_BASE_PATH env", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-cli-mcp-cursor-"));
    const layout = resolveTiedLayout(tmp);
    seedTiedProject(layout.tiedDir);
    writeClientMcp(tmp, ".cursor/mcp.json", layout.tiedDir);
    const bundle = layout.bundleDir;
    fs.mkdirSync(bundle, { recursive: true });
    fs.copyFileSync(
      path.join(TIED_REPO_ROOT, "tied-bundle", "requirements.yaml"),
      path.join(bundle, "requirements.yaml"),
    );
    const result = invokeTiedCliMcpTool({
      projectRoot: tmp,
      storeRoot: TIED_REPO_ROOT,
      toolName: "tied_config_get_base_path",
      argsJson: "{}",
      env: {
        TIED_CLIENT_PROJECT_PATH: "",
        TIED_CLIENT_BUNDLE_PATH: bundle,
      },
    });
    assert.equal(result.ok, true, result.stderr || result.stdout);
    assert.match(result.stdout, new RegExp(jsonSafeAbsolute(layout.tiedDir)));
  });

  it("tied_config_get_base_path matches Claude-only .mcp.json without TIED_BASE_PATH env", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-cli-mcp-claude-"));
    const layout = resolveTiedLayout(tmp);
    seedTiedProject(layout.tiedDir);
    writeClientMcp(tmp, ".mcp.json", layout.tiedDir);
    const bundle = layout.bundleDir;
    fs.mkdirSync(bundle, { recursive: true });
    fs.copyFileSync(
      path.join(TIED_REPO_ROOT, "tied-bundle", "requirements.yaml"),
      path.join(bundle, "requirements.yaml"),
    );
    const result = invokeTiedCliMcpTool({
      projectRoot: tmp,
      storeRoot: TIED_REPO_ROOT,
      toolName: "tied_config_get_base_path",
      argsJson: "{}",
      env: {
        TIED_CLIENT_PROJECT_PATH: "",
        TIED_CLIENT_BUNDLE_PATH: bundle,
      },
    });
    assert.equal(result.ok, true, result.stderr || result.stdout);
    assert.match(result.stdout, new RegExp(jsonSafeAbsolute(layout.tiedDir)));
  });
});
