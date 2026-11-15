/**
 * [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] Harness/platform sponsor taxonomy vocabulary contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const routingPath = path.join(repoRoot, "tied-project", "vocab", "routing.md");
const taxonomyPath = path.join(repoRoot, "tied-project", "vocab", "harness-platform-taxonomy.md");
const xlateSkillPath = path.join(repoRoot, "tools", "bundled-xlate-skill", "SKILL.md");
const traefikPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "traefik-harness-platform-vs-tied-agent-management.md"
);

describe("harness platform taxonomy vocab [REQ-TIED_HARNESS_PLATFORM_TAXONOMY]", () => {
  it("T-HPT-ROUTE-01: routing row 2c links harness-platform-taxonomy.md", () => {
    const text = fs.readFileSync(routingPath, "utf8");
    assert.match(text, /2c \| \[harness-platform-taxonomy\.md\]/);
    assert.match(text, /benchmark taxonomy/);
    assert.match(text, /AI coding agent/);
  });

  it("T-HPT-GLOSS-01: taxonomy glossary links agentstream, Traefik, HMEP", () => {
    assert.ok(fs.existsSync(taxonomyPath), taxonomyPath);
    const text = fs.readFileSync(taxonomyPath, "utf8");
    assert.match(text, /agentstream\.md/);
    assert.match(text, /traefik-harness-platform-vs-tied-agent-management\.md/);
    assert.match(text, /harness-model-eval\.md/);
    assert.match(text, /Three-layer placement/);
    assert.match(text, /Trial matrix dimensions/);
    assert.match(text, /vendor agent harness/);
    assert.match(text, /docs\/agent-harness-evaluation\/config\/wf-trial-model-catalog\.yaml/);
    assert.match(text, /docs\/agent-harness-evaluation\/catalogs\/catalog-traditional-workflow-trial-prompts\.md/);
  });

  it("T-HPT-XLATE-01: bundled xlate skill cites harness-platform-taxonomy", () => {
    const text = fs.readFileSync(xlateSkillPath, "utf8");
    assert.match(text, /harness-platform-taxonomy\.md/);
  });

  it("T-HPT-TRAEFIK-01: Traefik comparison executive summary links taxonomy", () => {
    const text = fs.readFileSync(traefikPath, "utf8");
    assert.match(text, /harness-platform-taxonomy\.md/);
  });
});