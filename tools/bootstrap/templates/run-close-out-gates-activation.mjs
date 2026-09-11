/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Activation-collect policy for run-close-out-gates.mjs — skip at minimal depth or inquiry waiver.
 */

export function resolveDepthTier(citdp, tracker) {
  const citdpDepth = citdp?.risk_analysis?.adversarial_inquiry?.depth_tier;
  if (citdpDepth) return citdpDepth;
  const trackerProfile = tracker?.profile?.depth_tier;
  if (trackerProfile) return trackerProfile;
  const operatorDepth = tracker?.operator_evidence?.depth_tier
    ?? tracker?.execution_evidence?.operator_evidence?.depth_tier;
  if (operatorDepth) return operatorDepth;
  return "integrated";
}

export function hasInquiryWaiver(citdp, tracker) {
  const section = citdp?.risk_analysis?.adversarial_inquiry;
  const waiver = section?.close_out_inquiry_waiver;
  if (typeof waiver === "string" && waiver.trim().length > 0) return true;
  if (waiver && typeof waiver === "object") return true;

  const operatorWaiver = tracker?.operator_evidence?.inquiry_waiver
    ?? tracker?.execution_evidence?.operator_evidence?.inquiry_waiver;
  if (operatorWaiver?.policy === "inquiry_not_required_sidecar_only") return true;

  const steps = Array.isArray(tracker?.steps) ? tracker.steps : [];
  const inquiryStep = steps.find((step) => step.slug === "sub-adversarial-inquiry-pass");
  if (inquiryStep?.disposition === "not_applicable") return true;
  if (inquiryStep?.tracking?.status === "not_applicable") return true;
  return false;
}

export function shouldCollectActivation({ runId, depth, citdp, tracker }) {
  if (!runId) {
    return { collect: false, reason: "no_run_id", run_id: null };
  }
  const effectiveDepth = depth ?? resolveDepthTier(citdp, tracker);
  if (effectiveDepth === "minimal") {
    return { collect: false, reason: "minimal_depth", run_id: runId };
  }
  if (hasInquiryWaiver(citdp, tracker)) {
    return { collect: false, reason: "inquiry_waiver", run_id: runId };
  }
  return { collect: true, reason: "collect", run_id: runId };
}
