/**
 * [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 * [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 */

import { loadMethodologyExperiments } from "../methodology-learning-experiment/store.js";
import {
  pairConformanceEffectiveness,
  type MethodologyConformanceEffectivenessPairingReport,
  type PairConformanceEffectivenessInput,
} from "./pair.js";

export type PairFromExperimentInput = {
  experiment_id: string;
  conformance_evidence_refs?: unknown[];
  process_grade_gap_documented?: boolean;
  waiver?: PairConformanceEffectivenessInput["waiver"];
  base_path?: string;
};

export function pairFromExperimentId(
  input: PairFromExperimentInput,
): MethodologyConformanceEffectivenessPairingReport & { experiment_id: string } {
  const data = loadMethodologyExperiments(input.base_path);
  const record = data.experiments.find((e) => e.experiment_id === input.experiment_id);
  if (!record) {
    return {
      schema_version: "methodology-conformance-effectiveness-pairing-report.v1",
      ok: false,
      disposition: "conformance_only_trap",
      proof_boundary: "Experiment record not found.",
      diagnostics: [{ code: "experiment_not_found", message: `No experiment ${input.experiment_id}` }],
      experiment_id: input.experiment_id,
    };
  }

  const outcome = record.methodology_outcome_observation as
    | PairConformanceEffectivenessInput["methodology_outcome_observation"]
    | undefined;
  const experimentRefs = record.conformance_evidence_refs as unknown[] | undefined;
  const refs = input.conformance_evidence_refs?.length
    ? input.conformance_evidence_refs
    : experimentRefs;

  const report = pairConformanceEffectiveness({
    conformance_evidence_refs: refs,
    methodology_outcome_observation: outcome ?? null,
    experiment_proof_boundary:
      typeof record.proof_boundary === "string" ? record.proof_boundary : undefined,
    process_grade_gap_documented: input.process_grade_gap_documented,
    waiver: input.waiver,
  });

  return { ...report, experiment_id: input.experiment_id };
}
