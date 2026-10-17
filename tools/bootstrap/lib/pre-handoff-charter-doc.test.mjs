/**
 * [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER] Charter doc contract (Phase 1).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const charterPath = path.join(repoRoot, "tied-bundle", "docs", "pre-handoff-verification-charter.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Executable checks before handoff",
  "## Evidence to attach",
  "REQ-TIED_DAE_VERIFICATION_CHARTER",
];

describe("pre-handoff verification charter doc [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(charterPath), `missing charter: ${charterPath}`);
    const text = fs.readFileSync(charterPath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `charter missing marker: ${marker}`);
    }
  });
});
