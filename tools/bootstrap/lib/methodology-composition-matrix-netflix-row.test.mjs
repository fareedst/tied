/**
 * [REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3] Methodology composition matrix §2 row 17 contract.
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

describe("methodology composition matrix Netflix row [REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3]", () => {
  it("has exactly 17 §2 data rows including Netflix ontology-driven observability row 17", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.match(text, /§2 \*\*18\*\* rows/);
    assert.match(text, /exactly \*\*18\*\* data rows/);
    const rowNumbers = countSection2DataRows(text);
    assert.deepEqual(rowNumbers, Array.from({ length: 18 }, (_, i) => i + 1));
    assert.ok(
      text.includes("Netflix ontology-driven observability"),
      "row 17 framework label missing",
    );
    assert.ok(
      text.includes("netflix-ontology-driven-observability-vs-tied-agent-management.md"),
      "row 17 must link Netflix comparison",
    );
    assert.ok(text.includes("vocabulary-layer-tied-leap-citdp.md"), "row 17 must reference vocabulary-layer guide");
    assert.ok(text.includes("harness-trace-observation-loop.md"), "row 17 must reference HTOL guide");
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row17Line = section2.split("\n").find((line) => line.startsWith("| 17 |"));
    assert.ok(row17Line, "missing §2 row 17 table line");
    assert.match(row17Line, /Netflix-reported/i, "row 17 sponsor_notes must label Netflix-reported");
    assert.match(row17Line, /14/i, "row 17 sponsor_notes must pair row 14");
    assert.match(row17Line, /15/i, "row 17 sponsor_notes must pair row 15");
  });
});
