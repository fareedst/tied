import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateCitdpDaeSizingFields } from "./citdp-express-lane.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W2c express lane / size validation.

describe("CITDP express lane fields [REQ-TIED_DAE_INCORPORATION]", () => {
  it("rejects express_lane with size L", () => {
    const result = validateCitdpDaeSizingFields({
      size: "L",
      express_lane: true,
      express_lane_charter: true,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("express_lane_requires_size_xs"));
  });

  it("accepts express_lane when size XS and charter allows", () => {
    const result = validateCitdpDaeSizingFields({
      size: "XS",
      express_lane: true,
      express_lane_charter: true,
    });
    assert.equal(result.ok, true);
  });

  it("rejects invalid size token", () => {
    const result = validateCitdpDaeSizingFields({ size: "XXL" });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("invalid_citdp_size"));
  });

  it("validates gate_profile enums", () => {
    const bad = validateCitdpDaeSizingFields({
      size: "M",
      gate_profile: { front: "invalid", verify: "standard" },
    });
    assert.equal(bad.ok, false);
    assert.ok(bad.diagnostics.includes("invalid_gate_profile_front"));

    const good = validateCitdpDaeSizingFields({
      size: "S",
      gate_profile: { front: "auto", verify: "light" },
    });
    assert.equal(good.ok, true);
  });
});
