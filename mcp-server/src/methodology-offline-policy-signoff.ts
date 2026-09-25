/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * DOCUMENT_OFFLINE_COPY_FILES_POLICY — validate sponsor acceptance receipts for G4 offline/air-gap cohort policy.
 */

export const METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA = "methodology-offline-policy-signoff.v1" as const;

export type MethodologyOfflinePolicySignoffV1 = {
  schema: typeof METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA;
  request_token: string;
  signed_at: string;
  signer_role: string;
  policy: {
    copy_files_refresh_retained: boolean;
    bundle_optional: boolean;
    cohort_notes?: string;
  };
};

export function validateMethodologyOfflinePolicySignoff(
  receipt: unknown,
): { ok: true; receipt: MethodologyOfflinePolicySignoffV1 } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!receipt || typeof receipt !== "object") {
    return { ok: false, errors: ["receipt must be an object"] };
  }
  const r = receipt as Record<string, unknown>;
  if (r.schema !== METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA) {
    errors.push(`schema must be ${METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA}`);
  }
  if (typeof r.request_token !== "string" || !/^REQ-[A-Z0-9_]+$/.test(r.request_token)) {
    errors.push("request_token must be a REQ-* token string");
  }
  if (typeof r.signed_at !== "string" || !r.signed_at.trim()) {
    errors.push("signed_at required (ISO-8601 date or datetime)");
  }
  if (typeof r.signer_role !== "string" || !r.signer_role.trim()) {
    errors.push("signer_role required");
  }
  if (!r.policy || typeof r.policy !== "object") {
    errors.push("policy object required");
  } else {
    const p = r.policy as Record<string, unknown>;
    if (p.copy_files_refresh_retained !== true) {
      errors.push("policy.copy_files_refresh_retained must be true for G4 acceptance");
    }
    if (p.bundle_optional !== true) {
      errors.push("policy.bundle_optional must be true for G4 acceptance");
    }
    if (p.cohort_notes !== undefined && typeof p.cohort_notes !== "string") {
      errors.push("policy.cohort_notes must be a string when present");
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, receipt: receipt as MethodologyOfflinePolicySignoffV1 };
}
