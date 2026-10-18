/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] bundle composition smoke
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultBundleRoot, loadProcessCertificationBundleV1 } from "./spec-loader.js";

describe("process-certification composition [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("bundle pack includes process-certification resources", () => {
    const result = loadProcessCertificationBundleV1(defaultBundleRoot());
    assert.equal(result.ok, true);
    assert.ok(result.bundle?.catalog.entries.length === 7);
  });
});
