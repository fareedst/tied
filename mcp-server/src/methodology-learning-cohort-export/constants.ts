/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT]
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
 */

export const MANIFEST_SCHEMA_VERSION = "methodology-cohort-export-manifest.v1" as const;
export const EXPORT_SCHEMA_VERSION = "methodology-learning-cohort-export.v1" as const;
export const EXPORT_GENERATOR = "methodology_learning_cohort_export" as const;
export const EXPORT_GENERATOR_VERSION = "1.0.0" as const;

export const EXPORT_PROOF_BOUNDARY =
  "Declared-input resolution, compatible cohort partitioning, stable diagnostics, and shareable redaction only; does not prove methodology effectiveness.";

export const EXPORTABLE_PRIVACY_TIERS = new Set(["shareable_hashed"]);

export const PILOT_STDD = "stdd" as const;

export type CohortExportDiagnosticCode =
  | "invalid_manifest"
  | "missing_experiment"
  | "duplicate_experiment"
  | "invalid_experiment_record"
  | "missing_profile_artifact"
  | "invalid_profile_artifact"
  | "incompatible_cohort_key"
  | "forbidden_field"
  | "privacy_tier_not_exportable"
  | "redaction_owner_missing"
  | "privacy_policy_expired"
  | "pilot_scope_violation"
  | "output_path_forbidden"
  | "w4_report_failure";

export type CohortExportDiagnostic = {
  code: CohortExportDiagnosticCode;
  message: string;
  path?: string;
};
