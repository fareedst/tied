import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADVERSARIAL_INQUIRY_FIXTURES } from "./fixtures.js";

describe("ADVERSARIAL_INQUIRY_FIXTURES REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("contains deterministic positive, negative, boundary, and unsupported controls", () => {
    const names = ADVERSARIAL_INQUIRY_FIXTURES.map((fixture) => fixture.name);
    assert.deepEqual(names, [
      "known-good-complete",
      "known-bad-missing-effect",
      "negative-control-false-statement",
      "boundary-unsupported-evidence",
    ]);
    assert.ok(ADVERSARIAL_INQUIRY_FIXTURES.every((fixture) => fixture.specification.length > 0));
  });
});
