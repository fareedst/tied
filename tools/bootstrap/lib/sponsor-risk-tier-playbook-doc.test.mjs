/**
 * [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK] Playbook doc contract (Claude comparison Phase 2).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const playbookPath = path.join(repoRoot, "tied-bundle", "docs", "sponsor-risk-tier-playbook.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Sponsor review attention map",
  "## Hinge fields and costly choices",
  "depth_tier",
  "assurance profile",
  "consequence ladder",
  "REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER",
];

describe("sponsor risk-tier playbook doc [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(playbookPath), `missing playbook: ${playbookPath}`);
    const text = fs.readFileSync(playbookPath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `playbook missing marker: ${marker}`);
    }
  });
});
