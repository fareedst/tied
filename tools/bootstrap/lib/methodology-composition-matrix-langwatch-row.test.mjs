/**
 * [REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3] Methodology composition matrix §2 row 18 contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const matrixPath = path.join(repoRoot, "docs", "comparisons", "methodology-composition-matrix.md");

function countSection2DataRows(text) {
  const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
  assert.ok(section2Start >= 0, "missing §2 heading");
  const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
  assert.ok(section3Start > section2Start, "missing §3 heading");
  const slice = text.slice(section2Start, section3Start);
  const matches = [...slice.matchAll(/^\| (\d+) \|/gm)];
  return matches.map((m) => Number(m[1], 10));
}

describe("methodology composition matrix LangWatch row [REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3]", () => {
  it("has exactly 18 §2 data rows including LangWatch agent refactor row 18", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.match(text, /§2 \*\*18\*\* rows/);
    assert.match(text, /exactly \*\*18\*\* data rows/);
    const rowNumbers = countSection2DataRows(text);
    assert.deepEqual(rowNumbers, Array.from({ length: 18 }, (_, i) => i + 1));
    assert.ok(
      text.includes("LangWatch") && text.includes("agent-directed refactor"),
      "row 18 framework label missing"
    );
    assert.ok(
      text.includes("REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3"),
      "row 18 must reference REQ token"
    );
    assert.ok(
      text.includes("harness-trace-observation-loop.md"),
      "row 18 must reference HTOL"
    );
    assert.ok(
      text.includes("incident-revert-evaluation-corpus.md"),
      "row 18 must reference incident-revert corpus"
    );
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row18Line = section2.split("\n").find((line) => line.startsWith("| 18 |"));
    assert.ok(row18Line, "missing §2 row 18 table line");
    assert.match(row18Line, /LangWatch-reported/i, "row 18 sponsor_notes must label LangWatch-reported");
    assert.match(row18Line, /1[34]–15|14–15/, "row 18 sponsor_notes should pair harness rows 14–15");
  });
});
