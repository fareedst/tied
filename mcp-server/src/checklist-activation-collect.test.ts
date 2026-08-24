// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: inquiry → collect → gate composition proves activation assembly from phase directories.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { collectChecklistActivation } from "./checklist-activation-collect.js";
import {
  persistWorkingArtifacts,
  runChecklistInquiry,
  type ChecklistInquiryInput,
} from "./adversarial-inquiry/checklist-integration.js";
import { validateStrictEligibility } from "./adversarial-inquiry/workflow.js";
import { derivePhaseAwareSlugs, stableHash } from "./checklist-validator.js";
import { allTools } from "./tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

const REQUEST_TOKEN = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";
const BLOCK_ID = "IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#VALIDATE_CHECKLIST_GATE#069e46c522c9b57d";

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function inquiryInput(
  root: string,
  phase: "pre_implementation" | "verification" | "close_out",
  runId: string,
): ChecklistInquiryInput {
  return {
    graph: {
      projectId: "stdd-project",
      criteria: [{
        identity: {
          id: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT#criterion-1",
          kind: "criterion",
          derivation: "explicit",
          revision: "criterion-rev",
          sourceRevision: "source-rev",
        },
        architectureConstraintIds: ["constraint-1"],
      }],
      architectureConstraints: [{ id: "constraint-1", implementationBlockIds: [BLOCK_ID] }],
      implementationBlocks: [{
        identity: {
          id: BLOCK_ID,
          kind: "block",
          name: "VALIDATE_CHECKLIST_GATE",
          derivation: "content",
          revision: "block-rev",
          sourceRevision: "source-rev",
        },
      }],
      evidenceLoci: [],
    },
    fidelity: {
      blockRevision: "block-rev",
      specification: [{ id: "statement-1", kind: "behavior", value: "fail closed", order: 1 }],
      testEvidence: [],
      productionEvidence: [],
    },
    scope: [BLOCK_ID],
    policy: "advisory",
    repositoryRoot: root,
    requestToken: REQUEST_TOKEN,
    activation: { runId, phase },
    provenance: { runId, phase, scope: [BLOCK_ID] },
    eligibility: validateStrictEligibility({
      scope: [BLOCK_ID],
      blockingDetectors: ["fidelity"],
      negativeControls: ["fidelity"],
      boundedExecution: true,
      explicitProofBoundaries: true,
      falsePositiveHandling: true,
      waiversOwned: true,
      representativePilot: true,
    }),
  };
}

function integratedTracker(phase: "pre_implementation" | "verification" | "close_out") {
  return {
    steps: derivePhaseAwareSlugs("integrated", phase).map((slug) => ({
      slug,
      disposition: "completed",
      evidence_refs: ["checklist-activation-collect.test.ts"],
    })),
  };
}

function integratedCitdp(runId: string, phase: "verification" | "close_out") {
  return {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
      },
    },
    completion_criteria: {
      activation: {
        run_id: runId,
        phase,
        request_token: REQUEST_TOKEN,
      },
    },
  };
}

describe("collectChecklistActivation [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("fails closed when the phase directory is missing", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-missing-"));
    const result = await collectChecklistActivation({
      requestToken: REQUEST_TOKEN,
      phase: "verification",
      runId: "missing-phase-run",
      projectRoot: root,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("missing_phase_directory"));
  });

  it("fails closed when run_id does not match on-disk provenance", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-runid-"));
    const runId = "collect-run-provenance";
    const inquiry = await runChecklistInquiry(inquiryInput(root, "verification", runId));
    assert.equal(inquiry.ok, true);
    assert.ok(inquiry.activation);

    const result = await collectChecklistActivation({
      requestToken: REQUEST_TOKEN,
      phase: "verification",
      runId: "wrong-run-id",
      projectRoot: root,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("run_id_provenance_mismatch"));
  });

  it("collects activation from persisted phase artifacts", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-success-"));
    const runId = "collect-run-success";
    const inquiry = await runChecklistInquiry(inquiryInput(root, "pre_implementation", runId));
    assert.equal(inquiry.ok, true);
    assert.ok(inquiry.activation);

    const collected = await collectChecklistActivation({
      requestToken: REQUEST_TOKEN,
      phase: "pre_implementation",
      runId,
      projectRoot: root,
    });
    assert.equal(collected.ok, true);
    assert.deepEqual(collected.receipt?.artifact_hashes, inquiry.activation?.receipt.artifact_hashes);
    assert.equal(collected.expected?.run_id, runId);
    assert.match(
      collected.artifacts?.["obligation-report.json"]?.path ?? "",
      /phase-pre_implementation\/obligation-report\.json$/,
    );
  });
});

