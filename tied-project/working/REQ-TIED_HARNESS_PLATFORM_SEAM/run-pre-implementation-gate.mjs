#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
const requestToken = "REQ-TIED_HARNESS_PLATFORM_SEAM";
const runId = "hps-refine-pass2-preimpl-20261020-r1";

function tiedCliJson(tool, args) {
  const out = execFileSync(tiedCli, [tool, JSON.stringify(args)], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  return JSON.parse(out);
}

const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(repoRoot, "tied-project/working", requestToken, `CITDP-${requestToken}.yaml`),
    "utf8",
  ),
);
const citdp = citdpDoc[`CITDP-${requestToken}`];
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = {
  run_id: runId,
  phase: "pre_implementation",
};

const activation = tiedCliJson("tied_checklist_activation_collect", {
  request_token: requestToken,
  phase: "pre_implementation",
  run_id: runId,
  project_root: repoRoot,
});

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "pre_implementation",
  project_root: repoRoot,
  tracker_path: `tied-project/working/${requestToken}/checklist-tracker.yaml`,
  citdp,
  activation: {
    receipt: activation.receipt,
    artifacts: activation.artifacts,
  },
  receipt_persistence: {
    request_token: requestToken,
    gates_dir: `tied-project/working/${requestToken}/gates`,
    ledger_path: `tied-project/working/${requestToken}/evidence/gate-ledger.jsonl`,
    run_id: runId,
  },
});

const outPath = path.join(
  repoRoot,
  "tied-project/working",
  requestToken,
  "evidence/pre-implementation-gate-result.json",
);
fs.writeFileSync(outPath, JSON.stringify(gate, null, 2));
console.log(JSON.stringify({ allowed: gate.allowed, diagnostics: gate.diagnostics }, null, 2));
process.exit(gate.allowed ? 0 : 1);
