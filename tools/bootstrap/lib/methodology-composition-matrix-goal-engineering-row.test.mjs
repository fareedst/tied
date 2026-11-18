/**
 * [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3] Methodology composition matrix §2 row 20 contract.
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

describe("methodology composition matrix goal engineering row [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3]", () => {
  it("includes LangChain goal engineering row 20 identity (global §2 inventory owned by farley row test)", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.ok(
      text.includes("LangChain goal engineering (feedback-aligned scope)"),
      "row 20 framework label missing",
    );
    assert.ok(
      text.includes("REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3"),
      "row 20 must reference REQ token",
    );
    assert.ok(
      text.includes("goal-engineering-feedback-scope-compose.md"),
      "row 20 must reference compose guide",
    );
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row20Line = section2.split("\n").find((line) => line.startsWith("| 20 |"));
    assert.ok(row20Line, "missing §2 row 20 table line");
    assert.match(row20Line, /LangChain-reported/i, "row 20 sponsor_notes must label LangChain-reported");
    assert.match(row20Line, /14–15|14-15/, "row 20 sponsor_notes should pair harness rows 14–15");
  });
});