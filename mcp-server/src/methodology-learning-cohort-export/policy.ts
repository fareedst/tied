/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
 */

import type { NormalizedCohortExportManifest } from "./manifest.js";
import type { CohortExportDiagnostic } from "./constants.js";

export function evaluateExportPolicyExpiry(
  manifest: NormalizedCohortExportManifest,
  now: Date,
): CohortExportDiagnostic | null {
  const expiry = manifest.policy.expiry;
  const expiryDate = new Date(`${expiry}T23:59:59.999Z`);
  if (Number.isNaN(expiryDate.getTime())) {
    return { code: "invalid_manifest", message: "policy.expiry is not a valid date", path: "policy.expiry" };
  }
  if (now.getTime() > expiryDate.getTime()) {
    return {
      code: "privacy_policy_expired",
      message: `Export policy expired on ${expiry}`,
      path: "policy.expiry",
    };
  }
  return null;
}
