/**
 * [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [ARCH-TIED_DURABLE_CHECKLIST_CONTROLLER]
 * [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_INTENT_CONTROL_PLANE] — REQ-CTRL-007 resume plan from Authoritative Tracker.
 */

import fs from "node:fs";

import yaml from "js-yaml";

export type ChecklistResumeTurn = {
  stepStub: string;
  chainFromPrevious: boolean;
};

export type ChecklistResumePlanInput = {
  turns: readonly ChecklistResumeTurn[];
  stepDispositions: ReadonlyMap<string, string>;
};

export type ChecklistResumePlanResult =
  | {
      ok: true;
      first_turn: number;
      next_step_slug: string;
      skipped_completed_count: number;
    }
  | { ok: false; error: "all_steps_terminal" }
  | { ok: false; error: "stub_not_in_tracker"; slug: string }
  | { ok: false; error: "no_stubbed_turns" };

const TERMINAL = new Set(["completed", "waived", "not_applicable"]);

function isTerminal(disposition: string | undefined): boolean {
  return TERMINAL.has(String(disposition ?? "").trim());
}

// [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: map checklist turn queue to first non-terminal tracker step (REQ-CTRL-007).
export function deriveChecklistResumePlan(
  input: ChecklistResumePlanInput,
): ChecklistResumePlanResult {
  let skipped = 0;
  let sawStub = false;
  for (let i = 0; i < input.turns.length; i++) {
    const stub = input.turns[i]!.stepStub.trim();
    if (stub === "") {
      continue;
    }
    sawStub = true;
    if (!input.stepDispositions.has(stub)) {
      return { ok: false, error: "stub_not_in_tracker", slug: stub };
    }
    const disp = input.stepDispositions.get(stub);
    if (isTerminal(disp)) {
      skipped += 1;
      continue;
    }
    return {
      ok: true,
      first_turn: i + 1,
      next_step_slug: stub,
      skipped_completed_count: skipped,
    };
  }
  if (!sawStub) {
    return { ok: false, error: "no_stubbed_turns" };
  }
  return { ok: false, error: "all_steps_terminal" };
}

type StateHistoryRow = { turn_identity?: string; receipt_hash?: string };

export function parseSessionIdFromStateHistory(
  history: readonly StateHistoryRow[] | undefined,
): string | undefined {
  if (!history?.length) {
    return undefined;
  }
  const last = history[history.length - 1];
  const identity = String(last?.turn_identity ?? "").trim();
  const match = /:session=([^:]+)$/.exec(identity);
  return match?.[1]?.trim() || undefined;
}

type TrackerStepRow = { slug?: string; disposition?: string };

export function stepDispositionsFromTrackerSteps(
  steps: readonly TrackerStepRow[] | undefined,
): Map<string, string> {
  const out = new Map<string, string>();
  for (const row of steps ?? []) {
    const slug = String(row.slug ?? "").trim();
    if (slug === "") {
      continue;
    }
    out.set(slug, String(row.disposition ?? "pending").trim() || "pending");
  }
  return out;
}

export function loadTrackerResumeContext(trackerPath: string): {
  stepDispositions: Map<string, string>;
  sessionId?: string;
  requestToken?: string;
} {
  const raw = fs.readFileSync(trackerPath, "utf8");
  const doc = yaml.load(raw) as Record<string, unknown>;
  const steps = doc.steps as TrackerStepRow[] | undefined;
  const history = doc.state_history as StateHistoryRow[] | undefined;
  let requestToken = String(doc.request_token ?? "").trim();
  if (requestToken === "") {
    const ee = doc.execution_evidence;
    if (ee !== null && typeof ee === "object" && !Array.isArray(ee)) {
      requestToken = String((ee as Record<string, unknown>).request ?? "").trim();
    }
  }
  return {
    stepDispositions: stepDispositionsFromTrackerSteps(steps),
    sessionId: parseSessionIdFromStateHistory(history),
    requestToken: requestToken || undefined,
  };
}
