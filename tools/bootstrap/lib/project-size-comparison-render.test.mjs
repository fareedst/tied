import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  assertRenderableMarkdown,
  orchestratorWallTimeSeconds,
  prepareComparisonSummaryRows,
  renderComparisonMarkdown,
  sortSummaryRowsByDisplayLabel,
  trimComparisonDisplayLabel,
} from "./project-size-comparison-render.mjs";

const DOGFOOD = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../tied-project/working/REQ-TIED_PROJECT_SIZE_LAYERS/evidence/project-size-snapshot-store-dogfood.v1.json",
);

const SUMMARY_HEADER =
  /\| label \| REQ \| ARCH \| IMPL \| Vocab \| applied_utf8 \| applied_lines \| procedures \| unit \| comp \| e2e \| oi\/atom \| utf8\/atom \| pf\/atom \| wall_time \|/;

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
  assert.match(md, /\| stdd-store \| 194 \|/);
  assert.match(md, /\| stdd-store \|.*\| 7 \| — \| 0 \|/);
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
  assert.match(md, /\| stdd-store \|.*\| 3 \| 33 \| 1 \| — \|/);
});

test("renderComparisonMarkdown wall_time last column SC-CSC-09", () => {
  const receipt = {
    ...minimalOkReceipt,
    trial_factors: { orchestrator_wall_time_seconds: 993.6 },
  };
  const md = renderComparisonMarkdown(
    [{ label: "1794289703-wf-agentstream-wf-06-cursor-composer25high", receipt }],
    { summaryEpochMin: 0 },
  );
  assert.match(md, /\| wf-06-cursor-composer25high \|.*\| 994 \|/);
});
