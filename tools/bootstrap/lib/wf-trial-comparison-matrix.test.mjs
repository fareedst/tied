/**
 * [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS] SC-WF-CMX-01…04
 * [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS] SC-WF-CMX-10…13
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  MATRIX_COLUMNS,
  renderWfTrialComparisonMatrixCell,
  toolsetKeyFromMasterRow,
} from "./wf-trial-comparison-matrix.mjs";

test("SC-WF-CMX-02 wall line uses formatWallClockMinutes + m suffix", () => {
  const cell = renderWfTrialComparisonMatrixCell({
    wallSeconds: 1162,
    gradesDisplay: "3.87 · A/A−/A/A/A−/A/A−",
    readout: "trial-readout-x.md",
  });
  assert.match(cell, /^\*\*19m\*\*/);
  assert.doesNotMatch(cell, /\d+s/);
});

test("SC-WF-CMX-02b rounding edges", () => {
  assert.match(
    renderWfTrialComparisonMatrixCell({
      wallSeconds: 30,
      gradesDisplay: "3.00 · A/A/A/A/A/A/A",
      readout: "r.md",
    }),
    /^\*\*1m\*\*/,
  );
  assert.match(
    renderWfTrialComparisonMatrixCell({ wallSeconds: 29, gradesDisplay: "—", readout: "r.md" }),
    /^\*\*0m\*\*/,
  );
});

test("SC-WF-CMX-02c missing wall", () => {
  const cell = renderWfTrialComparisonMatrixCell({
    wallSeconds: null,
    gradesDisplay: "3.50 · A/A/A/A/A/A/A",
    readout: "r.md",
  });
  assert.match(cell, /^\*\*—\*\*/);
});

test("SC-WF-CMX-03 grades pass-through", () => {
  const grades = "3.87 · A/A−/A/A/A−/A/A−";
  const cell = renderWfTrialComparisonMatrixCell({
    wallSeconds: 706,
    gradesDisplay: grades,
    readout: "r.md",
  });
  assert.match(cell, new RegExp(`\\*\\*${grades.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`));
});

test("SC-WF-CMX-03b all missing", () => {
  assert.equal(
    renderWfTrialComparisonMatrixCell({
      wallSeconds: null,
      gradesDisplay: "—",
      readout: "r.md",
    }),
    "—",
  );
});

test("SC-WF-CMX-07 Claude Haiku low maps to claude:claude-haiku-5-5", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "claude",
    slug: "claude-haiku-5-5",
    readout:
      "trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md",
  });
  assert.equal(key, "claude:claude-haiku-5-5");
  assert.notEqual(key, "claude:composer-2.5");
});

test("SC-WF-CMX-08 Claude Haiku medium readout maps to @medium key", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "claude",
    slug: "claude-haiku-5-5",
    readout:
      "trial-readout-PROMPT-WF-09-claudehaiku55medium-1794350349-wf-agentstream-wf-09-claude-claudehaiku55medium.md",
  });
  assert.equal(key, "claude:claude-haiku-5-5@medium");
});

test("SC-WF-CMX-09 Haiku baseline column header uses catalog slug", () => {
  const col = MATRIX_COLUMNS.find((c) => c.key === "claude:claude-haiku-5-5");
  assert.ok(col);
  assert.equal(col.header, "Claude · `claude-haiku-5-5` effort=low");
});

test("SC-WF-CMX-10 effort headers on tiered models only", () => {
  const effortRe = /effort=(low|medium|high)/;
  for (const col of MATRIX_COLUMNS) {
    if (col.key === "cursor:composer-2.5") {
      assert.doesNotMatch(col.header, effortRe);
    } else {
      assert.match(col.header, effortRe);
    }
  }
});

test("SC-WF-CMX-11 nine distinct column headers", () => {
  const headers = MATRIX_COLUMNS.map((c) => c.header);
  assert.equal(headers.length, 9);
  assert.equal(new Set(headers).size, 9);
});

test("SC-WF-CMX-12 Haiku baseline header exact", () => {
  const col = MATRIX_COLUMNS.find((c) => c.key === "claude:claude-haiku-5-5");
  assert.equal(col?.header, "Claude · `claude-haiku-5-5` effort=low");
});

test("SC-WF-CMX-13 composer misdirected effort readouts map to baseline key", () => {
  const medium = toolsetKeyFromMasterRow({
    harness: "cursor",
    slug: "composer-2.5-fast",
    readout:
      "trial-readout-PROMPT-WF-01-composer25medium-1794249821-wf-agentstream-wf-01-cursor-composer25medium.md",
  });
  assert.equal(medium, "cursor:composer-2.5");
  const high = toolsetKeyFromMasterRow({
    harness: "cursor",
    slug: "composer-2.5-fast",
    readout:
      "trial-readout-PROMPT-WF-03-composer25high-1794264348-wf-agentstream-wf-03-cursor-composer25high.md",
  });
  assert.equal(high, "cursor:composer-2.5");
  assert.ok(!MATRIX_COLUMNS.some((c) => c.key.includes("composer-2.5@")));
});

test("SC-WF-CMX-04 three-line contract", () => {
  const cell = renderWfTrialComparisonMatrixCell({
    wallSeconds: 427,
    gradesDisplay: "3.29 · A/B−/B+/B/C+/B/B",
    readout: "trial-readout-PROMPT-WF-10.md",
  });
  assert.equal(
    cell,
    "**7m**<br>**3.29 · A/B−/B+/B/C+/B/B**<br>[readout](trial-readout-PROMPT-WF-10.md)",
  );
});
