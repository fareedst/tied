import path from "node:path";

import type { GatePhase } from "../checklist-validator.js";
import { runBranchCheck } from "./branch-check.js";
import { loadCitdpBodyFromFile, loadTrackerFromFile } from "./yaml-load.js";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1a composes Tracker/CITDP load, optional prior-slug check, and tied_checklist_gate_validate (injected in tests). */

export type GateValidateArgs = {
  phase: GatePhase;
  tracker_path: string;
  citdp: Record<string, unknown>;
  project_root: string;
  receipt_persistence?: {
    request_token: string;
    gates_dir: string;
    ledger_path: string;
    run_id?: string;
  };
};

export type GateValidateResult = {
  allowed: boolean;
  reasons?: string[];
  blocking?: boolean;
  receipt_path?: string | null;
  ok?: boolean;
  error?: string;
};

export type GateValidateFn = (args: GateValidateArgs) => Promise<GateValidateResult>;

export type GateCheckInput = {
  requestToken: string;
  phase: GatePhase;
  slug?: string;
  trackerPath: string;
  citdpPath: string;
  projectRoot: string;
  checkBranch?: boolean;
  callGateValidate: GateValidateFn;
  receiptPersistence?: GateValidateArgs["receipt_persistence"];
};

export type GateCheckSummary = {
  allowed: boolean;
  exit_code: 0 | 1 | 2;
  phase: GatePhase;
  request_token: string;
  reasons: string[];
  receipt_path?: string | null;
  branch_check?: {
    ok: boolean;
    skipped?: boolean;
    current?: string;
    expected?: string;
    exit_code?: 0 | 1 | 2;
    reasons?: string[];
  };
};

const TERMINAL_DISPOSITIONS = new Set(["completed", "not_applicable", "waived"]);

function stepDisposition(step: Record<string, unknown>): string | undefined {
  const tracking =
    typeof step.tracking === "object" && step.tracking !== null && !Array.isArray(step.tracking)
      ? (step.tracking as Record<string, unknown>)
      : undefined;
  const fromStep = step.disposition ?? step.status;
  if (typeof fromStep === "string" && fromStep.trim()) {
    return fromStep.trim();
  }
  if (tracking) {
    const fromTracking = tracking.disposition ?? tracking.status;
    if (typeof fromTracking === "string" && fromTracking.trim()) {
      return fromTracking.trim();
    }
  }
  return undefined;
}

function trackerSteps(tracker: Record<string, unknown>): Record<string, unknown>[] {
  const steps = tracker.steps;
  if (!Array.isArray(steps)) {
    return [];
  }
  return steps.filter(
    (s): s is Record<string, unknown> =>
      typeof s === "object" && s !== null && !Array.isArray(s),
  );
}

/** When slug is set, every step listed before that slug must be terminal. */
export function assertPriorStepsForSlug(
  tracker: Record<string, unknown>,
  slug: string,
): string[] {
  const steps = trackerSteps(tracker);
  const reasons: string[] = [];
  let sawSlug = false;
  for (const step of steps) {
    const stepSlug = typeof step.slug === "string" ? step.slug : undefined;
    if (!stepSlug) {
      continue;
    }
    if (stepSlug === slug) {
      sawSlug = true;
      break;
    }
    const disp = stepDisposition(step);
    if (!disp || !TERMINAL_DISPOSITIONS.has(disp)) {
      reasons.push(`prior_slug_not_terminal:${stepSlug}:${disp ?? "missing"}`);
    }
  }
  if (!sawSlug) {
    reasons.push(`slug_not_found:${slug}`);
  }
  return reasons;
}

export async function runGateCheckComposition(input: GateCheckInput): Promise<GateCheckSummary> {
  const projectRoot = path.resolve(input.projectRoot);
  const trackerAbs = path.isAbsolute(input.trackerPath)
    ? input.trackerPath
    : path.join(projectRoot, input.trackerPath);
  const citdpAbs = path.isAbsolute(input.citdpPath)
    ? input.citdpPath
    : path.join(projectRoot, input.citdpPath);

  let citdp: Record<string, unknown>;
  let tracker: Record<string, unknown>;
  try {
    tracker = loadTrackerFromFile(trackerAbs);
    citdp = loadCitdpBodyFromFile(citdpAbs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      allowed: false,
      exit_code: 2,
      phase: input.phase,
      request_token: input.requestToken,
      reasons: [msg.startsWith("missing_file:") ? msg : `misconfig:${msg}`],
    };
  }

  if (input.slug?.trim()) {
    const priorReasons = assertPriorStepsForSlug(tracker, input.slug.trim());
    if (priorReasons.length > 0) {
      return {
        allowed: false,
        exit_code: 1,
        phase: input.phase,
        request_token: input.requestToken,
        reasons: priorReasons,
      };
    }
  }

  let gate: GateValidateResult;
  try {
    gate = await input.callGateValidate({
      phase: input.phase,
      tracker_path: trackerAbs,
      citdp,
      project_root: projectRoot,
      receipt_persistence: input.receiptPersistence,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      allowed: false,
      exit_code: 2,
      phase: input.phase,
      request_token: input.requestToken,
      reasons: [`mcp_unavailable:${msg}`],
    };
  }

  if (gate.ok === false && gate.error) {
    return {
      allowed: false,
      exit_code: 2,
      phase: input.phase,
      request_token: input.requestToken,
      reasons: [gate.error],
    };
  }

  let allowed = gate.allowed === true;
  let exitCode: 0 | 1 | 2 = allowed ? 0 : 1;
  const reasons = gate.reasons ?? (allowed ? [] : ["gate_blocked"]);
  const summary: GateCheckSummary = {
    allowed,
    exit_code: exitCode,
    phase: input.phase,
    request_token: input.requestToken,
    reasons: [...reasons],
    receipt_path: gate.receipt_path ?? null,
  };

  if (input.checkBranch) {
    const branch = runBranchCheck({ projectRoot, citdp, tracker });
    summary.branch_check = {
      ok: branch.ok,
      skipped: branch.skipped,
      current: branch.current,
      expected: branch.expected,
      exit_code: branch.exit_code,
      reasons: branch.reasons,
    };
    if (branch.exit_code === 2) {
      summary.allowed = false;
      summary.exit_code = 2;
      summary.reasons.push(...branch.reasons);
    } else if (branch.exit_code === 1 && allowed) {
      summary.allowed = false;
      summary.exit_code = 1;
      summary.reasons.push(...branch.reasons);
    }
  }

  return summary;
}

export function defaultPathsForRequest(
  projectRoot: string,
  requestToken: string,
  trackerPath?: string,
  citdpPath?: string,
): { trackerPath: string; citdpPath: string } {
  return {
    trackerPath:
      trackerPath?.trim() ||
      path.join("working", requestToken, "checklist-tracker.yaml"),
    citdpPath:
      citdpPath?.trim() ||
      path.join("tied", "citdp", `CITDP-${requestToken}.yaml`),
  };
}
