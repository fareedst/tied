import type { EvidenceRecord, TaskEntry, TaskStatus } from "./task-graph.js";

export type ExecutionOutcome = "passed" | "failed" | "cancelled" | "timed_out" | "stale";
export interface ExecutionState {
  task_id: string;
  source_revision: string;
  status: TaskStatus;
  attempt: number;
  evidence: EvidenceRecord[];
}

export type ExecutionError = "UNKNOWN_TASK" | "INVALID_OUTCOME" | "STALE_INPUT" | "ILLEGAL_TRANSITION" | "CANCELLATION_NOT_RESUMABLE";

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: preserve identity and append one deterministic evidence record for every attempt outcome.
export function applyExecutionOutcome(
  task: TaskEntry,
  state: ExecutionState | undefined,
  sourceRevision: string,
  outcome: string,
  provenance: string,
): { ok: true; state: ExecutionState } | { ok: false; error: ExecutionError } {
  if (!state && !task) return { ok: false, error: "UNKNOWN_TASK" };
  if (!["passed", "failed", "cancelled", "timed_out", "stale"].includes(outcome)) return { ok: false, error: "INVALID_OUTCOME" };
  if (task.source_revision !== sourceRevision || state && state.source_revision !== sourceRevision) return { ok: false, error: "STALE_INPUT" };
  if (state && ["passed", "cancelled", "timed_out", "stale"].includes(state.status) && outcome !== "passed") return { ok: false, error: "ILLEGAL_TRANSITION" };
  const nextAttempt = (state?.attempt ?? 0) + 1;
  const record: EvidenceRecord = {
    attempt: nextAttempt, outcome: outcome as ExecutionOutcome, provenance,
    ordering_key: `${task.task_id}:${String(nextAttempt).padStart(8, "0")}`,
    recorded_at: new Date(0).toISOString(),
  };
  return {
    ok: true,
    state: {
      task_id: task.task_id, source_revision: sourceRevision, status: outcome as TaskStatus,
      attempt: nextAttempt, evidence: [...(state?.evidence ?? []), record],
    },
  };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: allow only revision-compatible resume and retain append-only evidence.
export function resumeExecution(state: ExecutionState | undefined, requestedRevision: string, allowCancellationRecovery = false):
  { ok: true; state: ExecutionState } | { ok: false; error: ExecutionError } {
  if (!state) return { ok: false, error: "UNKNOWN_TASK" };
  if (state.source_revision !== requestedRevision) return { ok: false, error: "STALE_INPUT" };
  if (state.status === "cancelled" && !allowCancellationRecovery) return { ok: false, error: "CANCELLATION_NOT_RESUMABLE" };
  return { ok: true, state: { ...state, status: "ready" } };
}

export class ExecutionStateStore {
  private readonly states = new Map<string, ExecutionState>();

  get(taskId: string): ExecutionState | undefined {
    const value = this.states.get(taskId);
    return value ? { ...value, evidence: [...value.evidence] } : undefined;
  }

  apply(task: TaskEntry, sourceRevision: string, outcome: ExecutionOutcome, provenance: string) {
    const result = applyExecutionOutcome(task, this.states.get(task.task_id), sourceRevision, outcome, provenance);
    if (result.ok) this.states.set(task.task_id, result.state);
    return result;
  }
}
