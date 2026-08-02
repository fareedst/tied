# [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
# Summary: Validate conditional external-input security abuse-case evidence.

# How: Define the canonical abuse-case set and apply it only when the security profile is selected.
Contract:
  INPUT: selected profiles and abuse-case evidence rows
  PRE: profile names and abuse-case identifiers are canonical
  OUTPUT: security profile validation report
  POST: every required case has executable evidence or an owned, expiring waiver
  FAILURE_MODES: MissingCase, MissingEvidence, InvalidWaiver
  EFFECTS: pure
  TERMINATION: total
  DATA: EXTERNAL_INPUT_SECURITY_CASES = malformed-oversized-input, authentication-authorization, injection-unsafe-content, path-traversal-file-access, replay-duplicate, secret-sensitive-data, resource-exhaustion-timeout-rate-limit, dependency-vulnerability-review

# [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
# How: Require the complete abuse-case set only when external-input-security is selected.
procedure VALIDATE_SECURITY_PROFILE(input):
  # [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  Contract:
    INPUT: selected profiles and security evidence rows
    OUTPUT: security profile validation report
    PRE: input arrays are provided and abuse-case identifiers are canonical
    POST: each required case has passed evidence or a complete waiver when applicable
    FAILURE_MODES: MissingCase, MissingEvidence, InvalidWaiver
    EFFECTS: pure
    TERMINATION: total
  IF external-input-security is not selected: RETURN applicable false with no required-case diagnostics
  FOR each abuse case in EXTERNAL_INPUT_SECURITY_CASES:
    IF no row exists: REPORT MissingCase
    ELSE IF row has executable command/test and passed result: CONTINUE
    ELSE IF row has waiver with rationale, owner, and expiry: CONTINUE
    ELSE IF waiver is incomplete: REPORT InvalidWaiver
    ELSE: REPORT MissingEvidence
  RETURN report with proof boundary plan-completeness-only