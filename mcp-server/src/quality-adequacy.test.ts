import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateTestAdequacyPlan } from "./quality-adequacy.js";

describe("risk-triggered test adequacy [IMPL-QUALITY_TEST_ADEQUACY] [PROC-TEST_ADEQUACY]", () => {
  it("accepts scoped flaky and external-call controls", () => {
    // [PROC-TEST_ADEQUACY] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Apply advanced checks only when selected by risk and retain replay and cost controls.
    const report = validateTestAdequacyPlan({
      selected_profiles: ["stateful-reliability", "performance-scale-cost"],
      checks: [
        {
          id: "flaky-replay",
          kind: "flaky",
          profile: "stateful-reliability",
          repeat_count: 5,
          seed: "seed-001",
          retry_classification: "environmental",
          quarantine_owner: "team",
          quarantine_expiry: "2026-09-01",
        },
        {
          id: "service-cost",
          kind: "external_call_cost",
          profile: "performance-scale-cost",
          expected_volume: 100,
          timeout_ms: 500,
          retry_budget: 1,
          resource_failure_behavior: "fail closed",
        },
      ],
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.applicable_checks, ["flaky-replay", "service-cost"]);
  });

  it("rejects universal ceremony and incomplete conditional controls", () => {
    const report = validateTestAdequacyPlan({
      selected_profiles: ["baseline-functional"],
      checks: [
        {
          id: "mutation",
          kind: "mutation",
          profile: "performance-scale-cost",
          applicable: true,
        },
        {
          id: "retry",
          kind: "flaky",
          profile: "baseline-functional",
          repeat_count: 1,
        },
      ],
    });

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((item) => item.code === "PROFILE_NOT_SELECTED"));
    assert.ok(report.diagnostics.some((item) => item.code === "INCOMPLETE_FLAKY_CONTROL"));
  });
});
