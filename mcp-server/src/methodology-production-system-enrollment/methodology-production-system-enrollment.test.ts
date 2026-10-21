/**
 * [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "../methodology-learning-experiment/constants.js";
import {
  validateProductionSystemEnrollment,
  validateProductionSystemEnrollmentObject,
} from "./validate.js";

function baseRecord(
  surface: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
    experiment_id: `mle-w5-${surface}`,
    production_system_surface: surface,
    methodology_hypothesis: "Enrollment hypothesis",
    proof_boundary: "Demo only",
    privacy_tier: "operator_local",
    ...extra,
  };
}

describe("production system enrollment validate [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]", () => {
  it("checklist_step does not require surface_ref", () => {
    const result = validateProductionSystemEnrollmentObject(
      baseRecord("checklist_step"),
    );
    assert.equal(result.ok, true);
    assert.equal(result.enrollment_disposition, "not_required");
  });

  it("prompt_type_workflow requires valid surface_ref", () => {
    const missing = validateProductionSystemEnrollmentObject(
      baseRecord("prompt_type_workflow"),
    );
    assert.equal(missing.ok, false);
    assert.ok(
      missing.diagnostics.some((d) => d.code === "ENROLLMENT_SURFACE_REF_REQUIRED"),
    );

    const valid = validateProductionSystemEnrollmentObject(
      baseRecord("prompt_type_workflow", { surface_ref: "build-plan" }),
    );
    assert.equal(valid.ok, true);
    assert.equal(valid.enrollment_disposition, "enrolled");

    const invalid = validateProductionSystemEnrollmentObject(
      baseRecord("prompt_type_workflow", { surface_ref: "prompt-type-router" }),
    );
    assert.equal(invalid.ok, false);
    assert.ok(
      invalid.diagnostics.some((d) => d.code === "ENROLLMENT_INVALID_PROMPT_TYPE"),
    );

    for (const harnessRef of ["harness-trace-review", "harness-trace-analyzer"] as const) {
      const harness = validateProductionSystemEnrollmentObject(
        baseRecord("prompt_type_workflow", { surface_ref: harnessRef }),
      );
      assert.equal(harness.ok, true, `expected valid enrollment for ${harnessRef}`);
      assert.equal(harness.enrollment_disposition, "enrolled");
    }
  });

  it("assurance_profile and gate_policy require non-empty surface_ref", () => {
    for (const surface of ["assurance_profile", "gate_policy"] as const) {
      const missing = validateProductionSystemEnrollmentObject(baseRecord(surface));
      assert.equal(missing.ok, false);
      const ok = validateProductionSystemEnrollmentObject(
        baseRecord(surface, { surface_ref: `demo-${surface}-ref` }),
      );
      assert.equal(ok.ok, true);
      assert.equal(ok.enrollment_disposition, "enrolled");
    }
  });

  it("requires exactly one of record or yaml_text", () => {
    const result = validateProductionSystemEnrollment({});
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.path === "$input"));
  });
});
