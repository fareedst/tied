/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_CAPABILITY]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { evaluateCapabilityProfileV1 } from "./capability-model.js";
import { defaultBundleRoot, loadProcessCertificationBundleV1 } from "./spec-loader.js";
import type { EdseProcessRecordV1 } from "./types.js";

describe("capability-model [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("evaluates seven dimensions independently", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    const result = evaluateCapabilityProfileV1({
      record,
      model: bundle.bundle!.capabilityModel,
      specContentHash: bundle.bundle!.spec.content_hash,
    });
    assert.equal(result.ok, true);
    assert.equal(result.profile?.dimensions.length, 7);
  });

  it("rejects rollup options", () => {
    const bundle = loadProcessCertificationBundleV1(defaultBundleRoot());
    const record = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "fixtures/golden-process-record.v1.json"),
        "utf8",
      ),
    ) as EdseProcessRecordV1;
    const result = evaluateCapabilityProfileV1({
      record,
      model: bundle.bundle!.capabilityModel,
      specContentHash: bundle.bundle!.spec.content_hash,
      options: { include_aggregate_score: true },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === "AGGREGATE_SCORE_FORBIDDEN"));
  });
});
