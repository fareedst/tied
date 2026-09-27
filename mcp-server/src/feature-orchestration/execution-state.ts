import type { EvidenceRecord, TaskEntry, TaskStatus } from "./task-graph.js";

export type ExecutionOutcome = "passed" | "failed" | "cancelled" | "timed_out" | "stale";
export interface ExecutionState {
  task_id: string;
  source_revision: string;
  status: TaskStatus;
  attempt: number;
  evidence: EvidenceRecord[];
  unknown_outcome_reason?: string;
  dependents_locked?: boolean;
}

export type ExecutionError =
  | "UNKNOWN_TASK"
  | "INVALID_OUTCOME"
  | "STALE_INPUT"
  | "ILLEGAL_TRANSITION"
  | "CANCELLATION_NOT_RESUMABLE"
  | "EVIDENCE_DUPLICATE_REJECTED"
  | "DUPLICATE_DELIVERY_RECORDED"
  | "STORE_WRITE_FAILED"
  | "STORE_UNAVAILABLE"
  | "SCHEMA_VERSION_MISMATCH"
  | "OVERRIDE_REJECTED";

export type ExecutionPersistenceAdapter = {
  write(taskId: string, state: ExecutionState): { ok: true } | { ok: false; error: "STORE_WRITE_FAILED" | "STORE_UNAVAILABLE" };
};

export interface AppendEvidenceInput {
  attempt_key: string;
  idempotency_key?: string;
  outcome: ExecutionOutcome;
  provenance: string;
  record_schema_version?: number;
  expected_schema_version?: number;
}

export interface DependencyEvaluation {
  unlocked: string[];
  locked: string[];
}

