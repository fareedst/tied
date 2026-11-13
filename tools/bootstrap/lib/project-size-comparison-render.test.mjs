import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  assertRenderableMarkdown,
  formatWallClockMinutes,
  orchestratorWallTimeSeconds,
  prepareComparisonSummaryRows,
  renderComparisonMarkdown,
  renderGradesCell,
  renderWallClockCell,
  sortSummaryRowsByDisplayLabel,
  trimComparisonDisplayLabel,
} from "./project-size-comparison-render.mjs";
import {
  buildTrialReadoutGradesIndex,
  meanCompactGrades,
} from "./read-trial-readout-session-grading.mjs";

const DOGFOOD = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../tied-project/working/REQ-TIED_PROJECT_SIZE_LAYERS/evidence/project-size-snapshot-store-dogfood.v1.json",
);

const SUMMARY_HEADER =
  /\| label \| Vocab \| REQ \| ARCH \| IMPL \| applied_utf8 \| applied_lines \| procedures \| unit \| comp \| e2e \| utf8\/atom \| oi\/atom \| pf\/atom \| wall_clock \| grades \|/;

const minimalOkReceipt = {
  ok: true,
  repo_root: "/tmp/x",
  proof_boundary: "test",
  layers: {
    atoms: { index_req: 1, index_arch: 0, index_impl: 0, vocab_preferred_terms: 0 },
    operational_intent: { applied_utf8_bytes: 1, applied_lines: 1, procedure_count: 1 },
    proof_facets: {
      unit_tests: 0,
      composition_tests: 0,
      e2e_tests: 0,
      verify_evidence_files: 0,
    },
  },
  cross_layer: {
    operational_intent_per_atom: 1,
    operational_intent_utf8_per_atom: 1,
    proof_facets_per_atom: 0,
  },
};

test("sortSummaryRowsByDisplayLabel groups by workflow prompt", () => {
  const rows = [
    { label: "2-wf-agentstream-wf-02-b", receipt: { ok: true } },
    { label: "1-wf-agentstream-wf-01-a", receipt: { ok: true } },
    { label: "3-wf-agentstream-wf-01-b", receipt: { ok: true } },
  ];
  const sorted = sortSummaryRowsByDisplayLabel(rows);
  assert.deepEqual(
    sorted.map((r) => r.label),
    ["1-wf-agentstream-wf-01-a", "3-wf-agentstream-wf-01-b", "2-wf-agentstream-wf-02-b"],
  );
});

test("trimComparisonDisplayLabel", () => {
  assert.equal(
    trimComparisonDisplayLabel("1794289703-wf-agentstream-wf-06-cursor-composer25high"),
    "wf-06-cursor-composer25high",
  );
  assert.equal(trimComparisonDisplayLabel("stdd-store"), "stdd-store");
  assert.equal(trimComparisonDisplayLabel("fixture-wf-01-alpha"), "wf-01-alpha");
});

