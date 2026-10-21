#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");

function tiedCliJson(tool, args) {
  const out = execFileSync(tiedCli, [tool, JSON.stringify(args)], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  return JSON.parse(out);
}

const runId = "cli-output-texture-pre-impl-2026-10-21";
const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(
      repoRoot,
      "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml",
    ),
    "utf8",
  ),
);
const citdp = citdpDoc["CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE"];

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "pre_implementation",
  project_root: repoRoot,
  tracker_path:
    "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/checklist-tracker-gates.yaml",
  citdp,
  receipt_persistence: {
    request_token: "REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE",
    gates_dir: "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/gates",
    ledger_path:
      "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/evidence/gate-ledger.jsonl",
    run_id: runId,
  },
});

const outPath = path.join(
  repoRoot,
  "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/gates/pre_implementation-gate.json",
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ allowed: gate.allowed, diagnostics: gate.diagnostics }, null, 2));
process.exit(gate.allowed ? 0 : 1);
