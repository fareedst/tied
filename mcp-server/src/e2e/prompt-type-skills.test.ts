/**
 * [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
 * Summary: Maintain a complete tracked prompt-type skill bundle and install it deterministically into TIED clients.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const LEAF_SKILLS = [
  "plan-new-feature",
  "refine-plan",
  "build-plan",
  "plan-close-out",
  "debug",
  "question",
  "use-skill",
  "ammend-commit",
  "non-tied-plan",
  "non-tied-debug",
  "leap-ad-hoc",
  "leap-diff-promote",
  "other",
] as const;

const SKILL_DIRS = [...LEAF_SKILLS, "prompt-type-router"] as const;

const SHARED_REFERENCES = [
  "tied-refine.md",
  "tied-plan-citdp.md",
  "tied-plan-citdp-build.md",
  "tied-plan-ad-hoc.md",
  "tied-implement.md",
  "tied-capture-failure.md",
  "tied-read-ad-hoc.md",
  "tied-close-out-process.md",
  "non-tied-refine.md",
  "non-tied-plan.md",
  "git-context-templates.md",
  "tied-boundary.md",
  "non-tied-boundary.md",
  "guiding-vocab.md",
] as const;

const repoRoot = path.resolve(process.cwd(), "..");

function assertSkillContract(root: string): void {
  // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: verify exact names, explicit-only frontmatter, direct shared-link resolution, and bounded file size before distribution.
  for (const skillDir of SKILL_DIRS) {
    const skillPath = path.join(root, skillDir, "SKILL.md");
    assert.ok(fs.existsSync(skillPath), `missing skill: ${skillDir}/SKILL.md`);
    const content = fs.readFileSync(skillPath, "utf8");
    const lines = content.split(/\r?\n/).length;
    assert.ok(lines < 500, `${skillDir}/SKILL.md must remain below 500 lines`);
    assert.match(content, new RegExp(`name:\\s*${skillDir.replace("-", "\\-")}`));
    assert.match(content, /disable-model-invocation:\s*true/);
    assert.doesNotMatch(content, /:::/, `${skillDir} must not use a triple-colon payload delimiter`);
    assert.doesNotMatch(content, /\b(?:pbpaste|pbcopy)\s*(?:\||&&|;|$)/m);

    const sharedLinks = [...content.matchAll(/\]\(\.\.\/prompt-shared\/([^)]+)\)/g)];
    for (const [, reference] of sharedLinks) {
      assert.ok(
        fs.existsSync(path.join(root, "prompt-shared", reference)),
        `${skillDir} has unresolved shared reference: ${reference}`
      );
    }
  }

  for (const reference of SHARED_REFERENCES) {
    assert.ok(
      fs.existsSync(path.join(root, "prompt-shared", reference)),
      `missing shared reference: prompt-shared/${reference}`
    );
  }
}

describe("prompt-type skill bundle", () => {
  it("validates the tracked canonical bundle [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    assertSkillContract(bundleRoot);
  });

  it("installs the canonical bundle while preserving unrelated client tooling [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: refresh managed prompt-type directories while preserving unrelated client skills and MCP configuration; prompt-type Task wrappers remain TIED-source development artifacts and are not installed into clients.
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-prompt-skills-"));
    const copyScript = path.join(repoRoot, "copy_files.sh");
    try {
      execFileSync("bash", [copyScript, tempDir], { cwd: repoRoot, stdio: "pipe" });

      const clientSkillRoot = path.join(tempDir, ".cursor", "skills");
      assertSkillContract(clientSkillRoot);
      assert.ok(
        fs.existsSync(path.join(tempDir, "tied", "docs", "prompt-type-skills.md")),
        "bootstrap should install prompt-type skills documentation"
      );
      assert.equal(
        fs.existsSync(path.join(tempDir, ".cursor", "agents")),
        false,
        "bootstrap should not install prompt-type Task wrappers into client projects"
      );

      const customSkill = path.join(clientSkillRoot, "client-only", "SKILL.md");
      const mcpConfig = path.join(tempDir, ".cursor", "mcp.json");
      fs.mkdirSync(path.dirname(customSkill), { recursive: true });
      fs.writeFileSync(customSkill, "client-only skill\n");
      const mcpBefore = fs.readFileSync(mcpConfig, "utf8");

      execFileSync("bash", [copyScript, tempDir], { cwd: repoRoot, stdio: "pipe" });

      assert.equal(fs.readFileSync(customSkill, "utf8"), "client-only skill\n");
      assert.equal(fs.readFileSync(mcpConfig, "utf8"), mcpBefore);
      assert.equal(
        fs.readFileSync(path.join(clientSkillRoot, "plan-new-feature", "SKILL.md"), "utf8"),
        fs.readFileSync(
          path.join(repoRoot, "tools", "bundled-prompt-type-skills", "plan-new-feature", "SKILL.md"),
          "utf8"
        )
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("uses attribute-preserving copy invocations for managed bootstrap artifacts [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    // [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] — How: route managed file and tree copies through cp -p/cp -pR with destination-only source-date midnight normalization.
    const copyScript = fs.readFileSync(path.join(repoRoot, "copy_files.sh"), "utf8");
    const copyInvocations = copyScript
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("cp "));
    assert.ok(copyInvocations.length > 0, "copy_files.sh should contain explicit cp helper invocations");
    for (const invocation of copyInvocations) {
      assert.match(invocation, /^cp -pR?\s/, `copy must preserve attributes: ${invocation}`);
    }
    assert.doesNotMatch(copyScript, /\.cursor\/agents\/"\*\.md/);
    assert.match(copyScript, /Client-modified managed copy detected/);
    assert.doesNotMatch(copyScript, /2000-01-01T00:00:00Z/);
    assert.match(copyScript, /normalize_copy_timestamps/);
    assert.match(copyScript, /local calendar-date midnight/);
  });

  it("preserves prompt-type workflow-specific contracts [REQ-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const planNewFeature = fs.readFileSync(path.join(bundleRoot, "plan-new-feature", "SKILL.md"), "utf8");
    const buildPlan = fs.readFileSync(path.join(bundleRoot, "build-plan", "SKILL.md"), "utf8");
    const refinePlan = fs.readFileSync(path.join(bundleRoot, "refine-plan", "SKILL.md"), "utf8");
    const debug = fs.readFileSync(path.join(bundleRoot, "debug", "SKILL.md"), "utf8");
    const nonTiedPlan = fs.readFileSync(path.join(bundleRoot, "non-tied-plan", "SKILL.md"), "utf8");
    const nonTiedDebug = fs.readFileSync(path.join(bundleRoot, "non-tied-debug", "SKILL.md"), "utf8");

    assert.match(planNewFeature, /invocation remainder/i);
    assert.match(planNewFeature, /Do not treat a linked plan as the request/);
    assert.match(planNewFeature, /tied_checklist_gate_validate/);
    assert.match(planNewFeature, /pre_implementation/);
    assert.match(buildPlan, /guiding-vocab\.md/);
    assert.match(buildPlan, /phase: verification/);
    assert.match(refinePlan, /invalidate dependent downstream/i);
    assert.doesNotMatch(buildPlan, /\*\*Refine\*\*/);
    assert.match(refinePlan, /linked plan/i);
    assert.match(refinePlan, /Improve the plan below\./);
    assert.doesNotMatch(refinePlan, /:::/);
    assert.match(buildPlan, /linked plan/i);
    assert.doesNotMatch(buildPlan, /:::/);
    assert.match(debug, /Capture Failure/);
    assert.match(nonTiedPlan, /non-tied-boundary\.md/);
    assert.match(nonTiedDebug, /non-tied-boundary\.md/);
  });
});
