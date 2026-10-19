import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { validateEdpcClientAssessment } from "./client-assessment-validate.js";
import type { EdpcPublishManifest } from "./publish-build.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures/edpc/cam");

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
describe("EDPC client assessment validate [REQ-TIED_EDPC_CLIENT_ASSESSMENT]", () => {
  const charter = JSON.parse(readFileSync(join(fixtureDir, "charter-minimal.json"), "utf8"));
  const manifest = JSON.parse(
    readFileSync(join(fixtureDir, "publish-manifest-minimal.json"), "utf8"),
  ) as EdpcPublishManifest;

  it("accepts minimal charter and manifest when receipts unresolved but refresh_gap set", () => {
    const result = validateEdpcClientAssessment({
      charter: { ...charter, refresh_gap: "refresh EASAR receipts before Trust section" },
      publish_manifest: manifest,
      receipt_exists: (p) => p.includes("inventory"),
    });
    assert.equal(result.ok, true);
  });

  it("rejects stale receipt refs without refresh_gap", () => {
    const result = validateEdpcClientAssessment({
      charter,
      publish_manifest: manifest,
      receipt_exists: () => false,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("stale_receipt_refs_without_refresh_gap"));
  });

  it("rejects blanket overlay on source_static", () => {
    const result = validateEdpcClientAssessment({
      charter,
      assessment_context: {
        aggregate_health_summary: "Production is healthy",
        evidence_refs: [],
      },
      publish_manifest: manifest,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("blanket_trust_health_without_evidence_refs"));
  });
});