test("renderComparisonMarkdown from dogfood receipt", () => {
  const receipt = JSON.parse(fs.readFileSync(DOGFOOD, "utf8"));
  const md = renderComparisonMarkdown([{ label: "stdd-store", receipt }], {
    generatedAt: "2026-11-09T00:00:00.000Z",
    discoverParent: "/tmp/test",
    pattern: "wf-agentstream",
  });
  assertRenderableMarkdown(md);
  assert.match(md, /proof_boundary|Proof boundary/i);
  assert.match(md, /stdd-store/);
  assert.match(md, /14866/);
  assert.match(md, /## Column definitions/);
  assert.match(md, /\*\*applied_lines\*\*/);
  assert.match(md, SUMMARY_HEADER);
  assert.doesNotMatch(md, /\| label \| ok \|/);
  assert.match(md, /\| stdd-store \| 933 \| 194 \| 189 \| 230 \|/);
  assert.match(md, /\| stdd-store \|.*\| — \| 7 \| 0 \| — \|/);
});

test("renderComparisonMarkdown trims wf label and verbose table", () => {
  const receipt = JSON.parse(fs.readFileSync(DOGFOOD, "utf8"));
  const full = "1794289703-wf-agentstream-wf-06-cursor-composer25high";
  const md = renderComparisonMarkdown([{ label: full, receipt }], {
    verboseTable: true,
  });
  assert.match(md, /\| wf-06-cursor-composer25high \|/);
  assert.doesNotMatch(md, new RegExp(`\\| ${full.replace(/\./g, "\\.")} \\|`));
  assert.match(md, /## Expanded metrics/);
  assert.match(
    md,
    /\| wf-06-cursor-composer25high \| .* \| [0-9a-f]{8} \| [0-9]+ \|/,
  );
});

test("prepareComparisonSummaryRows SC-CSC-07 epoch floor", () => {
  const rows = [
    {
      label: "1794259000-wf-agentstream-wf-01-x",
      receipt: minimalOkReceipt,
    },
    {
      label: "1794259001-wf-agentstream-wf-01-x",
      receipt: minimalOkReceipt,
    },
  ];
  const out = prepareComparisonSummaryRows(rows, { summaryEpochMin: 1794259000 });
  assert.equal(out.length, 1);
  assert.equal(out[0].label, "1794259001-wf-agentstream-wf-01-x");
});

test("prepareComparisonSummaryRows SC-CSC-08 dedupe by display label", () => {
  const rows = [
    { label: "1794259100-wf-agentstream-wf-06-a", receipt: minimalOkReceipt },
    { label: "1794259200-wf-agentstream-wf-06-a", receipt: minimalOkReceipt },
  ];
  const out = prepareComparisonSummaryRows(rows, { summaryEpochMin: 0 });
  assert.equal(out.length, 1);
  assert.equal(out[0].label, "1794259200-wf-agentstream-wf-06-a");
});

test("prepareComparisonSummaryRows SC-CSC-10 stdd-store at min 0", () => {
  const rows = [{ label: "stdd-store", receipt: minimalOkReceipt }];
  const out = prepareComparisonSummaryRows(rows, { summaryEpochMin: 0 });
  assert.equal(out.length, 1);
  assert.equal(out[0].label, "stdd-store");
});

test("orchestratorWallTimeSeconds from trial_factors SC-CSC-09", () => {
  assert.equal(
    orchestratorWallTimeSeconds({
      trial_factors: { orchestrator_wall_time_seconds: 993.6 },
    }),
    993.6,
  );
});

test("cross-layer integer rounding", () => {
  const receipt = {
    ok: true,
    repo_root: "/tmp/x",
    proof_boundary: "test",
    layers: {
      atoms: { index_req: 1, index_arch: 0, index_impl: 0, vocab_preferred_terms: 0 },
      operational_intent: {
        applied_utf8_bytes: 100,
        applied_lines: 10,
        procedure_count: 1,
      },
      proof_facets: {
        unit_tests: 0,
        composition_tests: 0,
        e2e_tests: 0,
        verify_evidence_files: 0,
      },
    },
    cross_layer: {
      operational_intent_per_atom: 3.3333333,
      operational_intent_utf8_per_atom: 33.3333333,
      proof_facets_per_atom: 0.6666666,
    },
  };
  const md = renderComparisonMarkdown([{ label: "stdd-store", receipt }]);
  assert.match(md, /\| stdd-store \|.*\| 33 \| 3 \| 1 \| — \| — \|/);
});

test("atom column order SC-CSC-12", () => {
  const receipt = {
    ok: true,
    repo_root: "/tmp/x",
    proof_boundary: "test",
    layers: {
      atoms: {
        vocab_preferred_terms: 3,
        index_req: 1,
        index_arch: 2,
        index_impl: 4,
      },
      operational_intent: {
        applied_utf8_bytes: 1,
        applied_lines: 1,
        procedure_count: 1,
      },
      proof_facets: {
        unit_tests: 0,
        composition_tests: 0,
        e2e_tests: 0,
        verify_evidence_files: 0,
      },
    },
    cross_layer: {
      operational_intent_per_atom: 0,
      operational_intent_utf8_per_atom: 0,
      proof_facets_per_atom: 0,
    },
  };
  const md = renderComparisonMarkdown([{ label: "atom-order-fixture", receipt }], {
    summaryEpochMin: 0,
  });
  assert.match(md, SUMMARY_HEADER);
  assert.match(md, /\| atom-order-fixture \| 3 \| 1 \| 2 \| 4 \|/);
  const defs = md.split("## Summary")[0];
  const vocabPos = defs.indexOf("**Vocab**");
  const reqPos = defs.indexOf("**REQ**");
  const archPos = defs.indexOf("**ARCH**");
  const implPos = defs.indexOf("**IMPL**");
  assert.ok(vocabPos < reqPos && reqPos < archPos && archPos < implPos, "defs Vocab before REQ before ARCH before IMPL");
});

test("cross-layer column order SC-CSC-11", () => {
  const receipt = {
    ok: true,
    repo_root: "/tmp/x",
    proof_boundary: "test",
    layers: {
      atoms: { index_req: 1, index_arch: 0, index_impl: 0, vocab_preferred_terms: 0 },
      operational_intent: {
        applied_utf8_bytes: 1,
        applied_lines: 1,
        procedure_count: 1,
      },
      proof_facets: {
        unit_tests: 1,
        composition_tests: 0,
        e2e_tests: 0,
        verify_evidence_files: 0,
      },
    },
    cross_layer: {
      operational_intent_per_atom: 10,
      operational_intent_utf8_per_atom: 20,
      proof_facets_per_atom: 30,
    },
  };
  const md = renderComparisonMarkdown([{ label: "stdd-store", receipt }], { summaryEpochMin: 0 });
  assert.match(md, SUMMARY_HEADER);
  assert.match(md, /\| stdd-store \|.*\| 20 \| 10 \| 30 \| — \| — \|/);
  const defs = md.split("## Summary")[0];
  const utf8Pos = defs.indexOf("**utf8/atom**");
  const oiPos = defs.indexOf("**oi/atom**");
  const pfPos = defs.indexOf("**pf/atom**");
  assert.ok(utf8Pos < oiPos && oiPos < pfPos, "column definitions utf8 before oi before pf");
});

test("formatWallClockMinutes SC-CWC-02 SC-CWC-04", () => {
  assert.equal(formatWallClockMinutes(null), null);
  assert.equal(formatWallClockMinutes(993.6), 17);
  assert.equal(formatWallClockMinutes(29), 0);
  assert.equal(formatWallClockMinutes(30), 1);
});

test("renderWallClockCell", () => {
  assert.equal(
    renderWallClockCell({ trial_factors: { orchestrator_wall_time_seconds: 993.6 } }),
    "17",
  );
  assert.equal(renderWallClockCell({}), "—");
});

test("renderComparisonMarkdown wall_clock last column SC-CWC-01 SC-CWC-04", () => {
  const receipt = {
    ...minimalOkReceipt,
    trial_factors: { orchestrator_wall_time_seconds: 993.6 },
  };
  const md = renderComparisonMarkdown(
    [{ label: "1794289703-wf-agentstream-wf-06-cursor-composer25high", receipt }],
    { summaryEpochMin: 0 },
  );
  assert.doesNotMatch(md, /\| wall_time \|/);
  assert.match(md, /\*\*wall_clock\*\*/);
  assert.match(md, /\| wf-06-cursor-composer25high \|.*\| 17 \| — \|/);
});

test("SC-CGR-02 grades cell from injected index", () => {
  const basename = "1799990001-wf-agentstream-wf-10-cursor-test";
  const display = "3.50 · A/A/A/A/A/A/A";
  const md = renderComparisonMarkdown([{ label: basename, receipt: minimalOkReceipt }], {
    summaryEpochMin: 0,
    gradesIndex: new Map([[basename, { display }]]),
  });
  assert.match(md, SUMMARY_HEADER);
  assert.match(md, new RegExp(`\\| wf-10-cursor-test \\|.*\\| ${display.replace(/\./g, "\\.")} \\|`));
});

test("SC-CGR-03 missing grades index entry", () => {
  assert.equal(renderGradesCell("unknown-basename", new Map()), "—");
  const md = renderComparisonMarkdown([{ label: "no-readout-fixture", receipt: minimalOkReceipt }], {
    summaryEpochMin: 0,
    gradesIndex: new Map(),
  });
  assert.match(md, /\| no-readout-fixture \|.*\| — \| — \|$/m);
});

test("SC-CGR-04 dedupe winner basename drives grades lookup", () => {
  const older = "1794259100-wf-agentstream-wf-06-a";
  const newer = "1794259200-wf-agentstream-wf-06-a";
  const olderDisplay = "1.00 · F/F/F/F/F/F/F";
  const newerDisplay = "4.00 · A/A/A/A/A/A/A";
  const rows = [
    { label: older, receipt: minimalOkReceipt },
    { label: newer, receipt: minimalOkReceipt },
  ];
  const md = renderComparisonMarkdown(rows, {
    summaryEpochMin: 0,
    gradesIndex: new Map([
      [older, { display: olderDisplay }],
      [newer, { display: newerDisplay }],
    ]),
  });
  assert.match(md, new RegExp(`\\| wf-06-a \\|.*\\| ${newerDisplay.replace(/\./g, "\\.")} \\|`));
  assert.doesNotMatch(md, /1\.00 · F/);
});

test("SC-CGR-05 glossary grades and intro wording", () => {
  const md = renderComparisonMarkdown([{ label: "stdd-store", receipt: minimalOkReceipt }], {
    summaryEpochMin: 0,
  });
  assert.match(md, /\*\*grades\*\*/);
  assert.match(md, /Req\/Tr\/Ts\/Al\/Pr\/Ch\/Ml/);
  assert.match(md, /not REQ status, not a leaderboard/);
  assertRenderableMarkdown(md);
});

test("buildTrialReadoutGradesIndex indexes grok47med WF-10 readout", () => {
  const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const index = buildTrialReadoutGradesIndex(storeRoot);
  const key = "1794525072-wf-agentstream-wf-10-cursor-grok47med";
  assert.ok(index.has(key), `expected readout index for ${key}`);
  const entry = index.get(key);
  assert.match(entry.display, /^\d+\.\d{2} · /);
  assert.equal(entry.display, meanCompactGrades(entry.compactSlash).display);
});
