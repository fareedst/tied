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
import yaml from "js-yaml";

const LEAF_SKILLS = [
  "add-feature",
  "refine-plan",
  "build-plan",
  "close-out",
  "debug",
  "question",
  "use-skill",
  "ammend-commit",
  "non-tied-plan",
  "non-tied-refine",
  "non-tied-build",
  "non-tied-close",
  "non-tied-debug",
  "leap-ad-hoc",
  "leap-diff-promote",
  "citdp-record",
  "citdp-promote",
  "other",
] as const;

const METHODOLOGY_HARNESS_SKILLS = [
  "harness-trace-review",
  "harness-trace-analyzer",
  "harness-trace-langsmith-compose",
  "external-service-comparison",
] as const;

const SKILL_DIRS = [...LEAF_SKILLS, "prompt-type-router"] as const;

const ALL_MANAGED_SKILL_DIRS = [...LEAF_SKILLS, ...METHODOLOGY_HARNESS_SKILLS, "prompt-type-router"] as const;

const SHARED_REFERENCES = [
  "tied-refine.md",
  "tied-plan-citdp.md",
  "tied-plan-citdp-build.md",
  "tied-plan-ad-hoc.md",
  "tied-implement.md",
  "tied-capture-failure.md",
  "tied-read-ad-hoc.md",
  "gitignore-close-out-hygiene.md",
  "traceable-commit-close-out.md",
  "clear-workspace-routing.md",
  "tied-close-out-process.md",
  "non-tied-refine.md",
  "non-tied-plan.md",
  "git-context-templates.md",
  "tied-boundary.md",
  "non-tied-boundary.md",
  "guiding-vocab.md",
  "jev-plan-skills-adjunct.md",
  "methodology-surface-enrollment-advisory.md",
  "agent-shell-working-directory.md",
  "agent-shell-script-header.template.sh",
  "citdp-only-boundary.md",
  "tied-refine-citdp-record.md",
  "tied-plan-citdp-record.md",
  "tied-promote-citdp.md",
  "prompt-execution-mode.md",
  "prompt-skill-disk-handoff.md",
  "plan-build-sequence-guard.md",
  "tied-plan-prepare.md",
  "non-tied-plan-prepare.md",
  "non-tied-build.md",
  "non-tied-close.md",
] as const;

const PLAN_MODE_LEAVES = [
  "add-feature",
  "refine-plan",
  "non-tied-plan",
  "non-tied-refine",
] as const;

const AGENT_MODE_LEAVES = ["build-plan", "close-out", "non-tied-build", "non-tied-close"] as const;

const repoRoot = path.resolve(process.cwd(), "..");

function extractYamlFrontMatter(text: string): string {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, "SKILL.md must begin with YAML frontmatter");
  return match[1];
}

function assertFrontMatterParses(root: string): void {
  // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: strict YAML parse of frontmatter so Cursor and linked stubs accept every skill.
  for (const skillDir of ALL_MANAGED_SKILL_DIRS) {
    const skillPath = path.join(root, skillDir, "SKILL.md");
    const content = fs.readFileSync(skillPath, "utf8");
    const front = extractYamlFrontMatter(content);
    let parsed: unknown;
    try {
      parsed = yaml.load(front);
    } catch (error) {
      assert.fail(`${skillDir}/SKILL.md frontmatter is not valid YAML: ${String(error)}`);
    }
    assert.ok(parsed && typeof parsed === "object" && !Array.isArray(parsed), `${skillDir} frontmatter must be a mapping`);
    const record = parsed as Record<string, unknown>;
    assert.equal(record.name, skillDir, `${skillDir} frontmatter name must match directory`);
    assert.equal(typeof record.description, "string", `${skillDir} description must be a YAML string`);
    assert.equal(record["disable-model-invocation"], true, `${skillDir} must set disable-model-invocation: true`);
  }
}

