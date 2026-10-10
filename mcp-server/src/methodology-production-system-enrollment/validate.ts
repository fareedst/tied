/**
 * [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [ARCH-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]
 * [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
 */

import yaml from "js-yaml";
import {
  validateMethodologyLearningExperimentObject,
  type MethodologyExperimentDiagnostic,
} from "../methodology-learning-experiment/validate.js";
import {
  ENROLLMENT_PROOF_BOUNDARY,
  ENROLLMENT_REQUIRED_SURFACE_REF,
  ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
  PROMPT_TYPE_LEAF_IDS,
} from "./constants.js";

export type EnrollmentDisposition =
  | "not_required"
  | "enrolled"
  | "structural_invalid";

export type ProductionSystemEnrollmentDiagnostic = Omit<
  MethodologyExperimentDiagnostic,
  "code"
> & {
  code:
    | MethodologyExperimentDiagnostic["code"]
    | "ENROLLMENT_SURFACE_REF_REQUIRED"
    | "ENROLLMENT_INVALID_PROMPT_TYPE"
    | "ENROLLMENT_INVALID_SURFACE_REF";
};

export type ProductionSystemEnrollmentReport = {
  schema_version: typeof ENROLLMENT_VALIDATOR_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: string;
  enrollment_disposition: EnrollmentDisposition;
  production_system_surface?: string;
  diagnostics: ProductionSystemEnrollmentDiagnostic[];
  structural?: ReturnType<typeof validateMethodologyLearningExperimentObject>;
};

const enrollmentSurfaceSet = new Set<string>(ENROLLMENT_REQUIRED_SURFACE_REF);
const promptTypeSet = new Set<string>(PROMPT_TYPE_LEAF_IDS);

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRecord(input: {
  record?: unknown;
  yaml_text?: string;
}): { record?: Record<string, unknown>; structuralOnly?: ProductionSystemEnrollmentReport } {
  const hasRecord = input.record !== undefined;
  const hasYaml = nonEmptyString(input.yaml_text);
  if (hasRecord === hasYaml) {
    return {
      structuralOnly: {
        schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
        ok: false,
        proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
        enrollment_disposition: "structural_invalid",
        diagnostics: [
          {
            code: "INVALID_INPUT",
            message: "Provide exactly one of record or yaml_text",
            path: "$input",
          },
        ],
      },
    };
  }
  if (hasYaml) {
    try {
      const parsed = yaml.load(input.yaml_text!) as unknown;
      if (!isRecord(parsed)) {
        return {
          structuralOnly: {
            schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
            ok: false,
            proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
            enrollment_disposition: "structural_invalid",
            diagnostics: [
              {
                code: "INVALID_ROOT",
                message: "Record must be a YAML mapping object",
                path: "$",
              },
            ],
          },
        };
      }
      return { record: parsed };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        structuralOnly: {
          schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
          ok: false,
          proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
          enrollment_disposition: "structural_invalid",
          diagnostics: [
            {
              code: "INVALID_YAML",
              message,
              path: "$yaml",
            },
          ],
        },
      };
    }
  }
  if (isRecord(input.record)) {
    return { record: input.record };
  }
  return {
    structuralOnly: {
      schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
      enrollment_disposition: "structural_invalid",
      diagnostics: [
        {
          code: "INVALID_ROOT",
          message: "Record must be a mapping object",
          path: "$",
        },
      ],
    },
  };
}

export function validateProductionSystemEnrollmentObject(
  record: Record<string, unknown>,
): ProductionSystemEnrollmentReport {
  const structural = validateMethodologyLearningExperimentObject(record);
  if (!structural.ok) {
    return {
      schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
      enrollment_disposition: "structural_invalid",
      diagnostics: structural.diagnostics as ProductionSystemEnrollmentDiagnostic[],
      structural,
    };
  }

  const surface = record.production_system_surface;
  if (typeof surface !== "string") {
    return {
      schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
      enrollment_disposition: "structural_invalid",
      diagnostics: [
        {
          code: "MISSING_FIELD",
          message: "production_system_surface missing after structural pass",
          path: "production_system_surface",
        },
      ],
      structural,
    };
  }

  if (surface === "checklist_step") {
    return {
      schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
      ok: true,
      proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
      enrollment_disposition: "not_required",
      production_system_surface: surface,
      diagnostics: [],
      structural,
    };
  }

  if (!enrollmentSurfaceSet.has(surface)) {
    return {
      schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
      enrollment_disposition: "structural_invalid",
      production_system_surface: surface,
      diagnostics: [
        {
          code: "INVALID_ENUM",
          message: `Unsupported surface for enrollment validator: ${surface}`,
          path: "production_system_surface",
        },
      ],
      structural,
    };
  }

  const diagnostics: ProductionSystemEnrollmentDiagnostic[] = [];
  const surfaceRef = record.surface_ref;
  if (!nonEmptyString(surfaceRef)) {
    diagnostics.push({
      code: "ENROLLMENT_SURFACE_REF_REQUIRED",
      message:
        "surface_ref is required for gate_policy, assurance_profile, and prompt_type_workflow enrollment",
      path: "surface_ref",
    } as ProductionSystemEnrollmentDiagnostic);
  } else if (surface === "prompt_type_workflow" && !promptTypeSet.has(surfaceRef.trim())) {
    diagnostics.push({
      code: "ENROLLMENT_INVALID_PROMPT_TYPE",
      message: `surface_ref must be a leaf prompt type id; got: ${surfaceRef}`,
      path: "surface_ref",
    } as ProductionSystemEnrollmentDiagnostic);
  } else if (surfaceRef.trim().length > 256) {
    diagnostics.push({
      code: "ENROLLMENT_INVALID_SURFACE_REF",
      message: "surface_ref must be at most 256 characters",
      path: "surface_ref",
    } as ProductionSystemEnrollmentDiagnostic);
  }

  return {
    schema_version: ENROLLMENT_VALIDATOR_SCHEMA_VERSION,
    ok: diagnostics.length === 0,
    proof_boundary: ENROLLMENT_PROOF_BOUNDARY,
    enrollment_disposition: diagnostics.length === 0 ? "enrolled" : "structural_invalid",
    production_system_surface: surface,
    diagnostics,
    structural,
  };
}

export type ValidateProductionSystemEnrollmentInput = {
  record?: unknown;
  yaml_text?: string;
};

export function validateProductionSystemEnrollment(
  input: ValidateProductionSystemEnrollmentInput,
): ProductionSystemEnrollmentReport {
  const resolved = resolveRecord(input);
  if (resolved.structuralOnly) {
    return resolved.structuralOnly;
  }
  return validateProductionSystemEnrollmentObject(resolved.record!);
}
