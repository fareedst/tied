/**
 * [REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3] Methodology composition matrix §2 row 21 contract.
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

describe("methodology composition matrix farley row [REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3]", () => {
  it("has exactly 21 §2 data rows including Farley executable spec row 21", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.match(text, /§2 \*\*21\*\* rows/);
    assert.match(text, /exactly \*\*21\*\* data rows/);
    const rowNumbers = countSection2DataRows(text);
    assert.deepEqual(rowNumbers, Array.from({ length: 21 }, (_, i) => i + 1));
    assert.ok(
      text.includes("Executable specification (Farley / agent-era ATDD)"),
      "row 21 framework label missing",
    );
    assert.ok(
      text.includes("REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3"),
      "row 21 must reference REQ token",
    );
    assert.ok(
      text.includes("farley-executable-spec-compose.md"),
      "row 21 must reference compose guide",
    );
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row21Line = section2.split("\n").find((line) => line.startsWith("| 21 |"));
    assert.ok(row21Line, "missing §2 row 21 table line");
    assert.match(row21Line, /Farley-reported/i, "row 21 sponsor_notes must label Farley-reported");
    assert.match(row21Line, /\b6\b|row 6/i, "row 21 sponsor_notes should pair ATDD row 6");
  });
});