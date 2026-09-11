#!/usr/bin/env node
/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Persist Wave 5 verification/close_out gate receipts.
 */
import { readFileSync, writeFileSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { allTools } from "../../mcp-server/dist/tools/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";
const TRACKER = path.join(REPO, "working", REQ, "agent-req-implementation-checklist-wave5-process-adherence.yaml");
const CITDP = path.join(REPO, "working", REQ, "CITDP-wave5-process-adherence.yaml");
const GATES = path.join(REPO, "working", REQ, "gates");
const LEDGER = path.join(GATES, "ledger.jsonl");

const ONLY = process.argv.includes("--close-out-only") ? "close_out" : undefined;

const PHASES = [
  { phase: "verification", run_id: "wave5-verify-20260910", alias: "wave5-verification-20260910.json" },
  { phase: "close_out", run_id: "wave5-closeout-20260910", alias: "wave5-close_out-20260910.json" },
].filter((entry) => !ONLY || entry.phase === ONLY);

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function loadCitdp() {
  const doc = yaml.load(readFileSync(CITDP, "utf8"));
  const key = Object.keys(doc).find((item) => item.startsWith("CITDP-"));
  return key ? doc[key] : doc;
}

function loadPseudocodeReports(citdp) {
  const psaDir = path.join(REPO, "working", REQ, "pseudocode-analysis");
  if (!existsSync(psaDir)) return {};
  const inventory = citdp?.impact_analysis?.impl_inventory ?? [];
  const implTokens = inventory.map((entry) => (
    typeof entry === "string" ? entry : entry?.impl_token
  )).filter(Boolean);
  const reports = {};
  for (const implToken of implTokens) {
    const filePath = path.join(psaDir, `${implToken}.v1.json`);
    if (existsSync(filePath)) {
      reports[implToken] = JSON.parse(readFileSync(filePath, "utf8"));
    }
  }
  if (Object.keys(reports).length > 0) return reports;
  for (const name of readdirSync(psaDir).filter((item) => item.endsWith(".v1.json"))) {
    const implToken = name.replace(/\.v1\.json$/u, "");
    reports[implToken] = JSON.parse(readFileSync(path.join(psaDir, name), "utf8"));
  }
  return reports;
}

async function main() {
  const handler = toolHandler("tied_checklist_gate_validate");
  const citdp = loadCitdp();
  const pseudocodeReports = loadPseudocodeReports(citdp);
  const results = [];

  for (const { phase, run_id, alias } of PHASES) {
    const collected = parseToolResult(
      await toolHandler("tied_checklist_activation_collect")({
        request_token: REQ,
        phase,
        run_id,
        project_root: REPO,
      }),
    );
    if (!collected.ok) {
      console.error(`activation collect failed phase=${phase}`, collected);
      process.exit(1);
    }

    const gate = parseToolResult(
      await handler({
        phase,
        tracker_path: TRACKER,
        project_root: REPO,
        citdp,
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
        receipt_persistence: {
          request_token: REQ,
          gates_dir: GATES,
          ledger_path: LEDGER,
          run_id,
        },
      }),
    );

    if (!gate.allowed) {
      console.error(`gate failed phase=${phase}`, gate);
      process.exit(1);
    }

    const receiptPath = gate.gate_receipt?.path ?? gate.gateReceipt?.path;
    if (receiptPath) {
      const abs = path.isAbsolute(receiptPath) ? receiptPath : path.join(REPO, receiptPath);
      copyFileSync(abs, path.join(GATES, alias));
    }

    results.push({
      phase,
      run_id,
      allowed: gate.allowed,
      blocking: gate.blocking,
      diagnostics: gate.diagnostics ?? [],
      receipt_path: receiptPath,
      alias: `working/${REQ}/gates/${alias}`,
    });
    console.log(JSON.stringify({ phase, run_id, allowed: gate.allowed }));
  }

  writeFileSync(
    path.join(REPO, "working", REQ, "evidence", "wave5-gate-receipts-result.json"),
    `${JSON.stringify({ ok: true, phases: results }, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
