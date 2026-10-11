/**
 * [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 * [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 */

import { getBasePath } from "../yaml-loader.js";
import { extractMethodologySurfaceExperimentLink } from "../methodology-conformance-effectiveness-pairing/pairing-gate.js";
import { loadMethodologyExperiments } from "../methodology-learning-experiment/store.js";
import { validateMethodologyLearningExperimentObject } from "../methodology-learning-experiment/validate.js";
import {
  isLegacyMethodologySurfaceClass,
  readMethodologySurfaceChangeClass,
} from "./change-class.js";

export type MethodologySurfaceExperimentGatePhase = "pre_implementation" | "verification" | "close_out";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyBaseline(record: Record<string, unknown>): boolean {
  const baseline = record.methodology_baseline;
  if (!isRecord(baseline)) return false;
  const rows = baseline.metric_rows;
  if (Array.isArray(rows) && rows.length > 0) return true;
  return Object.keys(baseline).length > 0;
}

function linkWaiverAllows(link: ReturnType<typeof extractMethodologySurfaceExperimentLink>): boolean {
  if (!link?.waiver) return false;
  const { owner, expiry, rationale } = link.waiver;
  return Boolean(owner?.trim() && expiry?.trim() && rationale?.trim());
}

export function validateMethodologySurfaceExperimentGate(input: {
  citdp: unknown;
  phase: MethodologySurfaceExperimentGatePhase;
  basePath?: string;
}): { ok: boolean; diagnostics: string[] } {
  if (input.phase !== "pre_implementation") {
    return { ok: true, diagnostics: [] };
  }

  const classRead = readMethodologySurfaceChangeClass(input.citdp);
  if (isLegacyMethodologySurfaceClass(classRead)) {
    return { ok: true, diagnostics: [] };
  }

  if (classRead.kind === "unknown") {
    return {
      ok: false,
      diagnostics: [`methodology_surface_experiment_gate_blocked:unknown_change_class:${classRead.raw}`],
    };
  }

  const link = extractMethodologySurfaceExperimentLink(input.citdp);
  if (!link) {
    return {
      ok: false,
      diagnostics: ["methodology_surface_experiment_gate_blocked:missing_link"],
    };
  }

  if (linkWaiverAllows(link)) {
    return { ok: true, diagnostics: [] };
  }

  const basePath = input.basePath ?? getBasePath();
  const store = loadMethodologyExperiments(basePath);
  const row = store.experiments.find((e) => e.experiment_id === link.experiment_id);
  if (!row) {
    return {
      ok: false,
      diagnostics: [`methodology_experiment_not_found:${link.experiment_id}`],
    };
  }

  const validation = validateMethodologyLearningExperimentObject(row);
  if (!validation.ok) {
    const codes = validation.diagnostics.map((d) => d.code).join(",") || "w1_invalid";
    return {
      ok: false,
      diagnostics: [`methodology_surface_experiment_gate_blocked:w1_validation:${codes}`],
    };
  }

  if (!nonEmptyBaseline(row)) {
    return {
      ok: false,
      diagnostics: ["methodology_surface_experiment_gate_blocked:missing_baseline"],
    };
  }

  return { ok: true, diagnostics: [] };
}
