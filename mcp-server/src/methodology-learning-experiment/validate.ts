/**
 * [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT]
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
 */

import yaml from "js-yaml";
import {
  METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
  OUTCOME_OBSERVATION_VALUES,
  PRODUCTION_SYSTEM_SURFACES,
  VALIDATOR_PROOF_BOUNDARY,
  VALIDATOR_SCHEMA_VERSION,
} from "./constants.js";

export type MethodologyExperimentDiagnostic = {
  code:
    | "INVALID_ROOT"
    | "INVALID_YAML"
    | "WRONG_SCHEMA_VERSION"
    | "MISSING_FIELD"
    | "INVALID_ENUM"
    | "INVALID_INPUT";
  message: string;
  path: string;
};

export type MethodologyExperimentValidationReport = {
  schema_version: typeof VALIDATOR_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: string;
  diagnostics: MethodologyExperimentDiagnostic[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pushMissing(
  diagnostics: MethodologyExperimentDiagnostic[],
  path: string,
  label: string,
): void {
  diagnostics.push({
    code: "MISSING_FIELD",
    message: `Missing or empty ${label}`,
    path,
  });
}

const surfaceSet = new Set<string>(PRODUCTION_SYSTEM_SURFACES);
const outcomeSet = new Set<string>(OUTCOME_OBSERVATION_VALUES);

export function validateMethodologyLearningExperimentObject(
  record: unknown,
): MethodologyExperimentValidationReport {
  const diagnostics: MethodologyExperimentDiagnostic[] = [];

  if (!isRecord(record)) {
    diagnostics.push({
      code: "INVALID_ROOT",
      message: "Record must be a YAML mapping object",
      path: "$",
    });
    return {
      schema_version: VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: VALIDATOR_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  if (record.schema_version !== METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION) {
    diagnostics.push({
      code: "WRONG_SCHEMA_VERSION",
      message: `schema_version must be ${METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION}`,
      path: "schema_version",
    });
  }

  if (!nonEmptyString(record.experiment_id)) {
    pushMissing(diagnostics, "experiment_id", "experiment_id");
  }

  const surface = record.production_system_surface;
  if (!nonEmptyString(surface) || !surfaceSet.has(surface)) {
    diagnostics.push({
      code: "INVALID_ENUM",
      message: `production_system_surface must be one of: ${PRODUCTION_SYSTEM_SURFACES.join(", ")}`,
      path: "production_system_surface",
    });
  }

  if (!nonEmptyString(record.methodology_hypothesis)) {
    pushMissing(diagnostics, "methodology_hypothesis", "methodology_hypothesis");
  }

  if (record.methodology_baseline !== undefined && !isRecord(record.methodology_baseline)) {
    diagnostics.push({
      code: "INVALID_ROOT",
      message: "methodology_baseline must be a mapping when present",
      path: "methodology_baseline",
    });
  }

  if (!nonEmptyString(record.proof_boundary)) {
    pushMissing(diagnostics, "proof_boundary", "proof_boundary");
  }

  if (!nonEmptyString(record.privacy_tier)) {
    pushMissing(diagnostics, "privacy_tier", "privacy_tier");
  } else if (record.privacy_tier !== "operator_local" && record.privacy_tier !== "shareable_hashed") {
    diagnostics.push({
      code: "INVALID_ENUM",
      message: "privacy_tier must be operator_local or shareable_hashed",
      path: "privacy_tier",
    });
  }

  const sourceRefs = record.source_feedback_refs;
  if (sourceRefs !== undefined) {
    if (!Array.isArray(sourceRefs) || sourceRefs.length === 0) {
      diagnostics.push({
        code: "INVALID_INPUT",
        message: "source_feedback_refs must be a non-empty array when present",
        path: "source_feedback_refs",
      });
    } else {
      for (let i = 0; i < sourceRefs.length; i++) {
        if (!nonEmptyString(sourceRefs[i])) {
          diagnostics.push({
            code: "INVALID_INPUT",
            message: "source_feedback_refs entries must be non-empty strings",
            path: `source_feedback_refs[${i}]`,
          });
        }
      }
    }
  }

  const outcome = record.methodology_outcome_observation;
  if (outcome !== undefined) {
    if (!isRecord(outcome)) {
      diagnostics.push({
        code: "INVALID_ROOT",
        message: "methodology_outcome_observation must be a mapping when present",
        path: "methodology_outcome_observation",
      });
    } else {
      const value = outcome.value;
      if (!nonEmptyString(value) || !outcomeSet.has(value)) {
        diagnostics.push({
          code: "INVALID_ENUM",
          message: `methodology_outcome_observation.value must be one of: ${OUTCOME_OBSERVATION_VALUES.join(", ")}`,
          path: "methodology_outcome_observation.value",
        });
      }
    }
  }

  const surfaceRef = record.surface_ref;
  if (surfaceRef !== undefined && !nonEmptyString(surfaceRef)) {
    diagnostics.push({
      code: "INVALID_INPUT",
      message: "surface_ref must be a non-empty string when present",
      path: "surface_ref",
    });
  }

  const reversal = record.rule_reversal;
  if (reversal !== undefined) {
    if (!isRecord(reversal)) {
      diagnostics.push({
        code: "INVALID_ROOT",
        message: "rule_reversal must be a mapping when present",
        path: "rule_reversal",
      });
    } else if (typeof reversal.applied !== "boolean") {
      pushMissing(diagnostics, "rule_reversal.applied", "rule_reversal.applied (boolean)");
    }
  }

  return {
    schema_version: VALIDATOR_SCHEMA_VERSION,
    ok: diagnostics.length === 0,
    proof_boundary: VALIDATOR_PROOF_BOUNDARY,
    diagnostics,
  };
}

export type ValidateMethodologyLearningExperimentInput = {
  record?: unknown;
  yaml_text?: string;
};

export function validateMethodologyLearningExperiment(
  input: ValidateMethodologyLearningExperimentInput,
): MethodologyExperimentValidationReport {
  const hasRecord = input.record !== undefined;
  const hasYaml = nonEmptyString(input.yaml_text);
  if (hasRecord === hasYaml) {
    return {
      schema_version: VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: VALIDATOR_PROOF_BOUNDARY,
      diagnostics: [
        {
          code: "INVALID_INPUT",
          message: "Provide exactly one of record or yaml_text",
          path: "$input",
        },
      ],
    };
  }

  if (hasYaml) {
    try {
      const parsed = yaml.load(input.yaml_text!) as unknown;
      return validateMethodologyLearningExperimentObject(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        schema_version: VALIDATOR_SCHEMA_VERSION,
        ok: false,
        proof_boundary: VALIDATOR_PROOF_BOUNDARY,
        diagnostics: [
          {
            code: "INVALID_YAML",
            message,
            path: "$yaml",
          },
        ],
      };
    }
  }

  return validateMethodologyLearningExperimentObject(input.record);
}
