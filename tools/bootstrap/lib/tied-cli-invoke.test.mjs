import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { invokeTiedCliMcpTool, resolveTiedMcpStdioClientPath } from "./tied-cli-invoke.mjs";
import { resolveTiedLayout } from "./layout.mjs";

describe("invokeTiedCliMcpTool [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]", () => {
  it("yaml_index_list_tokens succeeds against engine store", () => {
    const clientJs = resolveTiedMcpStdioClientPath(TIED_REPO_ROOT);
    assert.ok(fs.existsSync(clientJs), clientJs);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-doctor-"));
    fs.mkdirSync(path.join(tmp, "tied-project"), { recursive: true });
    const layout = resolveTiedLayout(tmp);
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
});
