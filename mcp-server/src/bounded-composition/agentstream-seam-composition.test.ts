/**
 * [REQ-TIED_BOUNDED_COMPOSITION] schedule → injected driver → trajectory manifest.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { executeBoundedScheduleToTrajectory } from "./agentstream-seam.js";
import { validatePilotBudget } from "./pilot-budget.js";

function seedProjectRoot(): { root: string; tiedBase: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-agentstream-"));
  fs.mkdirSync(path.join(root, "tied-project", "working", "REQ-TIED_BOUNDED_COMPOSITION", "evidence"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
  return { root, tiedBase: path.join(root, "tied-project") };
}

const task = (id: string) => ({
  task_id: id,
  source_tokens: ["REQ-TIED_BOUNDED_COMPOSITION"],
  depends_on: [],
  deliverables: [],
  test_level: "unit" as const,
  parallel_group: "PG-1",
  status: "pending" as const,
  evidence: { required: [], history: [] },
  source_revision: "r1",
});

describe("bounded agentstream schedule → trajectory composition", () => {
  it("preserves dry-run/live turn parity and captures manifest provenance", async () => {
    const { root, tiedBase } = seedProjectRoot();
    const now = "2026-10-18T19:00:00.000Z";
    const budget = validatePilotBudget(
      {
        schema_version: "pilot-budget.v1",
        bounded_composition_opt_in: true,
        k: 1,
        mode: "sequential",
        seed: "seed-as",
        run_namespace: "ns-agentstream",
        cost_ceiling: { max_units: 5 },
        stop_criteria: [{ kind: "budget_exhausted" }],
        rollout_budget: { max_units: 2 },
        improvement_stage_budget: { max_units: 1 },
        timeout_retry_policy: { timeout_ms: 1000, max_retries: 0 },
      },
      { bounded_composition_opt_in: true },
    );
    assert.equal(budget.ok, true);
    if (!budget.ok) return;

    const tasks = [task("TASK-A")];
    const readiness = {
      items: [{ task_id: "TASK-A", ready: true, reasons: [], evidence: [] }],
      parallel_groups: [["TASK-A"]],
      rejected_groups: [],
    };

    const commonInput = {
      project_root: root,
      tied_base_path: tiedBase,
      request_token: "REQ-TIED_BOUNDED_COMPOSITION",
      pilot_budget: budget.budget,
      run_id: "run-agentstream-1",
      candidate_hash: "sha256:candidate",
      readiness,
      tasks,
      driver_request: { kind: "builtin" as const, profile: "dry_run" as const },
      schedule_context: {
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        source_revision: "r1",
        provenance_carry_forward: ["inquiry:bc-preimpl-20261018"],
      },
      local_raw_payload: { turn: 1 },
      now,
    };

    try {
      const dry = await executeBoundedScheduleToTrajectory({
        ...commonInput,
        dry_run: true,
      });
      const live = await executeBoundedScheduleToTrajectory({
        ...commonInput,
        dry_run: false,
        run_id: "run-agentstream-2",
        driver_request: {
          kind: "client_descriptor",
          adapter_id: "parity-double",
          oee_compatibility_ref: "oee:compat/parity-double",
          live_external_approved: true,
        },
        deps: {
          clientDriverFactory: () => ({
            runTurn: async () => ({
              exit_code: 0,
              session_id: "parity-session",
              provenance_ref: "agentstream:client:parity-double",
            }),
          }),
        },
      });
      assert.equal(dry.ok, true);
      assert.equal(live.ok, true);
      if (!dry.ok || !live.ok) return;
      assert.deepEqual(dry.schedule.turns, live.schedule.turns);
      assert.ok(dry.manifest.provenance_refs.some((ref) => ref.includes("agentstream")));
      assert.ok(live.manifest.provenance_refs.some((ref) => ref.includes("agentstream")));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("stops schedule dependents when injected driver fails", async () => {
    const { root, tiedBase } = seedProjectRoot();
    const budget = validatePilotBudget(
      {
        schema_version: "pilot-budget.v1",
        bounded_composition_opt_in: true,
        k: 1,
        mode: "sequential",
        seed: "seed-fail",
        run_namespace: "ns-fail",
        cost_ceiling: { max_units: 5 },
        stop_criteria: [{ kind: "budget_exhausted" }],
        rollout_budget: { max_units: 2 },
        improvement_stage_budget: { max_units: 1 },
        timeout_retry_policy: { timeout_ms: 1000, max_retries: 0 },
      },
      { bounded_composition_opt_in: true },
    );
    assert.equal(budget.ok, true);
    if (!budget.ok) return;

    const tasks = [task("TASK-A"), task("TASK-B")];
    const readiness = {
      items: [
        { task_id: "TASK-A", ready: true, reasons: [], evidence: [] },
        { task_id: "TASK-B", ready: true, reasons: [], evidence: [] },
      ],
      parallel_groups: [["TASK-A"], ["TASK-B"]],
      rejected_groups: [],
    };

    try {
      const result = await executeBoundedScheduleToTrajectory({
        project_root: root,
        tied_base_path: tiedBase,
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        pilot_budget: budget.budget,
        run_id: "run-fail",
        candidate_hash: "sha256:candidate",
        readiness,
        tasks,
        dry_run: false,
        driver_request: {
          kind: "client_descriptor",
          adapter_id: "fail-driver",
          oee_compatibility_ref: "oee:compat/fail",
          live_external_approved: true,
        },
        schedule_context: {
          request_token: "REQ-TIED_BOUNDED_COMPOSITION",
          source_revision: "r1",
        },
        local_raw_payload: { turn: 1 },
        deps: {
          clientDriverFactory: () => ({
            runTurn: async () => ({
              exit_code: 1,
              session_id: "fail",
              provenance_ref: "client-driver:fail",
            }),
          }),
        },
      });
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.error.code, "DriverLaunchFailure");
      assert.equal(result.schedule_outcomes.length, 1);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
