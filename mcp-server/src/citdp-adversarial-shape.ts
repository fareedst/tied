/**
 * [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION]
 * [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * Shared CITDP adversarial section shape for gate hydration and envelope context.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function adversarialSection(record: unknown): Record<string, unknown> | undefined {
  if (!isRecord(record)) return undefined;
  if (isRecord(record.adversarial_inquiry)) return record.adversarial_inquiry;
  const risk = isRecord(record.risk_analysis) ? record.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

export type AdversarialDepthTier = "minimal" | "integrated" | "strict_candidate";

export function resolveProductProfileDepth(
  citdp: Record<string, unknown>,
  tracker?: Record<string, unknown>,
): AdversarialDepthTier | undefined {
  const top = identityValue(citdp.profile_depth);
  if (top === "minimal" || top === "integrated" || top === "strict_candidate") {
    return top;
  }
  if (tracker && isRecord(tracker.execution_profile)) {
    const exec = tracker.execution_profile;
    const fromTracker =
      identityValue(exec.depth_tier) ?? identityValue(exec.profile_depth);
    if (
      fromTracker === "minimal"
      || fromTracker === "integrated"
      || fromTracker === "strict_candidate"
    ) {
      return fromTracker;
    }
  }
  return undefined;
}