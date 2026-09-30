/**
 * [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] W3 contract tests — fixtures + benchmark schema.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { redactString } from "./redact-state.js";
import {
  BENCHMARK_SCHEMA,
  createLabelMockDecideFn,
  deterministicDispositionFromExcerpt,
  evaluateFixtureArm,
  isCanarySecretFixture,
  loadLabeledEvidenceFixturesFromFile,
  runChecklistEvidenceSufficiencyBenchmark,
  validateFixtureRowShape,
} from "./checklist-evidence-sufficiency-benchmark.js";
import type { LabeledEvidenceFixtureRow } from "./checklist-evidence-sufficiency-benchmark.js";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const fixturePath = path.join(
  repoRoot,
  "test/fixtures/checklist-evidence-sufficiency/labeled-corpus.v1.jsonl",
);

describe("W3 checklist evidence sufficiency fixtures SC-FIXTURES", () => {
  it("corpus has at least 20 labeled rows with valid shape", () => {
    const rows = loadLabeledEvidenceFixturesFromFile(fixturePath);
    assert.ok(rows.length >= 20, `expected >=20 fixtures, got ${rows.length}`);
    for (const row of rows) {
      assert.ok(validateFixtureRowShape(row), `invalid shape: ${row.id}`);
    }
    const labels = new Set(rows.map((r) => r.label));
    assert.ok(labels.has("substantive"));
    assert.ok(labels.has("superficial"));
    assert.ok(labels.has("borderline"));
    const canary = rows.find((r) => r.canary_secret);
    assert.ok(canary);
    assert.match(canary!.evidence, /jv_live_CANARY_SECRET_DO_NOT_COMMIT/);
    assert.ok(!canary!.evidence.includes("sk-"), "no live API key patterns in fixtures");
    assert.ok(isCanarySecretFixture(canary!));
    const redacted = redactString(canary!.evidence);
    assert.ok(!redacted.includes("jv_live_CANARY_SECRET_DO_NOT_COMMIT"));
  });

  it("deterministic tier-1 rejects empty and missing tokens", () => {
    assert.equal(
      deterministicDispositionFromExcerpt({ evidence: "   " }),
      "reject_deterministic",
    );
    assert.equal(
      deterministicDispositionFromExcerpt({
        evidence: "no tokens here",
        required_tokens: ["REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY"],
      }),
      "reject_deterministic",
    );
  });
});

describe("W3 checklist evidence sufficiency benchmark SC-BENCH-ARMS", () => {
  it("mocked replay produces checklist-evidence-sufficiency-benchmark.v1", async () => {
    const fixtureBody = fs.readFileSync(fixturePath, "utf8");
    const fixtures = loadLabeledEvidenceFixturesFromFile(fixturePath);
    const report = await runChecklistEvidenceSufficiencyBenchmark({
      fixtures,
      fixturePath,
      fixtureBody,
      gitRev: "test",
      mode: "mocked",
    });

    assert.equal(report.schema, BENCHMARK_SCHEMA);
    assert.ok(report.meta.fixture_hash.length === 64);
    assert.deepEqual(report.meta.arms.sort(), [
      "deterministic_only",
      "jev_off",
      "jev_on",
      "shadow_compare",
    ].sort());
    assert.equal(report.authority_invariant_ok, true);
    const serialized = JSON.stringify(report);
    assert.ok(!serialized.includes("jv_live_CANARY_SECRET_DO_NOT_COMMIT"));
    for (const arm of Object.values(report.arms)) {
      for (const row of arm.per_fixture) {
        assert.equal(row.authority_gate_allowed_emitted, false);
      }
    }
    assert.ok(report.arms.jev_on);
    assert.ok(report.arms.deterministic_only);
    assert.ok(report.arms.jev_off);
  });

  it("jev_on mocked agreement meets 85% on clear substantive vs superficial", async () => {
    const fixtureBody = fs.readFileSync(fixturePath, "utf8");
    const fixtures = loadLabeledEvidenceFixturesFromFile(fixturePath);
    const report = await runChecklistEvidenceSufficiencyBenchmark({
      fixtures,
      fixturePath,
      fixtureBody,
      gitRev: "test",
      mode: "mocked",
      arms: ["jev_on"],
    });
    const rate = report.agreement.jev_on_agreement_rate;
    assert.ok(rate !== null);
    assert.ok(
      rate! >= 0.85,
      `jev_on agreement ${rate} below 0.85 — ${report.agreement.jev_on_agreement_count}/${report.agreement.clear_substantive_superficial_count}`,
    );
  });

  it("jev_off fail-open passes superficial tier-1 rows marked fail_open_to_gate", async () => {
    const row: LabeledEvidenceFixtureRow = {
      id: "probe-fail-open",
      label: "superficial",
      evidence: "Looks fine; no logs attached.",
      expected_disposition: "fail_open_to_gate",
      gate_phase: "verification",
      step_slug: "traceable-commit",
    };
    const off = await evaluateFixtureArm({ row, arm: "jev_off" });
    assert.equal(off.predicted, "fail_open_to_gate");
    assert.equal(off.pre_gate_ok, true);
    const on = await evaluateFixtureArm({
      row,
      arm: "jev_on",
      decideFn: createLabelMockDecideFn("superficial"),
    });
    assert.equal(on.pre_gate_ok, false);
  });
});
