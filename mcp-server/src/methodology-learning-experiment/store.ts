/**
 * [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT]
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getBasePath } from "../yaml-loader.js";
import { writeCanonicalValueAtomic } from "../yaml-canonicalizer.js";
import { METHODOLOGY_EXPERIMENTS_FILENAME } from "./constants.js";
import {
  validateMethodologyLearningExperimentObject,
  type MethodologyExperimentValidationReport,
} from "./validate.js";

export type MethodologyLearningExperimentRecord = Record<string, unknown> & {
  experiment_id: string;
  schema_version: string;
};

export type MethodologyExperimentsData = {
  experiments: MethodologyLearningExperimentRecord[];
};

export function getMethodologyExperimentsPath(basePath?: string): string {
  const base = basePath ?? getBasePath();
  return path.join(base, METHODOLOGY_EXPERIMENTS_FILENAME);
}

export function loadMethodologyExperiments(basePath?: string): MethodologyExperimentsData {
  const filePath = getMethodologyExperimentsPath(basePath);
  if (!fs.existsSync(filePath)) {
    return { experiments: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(raw) as unknown;
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const experiments = Array.isArray(obj.experiments) ? obj.experiments : [];
      return { experiments: experiments as MethodologyLearningExperimentRecord[] };
    }
  } catch {
    // fall through
  }
  return { experiments: [] };
}

export type UpsertMethodologyLearningExperimentResult =
  | {
      ok: true;
      experiment_id: string;
      created: boolean;
      path: string;
      validation: MethodologyExperimentValidationReport;
    }
  | {
      ok: false;
      validation: MethodologyExperimentValidationReport;
    };

export function upsertMethodologyLearningExperiment(
  record: unknown,
  basePath?: string,
): UpsertMethodologyLearningExperimentResult {
  const validation = validateMethodologyLearningExperimentObject(record);
  if (!validation.ok) {
    return { ok: false, validation };
  }

  const experiment = record as MethodologyLearningExperimentRecord;
  const experimentId = experiment.experiment_id;
  const data = loadMethodologyExperiments(basePath);
  const index = data.experiments.findIndex((e) => e.experiment_id === experimentId);
  let created = false;
  if (index >= 0) {
    data.experiments[index] = experiment;
  } else {
    data.experiments.push(experiment);
    created = true;
  }

  const filePath = getMethodologyExperimentsPath(basePath);
  writeCanonicalValueAtomic(filePath, { experiments: data.experiments });

  return {
    ok: true,
    experiment_id: experimentId,
    created,
    path: filePath,
    validation,
  };
}

export function listMethodologyLearningExperiments(basePath?: string): MethodologyExperimentsData {
  return loadMethodologyExperiments(basePath);
}
