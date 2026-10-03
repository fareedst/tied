#!/usr/bin/env node
/** Run integrated pre_implementation inquiry + checklist gate for REQ-PSEUDOCODE_TYPED_FLOW. */
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
const phase = "pre_implementation";
const runId = "tf-pre-impl-20260910";
const blockId = "IMPL-PSEUDOCODE_TYPED_FLOW#TYPED_FLOW_CONTROLS#pilot";

const evidenceRefs = [
  "tied/implementation-decisions/IMPL-PSEUDOCODE_TYPED_FLOW-pseudocode.md",
  "tied/citdp/CITDP-REQ-PSEUDOCODE_TYPED_FLOW.yaml",
  `working/${requestToken}/adversarial-inquiry/phase-${phase}/`,
];

function inquiryInput() {
  return {
    graph: {
      projectId: "typed-flow-pilot",
      criteria: [{
        identity: {
          id: `${requestToken}#criterion-typed-flow`,
          kind: "criterion",
          derivation: "explicit",
          revision: "pilot-rev",
          sourceRevision: "2026-09-10",
        },
        architectureConstraintIds: ["constraint-typed-flow"],
      }],
      architectureConstraints: [{ id: "constraint-typed-flow", implementationBlockIds: [blockId] }],
      implementationBlocks: [{
        identity: {
          id: blockId,
          kind: "block",
          name: "TYPED_FLOW_CONTROLS",
          derivation: "content",
          revision: "sidecar-rev",
          sourceRevision: "2026-09-10",
        },
      }],
      evidenceLoci: [],
    },
    fidelity: {
      blockRevision: "sidecar-rev",
      specification: [
        {
          id: "statement-typed-flow-false",
          kind: "behavior",
          value: "typed_flow false preserves legacy parse and gate outcomes (F8)",
          order: 1,
        },
        {
          id: "statement-tier2-evidence",
          kind: "behavior",
          value: "Tier-2 type annotations are optional evidence; prose blocks emit unknowns not errors",
          order: 2,
        },
        {
          id: "statement-authoring-gate",
          kind: "behavior",
          value: "F11 authoring burden gate can block Phase 3 even at high recall",
          order: 3,
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
      command: "node working/REQ-PSEUDOCODE_TYPED_FLOW/run-pre-implementation-gates.mjs",
      tool_version: "stdd-mcp-local",
    },
  };
}

function integratedTracker() {
  return {
    steps: derivePhaseAwareSlugs("integrated", phase).map((slug) => ({
      slug,
      disposition: "completed",
      evidence_refs: evidenceRefs,
    })),
  };
}

function loadCitdp() {
  const citdpPath = path.join(repoRoot, "tied/citdp/CITDP-REQ-PSEUDOCODE_TYPED_FLOW.yaml");
  const citdp = yaml.load(fs.readFileSync(citdpPath, "utf8"));
  return citdp["CITDP-REQ-PSEUDOCODE_TYPED_FLOW"];
}

async function main() {
  const inquiry = await runChecklistInquiry(inquiryInput());
  if (!inquiry.ok) {
    console.error(JSON.stringify({ ok: false, stage: "inquiry", inquiry }, null, 2));
    process.exit(1);
  }

  const collected = await collectChecklistActivation({
    requestToken,
    phase,
    runId,
    projectRoot: repoRoot,
  });
  if (!collected.ok) {
    console.error(JSON.stringify({ ok: false, stage: "collect", collected }, null, 2));
    process.exit(1);
  }

  const gate = validateChecklistGate({
    phase,
    tracker: integratedTracker(),
    citdp: loadCitdp(),
    activation: { receipt: collected.receipt, artifacts: collected.artifacts },
  });

  const gatesDir = path.join(__dirname, "gates");
  fs.mkdirSync(gatesDir, { recursive: true });
  const gatePath = path.join(gatesDir, `gate-${phase}-${runId}-result.json`);
  fs.writeFileSync(gatePath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");

  const payload = {
    ok: gate.allowed,
    phase,
    runId,
    inquiry: {
      ok: inquiry.ok,
      verdict: inquiry.verdict,
      artifacts: inquiry.artifacts,
    },
    collected: { ok: collected.ok },
    gate: {
      allowed: gate.allowed,
      blocking: gate.blocking,
      diagnostics: gate.diagnostics,
      evidence_file: gatePath,
    },
  };
  console.log(JSON.stringify(payload, null, 2));
  process.exit(gate.allowed ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
