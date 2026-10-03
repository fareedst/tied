#!/usr/bin/env node
/** Run integrated pre_implementation inquiry + checklist gate for REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectChecklistActivation } from "../../mcp-server/dist/checklist-activation-collect.js";
import { runChecklistInquiry } from "../../mcp-server/dist/adversarial-inquiry/checklist-integration.js";
import { derivePhaseAwareSlugs, validateChecklistGate } from "../../mcp-server/dist/checklist-validator.js";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const requestToken = "REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE";
const phase = "pre_implementation";
const runId = "cl-pre-impl-20260910";
const blockId = "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE#CONSTRAINT_FLOW_CONTROLS#slice1";

const evidenceRefs = [
  "tied/implementation-decisions/IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE-pseudocode.md",
  "tied/docs/pseudocode-grammar.v2.md",
  "tied/docs/pseudocode-grammar-v2-migration.md",
  "working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/CITDP-REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE.yaml",
  `working/${requestToken}/adversarial-inquiry/phase-${phase}/`,
];

function inquiryInput() {
  return {
    graph: {
      projectId: "constraint-language-slice1",
      criteria: [{
        identity: {
          id: `${requestToken}#criterion-constraint-flow`,
          kind: "criterion",
          derivation: "explicit",
          revision: "slice1-rev",
          sourceRevision: "2026-09-10",
        },
        architectureConstraintIds: ["constraint-flow-composition"],
      }],
      architectureConstraints: [{ id: "constraint-flow-composition", implementationBlockIds: [blockId] }],
      implementationBlocks: [{
        identity: {
          id: blockId,
          kind: "block",
          name: "CONSTRAINT_FLOW_CONTROLS",
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
          id: "statement-constraint-flags-off",
          kind: "behavior",
          value: "constraint_flow false preserves typed-flow Phase 3 baseline with zero constraint diagnostics (F8 analog)",
          order: 1,
        },
        {
          id: "statement-typed-flow-required",
          kind: "behavior",
          value: "constraint_flow true requires typed_flow true (Q7 binding disposition)",
          order: 2,
        },
        {
          id: "statement-prose-only-guard",
          kind: "behavior",
          value: "Prose-only and v1-only procedures emit no constraint gate errors (PSA-CONSTRAINT-002)",
          order: 3,
        },
        {
          id: "statement-solver-truncation",
          kind: "behavior",
          value: "Solver budget exceed disclosed in solver_metadata not promoted to gate error (PSA-CONSTRAINT-004)",
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
      command: "node working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/run-pre-implementation-gates.mjs",
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
  const citdpPath = path.join(__dirname, "CITDP-REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE.yaml");
  const citdp = yaml.load(fs.readFileSync(citdpPath, "utf8"));
  return citdp["CITDP-REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE"];
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
