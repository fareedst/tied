import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EASAR_FULL_ENGAGEMENT } from "../easar-receipts/engagement-facet.js";
import { EDPC_FULL_ENGAGEMENT, edpcFullEngagementActive, validateEdpcEngagementFacet } from "./edpc-engagement-facet.js";

// [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC engagement facet [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("edpc_full requires pilot or strict mode", () => {
    const bad = validateEdpcEngagementFacet({
      brownfield_intent_elevation: { engagement: EDPC_FULL_ENGAGEMENT, mode: "report_only" },
    });
    assert.equal(bad.ok, false);
    assert.ok(bad.diagnostics.includes("full_engagement_requires_pilot_or_strict_mode"));

    const good = validateEdpcEngagementFacet({
      brownfield_intent_elevation: { engagement: EDPC_FULL_ENGAGEMENT, mode: "pilot" },
    });
    assert.equal(good.ok, true);
  });

  it("easar_full alias emits deprecation diagnostic", () => {
    const result = validateEdpcEngagementFacet({
      brownfield_intent_elevation: { engagement: EASAR_FULL_ENGAGEMENT, mode: "pilot" },
    });
    assert.equal(result.ok, true);
    assert.ok(result.diagnostics.includes("deprecated_engagement_alias:easar_full"));
  });

  it("edpcFullEngagementActive for edpc_full and easar_full", () => {
    assert.equal(
      edpcFullEngagementActive({ brownfield_intent_elevation: { engagement: EDPC_FULL_ENGAGEMENT } }),
      true,
    );
    assert.equal(
      edpcFullEngagementActive({ brownfield_intent_elevation: { engagement: EASAR_FULL_ENGAGEMENT } }),
      true,
    );
    assert.equal(edpcFullEngagementActive({}), false);
  });
});
