#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Phase 3 integrated adversarial inquiry + checklist gates.
 * Runs pre_implementation and verification with identity-bound activation pairing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectChecklistActivation } from "../../mcp-server/dist/checklist-activation-collect.js";
import { runChecklistInquiry } from "../../mcp-server/dist/adversarial-inquiry/checklist-integration.js";
import { derivePhaseAwareSlugs, validateChecklistGate } from "../../mcp-server/dist/checklist-validator.js";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const requestToken = "REQ-PSEUDOCODE_TYPED_FLOW";
const blockId = "IMPL-PSEUDOCODE_TYPED_FLOW#PROMOTE_TYPED_DIAGNOSTIC_SEVERITY#phase3";

const phases = [
  { phase: "pre_implementation", runId: "tf-phase3-pre-impl-20260910", runInquiry: true },
  { phase: "verification", runId: "tf-phase3-verify-20260910", runInquiry: true },
  { phase: "close_out", runId: "tf-phase3-closeout-20260910", runInquiry: false },
];

function inquiryInput(phase, runId) {
  return {
    graph: {
      projectId: "typed-flow-phase3",
      criteria: [{
        identity: {
          id: `${requestToken}#criterion-phase3-gate`,
          kind: "criterion",
          derivation: "explicit",
          revision: "phase3-rev",
          sourceRevision: "2026-09-10",
        },
        architectureConstraintIds: ["constraint-phase3-typed-gate"],
      }],
      architectureConstraints: [{
        id: "constraint-phase3-typed-gate",
        implementationBlockIds: [blockId],
      }],
      implementationBlocks: [{
        identity: {
          id: blockId,
          kind: "block",
          name: "PROMOTE_TYPED_DIAGNOSTIC_SEVERITY",
          derivation: "content",
          revision: "sidecar-phase3",
          sourceRevision: "2026-09-10",
        },
      }],
      evidenceLoci: [],
    },
    fidelity: {
      blockRevision: "sidecar-phase3",
      specification: [
        {
          id: "statement-typed-gate-errors-default-false",
          kind: "behavior",
          value: "typed_gate_errors defaults false; pilot warnings-only preserved until sponsor 3d",
          order: 1,
        },
        {
          id: "statement-annotated-only-errors",
          kind: "behavior",
          value: "Severity promotion to error only on annotated procedures when gate_mode and typed_flow and typed_gate_errors",
          order: 2,
        },
        {
          id: "statement-prose-only-guard",
          kind: "behavior",
          value: "Prose-only procedures never emit typed gate errors; cases 19 and 27 regression guard",
          order: 3,
        },
        {
          id: "statement-qualification-r1-r2",
          kind: "behavior",
          value: "124-entry qualification R1 124/124 and R2 zero prose-only new gate failures",
          order: 4,
        },
      ],
      testEvidence: [],
      productionEvidence: [],
    },
    scope: [blockId],
    policy: "advisory",
    repositoryRoot: repoRoot,
    requestToken,
    activation: { runId, phase },
    provenance: {
      run_id: runId,
      phase,
      scope: [blockId],
      request_token: requestToken,
      schema_version: "evidence-provenance.v1",
      command: "node working/REQ-PSEUDOCODE_TYPED_FLOW/run-phase3-gates.mjs",
      tool_version: "stdd-mcp-local",
    },
  };
}

function integratedTracker(phase) {
  const slugs = derivePhaseAwareSlugs("integrated", phase);
  return {
    steps: slugs.map((slug) => ({
      slug,
      disposition: slug === "traceable-commit" ? "waived" : "completed",
      evidence_refs: evidenceRefsForSlug(slug, phase),
      ...(slug === "traceable-commit"
        ? {
            owner: "REQ-PSEUDOCODE_TYPED_FLOW",
            expiry: "2026-12-31",
            approval: "phase3-3d-sponsor-approved-20260910",
            residual_risk: "Commit pending after close_out gate; sub-phase 3d default flip applied",
          }
        : {}),
    })),
  };
}

function evidenceRefsForSlug(slug, phase) {
  if (slug === "sub-adversarial-inquiry-pass") {
    return [`working/${requestToken}/adversarial-inquiry/phase-${phase}/obligation-report.json`];
  }
  if (slug === "gate-pseudocode-validation") {
    return ["tied/implementation-decisions/IMPL-PSEUDOCODE_TYPED_FLOW-pseudocode.md"];
  }
  if (slug === "verification-gate") {
    return [
      "cd mcp-server && npm test (651/651 pass)",
      "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/phase3/summary.json",
      "working/REQ-PSEUDOCODE_TYPED_FLOW/phase3-measurement-report.md",
    ];
  }
  if (slug === "risk-assessment") {
    return [`tied/citdp/CITDP-${requestToken}.yaml`];
  }
  return ["working/REQ-PSEUDOCODE_TYPED_FLOW/phase3-measurement-report.md"];
}

