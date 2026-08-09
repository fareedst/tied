import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyDeterministicRerun } from "./deterministic-rerun.js";

describe("VERIFY_DETERMINISTIC_RERUN REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Verifies reproducibility and duplicate linking for the same revisioned input.
  it("links an equivalent rerun without increasing finding counts", () => {
    const result = verifyDeterministicRerun({
      snapshotHash: "snapshot-hash",
      configurationHash: "configuration-hash",
      previousFindingIds: ["finding-1"],
      rerunFindingIds: ["finding-1"],
    });

    assert.deepEqual(result, {
      deterministic: true,
      duplicateLinks: [{ originalId: "finding-1", duplicateId: "finding-1" }],
      defectCountDelta: 0,
    });
  });

  it("reports a non-deterministic rerun when findings differ", () => {
    const result = verifyDeterministicRerun({
      snapshotHash: "snapshot-hash",
      configurationHash: "configuration-hash",
      previousFindingIds: ["finding-1"],
      rerunFindingIds: ["finding-2"],
    });

    assert.equal(result.deterministic, false);
    assert.equal(result.duplicateLinks.length, 0);
  });
});
