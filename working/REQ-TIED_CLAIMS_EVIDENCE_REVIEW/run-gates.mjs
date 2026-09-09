#!/usr/bin/env node
/** Run integrated inquiry phases and checklist gates for REQ-TIED_CLAIMS_EVIDENCE_REVIEW close-out evidence. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectChecklistActivation } from "../../mcp-server/dist/checklist-activation-collect.js";
import { runChecklistInquiry } from "../../mcp-server/dist/adversarial-inquiry/checklist-integration.js";
import { derivePhaseAwareSlugs, validateChecklistGate } from "../../mcp-server/dist/checklist-validator.js";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const requestToken = "REQ-TIED_CLAIMS_EVIDENCE_REVIEW";
const blockId = "IMPL-TIED_CLAIMS_EVIDENCE_REVIEW#RUN_CLAIMS_EVIDENCE_REVIEW#slice1";

function inquiryInput(phase, runId) {
  return {
    graph: {
      projectId: "claims-evidence-slice1",
      criteria: [{
        identity: {
          id: `${requestToken}#criterion-1`,
          kind: "criterion",
          derivation: "explicit",
          revision: "criterion-rev",
          sourceRevision: "slice1",
        },
        architectureConstraintIds: ["constraint-cer"],
      }],
      architectureConstraints: [{ id: "constraint-cer", implementationBlockIds: [blockId] }],
      implementationBlocks: [{
        identity: {
          id: blockId,
          kind: "block",
          name: "RUN_CLAIMS_EVIDENCE_REVIEW",
          derivation: "content",
          revision: "block-rev",
          sourceRevision: "slice1",
        },
      }],
      evidenceLoci: [],
    },
    fidelity: {
      blockRevision: "block-rev",
      specification: [{ id: "statement-1", kind: "behavior", value: "read-only claim review", order: 1 }],
      testEvidence: [],
      productionEvidence: [],
    },
    scope: [blockId],
    policy: "advisory",
    repositoryRoot: repoRoot,
    requestToken,
    activation: { runId, phase },
    provenance: { runId, phase, scope: [blockId] },
  };
}

function integratedTracker(phase) {
  return {
    steps: derivePhaseAwareSlugs("integrated", phase).map((slug) => ({
      slug,
      disposition: "completed",
      evidence_refs: ["mcp-server/src/claims-evidence-review/claims-evidence-review.test.ts"],
    })),
  };
}

function loadCitdp(runId, phase) {
  const citdpPath = path.join(__dirname, "CITDP-REQ-TIED_CLAIMS_EVIDENCE_REVIEW.yaml");
  const citdp = yaml.load(fs.readFileSync(citdpPath, "utf8"));
  const record = citdp["CITDP-REQ-TIED_CLAIMS_EVIDENCE_REVIEW"];
  record.completion_criteria = {
    ...(record.completion_criteria ?? {}),
    activation: {
      run_id: runId,
      phase,
      request_token: requestToken,
    },
  };
  return record;
}

async function runInquiryOnly(phase, runId) {
  const inquiry = await runChecklistInquiry(inquiryInput(phase, runId));
  return { phase, runId, inquiry: inquiry.ok, mode: "inquiry_only" };
}

async function runGatePhase(phase, runId) {
  const inquiry = await runChecklistInquiry(inquiryInput(phase, runId));
  if (!inquiry.ok) throw new Error(`inquiry failed ${phase}`);
  const collected = await collectChecklistActivation({
    requestToken,
    phase,
    runId,
    projectRoot: repoRoot,
  });
  const gate = validateChecklistGate({
    phase,
    tracker: integratedTracker(phase),
    citdp: loadCitdp(runId, phase),
    activation: collected.ok ? { receipt: collected.receipt, artifacts: collected.artifacts } : undefined,
  });
  return {
    phase,
    runId,
    inquiry: inquiry.ok,
    collected: collected.ok,
    gate: gate.allowed,
    diagnostics: gate.diagnostics,
  };
}

const results = [];
results.push(await runGatePhase("pre_implementation", "cer-pre-impl-1"));
results.push(await runInquiryOnly("post_test", "cer-post-test-1"));
results.push(await runGatePhase("verification", "cer-verification-1"));
results.push(await runGatePhase("close_out", "cer-close-out-1"));
console.log(JSON.stringify({ ok: results.every((row) => row.inquiry !== false && row.gate !== false), results }, null, 2));
