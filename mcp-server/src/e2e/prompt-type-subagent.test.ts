/**
 * [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT]
 * Summary: Validate the explicit-only Task wrappers for all 13 leaf prompt types and their clean-context workflow contracts.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(process.cwd(), "..");

const LEAF_PROMPT_TYPES = [
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

type LeafPromptType = (typeof LEAF_PROMPT_TYPES)[number];

const READONLY_LEAVES = new Set<LeafPromptType>(["question", "other"]);
const MINIMAL_LEAVES = new Set<LeafPromptType>(["question", "other"]);
const NON_TIED_LEAVES = new Set<LeafPromptType>(["non-tied-plan", "non-tied-debug"]);
const CLOSE_OUT_LEAVES = new Set<LeafPromptType>([
  "plan-close-out",
  "ammend-commit",
  "leap-diff-promote",
]);
const REFINE_PLAN_IMPLEMENT_LEAVES = new Set<LeafPromptType>([
  "plan-new-feature",
  "refine-plan",
  "debug",
  "use-skill",
  "leap-ad-hoc",
]);

function agentPath(promptType: LeafPromptType): string {
  return path.join(repoRoot, ".cursor", "agents", `${promptType}.md`);
}

function canonicalSkillPath(promptType: LeafPromptType): string {
  return path.join(repoRoot, "tools", "bundled-prompt-type-skills", promptType, "SKILL.md");
}

function readAgent(promptType: LeafPromptType): { frontmatter: Record<string, unknown>; body: string } {
  const content = fs.readFileSync(agentPath(promptType), "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  assert.ok(match, `${promptType} agent must contain YAML frontmatter followed by a prompt body`);
  const frontmatter = yaml.load(match[1]) as Record<string, unknown>;
  assert.ok(frontmatter && typeof frontmatter === "object", `${promptType} frontmatter must parse as an object`);
  return { frontmatter, body: match[2] };
}

describe("prompt-type Task subagents [REQ-PROMPT_TYPE_SUBAGENT]", () => {
  for (const promptType of LEAF_PROMPT_TYPES) {
    it(`enforces the ${promptType} Cursor agent contract [IMPL-PROMPT_TYPE_SUBAGENT]`, () => {
      const { frontmatter, body } = readAgent(promptType);
      assert.equal(frontmatter.name, promptType);
      assert.equal(frontmatter.readonly, READONLY_LEAVES.has(promptType));
      assert.equal(frontmatter.is_background, false);
      assert.match(
        String(frontmatter.description),
        new RegExp(`Use when .*${promptType.replace(/-/g, "\\-")}`, "i"),
        `${promptType} description should positively identify the prompt type`
      );
      assert.match(
        String(frontmatter.description),
        /Do not use for /i,
        `${promptType} description should distinguish neighboring prompt types`
      );
      assert.doesNotMatch(
        String(frontmatter.description),
        /\b(?:use proactively|always use)\b/i,
        "explicit-only activation must not become proactive"
      );
      assert.ok(fs.existsSync(canonicalSkillPath(promptType)), `canonical ${promptType} skill must exist`);
      assert.match(
        body,
        new RegExp(`tools\\/bundled-prompt-type-skills\\/${promptType.replace(/-/g, "\\-")}\\/SKILL\\.md`),
        `${promptType} agent must name the canonical skill as its workflow source`
      );
      assert.doesNotMatch(body.trim(), new RegExp(`^@${promptType.replace(/-/g, "\\-")}$`));
      assert.match(body, /TIED applicability/i);
      assert.match(body, /Observing AI principles!/);
      assert.match(body, /tied\/vocab\/prompt-composer\.md/);
      assert.doesNotMatch(body, /:::/, `${promptType} agent must not use a triple-colon payload delimiter`);
      assert.match(
        body,
        /\[REQ-PROMPT_TYPE_SUBAGENT\].*\[ARCH-PROMPT_TYPE_SUBAGENT\].*\[IMPL-PROMPT_TYPE_SUBAGENT\]/s
      );
    });
  }

  it("preserves workflow order and blocking gates [REQ-PROMPT_TYPE_SUBAGENT]", () => {
    // [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: verify each agent file is an explicit-only Task wrapper around its canonical leaf skill.
    const planNewFeature = readAgent("plan-new-feature").body;
    const refine = planNewFeature.indexOf("1. **Refine**");
    const plan = planNewFeature.indexOf("2. **Plan**");
    const implement = planNewFeature.indexOf("3. **Implement**");
    assert.ok(refine >= 0 && refine < plan && plan < implement, "plan-new-feature must be Refine -> Plan -> Implement");
    assert.match(planNewFeature, /do not start plan until ambiguity is cleared/i);
    assert.match(planNewFeature, /do not start code until .*IMPL pseudo-code.*test strategy/i);
    assert.match(planNewFeature, /invocation remainder/i);
    assert.match(planNewFeature, /Do not treat a linked plan as the request/);

    const refinePlan = readAgent("refine-plan").body;
    assert.ok(refinePlan.indexOf("1. **Refine**") < refinePlan.indexOf("2. **Plan**"));
    assert.match(refinePlan, /do not start plan until ambiguity is cleared/i);
    assert.match(refinePlan, /linked plan/i);
    assert.doesNotMatch(refinePlan, /:::/);

    const buildPlan = readAgent("build-plan").body;
    assert.match(buildPlan, /Guiding vocab/);
    assert.doesNotMatch(buildPlan, /1\. \*\*Refine\*\*/);
    assert.match(buildPlan, /do not start code until .*IMPL pseudo-code.*test strategy/i);
    assert.match(buildPlan, /linked plan/i);
    assert.doesNotMatch(buildPlan, /:::/);

    const debug = readAgent("debug").body;
    assert.match(debug, /Capture Failure/);
    assert.match(debug, /do not start plan until a test reproduces the failure/i);

    const useSkill = readAgent("use-skill").body;
    assert.match(useSkill, /do not start plan until ambiguity is cleared/i);
    assert.match(useSkill, /import a set of skills/i);

    const leapAdHoc = readAgent("leap-ad-hoc").body;
    assert.match(leapAdHoc, /Read Ad-Hoc/);
    assert.match(leapAdHoc, /Do not copy a Tracker/);

    const question = readAgent("question").body;
    assert.match(question, /There are no Refine, Plan, Implement, CITDP, or Tracker gates/);

    const other = readAgent("other").body;
    assert.match(other, /There are no Refine, Plan, Implement, CITDP, or Tracker gates/);

    const nonTiedPlan = readAgent("non-tied-plan").body;
    assert.match(nonTiedPlan, /non-tied-boundary\.md/);
    assert.match(nonTiedPlan, /Do not start code until a test strategy is in place/);

    const nonTiedDebug = readAgent("non-tied-debug").body;
    assert.match(nonTiedDebug, /non-tied-boundary\.md/);
    assert.match(nonTiedDebug, /Do not start code until a test strategy is in place/);

    for (const promptType of CLOSE_OUT_LEAVES) {
      const body = readAgent(promptType).body;
      assert.match(body, /Do not commit/i);
    }
  });

  it("preserves safety and parent handoff contracts [REQ-PROMPT_TYPE_SUBAGENT]", () => {
    // [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: return auditable workflow evidence to the parent without overstating completion.
    for (const promptType of LEAF_PROMPT_TYPES) {
      const { body } = readAgent(promptType);
      for (const forbidden of [
        "pbpaste",
        "pbcopy",
        "automatic Git stage",
        "automatic Git commit",
        "automatic Git amend",
        "automatic Git push",
      ]) {
        assert.match(body, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      }
      assert.match(body, /remaining (?:risks|questions)/i, `${promptType} parent handoff should include remaining work`);
    }

    for (const promptType of REFINE_PLAN_IMPLEMENT_LEAVES) {
      const { body } = readAgent(promptType);
      assert.match(body, /tied_validate_consistency/i);
      assert.match(body, /verification-gate/i);
      assert.match(body, /resolved terms/i);
    }

    const planNewFeature = readAgent("plan-new-feature").body;
    for (const handoffField of ["resolved terms", "Tracker", "CITDP", "tests", "validation", "remaining risks"]) {
      assert.match(planNewFeature, new RegExp(handoffField, "i"), `plan-new-feature parent handoff should include ${handoffField}`);
    }

    for (const promptType of CLOSE_OUT_LEAVES) {
      const { body } = readAgent(promptType);
      assert.match(body, /git add/);
      assert.match(body, /git commit/);
      assert.match(body, /CHANGELOG/);
      assert.match(body, /tied_validate_consistency/i);
      assert.match(body, /verification-gate/i);
    }
    assert.match(readAgent("ammend-commit").body, /git commit --amend/);

    for (const promptType of NON_TIED_LEAVES) {
      const { body } = readAgent(promptType);
      assert.match(body, /no TIED writes/i);
      assert.match(body, /Do not write TIED YAML/);
    }

    for (const promptType of MINIMAL_LEAVES) {
      const { body } = readAgent(promptType);
      assert.match(body, /CITDP, Tracker, or Implement TIED blocks/);
      assert.match(body, /no CITDP, Tracker, or TIED writes were performed/);
    }

    assert.match(readAgent("leap-ad-hoc").body, /automatic `git diff`/);
  });

  it("sequences plan-new-feature, refine-plan, then build-plan as Task children [REQ-PROMPT_TYPE_SUBAGENT]", () => {
    // [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: verify the sequencer Task-launches the three leaf wrappers in order and stops on a failed gate.
    const content = fs.readFileSync(path.join(repoRoot, ".cursor", "agents", "plan-refine-build.md"), "utf8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    assert.ok(match, "plan-refine-build agent must contain YAML frontmatter followed by a prompt body");
    const frontmatter = yaml.load(match[1]) as Record<string, unknown>;
    const body = match[2];
    assert.equal(frontmatter.name, "plan-refine-build");
    assert.equal(frontmatter.readonly, false);
    assert.equal(frontmatter.is_background, false);
    assert.match(String(frontmatter.description), /Use when .*plan-refine-build/i);
    assert.match(String(frontmatter.description), /Do not use for /i);
    assert.doesNotMatch(String(frontmatter.description), /\b(?:use proactively|always use)\b/i);
    const planNewFeature = body.indexOf("plan-new-feature");
    const refinePlan = body.indexOf("refine-plan");
    const buildPlan = body.indexOf("build-plan");
    assert.ok(
      planNewFeature >= 0 && planNewFeature < refinePlan && refinePlan < buildPlan,
      "sequence must be plan-new-feature -> refine-plan -> build-plan"
    );
    assert.match(body, /subagent_type: plan-new-feature/);
    assert.match(body, /subagent_type: refine-plan/);
    assert.match(body, /subagent_type: build-plan/);
    assert.match(body, /run_in_background.*false/);
    assert.match(body, /Do not implement the feature in this agent's own context/);
    assert.match(body, /Do not run the three children in parallel/);
    assert.match(body, /Stop immediately if any child labels the work incomplete/i);
    assert.match(body, /invocation remainder/);
    assert.match(body, /linked plan/);
    assert.doesNotMatch(body, /:::/);
    assert.match(body, /tools\/bundled-prompt-type-skills\/prompt-type-router\/SKILL\.md/);
    for (const forbidden of [
      "pbpaste",
      "pbcopy",
      "automatic Git stage",
      "automatic Git commit",
      "automatic Git amend",
      "automatic Git push",
    ]) {
      assert.match(body, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    }
    assert.match(body, /TIED applicability/i);
    assert.match(body, /remaining risks/i);
    assert.match(body, /tied_validate_consistency/i);
    assert.match(body, /verification-gate/i);
    assert.match(
      body,
      /\[REQ-PROMPT_TYPE_SUBAGENT\].*\[ARCH-PROMPT_TYPE_SUBAGENT\].*\[IMPL-PROMPT_TYPE_SUBAGENT\]/s
    );
  });
});
