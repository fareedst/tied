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
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = {
  run_id: "slice2b-verification-2026-09-23",
  phase: "verification",
};

const activation = tiedCliJson("tied_checklist_activation_collect", {
  request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
  phase: "verification",
  run_id: "slice2b-verification-2026-09-23",
  project_root: repoRoot,
});

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "verification",
  project_root: repoRoot,
  tracker_path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/checklist-tracker.yaml",
  citdp,
  activation: {
    receipt: activation.receipt,
    artifacts: activation.artifacts,
  },
  receipt_persistence: {
    request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
    gates_dir: "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates",
    ledger_path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/gate-ledger.jsonl",
    run_id: "slice2b-verification-2026-09-23",
  },
});

const outPath = path.join(
  repoRoot,
  "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates/phase3b-slice2b-verification-gate.json",
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    { allowed: gate.allowed, diagnostics: gate.diagnostics, path: outPath },
    null,
    2,
  ),
);
process.exit(gate.allowed ? 0 : 1);
