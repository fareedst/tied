import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { runClaimsEvidencePilot } from "./run-claims-evidence-pilot.js";
import { tryPromoteConfirmedCase } from "./run-claims-evidence-review.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const fixtureRoot = path.join(
  repoRoot,
  "mcp-server/test/fixtures/claims-evidence-review/tied-generated",
);

describe("claims-evidence-review composition [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("runs pilot on tied-generated fixture and emits ledger + provenance", () => {
    const outputDir = path.join(repoRoot, "working/REQ-TIED_CLAIMS_EVIDENCE_REVIEW/claims-evidence-review/pilot-from-tied");
    const result = runClaimsEvidencePilot({
      projectRoot: repoRoot,
      fixtureRoot,
      outputDir,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(
      result.report.summary.shown >= 1
      || result.report.summary.unsettled >= 1
      || result.report.summary.notExamined >= 1,
    );
    assert.ok(fs.existsSync(result.outputPaths.ledger));
    assert.ok(fs.existsSync(result.outputPaths.provenance));
    assert.ok(fs.existsSync(result.outputPaths.outside));
    assert.ok(fs.existsSync(path.join(outputDir, "unsettled-questions.v1.jsonl")));
  });

  it("does not promote from shown alone", () => {
    const promotion = tryPromoteConfirmedCase({
      findingId: "claim-1",
      reviewers: ["a"],
    });
    assert.equal(promotion.kind, "not-promoted");
  });
});
