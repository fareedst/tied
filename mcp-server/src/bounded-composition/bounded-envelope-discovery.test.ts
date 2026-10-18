/**
 * [REQ-TIED_BOUNDED_COMPOSITION] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * budget validate → envelope artifact discovery (UI-free composition).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildRequestEvidenceEnvelope } from "../request-evidence-envelope/build.js";
import { validatePilotBudget } from "./pilot-budget.js";

function seedDividedWorkingRoot(tempRoot: string, requestToken: string): string {
  fs.mkdirSync(path.join(tempRoot, "tied-project", "working", requestToken, "evidence"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(tempRoot, "tied-bundle", "working"), { recursive: true });
  fs.writeFileSync(
    path.join(tempRoot, "tied-project", "requirements.yaml"),
    "requirements: {}\n",
    "utf8",
  );
  return path.join(tempRoot, "tied-project");
}

describe("bounded composition envelope discovery", () => {
  it("discovers bounded pilot budget artifact in evidence/", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bc-env-"));
    const requestToken = "REQ-TIED_BOUNDED_COMPOSITION";
    const tiedBase = seedDividedWorkingRoot(tempRoot, requestToken);
    const budgetDoc = {
      schema_version: "pilot-budget.v1",
      bounded_composition_opt_in: true,
      k: 2,
      mode: "sequential",
      seed: "s1",
      run_namespace: "ns-compose",
      cost_ceiling: { max_units: 10 },
      stop_criteria: [{ kind: "budget_exhausted" }],
      rollout_budget: { max_units: 5 },
      improvement_stage_budget: { max_units: 3 },
      timeout_retry_policy: { timeout_ms: 1000, max_retries: 0 },
    };
    const validated = validatePilotBudget(budgetDoc, { bounded_composition_opt_in: true });
    assert.equal(validated.ok, true);
    const evidencePath = path.join(
      tempRoot,
      "tied-project",
      "working",
      requestToken,
      "evidence",
      "bounded-pilot-budget.v1.json",
    );
    fs.writeFileSync(evidencePath, JSON.stringify(budgetDoc, null, 2), "utf8");

    try {
      const built = await buildRequestEvidenceEnvelope({
        request_token: requestToken,
        project_root: tempRoot,
        tied_base_path: tiedBase,
        confirmed_tied_base_path: tiedBase,
        depth_tier: "integrated",
        gate_policy: "advisory",
      });
      assert.equal(built.ok, true);
      if (!built.ok) return;
      const artifact = built.envelope.artifacts.find((a) => a.kind === "bounded_pilot_budget");
      assert.ok(artifact);
      assert.equal(artifact?.schema_version, "pilot-budget.v1");
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
