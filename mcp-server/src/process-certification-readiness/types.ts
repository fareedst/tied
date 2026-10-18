/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_SPEC] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import type {
  ADAPTIVE_EFFECTIVENESS_REPORT_SCHEMA,
  ASSESSOR_AGREEMENT_REPORT_SCHEMA,
  ASSESSOR_PACK_SCHEMA,
  CAPABILITY_PROFILE_SCHEMA,
  CERTIFIABILITY_READINESS_SCHEMA,
  CONFORMANCE_CATALOG_SCHEMA,
  CONFORMANCE_MATRIX_SCHEMA,
  EDSE_PROCESS_RECORD_SCHEMA,
  EDSE_PROCESS_SPEC_SCHEMA,
  INDEPENDENT_ASSESSMENT_RECORD_SCHEMA,
  ISO_12207_MAPPING_SCHEMA,
  ISO_330XX_CAPABILITY_MODEL_SCHEMA,
} from "./constants.js";

export type ValidationDiagnostic = { code: string; message: string; path: string };

export type EdseClauseV1 = {
  id: string;
  title: string;
  normative_summary: string;
  evidence_obligations: string[];
  evaluation_procedure: string;
  pass_rule: string;
  limitations: string;
};

export type EdseProcessSpecV1 = {
  schema_version: typeof EDSE_PROCESS_SPEC_SCHEMA;
  spec_version: string;
  proof_boundary: string;
  content_hash: string;
  clauses: EdseClauseV1[];
};

export type Iso12207MappingV1 = {
  schema_version: typeof ISO_12207_MAPPING_SCHEMA;
  reference_mapping_only: boolean;
  proof_boundary: string;
  mappings: Array<{ edse_clause: string; iso_12207_process_ref: string; rationale: string }>;
};

export type Iso330xxCapabilityModelV1 = {
  schema_version: typeof ISO_330XX_CAPABILITY_MODEL_SCHEMA;
  proof_boundary: string;
  dimensions: Array<{ id: string; label: string }>;
};

export type ConformanceCatalogEntryV1 = {
  clause_id: string;
  validator_id: string;
  evidence_kind: string;
  tied_surface: string;
};

export type ConformanceCatalogV1 = {
  schema_version: typeof CONFORMANCE_CATALOG_SCHEMA;
  entries: ConformanceCatalogEntryV1[];
};

export type EdseProcessRecordV1 = {
  schema_version: typeof EDSE_PROCESS_RECORD_SCHEMA;
  spec_content_hash: string;
  evidence: Record<string, unknown>;
};

export type ConformanceMatrixRowV1 = {
  clause_id: string;
  status: "pass" | "fail";
  evidence_kind: string;
  evaluator_id: string;
  evidence_refs: string[];
};

export type ConformanceMatrixV1 = {
  schema_version: typeof CONFORMANCE_MATRIX_SCHEMA;
  spec_content_hash: string;
  proof_boundary: string;
  rows: ConformanceMatrixRowV1[];
};

export type CapabilityDimensionResultV1 = {
  dimension_id: string;
  rating: "sufficient" | "insufficient" | "not_evaluated";
  evidence_refs: string[];
  proof_boundary: string;
  limitations: string;
};

export type CapabilityProfileV1 = {
  schema_version: typeof CAPABILITY_PROFILE_SCHEMA;
  spec_content_hash: string;
  dimensions: CapabilityDimensionResultV1[];
  proof_boundary: string;
};

export type IndependentAssessmentRecordV1 = {
  schema_version: typeof INDEPENDENT_ASSESSMENT_RECORD_SCHEMA;
  assessor_id: string;
  author_or_implementer_ids: string[];
  independence_attestation: string;
  findings: Array<{ id: string; disposition: "agree" | "disagree" | "neutral"; note?: string }>;
};

export type AssessorAgreementReportV1 = {
  schema_version: typeof ASSESSOR_AGREEMENT_REPORT_SCHEMA;
  assessor_ids: string[];
  agreement_rate: number;
  disagreement_rate: number;
  material_conflicts: string[];
  proof_boundary: string;
};

export type AdaptiveEffectivenessReportV1 = {
  schema_version: typeof ADAPTIVE_EFFECTIVENESS_REPORT_SCHEMA;
  arms: Array<{ arm: "fixed" | "rule_selected" | "adaptive"; case_count: number; selection_receipt_hash: string }>;
  held_out_provenance: Array<{ case_id: string; receipt_hash: string }>;
  proof_boundary: string;
};

export type CertifiabilityReadinessV1 = {
  schema_version: typeof CERTIFIABILITY_READINESS_SCHEMA;
  readiness_state: "ready_for_external_appraisal" | "gaps_detected";
  proof_boundary: string;
  sections: {
    conformance: ConformanceMatrixV1;
    capability: CapabilityProfileV1;
    agreement?: AssessorAgreementReportV1;
    adaptive?: AdaptiveEffectivenessReportV1;
  };
};

export type AssessorPackV1 = {
  schema_version: typeof ASSESSOR_PACK_SCHEMA;
  readiness: CertifiabilityReadinessV1;
  bundle_spec_version: string;
  limitations: string[];
  proof_boundary: string;
};
