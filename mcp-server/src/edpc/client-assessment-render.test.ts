import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { composeEdpcClientAssessment } from "./client-assessment-compose.js";
import { renderEdpcClientAssessmentMarkdown } from "./client-assessment-render.js";
import type { EdpcPublishManifest } from "./publish-build.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures/edpc/cam");

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
describe("EDPC client assessment render [REQ-TIED_EDPC_CLIENT_ASSESSMENT]", () => {
  it("produces stable Markdown sections", () => {
    const charter = JSON.parse(readFileSync(join(fixtureDir, "charter-minimal.json"), "utf8"));
    const manifest = JSON.parse(
      readFileSync(join(fixtureDir, "publish-manifest-minimal.json"), "utf8"),
    ) as EdpcPublishManifest;
    const composed = composeEdpcClientAssessment({
      charter: { ...charter, refresh_gap: "ok" },
      publish_manifest: manifest,
      claims_ledger: [{ claim_id: "c1", text: "ok" }],
      receipt_exists: () => true,
    });
    assert.equal(composed.ok, true);
    const r1 = renderEdpcClientAssessmentMarkdown(composed.cam!);
    const r2 = renderEdpcClientAssessmentMarkdown(composed.cam!);
    assert.equal(r1.ok, true);
    assert.equal(r1.markdown, r2.markdown);
    assert.match(r1.markdown!, /## Understand/);
    assert.match(r1.markdown!, /## Domains \(20\)/);
  });
});
