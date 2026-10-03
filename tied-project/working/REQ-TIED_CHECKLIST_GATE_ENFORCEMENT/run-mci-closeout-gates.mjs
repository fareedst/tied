#!/usr/bin/env node
/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Persist gate receipts for mci-* inquiry phases.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { allTools } from "../../mcp-server/dist/tools/index.js";
import { derivePhaseAwareSlugs } from "../../mcp-server/dist/checklist-validator.js";
import { hydrateGateEvidenceFromActivation } from "../../mcp-server/dist/checklist-gate-evidence-hydration.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";

const PHASES = [
  { phase: "pre_implementation", run_id: "mci-pre-20260910" },
  { phase: "verification", run_id: "mci-verify-20260910" },
  { phase: "close_out", run_id: "mci-closeout-20260910" },
];

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function loadCitdp() {
  const doc = yaml.load(
    fs.readFileSync(path.join(__dirname, "CITDP-wave1-unified-closeout.yaml"), "utf8"),
  );
  return doc["CITDP-wave1-unified-closeout"];
}

function loadTracker() {
  return yaml.load(
    fs.readFileSync(path.join(__dirname, "wave1-unified-closeout-tracker.yaml"), "utf8"),
  );
}

function loadPseudocodeReports() {
  const psaDir = path.join(__dirname, "pseudocode-analysis");
  const reports = {};
  for (const impl of ["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT", "IMPL-REQUEST_EVIDENCE_ENVELOPE"]) {
    const filePath = path.join(psaDir, `${impl}.v1.json`);
    reports[impl] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return reports;
}

async function main() {
  const gateHandler = toolHandler("tied_checklist_gate_validate");
  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const citdp = loadCitdp();
  const tracker = loadTracker();
  const pseudocodeReports = loadPseudocodeReports();
  const results = [];

  for (const { phase, run_id } of PHASES) {
    const collected = parseToolResult(
      await collectHandler({
        request_token: REQ,
        phase,
        run_id,
        project_root: REPO,
      }),
    );
    if (!collected.ok) {
      console.error("activation collect failed", phase, collected);
      process.exit(1);
    }

    const hydration = await hydrateGateEvidenceFromActivation({
      phase,
      activation: {
        receipt: collected.receipt,
        artifacts: collected.artifacts,
        expected: collected.expected,
      },
      evidence: {
        trackerSource: "authoritative_file",
        requestToken: REQ,
        pseudocodeReports,
      },
      projectRoot: REPO,
    });

    const gate = parseToolResult(
      await gateHandler({
        phase,
        tracker,
        citdp,
        requiredStepSlugs: derivePhaseAwareSlugs("integrated", phase),
        activation: {
          receipt: collected.receipt,
          artifacts: collected.artifacts,
          expected: collected.expected,
        },
        evidence: hydration.evidence,
        receipt_persistence: {
          request_token: REQ,
          gates_dir: `working/${REQ}/gates`,
          ledger_path: `working/${REQ}/adherence/events.jsonl`,
          run_id,
        },
      }),
    );

    results.push({ phase, run_id, allowed: gate.allowed, blocking: gate.blocking, diagnostics: gate.diagnostics });
    console.log(JSON.stringify({ phase, run_id, allowed: gate.allowed, receipt: gate.receipt_path }));
    if (!gate.allowed) {
      console.error(gate.diagnostics);
      process.exit(1);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "evidence/mci-gate-receipts-result.json"),
    `${JSON.stringify({ ok: true, phases: results }, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
