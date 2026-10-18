/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { captureTrajectoryManifest } from "./trajectory-manifest.js";
import { validatePilotBudget } from "./pilot-budget.js";

function seedProjectRoot(): { root: string; tiedBase: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-manifest-"));
  fs.mkdirSync(path.join(root, "tied-project", "working"), { recursive: true });
  fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
  return { root, tiedBase: path.join(root, "tied-project") };
}

function sampleBudget() {
  const validated = validatePilotBudget(
    {
      schema_version: "pilot-budget.v1",
      bounded_composition_opt_in: true,
      k: 2,
      mode: "parallel",
      seed: "seed-1",
      run_namespace: "ns-1",
      cost_ceiling: { max_units: 10 },
      stop_criteria: [{ kind: "max_failures", threshold: 1 }],
      rollout_budget: { max_units: 5 },
      improvement_stage_budget: { max_units: 3 },
      timeout_retry_policy: { timeout_ms: 1000, max_retries: 0 },
    },
    { bounded_composition_opt_in: true },
  );
  assert.equal(validated.ok, true);
  return validated.ok ? validated.budget : null;
}

describe("captureTrajectoryManifest", () => {
  it("writes local raw payload and compact committed manifest", () => {
    const { root, tiedBase } = seedProjectRoot();
    const budget = sampleBudget();
    assert.ok(budget);
    try {
      const result = captureTrajectoryManifest(
        {
          project_root: root,
          tied_base_path: tiedBase,
          request_token: "REQ-TIED_BOUNDED_COMPOSITION",
          pilot_budget: budget,
          run_id: "run-a",
          adapter_id: "cursor",
          candidate_hash: "sha256:abc",
          provenance_ref: "gate:pre_implementation:bc-preimpl-20261018",
          run_outcome: {
            exit_code: 0,
            outcome_hash: "sha256:out-a",
            tool_sequence_hashes: ["sha256:t1", "sha256:t2"],
            truncated_summary: "ok",
          },
          local_raw_payload: { steps: 2, note: "bounded summary only" },
        },
        { now: "2026-10-18T17:00:00.000Z" },
      );
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.ok(result.local_raw_relative_path.includes("trajectories/run-a/payload.json"));
      assert.ok(result.manifest_relative_path?.includes("bounded-trajectory-manifest-run-a"));
      assert.equal(result.manifest.prompt_body, undefined);
      const manifestRaw = JSON.stringify(result.manifest);
      assert.ok(!manifestRaw.includes("bounded summary only"));
      assert.ok(fs.existsSync(path.join(root, result.local_raw_relative_path)));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects wrong TIED base path without writes", () => {
    const { root, tiedBase } = seedProjectRoot();
    const budget = sampleBudget();
    assert.ok(budget);
    const wrongBase = path.join(root, "wrong-tied-project");
    try {
      const result = captureTrajectoryManifest({
        project_root: root,
        tied_base_path: wrongBase,
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        pilot_budget: budget,
        run_id: "run-b",
        adapter_id: "cursor",
        candidate_hash: "sha256:abc",
        provenance_ref: "prov-1",
        run_outcome: { exit_code: 0, outcome_hash: "sha256:o" },
        local_raw_payload: {},
      });
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.error.code, "WrongBasePath");
      assert.equal(
        fs.existsSync(
          path.join(root, "tied-bundle", "working", "REQ-TIED_BOUNDED_COMPOSITION", "trajectories"),
        ),
        false,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails privacy redaction on forbidden prompt_body in outcome", () => {
    const { root, tiedBase } = seedProjectRoot();
    const budget = sampleBudget();
    assert.ok(budget);
    try {
      const result = captureTrajectoryManifest({
        project_root: root,
        tied_base_path: tiedBase,
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        pilot_budget: budget,
        run_id: "run-c",
        adapter_id: "cursor",
        candidate_hash: "sha256:abc",
        provenance_ref: "prov-1",
        run_outcome: { exit_code: 0, outcome_hash: "sha256:o", prompt_body: "secret" } as never,
        local_raw_payload: {},
      });
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.error.code, "PrivacyRedactionFailure");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects duplicate run_id", () => {
    const { root, tiedBase } = seedProjectRoot();
    const budget = sampleBudget();
    assert.ok(budget);
    const baseInput = {
      project_root: root,
      tied_base_path: tiedBase,
      request_token: "REQ-TIED_BOUNDED_COMPOSITION",
      pilot_budget: budget,
      run_id: "run-dup",
      adapter_id: "cursor",
      candidate_hash: "sha256:abc",
      provenance_ref: "prov-1",
      run_outcome: { exit_code: 0, outcome_hash: "sha256:o" },
      local_raw_payload: { a: 1 },
    };
    try {
      assert.equal(captureTrajectoryManifest(baseInput).ok, true);
      const second = captureTrajectoryManifest(baseInput);
      assert.equal(second.ok, false);
      if (second.ok) return;
      assert.equal(second.error.code, "DuplicateRunId");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
