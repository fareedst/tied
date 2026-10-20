#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const tiedBasePath = path.join(repoRoot, "tied-project");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
process.env.TIED_BASE_PATH = tiedBasePath;
process.env.TIED_STORE_ROOT = repoRoot;
process.env.TIED_METHODOLOGY_BUNDLE_PATH = path.join(repoRoot, "tied-bundle");
const requestToken = "REQ-TIED_TOOL_INPUT_COMPATIBILITY";
const runId = "ntic-build-verify-20261020-r1";
const workingRel = `tied-project/working/${requestToken}`;
const evidenceDir = path.join(repoRoot, workingRel, "evidence");

function tiedCliJson(tool, args) {
  const out = execFileSync(tiedCli, [tool, JSON.stringify(args)], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  return JSON.parse(out);
}

function gitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", cwd: repoRoot }).trim();
  } catch {
    return "unknown";
  }
}

const citdpDoc = yaml.load(
  fs.readFileSync(path.join(repoRoot, workingRel, `CITDP-${requestToken}.yaml`), "utf8"),
);
const citdp = citdpDoc[`CITDP-${requestToken}`];
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = {
  run_id: runId,
  phase: "verification",
  request_token: requestToken,
};

const profileOut = path.join(evidenceDir, "evidence-chain-profile.v1.json");
const profile = tiedCliJson("evidence_chain_profile_generate", {
  project_root: repoRoot,
  tied_base_path: tiedBasePath,
  profile_depth: "integrated",
  output_mode: "file",
  output_path: profileOut,
  run_metadata: { run_id: runId, commit: gitCommit() },
  scope: {
    requirement_tokens: [requestToken],
    architecture_tokens: ["ARCH-TIED_TOOL_INPUT_NORMALIZATION"],
    implementation_tokens: ["IMPL-TIED_TOOL_INPUT_NORMALIZATION"],
    impl_tokens_for_pseudocode: ["IMPL-TIED_TOOL_INPUT_NORMALIZATION"],
  },
  change_context: {
    change_id: requestToken,
    citdp_token: `CITDP-${requestToken}`,
  },
  invoke_structural_validators: true,
});
if (!profile.ok) {
  console.error(JSON.stringify({ step: "evidence_chain_profile_generate", profile }, null, 2));
  process.exit(1);
}

const inquiryPayload = JSON.parse(
  fs.readFileSync(path.join(evidenceDir, "verification-inquiry-payload.json"), "utf8"),
);
const inquiry = tiedCliJson("tied_adversarial_inquiry_run", inquiryPayload);
fs.writeFileSync(
  path.join(evidenceDir, "verification-inquiry-result.json"),
  `${JSON.stringify(inquiry, null, 2)}\n`,
);
if (!inquiry.ok) {
  console.error(JSON.stringify({ step: "tied_adversarial_inquiry_run", inquiry }, null, 2));
  process.exit(1);
}

const activation = tiedCliJson("tied_checklist_activation_collect", {
  request_token: requestToken,
  phase: "verification",
  run_id: runId,
  project_root: repoRoot,
});

const gate = tiedCliJson("tied_checklist_gate_validate", {
  phase: "verification",
  project_root: repoRoot,
  tracker_path: `${workingRel}/checklist-tracker-build.yaml`,
  citdp,
  activation: {
    receipt: activation.receipt,
    artifacts: activation.artifacts,
  },
  receipt_persistence: {
    request_token: requestToken,
    gates_dir: `${workingRel}/gates`,
    ledger_path: `${workingRel}/evidence/gate-ledger.jsonl`,
    run_id: runId,
  },
});

fs.writeFileSync(
  path.join(evidenceDir, "verification-gate-mcp-result.json"),
  `${JSON.stringify(gate, null, 2)}\n`,
);

if (!gate.allowed) {
  console.error(JSON.stringify({ step: "verification_gate", allowed: false, diagnostics: gate.diagnostics }, null, 2));
  process.exit(1);
}

const verify = tiedCliJson("tied_verify", {
  passed_requirement_tokens: [requestToken],
  passed_impl_tokens: ["IMPL-TIED_TOOL_INPUT_NORMALIZATION"],
  checklist_gate: {
    phase: "verification",
    citdp,
    tracker_path: `${workingRel}/checklist-tracker-build.yaml`,
    activation: {
      receipt: activation.receipt,
      artifacts: activation.artifacts,
    },
  },
  project_root: repoRoot,
  receipt_persistence: {
    request_token: requestToken,
    gates_dir: `${workingRel}/gates`,
    ledger_path: `${workingRel}/evidence/gate-ledger.jsonl`,
    run_id: runId,
    gate_receipt_ref: gate.receipt_path,
    gate_receipt_hash: gate.receipt_hash,
  },
});
fs.writeFileSync(path.join(evidenceDir, "tied-verify-result.json"), `${JSON.stringify(verify, null, 2)}\n`);

const envelope = tiedCliJson("request_evidence_envelope_build", {
  request_token: requestToken,
  project_root: repoRoot,
  tied_base_path: tiedBasePath,
  depth_tier: "integrated",
  gate_policy: "advisory",
  output_mode: "file",
});
const envelopeValidate = tiedCliJson("request_evidence_envelope_validate", {
  envelope_path: `${workingRel}/evidence/request-evidence-envelope.v1.json`,
  project_root: repoRoot,
  fail_on_error_gaps: true,
  fail_on_process_gaps: false,
});

console.log(
  JSON.stringify(
    {
      gate_allowed: gate.allowed,
      verify_ok: verify.ok,
      envelope_gaps: envelopeValidate.gaps ?? envelope.gaps ?? [],
      envelope_valid: envelopeValidate.ok ?? envelopeValidate.valid,
    },
    null,
    2,
  ),
);
