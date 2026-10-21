/**
 * [REQ-TIED_HARNESS_LANGCHAIN_PHASE3] harness-trace-analyzer skill contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const skillPath = path.join(
  repoRoot,
  "tools",
  "bundled-prompt-type-skills",
  "harness-trace-analyzer",
  "SKILL.md"
);

const FORBIDDEN_PATTERNS = [
  /replaces\s+tied_checklist_gate_validate/i,
  /waives?\s+(?:the\s+)?pre_implementation/i,
  /yaml_index_insert/i,
];

describe("harness-trace-analyzer skill [REQ-TIED_HARNESS_LANGCHAIN_PHASE3]", () => {
  it("references the methodology guide, Task fan-out, and forbids gate-waiver phrasing", () => {
    assert.ok(fs.existsSync(skillPath), `missing skill: ${skillPath}`);
    const text = fs.readFileSync(skillPath, "utf8");
    assert.ok(
      text.includes("harness-trace-observation-loop.md"),
      "skill must reference methodology guide path"
    );
    assert.ok(text.includes("tied_feedback_capture_observation"), "skill must reference Kaizen capture");
    assert.match(text, /\bTask\b/, "skill must document Task delegation");
    assert.ok(
      text.includes("harness-trace-review"),
      "skill must relate to harness-trace-review"
    );
    assert.match(text, /REQ-TIED_HARNESS_LANGCHAIN_PHASE3/);
    for (const pattern of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(text, pattern, `forbidden phrasing matched: ${pattern}`);
    }
  });
});
