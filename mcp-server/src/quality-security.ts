/**
 * [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Validate executable evidence or explicit waivers for external-input security abuse cases.
 */

export const EXTERNAL_INPUT_SECURITY_CASES = [
  "malformed-oversized-input",
  "authentication-authorization",
  "injection-unsafe-content",
  "path-traversal-file-access",
  "replay-duplicate",
  "secret-sensitive-data",
  "resource-exhaustion-timeout-rate-limit",
  "dependency-vulnerability-review",
] as const;

export type SecurityEvidenceRow = {
  abuse_case: string;
  command_or_test?: string;
  result?: "passed" | "waived";
  waiver?: {
    reason?: string;
    owner?: string;
    expiry?: string;
  };
};

export type SecurityProfileInput = {
  selected_profiles: string[];
  evidence_rows: SecurityEvidenceRow[];
};

export type SecurityProfileDiagnostic = {
  code: "MISSING_CASE" | "MISSING_EVIDENCE" | "INVALID_WAIVER";
  abuse_case: string;
  message: string;
};

export type SecurityProfileReport = {
  schema_version: "external-input-security-profile-validator.v1";
  applicable: boolean;
  ok: boolean;
  required_cases: string[];
  diagnostics: SecurityProfileDiagnostic[];
  proof_boundary: string;
};

/**
 * [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Require the complete abuse-case set only when external-input-security is selected.
 */
export function validateSecurityProfile(input: SecurityProfileInput): SecurityProfileReport {
  const applicable = input.selected_profiles.includes("external-input-security");
  if (!applicable) {
    return {
      schema_version: "external-input-security-profile-validator.v1",
      applicable: false,
      ok: true,
      required_cases: [],
      diagnostics: [],
      proof_boundary: "Plan completeness only; this does not prove runtime security.",
    };
  }

  const diagnostics: SecurityProfileDiagnostic[] = [];
  for (const abuseCase of EXTERNAL_INPUT_SECURITY_CASES) {
    const row = input.evidence_rows.find((candidate) => candidate.abuse_case === abuseCase);
    if (!row) {
      diagnostics.push({
        code: "MISSING_CASE",
        abuse_case: abuseCase,
        message: `External-input security case ${abuseCase} has no evidence row.`,
      });
      continue;
    }
    if (row.result === "passed" && row.command_or_test?.trim()) continue;
    if (row.result === "waived") {
      const waiver = row.waiver;
      if (waiver?.reason?.trim() && waiver.owner?.trim() && waiver.expiry?.trim()) continue;
      diagnostics.push({
        code: "INVALID_WAIVER",
        abuse_case: abuseCase,
        message: `Waiver for ${abuseCase} requires reason, owner, and expiry.`,
      });
      continue;
    }
    diagnostics.push({
      code: "MISSING_EVIDENCE",
      abuse_case: abuseCase,
      message: `Evidence for ${abuseCase} requires a command/test and passed result, or a complete waiver.`,
    });
  }

  return {
    schema_version: "external-input-security-profile-validator.v1",
    applicable: true,
    ok: diagnostics.length === 0,
    required_cases: [...EXTERNAL_INPUT_SECURITY_CASES],
    diagnostics,
    proof_boundary: "Plan completeness only; this does not prove runtime security.",
  };
}
