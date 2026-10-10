/**
 * [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 */

export const PAIRING_REPORT_SCHEMA_VERSION =
  "methodology-conformance-effectiveness-pairing-report.v1" as const;

export const PAIRING_PROOF_BOUNDARY =
  "Structural pairing only; does not prove methodology effectiveness or gate correctness.";

export const CONFORMANCE_EVIDENCE_REF_KINDS = [
  "gate_receipt",
  "envelope_ref",
  "manifest_ref",
  "file_path",
] as const;

export type ConformanceEvidenceRefKind = (typeof CONFORMANCE_EVIDENCE_REF_KINDS)[number];

export const PAIRING_DISPOSITIONS = [
  "paired",
  "effectiveness_not_measured",
  "conformance_only_trap",
  "waived",
] as const;

export type PairingDisposition = (typeof PAIRING_DISPOSITIONS)[number];
