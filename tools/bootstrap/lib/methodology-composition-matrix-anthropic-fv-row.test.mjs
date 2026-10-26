/**
 * [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] Methodology composition matrix §2 row 16 (Anthropic FV compose).
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

describe("methodology composition matrix Anthropic FV row [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE]", () => {
  it("has exactly 16 §2 data rows including formal verification compose row 16", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.match(text, /§2 \*\*16\*\* rows/);
    assert.match(text, /exactly \*\*16\*\* data rows/);
    const rowNumbers = countSection2DataRows(text);
    assert.deepEqual(rowNumbers, Array.from({ length: 16 }, (_, i) => i + 1));
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row16Line = section2.split("\n").find((line) => line.startsWith("| 16 |"));
    assert.ok(row16Line, "missing §2 row 16 table line");
    assert.ok(
      row16Line.includes("formal verification") || row16Line.includes("proof-checker"),
      "row 16 framework label must reference formal verification compose",
    );
    assert.ok(
      text.includes("anthropic-llm-formal-verification-vs-tied-agent-management.md"),
      "row 16 must link Anthropic FV comparison",
    );
    assert.ok(
      text.includes("tests-vs-checker-backed-claims.md"),
      "row 16 must link checker-backed claims guide",
    );
    assert.match(row16Line, /Anthropic-reported|not_measured/i, "row 16 sponsor_notes must label metrics");
  });
});