describe("tied_checklist_activation_collect composition [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("inquiry → collect → gate returns allowed: true", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-gate-"));
    const runId = "composition-gate-run";
    const phase = "verification" as const;

    const inquiry = await runChecklistInquiry(inquiryInput(root, phase, runId));
    assert.equal(inquiry.ok, true);

    const collectHandler = toolHandler("tied_checklist_activation_collect");
    const collected = JSON.parse((await collectHandler({
      request_token: REQUEST_TOKEN,
      phase,
      run_id: runId,
      project_root: root,
    })).content[0]?.text ?? "{}") as {
      ok?: boolean;
      receipt?: unknown;
      artifacts?: unknown;
      expected?: unknown;
    };
    assert.equal(collected.ok, true);
    assert.ok(collected.receipt);
    assert.ok(collected.artifacts);
    assert.ok(collected.expected);

    const gateHandler = toolHandler("tied_checklist_gate_validate");
    const gate = JSON.parse((await gateHandler({
      phase,
      tracker: integratedTracker(phase),
      citdp: integratedCitdp(runId, phase),
      activation: {
        receipt: collected.receipt,
        artifacts: collected.artifacts,
        expected: collected.expected,
      },
    })).content[0]?.text ?? "{}") as { allowed?: boolean; diagnostics?: string[] };

    assert.equal(gate.allowed, true, gate.diagnostics?.join(", "));
  });

  it("wrong run_id fails before gate pairing succeeds", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-wrong-run-"));
    const runId = "composition-wrong-run";
    await runChecklistInquiry(inquiryInput(root, "verification", runId));

    const collectHandler = toolHandler("tied_checklist_activation_collect");
    const collected = JSON.parse((await collectHandler({
      request_token: REQUEST_TOKEN,
      phase: "verification",
      run_id: "not-the-same-run",
      project_root: root,
    })).content[0]?.text ?? "{}") as { ok?: boolean; diagnostics?: string[] };

    assert.equal(collected.ok, false);
    assert.ok(collected.diagnostics?.includes("run_id_provenance_mismatch"));
  });

  it("supports optional metrics lookup without blocking success", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "activation-collect-metrics-"));
    const runId = "metrics-support-run";
    await persistWorkingArtifacts({
      repositoryRoot: root,
      requestToken: REQUEST_TOKEN,
      phase: "verification",
      report: {
        schemaVersion: "adversarial-inquiry-report.v1",
        projectId: "stdd-project",
        scope: [BLOCK_ID],
        graph: { projectId: "stdd-project", nodes: [], edges: [] },
        findings: [],
        proofBoundaries: ["semantic_fidelity"],
        readOnly: true,
        canonicalMutation: false,
      },
      ledger: { findings: [], duplicateLinks: [] },
      gate: {
        schemaVersion: "adversarial-inquiry-gate.v1",
        policy: "advisory",
        scope: [BLOCK_ID],
        status: "warn",
        blocking: false,
        verdict: "PASS",
        diagnostics: [],
        proofBoundary: "human_decision",
      },
      provenance: {
        runId,
        phase: "verification",
        scope: [BLOCK_ID],
      },
    });

    const metricsPath = path.join(root, "metrics.jsonl");
    fs.writeFileSync(metricsPath, `${JSON.stringify({
      v: 1,
      tool: "tied_config_get_base_path",
      args_summary: {},
    })}\n`, "utf8");

    const missingMetrics = await collectChecklistActivation({
      requestToken: REQUEST_TOKEN,
      phase: "verification",
      runId,
      projectRoot: root,
      metricsPath,
    });
    assert.equal(missingMetrics.ok, true);
    assert.equal(missingMetrics.metrics_match, false);
    assert.ok(missingMetrics.diagnostics.includes("metrics_run_id_not_found"));

    fs.appendFileSync(metricsPath, `${JSON.stringify({
      v: 1,
      tool: "tied_adversarial_inquiry_run",
      args_summary: { run_id: runId, request_token: REQUEST_TOKEN },
    })}\n`, "utf8");

    const matchedMetrics = await collectChecklistActivation({
      requestToken: REQUEST_TOKEN,
      phase: "verification",
      runId,
      projectRoot: root,
      metricsPath,
    });
    assert.equal(matchedMetrics.ok, true);
    assert.equal(matchedMetrics.metrics_match, true);
    assert.equal(matchedMetrics.expected?.scope_hash, stableHash([BLOCK_ID]));
  });
});
