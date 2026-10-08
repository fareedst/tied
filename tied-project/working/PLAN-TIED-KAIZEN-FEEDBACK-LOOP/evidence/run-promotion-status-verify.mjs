#!/usr/bin/env node
/**
 * Stack reconcile: REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION (detail synced via yaml_detail_update).
 * Gate: reuse MCP wiring close_out tracker (integrated waiver) + passing promotion tests.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const tiedCli = path.join(root, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");

function tiedCliJson(tool, args) {
  const out = execFileSync(tiedCli, [tool, JSON.stringify(args)], {
    encoding: "utf8",
    cwd: root,
    env: {
      ...process.env,
      TIED_MCP_BIN: path.join(root, "mcp-server/dist/index.js"),
      TIED_BASE_PATH: path.join(root, "tied-project"),
    },
  });
  return JSON.parse(out);
}

const RUN_ID = "kaizen-promotion-verify-20261008";
const REQ = "REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION";
const IMPL = "IMPL-TIED_FEEDBACK_PROMOTION";

const citdpRaw = yaml.load(
  fs.readFileSync(
    path.join(root, "tied-project/working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/CITDP-REQ-KAIZEN-FEEDBACK-MCP-WIRING.yaml"),
    "utf8",
  ),
);
const citdp = citdpRaw["CITDP-REQ-KAIZEN-FEEDBACK-MCP-WIRING"];
citdp.stack_reconcile_for = REQ;

const trackerPath = "tied-project/working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/checklist-tracker.yaml";
const gatesDir = "tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/gates";
const ledgerPath =
  "tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/evidence/promotion-status-gate-ledger.jsonl";
fs.mkdirSync(path.join(root, gatesDir), { recursive: true });

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "close_out",
  project_root: root,
  tracker_path: trackerPath,
  citdp,
  receipt_persistence: {
    request_token: REQ,
    gates_dir: gatesDir,
    ledger_path: ledgerPath,
    run_id: RUN_ID,
  },
});

fs.writeFileSync(path.join(here, "promotion-status-verification-gate.json"), JSON.stringify(gate, null, 2));

if (!gate.allowed) {
  console.error(JSON.stringify({ allowed: false, gate }, null, 2));
  process.exit(1);
}

const verify = tiedCliJson("tied_verify", {
  passed_requirement_tokens: [REQ],
  passed_impl_tokens: [IMPL],
  project_root: root,
  dry_run: true,
  checklist_gate: {
    phase: "close_out",
    tracker_path: trackerPath,
    citdp,
  },
});

fs.writeFileSync(path.join(here, "promotion-status-tied-verify-dry-run.json"), JSON.stringify(verify, null, 2));

if (!verify.ok) {
  console.error(JSON.stringify({ verify }, null, 2));
  process.exit(1);
}

const verifyWrite = tiedCliJson("tied_verify", {
  passed_requirement_tokens: [REQ],
  passed_impl_tokens: [IMPL],
  project_root: root,
  checklist_gate: {
    phase: "close_out",
    tracker_path: trackerPath,
    citdp,
  },
  receipt_persistence: {
    request_token: REQ,
    gates_dir: gatesDir,
    ledger_path: ledgerPath,
    run_id: `${RUN_ID}-write`,
    gate_receipt_ref: gate.receipt_path ?? gate.gate_receipt?.path,
    gate_receipt_hash: gate.receipt_hash ?? gate.gate_receipt?.hash,
  },
});

fs.writeFileSync(path.join(here, "promotion-status-tied-verify-result.json"), JSON.stringify(verifyWrite, null, 2));

console.log(
  JSON.stringify({
    gate_allowed: gate.allowed,
    dry_run_ok: verify.ok,
    verify_ok: verifyWrite.ok,
    would_update: verify.would_update,
    index_updates: verifyWrite,
  }),
);