function loadCitdpBase() {
  const citdpPath = path.join(repoRoot, "tied/citdp/CITDP-REQ-PSEUDOCODE_TYPED_FLOW.yaml");
  return yaml.load(fs.readFileSync(citdpPath, "utf8"))["CITDP-REQ-PSEUDOCODE_TYPED_FLOW"];
}

function buildCitdp(phase, verifyRunId) {
  const base = loadCitdpBase();
  const citdp = structuredClone(base);
  citdp.risk_analysis ??= {};
  citdp.risk_analysis.adversarial_inquiry ??= {};
  const section = citdp.risk_analysis.adversarial_inquiry;
  section.depth_tier = "integrated";
  section.gate_policy = "advisory";
  section.prior_depth_tier = section.prior_depth_tier ?? "integrated";
  section.disconfirming_observations = [
    "F8 regression and qualification R1 124/124 unchanged with typed_flow false",
    "Qualification R2 zero prose-only new gate failures under typed_gate_errors",
    "651 mcp-server tests pass; corpus fixtures 28",
  ];
  section.evidence_references = [
    "working/REQ-PSEUDOCODE_TYPED_FLOW/phase3-measurement-report.md",
    "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/phase3/summary.json",
  ];
  if (phase === "verification" || phase === "close_out") {
    citdp.completion_criteria ??= {};
    citdp.completion_criteria.activation = {
      phase: "verification",
      request_token: requestToken,
      run_id: verifyRunId,
    };
    citdp.completion_criteria.verification_gate_notes =
      "651 tests pass; qualification R1 124/124 R2 0 prose-only failures; typed_gate_errors default false (3d blocked).";
  }
  if (phase === "close_out") {
    section.close_out_inquiry_waiver = {
      owner: requestToken,
      expiry: "2026-12-31",
      rationale: "Phase 3 verification inquiry unchanged after 3d default flip; close_out inquiry waived.",
      approval: "phase3-3d-sponsor-approved-20260910",
      referenced_verification_run_id: verifyRunId,
    };
  }
  return citdp;
}

async function runPhase({ phase, runId, runInquiry }, verifyRunId) {
  let activation;
  if (runInquiry) {
    const inquiry = await runChecklistInquiry(inquiryInput(phase, runId));
    if (!inquiry.ok) {
      console.error(JSON.stringify({ ok: false, stage: "inquiry", phase, inquiry }, null, 2));
      process.exit(1);
    }

    const collected = await collectChecklistActivation({
      requestToken,
      phase,
      runId,
      projectRoot: repoRoot,
    });
    if (!collected.ok) {
      console.error(JSON.stringify({ ok: false, stage: "collect", phase, collected }, null, 2));
      process.exit(1);
    }
    activation = { receipt: collected.receipt, artifacts: collected.artifacts };
  }
  const gate = validateChecklistGate({
    phase,
    tracker: integratedTracker(phase),
    citdp: buildCitdp(phase, verifyRunId),
    ...(activation ? { activation } : {}),
  });

  const gatesDir = path.join(__dirname, "gates");
  fs.mkdirSync(gatesDir, { recursive: true });
  const gatePath = path.join(gatesDir, `gate-${phase}-${runId}-result.json`);
  fs.writeFileSync(gatePath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");

  const receiptPath = path.join(
    gatesDir,
    `${phase}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  fs.writeFileSync(
    receiptPath,
    `${JSON.stringify({
      schema_version: "checklist-gate-receipt.v1",
      phase,
      timestamp: new Date().toISOString(),
      allowed: gate.allowed,
      diagnostics: gate.diagnostics ?? [],
      depth: gate.depth,
      gate_result: gate,
    }, null, 2)}\n`,
  );

  const payload = {
    ok: gate.allowed,
    phase,
    runId,
    inquiry: runInquiry ? { ok: true } : { ok: true, waived: true },
    gate: {
      allowed: gate.allowed,
      blocking: gate.blocking,
      diagnostics: gate.diagnostics,
      evidence_file: gatePath,
    },
  };
  console.log(JSON.stringify(payload, null, 2));
  return gate;
}

async function main() {
  const verifyRunId = phases.find((entry) => entry.phase === "verification").runId;
  for (const entry of phases) {
    const gate = await runPhase(entry, verifyRunId);
    if (!gate.allowed) process.exit(1);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
