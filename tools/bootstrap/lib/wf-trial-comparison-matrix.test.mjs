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
  toolsetKeyFromMasterRowWithColumnCheck,
} from "./wf-trial-comparison-matrix.mjs";
import { buildMatrixSection } from "./build-wf-trial-comparison-matrix.mjs";

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

test("SC-WF-CMX-20 Claude Sonnet medium readout maps to sonnet @medium key", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "claude",
    slug: "claude-sonnet-5-5",
    readout:
      "trial-readout-PROMPT-WF-01-claudesonnet55medium-1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium.md",
  });
  assert.equal(key, "claude:claude-sonnet-5-5@medium");
  assert.notEqual(key, "claude:claude-sonnet-5-5");
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

test("SC-WF-CMX-11 thirteen distinct column headers", () => {
  const headers = MATRIX_COLUMNS.map((c) => c.header);
  assert.equal(headers.length, 13);
  assert.equal(new Set(headers).size, 13);
});

test("SC-WF-CMX-22 Sonnet high readout maps to sonnet @high key", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "claude",
    slug: "claude-sonnet-5-5",
    readout:
      "trial-readout-PROMPT-WF-10-claudesonnet55high-1794411691-wf-agentstream-wf-10-claude-claudesonnet55high.md",
  });
  assert.equal(key, "claude:claude-sonnet-5-5@high");
  assert.notEqual(key, "claude:claude-sonnet-5-5");
});

test("SC-WF-CMX-23 Haiku high readout maps to haiku @high key", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "claude",
    slug: "claude-haiku-5-5",
    readout:
      "trial-readout-PROMPT-WF-10-claudehaiku55high-1794409094-wf-agentstream-wf-10-claude-claudehaiku55high.md",
  });
  assert.equal(key, "claude:claude-haiku-5-5@high");
});

test("SC-WF-CMX-24 Claude effort=high column headers present", () => {
  const haiku = MATRIX_COLUMNS.find((c) => c.key === "claude:claude-haiku-5-5@high");
  const sonnet = MATRIX_COLUMNS.find((c) => c.key === "claude:claude-sonnet-5-5@high");
  assert.ok(haiku);
  assert.ok(sonnet);
  assert.equal(haiku.header, "Claude · `claude-haiku-5-5` effort=high");
  assert.equal(sonnet.header, "Claude · `claude-sonnet-5-5` effort=high");
});

test("SC-WF-CMX-26 medium effort does not fall back to baseline when @medium missing", () => {
  const row = {
    harness: "claude",
    slug: "claude-sonnet-5-5",
    readout:
      "trial-readout-PROMPT-WF-01-claudesonnet55medium-1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium.md",
  };
  const onlyBaseline = (k) => k === "claude:claude-sonnet-5-5";
  const key = toolsetKeyFromMasterRowWithColumnCheck(row, onlyBaseline);
  assert.equal(key, null);
});

test("SC-WF-CMX-21 Sonnet effort=medium column header present", () => {
  const col = MATRIX_COLUMNS.find((c) => c.key === "claude:claude-sonnet-5-5@medium");
  assert.ok(col);
  assert.equal(col.header, "Claude · `claude-sonnet-5-5` effort=medium");
});

test("SC-WF-CMX-14 columns sorted alphabetically by header", () => {
  const headers = MATRIX_COLUMNS.map((c) => c.header);
  const sorted = [...headers].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(headers, sorted);
  assert.match(headers[0], /^Claude /);
  const firstCursor = headers.findIndex((h) => h.startsWith("Cursor "));
  const lastClaude = headers.findLastIndex((h) => h.startsWith("Claude "));
  assert.ok(firstCursor > lastClaude);
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

test("SC-WF-CMX-15 matrix section ends with repeated header row", () => {
  const section = buildMatrixSection(new Map(), ["01"]);
  const tableLines = section.split("\n").filter((line) => line.startsWith("| "));
  const header = tableLines[0];
  const footer = tableLines[tableLines.length - 1];
  assert.equal(footer, header);
});

test("SC-WF-CMX-16 grok47 low slug maps to cursor:grok47-low", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "cursor",
    slug: "grok-4.7-low-fast",
    readout:
      "trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md",
  });
  assert.equal(key, "cursor:grok47-low");
});

test("SC-WF-CMX-17 grok47 low not mapped to grok47-med", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "cursor",
    slug: "grok-4.7-low-fast",
    readout:
      "trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md",
  });
  assert.notEqual(key, "cursor:grok47-med");
});

test("SC-WF-CMX-18 grok47 medium slug maps to cursor:grok47-med", () => {
  const key = toolsetKeyFromMasterRow({
    harness: "cursor",
    slug: "grok-4.7-medium-fast",
    readout:
      "trial-readout-PROMPT-WF-10-grok47med-1794525072-wf-agentstream-wf-10-cursor-grok47med.md",
  });
  assert.equal(key, "cursor:grok47-med");
});

test("SC-WF-CMX-19 grok47-low header immediately before grok47-med", () => {
  const headers = MATRIX_COLUMNS.map((c) => c.header);
  const lowIdx = headers.indexOf("Cursor · `grok47-low` effort=low");
  const medIdx = headers.indexOf("Cursor · `grok47-med` effort=low");
  assert.ok(lowIdx >= 0);
  assert.ok(medIdx >= 0);
  assert.equal(lowIdx, medIdx - 1);
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