function evidenceAttemptKeys(state: ExecutionState | undefined): Set<string> {
  const keys = new Set<string>();
  for (const row of state?.evidence ?? []) {
    if (row.attempt_key) keys.add(row.attempt_key);
  }
  return keys;
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: append deduplicated evidence; reject duplicate logical attempts (S-T12) and record redelivery without forking identity (S-T01).
export function appendEvidence(
  task: TaskEntry,
  state: ExecutionState | undefined,
  sourceRevision: string,
  input: AppendEvidenceInput,
  persistence?: ExecutionPersistenceAdapter,
): { ok: true; state: ExecutionState; evidence: EvidenceRecord; duplicate_delivery?: boolean } | { ok: false; error: ExecutionError } {
  if (!task?.task_id) return { ok: false, error: "UNKNOWN_TASK" };
  if (!input.attempt_key.trim()) return { ok: false, error: "INVALID_OUTCOME" };
  if (task.source_revision !== sourceRevision || (state && state.source_revision !== sourceRevision)) {
    return { ok: false, error: "STALE_INPUT" };
  }
  if (!["passed", "failed", "cancelled", "timed_out", "stale"].includes(input.outcome)) {
    return { ok: false, error: "INVALID_OUTCOME" };
  }
  if (
    input.record_schema_version !== undefined
    && input.expected_schema_version !== undefined
    && input.record_schema_version !== input.expected_schema_version
  ) {
    return { ok: false, error: "SCHEMA_VERSION_MISMATCH" };
  }
  const priorKeys = evidenceAttemptKeys(state);
  const redeliveryKey = input.idempotency_key?.trim();
  if (redeliveryKey) {
    const prior = state?.evidence.find((row) => row.idempotency_key === redeliveryKey);
    if (prior && state) {
      return { ok: true, duplicate_delivery: true, evidence: prior, state };
    }
  }
  if (priorKeys.has(input.attempt_key)) {
    return { ok: false, error: "EVIDENCE_DUPLICATE_REJECTED" };
  }
  const nextAttempt = (state?.attempt ?? 0) + 1;
  const record: EvidenceRecord = {
    attempt: nextAttempt,
    outcome: input.outcome,
    provenance: input.provenance,
    ordering_key: `${task.task_id}:${String(nextAttempt).padStart(8, "0")}`,
    recorded_at: new Date(0).toISOString(),
    attempt_key: input.attempt_key,
    idempotency_key: redeliveryKey,
  };
  const nextState: ExecutionState = {
    task_id: task.task_id,
    source_revision: sourceRevision,
    status: input.outcome,
    attempt: nextAttempt,
    evidence: [...(state?.evidence ?? []), record],
  };
  if (persistence) {
    const persisted = persistence.write(task.task_id, nextState);
    if (!persisted.ok) return { ok: false, error: persisted.error };
  }
  return { ok: true, state: nextState, evidence: record };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: unlock dependents only when predecessor satisfies completion predicate from authoritative store order (S-T05).
export function evaluateDependencies(
  predecessorTaskId: string,
  predecessorState: ExecutionState,
  dependents: Array<Pick<TaskEntry, "task_id" | "depends_on">>,
  storeCompletionOrder: string[],
): DependencyEvaluation {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const predecessorComplete = predecessorState.status === "passed";
  const predecessorIndex = storeCompletionOrder.indexOf(predecessorTaskId);
  for (const dependent of dependents) {
    if (!dependent.depends_on.includes(predecessorTaskId)) continue;
    if (!predecessorComplete) {
      locked.push(dependent.task_id);
      continue;
    }
    const allPredecessorsComplete = dependent.depends_on.every((depId) => {
      const idx = storeCompletionOrder.indexOf(depId);
      if (idx < 0) return false;
      if (depId === predecessorTaskId) return predecessorComplete;
      return predecessorIndex >= 0 && idx <= predecessorIndex;
    });
    if (allPredecessorsComplete) unlocked.push(dependent.task_id);
    else locked.push(dependent.task_id);
  }
  return { unlocked: unlocked.sort(), locked: locked.sort() };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: bounded retries exhaust to stable terminal failed state; dependents stay locked (S-T14).
export function recordTerminalFailureAfterMaxRetries(
  state: ExecutionState | undefined,
  retryCount: number,
  maxRetries: number,
): { ok: true; state: ExecutionState; terminal: boolean } | { ok: false; error: "UNKNOWN_TASK" } {
  if (!state) return { ok: false, error: "UNKNOWN_TASK" };
  if (retryCount < maxRetries) {
    return { ok: true, terminal: false, state: { ...state, status: "ready", dependents_locked: false } };
  }
  return {
    ok: true,
    terminal: true,
    state: { ...state, status: "failed", dependents_locked: true },
  };
}

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
  const attemptKey = `${task.task_id}:attempt:${(state?.attempt ?? 0) + 1}`;
  const appended = appendEvidence(task, state, sourceRevision, {
    attempt_key: attemptKey,
    outcome: outcome as ExecutionOutcome,
    provenance,
  });
  if (!appended.ok) return appended;
  return { ok: true, state: appended.state };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: allow only revision-compatible resume and retain append-only evidence; unknown-outcome retry stays resumable (S-T04).
export function resumeExecution(
  state: ExecutionState | undefined,
  requestedRevision: string,
  allowCancellationRecovery = false,
  unknownOutcomeFlag = false,
): { ok: true; state: ExecutionState } | { ok: false; error: ExecutionError } {
  if (!state) return { ok: false, error: "UNKNOWN_TASK" };
  if (state.source_revision !== requestedRevision) return { ok: false, error: "STALE_INPUT" };
  if (state.status === "cancelled" && !allowCancellationRecovery) return { ok: false, error: "CANCELLATION_NOT_RESUMABLE" };
  const next: ExecutionState = { ...state, status: "ready" };
  if (unknownOutcomeFlag) {
    next.unknown_outcome_reason = "UNKNOWN_OUTCOME_RETRY";
    next.status = "running";
  }
  return { ok: true, state: next };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: reject incompatible record schema versions (S-T09).
export function validateRecordVersion(recordVersion: number, expectedVersion: number): { ok: true } | { ok: false; error: "SCHEMA_VERSION_MISMATCH" } {
  if (recordVersion !== expectedVersion) return { ok: false, error: "SCHEMA_VERSION_MISMATCH" };
  return { ok: true };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: throttle retry storms without duplicate side effects (S-T11).
export function applyRetryStormBackpressure(
  inflightRetries: number,
  maxInflight: number,
  lockWaitMs: number,
  maxLockWaitMs: number,
): "proceed" | "throttle_retryable" {
  if (inflightRetries >= maxInflight || lockWaitMs > maxLockWaitMs) return "throttle_retryable";
  return "proceed";
}

export interface ExecutionStatusView {
  status: TaskStatus;
  stale_lag: boolean;
  read_token: number;
  store_write_token: number;
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: bounded staleness under partition (S-T16).
export function readExecutionStatusWithConsistency(
  state: ExecutionState,
  readToken: number,
  storeWriteToken: number,
  partitionActive: boolean,
): ExecutionStatusView {
  const staleLag = partitionActive || readToken < storeWriteToken;
  return {
    status: state.status,
    stale_lag: staleLag,
    read_token: readToken,
    store_write_token: storeWriteToken,
  };
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: audited override or hard reject (S-O02).
export function validateOperatorOverride(
  policyAllows: boolean,
  auditChannelReady: boolean,
): { ok: true; audited: true } | { ok: false; error: "OVERRIDE_REJECTED" } {
  if (!policyAllows || !auditChannelReady) return { ok: false, error: "OVERRIDE_REJECTED" };
  return { ok: true, audited: true };
}

export interface BlastRadiusPreview {
  target_task_ids: string[];
  locked_dependents: string[];
  requires_explicit_confirm: true;
}

// [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: preview bulk cancel blast radius (S-O06).
export function previewBulkCancelBlastRadius(
  targetTaskIds: string[],
  dependencyGraph: Record<string, string[]>,
): BlastRadiusPreview {
  const locked = new Set<string>();
  for (const target of targetTaskIds) {
    for (const [taskId, deps] of Object.entries(dependencyGraph)) {
      if (deps.includes(target)) locked.add(taskId);
    }
  }
  return {
    target_task_ids: [...targetTaskIds],
    locked_dependents: [...locked].sort(),
    requires_explicit_confirm: true,
  };
}

export class ExecutionStateStore {
  private readonly states = new Map<string, ExecutionState>();
  private readonly persistence?: ExecutionPersistenceAdapter;

  constructor(options: { persistence?: ExecutionPersistenceAdapter } = {}) {
    this.persistence = options.persistence;
  }

  get(taskId: string): ExecutionState | undefined {
    const value = this.states.get(taskId);
    return value ? { ...value, evidence: [...value.evidence] } : undefined;
  }

  apply(task: TaskEntry, sourceRevision: string, outcome: ExecutionOutcome, provenance: string) {
    const result = applyExecutionOutcome(task, this.states.get(task.task_id), sourceRevision, outcome, provenance);
    if (result.ok) this.states.set(task.task_id, result.state);
    return result;
  }

  append(task: TaskEntry, sourceRevision: string, input: AppendEvidenceInput) {
    const result = appendEvidence(task, this.states.get(task.task_id), sourceRevision, input, this.persistence);
    if (result.ok && !result.duplicate_delivery) this.states.set(task.task_id, result.state);
    return result;
  }
}
