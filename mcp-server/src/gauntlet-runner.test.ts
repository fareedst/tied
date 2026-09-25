/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER] — W4c gauntlet parser.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseGauntletBlock } from "./gauntlet-runner.js";

describe("gauntlet-runner [REQ-TIED_DAE_VERIFICATION_CHARTER]", () => {
  it("returns disabled when gauntlet block absent", () => {
    const plan = parseGauntletBlock({
      record_identity: { verification_charter: true },
    });
    assert.equal(plan.enabled, false);
    assert.equal(plan.probes.length, 0);
  });

  it("parses probes when charter and gauntlet block present", () => {
    const plan = parseGauntletBlock({
      record_identity: { verification_charter: true },
      gauntlet: {
        probes: [
          { id: "clarity", description: "Public API names match domain vocabulary" },
        ],
      },
    });
    assert.equal(plan.enabled, true);
    assert.equal(plan.probes.length, 1);
    assert.equal(plan.probes[0]?.id, "clarity");
  });
});
