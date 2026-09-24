/**
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
 * [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: ASSERT_WINDOWS_BOOTSTRAP_CLAUDE — shared checks for Windows smoke and Unix unit tests.
 */
import fs from "node:fs";
import path from "node:path";

/** Fail messages aligned with working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/phase0/windows_smoke_assert_list.md */
export const WINDOWS_CLAUDE_SMOKE_FAIL = {
  SKILLS_DIR: "FAIL: .claude\\skills missing",
  SKILLS_REROOT_DIR: "FAIL: skills\\ missing",
  INVENTORY: "FAIL: Claude skills inventory incomplete",
  MCP_JSON: "FAIL: repo-root .mcp.json missing",
  TIED_YAML: "FAIL: mcpServers.tied-yaml missing",
};

/**
 * Managed inventory policy matches tools/bootstrap/lib/claude-harness.test.mjs INSTALL_CLAUDE_SKILLS.
 */
export function claudeManagedInventoryComplete(smokeClientRoot, skillsRootOverride) {
  const skillsRoot =
    skillsRootOverride ?? path.join(smokeClientRoot, ".claude", "skills");
  if (!fs.existsSync(skillsRoot)) {
    return false;
  }
  const tiedCli = path.join(skillsRoot, "tied-yaml", "scripts", "tied-cli.sh");
  const buildPlan = path.join(skillsRoot, "build-plan", "SKILL.md");
  const shared = path.join(skillsRoot, "prompt-shared");
  return fs.existsSync(tiedCli) && fs.existsSync(buildPlan) && fs.existsSync(shared);
}

function resolveSmokeSkillsRoot(smokeClientRoot, assertOptions = {}) {
  if (assertOptions.skills_reroot_enabled) {
    return path.join(smokeClientRoot, "skills");
  }
  return path.join(smokeClientRoot, ".claude", "skills");
}

/**
 * @returns {{ ok: true, asserts: string[] } | { ok: false, code: string, message: string }}
 */
export function assertWindowsBootstrapClaude(smokeClientRoot, assertOptions = {}) {
  const skillsRoot = resolveSmokeSkillsRoot(smokeClientRoot, assertOptions);
  if (!fs.existsSync(skillsRoot)) {
    const message = assertOptions.skills_reroot_enabled
      ? WINDOWS_CLAUDE_SMOKE_FAIL.SKILLS_REROOT_DIR
      : WINDOWS_CLAUDE_SMOKE_FAIL.SKILLS_DIR;
    return { ok: false, code: "CLAUDE_SKILLS_MISSING", message };
  }
  if (!claudeManagedInventoryComplete(smokeClientRoot, skillsRoot)) {
    return { ok: false, code: "CLAUDE_SKILLS_MISSING", message: WINDOWS_CLAUDE_SMOKE_FAIL.INVENTORY };
  }

  const mcpPath = path.join(smokeClientRoot, ".mcp.json");
  if (!fs.existsSync(mcpPath)) {
    return { ok: false, code: "MCP_JSON_MISSING", message: WINDOWS_CLAUDE_SMOKE_FAIL.MCP_JSON };
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
  } catch {
    return { ok: false, code: "MCP_JSON_MISSING", message: WINDOWS_CLAUDE_SMOKE_FAIL.MCP_JSON };
  }

  if (!cfg.mcpServers || cfg.mcpServers["tied-yaml"] == null) {
    return { ok: false, code: "TIED_YAML_SERVER_MISSING", message: WINDOWS_CLAUDE_SMOKE_FAIL.TIED_YAML };
  }

  return { ok: true, asserts: ["claude_skills", "mcp_json_tied_yaml"] };
}
