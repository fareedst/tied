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

  it("mandates stub capture and no in-repo source copy across Waves 1–3", () => {
    const skillPath = path.join(skillDir, "SKILL.md");
    const text = fs.readFileSync(skillPath, "utf8");
    assert.ok(
      text.includes("does not reproduce"),
      "skill must state captures do not reproduce article body",
    );
    assert.ok(
      text.includes("Why this file has no article body"),
      "skill must require stub section heading",
    );
    assert.match(text, /Wave\s*1.*stub|stub.*Wave\s*1/i, "skill must tie Wave 1 to stub policy");
    assert.ok(
      text.includes("url-fetch-receipt"),
      "skill must document themes-only evidence receipt",
    );
    assert.ok(
      !/full article sections/i.test(text),
      "skill must not instruct full article sections in repo",
    );
    assert.ok(
      text.includes("Wave 3"),
      "skill must scope Wave 3 compose",
    );
    assert.match(
      text,
      /Wave\s*3[\s\S]{0,400}paste|no[\s-]*source[\s-]*copy/i,
      "skill must forbid vendor paste in Wave 3 compose",
    );
    const forbiddenCopy = [/offline-readable.*vendor/i, /Full article sections/i];
    for (const pattern of forbiddenCopy) {
      assert.doesNotMatch(text, pattern, `forbidden copy guidance: ${pattern}`);
    }
  });
});
