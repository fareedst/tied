/**
 * [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] harness-trace-langsmith-compose skill contract.
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
  "harness-trace-langsmith-compose",
  "SKILL.md"
);

const FORBIDDEN_PATTERNS = [
  /replaces\s+tied_checklist_gate_validate/i,
  /waives?\s+(?:the\s+)?pre_implementation/i,
  /yaml_index_insert/i,
  /as TIED core/i,
];

describe("harness-trace-langsmith-compose skill [REQ-TIED_HARNESS_LANGSMITH_COMPOSE]", () => {
  it("references HTOL guide, export script, handoff skills, and forbids gate-waiver phrasing", () => {
    assert.ok(fs.existsSync(skillPath), `missing skill: ${skillPath}`);
    const text = fs.readFileSync(skillPath, "utf8");
    assert.ok(
      text.includes("harness-trace-observation-loop.md"),
      "skill must reference methodology guide path"
    );
    assert.ok(text.includes("export-langsmith-traces.mjs"), "skill must reference optional export script");
    assert.ok(text.includes("LANGSMITH_API_KEY"), "skill must document API key env");
    assert.ok(text.includes("harness-trace-review"), "skill must hand off to harness-trace-review");
    assert.ok(text.includes("harness-trace-analyzer"), "skill must hand off to harness-trace-analyzer");
    assert.match(text, /REQ-TIED_HARNESS_LANGSMITH_COMPOSE/);
    assert.match(text, /not TIED core|Not TIED core/i, "skill must state client-side boundary");
    for (const pattern of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(text, pattern, `forbidden phrasing matched: ${pattern}`);
    }
  });
});