function assertSkillContract(root: string): void {
  assertFrontMatterParses(root);
  // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: verify exact names, explicit-only frontmatter, direct shared-link resolution, and bounded file size before distribution.
  for (const skillDir of ALL_MANAGED_SKILL_DIRS) {
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

function assertAgentShellWorkingDirectoryContract(root: string): void {
  // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: fail closed if agent shell cwd guidance is missing or hollow.
  const shared = path.join(root, "prompt-shared");
  const guide = fs.readFileSync(path.join(shared, "agent-shell-working-directory.md"), "utf8");
  const template = fs.readFileSync(path.join(shared, "agent-shell-script-header.template.sh"), "utf8");
  for (const needle of ["working_directory", "REPO_ROOT", "DIAGNOSTIC:"] as const) {
    assert.match(guide, new RegExp(needle));
  }
  assert.match(guide, /fail closed/i);
  for (const needle of ["set -euo pipefail", "assert_repo_root", "MARKER_REL"] as const) {
    assert.match(template, new RegExp(needle));
  }
  assert.match(template, /DIAGNOSTIC:/);
}

describe("prompt-type skill bundle", () => {
  it("validates the tracked canonical bundle [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    assertSkillContract(bundleRoot);
    assertAgentShellWorkingDirectoryContract(bundleRoot);
  });

  it("installs the canonical bundle while preserving unrelated client tooling [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    // [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: refresh managed prompt-type directories while preserving unrelated client skills and MCP configuration; prompt-type Task wrappers remain TIED-source development artifacts and are not installed into clients.
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-prompt-skills-"));
    const copyScript = path.join(repoRoot, "tied-install.sh");
    try {
      execFileSync("bash", [copyScript, "--mode", "full", tempDir], { cwd: repoRoot, stdio: "pipe" });

      const clientSkillRoot = path.join(tempDir, ".cursor", "skills");
      assertSkillContract(clientSkillRoot);
      assert.ok(
        fs.existsSync(path.join(tempDir, "tied-bundle", "docs", "prompt-type-skills.md")),
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

      execFileSync("bash", [copyScript, "--mode", "full", tempDir], { cwd: repoRoot, stdio: "pipe" });

      assert.equal(fs.readFileSync(customSkill, "utf8"), "client-only skill\n");
      assert.equal(fs.readFileSync(mcpConfig, "utf8"), mcpBefore);
      assert.equal(
        fs.readFileSync(path.join(clientSkillRoot, "add-feature", "SKILL.md"), "utf8"),
        fs.readFileSync(
          path.join(repoRoot, "tools", "bundled-prompt-type-skills", "add-feature", "SKILL.md"),
          "utf8"
        )
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("linked install stubs have parseable frontmatter [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-prompt-skills-linked-"));
    const copyScript = path.join(repoRoot, "tied-install.sh");
    try {
      execFileSync("bash", [copyScript, tempDir], { cwd: repoRoot, stdio: "pipe" });
      const clientSkillRoot = path.join(tempDir, ".cursor", "skills");
      assertSkillContract(clientSkillRoot);
      const stub = fs.readFileSync(path.join(clientSkillRoot, "debug", "SKILL.md"), "utf8");
      assert.match(stub, /Read and follow the canonical skill at:/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("uses attribute-preserving copy invocations for managed bootstrap artifacts [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    // [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] — How: route managed file and tree copies through copy-managed.mjs with destination-only source-date midnight normalization.
    const copyManaged = fs.readFileSync(
      path.join(repoRoot, "tools", "bootstrap", "lib", "copy-managed.mjs"),
      "utf8"
    );
    assert.match(copyManaged, /copyFileWithAttributes/);
    assert.match(copyManaged, /copyTreeWithAttributes/);
    assert.match(copyManaged, /normalizeCopiedPathTimestamps/);
    assert.match(copyManaged, /Client-modified managed copy detected/);
    assert.doesNotMatch(copyManaged, /2000-01-01T00:00:00Z/);
    assert.match(copyManaged, /sourceDateMidnightSeconds/);
    const copyScript = fs.readFileSync(path.join(repoRoot, "tied-install.sh"), "utf8");
    assert.match(copyScript, /tools\/bootstrap\/tied-install-dispatch\.mjs/);
    assert.doesNotMatch(copyScript, /copy-files\.mjs/);
    assert.doesNotMatch(copyScript, /\.cursor\/agents\/"\*\.md/);
  });

  it("preserves prompt-type workflow-specific contracts [REQ-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const planNewFeature = fs.readFileSync(path.join(bundleRoot, "add-feature", "SKILL.md"), "utf8");
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

  it("links Jev plan-skills adjunct on four main plan skills only [REQ-TIED_JEV_DECISION_COPROCESSOR]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const wired = ["add-feature", "refine-plan", "build-plan", "close-out"] as const;
    for (const skill of wired) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /jev-plan-skills-adjunct\.md/);
    }
    const debug = fs.readFileSync(path.join(bundleRoot, "debug", "SKILL.md"), "utf8");
    assert.doesNotMatch(debug, /jev-plan-skills-adjunct\.md/);
    const planCloseOut = fs.readFileSync(path.join(bundleRoot, "close-out", "SKILL.md"), "utf8");
    assert.match(planCloseOut, /close_out/);
    assert.match(planCloseOut, /jev-plan-skills-adjunct\.md/);
    assert.match(planCloseOut, /traceable-commit-close-out\.md/);
    assert.match(planCloseOut, /tied_git_hygiene/);
  });

  it("documents advisory methodology surface enrollment on plan skills [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const advisory = fs.readFileSync(
      path.join(bundleRoot, "prompt-shared", "methodology-surface-enrollment-advisory.md"),
      "utf8",
    );
    assert.match(advisory, /tied_methodology_production_system_enrollment_validate/);
    assert.match(advisory, /surface_ref/);
    assert.match(advisory, /proof boundary/i);

    const planCitdp = fs.readFileSync(path.join(bundleRoot, "prompt-shared", "tied-plan-citdp.md"), "utf8");
    assert.match(planCitdp, /methodology-surface-enrollment-advisory\.md/);

    const planPrepare = fs.readFileSync(path.join(bundleRoot, "prompt-shared", "tied-plan-prepare.md"), "utf8");
    assert.match(planPrepare, /methodology-surface-enrollment-advisory\.md/);

    for (const skill of ["add-feature", "build-plan"] as const) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /methodology-surface-enrollment-advisory\.md/);
    }
  });

  it("declares skill execution mode on plan and agent leaves [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    for (const skill of PLAN_MODE_LEAVES) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /skill execution mode:\s*\*{0,2}\s*plan/i, `${skill} must declare plan mode`);
      const procedure = content.split("## Procedure")[1]?.split("## ")[0] ?? content;
      assert.doesNotMatch(procedure, /tied-implement\.md/, `${skill} procedure must not link tied-implement`);
    }
    for (const skill of AGENT_MODE_LEAVES) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /skill execution mode:\s*\*{0,2}\s*agent/i, `${skill} must declare agent mode`);
    }
    assert.equal(LEAF_SKILLS.length, 18, "leaf inventory must be 18 prompt types");
  });

  it("enforces refine-build phase guard on plan leaves [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]", () => {
    // [IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] — How: guard doc linked; refine-plan mandates @build-plan; build-plan preflight references PLAN_BUILD_SEQUENCE_VIOLATION.
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const guard = fs.readFileSync(path.join(bundleRoot, "prompt-shared", "plan-build-sequence-guard.md"), "utf8");
    assert.match(guard, /plan_phase/);
    assert.match(guard, /PLAN_BUILD_SEQUENCE_VIOLATION/);

    const diskHandoff = fs.readFileSync(path.join(bundleRoot, "prompt-shared", "prompt-skill-disk-handoff.md"), "utf8");
    assert.match(diskHandoff, /plan-build-sequence-guard\.md/);

    const refine = fs.readFileSync(path.join(bundleRoot, "refine-plan", "SKILL.md"), "utf8");
    assert.match(refine, /plan-build-sequence-guard\.md/);
    assert.match(refine, /@build-plan/);
    assert.match(refine, /pre-implementation/);

    const build = fs.readFileSync(path.join(bundleRoot, "build-plan", "SKILL.md"), "utf8");
    assert.match(build, /plan-build-sequence-guard\.md/);
    assert.match(build, /PLAN_BUILD_SEQUENCE_VIOLATION/);

    const addFeature = fs.readFileSync(path.join(bundleRoot, "add-feature", "SKILL.md"), "utf8");
    assert.match(addFeature, /plan-build-sequence-guard\.md/);
  });

  it("enforces disk plan handoff on plan leaves [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] [IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF]", () => {
    // [IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF] [ARCH-TIED_PROMPT_SKILL_DISK_HANDOFF] [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] — How: plan leaves must reference disk handoff contract and session-handoff path before stop.
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const executionMode = fs.readFileSync(path.join(bundleRoot, "prompt-shared", "prompt-execution-mode.md"), "utf8");
    assert.match(executionMode, /prompt-skill-disk-handoff\.md/);
    assert.match(executionMode, /session-handoff\.md/);
    for (const skill of PLAN_MODE_LEAVES) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /prompt-skill-disk-handoff\.md/, `${skill} must link disk handoff contract`);
      assert.match(content, /session-handoff\.md/, `${skill} must name session-handoff path`);
      assert.match(content, /Plan execution steps/i, `${skill} must name Plan execution steps subsection`);
    }
    const buildClose = ["build-plan", "close-out"] as const;
    for (const skill of buildClose) {
      const content = fs.readFileSync(path.join(bundleRoot, skill, "SKILL.md"), "utf8");
      assert.match(content, /prompt-skill-disk-handoff\.md/, `${skill} must link disk handoff contract`);
      assert.match(content, /Plan execution steps/i, `${skill} must update Plan execution steps when executing`);
    }
  });

  it("build-plan references path-declared composition naming adjunct [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [SC-PDC-04]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const build = fs.readFileSync(path.join(bundleRoot, "build-plan", "SKILL.md"), "utf8");
    assert.match(build, /tied-composition-test-naming-adjunct\.md/);
    const adjunct = fs.readFileSync(
      path.join(bundleRoot, "prompt-shared", "tied-composition-test-naming-adjunct.md"),
      "utf8",
    );
    assert.match(adjunct, /\.binding\.test\.ts/);
  });

  it("splits use-skill Plan across prepare and RED build docs [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]", () => {
    const bundleRoot = path.join(repoRoot, "tools", "bundled-prompt-type-skills");
    const useSkill = fs.readFileSync(path.join(bundleRoot, "use-skill", "SKILL.md"), "utf8");
    assert.match(useSkill, /tied-plan-prepare\.md/);
    assert.match(useSkill, /tied-plan-citdp-build\.md/);
    assert.doesNotMatch(useSkill, /tied-plan-citdp\.md/);
  });
});
