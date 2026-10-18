/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_INDEPENDENT]
 */

import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildAssessorAgreementReportV1,
  loadIndependentAssessmentRecordFromFile,
} from "./independent-assessment.js";

describe("independent-assessment [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("detects assessor identity conflict", () => {
    const fixture = path.join(import.meta.dirname, "fixtures/assessor-a.v1.json");
    const bad = loadIndependentAssessmentRecordFromFile(fixture, "assessor-alpha");
    assert.equal(bad.ok, false);
    assert.ok(bad.diagnostics.some((d) => d.code === "INSUFFICIENT_INDEPENDENCE"));
  });

  it("builds agreement report across assessors", () => {
    const a = loadIndependentAssessmentRecordFromFile(
      path.join(import.meta.dirname, "fixtures/assessor-a.v1.json"),
      "implementer-1",
    );
    const b = loadIndependentAssessmentRecordFromFile(
      path.join(import.meta.dirname, "fixtures/assessor-b.v1.json"),
      "implementer-2",
    );
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    const report = buildAssessorAgreementReportV1([a.record!, b.record!]);
    assert.equal(report.ok, true);
    assert.ok(report.report!.disagreement_rate > 0);
  });
});
