/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_REPORT]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { evaluateCapabilityProfileV1 } from "./capability-model.js";
import { evaluateConformanceMatrixV1 } from "./conformance-engine.js";
import { composeCertifiabilityReadinessV1, generateAssessorPackV1 } from "./readiness-report.js";
import { defaultBundleRoot, loadProcessCertificationBundleV1 } from "./spec-loader.js";
import type { EdseProcessRecordV1 } from "./types.js";

describe("readiness-report [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("golden path yields ready_for_external_appraisal", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    const matrix = evaluateConformanceMatrixV1({
      record,
      catalog: bundle.bundle!.catalog,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    const profile = evaluateCapabilityProfileV1({
      record,
      model: bundle.bundle!.capabilityModel,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    const readiness = composeCertifiabilityReadinessV1({
      matrix: matrix.matrix!,
      profile: profile.profile!,
    });
    assert.equal(readiness.ok, true);
    assert.equal(readiness.readiness?.readiness_state, "ready_for_external_appraisal");
    const pack = generateAssessorPackV1({
      readiness: readiness.readiness!,
      bundleSpecVersion: bundle.bundle!.spec.spec_version,
    });
    assert.ok(pack.limitations.length > 0);
  });

  it("forbids certified output request", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    const matrix = evaluateConformanceMatrixV1({
      record,
      catalog: bundle.bundle!.catalog,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    const profile = evaluateCapabilityProfileV1({
      record,
      model: bundle.bundle!.capabilityModel,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    const readiness = composeCertifiabilityReadinessV1({
      matrix: matrix.matrix!,
      profile: profile.profile!,
      requestCertifiedOutput: true,
    });
    assert.equal(readiness.ok, false);
    assert.ok(readiness.diagnostics.some((d) => d.code === "FORBIDDEN_CERTIFICATION_CLAIM"));
  });
});
