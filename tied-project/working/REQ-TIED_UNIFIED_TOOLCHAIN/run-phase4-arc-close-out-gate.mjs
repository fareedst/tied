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

const runId = "phase4-full-close-out-2026-09-23";
const trackerPath = "working/REQ-TIED_UNIFIED_TOOLCHAIN/checklist-tracker.yaml";

const citdpDoc = yaml.load(
  fs.readFileSync(
    path.join(repoRoot, "tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml"),
    "utf8",
  ),
);
const citdp = citdpDoc["CITDP-REQ-TIED_UNIFIED_TOOLCHAIN"];

let activation = { receipt: undefined, artifacts: undefined };
try {
  const collected = tiedCliJson("tied_checklist_activation_collect", {
    request_token: "REQ-TIED_UNIFIED_TOOLCHAIN",
    phase: "close_out",
    run_id: runId,
    project_root: repoRoot,
  });
  activation = { receipt: collected.receipt, artifacts: collected.artifacts };
} catch {
  // close_out inquiry waiver or missing phase dir — gate still runs with tracker/CITDP
}

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "close_out",
  project_root: repoRoot,
  tracker_path: trackerPath,
  citdp,
  activation,
  evidence: {
    envelopeBlocking: true,
  },
});

const envelopePath = path.join(
  repoRoot,
  "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/request-evidence-envelope.v1.json",
);
let envelopeValidation = { ok: false, blocking_gap_count: null };
if (fs.existsSync(envelopePath)) {
  envelopeValidation = tiedCliJson("request_evidence_envelope_validate", {
    envelope_path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/request-evidence-envelope.v1.json",
    project_root: repoRoot,
    fail_on_error_gaps: true,
  });
}

const mergedAllowed = gate.allowed === true && envelopeValidation.ok === true;
const outPath = path.join(
  repoRoot,
  "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates/phase4-full-close-out-gate.json",
);
const payload = {
  allowed: mergedAllowed,
  ok: mergedAllowed,
  blocking: !mergedAllowed,
  phase: "close_out",
  run_id: runId,
  diagnostics: gate.diagnostics ?? [],
  envelope: {
    ok: envelopeValidation.ok === true,
    path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/request-evidence-envelope.v1.json",
    blocking_gap_count: envelopeValidation.blocking_gap_count ?? null,
  },
  gate,
  notes:
    "Arc close_out blocked until traceable-commit completes (sponsor git commit). tied_verify unblocked 2026-09-23.",
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ allowed: mergedAllowed, diagnostics: gate.diagnostics, path: outPath }, null, 2));
process.exit(mergedAllowed ? 0 : 1);
