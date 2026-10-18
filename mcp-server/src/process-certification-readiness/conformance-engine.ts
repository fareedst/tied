/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_CONFORMANCE] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import { CONFORMANCE_MATRIX_SCHEMA, EDSE_CLAUSE_IDS, PROOF_BOUNDARY_NON_CERT } from "./constants.js";
import type {
  ConformanceCatalogV1,
  ConformanceMatrixV1,
  EdseProcessRecordV1,
  ValidationDiagnostic,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function evidencePresent(record: EdseProcessRecordV1, kind: string): { ok: boolean; refs: string[] } {
  const bucket = record.evidence[kind];
  if (bucket === undefined || bucket === null) return { ok: false, refs: [] };
  if (typeof bucket === "string" && bucket.trim()) return { ok: true, refs: [bucket] };
  if (Array.isArray(bucket) && bucket.length > 0) {
    return { ok: true, refs: bucket.map(String) };
  }
  if (isRecord(bucket) && Object.keys(bucket).length > 0) return { ok: true, refs: [kind] };
  return { ok: false, refs: [] };
}

/** EVALUATE_CONFORMANCE_MATRIX_V1 */
export function evaluateConformanceMatrixV1(input: {
  record: EdseProcessRecordV1;
  catalog: ConformanceCatalogV1;
  specContentHash: string;
}): { ok: boolean; matrix?: ConformanceMatrixV1; diagnostics: ValidationDiagnostic[] } {
  const diagnostics: ValidationDiagnostic[] = [];
  if (input.record.spec_content_hash !== input.specContentHash) {
    diagnostics.push({
      code: "STALE_SPEC_HASH",
      message: "process record spec hash mismatch",
      path: "spec_content_hash",
    });
    return { ok: false, diagnostics };
  }
  const byClause = new Map(input.catalog.entries.map((e) => [e.clause_id, e]));
  const rows = EDSE_CLAUSE_IDS.map((clauseId) => {
    const entry = byClause.get(clauseId);
    if (!entry) {
      diagnostics.push({ code: "CATALOG_GAP", message: `missing catalog for ${clauseId}`, path: clauseId });
      return {
        clause_id: clauseId,
        status: "fail" as const,
        evidence_kind: "unknown",
        evaluator_id: "MISSING_CATALOG",
        evidence_refs: [],
      };
    }
    const present = evidencePresent(input.record, entry.evidence_kind);
    return {
      clause_id: clauseId,
      status: present.ok ? ("pass" as const) : ("fail" as const),
      evidence_kind: entry.evidence_kind,
      evaluator_id: entry.validator_id,
      evidence_refs: present.refs,
    };
  });
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  return {
    ok: true,
    matrix: {
      schema_version: CONFORMANCE_MATRIX_SCHEMA,
      spec_content_hash: input.specContentHash,
      proof_boundary: PROOF_BOUNDARY_NON_CERT,
      rows,
    },
    diagnostics: [],
  };
}
