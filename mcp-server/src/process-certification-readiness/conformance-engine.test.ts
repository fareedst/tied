/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_CONFORMANCE]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { evaluateConformanceMatrixV1 } from "./conformance-engine.js";
import { defaultBundleRoot, loadProcessCertificationBundleV1 } from "./spec-loader.js";
import type { EdseProcessRecordV1 } from "./types.js";

describe("conformance-engine [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("golden process record passes all clauses", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    assert.equal(bundle.ok, true);
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    const result = evaluateConformanceMatrixV1({
      record,
      catalog: bundle.bundle!.catalog,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    assert.equal(result.ok, true);
    assert.equal(result.matrix?.rows.every((r) => r.status === "pass"), true);
  });

  it("fails on stale spec hash", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    record.spec_content_hash = "stale";
    const result = evaluateConformanceMatrixV1({
      record,
      catalog: bundle.bundle!.catalog,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === "STALE_SPEC_HASH"));
  });
});
