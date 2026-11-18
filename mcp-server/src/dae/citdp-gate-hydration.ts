/**
 * [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION]
 * [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER]
 */

import {
  adversarialSection,
  identityValue,
  isRecord,
  resolveProductProfileDepth,
  type AdversarialDepthTier,
} from "../citdp-adversarial-shape.js";

function shallowCitdpClone(citdp: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...citdp };
  if (isRecord(citdp.risk_analysis)) {
    clone.risk_analysis = { ...citdp.risk_analysis };
  }
  return clone;
}

function resolveGatePolicy(citdp: Record<string, unknown>, tracker?: Record<string, unknown>): string {
  const fromCitdp = identityValue(citdp.gate_policy);
  if (fromCitdp) return fromCitdp;
  if (tracker && isRecord(tracker.execution_profile)) {
    const fromExec = identityValue(tracker.execution_profile.gate_policy);
    if (fromExec) return fromExec;
  }
  return "advisory";
}

function hydrationEligibleDepth(depth: AdversarialDepthTier | undefined): depth is "minimal" | "strict_candidate" {
  return depth === "minimal" || depth === "strict_candidate";
}

/** Validation-only shallow clone; never mutates the input reference. */
export function hydrateCitdpForChecklistGate(
  citdp: Record<string, unknown>,
  tracker?: Record<string, unknown>,
): Record<string, unknown> {
  if (adversarialSection(citdp)) {
    return shallowCitdpClone(citdp);
  }
  const depth = resolveProductProfileDepth(citdp, tracker);
  if (!hydrationEligibleDepth(depth)) {
    return shallowCitdpClone(citdp);
  }
  const clone = shallowCitdpClone(citdp);
  const risk = isRecord(clone.risk_analysis) ? { ...clone.risk_analysis } : {};
  risk.adversarial_inquiry = {
    depth_tier: depth,
    gate_policy: resolveGatePolicy(citdp, tracker),
  };
  clone.risk_analysis = risk;
  return clone;
}

export function gateReasonsFromValidateResult(input: {
  allowed: boolean;
  reasons?: string[];
  diagnostics?: string[];
}): string[] {
  if (input.reasons && input.reasons.length > 0) {
    return [...input.reasons];
  }
  if (input.diagnostics && input.diagnostics.length > 0) {
    return [...input.diagnostics];
  }
  return input.allowed ? [] : ["gate_blocked"];
}