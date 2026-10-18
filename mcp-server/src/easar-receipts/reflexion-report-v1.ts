/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * reflexion-report.v1 export-only synthesis (ARCH detail vs graph divergence); never merges adversarial ledger.
 */

export const REFLEXION_REPORT_V1_SCHEMA = "reflexion-report.v1";

export type ReflexionDivergence = {
  arch_token: string;
  summary: string;
  graph_evidence_ref?: string;
  severity: "info" | "warn" | "block";
};

export type ReflexionReportV1 = {
  schema_version: typeof REFLEXION_REPORT_V1_SCHEMA;
  request_token: string;
  inquiry_run_id: string;
  gate_allowed: boolean;
  obligation_report_ref: string;
  adversarial_ledger_ref?: string;
  divergences: ReflexionDivergence[];
  export_only: true;
};

export type ReflexionReportV1Input = {
  request_token: string;
  inquiry_run_id: string;
  gate_allowed: boolean;
  obligation_report_ref: string;
  adversarial_ledger_ref?: string;
  divergences?: ReflexionDivergence[];
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: obligation_report_ref non-empty.
export function validateReflexionReportV1Input(
  input: ReflexionReportV1Input,
): { ok: true } | { ok: false; error: string } {
  if (!input.request_token?.trim()) {
    return { ok: false, error: "missing_request_token" };
  }
  if (!input.inquiry_run_id?.trim()) {
    return { ok: false, error: "missing_inquiry_run_id" };
  }
  if (!input.obligation_report_ref?.trim()) {
    return { ok: false, error: "missing_obligation_report_ref" };
  }
  return { ok: true };
}

// [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
export function synthesizeReflexionReportV1FromInputs(
  input: ReflexionReportV1Input,
): { ok: true; report: ReflexionReportV1 } | { ok: false; error: string } {
  const validated = validateReflexionReportV1Input(input);
  if (!validated.ok) {
    return validated;
  }
  return {
    ok: true,
    report: buildReflexionReportV1({
      ...input,
      divergences: input.divergences ?? [],
    }),
  };
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — EFFECTS: export_only true; adversarial ledger ref is pointer only.
export function buildReflexionReportV1(input: {
  request_token: string;
  inquiry_run_id: string;
  gate_allowed: boolean;
  obligation_report_ref: string;
  adversarial_ledger_ref?: string;
  divergences: ReflexionDivergence[];
}): ReflexionReportV1 {
  return {
    schema_version: REFLEXION_REPORT_V1_SCHEMA,
    request_token: input.request_token,
    inquiry_run_id: input.inquiry_run_id,
    gate_allowed: input.gate_allowed,
    obligation_report_ref: input.obligation_report_ref,
    adversarial_ledger_ref: input.adversarial_ledger_ref,
    divergences: input.divergences.slice(),
    export_only: true,
  };
}
