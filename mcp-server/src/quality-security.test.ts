import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EXTERNAL_INPUT_SECURITY_CASES,
  validateSecurityProfile,
} from "./quality-security.js";

describe("VALIDATE_SECURITY_PROFILE [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("requires executable evidence for every external-input abuse case", () => {
    // [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Validate conditional external-input security abuse-case evidence.
    const report = validateSecurityProfile({
      selected_profiles: ["external-input-security"],
      evidence_rows: EXTERNAL_INPUT_SECURITY_CASES.map((abuse_case) => ({
        abuse_case,
        command_or_test: `npm run check:${abuse_case}`,
        result: "passed" as const,
      })),
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.required_cases, [...EXTERNAL_INPUT_SECURITY_CASES]);
  });

  it("requires owner, expiry, and rationale for accepted risk", () => {
    const report = validateSecurityProfile({
      selected_profiles: ["external-input-security"],
      evidence_rows: EXTERNAL_INPUT_SECURITY_CASES.map((abuse_case) => ({
        abuse_case,
        result: "waived" as const,
        waiver: { reason: "out of scope", owner: "security", expiry: "2026-09-01" },
      })),
    });

    assert.equal(report.ok, true);
  });

  it("rejects an incomplete accepted-risk waiver", () => {
    const report = validateSecurityProfile({
      selected_profiles: ["external-input-security"],
      evidence_rows: EXTERNAL_INPUT_SECURITY_CASES.map((abuse_case) => ({
        abuse_case,
        result: "waived" as const,
        waiver: { reason: "out of scope", owner: "security" },
      })),
    });

    assert.equal(report.ok, false);
    assert.equal(report.diagnostics.every((diagnostic) => diagnostic.code === "INVALID_WAIVER"), true);
  });

  it("reports missing cases and evidence for an applicable profile", () => {
    // [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Require every canonical abuse case to have executable evidence or a complete waiver.
    const report = validateSecurityProfile({
      selected_profiles: ["external-input-security"],
      evidence_rows: [
        {
          abuse_case: EXTERNAL_INPUT_SECURITY_CASES[0],
        },
      ],
    });

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_CASE"));
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_EVIDENCE"));
  });

  it("does not impose security evidence when the profile is not selected", () => {
    // [IMPL-QUALITY_SECURITY_PROFILE_VALIDATION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Leave the conditional security profile non-applicable when it is not selected.
    const report = validateSecurityProfile({
      selected_profiles: ["baseline-functional"],
      evidence_rows: [],
    });

    assert.deepEqual(report, {
      schema_version: "external-input-security-profile-validator.v1",
      applicable: false,
      ok: true,
      required_cases: [],
      diagnostics: [],
      proof_boundary: "Plan completeness only; this does not prove runtime security.",
    });
  });
});
