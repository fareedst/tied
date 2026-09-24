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
import {
  assertWindowsBootstrapClaude,
  WINDOWS_CLAUDE_SMOKE_FAIL,
} from "./assert-windows-bootstrap-claude.mjs";
import {
  SKILLS_REROOT_ENV,
  resolveSkillsInstallDir,
  skillsRerootEnabledFromEnv,
} from "./skills-reroot.mjs";

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

describe("ASSERT_WINDOWS_BOOTSTRAP_CLAUDE [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  // [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
  // How: Assert Claude skills inventory and repo-root .mcp.json after Windows bootstrap (shared with smoke .cmd).

  it("RED: fails when .claude/skills and repo-root .mcp.json are absent", () => {
    const clientRoot = tempClient();
    const skills = assertWindowsBootstrapClaude(clientRoot);
    assert.equal(skills.ok, false);
    assert.equal(skills.message, WINDOWS_CLAUDE_SMOKE_FAIL.SKILLS_DIR);
  });

  it("GREEN: passes after bootstrapTied dual-harness install", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
    fs.writeFileSync(mcpPath, `${JSON.stringify({ mcpServers: {} }, null, 2)}\n`, "utf8");

    assertMcpPrerequisite(TIED_REPO_ROOT);
    bootstrapTied(clientRoot, { env: process.env });

    const result = assertWindowsBootstrapClaude(clientRoot);
    assert.equal(result.ok, true);
    assert.deepEqual(result.asserts, ["claude_skills", "mcp_json_tied_yaml"]);
  });
});

describe("CONFIG_SKILLS_REROOT [REQ-TIED_CLAUDE_SKILLS_REROOT]", () => {
  it("default resolves harness-native skills dirs", () => {
    const clientRoot = tempClient();
    const opts = {
      skills_reroot_enabled: false,
      windows_copy_proven_in_ci: true,
      tiedRepoRoot: TIED_REPO_ROOT,
    };
    assert.equal(
      resolveSkillsInstallDir(clientRoot, "cursor", opts),
      path.join(clientRoot, ".cursor", "skills"),
    );
    assert.equal(
      resolveSkillsInstallDir(clientRoot, "claude", opts),
      path.join(clientRoot, ".claude", "skills"),
    );
  });

  it("RED: rejects re-root without Windows copy proof", () => {
    const clientRoot = tempClient();
    assert.throws(
      () =>
        resolveSkillsInstallDir(clientRoot, "claude", {
          skills_reroot_enabled: true,
          windows_copy_proven_in_ci: false,
          tiedRepoRoot: TIED_REPO_ROOT,
        }),
      /REROOT_WITHOUT_WINDOWS_PROOF/,
    );
  });

  it("RED: rejects re-root without ARCH decision file", () => {
    const clientRoot = tempClient();
    const bareTiedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-no-arch-"));
    assert.throws(
      () =>
        resolveSkillsInstallDir(clientRoot, "claude", {
          skills_reroot_enabled: true,
          windows_copy_proven_in_ci: true,
          tiedRepoRoot: bareTiedRoot,
        }),
      /REROOT_WITHOUT_ARCH/,
    );
  });

  it("GREEN: installs Claude managed inventory under repo-root skills/ when re-root enabled", () => {
    const clientRoot = tempClient();
    const skillsDir = resolveSkillsInstallDir(clientRoot, "claude", {
      skills_reroot_enabled: true,
      windows_copy_proven_in_ci: true,
      tiedRepoRoot: TIED_REPO_ROOT,
    });
    assert.equal(skillsDir, path.join(clientRoot, "skills"));
    const paths = manifestPaths();
    paths.tiedRepoRoot = TIED_REPO_ROOT;
    installClaudeSkills(clientRoot, paths, {
      skills_reroot_enabled: true,
      windows_copy_proven_in_ci: true,
      tiedRepoRoot: TIED_REPO_ROOT,
      skillsInstallDir: skillsDir,
    });
    assert.ok(fs.existsSync(path.join(skillsDir, "tied-yaml", "scripts", "tied-cli.sh")));
    assert.ok(fs.existsSync(path.join(skillsDir, "build-plan", "SKILL.md")));
  });

  it("bootstrap with TIED_SKILLS_REROOT=1 places Cursor skills under repo-root skills/", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
    fs.writeFileSync(mcpPath, `${JSON.stringify({ mcpServers: {} }, null, 2)}\n`, "utf8");
    assertMcpPrerequisite(TIED_REPO_ROOT);
    bootstrapTied(clientRoot, {
      env: { ...process.env, [SKILLS_REROOT_ENV]: "1" },
    });
    const rerootDir = path.join(clientRoot, "skills");
    assert.ok(fs.existsSync(path.join(rerootDir, "tied-yaml", "scripts", "tied-cli.sh")));
    assert.ok(fs.existsSync(path.join(rerootDir, "build-plan", "SKILL.md")));
    assert.equal(fs.existsSync(path.join(clientRoot, ".cursor", "skills", "tied-yaml")), false);
    assert.ok(skillsRerootEnabledFromEnv({ [SKILLS_REROOT_ENV]: "1" }));
  });

  it("Windows assert honors re-root layout after bootstrapTied", () => {
    const clientRoot = tempClient();
    const mcpPath = path.join(clientRoot, ".cursor", "mcp.json");
    fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
    fs.writeFileSync(mcpPath, `${JSON.stringify({ mcpServers: {} }, null, 2)}\n`, "utf8");
    assertMcpPrerequisite(TIED_REPO_ROOT);
    bootstrapTied(clientRoot, {
      env: { ...process.env, [SKILLS_REROOT_ENV]: "1" },
    });
    const result = assertWindowsBootstrapClaude(clientRoot, { skills_reroot_enabled: true });
    assert.equal(result.ok, true);
  });
});

describe("GATE_SYMLINK_ON_WINDOWS_PROOF [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  it("RED: rejects symlink opt-in without CI Windows copy proof", () => {
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

  it("GREEN: allows Unix symlink opt-in when windows_copy_proven_in_ci is true", () => {
    if (process.platform === "win32") {
      return;
    }
    const clientRoot = tempClient();
    const paths = manifestPaths();
    paths.tiedRepoRoot = TIED_REPO_ROOT;

    const result = installClaudeSkills(clientRoot, paths, {
      symlink_unix_opt_in: true,
      windows_copy_proven_in_ci: true,
    });

    assert.ok(result.installedPaths.length > 0);
    const buildPlanDest = path.join(clientRoot, ".claude", "skills", "build-plan");
    assert.ok(fs.existsSync(buildPlanDest));
    assert.ok(fs.lstatSync(buildPlanDest).isSymbolicLink());
    const tiedYamlDest = path.join(clientRoot, ".claude", "skills", "tied-yaml");
    assert.ok(fs.existsSync(tiedYamlDest));
    assert.equal(fs.lstatSync(tiedYamlDest).isSymbolicLink(), false);
  });
});
