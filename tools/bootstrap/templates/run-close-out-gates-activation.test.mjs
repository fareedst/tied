import assert from "node:assert/strict";
import test from "node:test";
import {
  hasInquiryWaiver,
  resolveDepthTier,
  shouldCollectActivation,
} from "./run-close-out-gates-activation.mjs";

test("resolveDepthTier prefers CITDP then tracker profile", () => {
  assert.equal(resolveDepthTier(
    { risk_analysis: { adversarial_inquiry: { depth_tier: "minimal" } } },
    { profile: { depth_tier: "integrated" } },
  ), "minimal");
  assert.equal(resolveDepthTier({}, { profile: { depth_tier: "integrated" } }), "integrated");
  assert.equal(resolveDepthTier({}, {}), "integrated");
});

test("hasInquiryWaiver detects CITDP string waiver and tracker policy", () => {
  assert.equal(hasInquiryWaiver(
    { risk_analysis: { adversarial_inquiry: { close_out_inquiry_waiver: "inquiry_not_required_sidecar_only" } } },
    {},
  ), true);
  assert.equal(hasInquiryWaiver({}, {
    operator_evidence: { inquiry_waiver: { policy: "inquiry_not_required_sidecar_only" } },
  }), true);
  assert.equal(hasInquiryWaiver({}, {
    steps: [{ slug: "sub-adversarial-inquiry-pass", disposition: "not_applicable" }],
  }), true);
});

test("shouldCollectActivation skips at minimal depth even when run_id provided", () => {
  const citdp = { risk_analysis: { adversarial_inquiry: { depth_tier: "minimal" } } };
  const decision = shouldCollectActivation({
    runId: "layerb-sidecar-fix-20260911",
    citdp,
    tracker: {},
  });
  assert.equal(decision.collect, false);
  assert.equal(decision.reason, "minimal_depth");
  assert.equal(decision.run_id, "layerb-sidecar-fix-20260911");
});

test("shouldCollectActivation collects at integrated depth without waiver", () => {
  const decision = shouldCollectActivation({
    runId: "wave8-closeout-20260911",
    citdp: { risk_analysis: { adversarial_inquiry: { depth_tier: "integrated" } } },
    tracker: {},
  });
  assert.equal(decision.collect, true);
  assert.equal(decision.reason, "collect");
});
