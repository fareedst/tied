/**
 * [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [ARCH-RESIDUALITY_STRESSOR_RECORD_VALIDATION]
 * [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION]
 * Summary: Structural validation for stressor-residue.v1 discovery records (no runtime proof).
 */

import yaml from "js-yaml";

export const STRESSOR_RESIDUE_SCHEMA_VERSION = "stressor-residue.v1";
export const VALIDATOR_SCHEMA_VERSION = "stressor-residue-validator.v1";
export const VALIDATOR_PROOF_BOUNDARY =
  "Discovery aid only; does not certify runtime behavior.";

const RESIDUE_CLASSES = new Set([
  "desirable",
  "harmful",
  "finding",
  "accepted_residual_risk",
  "not_applicable",
  "unresolved",
]);

const DISPOSITION_STATUSES = new Set([
  "unresolved",
  "candidate_requirement",
  "architecture_constraint",
  "finding",
  "accepted_residual_risk",
  "not_applicable",
]);

const TIED_REF_PATTERN = /^(REQ|ARCH|IMPL)-[A-Z0-9_-]+$/;

export type StressorResidueDiagnostic = {
  code:
    | "INVALID_ROOT"
    | "INVALID_YAML"
    | "WRONG_SCHEMA_VERSION"
    | "MISSING_FIELD"
    | "INVALID_ENUM"
    | "INVALID_TIED_REF";
  message: string;
  path: string;
};

export type StressorResidueValidationReport = {
  schema_version: typeof VALIDATOR_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: string;
  diagnostics: StressorResidueDiagnostic[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => nonEmptyString(entry))
  );
}

function pushMissing(
  diagnostics: StressorResidueDiagnostic[],
  path: string,
  label: string,
): void {
  diagnostics.push({
    code: "MISSING_FIELD",
    message: `Missing or empty ${label}`,
    path,
  });
}

export function validateStressorResidueRecordObject(
  record: unknown,
): StressorResidueValidationReport {
  const diagnostics: StressorResidueDiagnostic[] = [];

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

  if (record.schema_version !== STRESSOR_RESIDUE_SCHEMA_VERSION) {
    diagnostics.push({
      code: "WRONG_SCHEMA_VERSION",
      message: `schema_version must be ${STRESSOR_RESIDUE_SCHEMA_VERSION}`,
      path: "schema_version",
    });
  }

  const baseline = record.baseline;
  if (!isRecord(baseline)) {
    pushMissing(diagnostics, "baseline", "baseline object");
  } else {
    if (!nonEmptyString(baseline.objective)) {
      pushMissing(diagnostics, "baseline.objective", "baseline.objective");
    }
    if (!nonEmptyString(baseline.naive_architecture_summary)) {
      pushMissing(
        diagnostics,
        "baseline.naive_architecture_summary",
        "baseline.naive_architecture_summary",
      );
    }
  }

  const stressor = record.stressor;
  if (!isRecord(stressor)) {
    pushMissing(diagnostics, "stressor", "stressor object");
  } else {
    for (const field of ["id", "category", "description"] as const) {
      if (!nonEmptyString(stressor[field])) {
        pushMissing(diagnostics, `stressor.${field}`, `stressor.${field}`);
      }
    }
  }

  const impactPath = record.impact_path;
  if (!isRecord(impactPath)) {
    pushMissing(diagnostics, "impact_path", "impact_path object");
  } else {
    const hasSlice =
      nonEmptyStringArray(impactPath.functions) ||
      nonEmptyStringArray(impactPath.data) ||
      nonEmptyStringArray(impactPath.dependencies) ||
      nonEmptyStringArray(impactPath.bindings);
    if (!hasSlice) {
      diagnostics.push({
        code: "MISSING_FIELD",
        message:
          "impact_path must include at least one non-empty array among functions, data, dependencies, bindings",
        path: "impact_path",
      });
    }
  }

  const residue = record.residue;
  if (!isRecord(residue)) {
    pushMissing(diagnostics, "residue", "residue object");
  } else {
    if (!nonEmptyString(residue.description)) {
      pushMissing(diagnostics, "residue.description", "residue.description");
    }
    if (!nonEmptyString(residue.class) || !RESIDUE_CLASSES.has(residue.class)) {
      diagnostics.push({
        code: "INVALID_ENUM",
        message: `residue.class must be one of ${[...RESIDUE_CLASSES].join(", ")}`,
        path: "residue.class",
      });
    }
  }

  const evidence = record.evidence;
  if (!isRecord(evidence)) {
    pushMissing(diagnostics, "evidence", "evidence object");
  } else if (!nonEmptyString(evidence.proof_boundary)) {
    pushMissing(diagnostics, "evidence.proof_boundary", "evidence.proof_boundary");
  }

  const disposition = record.disposition;
  if (!isRecord(disposition)) {
    pushMissing(diagnostics, "disposition", "disposition object");
  } else {
    if (
      !nonEmptyString(disposition.status) ||
      !DISPOSITION_STATUSES.has(disposition.status)
    ) {
      diagnostics.push({
        code: "INVALID_ENUM",
        message: `disposition.status must be one of ${[...DISPOSITION_STATUSES].join(", ")}`,
        path: "disposition.status",
      });
    }
    const tiedRefs = disposition.tied_refs;
    if (tiedRefs !== undefined) {
      if (!Array.isArray(tiedRefs)) {
        diagnostics.push({
          code: "MISSING_FIELD",
          message: "disposition.tied_refs must be an array when present",
          path: "disposition.tied_refs",
        });
      } else {
        tiedRefs.forEach((ref, index) => {
          if (typeof ref !== "string" || !TIED_REF_PATTERN.test(ref)) {
            diagnostics.push({
              code: "INVALID_TIED_REF",
              message: "Each tied_refs entry must match REQ-|ARCH-|IMPL- token pattern",
              path: `disposition.tied_refs[${index}]`,
            });
          }
        });
      }
    }
  }

  return {
    schema_version: VALIDATOR_SCHEMA_VERSION,
    ok: diagnostics.length === 0,
    proof_boundary: VALIDATOR_PROOF_BOUNDARY,
    diagnostics,
  };
}

export type ValidateStressorResidueInput = {
  record?: unknown;
  yaml_text?: string;
};

export function validateStressorResidueRecord(
  input: ValidateStressorResidueInput,
): StressorResidueValidationReport {
  const hasRecord = input.record !== undefined;
  const hasYaml = nonEmptyString(input.yaml_text);
  if (hasRecord === hasYaml) {
    return {
      schema_version: VALIDATOR_SCHEMA_VERSION,
      ok: false,
      proof_boundary: VALIDATOR_PROOF_BOUNDARY,
      diagnostics: [
        {
          code: "MISSING_FIELD",
          message: "Provide exactly one of record or yaml_text",
          path: "$input",
        },
      ],
    };
  }

  if (hasYaml) {
    try {
      const parsed = yaml.load(input.yaml_text!) as unknown;
      return validateStressorResidueRecordObject(parsed);
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

  return validateStressorResidueRecordObject(input.record);
}
