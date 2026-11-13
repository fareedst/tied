/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] RUN_TRIAL_VERIFIERS — SC-HMEP-M2-04, SC-HMEP-M2-06
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { countObservationsForTrial } from "../normalize/ingest.js";
import type { TrialRow } from "../store/query.js";

export interface AcceptanceCheck {
  id: string;
  type: string;
  note?: string;
}

export interface SuiteScenario {
  scenario_id?: string;
  prompt_workflow_ref?: string;
  acceptance_checks?: AcceptanceCheck[];
}

export interface VerifierResult {
  check_id: string;
  type: string;
  pass: boolean;
  detail: string;
}

export function findScenarioForWfId(
  scenarios: SuiteScenario[],
  wfId: string | null | undefined,
): SuiteScenario | undefined {
  if (!wfId) {
    return undefined;
  }
  const norm = wfId.replace(/^WF-/i, "").toLowerCase();
  return scenarios.find(
    (s) =>
      s.scenario_id === `wf-${norm}` ||
      s.prompt_workflow_ref === wfId ||
      s.prompt_workflow_ref === `PROMPT-${wfId}` ||
      s.prompt_workflow_ref === `PROMPT-WF-${norm}`,
  );
}

export function runTrialVerifiers(
  db: EvalDatabase,
  trial: TrialRow,
  scenario: SuiteScenario | undefined,
): VerifierResult[] {
  const results: VerifierResult[] = [];
  if (!scenario) {
    return [
      {
        check_id: "scenario_match",
        type: "suite_bind",
        pass: false,
        detail: `no suite scenario for wf_id=${trial.wf_id ?? "null"}`,
      },
    ];
  }
  results.push({
    check_id: "scenario_match",
    type: "suite_bind",
    pass: true,
    detail: `bound scenario_id=${scenario.scenario_id ?? scenario.prompt_workflow_ref}`,
  });
  const checks = scenario.acceptance_checks ?? [];
  const obsCount = countObservationsForTrial(db, trial.trial_id);
  for (const check of checks) {
    if (check.type === "manual") {
      continue;
    }
    if (check.type === "token_present") {
      const pass = obsCount > 0;
      results.push({
        check_id: check.id,
        type: check.type,
        pass,
        detail: pass
          ? `observations=${obsCount}`
          : `exit_code=${trial.exit_code ?? "null"} but observations=0`,
      });
    } else if (check.type === "exit_success") {
      const pass = trial.exit_code === 0;
      results.push({
        check_id: check.id,
        type: check.type,
        pass,
        detail: `exit_code=${trial.exit_code ?? "null"}`,
      });
    }
  }
  return results;
}

export function allVerifiersPass(results: VerifierResult[]): boolean {
  return results.length > 0 && results.every((r) => r.pass);
}
