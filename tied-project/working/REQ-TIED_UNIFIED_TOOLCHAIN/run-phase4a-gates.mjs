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

const phase = process.argv[2] ?? "verification";
const runId =
  phase === "pre_implementation"
    ? "phase4a-pre-impl-2026-09-22"
    : "phase4a-verification-2026-09-22";

const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(repoRoot, "tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml"),
    "utf8",
  ),
);
const citdp = citdpDoc["CITDP-REQ-TIED_UNIFIED_TOOLCHAIN"];
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = { run_id: runId, phase };

const activation = tiedCliJson("tied_checklist_activation_collect", {
  request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
  phase,
  run_id: runId,
  project_root: repoRoot,
});

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase,
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
    run_id: runId,
  },
});

const outPath = path.join(
  repoRoot,
  `working/REQ-TIED_UNIFIED_TOOLCHAIN/gates/phase4a-${phase}-gate.json`,
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
