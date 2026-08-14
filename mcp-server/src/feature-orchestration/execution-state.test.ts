import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutionStateStore, applyExecutionOutcome, resumeExecution } from "./execution-state.js";
import type { TaskEntry } from "./task-graph.js";

const task = {
  task_id: "TASK-STATE",
  source_revision: "r1",
  status: "pending",
  depends_on: [],
  source_tokens: ["REQ-FEAT_TASK_EXECUTION_RECOVERY"],
  deliverables: [],
  test_level: "unit",
  parallel_group: null,
  evidence: { required: [], history: [] },
} as TaskEntry;

describe("execution recovery REQ-FEAT_TASK_EXECUTION_RECOVERY", () => {
  it("keeps task identity and appends retry evidence", () => {
    const store = new ExecutionStateStore();
    assert.equal(store.apply(task, "r1", "failed", "unit-1").ok, true);
    assert.equal(store.apply(task, "r1", "passed", "unit-2").ok, true);
    const state = store.get(task.task_id);
    assert.equal(state?.task_id, task.task_id);
    assert.deepEqual(state?.evidence.map((item) => item.outcome), ["failed", "passed"]);
  });

  it("rejects stale input and unsafe cancellation resume", () => {
    const stale = applyExecutionOutcome(task, undefined, "r2", "passed", "x");
    assert.equal(stale.ok, false);
    if (!stale.ok) assert.equal(stale.error, "STALE_INPUT");
    const state = { task_id: task.task_id, source_revision: "r1", status: "cancelled" as const, attempt: 1, evidence: [] };
    const cancelled = resumeExecution(state, "r1");
    assert.equal(cancelled.ok, false);
    if (!cancelled.ok) assert.equal(cancelled.error, "CANCELLATION_NOT_RESUMABLE");
    assert.equal(resumeExecution(state, "r1", true).ok, true);
  });
});
