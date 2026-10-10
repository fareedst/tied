/**
 * [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 */

import { getBasePath } from "../yaml-loader.js";
import { pairFromExperimentId } from "./resolve.js";

type PairingGatePhase = "pre_implementation" | "verification" | "close_out";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** CITDP-scoped linkage; absent link => no methodology pairing gate hook. */
export type MethodologySurfaceExperimentLink = {
  experiment_id: string;
  production_system_surface?: string;
  conformance_evidence_refs?: unknown[];
  process_grade_gap_documented?: boolean;
  waiver?: { owner?: string; expiry?: string; rationale?: string };
};

export function extractMethodologySurfaceExperimentLink(
  citdp: unknown,
): MethodologySurfaceExperimentLink | undefined {
  if (!isRecord(citdp)) return undefined;
  const candidates = [
    citdp.methodology_surface_experiment_link,
    isRecord(citdp.change_definition)
      ? citdp.change_definition.methodology_surface_experiment_link
      : undefined,
    isRecord(citdp.sponsor_decisions)
      ? citdp.sponsor_decisions.methodology_surface_experiment_link
      : undefined,
  ];
  for (const block of candidates) {
    if (!isRecord(block)) continue;
    const experimentId = identityValue(block.experiment_id);
    if (!experimentId) continue;
    return {
      experiment_id: experimentId,
      production_system_surface: identityValue(block.production_system_surface),
      conformance_evidence_refs: Array.isArray(block.conformance_evidence_refs)
        ? block.conformance_evidence_refs
        : undefined,
      process_grade_gap_documented: block.process_grade_gap_documented === true,
      waiver: isRecord(block.waiver)
        ? {
            owner: identityValue(block.waiver.owner),
            expiry: identityValue(block.waiver.expiry),
            rationale: identityValue(block.waiver.rationale),
          }
        : undefined,
    };
  }
  return undefined;
}

export function validateMethodologySurfacePairingGate(input: {
  citdp: unknown;
  phase: PairingGatePhase;
  basePath?: string;
}): { ok: boolean; diagnostics: string[] } {
  if (input.phase !== "verification" && input.phase !== "close_out") {
    return { ok: true, diagnostics: [] };
  }
  const link = extractMethodologySurfaceExperimentLink(input.citdp);
  if (!link) {
    return { ok: true, diagnostics: [] };
  }

  const report = pairFromExperimentId({
    experiment_id: link.experiment_id,
    conformance_evidence_refs: link.conformance_evidence_refs,
    process_grade_gap_documented: link.process_grade_gap_documented,
    waiver: link.waiver,
    base_path: input.basePath ?? getBasePath(),
  });

  if (report.disposition === "conformance_only_trap" || !report.ok) {
    const codes = report.diagnostics.map((d) => d.code).join(",") || report.disposition;
    return {
      ok: false,
      diagnostics: [`methodology_pairing_blocked:${report.disposition}:${codes}`],
    };
  }
  return { ok: true, diagnostics: [] };
}
