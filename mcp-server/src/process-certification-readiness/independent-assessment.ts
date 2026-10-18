/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_INDEPENDENT] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import fs from "node:fs";
import {
  ASSESSOR_AGREEMENT_REPORT_SCHEMA,
  INDEPENDENT_ASSESSMENT_RECORD_SCHEMA,
  PROOF_BOUNDARY_NON_CERT,
} from "./constants.js";
import type { AssessorAgreementReportV1, IndependentAssessmentRecordV1, ValidationDiagnostic } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** VALIDATE_INDEPENDENT_ASSESSMENT_V1 */
export function validateIndependentAssessmentRecordV1(
  input: unknown,
  authorIdentity: string,
): { ok: boolean; record?: IndependentAssessmentRecordV1; diagnostics: ValidationDiagnostic[] } {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [{ code: "INVALID_ROOT", message: "record must be object", path: "$" }] };
  }
  if (input.schema_version !== INDEPENDENT_ASSESSMENT_RECORD_SCHEMA) {
    diagnostics.push({ code: "WRONG_SCHEMA", message: "wrong schema_version", path: "schema_version" });
  }
  const assessorId = typeof input.assessor_id === "string" ? input.assessor_id : "";
  if (!assessorId.trim()) {
    diagnostics.push({ code: "MISSING_ASSESSOR", message: "assessor_id required", path: "assessor_id" });
  }
  const authors = Array.isArray(input.author_or_implementer_ids)
    ? input.author_or_implementer_ids.map(String)
    : [];
  if (authors.includes(assessorId) || assessorId === authorIdentity) {
    diagnostics.push({
      code: "INSUFFICIENT_INDEPENDENCE",
      message: "assessor must be independent from author/implementer",
      path: "assessor_id",
    });
  }
  if (typeof input.independence_attestation !== "string" || !input.independence_attestation.trim()) {
    diagnostics.push({
      code: "MISSING_ATTESTATION",
      message: "independence attestation required",
      path: "independence_attestation",
    });
  }
  const ok = diagnostics.length === 0;
  return ok
    ? { ok: true, record: input as unknown as IndependentAssessmentRecordV1, diagnostics: [] }
    : { ok: false, diagnostics };
}

export function loadIndependentAssessmentRecordFromFile(
  recordPath: string,
  authorIdentity: string,
): ReturnType<typeof validateIndependentAssessmentRecordV1> {
  if (!fs.existsSync(recordPath)) {
    return {
      ok: false,
      diagnostics: [{ code: "MISSING_FILE", message: "assessment record not found", path: recordPath }],
    };
  }
  const raw = JSON.parse(fs.readFileSync(recordPath, "utf8")) as unknown;
  return validateIndependentAssessmentRecordV1(raw, authorIdentity);
}

/** BUILD_ASSESSOR_AGREEMENT_REPORT_V1 */
export function buildAssessorAgreementReportV1(
  records: IndependentAssessmentRecordV1[],
): { ok: boolean; report?: AssessorAgreementReportV1; diagnostics: ValidationDiagnostic[] } {
  if (records.length < 2) {
    return {
      ok: false,
      diagnostics: [{ code: "INSUFFICIENT_ASSESSORS", message: "need at least two assessor records", path: "records" }],
    };
  }
  const findingIds = [...new Set(records.flatMap((r) => r.findings.map((f) => f.id)))].sort();
  let agree = 0;
  let disagree = 0;
  const conflicts: string[] = [];
  for (const findingId of findingIds) {
    const dispositions = records.map(
      (r) => r.findings.find((f) => f.id === findingId)?.disposition ?? "neutral",
    );
    const allSame = dispositions.every((d) => d === dispositions[0]);
    if (allSame) agree += 1;
    else {
      disagree += 1;
      conflicts.push(findingId);
    }
  }
  const total = findingIds.length || 1;
  return {
    ok: true,
    report: {
      schema_version: ASSESSOR_AGREEMENT_REPORT_SCHEMA,
      assessor_ids: records.map((r) => r.assessor_id).sort(),
      agreement_rate: agree / total,
      disagreement_rate: disagree / total,
      material_conflicts: conflicts,
      proof_boundary: PROOF_BOUNDARY_NON_CERT,
    },
    diagnostics: [],
  };
}
