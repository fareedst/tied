/**
 * [REQ-TIED_REVIEW_CONVERGENCE_POLICY] Policy doc contract (Claude comparison Phase 3).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const policyPath = path.join(repoRoot, "tied-bundle", "docs", "review-convergence-policy.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Review round cap",
  "## Diff-only re-review",
  "## Repeated-finding suppression",
  "## Class-level fixes",
  "operational observation",
  "REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER",
  "REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK",
];

describe("review convergence policy doc [REQ-TIED_REVIEW_CONVERGENCE_POLICY]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(policyPath), `missing policy: ${policyPath}`);
    const text = fs.readFileSync(policyPath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `policy missing marker: ${marker}`);
    }
  });
});
