import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { composeEdpcClientAssessment } from "./client-assessment-compose.js";
import type { EdpcPublishManifest } from "./publish-build.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures/edpc/cam");

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
describe("EDPC client assessment compose [REQ-TIED_EDPC_CLIENT_ASSESSMENT]", () => {
  const charter = JSON.parse(readFileSync(join(fixtureDir, "charter-minimal.json"), "utf8"));
  const manifest = JSON.parse(
    readFileSync(join(fixtureDir, "publish-manifest-minimal.json"), "utf8"),
  ) as EdpcPublishManifest;

  it("builds deterministic CAM with findings from claims ledger", () => {
    const input = {
      charter: { ...charter, refresh_gap: "documented" },
      publish_manifest: manifest,
      claims_ledger: [{ claim_id: "c1", text: "Slice boundary documented" }],
      receipt_exists: () => true,
    };
    const a = composeEdpcClientAssessment(input);
    const b = composeEdpcClientAssessment(input);
    assert.equal(a.ok, true);
    assert.deepEqual(a.cam, b.cam);
    assert.equal(a.cam!.findings.some((f) => f.claim_id === "c1"), true);
    assert.equal(a.cam!.domains.length, 20);
  });

  it("maps claims-ledger statement field to finding assertion", () => {
    const result = composeEdpcClientAssessment({
      charter: { ...charter, refresh_gap: "documented" },
      publish_manifest: manifest,
      claims_ledger: [{ claim_id: "c2", statement: "Derived from matrix" }],
      receipt_exists: () => true,
    });
    assert.equal(result.ok, true);
    assert.equal(
      result.cam!.findings.find((f) => f.claim_id === "c2")?.assertion,
      "Derived from matrix",
    );
  });
});
