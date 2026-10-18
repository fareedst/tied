/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_SPEC] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

export const EDSE_PROCESS_SPEC_SCHEMA = "edse-process-spec.v1" as const;
export const ISO_12207_MAPPING_SCHEMA = "iso-12207-mapping.v1" as const;
export const ISO_330XX_CAPABILITY_MODEL_SCHEMA = "iso-330xx-capability-model.v1" as const;
export const CONFORMANCE_CATALOG_SCHEMA = "conformance-catalog.v1" as const;
export const CONFORMANCE_MATRIX_SCHEMA = "conformance-matrix.v1" as const;
export const CAPABILITY_PROFILE_SCHEMA = "capability-profile.v1" as const;
export const INDEPENDENT_ASSESSMENT_RECORD_SCHEMA = "independent-assessment-record.v1" as const;
export const ASSESSOR_AGREEMENT_REPORT_SCHEMA = "assessor-agreement-report.v1" as const;
export const ADAPTIVE_EFFECTIVENESS_REPORT_SCHEMA = "adaptive-effectiveness-report.v1" as const;
export const CERTIFIABILITY_READINESS_SCHEMA = "certifiability-readiness.v1" as const;
export const ASSESSOR_PACK_SCHEMA = "assessor-pack.v1" as const;
export const EDSE_PROCESS_RECORD_SCHEMA = "edse-process-record.v1" as const;

export const EDSE_CLAUSE_IDS = [
  "EDSE-001",
  "EDSE-002",
  "EDSE-003",
  "EDSE-004",
  "EDSE-005",
  "EDSE-006",
  "EDSE-007",
] as const;

export type EdseClauseId = (typeof EDSE_CLAUSE_IDS)[number];

export const CAPABILITY_DIMENSION_IDS = [
  "context_characterization",
  "practice_selection",
  "engineering_execution",
  "evidence_management",
  "verification",
  "process_adaptation",
  "continuous_improvement",
] as const;

export const FORBIDDEN_ROLLUP_KEYS = [
  "aggregate_score",
  "maturity_level",
  "rollup_percentage",
  "overall_maturity",
] as const;

export const READINESS_STATE_READY = "ready_for_external_appraisal" as const;
export const READINESS_STATE_GAPS = "gaps_detected" as const;

export const PROOF_BOUNDARY_NON_CERT = "ready_for_external_appraisal-not-certified" as const;
