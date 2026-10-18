/**
 * [REQ-TIED_BOUNDED_COMPOSITION] manifest → divergence report (UI-free composition).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildRequestEvidenceEnvelope } from "../request-evidence-envelope/build.js";
import { captureTrajectoryManifest } from "./trajectory-manifest.js";
import {
  analyzeTrajectoryDivergence,
  writeTrajectoryDivergenceReport,
} from "./divergence-analysis.js";
import { validatePilotBudget } from "./pilot-budget.js";

function seedProjectRoot(): { root: string; tiedBase: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-compose-"));
  fs.mkdirSync(path.join(root, "tied-project", "working", "REQ-TIED_BOUNDED_COMPOSITION", "evidence"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
  return { root, tiedBase: path.join(root, "tied-project") };
}

describe("manifest → analyzer → envelope discovery", () => {
  it("wires capture, divergence report, and envelope artifact kinds", async () => {
    const { root, tiedBase } = seedProjectRoot();
    const now = "2026-10-18T17:30:00.000Z";
    const budget = validatePilotBudget(
      {
        schema_version: "pilot-budget.v1",
        bounded_composition_opt_in: true,
        k: 2,
        mode: "parallel",
        seed: "s",
        run_namespace: "ns-compose",
        cost_ceiling: { max_units: 10 },
        stop_criteria: [{ kind: "budget_exhausted" }],
        rollout_budget: { max_units: 5 },
        improvement_stage_budget: { max_units: 3 },
        timeout_retry_policy: { timeout_ms: 1000, max_retries: 0 },
      },
      { bounded_composition_opt_in: true },
    );
    assert.equal(budget.ok, true);
    if (!budget.ok) return;

    const common = {
      project_root: root,
      tied_base_path: tiedBase,
      request_token: "REQ-TIED_BOUNDED_COMPOSITION",
      pilot_budget: budget.budget,
      adapter_id: "cursor",
      candidate_hash: "sha256:cand",
      provenance_ref: "inquiry:bc-preimpl-20261018",
      run_outcome: { exit_code: 0, outcome_hash: "sha256:same", tool_sequence_hashes: ["sha256:t1"] },
      local_raw_payload: { step: 1 },
    };

    try {
      const capA = captureTrajectoryManifest({ ...common, run_id: "run-1" }, { now });
      const capB = captureTrajectoryManifest(
        {
          ...common,
          run_id: "run-2",
          run_outcome: {
            exit_code: 1,
            outcome_hash: "sha256:other",
            tool_sequence_hashes: ["sha256:t1", "sha256:t2"],
          },
        },
        { now },
      );
      assert.equal(capA.ok, true);
      assert.equal(capB.ok, true);
      if (!capA.ok || !capB.ok) return;

      const analyzed = analyzeTrajectoryDivergence([capA.manifest, capB.manifest], { now });
      assert.equal(analyzed.ok, true);
      if (!analyzed.ok) return;
      writeTrajectoryDivergenceReport(root, "REQ-TIED_BOUNDED_COMPOSITION", analyzed.report);

      const built = await buildRequestEvidenceEnvelope({
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        project_root: root,
        tied_base_path: tiedBase,
        confirmed_tied_base_path: tiedBase,
        depth_tier: "integrated",
        gate_policy: "advisory",
      });
      assert.equal(built.ok, true);
      if (!built.ok) return;

      const kinds = new Set(built.envelope.artifacts.map((artifact) => artifact.kind));
      assert.ok(kinds.has("bounded_trajectory_manifest"));
      assert.ok(kinds.has("bounded_divergence_report"));
      const divergent = analyzed.report.contrast_rows.some((row) => row.status === "divergent");
      assert.equal(divergent, true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
