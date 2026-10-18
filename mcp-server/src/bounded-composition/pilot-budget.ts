/**
 * [IMPL-TIED_BOUNDED_PILOT_BUDGET] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * VALIDATE_PILOT_BUDGET — pure default-off pilot budget gate.
 */

import {
  BOUNDED_PROOF_BOUNDARIES,
  PILOT_BUDGET_SCHEMA_VERSION,
} from "./constants.js";
import { assertPathSafeSegment } from "./path-safe-id.js";

export type PilotBudgetErrorCode = "InvalidPilotBudget" | "OptInRequired" | "DuplicateNamespace";

export type PilotBudgetValidationError = {
  code: PilotBudgetErrorCode;
  detail: string;
};

export type PilotBudgetMode = "parallel" | "sequential";

export type PilotBudgetV1 = {
  schema_version: typeof PILOT_BUDGET_SCHEMA_VERSION;
  bounded_composition_opt_in: true;
  k: number;
  mode: PilotBudgetMode;
  seed: string;
  run_namespace: string;
  cost_ceiling: Record<string, unknown>;
  stop_criteria: unknown[];
  rollout_budget: Record<string, unknown>;
  improvement_stage_budget: Record<string, unknown>;
  timeout_retry_policy: Record<string, unknown>;
  accounting_formula?: {
    R: string;
    P: string;
    proof_boundary: string;
  };
  proof_boundaries: string[];
};

export type ValidatePilotBudgetContext = {
  /** When false, bounded composition is default-off. */
  bounded_composition_opt_in: boolean;
  /** Active run namespaces for duplicate detection within a request. */
  active_run_namespaces?: string[];
};

export type ValidatePilotBudgetResult =
  | { ok: true; budget: PilotBudgetV1 }
  | { ok: false; error: PilotBudgetValidationError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length > 0;
}

function fail(code: PilotBudgetErrorCode, detail: string): ValidatePilotBudgetResult {
  return { ok: false, error: { code, detail } };
}

export function validatePilotBudget(
  candidate: unknown,
  context: ValidatePilotBudgetContext,
): ValidatePilotBudgetResult {
  if (!context.bounded_composition_opt_in) {
    return fail("OptInRequired", "bounded_composition_opt_in is false (default-off)");
  }
  if (!isRecord(candidate)) {
    return fail("InvalidPilotBudget", "candidate must be an object");
  }
  if (candidate.bounded_composition_opt_in !== true) {
    return fail("OptInRequired", "document must set bounded_composition_opt_in: true");
  }
  if (candidate.schema_version !== PILOT_BUDGET_SCHEMA_VERSION) {
    return fail("InvalidPilotBudget", "schema_version must be pilot-budget.v1");
  }

  const k = candidate.k;
  if (typeof k !== "number" || !Number.isFinite(k) || k <= 0 || !Number.isInteger(k)) {
    return fail("InvalidPilotBudget", "k must be a positive integer");
  }

  const mode = candidate.mode;
  if (mode !== "parallel" && mode !== "sequential") {
    return fail("InvalidPilotBudget", "mode must be parallel or sequential");
  }

  if (!nonEmptyString(candidate.seed)) {
    return fail("InvalidPilotBudget", "seed is required");
  }
  if (!nonEmptyString(candidate.run_namespace)) {
    return fail("InvalidPilotBudget", "run_namespace is required");
  }
  if (assertPathSafeSegment(candidate.run_namespace) == null) {
    return fail("InvalidPilotBudget", "run_namespace must be path-safe");
  }

  const active = context.active_run_namespaces ?? [];
  if (active.includes(candidate.run_namespace)) {
    return fail("DuplicateNamespace", `run_namespace already active: ${candidate.run_namespace}`);
  }

  if (!nonEmptyRecord(candidate.cost_ceiling)) {
    return fail("InvalidPilotBudget", "cost_ceiling is required");
  }
  if (!Array.isArray(candidate.stop_criteria) || candidate.stop_criteria.length === 0) {
    return fail("InvalidPilotBudget", "stop_criteria must be a non-empty array");
  }
  if (!nonEmptyRecord(candidate.rollout_budget)) {
    return fail("InvalidPilotBudget", "rollout_budget is required");
  }
  if (!nonEmptyRecord(candidate.improvement_stage_budget)) {
    return fail("InvalidPilotBudget", "improvement_stage_budget is required");
  }
  if (!nonEmptyRecord(candidate.timeout_retry_policy)) {
    return fail("InvalidPilotBudget", "timeout_retry_policy is required");
  }

  let accounting_formula: PilotBudgetV1["accounting_formula"];
  if (candidate.accounting_formula !== undefined) {
    if (!isRecord(candidate.accounting_formula)) {
      return fail("InvalidPilotBudget", "accounting_formula must be an object when present");
    }
    accounting_formula = {
      R: String(candidate.accounting_formula.R ?? "4k"),
      P: String(candidate.accounting_formula.P ?? "3k"),
      proof_boundary: BOUNDED_PROOF_BOUNDARIES.harness2MechanicsNotEffectiveness,
    };
  }

  const budget: PilotBudgetV1 = {
    schema_version: PILOT_BUDGET_SCHEMA_VERSION,
    bounded_composition_opt_in: true,
    k,
    mode,
    seed: candidate.seed.trim(),
    run_namespace: candidate.run_namespace.trim(),
    cost_ceiling: candidate.cost_ceiling as Record<string, unknown>,
    stop_criteria: candidate.stop_criteria,
    rollout_budget: candidate.rollout_budget as Record<string, unknown>,
    improvement_stage_budget: candidate.improvement_stage_budget as Record<string, unknown>,
    timeout_retry_policy: candidate.timeout_retry_policy as Record<string, unknown>,
    accounting_formula,
    proof_boundaries: [BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn],
  };

  return { ok: true, budget };
}
