/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-METHODOLOGY-LEARNING-EXPERIMENT]
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
 */

import {
  loadMethodologyExperiments,
  type MethodologyLearningExperimentRecord,
} from "../methodology-learning-experiment/store.js";
import { validateMethodologyLearningExperimentObject } from "../methodology-learning-experiment/validate.js";
import { EXPORTABLE_PRIVACY_TIERS, type CohortExportDiagnostic } from "./constants.js";
import type { NormalizedExperimentRow } from "./manifest.js";

export type ResolvedExperiment = {
  experiment_id: string;
  record: MethodologyLearningExperimentRecord;
  profile_paths: string[];
};

export function resolveExperimentsForExport(
  rows: NormalizedExperimentRow[],
  basePath?: string,
): { ok: true; resolved: ResolvedExperiment[] } | { ok: false; diagnostics: CohortExportDiagnostic[] } {
  const diagnostics: CohortExportDiagnostic[] = [];
  const store = loadMethodologyExperiments(basePath);
  const byId = new Map(store.experiments.map((e) => [e.experiment_id, e]));
  const resolved: ResolvedExperiment[] = [];

  for (const row of rows) {
    const stored = byId.get(row.experiment_id);
    if (!stored) {
      diagnostics.push({
        code: "missing_experiment",
        message: `Experiment not found: ${row.experiment_id}`,
        path: `experiments.${row.experiment_id}`,
      });
      continue;
    }
    const validation = validateMethodologyLearningExperimentObject(stored);
    if (!validation.ok) {
      diagnostics.push({
        code: "invalid_experiment_record",
        message: `Invalid experiment record for ${row.experiment_id}`,
        path: `experiments.${row.experiment_id}`,
      });
      continue;
    }
    const tier = typeof stored.privacy_tier === "string" ? stored.privacy_tier : "";
    if (!EXPORTABLE_PRIVACY_TIERS.has(tier)) {
      diagnostics.push({
        code: "privacy_tier_not_exportable",
        message: `privacy_tier ${tier || "(missing)"} is not exportable; require shareable_hashed on record`,
        path: `experiments.${row.experiment_id}.privacy_tier`,
      });
      continue;
    }
    resolved.push({
      experiment_id: row.experiment_id,
      record: stored,
      profile_paths: row.profile_paths,
    });
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }
  return { ok: true, resolved };
}
