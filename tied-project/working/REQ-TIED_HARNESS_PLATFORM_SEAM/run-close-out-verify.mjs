#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
const requestToken = "REQ-TIED_HARNESS_PLATFORM_SEAM";

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

const verify = tiedCliJson("tied_verify", {
  passed_requirement_tokens: [requestToken],
  passed_impl_tokens: ["IMPL-TIED_HARNESS_PLATFORM_SEAM"],
  project_root: repoRoot,
  envelope_path: `tied-project/working/${requestToken}/evidence/request-evidence-envelope.v1.json`,
  consult_envelope_blocking: true,
  checklist_gate: {
    phase: "close_out",
    project_root: repoRoot,
    tracker_path: `tied-project/working/${requestToken}/checklist-tracker.yaml`,
    citdp,
  },
  receipt_persistence: {
    request_token: requestToken,
    gates_dir: `tied-project/working/${requestToken}/gates`,
    ledger_path: `tied-project/working/${requestToken}/gates/gate-ledger.jsonl`,
    run_id: "hps-close-out-20261020-r1",
  },
});

const outPath = path.join(
  repoRoot,
  "tied-project/working",
  requestToken,
  "evidence/tied-verify-close-out.json",
);
fs.writeFileSync(outPath, JSON.stringify(verify, null, 2));
console.log(JSON.stringify(verify, null, 2));
