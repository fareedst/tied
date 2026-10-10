/**
 * [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 */

import {
  CONFORMANCE_EVIDENCE_REF_KINDS,
  PAIRING_DISPOSITIONS,
  PAIRING_PROOF_BOUNDARY,
  PAIRING_REPORT_SCHEMA_VERSION,
  type ConformanceEvidenceRefKind,
  type PairingDisposition,
} from "./constants.js";

export type MethodologyConformanceEvidenceRef = {
  kind: ConformanceEvidenceRefKind;
  path: string;
};

export type MethodologyOutcomeObservationInput = {
  value?: string;
  evidence_refs?: unknown[];
};

export type PairingWaiverInput = {
  owner?: string;
  expiry?: string;
  rationale?: string;
};

export type PairConformanceEffectivenessInput = {
  conformance_evidence_refs?: unknown[];
  methodology_outcome_observation?: MethodologyOutcomeObservationInput | null;
  experiment_proof_boundary?: string;
  process_grade_gap_documented?: boolean;
  waiver?: PairingWaiverInput | null;
};

export type MethodologyConformanceEffectivenessPairingReport = {
  schema_version: typeof PAIRING_REPORT_SCHEMA_VERSION;
  ok: boolean;
  disposition: PairingDisposition;
  proof_boundary: string;
  diagnostics: Array<{ code: string; message: string }>;
  experiment_id?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const kindSet = new Set<string>(CONFORMANCE_EVIDENCE_REF_KINDS);

export function parseConformanceEvidenceRefs(
  refs: unknown[] | undefined,
): { refs: MethodologyConformanceEvidenceRef[]; genericProse: boolean } {
  const parsed: MethodologyConformanceEvidenceRef[] = [];
  let genericProse = false;
  if (!refs?.length) {
    return { refs: parsed, genericProse };
  }
  for (const item of refs) {
    if (typeof item === "string") {
      if (!item.includes("/") && !item.endsWith(".json") && !item.endsWith(".yaml")) {
        genericProse = true;
      } else {
        parsed.push({ kind: "file_path", path: item });
      }
      continue;
    }
    if (!isRecord(item)) {
      genericProse = true;
      continue;
    }
    const kind = item.kind;
    const refPath = item.path ?? item.ref ?? item.uri;
    if (!nonEmptyString(kind) || !kindSet.has(kind)) {
      genericProse = true;
      continue;
    }
    if (!nonEmptyString(refPath)) {
      genericProse = true;
      continue;
    }
    parsed.push({ kind: kind as ConformanceEvidenceRefKind, path: refPath });
  }
  return { refs: parsed, genericProse };
}

function waiverValid(waiver: PairingWaiverInput | null | undefined): boolean {
  if (!waiver) return false;
  return (
    nonEmptyString(waiver.owner)
    && nonEmptyString(waiver.expiry)
    && nonEmptyString(waiver.rationale)
  );
}

export function pairConformanceEffectiveness(
  input: PairConformanceEffectivenessInput,
): MethodologyConformanceEffectivenessPairingReport {
  const diagnostics: Array<{ code: string; message: string }> = [];

  if (waiverValid(input.waiver)) {
    return {
      schema_version: PAIRING_REPORT_SCHEMA_VERSION,
      ok: true,
      disposition: "waived",
      proof_boundary: PAIRING_PROOF_BOUNDARY,
      diagnostics: [{ code: "accepted_risk_waiver", message: "Pairing obligation waived per CITDP." }],
    };
  }

  const { refs: conformanceRefs, genericProse } = parseConformanceEvidenceRefs(
    input.conformance_evidence_refs,
  );
  if (genericProse) {
    diagnostics.push({
      code: "generic_prose_ref",
      message: "Conformance evidence must use typed refs; generic prose rejected.",
    });
  }

  const outcome = input.methodology_outcome_observation;
  const hasConformance = conformanceRefs.length > 0;
  const hasOutcomeRecord = outcome !== null && outcome !== undefined && isRecord(outcome);
  const outcomeValue = hasOutcomeRecord ? outcome.value : undefined;

  if (!hasConformance) {
    const ok = diagnostics.length === 0;
    return {
      schema_version: PAIRING_REPORT_SCHEMA_VERSION,
      ok,
      disposition: "paired",
      proof_boundary: input.experiment_proof_boundary ?? PAIRING_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  if (!hasOutcomeRecord || !nonEmptyString(outcomeValue)) {
    diagnostics.push({
      code: "missing_outcome_link",
      message: "Conformance evidence without satisfiable methodology outcome observation.",
    });
    return {
      schema_version: PAIRING_REPORT_SCHEMA_VERSION,
      ok: false,
      disposition: "conformance_only_trap",
      proof_boundary: PAIRING_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  if (outcomeValue === "not_measured") {
    if (!input.process_grade_gap_documented) {
      diagnostics.push({
        code: "process_grade_gap_required",
        message: "not_measured effectiveness requires documented process-grade or envelope gap.",
      });
      return {
        schema_version: PAIRING_REPORT_SCHEMA_VERSION,
        ok: false,
        disposition: "effectiveness_not_measured",
        proof_boundary: input.experiment_proof_boundary ?? PAIRING_PROOF_BOUNDARY,
        diagnostics,
      };
    }
    return {
      schema_version: PAIRING_REPORT_SCHEMA_VERSION,
      ok: true,
      disposition: "effectiveness_not_measured",
      proof_boundary: input.experiment_proof_boundary ?? PAIRING_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  return {
    schema_version: PAIRING_REPORT_SCHEMA_VERSION,
    ok: diagnostics.length === 0,
    disposition: "paired",
    proof_boundary: input.experiment_proof_boundary ?? PAIRING_PROOF_BOUNDARY,
    diagnostics,
  };
}
