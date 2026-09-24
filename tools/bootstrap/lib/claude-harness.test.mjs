/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
 * How: RED/GREEN contract tests for Phase 1 dual bootstrap (Claude skills + repo-root .mcp.json).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { initializeTiedMcpConfig, initializeClaudeMcpConfig } from "./mcp-config.mjs";
import { installClaudeSkills } from "./skills.mjs";
import { bootstrapTied } from "./bootstrap.mjs";
import { manifestPaths, TIED_REPO_ROOT } from "./constants.mjs";
import { assertMcpPrerequisite } from "./mcp-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tempClient() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-claude-bootstrap-"));
  fs.mkdirSync(path.join(root, "tied"), { recursive: true });
  return root;
}

describe("PRESERVE_CURSOR_MCP_INIT [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("does not mutate existing .cursor/mcp.json (create-only policy)", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
    const foreign = { mcpServers: { foreign: { type: "stdio", command: "echo" } } };
    fs.writeFileSync(mcpPath, `${JSON.stringify(foreign, null, 2)}\n`, "utf8");
    const before = fs.readFileSync(mcpPath, "utf8");

    assertMcpPrerequisite(TIED_REPO_ROOT);
    const result = initializeTiedMcpConfig(clientRoot, TIED_REPO_ROOT, {});

    assert.equal(result.initialized, false);
    assert.equal(fs.readFileSync(mcpPath, "utf8"), before);
  });
});

describe("INITIALIZE_CLAUDE_MCP_CONFIG [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("creates repo-root .mcp.json with tied-yaml and TIED_MCP_HARNESS=claude when absent", () => {
    const clientRoot = tempClient();
    assertMcpPrerequisite(TIED_REPO_ROOT);

    const result = initializeClaudeMcpConfig(clientRoot, TIED_REPO_ROOT, {
      harnessLabel: "claude",
    });

    assert.equal(result.action, "created");
    const cfg = JSON.parse(fs.readFileSync(path.join(clientRoot, ".mcp.json"), "utf8"));
    assert.ok(cfg.mcpServers["tied-yaml"]);
    assert.equal(cfg.mcpServers["tied-yaml"].env.TIED_MCP_HARNESS, "claude");
    assert.ok(path.isAbsolute(cfg.mcpServers["tied-yaml"].env.TIED_BASE_PATH));
  });

  it("merges tied-yaml only when foreign servers exist", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".mcp.json");
    const foreign = {
      mcpServers: {
        other: { type: "stdio", command: "node", args: ["other-server.js"] },
      },
    };
    fs.writeFileSync(mcpPath, `${JSON.stringify(foreign, null, 2)}\n`, "utf8");
    assertMcpPrerequisite(TIED_REPO_ROOT);

    const result = initializeClaudeMcpConfig(clientRoot, TIED_REPO_ROOT, { harnessLabel: "claude" });
    assert.equal(result.action, "merged");

    const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    assert.deepEqual(cfg.mcpServers.other, foreign.mcpServers.other);
    assert.ok(cfg.mcpServers["tied-yaml"]);
    assert.equal(cfg.mcpServers["tied-yaml"].env.TIED_MCP_HARNESS, "claude");
  });

  it("noop when tied-yaml already present", () => {
    const clientRoot = tempClient();
    assertMcpPrerequisite(TIED_REPO_ROOT);
    initializeClaudeMcpConfig(clientRoot, TIED_REPO_ROOT, { harnessLabel: "claude" });
    const afterFirst = fs.readFileSync(path.join(clientRoot, ".mcp.json"), "utf8");

    const result = initializeClaudeMcpConfig(clientRoot, TIED_REPO_ROOT, { harnessLabel: "claude" });
    assert.equal(result.action, "noop");
    assert.equal(fs.readFileSync(path.join(clientRoot, ".mcp.json"), "utf8"), afterFirst);
  });
});

describe("INSTALL_CLAUDE_SKILLS [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("copy-default installs bundled prompt-type and tied-yaml skills under .claude/skills/", () => {
    const clientRoot = tempClient();
    const paths = manifestPaths();
    paths.tiedRepoRoot = TIED_REPO_ROOT;

    const result = installClaudeSkills(clientRoot, paths, {});
    assert.ok(Array.isArray(result.installedPaths));
    assert.ok(result.installedPaths.length > 0);

    const tiedCli = path.join(clientRoot, ".claude", "skills", "tied-yaml", "scripts", "tied-cli.sh");
    const buildPlan = path.join(clientRoot, ".claude", "skills", "build-plan", "SKILL.md");
    const shared = path.join(clientRoot, ".claude", "skills", "prompt-shared");
    assert.ok(fs.existsSync(tiedCli));
    assert.ok(fs.existsSync(buildPlan));
    assert.ok(fs.existsSync(shared));
  });

  it("preserves unrelated skills already under .claude/skills/", () => {
    const clientRoot = tempClient();
    const customDir = path.join(clientRoot, ".claude", "skills", "custom-operator-skill");
    fs.mkdirSync(customDir, { recursive: true });
    fs.writeFileSync(path.join(customDir, "SKILL.md"), "# custom\n", "utf8");

    const paths = manifestPaths();
    paths.tiedRepoRoot = TIED_REPO_ROOT;
    installClaudeSkills(clientRoot, paths, {});

    assert.ok(fs.existsSync(path.join(customDir, "SKILL.md")));
  });

});

describe("BOOTSTRAP_TIED dual harness binding [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("orchestration installs Claude artifacts and preserves existing .cursor/mcp.json", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
    const foreign = { mcpServers: { foreign: { type: "stdio", command: "echo" } } };
    fs.writeFileSync(mcpPath, `${JSON.stringify(foreign, null, 2)}\n`, "utf8");
    const before = fs.readFileSync(mcpPath, "utf8");

    assertMcpPrerequisite(TIED_REPO_ROOT);
    bootstrapTied(clientRoot, { env: process.env });

    assert.equal(fs.readFileSync(mcpPath, "utf8"), before);
    const tiedCli = path.join(clientRoot, ".claude", "skills", "tied-yaml", "scripts", "tied-cli.sh");
    assert.ok(fs.existsSync(tiedCli));
    const rootMcp = JSON.parse(fs.readFileSync(path.join(clientRoot, ".mcp.json"), "utf8"));
    assert.equal(rootMcp.mcpServers["tied-yaml"].env.TIED_MCP_HARNESS, "claude");
    assert.ok(fs.existsSync(path.join(clientRoot, "CLAUDE.md")));
  });
});

describe("INSTALL_CLAUDE_SKILLS symlink gate [REQ-TIED_CLAUDE_HARNESS]", () => {
  it("rejects symlink opt-in without CI Windows copy proof", () => {
    const clientRoot = tempClient();
    const paths = manifestPaths();
    paths.tiedRepoRoot = TIED_REPO_ROOT;

    assert.throws(
      () =>
        installClaudeSkills(clientRoot, paths, {
          symlink_unix_opt_in: true,
          windows_copy_proven_in_ci: false,
        }),
      /SYMLINK_WITHOUT_CI_WINDOWS_PROOF/,
    );
  });
});
