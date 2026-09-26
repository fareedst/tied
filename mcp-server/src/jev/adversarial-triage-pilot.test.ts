/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W4 adversarial triage pilot
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  classifyTriage,
  compareObservationToLabels,
  loadLabeledTriageFixture,
  observeAdversarialTriageCase,
  runAdversarialTriagePilot,
} from "./adversarial-triage-pilot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(
  __dirname,
  "../../../working/REQ-TIED_JEV_DECISION_COPROCESSOR/fixtures/adversarial-triage-labeled.v1.json",
);

describe("REQ-TIED_JEV_DECISION_COPROCESSOR W4 adversarial triage pilot", () => {
  const cases = loadLabeledTriageFixture(
    JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as { cases: never[] },
  );

  it("loads labeled fixture from go-rootjobs-derived cases", () => {
    assert.ok(cases.length >= 6);
    assert.ok(cases.some((c) => c.id.startsWith("rootjobs-")));
  });

  it("classifyTriage maps aligned nouls", () => {
    assert.equal(
      classifyTriage({
        criterion_met: 0.9,
        spec_gap: 0.1,
        test_supports_claim: 0.85,
        implementation_drift: 0.05,
      }),
      "aligned",
    );
  });

  it("classifyTriage maps spec_gap", () => {
    assert.equal(
      classifyTriage({
        criterion_met: 0.2,
        spec_gap: 0.9,
        test_supports_claim: 0.1,
        implementation_drift: 0.1,
      }),
      "spec_gap",
    );
  });

  it("observeAdversarialTriageCase skips without credentials", async () => {
    const obs = await observeAdversarialTriageCase(cases[0]!, { apiKey: undefined });
    assert.equal(obs.jev_skipped, true);
    assert.equal(obs.matches_labels, null);
  });

  it("observeAdversarialTriageCase matches labels when mock Jev aligns", async () => {
    const labeled = cases.find((c) => c.id === "rootjobs-orphan-aligned")!;
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: {
            criterion_met: { type: "noul", noul: 0.95 },
            spec_gap: { type: "noul", noul: 0.05 },
            test_supports_claim: { type: "noul", noul: 0.92 },
            implementation_drift: { type: "noul", noul: 0.04 },
          },
        }),
        { status: 200 },
      );

    const obs = await observeAdversarialTriageCase(labeled, {
      apiKey: "test",
      fetchImpl,
    });
    assert.equal(obs.triage_class, "aligned");
    assert.equal(obs.matches_labels, true);
  });

  it("compareObservationToLabels detects boolean mismatch", () => {
    const cmp = compareObservationToLabels(
      { criterion_met: 0.9, spec_gap: 0.9, test_supports_claim: 0.1, implementation_drift: 0.1 },
      {
        criterion_met: true,
        spec_gap: false,
        test_supports_claim: true,
        implementation_drift: false,
      },
    );
    assert.equal(cmp.matches, false);
    assert.ok(cmp.mismatches.includes("spec_gap"));
  });

  it("runAdversarialTriagePilot report schema when Jev skipped", async () => {
    const report = await runAdversarialTriagePilot(cases.slice(0, 2), {
      apiKey: undefined,
    });
    assert.equal(report.schema, "adversarial-triage-pilot.v1");
    assert.equal(report.jev_invoked, false);
    assert.equal(report.agreement_rate, null);
  });
});
