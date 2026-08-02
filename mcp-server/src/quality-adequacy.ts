/**
 * [IMPL-QUALITY_TEST_ADEQUACY] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Validate risk-relative test adequacy and explicit waiver evidence.
 */

export type AdequacyCheckKind =
  | "mutation"
  | "property"
  | "fuzz"
  | "flaky"
  | "harness_self_test"
  | "maintainability"
  | "dependency"
  | "external_call_cost";

export type TestAdequacyCheck = {
  id: string;
  kind: AdequacyCheckKind;
  profile: string;
  applicable?: boolean;
  repeat_count?: number;
  seed?: string;
  retry_classification?: string;
  quarantine_owner?: string;
  quarantine_expiry?: string;
  expected_volume?: number;
  timeout_ms?: number;
  retry_budget?: number;
  resource_failure_behavior?: string;
};

export type TestAdequacyPlan = {
  selected_profiles: string[];
  checks: TestAdequacyCheck[];
};

export type TestAdequacyDiagnostic = {
  code:
    | "PROFILE_NOT_SELECTED"
    | "INCOMPLETE_FLAKY_CONTROL"
    | "INCOMPLETE_EXTERNAL_CALL_CONTROL";
  message: string;
  check_id: string;
};

export type TestAdequacyReport = {
  schema_version: "test-adequacy-validator.v1";
  ok: boolean;
  applicable_checks: string[];
  diagnostics: TestAdequacyDiagnostic[];
  proof_boundary: string;
};

/**
 * [IMPL-QUALITY_TEST_ADEQUACY] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Derive profile obligations and report missing test or waiver evidence without executing tests.
 */
export function validateTestAdequacyPlan(
  plan: TestAdequacyPlan,
): TestAdequacyReport {
  // [IMPL-QUALITY_TEST_ADEQUACY] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Apply advanced controls only when selected by risk and retain explicit diagnostics.
  const selected = new Set(plan.selected_profiles);
  const diagnostics: TestAdequacyDiagnostic[] = [];
  const applicableChecks: string[] = [];

  for (const check of plan.checks) {
    const applicable = check.applicable ?? selected.has(check.profile);
    if (!applicable) continue;
    applicableChecks.push(check.id);

    if (!selected.has(check.profile)) {
      diagnostics.push({
        code: "PROFILE_NOT_SELECTED",
        message: `Check ${check.id} requires unselected profile ${check.profile}.`,
        check_id: check.id,
      });
      continue;
    }

    if (check.kind === "flaky") {
      const complete =
        typeof check.repeat_count === "number" &&
        check.repeat_count >= 2 &&
        Boolean(check.seed?.trim()) &&
        Boolean(check.retry_classification?.trim()) &&
        Boolean(check.quarantine_owner?.trim()) &&
        Boolean(check.quarantine_expiry?.trim());
      if (!complete) {
        diagnostics.push({
          code: "INCOMPLETE_FLAKY_CONTROL",
          message: `Flaky check ${check.id} needs repeat count >= 2, seed, retry classification, quarantine owner, and expiry.`,
          check_id: check.id,
        });
      }
    }

    if (check.kind === "external_call_cost") {
      const complete =
        typeof check.expected_volume === "number" &&
        check.expected_volume >= 0 &&
        typeof check.timeout_ms === "number" &&
        check.timeout_ms > 0 &&
        typeof check.retry_budget === "number" &&
        check.retry_budget >= 0 &&
        Boolean(check.resource_failure_behavior?.trim());
      if (!complete) {
        diagnostics.push({
          code: "INCOMPLETE_EXTERNAL_CALL_CONTROL",
          message: `External-call check ${check.id} needs volume, timeout, retry budget, and resource-failure behavior.`,
          check_id: check.id,
        });
      }
    }
  }

  return {
    schema_version: "test-adequacy-validator.v1",
    ok: diagnostics.length === 0,
    applicable_checks: [...applicableChecks].sort((left, right) => left.localeCompare(right)),
    diagnostics,
    proof_boundary:
      "Plan completeness only; this does not run mutation, property, fuzz, flaky, dependency, maintainability, or external-call tests.",
  };
}
