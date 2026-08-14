import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveTaskGraph, projectReadiness, validateTaskGraph, type TaskEntry } from "./task-graph.js";

const source = {
  source_revision: "feature:7",
  requirements: [{ token: "REQ-FEAT_TASK_DERIVATION", acceptance_criteria: [{ id: "stable", text: "stable output" }] }],
  architectures: [{ token: "ARCH-FEAT_TASK_DERIVATION_BOUNDARY", boundaries: [{ id: "projection", contract: "task graph projection" }] }],
  implementations: [{ token: "IMPL-FEAT_TASK_DERIVATION", blocks: [{ name: "DERIVE_TASK_GRAPH" }] }],
  clarification_ready: true,
  constitution_compliant: true,
  quality_profiles: ["baseline-functional", "stateful-reliability"],
};

describe("task derivation REQ-FEAT_TASK_DERIVATION", () => {
  it("is stable for equivalent canonical inputs", () => {
    const first = deriveTaskGraph(source);
    const second = deriveTaskGraph({ ...source, requirements: [...source.requirements] });
    assert.deepEqual(first, second);
    assert.equal(first.ok, true);
    if (first.ok) assert.match(first.projection.tasks[0].task_id, /^TASK-[A-F0-9]{12}$/);
  });

  it("rejects a blocked source before publishing a graph", () => {
    const result = deriveTaskGraph({ ...source, clarification_ready: false });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "BLOCKED_READINESS");
  });
});

describe("task graph scheduling REQ-FEAT_TASK_GRAPH_SCHEDULING", () => {
  it("detects cycles deterministically", () => {
    const a = { task_id: "TASK-A", depends_on: ["TASK-B"] } as TaskEntry;
    const b = { task_id: "TASK-B", depends_on: ["TASK-A"] } as TaskEntry;
    assert.deepEqual(validateTaskGraph([b, a]), validateTaskGraph([a, b]));
    const result = validateTaskGraph([a, b]);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "CYCLE_DETECTED");
  });

  it("reports dependency blockers instead of inferring readiness", () => {
    const task = {
      task_id: "TASK-A", depends_on: ["TASK-B"], source_revision: "r", status: "pending",
      source_tokens: [], test_level: "unit", parallel_group: null, deliverables: [],
      evidence: { required: [], history: [] },
    } as TaskEntry;
    const result = projectReadiness([task], { source_revision: "r" });
    assert.equal(result.items[0].ready, false);
    assert.deepEqual(result.items[0].reasons, ["DEPENDENCY_UNSATISFIED:TASK-B"]);
  });
});
