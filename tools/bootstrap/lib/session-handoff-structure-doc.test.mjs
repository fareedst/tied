/**
 * [REQ-TIED_SESSION_HANDOFF_SKILL] Wave 2 — structured session handoff doc contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const structurePath = path.join(
  repoRoot,
  "tools",
  "bundled-prompt-type-skills",
  "prompt-shared",
  "session-handoff-structure.md",
);
const templatePath = path.join(repoRoot, "tied-bundle", "templates", "session-handoff.v1.template.md");
const contextExamplePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "session-handoff-context.v1.example.yaml",
);
const skillPath = path.join(repoRoot, "tools", "bundled-session-handoff-skill", "SKILL.md");
const charterPath = path.join(repoRoot, "tied-bundle", "docs", "pre-handoff-verification-charter.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");

const STRUCTURE_MARKERS = [
  "## Proof boundary",
  "## Section order",
  "## Plan execution steps",
  "### Required",
  "### Optional",
  "### Recommendations",
  "prompt-skill-disk-handoff.md",
  "plan-build-sequence-guard.md",
  "plan_phase",
  "## Related and pending prior requests",
  "## Merge rules",
  "handoffs/{phase}.yaml",
  "REQ-TIED_DAE_INCORPORATION",
  "completion-signals-handoff.md",
  "## Port backlog",
  "REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3",
];

describe("session handoff structure [REQ-TIED_SESSION_HANDOFF_SKILL]", () => {
  it("defines normative structure under prompt-shared", () => {
    assert.ok(fs.existsSync(structurePath), `missing: ${structurePath}`);
    const text = fs.readFileSync(structurePath, "utf8");
    for (const marker of STRUCTURE_MARKERS) {
      assert.ok(text.includes(marker), `structure doc missing: ${marker}`);
    }
  });

  it("ships session-handoff.v1.template.md under tied-bundle/templates", () => {
    assert.ok(fs.existsSync(templatePath), `missing: ${templatePath}`);
    const text = fs.readFileSync(templatePath, "utf8");
    assert.ok(text.includes("Related and pending prior requests"));
    assert.ok(text.includes("Plan spine"));
    assert.ok(text.includes("Plan execution steps"));
    assert.ok(text.includes("## Port backlog"));
    assert.ok(text.includes("Environment"));
  });

  it("links plan execution ledger contract [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF]", () => {
    const handoffSkill = fs.readFileSync(skillPath, "utf8");
    assert.ok(handoffSkill.includes("prompt-skill-disk-handoff.md"));
  });

  it("ships optional session-handoff-context.v1 example YAML", () => {
    assert.ok(fs.existsSync(contextExamplePath), `missing: ${contextExamplePath}`);
    const text = fs.readFileSync(contextExamplePath, "utf8");
    assert.ok(text.includes('schema_version: "session-handoff-context.v1"'));
    assert.ok(text.includes("pending_prior_requests"));
  });

  it("wires bundled handoff SKILL to structure doc and resume sections", () => {
    const text = fs.readFileSync(skillPath, "utf8");
    assert.ok(text.includes("session-handoff-structure.md"));
    assert.ok(text.includes("Pending prior requests"));
    assert.ok(text.includes("Environment"));
    assert.ok(text.includes("Merge prior handoffs"));
  });

  it("links structure doc from pre-handoff charter and client-development-index", () => {
    const charter = fs.readFileSync(charterPath, "utf8");
    assert.ok(charter.includes("session-handoff-structure.md"));
    const index = fs.readFileSync(indexPath, "utf8");
    assert.ok(index.includes("session-handoff-structure.md"));
  });
});
