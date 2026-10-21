/**
 * [REQ-TIED_HARNESS_LANGCHAIN_PHASE3] Methodology composition matrix §2 row 15 contract.
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

describe("methodology composition matrix LangChain row [REQ-TIED_HARNESS_LANGCHAIN_PHASE3]", () => {
  it("has exactly 15 §2 data rows including LangChain harness engineering row 15", () => {
    assert.ok(fs.existsSync(matrixPath), `missing matrix: ${matrixPath}`);
    const text = fs.readFileSync(matrixPath, "utf8");
    assert.match(text, /§2 \*\*15\*\* rows/);
    assert.match(text, /exactly \*\*15\*\* data rows/);
    const rowNumbers = countSection2DataRows(text);
    assert.deepEqual(rowNumbers, Array.from({ length: 15 }, (_, i) => i + 1));
    assert.ok(
      text.includes("LangChain harness engineering (empirical trace loop)"),
      "row 15 framework label missing"
    );
    assert.ok(
      text.includes("langchain-harness-engineering-vs-tied-agent-management.md"),
      "row 15 must link LangChain comparison"
    );
    assert.ok(text.includes("@harness-trace-analyzer"), "row 15 must reference analyzer skill");
    assert.ok(text.includes("@harness-trace-review"), "row 15 must reference review skill");
    assert.ok(
      text.includes("traefik-harness-platform-vs-tied-agent-management.md"),
      "row 15 must reference Traefik seam (row 13)"
    );
    const section2Start = text.indexOf("## §2 — Layer C adjacent frameworks");
    const section3Start = text.indexOf("## §3 — Sponsor fill-in checklist");
    const section2 = text.slice(section2Start, section3Start);
    const row15Line = section2.split("\n").find((line) => line.startsWith("| 15 | LangChain"));
    assert.ok(row15Line, "missing §2 row 15 LangChain table line");
    assert.match(row15Line, /LangChain-reported/i, "row 15 sponsor_notes must label LangChain-reported");
  });
});
