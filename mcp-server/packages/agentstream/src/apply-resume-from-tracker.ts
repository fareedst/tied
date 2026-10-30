/**
 * [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]
 * Apply Authoritative Tracker resume plan to DryRunConfig before turn slicing.
 */
import type { DryRunConfig } from "./dry-run-config.js";
import type { Turn } from "./checklist-load-turns.js";
import {
  deriveChecklistResumePlan,
  loadTrackerResumeContext,
} from "./checklist-controller-resume.js";

export type ApplyResumeResult =
  | { ok: true; first_turn: number; next_step_slug: string; session_id_applied: boolean }
  | { ok: false; error: string };

export function applyResumeFromTracker(
  cfg: DryRunConfig,
  turns: readonly Turn[],
): ApplyResumeResult {
  const trackerPath = cfg.checklistTrackerYaml.trim();
  if (trackerPath === "") {
    return { ok: false, error: "checklist_tracker_required" };
  }
  const ctx = loadTrackerResumeContext(trackerPath);
  const plan = deriveChecklistResumePlan({
    turns,
    stepDispositions: ctx.stepDispositions,
  });
  if (!plan.ok) {
    return { ok: false, error: plan.error === "stub_not_in_tracker" ? `stub_not_in_tracker:${plan.slug}` : plan.error };
  }
  if (cfg.firstTurn > 1 && cfg.firstTurn !== plan.first_turn) {
    return {
      ok: false,
      error: `first_turn_conflict:cli=${cfg.firstTurn}:tracker=${plan.first_turn}`,
    };
  }
  cfg.firstTurn = plan.first_turn;
  let sessionApplied = false;
  if (cfg.sessionId.trim() === "" && ctx.sessionId) {
    cfg.sessionId = ctx.sessionId;
    sessionApplied = true;
  }
  return {
    ok: true,
    first_turn: plan.first_turn,
    next_step_slug: plan.next_step_slug,
    session_id_applied: sessionApplied,
  };
}
