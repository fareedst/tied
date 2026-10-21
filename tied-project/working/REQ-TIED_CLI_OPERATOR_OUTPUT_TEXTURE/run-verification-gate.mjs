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
    env: { ...process.env, TIED_BASE_PATH: path.join(repoRoot, "tied-project") },
  });
  return JSON.parse(out);
}

const runId = "cli-output-texture-verify-2026-10-21";

execFileSync("node", ["--test", "tools/bootstrap/build-commands-how.test.mjs"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(repoRoot, "tied-project/citdp/CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml"),
    "utf8",
  ),
);
const citdp = citdpDoc["CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE"];

const trackerPath =
  "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/checklist-tracker-gates.yaml";

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "verification",
  project_root: repoRoot,
  tracker_path: trackerPath,
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
  "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/gates/verification-gate.json",
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");

if (!gate.allowed) {
  console.error(JSON.stringify({ gate }, null, 2));
  process.exit(1);
}

const verify = tiedCliJson("tied_verify", {
  passed_requirement_tokens: ["REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE"],
  passed_impl_tokens: ["IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE"],
  project_root: repoRoot,
  checklist_gate: {
    phase: "verification",
    tracker_path: trackerPath,
    citdp,
  },
  receipt_persistence: {
    request_token: "REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE",
    gates_dir: "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/gates",
    ledger_path:
      "tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/evidence/gate-ledger.jsonl",
    run_id: runId,
    persist_gate: false,
    gate_receipt_ref: gate.gate_receipt?.path,
    gate_receipt_hash: gate.gate_receipt?.hash,
  },
});

console.log(JSON.stringify({ gate_allowed: gate.allowed, verify }, null, 2));
process.exit(verify.ok ? 0 : 1);
