/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_ADAPTIVE] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import fs from "node:fs";
import path from "node:path";
import { ADAPTIVE_EFFECTIVENESS_REPORT_SCHEMA } from "./constants.js";
import type { AdaptiveEffectivenessReportV1, ValidationDiagnostic } from "./types.js";

export type ExperimentFixtureCaseV1 = {
  case_id: string;
  held_out?: boolean;
  perturbation: string;
  fixed_receipt_hash: string;
  rule_selected_receipt_hash: string;
  adaptive_receipt_hash: string;
};

export type ExperimentFixtureV1 = {
  schema_version: "adaptive-experiment-fixture.v1";
  min_cases_per_arm: number;
  cases: ExperimentFixtureCaseV1[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** RUN_ADAPTIVE_EFFECTIVENESS_EXPERIMENT_V1 */
export function runAdaptiveEffectivenessExperimentV1(input: {
  fixtureRoot: string;
  heldOutCaseIds?: string[];
}): { ok: boolean; report?: AdaptiveEffectivenessReportV1; diagnostics: ValidationDiagnostic[] } {
  const diagnostics: ValidationDiagnostic[] = [];
  const fixturePath = path.join(input.fixtureRoot, "experiment-fixture.v1.json");
  if (!fs.existsSync(fixturePath)) {
    return {
      ok: false,
      diagnostics: [{ code: "MISSING_FIXTURE", message: "experiment fixture missing", path: fixturePath }],
    };
  }
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as ExperimentFixtureV1;
  const heldOut = new Set(input.heldOutCaseIds ?? fixture.cases.filter((c) => c.held_out).map((c) => c.case_id));
  const training = fixture.cases.filter((c) => !heldOut.has(c.case_id));
  if (training.length < fixture.min_cases_per_arm) {
    return {
      ok: false,
      diagnostics: [{ code: "UNDERPOWERED_ARM", message: "insufficient training cases", path: "cases" }],
    };
  }
  const arms = (["fixed", "rule_selected", "adaptive"] as const).map((arm) => {
    const hashKey =
      arm === "fixed"
        ? "fixed_receipt_hash"
        : arm === "rule_selected"
          ? "rule_selected_receipt_hash"
          : "adaptive_receipt_hash";
    const hashes = training.map((c) => c[hashKey]);
    const selection_receipt_hash = hashes.sort().join("|");
    return { arm, case_count: training.length, selection_receipt_hash };
  });
  const held_out_provenance = fixture.cases
    .filter((c) => heldOut.has(c.case_id))
    .map((c) => ({ case_id: c.case_id, receipt_hash: c.adaptive_receipt_hash }));
  for (const c of fixture.cases.filter((x) => heldOut.has(x.case_id))) {
    if (!c.adaptive_receipt_hash) {
      diagnostics.push({
        code: "HELD_OUT_PROVENANCE_MISSING",
        message: `held-out case ${c.case_id} missing provenance`,
        path: c.case_id,
      });
    }
  }
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  const perturbationChanges = new Set(fixture.cases.map((c) => c.perturbation)).size > 1;
  if (!perturbationChanges) {
    diagnostics.push({
      code: "NO_PERTURBATION_VARIANCE",
      message: "fixture must include perturbation variance",
      path: "cases",
    });
    return { ok: false, diagnostics };
  }
  return {
    ok: true,
    report: {
      schema_version: ADAPTIVE_EFFECTIVENESS_REPORT_SCHEMA,
      arms,
      held_out_provenance,
      proof_boundary: "adaptive-observational-not-causal-superiority",
    },
    diagnostics: [],
  };
}

export function validateExperimentFixtureV1(input: unknown): input is ExperimentFixtureV1 {
  return isRecord(input) && Array.isArray(input.cases) && typeof input.min_cases_per_arm === "number";
}
