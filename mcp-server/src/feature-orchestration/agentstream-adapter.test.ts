import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutionStateStore } from "./execution-state.js";
import { buildTaskTurns, executeSchedule } from "./agentstream-adapter.js";
import type { TaskEntry } from "./task-graph.js";

const task = (id: string): TaskEntry => ({
  task_id: id, source_tokens: ["REQ-FEAT_AGENTSTREAM_ADAPTER"], depends_on: [], deliverables: [],
  test_level: "unit", parallel_group: "PG-1", status: "pending",
  evidence: { required: [], history: [] }, source_revision: "r1",
});

describe("agentstream adapter REQ-FEAT_AGENTSTREAM_ADAPTER", () => {
  it("uses the same turns for dry-run and live execution", async () => {
    const tasks = [task("TASK-A")];
    const readiness = { items: [{ task_id: "TASK-A", ready: true, reasons: [], evidence: [] }], parallel_groups: [["TASK-A"]], rejected_groups: [] };
    const built = buildTaskTurns(readiness, tasks);
    assert.equal(built.ok, true);
    if (!built.ok) return;
    const state = new ExecutionStateStore();
    const dry = await executeSchedule(built.turns, tasks, "dry-run", undefined, state, "r1");
    const live = await executeSchedule(built.turns, tasks, "live", async () => ({ outcome: "passed", provenance: "executor-double" }), state, "r1");
    assert.deepEqual(dry.ok && dry.turns, live.ok && live.turns);
    assert.equal(state.get("TASK-A")?.status, "passed");
  });

  it("delegates legacy feature-spec mode without changing ordering", () => {
    const legacy = buildTaskTurns({ items: [], parallel_groups: [], rejected_groups: [] }, [], {
      legacy_feature_spec: true,
      legacy_loader: () => [{ parts: ["first"], chainFromPrevious: false, task_ids: [] }, { parts: ["second"], chainFromPrevious: false, task_ids: [] }],
    });
    assert.equal(legacy.ok, true);
    if (legacy.ok) assert.deepEqual(legacy.turns.map((turn) => turn.parts[0]), ["first", "second"]);
  });
});
