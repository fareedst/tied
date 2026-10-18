/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_REPORT] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import {
  ASSESSOR_PACK_SCHEMA,
  CERTIFIABILITY_READINESS_SCHEMA,
  READINESS_STATE_GAPS,
  READINESS_STATE_READY,
} from "./constants.js";
import type {
  AdaptiveEffectivenessReportV1,
  AssessorAgreementReportV1,
  AssessorPackV1,
  CapabilityProfileV1,
  CertifiabilityReadinessV1,
  ConformanceMatrixV1,
  ValidationDiagnostic,
} from "./types.js";

export type ReadinessComposeInput = {
  matrix: ConformanceMatrixV1;
  profile: CapabilityProfileV1;
  agreement?: AssessorAgreementReportV1;
  adaptive?: AdaptiveEffectivenessReportV1;
  requestCertifiedOutput?: boolean;
};

function matrixPasses(matrix: ConformanceMatrixV1): boolean {
  return matrix.rows.every((r) => r.status === "pass");
}

function capabilityPasses(profile: CapabilityProfileV1): boolean {
  return profile.dimensions.every((d) => d.rating === "sufficient");
}

/** COMPOSE_CERTIFIABILITY_READINESS_V1 */
export function composeCertifiabilityReadinessV1(input: ReadinessComposeInput): {
  ok: boolean;
  readiness?: CertifiabilityReadinessV1;
  diagnostics: ValidationDiagnostic[];
} {
  if (input.requestCertifiedOutput) {
    return {
      ok: false,
      diagnostics: [
        { code: "FORBIDDEN_CERTIFICATION_CLAIM", message: "certified output forbidden", path: "readiness_state" },
      ],
    };
  }
  const conformanceOk = matrixPasses(input.matrix);
  const capabilityOk = capabilityPasses(input.profile);
  const readiness_state =
    conformanceOk && capabilityOk ? READINESS_STATE_READY : READINESS_STATE_GAPS;
  return {
    ok: true,
    readiness: {
      schema_version: CERTIFIABILITY_READINESS_SCHEMA,
      readiness_state,
      proof_boundary: "ready_for_external_appraisal-not-certified",
      sections: {
        conformance: input.matrix,
        capability: input.profile,
        agreement: input.agreement,
        adaptive: input.adaptive,
      },
    },
    diagnostics: [],
  };
}

/** GENERATE_ASSESSOR_PACK_V1 */
export function generateAssessorPackV1(input: {
  readiness: CertifiabilityReadinessV1;
  bundleSpecVersion: string;
}): AssessorPackV1 {
  return {
    schema_version: ASSESSOR_PACK_SCHEMA,
    readiness: input.readiness,
    bundle_spec_version: input.bundleSpecVersion,
    limitations: [
      "Stages 6 and 8 require human-owned external appraisal.",
      "No ISO/CMMI compliance or certified claim is implied.",
    ],
    proof_boundary: "ready_for_external_appraisal-not-certified",
  };
}
