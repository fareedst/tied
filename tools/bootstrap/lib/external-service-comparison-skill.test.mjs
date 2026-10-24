/**
 * [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] external-service-comparison skill contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const skillDir = path.join(
  repoRoot,
  "tools",
  "bundled-prompt-type-skills",
  "external-service-comparison",
);

const FORBIDDEN_PATTERNS = [
  /replaces\s+tied_checklist_gate_validate/i,
  /waives?\s+(?:the\s+)?pre_implementation/i,
  /yaml_index_insert/i,
];

describe("external-service-comparison skill [REQ-TIED_EXTERNAL_SERVICE_COMPARISON]", () => {
  it("references the comparison template and mandatory working folder", () => {
    const skillPath = path.join(skillDir, "SKILL.md");
    assert.ok(fs.existsSync(skillPath), `missing skill: ${skillPath}`);
    const text = fs.readFileSync(skillPath, "utf8");
    assert.ok(
      text.includes("external-service-three-wave-comparison-template.md"),
      "skill must reference methodology template path",
    );
    assert.ok(
      text.includes("DOC-{SLUG}-COMPARISON"),
      "skill must require DOC working folder",
    );
    assert.ok(text.includes("docs/comparisons/"), "skill must name Wave 1/2 output root");
    assert.ok(text.includes("target-repo-observed"), "skill must document claim labels");
    assert.ok(text.includes("not_measured"), "skill must document not_measured label");
    assert.ok(text.includes("add-feature"), "skill must route behavior change to add-feature");
    for (const pattern of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(text, pattern, `forbidden phrasing matched: ${pattern}`);
    }
  });
});
