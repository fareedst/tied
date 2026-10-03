#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");

function tiedCliJson(tool, args) {
  const out = execFileSync(tiedCli, [tool, JSON.stringify(args)], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  return JSON.parse(out);
}

const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(repoRoot, "tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml"),
    "utf8",
  ),
);
const citdp = citdpDoc["CITDP-REQ-TIED_UNIFIED_TOOLCHAIN"];

const runId = "phase4d-verification-2026-09-23";
const trackerPath = "working/REQ-TIED_UNIFIED_TOOLCHAIN/checklist-tracker.yaml";

const activation = tiedCliJson("tied_checklist_activation_collect", {
  request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
  phase: "verification",
  run_id: runId,
  project_root: repoRoot,
});

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "verification",
  project_root: repoRoot,
  tracker_path: trackerPath,
  citdp,
  activation: {
    receipt: activation.receipt,
    artifacts: activation.artifacts,
  },
  receipt_persistence: {
    request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
    gates_dir: "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates",
    ledger_path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/gate-ledger.jsonl",
    run_id: runId,
  },
});

if (!gate.allowed) {
  console.error(JSON.stringify({ gate }, null, 2));
  process.exit(1);
}

const verify = tiedCliJson("tied_verify", {
  passed_requirement_tokens: ["REQ-TIED_UNIFIED_TOOLCHAIN"],
  passed_impl_tokens: ["IMPL-TIED_UNIFIED_TOOLCHAIN"],
  project_root: repoRoot,
  checklist_gate: {
    phase: "verification",
    tracker_path: trackerPath,
    citdp,
    activation: {
      receipt: activation.receipt,
      artifacts: activation.artifacts,
    },
  },
  receipt_persistence: {
    request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
    gates_dir: "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates",
    ledger_path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/gate-ledger.jsonl",
    run_id: "phase4d-verify-status-2026-09-23",
    persist_gate: false,
    gate_receipt_ref: gate.gate_receipt?.path,
    gate_receipt_hash: gate.gate_receipt?.hash,
  },
});

console.log(JSON.stringify(verify, null, 2));
process.exit(verify.ok ? 0 : 1);
