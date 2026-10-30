import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  readTiedBasePathFromProjectMcp,
  readTiedYamlEnvFromProjectMcp,
  resolveProjectRootFromCwd,
  resolveTiedCliEnvFromCwd,
  DIAGNOSTIC_PREFIX,
} from "./mcp-base-path.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";
import { ENV_CLIENT_PROJECT_PATH } from "./tied-path-env.mjs";

function writeMcp(projectRoot, rel, tiedBasePath, { legacy = false } = {}) {
  const dir = path.dirname(path.join(projectRoot, rel));
  fs.mkdirSync(dir, { recursive: true });
  const abs = jsonSafeAbsolute(tiedBasePath);
  const env = legacy
    ? { TIED_BASE_PATH: abs }
    : { [ENV_CLIENT_PROJECT_PATH]: abs };
  const payload = {
    mcpServers: {
      "tied-yaml": {
        env,
      },
    },
  };
  fs.writeFileSync(path.join(projectRoot, rel), `${JSON.stringify(payload, null, 2)}\n`);
}

function seedTiedProject(tiedDir) {
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
}

describe("mcp-base-path [REQ-TIED_CLI_MCP_JSON_BASE_PATH]", () => {
  it("reads canonical project path from .cursor/mcp.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-cursor-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcp(tmp, ".cursor/mcp.json", tiedDir);
    assert.equal(readTiedBasePathFromProjectMcp(tmp), jsonSafeAbsolute(tiedDir));
  });

  it("reads legacy TIED_BASE_PATH from Claude-only .mcp.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-claude-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcp(tmp, ".mcp.json", tiedDir, { legacy: true });
    assert.equal(readTiedBasePathFromProjectMcp(tmp), jsonSafeAbsolute(tiedDir));
  });

  it("prefers .cursor/mcp.json when both files define different paths", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-both-"));
    const cursorTied = path.join(tmp, "tied-project");
    const claudeTied = path.join(tmp, "other-tied-project");
    seedTiedProject(cursorTied);
    seedTiedProject(claudeTied);
    writeMcp(tmp, ".cursor/mcp.json", cursorTied);
    writeMcp(tmp, ".mcp.json", claudeTied);
    assert.equal(readTiedBasePathFromProjectMcp(tmp), jsonSafeAbsolute(cursorTied));
  });

  it("returns null when neither mcp file exists", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-none-"));
    assert.equal(readTiedBasePathFromProjectMcp(tmp), null);
  });

  it("resolveTiedCliEnvFromCwd fails closed without mcp config", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-fail-"));
    assert.throws(
      () => resolveTiedCliEnvFromCwd(tmp, {}),
      (err) => {
        assert.match(String(err.message), new RegExp(DIAGNOSTIC_PREFIX));
        return true;
      },
    );
  });

  it("env TIED_BASE_PATH overrides mcp.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-env-"));
    const tiedDir = path.join(tmp, "tied-project");
    const wrongDir = path.join(tmp, "wrong-tied-project");
    seedTiedProject(tiedDir);
    fs.mkdirSync(wrongDir, { recursive: true });
    writeMcp(tmp, ".cursor/mcp.json", wrongDir);
    const resolved = resolveTiedCliEnvFromCwd(tmp, { TIED_BASE_PATH: tiedDir });
    assert.equal(resolved.TIED_CLIENT_PROJECT_PATH, jsonSafeAbsolute(tiedDir));
  });

  it("reads TIED_CLIENT_PROJECT_PATH from mcp.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-canonical-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcp(tmp, ".cursor/mcp.json", tiedDir);
    const resolved = resolveTiedCliEnvFromCwd(tmp, {});
    assert.equal(resolved.TIED_CLIENT_PROJECT_PATH, jsonSafeAbsolute(tiedDir));
  });

  it("resolveProjectRootFromCwd walks up to mcp sentinel", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-base-walk-"));
    const tiedDir = path.join(tmp, "tied-project");
    seedTiedProject(tiedDir);
    writeMcp(tmp, ".cursor/mcp.json", tiedDir);
    const nested = path.join(tmp, "apps", "svc");
    fs.mkdirSync(nested, { recursive: true });
    assert.equal(resolveProjectRootFromCwd(nested), path.resolve(tmp));
  });
});
