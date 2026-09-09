import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import { runClaimsEvidenceReviewMcp } from "./mcp-handler.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const fixtureRoot = path.join(
  repoRoot,
  "mcp-server/test/fixtures/claims-evidence-review/tied-generated",
);

describe("tied_claims_evidence_review_run MCP [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("returns ledger and provenance for tied-generated fixture", async () => {
    const outputDir = path.join(repoRoot, "working/REQ-TIED_CLAIMS_EVIDENCE_REVIEW/claims-evidence-review/mcp-run");
    const result = await runClaimsEvidenceReviewMcp({
      tied_base_path: path.join(repoRoot, "tied"),
      project_root: repoRoot,
      claim_surface_path: path.join(fixtureRoot, "claim-surface.v1.json"),
      fixture_root: fixtureRoot,
      output_dir: outputDir,
      execution_policy: "static_only",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.report.summary.shown + result.report.summary.unsettled + result.report.summary.notExamined >= 1);
    assert.equal(result.request_token, "REQ-TIED_CLAIMS_EVIDENCE_REVIEW");
  });
});
