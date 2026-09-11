#!/usr/bin/env node
/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Wave 7 gate receipts helper.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { allTools } from "../../mcp-server/dist/tools/index.js";
import {
  loadPseudocodeReports,
  resolveWave7GatePhase,
  runIdForPhase,
} from "./run-wave7-gates-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";
const TRACKER = path.join(REPO, "working", REQ, "agent-req-implementation-checklist-wave7-conversation-adherence.yaml");
const CITDP_PATH = path.join(REPO, "working", REQ, "CITDP-wave7-conversation-adherence.yaml");
const PHASE = resolveWave7GatePhase(process.argv.slice(2));

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function loadCitdp() {
  const doc = yaml.load(readFileSync(CITDP_PATH, "utf8"));
  const key = Object.keys(doc).find((item) => item.startsWith("CITDP-"));
  return key ? doc[key] : doc;
}

async function main() {
  const citdp = loadCitdp();
  const handler = toolHandler("tied_checklist_gate_validate");
  const activationHandler = toolHandler("tied_checklist_activation_collect");
  const runId = runIdForPhase(PHASE);
  const pseudocodeReports = loadPseudocodeReports(citdp, REPO, REQ);

  let activation = undefined;
  const collected = parseToolResult(
    await activationHandler({
      request_token: REQ,
      phase: PHASE,
      run_id: runId,
      project_root: REPO,
    }),
  );
  if (collected.ok) {
    activation = {
      receipt: collected.receipt,
      artifacts: collected.artifacts,
      expected: collected.expected,
    };
  }

  const gate = parseToolResult(
    await handler({
      phase: PHASE,
      tracker_path: TRACKER,
      project_root: REPO,
      citdp,
      activation,
      evidence: {
        trackerSource: "authoritative_file",
        requestToken: REQ,
        pseudocodeReports,
      },
    }),
  );
  console.log(JSON.stringify({
    phase: PHASE,
    run_id: runId,
    activation_ok: collected.ok,
    gate,
  }, null, 2));
  process.exit(gate.allowed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
