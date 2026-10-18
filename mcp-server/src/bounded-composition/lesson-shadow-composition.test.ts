/**
 * [REQ-TIED_BOUNDED_COMPOSITION] divergence → lesson drafts; shadow advisory; gate authority unchanged.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { validateChecklistGate } from "../checklist-validator.js";
import { buildRequestEvidenceEnvelope } from "../request-evidence-envelope/build.js";
import { analyzeTrajectoryDivergence } from "./divergence-analysis.js";
import { distillTrajectoryLessons, writeTrajectoryLessonDraftReport } from "./lesson-distillation.js";
import { validatePilotBudget } from "./pilot-budget.js";
import { runShadowComparison, writeShadowComparisonReport } from "./shadow-comparison.js";
import { captureTrajectoryManifest } from "./trajectory-manifest.js";

function seedProjectRoot(): { root: string; tiedBase: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-lesson-shadow-"));
  fs.mkdirSync(path.join(root, "tied-project", "working", "REQ-TIED_BOUNDED_COMPOSITION", "evidence"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
  return { root, tiedBase: path.join(root, "tied-project") };
}

const gateFixture = {
  tracker: {
    steps: [
      {
        slug: "traceable-commit",
        disposition: "completed",
        evidence_refs: ["lesson-shadow-composition.test.ts"],
      },
      {
        slug: "sub-adversarial-inquiry-pass",
        disposition: "not_applicable",
        policy: "minimal-depth-no-inquiry",
        rationale: "Bounded composition gate regression fixture.",
      },
    ],
  },
  citdp: {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "minimal",
        counterexamples: ["shadow output mutates tracker"],
        falsification_questions: ["Does shadow comparison pass a gate?"],
        disconfirming_observations: ["gate disposition unchanged"],
        evidence_references: ["lesson-shadow-composition.test.ts"],
      },
    },
  },
};

describe("lesson + shadow composition", () => {
  it("wires divergence → lesson drafts and envelope discovery without feedback writes", async () => {
    const { root, tiedBase } = seedProjectRoot();
    const now = "2026-10-18T18:30:00.000Z";
    const budget = validatePilotBudget(
      {
        schema_version: "pilot-budget.v1",
        bounded_composition_opt_in: true,
        k: 2,
        mode: "parallel",
        seed: "s",
        run_namespace: "ns-lesson",
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

      const distilled = distillTrajectoryLessons(analyzed.report, {
        expected_report_hash: analyzed.report.content_hash,
        denominators_present: false,
      });
      assert.equal(distilled.ok, true);
      if (!distilled.ok) return;
      writeTrajectoryLessonDraftReport(root, "REQ-TIED_BOUNDED_COMPOSITION", distilled.bundle.report);

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
      assert.ok(kinds.has("bounded_lesson_draft_report"));
      assert.equal(distilled.bundle.report.feedback_draft.type, "methodology_improvement");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps checklist gate disposition unchanged after shadow comparison output", () => {
    const now = "2026-10-18T18:30:00.000Z";
    const manifests = [
      {
        schema_version: "trajectory-manifest.v1" as const,
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        run_id: "run-a",
        run_namespace: "ns",
        budget_seed: "seed",
        adapter_id: "cursor",
        harness_id: null,
        candidate_hash: "sha256:c1",
        exit_code: 0,
        outcome_hash: "sha256:o-a",
        tool_sequence_hashes: ["sha256:t1"],
        truncated_summary: null,
        truncated: false,
        provenance_refs: ["prov"],
        local_raw_refs: ["local"],
        local_raw_content_hash: "sha256:raw",
        privacy_tier: "operator_local" as const,
        proof_boundaries: [],
        captured_at: now,
      },
      {
        schema_version: "trajectory-manifest.v1" as const,
        request_token: "REQ-TIED_BOUNDED_COMPOSITION",
        run_id: "run-b",
        run_namespace: "ns",
        budget_seed: "seed",
        adapter_id: "cursor",
        harness_id: null,
        candidate_hash: "sha256:c2",
        exit_code: 0,
        outcome_hash: "sha256:o-b",
        tool_sequence_hashes: ["sha256:t1"],
        truncated_summary: null,
        truncated: false,
        provenance_refs: ["prov"],
        local_raw_refs: ["local"],
        local_raw_content_hash: "sha256:raw",
        privacy_tier: "operator_local" as const,
        proof_boundaries: [],
        captured_at: now,
      },
    ];

    const before = validateChecklistGate({ phase: "close_out", ...gateFixture });
    const shadow = runShadowComparison(manifests, {
      shadow_opt_in: true,
      budget: { bounded_composition_opt_in: true, cost_spent_units: 0, cost_ceiling_max_units: 5 },
      emit_advisory_recommendation: true,
      now,
    });
    assert.equal(shadow.ok, true);
    const after = validateChecklistGate({ phase: "close_out", ...gateFixture });
    assert.equal(before.allowed, after.allowed);
    assert.equal(before.allowed, true);
    if (!shadow.ok) return;
    assert.equal(shadow.report.selection_authority, "none");
    assert.equal(shadow.report.gate_authority_unchanged, true);

    const { root } = seedProjectRoot();
    try {
      writeShadowComparisonReport(root, "REQ-TIED_BOUNDED_COMPOSITION", shadow.report);
      const evidenceDir = path.join(
        root,
        "tied-project",
        "working",
        "REQ-TIED_BOUNDED_COMPOSITION",
        "evidence",
      );
      const files = fs.readdirSync(evidenceDir);
      assert.ok(files.some((name) => name.includes("bounded-shadow-comparison")));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
